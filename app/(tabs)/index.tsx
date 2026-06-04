import { Ionicons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useAuth } from "@/context/AuthContext";
import { getListe, getYakin } from "@/services/restoranlar";
import { DtoRestoran } from "@/types";

const VARSAYILAN_BOLGE: Region = {
  latitude: 40.195,
  longitude: 29.06,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function HomeScreen() {
  const router = useRouter();
  const { cikisYap } = useAuth();
  const mapRef = useRef<MapView>(null);

  const [restoranlar, setRestoranlar] = useState<DtoRestoran[]>([]);
  const [aramaMetni, setAramaMetni] = useState("");
  const [bolge, setBolge] = useState<Region>(VARSAYILAN_BOLGE);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [konum, setKonum] = useState<{ enlem: number; boylam: number } | null>(null);

  const restoranlarıYukle = useCallback(
    async (enlem?: number, boylam?: number) => {
      try {
        const liste =
          enlem !== undefined && boylam !== undefined
            ? await getYakin(enlem, boylam)
            : await getListe();
        setRestoranlar(liste);
      } catch {
        // Yakındaki restoranlar alınamazsa tüm listeyi çek
        try {
          const liste = await getListe();
          setRestoranlar(liste);
        } catch {
          Alert.alert("Hata", "Restoranlar yüklenemedi. Sunucu bağlantısını kontrol edin.");
        }
      }
    },
    []
  );

  useEffect(() => {
    async function konumAl() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const lokasyon = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = lokasyon.coords;
        setKonum({ enlem: latitude, boylam: longitude });
        const yeniBolge: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setBolge(yeniBolge);
        mapRef.current?.animateToRegion(yeniBolge, 800);
        await restoranlarıYukle(latitude, longitude);
      } else {
        await restoranlarıYukle();
      }
      setYukleniyor(false);
    }
    konumAl();
  }, [restoranlarıYukle]);

  const handleOpenCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") {
      router.push("/camera");
    } else {
      Alert.alert("İzin Gerekli", "QR kod okutmak için kamera izni vermelisin.");
    }
  };

  const filtrelenmisRestoranlar = restoranlar.filter((r) =>
    r.restoranAdi.toLowerCase().includes(aramaMetni.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Harita */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={bolge}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {filtrelenmisRestoranlar.map((restoran) => (
          <Marker
            key={restoran.id}
            coordinate={{ latitude: restoran.enlem, longitude: restoran.boylam }}
            title={restoran.restoranAdi}
            description={restoran.adres ?? undefined}
            pinColor="#ED8936"
            onCalloutPress={() => router.push(`/menu/${restoran.id}`)}
          />
        ))}
      </MapView>

      {/* Yükleniyor göstergesi */}
      {yukleniyor && (
        <View style={styles.yukleniyor}>
          <ActivityIndicator size="large" color="#ED8936" />
        </View>
      )}

      {/* Arama Çubuğu ve Profil Butonu */}
      <View style={styles.searchOverlay}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            placeholder="Restoran ara..."
            placeholderTextColor="#999"
            style={styles.input}
            value={aramaMetni}
            onChangeText={setAramaMetni}
          />
          {aramaMetni.length > 0 && (
            <TouchableOpacity onPress={() => setAramaMetni("")}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push("/(tabs)/profil")}
        >
          <Ionicons name="person-outline" size={22} color="#319795" />
        </TouchableOpacity>
      </View>

      {/* Restoran sayısı */}
      {!yukleniyor && (
        <View style={styles.sayacBadge}>
          <Text style={styles.sayacText}>
            {filtrelenmisRestoranlar.length} restoran
          </Text>
        </View>
      )}

      {/* QR Okutma Butonu */}
      <View style={styles.bottomCenter}>
        <TouchableOpacity style={styles.qrButton} onPress={handleOpenCamera}>
          <Ionicons name="qr-code-outline" size={32} color="white" />
        </TouchableOpacity>
        <Text style={styles.qrText}>SCAN</Text>
      </View>

      {/* Konuma dön butonu */}
      {konum && (
        <TouchableOpacity
          style={styles.konumBtn}
          onPress={() => {
            const yeniBolge: Region = {
              latitude: konum.enlem,
              longitude: konum.boylam,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            };
            mapRef.current?.animateToRegion(yeniBolge, 500);
          }}
        >
          <Ionicons name="navigate" size={22} color="#319795" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  yukleniyor: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    zIndex: 10,
  },

  searchOverlay: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#222",
  },

  profileBtn: {
    marginLeft: 10,
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  sayacBadge: {
    position: "absolute",
    top: 110,
    alignSelf: "center",
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  sayacText: {
    fontSize: 12,
    color: "#555",
    fontWeight: "600",
  },

  bottomCenter: {
    position: "absolute",
    bottom: 35,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  qrButton: {
    backgroundColor: "#ED8936",
    width: 75,
    height: 75,
    borderRadius: 37.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  qrText: {
    marginTop: 8,
    fontSize: 14,
    color: "#333",
    fontWeight: "800",
  },

  konumBtn: {
    position: "absolute",
    bottom: 140,
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
});
