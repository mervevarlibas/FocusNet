/**
 * Canlı API (Render) — okul/ev/her yerde.
 * Render panelindeki URL farklıysa mobile/.env içinde EXPO_PUBLIC_API_URL yaz.
 */
export const PRODUCTION_API_URL = 'https://focusnet.onrender.com';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') || PRODUCTION_API_URL;
