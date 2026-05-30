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

const TAB_META: Record<string, { icon: string; label: string }> = {
  Ana: { icon: '◆', label: 'ANA SAYFA' },
  Odak: { icon: '◷', label: 'ODAK' },
  Takvim: { icon: '▦', label: 'TAKVİM' },
  Sosyal: { icon: '◎', label: 'SOSYAL' },
  Profil: { icon: '◇', label: 'PROFİL' },
};

function TabBarIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  const { theme } = useTheme();
  const meta = TAB_META[routeName] || { icon: '•', label: routeName };
  return (
    <View style={styles.tabIconWrap}>
      <Text
        style={[
          styles.tabIcon,
          { color: focused ? theme.primary : theme.muted },
        ]}
      >
        {meta.icon}
      </Text>
    </View>
  );
}

function TabBarLabel({ routeName, focused }: { routeName: string; focused: boolean }) {
  const { theme } = useTheme();
  const meta = TAB_META[routeName] || { icon: '', label: routeName };
  return (
    <Text
      style={[
        styles.tabLabel,
        {
          color: focused ? theme.primary : theme.muted,
          opacity: focused ? 1 : 0.65,
        },
      ]}
      numberOfLines={1}
    >
      {meta.label}
    </Text>
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
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 16,
          shadowColor: theme.shadow,
          shadowOpacity: 0.2,
          shadowRadius: 16,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarIcon: ({ focused }) => <TabBarIcon routeName={route.name} focused={focused} />,
        tabBarLabel: ({ focused }) => <TabBarLabel routeName={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Ana" component={DashboardScreen} />
      <Tab.Screen name="Odak" component={FocusScreen} />
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
  tabIconWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  tabIcon: { fontSize: 18, fontWeight: '300' },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
