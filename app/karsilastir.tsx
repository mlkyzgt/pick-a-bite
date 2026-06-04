import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../constants/Colors";
import { api } from "../services/apiClient";
import { showApiError } from "../services/errors";
import type { KarsilastirmaYanit } from "../services/types";

export default function KarsilastirScreen() {
  const [mesaj, setMesaj] = useState("300 TL altında sağlıklı yemek öner");
  const [loading, setLoading] = useState(false);
  const [sonuc, setSonuc] = useState<KarsilastirmaYanit | null>(null);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setCoords({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    })();
  }, []);

  const handleKarsilastir = async () => {
    if (!coords) {
      showApiError(new Error("Konum alınamadı."), "Konum izni gerekli.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.karsilastirMesaj(
        mesaj,
        coords.latitude,
        coords.longitude,
      );
      setSonuc(res);
    } catch (e) {
      showApiError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>Restoran Karşılaştır</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          style={styles.input}
          value={mesaj}
          onChangeText={setMesaj}
          placeholder="Örn: 300 TL altında sağlıklı yemek"
          multiline
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleKarsilastir}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Karşılaştır</Text>
          )}
        </TouchableOpacity>

        {sonuc?.mesaj && <Text style={styles.info}>{sonuc.mesaj}</Text>}

        {sonuc?.sonuclar.map((item, idx) => (
          <View key={`${item.urunId}-${idx}`} style={styles.card}>
            <Text style={styles.restoran}>{item.restoranAdi}</Text>
            <Text style={styles.urun}>{item.urunAdi}</Text>
            <Text style={styles.meta}>
              {item.fiyat} TL
              {item.mesafeKm != null ? ` · ${item.mesafeKm.toFixed(1)} km` : ""}
              {item.uygunluk ? ` · ${item.uygunluk}` : ""}
            </Text>
          </View>
        ))}

        {sonuc?.bilgilendirmeNotu && (
          <Text style={styles.disclaimer}>{sonuc.bilgilendirmeNotu}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  title: { fontSize: 18, fontWeight: "700", color: Colors.textDark },
  content: { padding: 16, paddingBottom: 40 },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    minHeight: 80,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: { color: Colors.white, fontWeight: "700" },
  info: { color: Colors.textLight, marginBottom: 12 },
  card: {
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  restoran: { fontWeight: "700", color: Colors.textDark },
  urun: { marginTop: 4, color: Colors.textDark },
  meta: { marginTop: 6, color: Colors.textLight, fontSize: 13 },
  disclaimer: { marginTop: 16, fontSize: 11, color: Colors.textLight },
});
