export type FocusSoundId = 'none' | 'rain' | 'cafe' | 'fireplace' | 'forest' | 'waves';

export const FOCUS_SOUNDS: {
  id: FocusSoundId;
  label: string;
  emoji: string;
  uri: string | null;
}[] = [
  { id: 'none', label: 'Kapalı', emoji: '🔇', uri: null },
  {
    id: 'rain',
    label: 'Yağmur',
    emoji: '🌧',
    uri: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3',
  },
  {
    id: 'cafe',
    label: 'Kafe',
    emoji: '☕',
    uri: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  },
  {
    id: 'fireplace',
    label: 'Şömine',
    emoji: '🔥',
    uri: 'https://assets.mixkit.co/active_storage/sfx/1350/1350-preview.mp3',
  },
  {
    id: 'forest',
    label: 'Orman',
    emoji: '🌲',
    uri: 'https://assets.mixkit.co/active_storage/sfx/2440/2440-preview.mp3',
  },
  {
    id: 'waves',
    label: 'Deniz',
    emoji: '🌊',
    uri: 'https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3',
  },
];
