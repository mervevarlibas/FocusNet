import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

type ToastContextValue = { showToast: (msg: string, type?: 'success' | 'error') => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [msg, setMsg] = useState<string | null>(null);
  const [type, setType] = useState<'success' | 'error'>('success');
  const opacity = useState(() => new Animated.Value(0))[0];

  const showToast = useCallback(
    (message: string, t: 'success' | 'error' = 'success') => {
      setMsg(message);
      setType(t);
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2200),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setMsg(null));
    },
    [opacity]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {msg ? (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity,
              backgroundColor: type === 'success' ? theme.success : theme.error,
            },
          ]}
        >
          <Text style={styles.toastText}>{msg}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast ToastProvider içinde');
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    padding: 16,
    borderRadius: 14,
    zIndex: 999,
    elevation: 8,
  },
  toastText: { ...typography.bodyBold, color: '#fff', textAlign: 'center' },
});
