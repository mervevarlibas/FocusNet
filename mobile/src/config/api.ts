/** API base URL — mobile/.env içinde EXPO_PUBLIC_API_URL */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3000';
