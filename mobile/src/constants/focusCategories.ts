export type FocusCategoryId =
  | 'math'
  | 'coding'
  | 'reading'
  | 'language'
  | 'science'
  | 'exam'
  | 'other';

export const FOCUS_CATEGORIES: {
  id: FocusCategoryId;
  label: string;
  emoji: string;
}[] = [
  { id: 'math', label: 'Matematik', emoji: '📐' },
  { id: 'coding', label: 'Kodlama', emoji: '💻' },
  { id: 'reading', label: 'Kitap okuma', emoji: '📖' },
  { id: 'language', label: 'Dil çalışması', emoji: '🗣' },
  { id: 'science', label: 'Fen bilimleri', emoji: '🔬' },
  { id: 'exam', label: 'Sınav hazırlığı', emoji: '📝' },
  { id: 'other', label: 'Diğer', emoji: '✨' },
];

export function focusCategoryLabel(id: string) {
  return FOCUS_CATEGORIES.find((c) => c.id === id)?.label ?? 'Diğer';
}
