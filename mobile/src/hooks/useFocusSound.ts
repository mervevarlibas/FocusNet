import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';
import { FOCUS_SOUNDS, type FocusSoundId } from '../constants/focusSounds';

export function useFocusSound(soundId: FocusSoundId, playing: boolean) {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function stopSound() {
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch {
          /* */
        }
        soundRef.current = null;
      }
    }

    async function sync() {
      await stopSound();
      if (cancelled || !playing || soundId === 'none') return;

      const def = FOCUS_SOUNDS.find((s) => s.id === soundId);
      if (!def?.uri) return;

      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: def.uri },
          { isLooping: true, volume: 0.55, shouldPlay: true }
        );
        if (cancelled) {
          await sound.unloadAsync();
          return;
        }
        soundRef.current = sound;
      } catch {
        /* ağ / ses yüklenemedi */
      }
    }

    sync();
    return () => {
      cancelled = true;
      stopSound();
    };
  }, [soundId, playing]);

  return {
    stop: async () => {
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    },
  };
}
