import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

export function AvatarStatsBar({
  energy,
  xp,
  combo,
  compact,
}: {
  energy: number;
  xp: number;
  combo: number;
  compact?: boolean;
}) {
  const { theme } = useTheme();
  const e = Math.max(0, Math.min(100, energy));

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.muted }]}>⚡ Enerji</Text>
        <Text style={[styles.value, { color: theme.text }]}>{e}/100</Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.cardBorder }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${e}%`,
              backgroundColor: e > 35 ? theme.primary : theme.error,
            },
          ]}
        />
      </View>
      <View style={styles.meta}>
        <Text style={[styles.metaText, { color: theme.muted }]}>XP {xp}</Text>
        {combo > 0 ? (
          <Text style={[styles.combo, { color: theme.primary }]}>🔥 Combo x{combo}</Text>
        ) : (
          <Text style={[styles.metaText, { color: theme.dim }]}>Combo yok</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  wrapCompact: { marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { ...typography.caption },
  value: { ...typography.caption, fontWeight: '700' },
  track: { height: 10, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  metaText: { ...typography.caption },
  combo: { ...typography.caption, fontWeight: '700' },
});
