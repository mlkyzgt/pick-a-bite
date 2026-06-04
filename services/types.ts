export type TokenYanit = {
  token: string;
  tokenTuru: string;
  gecerlilikMs: number;
  kullanici: Kullanici;
};

export type Kullanici = {
  id: number;
  email: string;
  ad?: string;
  soyad?: string;
  butce?: number;
  vegan: boolean;
  vejetaryen: boolean;
  glutensiz: boolean;
  helal: boolean;
  laktozsuz: boolean;
  alerjenler: string[];
  rol?: string;
  restoranId?: number;
};

export type Tercih = {
  butce?: number;
  vegan: boolean;
  vejetaryen: boolean;
  glutensiz: boolean;
  helal: boolean;
  laktozsuz: boolean;
  alerjenler: string[];
};

export type Restoran = {
  id: number;
  restoranAdi: string;
  enlem: number;
  boylam: number;
  qrKod?: string;
  adres?: string;
  mesafeKm?: number;
  uygunlukSkoru?: number;
  tercihUyumlu?: boolean;
};

export type Urun = {
  id: number;
  urunAdi: string;
  aciklama?: string;
  fiyat: number;
  tahminiKalori?: number;
  alerjenler?: string[];
  mevcut: boolean;
  bilgilendirmeNotu?: string;
};

export type Kategori = {
  id: number;
  kategoriAdi: string;
  siraNo: number;
  urunler: Urun[];
};

export type Menu = {
  restoran: Restoran;
  kategoriler: Kategori[];
};

export type ChatYanit = {
  yanitMetni: string;
  onerilenUrunler: OnerilenUrun[];
  uyariMesaji?: string;
  kriterDegistirmeOnerisi?: string;
  bilgilendirmeNotu?: string;
};

export type OnerilenUrun = {
  urunId: number;
  restoranId: number;
  restoranAdi: string;
  urunAdi: string;
  fiyat: number;
  tahminiKalori?: number;
  mesafeKm?: number;
  uygunluk?: string;
  uygunlukSkoru?: number;
};

export type KarsilastirmaYanit = {
  sonuclar: {
    restoranAdi: string;
    restoranId: number;
    urunAdi: string;
    urunId: number;
    fiyat: number;
    mesafeKm?: number;
    uygunluk?: string;
    uygunlukSkoru?: number;
  }[];
  mesaj?: string;
  bilgilendirmeNotu?: string;
};
