export interface DtoKullanici {
  id: number;
  email: string;
  ad: string;
  soyad: string;
  butce: number | null;
  vegan: boolean;
  vejetaryen: boolean;
  glutensiz: boolean;
  helal: boolean;
  laktozsuz: boolean;
  alerjenler: string[];
}

export interface DtoTokenYanit {
  token: string;
  tokenTuru: string;
  gecerlilikMs: number;
  kullanici: DtoKullanici;
}

export interface DtoGiris {
  email: string;
  sifre: string;
}

export interface DtoKayit {
  ad: string;
  soyad: string;
  email: string;
  sifre: string;
}

export interface DtoRestoran {
  id: number;
  restoranAdi: string;
  enlem: number;
  boylam: number;
  adres: string | null;
  aciklama: string | null;
  qrKod: string;
  mesafeKm: number | null;
}

export interface DtoUrun {
  id: number;
  kategoriId: number;
  urunAdi: string;
  aciklama: string | null;
  fiyat: number;
  tahminiKalori: number | null;
  alerjenler: string[];
  mevcut: boolean;
}

export interface DtoKategori {
  id: number;
  restoranId: number;
  kategoriAdi: string;
  siraNo: number;
  urunler: DtoUrun[];
}

export interface DtoMenu {
  restoran: DtoRestoran;
  kategoriler: DtoKategori[];
}

export interface DtoTercih {
  butce: number | null;
  vegan: boolean;
  vejetaryen: boolean;
  glutensiz: boolean;
  helal: boolean;
  laktozsuz: boolean;
  alerjenler: string[];
}
