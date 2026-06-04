import { useEffect, useRef, useState } from 'react';
import { Alert, AppState, Platform, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { appApi } from '../api/client';
import { AvatarStatsBar } from '../components/AvatarStatsBar';
import { FocusCategoryPicker } from '../components/FocusCategoryPicker';
import { FocusSoundPicker } from '../components/FocusSoundPicker';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { type FocusCategoryId } from '../constants/focusCategories';
import { type FocusSoundId } from '../constants/focusSounds';
import { focusCategoryLabel } from '../constants/focusCategories';
import { useFocusSound } from '../hooks/useFocusSound';
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
  const { me, refreshMe } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');
  const [soundId, setSoundId] = useState<FocusSoundId>('none');

  const user = me?.user;
  const energy = user?.energy ?? 100;
  const xp = user?.xp ?? 0;
  const combo = user?.pomodoroCombo ?? 0;

  return (
    <Screen scroll>
      <HeroHeader title="Odaklan" subtitle="Sesler, kategori ve Pomodoro ödülleri" />
      <Card>
        <AvatarStatsBar energy={energy} xp={xp} combo={combo} />
      </Card>
      <FocusSoundPicker value={soundId} onChange={setSoundId} />
      <View style={styles.chips}>
        <Chip label="⏱ Kronometre" active={mode === 'stopwatch'} onPress={() => setMode('stopwatch')} />
        <Chip label="🍅 Pomodoro" active={mode === 'pomodoro'} onPress={() => setMode('pomodoro')} />
      </View>
      {mode === 'stopwatch' ? (
        <StopwatchPanel theme={theme} refreshMe={refreshMe} showToast={showToast} soundId={soundId} />
      ) : (
        <PomodoroPanel
          theme={theme}
          refreshMe={refreshMe}
          showToast={showToast}
          soundId={soundId}
          combo={combo}
        />
      )}
    </Screen>
  );
}

function StopwatchPanel({
  theme,
  refreshMe,
  showToast,
  soundId,
}: {
  theme: ReturnType<typeof useTheme>['theme'];
  refreshMe: () => Promise<void>;
  showToast: (m: string) => void;
  soundId: FocusSoundId;
}) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const startRef = useRef<number | null>(null);

  useFocusSound(soundId, running);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
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
    const totalSec = Math.floor((Date.now() - startRef.current) / 1000);
    const minutes = Math.floor(totalSec / 60);

    setRunning(false);
    startRef.current = null;
    setElapsed(0);

    if (totalSec < 60) {
      setError(`En az 1 dakika çalışmalısın (şu an ${totalSec} sn). Süre kaydedilmedi.`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await appApi.logStudy(minutes, 'free');
      await refreshMe();
      showToast(
        totalSec % 60 > 0
          ? `${minutes} dk kaydedildi`
          : `${minutes} dk kaydedildi`
      );
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
  soundId,
  combo,
}: {
  theme: ReturnType<typeof useTheme>['theme'];
  refreshMe: () => Promise<void>;
  showToast: (m: string) => void;
  soundId: FocusSoundId;
  combo: number;
}) {
  const [category, setCategory] = useState<FocusCategoryId | null>(null);
  const [phase, setPhase] = useState<'work' | 'break'>('work');
  const [remaining, setRemaining] = useState(WORK_SEC);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [givingUp, setGivingUp] = useState(false);
  const endRef = useRef<number | null>(null);
  const phaseRef = useRef(phase);
  const categoryRef = useRef<FocusCategoryId | null>(null);
  phaseRef.current = phase;
  categoryRef.current = category;

  useFocusSound(soundId, running && phase === 'work');

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
        const cat = categoryRef.current || 'other';
        try {
          const r = await appApi.logStudy(25, 'pomodoro_work', cat);
          await refreshMe();
          const reward = r.pomodoroReward;
          if (reward) {
            showToast(
              `+${reward.xpGain} XP · Combo x${reward.combo} (${reward.multiplier}x çarpan)`
            );
          } else {
            showToast('Pomodoro tamamlandı — mola zamanı!');
          }
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
    if (phase === 'work' && !category) {
      setError('Önce odak kategorisi seç');
      return;
    }
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

  function resetTimer() {
    setRunning(false);
    setPaused(false);
    endRef.current = null;
    setRemaining(phase === 'work' ? WORK_SEC : BREAK_SEC);
  }

  function confirmGiveUp() {
    if (phase !== 'work') {
      resetTimer();
      return;
    }
    const elapsed = WORK_SEC - remaining;
    Alert.alert(
      'Pes etme cezası',
      `Vazgeçersen enerjin düşer ve combo sıfırlanır.\nGeçen süre: ${Math.floor(elapsed / 60)} dk`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Pes Et', style: 'destructive', onPress: () => void handleGiveUp(elapsed) },
      ]
    );
  }

  async function handleGiveUp(elapsedSeconds: number) {
    if (!category) return;
    setGivingUp(true);
    setError(null);
    try {
      const r = await appApi.pomodoroGiveUp({
        focusCategory: category,
        elapsedSeconds,
        plannedSeconds: WORK_SEC,
      });
      await refreshMe();
      resetTimer();
      setPhase('work');
      setRemaining(WORK_SEC);
      showToast(`Enerji -${r.penalty.energyLoss} (kalan ${r.penalty.energy})`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'İşlem başarısız');
    } finally {
      setGivingUp(false);
    }
  }

  const inWorkSession = phase === 'work' && (running || paused);
  const categoryLabel = category ? focusCategoryLabel(category) : null;

  return (
    <Card glow>
      {phase === 'work' && !running && !paused && (
        <FocusCategoryPicker value={category} onChange={setCategory} />
      )}

      <View style={[styles.phaseBadge, { backgroundColor: theme.highlight }]}>
        <Text style={[styles.phaseText, { color: theme.primary }]}>
          {phase === 'work'
            ? categoryLabel
              ? `🎯 ${categoryLabel}`
              : '🎯 Çalışma'
            : '☕ Mola'}
        </Text>
      </View>

      <Text style={[styles.timer, { color: theme.primary }]}>{formatCountdown(remaining)}</Text>

      {combo > 0 && phase === 'work' && (
        <Text style={[styles.hint, { color: theme.primary }]}>
          Sonraki tam Pomodoro: ~%{Math.round((1 + combo * 0.15) * 100 - 100)} bonus XP
        </Text>
      )}

      <ErrorText message={error} />
      <View style={styles.pomoBtns}>
        {!running && !paused && (
          <Button title="Başlat" icon="▶" onPress={start} disabled={phase === 'work' && !category} />
        )}
        {running && <Button title="Duraklat" icon="⏸" onPress={pause} variant="ghost" />}
        {paused && <Button title="Devam" icon="▶" onPress={start} />}
        {inWorkSession && (
          <Button
            title="Pes Et"
            onPress={confirmGiveUp}
            variant="danger"
            loading={givingUp}
          />
        )}
        {(running || paused) && phase === 'break' && (
          <Button title="Molayı Bitir" onPress={resetTimer} variant="ghost" />
        )}
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
  hint: { ...typography.caption, textAlign: 'center', marginBottom: 8, marginTop: -12 },
  pomoBtns: { gap: 8 },
});
