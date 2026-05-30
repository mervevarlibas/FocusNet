import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '../theme/typography';

const loginBg = require('../../assets/branding/login-bg.png');

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ImageBackground source={loginBg} style={styles.bg} resizeMode="cover">
        <View style={styles.bgBlur} />
        <View style={styles.overlay} />
      </ImageBackground>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandBlock}>
            <Image source={loginBg} style={styles.emblem} resizeMode="contain" />
            <Text style={styles.brandFocus}>FOCUS</Text>
            <Text style={styles.brandNet}>NET</Text>
            {subtitle ? <Text style={styles.tagline}>{subtitle}</Text> : null}
          </View>

          <View style={styles.card}>
            {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0f1a' },
  bg: { ...StyleSheet.absoluteFillObject },
  bgBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 26, 0.35)',
  },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,15,26,0.5)' },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 22, flexGrow: 1 },
  brandBlock: { alignItems: 'center', marginBottom: 28 },
  emblem: {
    width: 120,
    height: 120,
    marginBottom: 8,
    borderRadius: 24,
  },
  brandFocus: {
    ...typography.hero,
    fontSize: 38,
    color: '#22d3ee',
    letterSpacing: 4,
    lineHeight: 42,
  },
  brandNet: {
    ...typography.hero,
    fontSize: 38,
    color: '#f8fafc',
    letterSpacing: 6,
    marginTop: -4,
    lineHeight: 42,
  },
  tagline: {
    ...typography.caption,
    color: 'rgba(248,250,252,0.75)',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  card: {
    borderRadius: 24,
    padding: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.25)',
  },
  cardTitle: {
    ...typography.h2,
    color: '#f8fafc',
    marginBottom: 16,
    textAlign: 'center',
  },
});
