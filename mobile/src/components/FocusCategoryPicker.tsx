import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FOCUS_CATEGORIES, type FocusCategoryId } from '../constants/focusCategories';
import { Label } from './ui';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

export function FocusCategoryPicker({
  value,
  onChange,
}: {
  value: FocusCategoryId | null;
  onChange: (id: FocusCategoryId) => void;
}) {
  const { theme } = useTheme();

  return (
    <>
      <Label>Bugün neye odaklanacaksın?</Label>
      <View style={styles.grid}>
        {FOCUS_CATEGORIES.map((c) => {
          const active = value === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => onChange(c.id)}
              style={[
                styles.item,
                {
                  borderColor: active ? theme.primary : theme.cardBorder,
                  backgroundColor: active ? theme.highlight : theme.card,
                },
              ]}
            >
              <Text style={styles.emoji}>{c.emoji}</Text>
              <Text
                style={[styles.label, { color: active ? theme.primary : theme.text }]}
                numberOfLines={2}
              >
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  item: {
    width: '30%',
    flexGrow: 1,
    minWidth: 96,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  emoji: { fontSize: 24, marginBottom: 4 },
  label: { ...typography.caption, textAlign: 'center', fontWeight: '600' },
});
