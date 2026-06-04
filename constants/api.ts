import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PORT = 8080;
const API_PATH = "/pick-a-bite";

/** Manuel override: .env içinde EXPO_PUBLIC_API_URL veya EXPO_PUBLIC_API_HOST */
function explicitHost(): string | null {
  const url = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
    }
  }
  const raw = process.env.EXPO_PUBLIC_API_HOST?.trim();
  if (!raw) return null;
  return raw.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
}

/** Expo Go / Metro ile aynı makine IP'sini kullanır (fiziksel cihaz için şart). */
function expoDevHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (!hostUri) return null;
  const host = hostUri.split(":")[0];
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return host;
  }
  return null;
}

function resolveHost(): string {
  const dev = expoDevHost();
  if (dev) return dev;

  const manual = explicitHost();
  if (manual) return manual;

  if (Platform.OS === "android") {
    return "10.0.2.2";
  }
  return "localhost";
}

export const API_HOST = resolveHost();
export const BASE_URL = `http://${API_HOST}:${API_PORT}${API_PATH}`;
export const API_BASE = BASE_URL;

export const ENDPOINTS = {
  AUTH: {
    KAYIT: "/auth/kayit",
    GIRIS: "/auth/giris",
    BEN: "/auth/ben",
  },
  RESTORANLAR: {
    LISTE: "/restoranlar",
    DETAY: (id: number) => `/restoranlar/${id}`,
    YAKIN: "/restoranlar/yakin",
    QR: (qrKod: string) => `/restoranlar/qr/${qrKod}`,
    MENU: (id: number) => `/restoranlar/${id}/menu`,
  },
  KULLANICI: {
    TERCIHLER: "/kullanici/tercihler",
  },
} as const;
