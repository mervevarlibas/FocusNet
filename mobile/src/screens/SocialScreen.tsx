import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { appApi, userId, type User } from '../api/client';
import { Avatar } from '../components/Avatar';
import { DashboardSkeleton } from '../components/Skeleton';
import {
  Button,
  Card,
  Chip,
  ErrorText,
  HeroHeader,
  Input,
  Label,
  Screen,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

function displayName(u: User) {
  return u.displayName || u.email?.split('@')[0] || 'Kullanıcı';
}

export function SocialScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'leaderboard' | 'friends'>('leaderboard');
  const [top, setTop] = useState<Array<User & { totalMinutesAllTime: number }>>([]);
  const [myRank, setMyRank] = useState(0);
  const [myMinutes, setMyMinutes] = useState(0);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const load = useCallback(async () => {
    const [lb, fr] = await Promise.all([appApi.leaderboard(), appApi.friends()]);
    setTop(lb.top);
    setMyRank(lb.myRank);
    setMyMinutes(lb.myMinutes);
    setFriends(fr.friends);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setPageLoading(true);
      load()
        .catch((e) => setError(e instanceof Error ? e.message : 'Yüklenemedi'))
        .finally(() => setPageLoading(false));
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function addFriend() {
    const email = friendEmail.trim();
    if (!email.includes('@')) {
      setError('Geçerli bir e-posta gir');
      return;
    }
    if (email.toLowerCase() === user?.email?.toLowerCase()) {
      setError('Kendini ekleyemezsin');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const r = await appApi.addFriend(email);
      setFriends(r.friends);
      setFriendEmail('');
      showToast('Arkadaş eklendi');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Eklenemedi');
    } finally {
      setLoading(false);
    }
  }

  function removeFriend(id: string, name: string) {
    Alert.alert('Arkadaşı çıkar', `${name} listeden çıkarılsın mı?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkar',
        style: 'destructive',
        onPress: async () => {
          try {
            const r = await appApi.removeFriend(id);
            setFriends(r.friends);
            showToast('Arkadaş çıkarıldı');
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Silinemedi');
          }
        },
      },
    ]);
  }

  const renderFriend = ({ item }: { item: User }) => {
    const id = userId(item);
    const name = displayName(item);
    const right = (
      <View style={[styles.swipeDel, { backgroundColor: theme.error }]}>
        <Text style={styles.swipeDelText} onPress={() => removeFriend(id, name)}>
          Sil
        </Text>
      </View>
    );
    return (
      <Swipeable renderRightActions={() => right} overshootRight={false}>
        <View style={[styles.row, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Avatar index={item.avatarIndex ?? 0} name={name} email={item.email} size={44} />
          <View style={styles.rowBody}>
            <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
            <Text style={[styles.sub, { color: theme.muted }]}>
              ⚡ {item.streak ?? 0} · {item.totalMinutesAllTime || 0} dk
            </Text>
          </View>
        </View>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Screen>
        <HeroHeader title="Sosyal" subtitle="Rekabet et, motive ol" />
        <View style={styles.chips}>
          <Chip label="🏆 Liderlik" active={tab === 'leaderboard'} onPress={() => setTab('leaderboard')} />
          <Chip label="👥 Arkadaşlar" active={tab === 'friends'} onPress={() => setTab('friends')} />
        </View>

        {pageLoading ? (
          <View style={{ paddingHorizontal: 20 }}>
            <DashboardSkeleton />
          </View>
        ) : tab === 'leaderboard' ? (
          <FlatList
            data={top}
            keyExtractor={(item) => userId(item)}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
            }
            contentContainerStyle={styles.list}
            renderItem={({ item, index }) => {
              const isMe = userId(item) === userId(user || {});
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
              return (
                <View
                  style={[
                    styles.row,
                    {
                      backgroundColor: isMe ? theme.highlight : theme.card,
                      borderColor: isMe ? theme.primary : theme.cardBorder,
                    },
                  ]}
                >
                  <Text style={[styles.medal, { color: theme.primary }]}>{medal}</Text>
                  <Avatar index={item.avatarIndex ?? 0} name={displayName(item)} email={item.email} size={40} />
                  <View style={styles.rowBody}>
                    <Text style={[styles.name, { color: theme.text }]}>{displayName(item)}</Text>
                    <Text style={[styles.sub, { color: theme.muted }]}>⚡ {item.streak ?? 0} streak</Text>
                  </View>
                  <Text style={[styles.mins, { color: theme.primary }]}>
                    {item.totalMinutesAllTime || 0} dk
                  </Text>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={[styles.empty, { color: theme.muted }]}>
                  Liderlikte sadece arkadaşların görünür.{'\n'}
                  Arkadaşlar sekmesinden e-posta ile arkadaş ekle.
                </Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item) => userId(item)}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
            }
            ListHeaderComponent={
              <View style={{ paddingHorizontal: 20 }}>
                <Card>
                  <Label>Arkadaş ekle</Label>
                  <Input
                    placeholder="arkadas@email.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={friendEmail}
                    onChangeText={setFriendEmail}
                  />
                  <ErrorText message={error} />
                  <Button title="Ekle" onPress={addFriend} loading={loading} />
                </Card>
                <Text style={[styles.swipeHint, { color: theme.dim }]}>
                  Silmek için satırı sola kaydır
                </Text>
              </View>
            }
            contentContainerStyle={styles.list}
            renderItem={renderFriend}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>👋</Text>
                <Text style={[styles.empty, { color: theme.muted }]}>
                  Henüz arkadaş yok{'\n'}E-posta ile ilk arkadaşını ekle
                </Text>
              </View>
            }
          />
        )}

        {tab === 'leaderboard' && (
          <View style={[styles.sticky, { backgroundColor: theme.card, borderColor: theme.primary }]}>
            <Text style={[styles.stickyText, { color: theme.text }]}>
              Sıran: <Text style={{ color: theme.primary }}>#{myRank}</Text> · Toplam{' '}
              <Text style={{ color: theme.primary }}>{myMinutes} dk</Text>
            </Text>
          </View>
        )}
      </Screen>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  rowBody: { flex: 1 },
  medal: { width: 32, ...typography.bodyBold, textAlign: 'center' },
  name: { ...typography.bodyBold },
  sub: { ...typography.caption, marginTop: 2 },
  mins: { ...typography.bodyBold },
  empty: { ...typography.body, textAlign: 'center', marginTop: 40 },
  emptyBox: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  swipeHint: { ...typography.caption, textAlign: 'center', marginBottom: 12 },
  swipeDel: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 10,
    borderRadius: 16,
    marginLeft: 8,
  },
  swipeDelText: { color: '#fff', fontWeight: '700' },
  sticky: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
    borderTopWidth: 2,
  },
  stickyText: { ...typography.bodyBold, textAlign: 'center' },
});
