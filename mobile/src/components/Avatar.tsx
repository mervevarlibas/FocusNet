import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { AVATAR_GRADIENTS, avatarInitials } from '../constants/avatars';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

export function Avatar({
  index,
  name,
  email,
  size = 48,
  selected,
}: {
  index: number;
  name: string;
  email: string;
  size?: number;
  selected?: boolean;
}) {
  const { theme } = useTheme();
  const colors = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  const initials = avatarInitials(name, email);

  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2 },
        selected && { borderColor: theme.primary, borderWidth: 3 },
      ]}
    >
      <LinearGradient
        colors={colors}
        style={[styles.grad, { width: size, height: size, borderRadius: size / 2 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.text, { fontSize: size * 0.36 }]}>{initials}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  grad: { alignItems: 'center', justifyContent: 'center' },
  text: { ...typography.bodyBold, color: '#fff' },
});
