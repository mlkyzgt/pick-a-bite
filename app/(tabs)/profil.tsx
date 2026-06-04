import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { ben } from "@/services/auth";
import { getTercihler, putTercihler } from "@/services/restoranlar";
import { DtoKullanici, DtoTercih } from "@/types";

const ALERJENLER = [
  { key: "GLUTEN", etiket: "Gluten" },
  { key: "LAKTOZ", etiket: "Laktoz" },
  { key: "YUMURTA", etiket: "Yumurta" },
  { key: "KURUYEMIS", etiket: "Kuruyemiş" },
  { key: "DENIZ_URUNU", etiket: "Deniz Ürünü" },
  { key: "SOYA", etiket: "Soya" },
];

export default function ProfilEkrani() {
  const { cikisYap } = useAuth();

  const [kullanici, setKullanici] = useState<DtoKullanici | null>(null);
  const [tercihler, setTercihler] = useState<DtoTercih | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediyor, setKaydediyor] = useState(false);

  useEffect(() => {
    async function yukle() {
      try {
        const [kullaniciBilgi, tercihBilgi] = await Promise.all([
          ben(),
          getTercihler(),
        ]);
        setKullanici(kullaniciBilgi);
        setTercihler(tercihBilgi);
      } catch (err: any) {
        Alert.alert("Hata", err.message || "Profil bilgileri yüklenemedi.");
      } finally {
        setYukleniyor(false);
      }
    }
    yukle();
  }, []);

  const tercihGuncelle = (alan: keyof DtoTercih, deger: boolean) => {
    if (!tercihler) return;
    setTercihler({ ...tercihler, [alan]: deger });
  };

  const alerjenToggle = (alerjen: string) => {
    if (!tercihler) return;
    const mevcut = tercihler.alerjenler ?? [];
    const yeni = mevcut.includes(alerjen)
      ? mevcut.filter((a) => a !== alerjen)
      : [...mevcut, alerjen];
    setTercihler({ ...tercihler, alerjenler: yeni });
  };

  const kaydet = async () => {
    if (!tercihler) return;
    setKaydediyor(true);
    try {
      const guncellendi = await putTercihler(tercihler);
      setTercihler(guncellendi);
      Alert.alert("Başarılı", "Tercihleriniz kaydedildi.");
    } catch (err: any) {
      Alert.alert("Hata", err.message || "Tercihler kaydedilemedi.");
    } finally {
      setKaydediyor(false);
    }
  };

  const handleCikis = () => {
    Alert.alert("Çıkış Yap", "Hesabından çıkmak istediğine emin misin?", [
      { text: "İptal", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: () => cikisYap() },
    ]);
  };

  if (yukleniyor) {
    return (
      <View style={styles.merkez}>
        <ActivityIndicator size="large" color="#ED8936" />
      </View>
    );
  }

  if (!kullanici || !tercihler) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.icerik}>
      {/* Profil başlığı */}
      <View style={styles.profilBaslik}>
        <View style={styles.avatar}>
          <Text style={styles.avatarHarf}>
            {kullanici.ad.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.adSoyad}>
          {kullanici.ad} {kullanici.soyad}
        </Text>
        <Text style={styles.email}>{kullanici.email}</Text>
      </View>

      {/* Diyet Tercihleri */}
      <View style={styles.kart}>
        <Text style={styles.kartBaslik}>Diyet Tercihleri</Text>

        {(
          [
            { alan: "vegan", etiket: "Vegan", icon: "leaf-outline" },
            { alan: "vejetaryen", etiket: "Vejetaryen", icon: "nutrition-outline" },
            { alan: "glutensiz", etiket: "Glutensiz", icon: "ban-outline" },
            { alan: "helal", etiket: "Helal", icon: "checkmark-circle-outline" },
            { alan: "laktozsuz", etiket: "Laktozsuz", icon: "water-outline" },
          ] as const
        ).map(({ alan, etiket, icon }) => (
          <View key={alan} style={styles.satirItem}>
            <View style={styles.satirSol}>
              <Ionicons name={icon} size={20} color="#ED8936" />
              <Text style={styles.satirMetin}>{etiket}</Text>
            </View>
            <Switch
              value={tercihler[alan] as boolean}
              onValueChange={(val) => tercihGuncelle(alan, val)}
              trackColor={{ false: "#E0E0E0", true: "#FDD9AC" }}
              thumbColor={tercihler[alan] ? "#ED8936" : "#bbb"}
            />
          </View>
        ))}
      </View>

      {/* Alerjenler */}
      <View style={styles.kart}>
        <Text style={styles.kartBaslik}>Alerjenlerim</Text>
        <View style={styles.alerjenGrid}>
          {ALERJENLER.map(({ key, etiket }) => {
            const secili = (tercihler.alerjenler ?? []).includes(key);
            return (
              <TouchableOpacity
                key={key}
                style={[styles.alerjenChip, secili && styles.alerjenChipSecili]}
                onPress={() => alerjenToggle(key)}
              >
                <Text
                  style={[
                    styles.alerjenChipMetin,
                    secili && styles.alerjenChipMetinSecili,
                  ]}
                >
                  {etiket}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Kaydet butonu */}
      <TouchableOpacity
        style={[styles.kaydetBtn, kaydediyor && styles.btnDisabled]}
        onPress={kaydet}
        disabled={kaydediyor}
      >
        {kaydediyor ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.kaydetBtnMetin}>Tercihleri Kaydet</Text>
        )}
      </TouchableOpacity>

      {/* Çıkış */}
      <TouchableOpacity style={styles.cikisBtn} onPress={handleCikis}>
        <Ionicons name="log-out-outline" size={20} color="#E53E3E" />
        <Text style={styles.cikisBtnMetin}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },

  icerik: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },

  merkez: { flex: 1, justifyContent: "center", alignItems: "center" },

  profilBaslik: {
    alignItems: "center",
    marginBottom: 8,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ED8936",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#ED8936",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },

  avatarHarf: {
    fontSize: 32,
    fontWeight: "800",
    color: "white",
  },

  adSoyad: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  email: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },

  kart: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  kartBaslik: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    marginBottom: 14,
  },

  satirItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },

  satirSol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  satirMetin: {
    fontSize: 15,
    color: "#333",
  },

  alerjenGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  alerjenChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  alerjenChipSecili: {
    backgroundColor: "#FEF3E2",
    borderColor: "#ED8936",
  },

  alerjenChipMetin: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },

  alerjenChipMetinSecili: {
    color: "#ED8936",
  },

  kaydetBtn: {
    backgroundColor: "#ED8936",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#ED8936",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },

  btnDisabled: { opacity: 0.6 },

  kaydetBtnMetin: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  cikisBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E53E3E",
  },

  cikisBtnMetin: {
    color: "#E53E3E",
    fontSize: 15,
    fontWeight: "700",
  },
});
