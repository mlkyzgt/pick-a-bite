# Pick a Bite — Backend (MVP)

Bu depo, Pick A Bite gereksinim dokümanındaki MVP çekirdek backend'ini içerir:

- JWT tabanlı kullanıcı kayıt/giriş
- Kullanıcı tercih ve alerjen profili
- Restoran CRUD + konum bazlı arama (Haversine)
- QR kod ile restoran menüsüne erişim
- Kategori + ürün bazlı menü yönetimi
- Standart Türkçe hata yanıtları
- Yapay zekâ destekli chatbot, kişiselleştirilmiş öneri ve çoklu restoran karşılaştırma (Spring AI + **Groq**)
- AI menü analizi (tahmini kalori, besin, alerjen)
- Restoran sahibi rolü (`RESTORAN`) ve menü yazma yetkisi
- Menü JSON senkronizasyonu (`backend/menu/menu.json`)

**Postman ve API’yi adım adım anlamak için:** [KULLANIM.md](KULLANIM.md) (Türkçe kullanım kılavuzu).

## Teknoloji yığını

- Java 17, Spring Boot 3.5
- Spring Web, Spring Data JPA, Spring Security, Bean Validation
- JJWT 0.12.6 (HS256)
- PostgreSQL 14+
- Lombok

## Hızlı kurulum

### 1) PostgreSQL'i hazırlayın

```bash
createdb pickabite
```

Varsayılan kullanıcı/şifre `postgres` / `postgres`'tir. Farklıysa
[`src/main/resources/application.properties`](src/main/resources/application.properties)
dosyasındaki `spring.datasource.*` değerlerini güncelleyin.

### 2) JWT gizli anahtarını ayarlayın

Üretimde `jwt.secret` değerini mutlaka environment değişkeniyle override edin:

```bash
export JWT_SECRET="en-az-32-bayt-uzunlugunda-rastgele-bir-anahtar-yazin"
```

Spring otomatik olarak `JWT_SECRET` ortam değişkenini `jwt.secret`'a bağlar.

### 3) Groq API anahtarı (chatbot / öneri / AI analiz)

