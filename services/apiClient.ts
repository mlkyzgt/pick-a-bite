import { API_BASE, API_HOST } from "../constants/api";
import { getToken } from "./authStorage";
import { ApiError, ApiErrorBody } from "./errors";
import type {
  ChatYanit,
  KarsilastirmaYanit,
  Kullanici,
  Menu,
  Restoran,
  Tercih,
  TokenYanit,
} from "./types";

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      0,
      `Sunucuya ulaşılamadı (${API_HOST}:8080). Spring Boot backend çalışıyor mu? Telefonda test ediyorsanız bilgisayarınızın IP adresini .env dosyasında EXPO_PUBLIC_API_HOST olarak ayarlayın.`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let body: ApiErrorBody | T | null = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const errBody = body as ApiErrorBody | null;
    throw new ApiError(
      response.status,
      errBody?.mesaj || "İstek başarısız oldu.",
      errBody || undefined,
    );
  }

  return body as T;
}

export const api = {
  kayit: (email: string, sifre: string, ad?: string, soyad?: string) =>
    request<TokenYanit>(
      "/auth/kayit",
      {
        method: "POST",
        body: JSON.stringify({ email, sifre, ad, soyad }),
      },
      false,
    ),

  giris: (email: string, sifre: string) =>
    request<TokenYanit>(
      "/auth/giris",
      {
        method: "POST",
        body: JSON.stringify({ email, sifre }),
      },
      false,
    ),

  ben: () => request<Kullanici>("/auth/ben"),

  tercihGetir: () => request<Tercih>("/kullanici/tercihler"),

  tercihGuncelle: (tercih: Tercih) =>
    request<Tercih>("/kullanici/tercihler", {
      method: "PUT",
      body: JSON.stringify(tercih),
    }),

  yakindakiRestoranlar: (enlem: number, boylam: number, yaricapKm = 50) =>
    request<Restoran[]>(
      `/restoranlar/yakin?enlem=${enlem}&boylam=${boylam}&yaricapKm=${yaricapKm}`,
      {},
      false,
    ),

  tumRestoranlar: () => request<Restoran[]>("/restoranlar", {}, false),

  menuGetir: (restoranId: number) =>
    request<Menu>(`/restoranlar/${restoranId}/menu`, {}, false),

  qrMenuGetir: (qrKod: string) =>
    request<Menu>(`/restoranlar/qr/${encodeURIComponent(qrKod)}`, {}, false),

  chat: (
    mesaj: string,
    restoranId?: number,
    enlem?: number,
    boylam?: number,
    yaricapKm = 50,
    haricTutUrunIds: number[] = [],
  ) =>
    request<ChatYanit>("/chat", {
      method: "POST",
      body: JSON.stringify({
        mesaj,
        restoranId,
        enlem,
        boylam,
        yaricapKm,
        haricTutUrunIds,
      }),
    }),

  karsilastir: (enlem: number, boylam: number, butceMax?: number) => {
    let url = `/karsilastir?enlem=${enlem}&boylam=${boylam}`;
    if (butceMax != null) {
      url += `&butceMax=${butceMax}`;
    }
    return request<KarsilastirmaYanit>(url);
  },

  karsilastirMesaj: (mesaj: string, enlem: number, boylam: number) =>
    request<KarsilastirmaYanit>("/karsilastir", {
      method: "POST",
      body: JSON.stringify({ mesaj, enlem, boylam }),
    }),
};
