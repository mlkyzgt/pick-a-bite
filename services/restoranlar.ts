import { ENDPOINTS } from "@/constants/api";
import { DtoMenu, DtoRestoran, DtoTercih } from "@/types";
import apiClient from "./api";

export async function getYakin(
  enlem: number,
  boylam: number,
  yaricapKm = 5
): Promise<DtoRestoran[]> {
  const yanit = await apiClient.get<DtoRestoran[]>(ENDPOINTS.RESTORANLAR.YAKIN, {
    params: { enlem, boylam, yaricapKm },
  });
  return yanit.data;
}

export async function getListe(): Promise<DtoRestoran[]> {
  const yanit = await apiClient.get<DtoRestoran[]>(ENDPOINTS.RESTORANLAR.LISTE);
  return yanit.data;
}

export async function getQr(qrKod: string): Promise<DtoMenu> {
  const yanit = await apiClient.get<DtoMenu>(ENDPOINTS.RESTORANLAR.QR(qrKod));
  return yanit.data;
}

export async function getMenu(restoranId: number): Promise<DtoMenu> {
  const yanit = await apiClient.get<DtoMenu>(
    ENDPOINTS.RESTORANLAR.MENU(restoranId)
  );
  return yanit.data;
}

export async function getTercihler(): Promise<DtoTercih> {
  const yanit = await apiClient.get<DtoTercih>(
    "/kullanici/tercihler"
  );
  return yanit.data;
}

export async function putTercihler(istek: DtoTercih): Promise<DtoTercih> {
  const yanit = await apiClient.put<DtoTercih>(
    "/kullanici/tercihler",
    istek
  );
  return yanit.data;
}