Ücretsiz kota: [console.groq.com/keys](https://console.groq.com/keys)

```bash
export GROQ_API_KEY="gsk_..."
```

Anahtar yoksa AI uçları `503` ve anlaşılır Türkçe mesaj döner. Varsayılan model: `llama-3.3-70b-versatile`.

### 4) Java 17 (macOS / Homebrew)

JDK kurulu olsa bile `JAVA_HOME` ayarlı olmayabilir. Hata: *Unable to locate a Java Runtime*.

```bash
brew install openjdk@17   # yoksa
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
java -version   # 17.x görmelisiniz
javac -version  # yoksa JRE kullaniyorsunuz; JDK gerekir
```

Derleme hatasi `No compiler is provided... JRE rather than a JDK` gorurseniz `JAVA_HOME` yanlis
(orn. sadece `java` komutu JRE'ye baglidir). Yukaridaki `JAVA_HOME` tam JDK yolunu kullanin veya `./run.sh` calistirin.
```

### 5) Çalıştırın

```bash
export GROQ_API_KEY="gsk_..."   # https://console.groq.com/keys
./run.sh
```

veya elle:

```bash
./mvnw spring-boot:run
```

Uygulama `http://localhost:8080` üzerinde çalışır. Tablolar `ddl-auto=update`
ile otomatik oluşturulur.

## Uçlar (özet)

Hepsi `/pick-a-bite` altındadır.

| Yöntem | Yol                                              | Auth | Açıklama                                  |
| ------ | ------------------------------------------------ | ---- | ----------------------------------------- |
| POST   | `/auth/kayit`                                    | -    | Kullanıcı kaydı + JWT döner               |
| POST   | `/auth/giris`                                    | -    | Giriş + JWT döner                         |
| GET    | `/auth/ben`                                      | JWT  | Mevcut kullanıcı bilgisi                  |
| GET    | `/kullanici/tercihler`                           | JWT  | Tercih + alerjen profili                  |
| PUT    | `/kullanici/tercihler`                           | JWT  | Tercih + alerjen profili güncelle         |
| GET    | `/restoranlar`                                   | -    | Tüm restoranlar                           |
| GET    | `/restoranlar/{id}`                              | -    | Restoran detayı                           |
| POST   | `/restoranlar`                                   | -\*  | Restoran oluştur                          |
| PUT    | `/restoranlar/{id}`                              | -\*  | Restoran güncelle                         |
| DELETE | `/restoranlar/{id}`                              | -\*  | Restoran sil                              |
| GET    | `/restoranlar/yakin?enlem=&boylam=&yaricapKm=`   | -    | Konum bazlı arama (varsayılan yarıçap 5 km) |
| GET    | `/restoranlar/qr/{qrKod}`                        | -    | QR kod ile menüye erişim                  |
| GET    | `/restoranlar/{id}/menu`                         | -    | Kategorize edilmiş menü                   |
| POST   | `/restoranlar/{id}/kategoriler`                  | -\*  | Kategori oluştur                          |
| PUT    | `/kategoriler/{id}`                              | -\*  | Kategori güncelle                         |
| DELETE | `/kategoriler/{id}`                              | -\*  | Kategori sil                              |
| POST   | `/kategoriler/{id}/urunler`                      | -\*  | Ürün oluştur                              |
| PUT    | `/urunler/{id}`                                  | -\*  | Ürün güncelle                             |
| DELETE | `/urunler/{id}`                                  | RESTORAN | Ürün sil (kendi restoranı)            |
| POST   | `/chat`                                          | JWT  | AI chatbot                                |
| POST   | `/oneri`                                         | JWT  | Kişiselleştirilmiş öneri                  |
| GET/POST | `/karsilastir`                                 | JWT  | Çoklu restoran karşılaştırma              |
| POST   | `/urunler/{id}/ai-analiz`                        | JWT  | Tek ürün AI analizi                       |
| POST   | `/restoranlar/{id}/menu/ai-analiz`               | JWT  | Restoran menüsü toplu AI analizi          |
| POST   | `/admin/menu-senkron`                            | JWT  | `menu.json` içe aktarım                   |

Menü yazma uçları (`kategoriler`, `urunler`, restoran güncelle/sil) yalnızca `RESTORAN` rolü ve `restoranId` eşleşmesi ile çalışır. Kayıtta `rol: "RESTORAN"` ve `restoranId` gönderilebilir.

## Örnek akış (curl)

```bash
# 1) Kayıt ol
curl -s -X POST http://localhost:8080/pick-a-bite/auth/kayit \
  -H 'Content-Type: application/json' \
  -d '{"email":"ali@example.com","sifre":"sifre123","ad":"Ali","soyad":"Yilmaz"}'

# 2) Giriş yap (JWT al)
TOKEN=$(curl -s -X POST http://localhost:8080/pick-a-bite/auth/giris \
  -H 'Content-Type: application/json' \
  -d '{"email":"ali@example.com","sifre":"sifre123"}' | jq -r .token)

# 3) Profilini gor
curl -s http://localhost:8080/pick-a-bite/auth/ben \
  -H "Authorization: Bearer $TOKEN"

# 4) Tercihlerini guncelle
curl -s -X PUT http://localhost:8080/pick-a-bite/kullanici/tercihler \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"butce":250.0,"glutensiz":true,"alerjenler":["fistik","sut"]}'

# 5) Restoran olustur (QR kod otomatik uretilir)
RESTORAN=$(curl -s -X POST http://localhost:8080/pick-a-bite/restoranlar \
  -H 'Content-Type: application/json' \
  -d '{"restoranAdi":"Lezzet Durağı","enlem":41.015137,"boylam":28.97953,"adres":"Beyoğlu"}')
echo "$RESTORAN"
QR=$(echo "$RESTORAN" | jq -r .qrKod)
ID=$(echo "$RESTORAN" | jq -r .id)

# 6) Kategori ve urun ekle
KAT=$(curl -s -X POST http://localhost:8080/pick-a-bite/restoranlar/$ID/kategoriler \
  -H 'Content-Type: application/json' \
  -d '{"kategoriAdi":"Ana Yemekler","siraNo":1}')
KAT_ID=$(echo "$KAT" | jq -r .id)

curl -s -X POST http://localhost:8080/pick-a-bite/kategoriler/$KAT_ID/urunler \
  -H 'Content-Type: application/json' \
  -d '{"urunAdi":"Izgara Tavuk","fiyat":180.00,"tahminiKalori":420,"alerjenler":[]}'

# 7) QR kod ile menuye eris
curl -s http://localhost:8080/pick-a-bite/restoranlar/qr/$QR

# 8) Yakindaki restoranlar (JWT ile tercih uygunluk skoru)
curl -s "http://localhost:8080/pick-a-bite/restoranlar/yakin?enlem=41.015&boylam=28.98&yaricapKm=3" \
  -H "Authorization: Bearer $TOKEN"

# 9) Chatbot
curl -s -X POST http://localhost:8080/pick-a-bite/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"mesaj":"250 TL altında glütensiz bir yemek öner","enlem":41.015,"boylam":28.98}'

# 10) Karşılaştırma
curl -s "http://localhost:8080/pick-a-bite/karsilastir?enlem=41.015&boylam=28.98&butceMax=300" \
  -H "Authorization: Bearer $TOKEN"
```

## Hata yanıt formatı

```json
{
  "hataKodu": 404,
  "mesaj": "Bu QR kod sisteme kayıtlı bir restorana ait değil.",
  "yol": "/pick-a-bite/restoranlar/qr/yok",
  "zaman": "2026-05-11T17:30:00",
  "alanHatalari": null
}
```

## Proje yapısı

```
src/main/java/com/aliyilmaz
├── config/           # SecurityConfig
├── controller/       # IXxxController arayuzleri
│   └── impl/         # REST controller'lar
├── dto/              # Request / response DTO'lar
├── entities/         # JPA entity'leri
├── exception/        # Ozel hatalar + GlobalExceptionHandler
├── repository/       # Spring Data JPA arayuzleri
├── security/         # JwtService, JwtAuthFilter, UserDetailsService
├── services/         # IXxxServices arayuzleri
│   └── impl/         # Servis implementasyonlari
└── starter/          # PickABiteApplication
```

## Bilinen sınırlamalar

- OCR menü fotoğrafı ve gerçek zamanlı stok kapsam dışıdır.
- AI çıktıları bilgilendirme amaçlıdır; tıbbi tavsiye değildir.
- `GROQ_API_KEY` zorunludur (AI uçları için).
- Birim testleri MVP kapsamı dışında tutulmuştur.

## Expo mobil uygulama

Kök dizindeki React Native (Expo) uygulaması `services/apiClient.ts` üzerinden bu API'ye bağlanır. Android emülatörde `constants/api.ts` içinde host `10.0.2.2` kullanılır.
