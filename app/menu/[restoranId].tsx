import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getMenu } from "@/services/restoranlar";
import { DtoKategori, DtoMenu, DtoUrun } from "@/types";

const ALERJEN_ETIKETLER: Record<string, string> = {
  GLUTEN: "Gluten",
  LAKTOZ: "Laktoz",
  YUMURTA: "Yumurta",
  KURUYEMIS: "Kuruyemiş",
  DENIZ_URUNU: "Deniz Ürünü",
  SOYA: "Soya",
};

function UrunKarti({ urun }: { urun: DtoUrun }) {
  return (
    <View style={[styles.urunKarti, !urun.mevcut && styles.urunKartiPasif]}>
      <View style={styles.urunBilgi}>
        <Text style={[styles.urunAdi, !urun.mevcut && styles.pasifMetin]}>
          {urun.urunAdi}
          {!urun.mevcut && " (Mevcut Değil)"}
        </Text>
        {urun.aciklama ? (
          <Text style={styles.urunAciklama} numberOfLines={2}>
            {urun.aciklama}
          </Text>
        ) : null}
        {urun.alerjenler && urun.alerjenler.length > 0 && (
          <View style={styles.alerjenler}>
            {urun.alerjenler.map((a) => (
              <View key={a} style={styles.alerjenBadge}>
                <Text style={styles.alerjenMetin}>
                  {ALERJEN_ETIKETLER[a] ?? a}
                </Text>
              </View>
            ))}
          </View>
        )}
        {urun.tahminiKalori ? (
          <Text style={styles.kalori}>~{urun.tahminiKalori} kcal</Text>
        ) : null}
      </View>
      <View style={styles.fiyatKutu}>
        <Text style={styles.fiyat}>{urun.fiyat.toFixed(2)} ₺</Text>
      </View>
    </View>
  );
}

export default function MenuEkrani() {
  const { restoranId } = useLocalSearchParams<{ restoranId: string }>();
  const router = useRouter();

  const [menu, setMenu] = useState<DtoMenu | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifKategori, setAktifKategori] = useState<number | null>(null);

  useEffect(() => {
    async function menuYukle() {
      try {
        const id = parseInt(restoranId, 10);
        const data = await getMenu(id);
        setMenu(data);
        if (data.kategoriler.length > 0) {
          setAktifKategori(data.kategoriler[0].id);
        }
      } catch (err: any) {
        Alert.alert("Hata", err.message || "Menü yüklenemedi.");
        router.back();
      } finally {
        setYukleniyor(false);
      }
    }
    menuYukle();
  }, [restoranId, router]);

  if (yukleniyor) {
    return (
      <View style={styles.merkez}>
        <ActivityIndicator size="large" color="#ED8936" />
      </View>
    );
  }

  if (!menu) return null;

  const aktifKategoriData = menu.kategoriler.find((k) => k.id === aktifKategori);

  return (
    <View style={styles.container}>
      {/* Üst bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.geriBtn}>
          <Ionicons name="chevron-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.restoranAdi} numberOfLines={1}>
          {menu.restoran.restoranAdi}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Kategori sekmeler */}
      <FlatList
        data={menu.kategoriler}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kategoriListe}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.kategoriTab,
              aktifKategori === item.id && styles.kategoriTabAktif,
            ]}
            onPress={() => setAktifKategori(item.id)}
          >
            <Text
              style={[
                styles.kategoriMetin,
                aktifKategori === item.id && styles.kategoriMetinAktif,
              ]}
            >
              {item.kategoriAdi}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Ürün listesi */}
      {aktifKategoriData && aktifKategoriData.urunler.length > 0 ? (
        <FlatList
          data={aktifKategoriData.urunler}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <UrunKarti urun={item} />}
          contentContainerStyle={styles.urunListe}
          ItemSeparatorComponent={() => <View style={styles.ayrac} />}
        />
      ) : (
        <View style={styles.merkez}>
          <Ionicons name="restaurant-outline" size={48} color="#ccc" />
          <Text style={styles.bosMetin}>Bu kategoride ürün yok</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },

  merkez: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 55,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 3,
  },

  geriBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },

  restoranAdi: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
  },

  kategoriListe: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    gap: 8,
  },

  kategoriTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 8,
  },

  kategoriTabAktif: {
    backgroundColor: "#ED8936",
  },

  kategoriMetin: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },

  kategoriMetinAktif: {
    color: "white",
  },

  urunListe: {
    padding: 16,
  },

  ayrac: { height: 12 },

  urunKarti: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  urunKartiPasif: {
    opacity: 0.5,
  },

  urunBilgi: { flex: 1, marginRight: 12 },

  urunAdi: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },

  pasifMetin: { color: "#999" },

  urunAciklama: {
    fontSize: 13,
    color: "#777",
    lineHeight: 18,
    marginBottom: 6,
  },

  alerjenler: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
    marginBottom: 4,
  },

  alerjenBadge: {
    backgroundColor: "#FEF3E2",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#FDDBA7",
  },

  alerjenMetin: {
    fontSize: 11,
    color: "#D97706",
    fontWeight: "600",
  },

  kalori: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },

  fiyatKutu: {
    justifyContent: "center",
    alignItems: "flex-end",
  },

  fiyat: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ED8936",
  },

  bosMetin: {
    fontSize: 15,
    color: "#999",
  },
});
