import { ENDPOINTS } from "@/constants/api";
import { DtoGiris, DtoKayit, DtoKullanici, DtoTokenYanit } from "@/types";
import apiClient from "./api";

export async function giris(istek: DtoGiris): Promise<DtoTokenYanit> {
  const yanit = await apiClient.post<DtoTokenYanit>(
    ENDPOINTS.AUTH.GIRIS,
    istek
  );
  return yanit.data;
}

export async function kayit(istek: DtoKayit): Promise<DtoTokenYanit> {
  const yanit = await apiClient.post<DtoTokenYanit>(
    ENDPOINTS.AUTH.KAYIT,
    istek
  );
  return yanit.data;
}

export async function ben(): Promise<DtoKullanici> {
  const yanit = await apiClient.get<DtoKullanici>(ENDPOINTS.AUTH.BEN);
  return yanit.data;
}
