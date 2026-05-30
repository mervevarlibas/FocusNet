import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAvatarCharacter } from '../constants/avatars';
import { useTheme } from '../theme/ThemeContext';

export function Avatar({
  index,
  size = 48,
  selected,
  animate,
}: {
  index: number;
  name?: string;
  email?: string;
  size?: number;
  selected?: boolean;
  animate?: boolean;
}) {
  const { theme } = useTheme();
  const char = getAvatarCharacter(index);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animate && !selected) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animate, selected, scale]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          transform: [{ scale }],
        },
        selected && { borderColor: theme.primary, borderWidth: 3 },
      ]}
    >
      <LinearGradient
        colors={char.colors}
        style={[styles.grad, { width: size, height: size, borderRadius: size * 0.28 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.emoji, { fontSize: size * 0.48 }]}>{char.emoji}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  grad: { alignItems: 'center', justifyContent: 'center' },
  emoji: { textAlign: 'center' },
});
