import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { appApi } from '../api/client';
import { AvatarStatsBar } from '../components/AvatarStatsBar';
import { ProgressRing } from '../components/ProgressRing';
import { DashboardSkeleton } from '../components/Skeleton';
import {
  Button,
  Card,
  ErrorText,
  HeroHeader,
  Input,
  Label,
  Screen,
  SectionTitle,
} from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function DashboardScreen() {
  const { me, refreshMe } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [hours, setHours] = useState('1');
  const [mins, setMins] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setPageLoading(true);
      refreshMe()
        .catch(() => {})
        .finally(() => setPageLoading(false));
    }, [refreshMe])
  );

  const goal = me?.todayGoal;
  const pct = me?.todayProgressPercent ?? 0;
  const streak = me?.user?.streak ?? 0;
  const name = me?.user?.displayName || 'Öğrenci';
  const canSave = (parseInt(hours, 10) || 0) > 0 || (parseInt(mins, 10) || 0) > 0;

  async function saveGoal() {
    setError(null);
    setLoading(true);
    try {
      await appApi.setGoal(parseInt(hours, 10) || 0, parseInt(mins, 10) || 0);
      await refreshMe();
      showToast('Hedef kaydedildi');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hedef kaydedilemedi');
    } finally {
      setLoading(false);
    }
  }

  function deleteGoal() {
    Alert.alert('Hedefi sil', 'Bugünkü hedefi silmek istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await appApi.deleteGoal(todayISO());
            await refreshMe();
            showToast('Hedef silindi');
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Silinemedi');
          }
        },
      },
    ]);
  }

  return (
    <Screen scroll>
      <HeroHeader title={`Merhaba, ${name}`} subtitle="Bugünkü hedefin ve ilerlemen" />

      {pageLoading && !me ? (
        <DashboardSkeleton />
      ) : (
        <>
          <Card glow>
            <AvatarStatsBar
              energy={me?.user?.energy ?? 100}
              xp={me?.user?.xp ?? 0}
              combo={me?.user?.pomodoroCombo ?? 0}
              compact
            />
            <View style={styles.streakRow}>
              <LinearGradient colors={['#f59e0b', '#ea580c']} style={styles.streakBadge}>
                <Text style={styles.streakEmoji}>⚡</Text>
              </LinearGradient>
              <View>
                <Text style={[styles.streakNum, { color: theme.text }]}>{streak} gün</Text>
                <Text style={[styles.streakLbl, { color: theme.muted }]}>Çalışma serisi</Text>
              </View>
            </View>
            <View style={styles.ringWrap}>
              <ProgressRing percent={pct} label="günlük hedef" />
            </View>
            {goal ? (
              <Text style={[styles.goalBig, { color: theme.primary }]}>
                {goal.completedMinutes}
                <Text style={[styles.goalSmall, { color: theme.muted }]}> / {goal.targetMinutes} dk</Text>
              </Text>
            ) : (
              <Text style={[styles.muted, { color: theme.muted }]}>Henüz günlük hedef yok</Text>
            )}
          </Card>

          <SectionTitle>Günlük hedef</SectionTitle>
          <Card>
            <Label>Saat ve dakika</Label>
            <View style={styles.row}>
              <Input
                placeholder="Saat"
                keyboardType="number-pad"
                value={hours}
                onChangeText={(t) => setHours(t.replace(/\D/g, ''))}
                style={styles.half}
              />
              <Input
                placeholder="Dakika"
                keyboardType="number-pad"
                value={mins}
                onChangeText={(t) => setMins(t.replace(/\D/g, ''))}
                style={styles.half}
              />
            </View>
            <ErrorText message={error} />
            <Button
              title={goal ? 'Hedefi Güncelle' : 'Hedef Oluştur'}
              onPress={saveGoal}
              loading={loading}
              disabled={!canSave}
            />
            {goal ? <Button title="Hedefi Sil" onPress={deleteGoal} variant="danger" /> : null}
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  streakRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  streakBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  streakEmoji: { fontSize: 26 },
  streakNum: { ...typography.h2 },
  streakLbl: { ...typography.caption },
  ringWrap: { alignItems: 'center', marginVertical: 8 },
  goalBig: { ...typography.stat, textAlign: 'center', marginTop: 4 },
  goalSmall: { ...typography.h3, fontWeight: '500' },
  muted: { ...typography.body, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
});
