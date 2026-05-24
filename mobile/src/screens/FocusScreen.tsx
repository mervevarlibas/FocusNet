import { useEffect, useRef, useState } from 'react';
import { AppState, Platform, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { appApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Card, Chip, ErrorText, HeroHeader, Screen, SectionTitle } from '../components/ui';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

const WORK_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;

function formatMs(ms: number) {
  const t = Math.floor(ms / 1000);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

function formatCountdown(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function FocusScreen() {
  const { theme } = useTheme();
  const { refreshMe } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');

  return (
    <Screen scroll>
      <HeroHeader title="Odaklan" subtitle="Kronometre veya Pomodoro ile çalış" />
      <View style={styles.chips}>
        <Chip label="⏱ Kronometre" active={mode === 'stopwatch'} onPress={() => setMode('stopwatch')} />
        <Chip label="🍅 Pomodoro" active={mode === 'pomodoro'} onPress={() => setMode('pomodoro')} />
      </View>
      {mode === 'stopwatch' ? <StopwatchPanel theme={theme} refreshMe={refreshMe} showToast={showToast} /> : (
        <PomodoroPanel theme={theme} refreshMe={refreshMe} showToast={showToast} />
      )}
    </Screen>
  );
}

function StopwatchPanel({
  theme,
  refreshMe,
  showToast,
}: {
  theme: ReturnType<typeof useTheme>['theme'];
  refreshMe: () => Promise<void>;
  showToast: (m: string) => void;
}) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const startRef = useRef<number | null>(null);
  const bgRef = useRef<number>(0);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' && running && startRef.current) {
        bgRef.current = Date.now() - startRef.current;
      }
      if (state === 'active' && running && startRef.current) {
        setElapsed(Date.now() - startRef.current);
      }
    });
    return () => sub.remove();
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (startRef.current) setElapsed(Date.now() - startRef.current);
    }, 200);
    return () => clearInterval(id);
  }, [running]);

  function start() {
    setError(null);
    startRef.current = Date.now();
    setElapsed(0);
    setRunning(true);
  }

  async function stopAndSave() {
    if (!startRef.current) return;
    const minutes = Math.max(1, Math.round((Date.now() - startRef.current) / 60000));
    setRunning(false);
    startRef.current = null;
    setElapsed(0);
    setSaving(true);
    try {
      await appApi.logStudy(minutes, 'free');
      await refreshMe();
      showToast(`${minutes} dk kaydedildi`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card glow>
      <SectionTitle>Serbest süre</SectionTitle>
      <Text style={[styles.timer, { color: theme.primary }]}>{formatMs(elapsed)}</Text>
      <ErrorText message={error} />
      {!running ? (
        <Button title="Başlat" icon="▶" onPress={start} disabled={saving} />
      ) : (
        <Button title="Durdur ve Kaydet" onPress={stopAndSave} loading={saving} variant="ghost" />
      )}
    </Card>
  );
}

function PomodoroPanel({
  theme,
  refreshMe,
  showToast,
}: {
  theme: ReturnType<typeof useTheme>['theme'];
  refreshMe: () => Promise<void>;
  showToast: (m: string) => void;
}) {
  const [phase, setPhase] = useState<'work' | 'break'>('work');
  const [remaining, setRemaining] = useState(WORK_SEC);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<number | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    if (!running || paused) return;
    const id = setInterval(async () => {
      if (!endRef.current) return;
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left > 0) return;
      setRunning(false);
      setPaused(false);
      endRef.current = null;
      if (phaseRef.current === 'work') {
        try {
          await appApi.logStudy(25, 'pomodoro_work');
          await refreshMe();
          showToast('Pomodoro tamamlandı — mola zamanı!');
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Kayıt hatası');
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPhase('break');
        setRemaining(BREAK_SEC);
      } else {
        showToast('Mola bitti — tekrar çalış!');
        setPhase('work');
        setRemaining(WORK_SEC);
      }
    }, 500);
    return () => clearInterval(id);
  }, [running, paused, refreshMe, showToast]);

  function start() {
    setError(null);
    endRef.current = Date.now() + remaining * 1000;
    setRunning(true);
    setPaused(false);
  }

  function pause() {
    if (endRef.current) {
      setRemaining(Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000)));
    }
    setPaused(true);
    setRunning(false);
    endRef.current = null;
  }

  function stop() {
    setRunning(false);
    setPaused(false);
    endRef.current = null;
    setRemaining(phase === 'work' ? WORK_SEC : BREAK_SEC);
  }

  return (
    <Card glow>
      <View style={[styles.phaseBadge, { backgroundColor: theme.highlight }]}>
        <Text style={[styles.phaseText, { color: theme.primary }]}>
          {phase === 'work' ? '🎯 Çalışma' : '☕ Mola'}
        </Text>
      </View>
      <Text style={[styles.timer, { color: theme.primary }]}>{formatCountdown(remaining)}</Text>
      <ErrorText message={error} />
      <View style={styles.pomoBtns}>
        {!running && !paused && <Button title="Başlat" icon="▶" onPress={start} />}
        {running && <Button title="Duraklat" icon="⏸" onPress={pause} variant="ghost" />}
        {paused && <Button title="Devam" icon="▶" onPress={start} />}
        {(running || paused) && <Button title="Bitir" onPress={stop} variant="danger" />}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', marginBottom: 8, paddingHorizontal: 4 },
  timer: {
    ...typography.timer,
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  phaseBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 8,
  },
  phaseText: { ...typography.bodyBold },
  pomoBtns: { gap: 8 },
});
