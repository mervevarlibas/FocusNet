import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

export function Screen({
  children,
  style,
  scroll,
  keyboard,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  scroll?: boolean;
  keyboard?: boolean;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollPad, { paddingBottom: insets.bottom + 100 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  const body = keyboard ? (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg, paddingTop: insets.top }, style]}>
      {body}
    </View>
  );
}

export function HeroHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { theme } = useTheme();
  return (
    <LinearGradient colors={theme.gradientHero} style={styles.hero}>
      <Text style={[styles.heroTitle, { color: theme.primary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.heroSub, { color: theme.muted }]}>{subtitle}</Text>
      ) : null}
    </LinearGradient>
  );
}

export function Card({ children, glow }: { children: React.ReactNode; glow?: boolean }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
          shadowColor: theme.shadow,
        },
        glow && { borderColor: theme.primary, shadowOpacity: 0.25, elevation: 6 },
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: string }) {
  const { theme } = useTheme();
  return <Text style={[styles.sectionTitle, { color: theme.text }]}>{children}</Text>;
}

export function Label({ children }: { children: string }) {
  const { theme } = useTheme();
  return <Text style={[styles.label, { color: theme.muted }]}>{children}</Text>;
}

export function Input(props: TextInputProps) {
  const { theme } = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.dim}
      {...props}
      style={[
        styles.input,
        {
          backgroundColor: theme.inputBg,
          borderColor: theme.cardBorder,
          color: theme.text,
        },
        props.style,
      ]}
    />
  );
}

export function Button({
  title,
  onPress,
  loading,
  variant = 'primary',
  disabled,
  icon,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  icon?: string;
}) {
  const { theme } = useTheme();
  const isPrimary = variant === 'primary';
  const inactive = disabled || loading;

  if (isPrimary) {
    return (
      <Pressable
        onPress={onPress}
        disabled={inactive}
        style={({ pressed }) => [pressed && !inactive && { opacity: 0.9 }]}
      >
        <LinearGradient
          colors={inactive ? ['#475569', '#334155'] : [theme.primary, '#06b6d4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, styles.buttonGrad, inactive && styles.buttonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color={theme.primaryText} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.primaryText }]}>
              {icon ? `${icon} ` : ''}
              {title}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        variant === 'ghost' && { borderWidth: 2, borderColor: theme.primary, backgroundColor: 'transparent' },
        variant === 'danger' && { backgroundColor: theme.error },
        (disabled || loading) && styles.buttonDisabled,
        pressed && { opacity: 0.88 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? theme.primary : '#fff'} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'ghost' && { color: theme.primary },
            variant === 'danger' && { color: '#fff' },
            !isPrimary && variant !== 'ghost' && variant !== 'danger' && { color: theme.primaryText },
          ]}
        >
          {icon ? `${icon} ` : ''}
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function ErrorText({ message }: { message: string | null }) {
  const { theme } = useTheme();
  if (!message) return null;
  return <Text style={[styles.error, { color: theme.error }]}>{message}</Text>;
}

/** Auth ekranı (koyu cam kart) için hata rengi */
export function AuthErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return <Text style={[styles.error, { color: '#f87171' }]}>{message}</Text>;
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.highlight : theme.card,
          borderColor: active ? theme.primary : theme.cardBorder,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? theme.primary : theme.muted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollPad: { paddingHorizontal: 20, paddingTop: 8 },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    marginBottom: 8,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTitle: { ...typography.hero, marginBottom: 6 },
  heroSub: { ...typography.body, maxWidth: 320 },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: { ...typography.h2, marginBottom: 12, marginTop: 4 },
  label: { ...typography.label, marginBottom: 8 },
  input: {
    borderRadius: 14,
    padding: 16,
    fontSize: 17,
    marginBottom: 14,
    borderWidth: 1,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonGrad: { overflow: 'hidden' },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { ...typography.bodyBold, fontSize: 17 },
  error: { ...typography.caption, marginBottom: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: { ...typography.caption, fontWeight: '600' },
});
