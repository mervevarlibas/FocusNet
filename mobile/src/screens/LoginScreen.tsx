import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import { Button, ErrorText, HeroHeader, Input, Screen } from '../components/ui';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Screen scroll keyboard>
      <HeroHeader title={title} subtitle={subtitle} />
      <View style={styles.form}>{children}</View>
    </Screen>
  );
}

export function LoginScreen({
  onRegister,
  onReset,
}: {
  onRegister: () => void;
  onReset: () => void;
}) {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    if (!email.trim() || !password) {
      setError('E-posta ve şifre gerekli');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="FocusNet" subtitle="Hedef koy, odaklan, birlikte çalış">
      <LinearGradient colors={['transparent', theme.primaryGlow]} style={styles.glowCard}>
        <Text style={[styles.brandTag, { color: theme.primary }]}>COREX · Ders çalışma</Text>
      </LinearGradient>
      <Input
        placeholder="E-posta"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Input placeholder="Şifre" secureTextEntry value={password} onChangeText={setPassword} />
      <ErrorText message={error} />
      <Button title="Giriş Yap" icon="→" onPress={handleLogin} loading={loading} />
      <Pressable onPress={onRegister} style={styles.linkWrap}>
        <Text style={[styles.link, { color: theme.primary }]}>Hesabın yok mu? Kayıt ol</Text>
      </Pressable>
      <Pressable onPress={onReset}>
        <Text style={[styles.linkMuted, { color: theme.muted }]}>Şifremi unuttum</Text>
      </Pressable>
    </AuthShell>
  );
}

export function RegisterScreen({ onBack }: { onBack: () => void }) {
  const { register } = useAuth();
  const { theme } = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length >= 6;

  async function handleRegister() {
    if (!canSubmit) {
      setError('Geçerli e-posta ve en az 6 karakter şifre gerekli');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(email.trim(), password, displayName.trim() || 'Öğrenci');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Kayıt Ol" subtitle="FocusNet ailesine katıl">
      <Input placeholder="Görünen adın" value={displayName} onChangeText={setDisplayName} />
      <Input
        placeholder="E-posta"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Input placeholder="Şifre (min. 6)" secureTextEntry value={password} onChangeText={setPassword} />
      <ErrorText message={error} />
      <Button title="Hesap Oluştur" onPress={handleRegister} loading={loading} disabled={!canSubmit} />
      <Pressable onPress={onBack}>
        <Text style={[styles.link, { color: theme.primary }]}>← Girişe dön</Text>
      </Pressable>
    </AuthShell>
  );
}

export function ResetPasswordScreen({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleReset() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const r = await authApi.resetPassword(email.trim(), newPassword);
      setSuccess(r.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Şifre Sıfırla" subtitle="Kayıtlı e-postan ile yeni şifre belirle">
      <Input
        placeholder="E-posta"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Input placeholder="Yeni şifre" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
      <ErrorText message={error} />
      {success ? (
        <Text style={[styles.success, { color: theme.success }]}>✓ {success}</Text>
      ) : null}
      <Button title="Şifreyi Güncelle" onPress={handleReset} loading={loading} />
      <Pressable onPress={onBack}>
        <Text style={[styles.link, { color: theme.primary }]}>← Girişe dön</Text>
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: { paddingTop: 8 },
  glowCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  brandTag: { ...typography.caption, fontWeight: '700' },
  linkWrap: { marginTop: 20, alignItems: 'center' },
  link: { ...typography.bodyBold, textAlign: 'center', marginTop: 12 },
  linkMuted: { ...typography.caption, textAlign: 'center', marginTop: 10 },
  success: { ...typography.body, marginBottom: 12 },
});
