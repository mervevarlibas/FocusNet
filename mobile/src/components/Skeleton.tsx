import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function Skeleton({ style, height = 16 }: { style?: ViewStyle; height?: number }) {
  const { theme } = useTheme();
  const anim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.75, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return (
    <Animated.View
      style={[
        styles.base,
        { height, backgroundColor: theme.cardBorder, opacity: anim },
        style,
      ]}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <View style={{ gap: 12 }}>
      <Skeleton height={120} style={{ borderRadius: 16 }} />
      <Skeleton height={180} style={{ borderRadius: 16 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 8, width: '100%' },
});
