import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { FOCUS_SOUNDS, type FocusSoundId } from '../constants/focusSounds';
import { Label } from './ui';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

export function FocusSoundPicker({
  value,
  onChange,
}: {
  value: FocusSoundId;
  onChange: (id: FocusSoundId) => void;
}) {
  const { theme } = useTheme();

  return (
    <>
      <Label>Odaklanma sesi</Label>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {FOCUS_SOUNDS.map((s) => {
          const active = value === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => onChange(s.id)}
              style={[
                styles.chip,
                {
                  borderColor: active ? theme.primary : theme.cardBorder,
                  backgroundColor: active ? theme.highlight : theme.card,
                },
              ]}
            >
              <Text style={styles.emoji}>{s.emoji}</Text>
              <Text style={[styles.label, { color: active ? theme.primary : theme.text }]}>{s.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: 12 },
  chip: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 72,
  },
  emoji: { fontSize: 22, marginBottom: 4 },
  label: { ...typography.caption, fontWeight: '600' },
});
