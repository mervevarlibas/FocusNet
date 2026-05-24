import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LoginScreen,
  RegisterScreen,
  ResetPasswordScreen,
} from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { SocialScreen } from '../screens/SocialScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Ana: '🏠',
    Odak: '⏱️',
    Takvim: '📅',
    Sosyal: '🏆',
    Profil: '👤',
  };
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapOn]}>
      <Text style={{ fontSize: 22 }}>{icons[label] || '•'}</Text>
    </View>
  );
}

function MainTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.cardBorder,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 12,
          shadowColor: theme.shadow,
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: { ...typography.caption, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Ana" component={DashboardScreen} options={{ title: 'Ana Sayfa' }} />
      <Tab.Screen name="Odak" component={FocusScreen} options={{ title: 'Odak' }} />
      <Tab.Screen name="Takvim" component={CalendarScreen} />
      <Tab.Screen name="Sosyal" component={SocialScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  const [screen, setScreen] = useState<'login' | 'register' | 'reset'>('login');

  if (screen === 'register') {
    return <RegisterScreen onBack={() => setScreen('login')} />;
  }
  if (screen === 'reset') {
    return <ResetPasswordScreen onBack={() => setScreen('login')} />;
  }
  return (
    <LoginScreen onRegister={() => setScreen('register')} onReset={() => setScreen('reset')} />
  );
}

export function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  const navTheme = {
    ...DefaultTheme,
    dark: theme.mode === 'dark',
    colors: {
      ...DefaultTheme.colors,
      background: theme.bg,
      card: theme.card,
      text: theme.text,
      border: theme.cardBorder,
      primary: theme.primary,
    },
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.muted }]}>FocusNet yükleniyor…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, marginTop: 14 },
  iconWrap: { opacity: 0.55 },
  iconWrapOn: { opacity: 1, transform: [{ scale: 1.08 }] },
});
