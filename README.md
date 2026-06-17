# Pick A Bite

Pick A Bite, kullanıcıların restoran menülerini daha hızlı, bilinçli ve kişisel ihtiyaçlarına uygun şekilde değerlendirebilmelerini amaçlayan yapay zekâ destekli, konum tabanlı bir yemek öneri ve menü uygulamasıdır. QR kod ile dijital menüye erişim, doğal dille çalışan yapay zekâ asistanı, alerjen ve beslenme tercihi filtreleme, bütçe odaklı öneriler ve çevredeki restoranları karşılaştırma özelliklerini bir araya getirir.

Bursa Teknik Üniversitesi BLM0324 Yazılım Mühendisliği proje ödevi kapsamında geliştirilmiştir.

```
"250 TL altında glütensiz bir öğün öner"
        ↓
  Yapay zekâ menüyü tarar → en uygun seçenekleri sunar
```

---

## Demo Video

Ürünü tanıtan ve kullanımını gösteren video:

**https://youtu.be/Z5ILXRLEks4**

---

## İçindekiler

- [Projenin Amacı](#projenin-amacı)
- [Proje Hedefleri](#proje-hedefleri)
- [Özellikler](#özellikler)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Sistem Mimarisi](#sistem-mimarisi)
- [Takım Üyeleri ve Görevleri](#takım-üyeleri-ve-görevleri)
- [Takım Yetkinlikleri](#takım-yetkinlikleri)
- [Yazılım Geliştirme Süreci](#yazılım-geliştirme-süreci)
- [Belgeler](#belgeler)

---

## Projenin Amacı

Günümüzde restoran menüleri kullanıcılar için karmaşık ve zaman kaybettirici olabilmektedir. Kullanıcılar ayrıca şu konularda zorluk yaşamaktadır:

- Bütçeye uygun seçenekleri belirlemek
- Yemeklerin içerdiği potansiyel alerjen bilgilerine erişmek
- Sağlıklı ve tercihe uygun seçenekleri filtrelemek
- Alternatif restoranları karşılaştırmak

Pick A Bite, bu süreci yapay zekâ ve konum tabanlı sistemlerle kolaylaştırmayı hedefler.

---

## Proje Hedefleri

- QR tabanlı hızlı menü erişimi sağlamak
- Yapay zekâ destekli yemek öneri sistemi geliştirmek
- Konum tabanlı restoran keşfi sunmak
- Restoranlar arası fiyat ve menü karşılaştırması yapmak
- Kullanıcı tercihlerini analiz ederek kişiselleştirilmiş deneyim oluşturmak
- Mobil platformlarda modern ve kullanıcı dostu bir arayüz geliştirmek
- Ölçeklenebilir, gerçek dünya verisiyle çalışan bir çözüm geliştirmek

---

## Özellikler

| # | Özellik | Açıklama |
|---|---------|----------|
| 1 | **QR ile Menü Erişimi** | Masadaki QR kodu kameraya tut, menü anında açılır |
| 2 | **AI Chatbot Öneri** | Doğal dilde sorgu (Groq Llama 3.3 70B) ile menüden filtreli öneri |
| 3 | **Konum Bazlı Keşif** | Harita üzerinde yakın restoranlar; menüsüz gri, nötr mavi, tercihe uygun yeşil, uygun değil kırmızı |
| 4 | **Menü Görüntüleme** | Kategorize menü: ad, açıklama, fiyat, tahminî kalori, alerjen rozetleri |
| 5 | **Ürün Detayı** | Ürüne dokun → fiyat, tahminî kalori, alerjen ve tercihe göre uygunluk rozeti |
| 6 | **Kişisel Tercihler** | Vegan / glütensiz / laktoz / alerjen / bütçe — kalıcı olarak saklanır |
| 7 | **Kayıt / Giriş (JWT)** | Misafir + opsiyonel hesap: kayıt, giriş, çıkış; tokenlar güvenli saklanır |
| 8 | **Otomatik Menü Senkronu** | Dijital menü kaynağı belirli aralıklarla taranır; fiyat/ürün değişiklikleri uygulamaya kendiliğinden yansır |
| 9 | **QR ile Keşif** | Sistemde olmayan restoranın web menü QR'ı okutulunca menü çıkarılıp kalıcı kaydedilir; restoran herkes için menülü olur |
| 10 | **Otomatik AI Menü Analizi** | Eksik bilgili (kalori/açıklama/alerjen) ürünler arka planda yapay zekâ ile doldurulur; yeni keşfedilen restoran kendiliğinden tamamlanır |

---

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| **Mobil** | React Native, Expo, TypeScript, Expo Router |
| **Harita** | react-native-maps, OpenStreetMap |
| **Backend** | Spring Boot (Java 17), Spring Data JPA, Hibernate |
| **Veritabanı** | H2 (PostgreSQL uyumlu mod) — üretim için PostgreSQL'e geçiş hazır |
| **Kimlik Doğrulama** | Spring Security + JWT + BCrypt |
| **Yapay Zekâ** | Groq API (llama-3.3-70b-versatile), Gemini (yedek) |
| **Veri Toplama** | Python (pandas, requests), Google Places API, web menü çıkarımı |

---

## Sistem Mimarisi

```text
Mobil Uygulama (React Native / Expo)
        |
Backend REST API (Spring Boot)
        |
H2 / PostgreSQL Veritabanı
        |
Yapay Zekâ (Groq) + Otomatik Menü Senkronu
        |
OpenStreetMap ve Konum Servisleri
```

Katmanlı mimari (Controller - Service - Repository) ve DTO deseni uygulanmıştır. Kimlik doğrulama JWT ile sağlanır; çoğu uç herkese açıkken kullanıcıya özel uçlar token gerektirir.

---

## Takım Üyeleri ve Görevleri

### Liderlik & Dokümantasyon
- **İmer Imeri** → Proje koordinasyonu, dokümantasyon, gereksinim analizi
- **Kubilay İnanç** → Sistem tasarımı ve mimari, tam yığın entegrasyon (mobil–backend–yapay zekâ), hata onarımı ve test, teknik dokümantasyon

### Front-End Takımı
- **Melike Rana Yozgatlı** → React Native mobil geliştirme, QR & harita ekranları, UI/UX
- **Tuğba Nur Ayık** → Kullanıcı deneyimi tasarımı, sayfa akışları, mobil ekran düzenleri

### Back-End Takımı
- **Ali Yılmaz** → Spring Boot ve FastAPI ile Backend servisleri ve API geliştirme
- **Raul Namazzada** → PostgreSQL veritabanı yönetimi
- **Kübra Kaya** → Veri akışı ve sistem entegrasyonu

### Yapay Zeka Takımı
- **Muhammet Fatih Göral** → AI öneri sistemi, prompt engineering
- **Suhail Khaleqi** → Menü analiz sistemi, filtreleme algoritmaları

---

## Takım Yetkinlikleri

- React Native mobil uygulama geliştirme
- Spring Boot backend geliştirme
- PostgreSQL veritabanı yönetimi
- REST API geliştirme
- UI/UX tasarımı
- Yapay zeka ve prompt engineering
- Web scraping ve veri işleme
- Agile proje yönetimi
- Git & GitHub takım çalışması

---

## Yazılım Geliştirme Süreci

Projede **Agile (Çevik Yazılım Geliştirme)** yöntemi kullanılmıştır.

### Süreç
1. Gereksinim analizi
2. Tasarım süreci
3. Front-end & Back-end geliştirme
4. Yapay zeka entegrasyonu
5. Test ve hata yönetimi
6. Demo ve sunum

### Çalışma Sistemi
- Haftalık sprint planlamaları
- Görev dağılımları
- GitHub üzerinden versiyon kontrolü
- Düzenli test ve hata düzeltme süreçleri

---

## Belgeler

Gereksinim dokümanı, uygulama mimarisi, sınıf ve kullanım durumu diyagramları (UML), kullanım kılavuzu ve iş planı `docs/` klasöründe paylaşılmaktadır.

---

## Lisans

Bu proje Bursa Teknik Üniversitesi BLM0324 dersi kapsamında eğitim amaçlı geliştirilmiştir.
