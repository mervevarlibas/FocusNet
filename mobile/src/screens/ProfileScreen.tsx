import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { appApi } from '../api/client';
import { AVATAR_CHARACTERS } from '../constants/avatars';
import { Avatar } from '../components/Avatar';
import { AvatarStatsBar } from '../components/AvatarStatsBar';
import { Button, Card, ErrorText, HeroHeader, Input, Label, Screen, SectionTitle } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../theme/ThemeContext';
import type { ThemeMode } from '../theme/themes';
import { typography } from '../theme/typography';

export function ProfileScreen() {
  const { me, logout, refreshMe } = useAuth();
  const { theme, mode, setMode } = useTheme();
  const { showToast } = useToast();
  const user = me?.user;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarIndex, setAvatarIndex] = useState(user?.avatarIndex ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setAvatarIndex(user.avatarIndex ?? 0);
    }
  }, [user?.displayName, user?.avatarIndex]);

  const dirty =
    displayName.trim() !== (user?.displayName || '').trim() ||
    avatarIndex !== (user?.avatarIndex ?? 0);

  async function saveProfile() {
    if (!displayName.trim()) {
      setError('Ad boş olamaz');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await appApi.updateMe({
        displayName: displayName.trim(),
        avatarIndex,
        theme: mode,
      });
      await refreshMe();
      showToast('Ayarlar kaydedildi');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kaydedilemedi');
    } finally {
      setLoading(false);
    }
  }

  async function onThemeToggle(value: boolean) {
    const next: ThemeMode = value ? 'light' : 'dark';
    setMode(next);
    try {
      await appApi.updateMe({ theme: next });
      await refreshMe();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Tema kaydedilemedi');
    }
  }

  function confirmLogout() {
    Alert.alert('Çıkış', 'Hesabından çıkmak istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış', style: 'destructive', onPress: () => logout() },
    ]);
  }

  return (
    <Screen scroll>
      <HeroHeader title="Profil" subtitle="Kişiselleştir ve ayarla" />

      <Card glow>
        <View style={styles.profileHead}>
          <Avatar index={avatarIndex} size={72} selected animate />
          <View style={styles.profileMeta}>
            <Text style={[styles.profileName, { color: theme.text }]}>{displayName || 'Öğrenci'}</Text>
            <Text style={[styles.profileEmail, { color: theme.muted }]}>{user?.email}</Text>
            <Text style={[styles.profileStat, { color: theme.primary }]}>
              {user?.totalMinutesAllTime ?? 0} dk · ⚡ {user?.streak ?? 0}
            </Text>
          </View>
        </View>
        <AvatarStatsBar
          energy={user?.energy ?? 100}
          xp={user?.xp ?? 0}
          combo={user?.pomodoroCombo ?? 0}
        />
      </Card>

      <SectionTitle>Tema</SectionTitle>
      <Card>
        <View style={styles.themeRow}>
          <Text style={[styles.themeLabel, { color: theme.text }]}>
            {mode === 'dark' ? '☾ Koyu mod' : '☀ Açık mod'}
          </Text>
          <Switch
            value={mode === 'light'}
            onValueChange={onThemeToggle}
            trackColor={{ false: theme.cardBorder, true: theme.primary }}
            thumbColor="#fff"
          />
        </View>
      </Card>

      <SectionTitle>Karakterin</SectionTitle>
      <Card>
        <View style={styles.avatarGrid}>
          {AVATAR_CHARACTERS.map((c, i) => (
            <Pressable key={c.label} onPress={() => setAvatarIndex(i)} style={styles.avatarCell}>
              <Avatar index={i} size={64} selected={avatarIndex === i} animate={avatarIndex === i} />
              <Text style={[styles.avatarLabel, { color: theme.muted }]}>{c.label}</Text>
            </Pressable>
          ))}
        </View>
        <Label>Görünen ad</Label>
        <Input value={displayName} onChangeText={setDisplayName} placeholder="Adın" />
        <ErrorText message={error} />
        <Button title="Kaydet" onPress={saveProfile} loading={loading} disabled={!dirty} />
      </Card>

      <Button title="Çıkış Yap" onPress={confirmLogout} variant="danger" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileHead: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  profileMeta: { flex: 1 },
  profileName: { ...typography.h2 },
  profileEmail: { ...typography.caption, marginTop: 2 },
  profileStat: { ...typography.bodyBold, marginTop: 6 },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  themeLabel: { ...typography.bodyBold },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16, justifyContent: 'center' },
  avatarCell: { width: '22%', alignItems: 'center' },
  avatarLabel: { ...typography.caption, marginTop: 4, fontSize: 10 },
});
