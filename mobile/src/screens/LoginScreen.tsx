import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import { AuthLayout } from '../components/AuthLayout';
import { Button, ErrorText } from '../components/ui';
import { typography } from '../theme/typography';

function AuthInput(props: ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor="rgba(248,250,252,0.45)"
      {...props}
      style={[styles.input, props.style]}
    />
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    const e = email.trim().toLowerCase();
    const p = password;
    if (!e || !p) {
      setError('E-posta ve şifre gerekli');
      return;
    }
    setLoading(true);
    try {
      await login(e, p);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout subtitle="Ders çalışma & odaklanma uygulaması">
      <AuthInput
        placeholder="E-posta"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <AuthInput placeholder="Şifre" secureTextEntry value={password} onChangeText={setPassword} />
      <ErrorText message={error} />
      <Button title="Giriş Yap" icon="→" onPress={handleLogin} loading={loading} />
      <Button title="Kayıt Ol" variant="ghost" onPress={onRegister} />

      <Pressable onPress={onRegister} style={styles.linkWrap}>
        <Text style={styles.link}>Hesabın yok mu? Buradan kayıt ol</Text>
      </Pressable>
      <Pressable onPress={onReset}>
        <Text style={styles.linkMuted}>Şifremi unuttum</Text>
      </Pressable>
    </AuthLayout>
  );
}

export function RegisterScreen({ onBack }: { onBack: () => void }) {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    const e = email.trim().toLowerCase();
    if (!e.includes('@')) {
      setError('Geçerli bir e-posta gir');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(e, password, displayName.trim() || 'Öğrenci');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Hesap Oluştur" subtitle="FocusNet'e katıl">
      <AuthInput placeholder="Görünen adın" value={displayName} onChangeText={setDisplayName} />
      <AuthInput
        placeholder="E-posta"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <AuthInput placeholder="Şifre (min. 6)" secureTextEntry value={password} onChangeText={setPassword} />
      <ErrorText message={error} />
      <Button title="Kayıt Ol" icon="✓" onPress={handleRegister} loading={loading} />
      <Pressable onPress={onBack}>
        <Text style={styles.link}>← Girişe dön</Text>
      </Pressable>
    </AuthLayout>
  );
}

export function ResetPasswordScreen({ onBack }: { onBack: () => void }) {
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
      const r = await authApi.resetPassword(email.trim().toLowerCase(), newPassword);
      setSuccess(r.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Şifre Sıfırla">
      <AuthInput
        placeholder="E-posta"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <AuthInput placeholder="Yeni şifre" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
      <ErrorText message={error} />
      {success ? <Text style={styles.success}>✓ {success}</Text> : null}
      <Button title="Şifreyi Güncelle" onPress={handleReset} loading={loading} />
      <Pressable onPress={onBack}>
        <Text style={styles.link}>← Girişe dön</Text>
      </Pressable>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'rgba(15,23,42,0.65)',
    borderRadius: 14,
    padding: 16,
    color: '#f8fafc',
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.2)',
  },
  linkWrap: { marginTop: 18, alignItems: 'center' },
  link: { ...typography.bodyBold, color: '#22d3ee', textAlign: 'center', marginTop: 12 },
  linkMuted: { ...typography.caption, color: 'rgba(248,250,252,0.55)', textAlign: 'center', marginTop: 10 },
  success: { ...typography.body, color: '#22c55e', marginBottom: 12 },
});
