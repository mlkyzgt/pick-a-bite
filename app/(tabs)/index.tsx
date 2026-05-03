import { Ionicons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function HomeScreen() {
  const router = useRouter();
  // Kamera izni durumunu tutan state
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Kamera izinlerini kontrol eden veya talep eden fonksiyon
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    const granted = status === "granted";

    setHasPermission(granted);

    if (!granted) {
      Alert.alert(
        "İzin Gerekli",
        "QR kod okutmak için kamera izni vermelisin.",
      );
    }

    return granted;
  };

  // İzin alındıktan sonra kamera ekranına yönlendiren fonksiyon
  const handleOpenCamera = async () => {
    const granted = await requestCameraPermission();

    if (granted) {
      router.push("/camera");
    }
  };

  return (
    <View style={styles.container}>
      {/* Harita */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 40.195,
          longitude: 29.06,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* Örnek restoranın harita üzerindeki konumu */}
        <Marker
          coordinate={{
            latitude: 40.195,
            longitude: 29.06,
          }}
          title="Örnek Restoran"
        />
      </MapView>

      {/* Arama Çubuğu ve Profil Butonu */}
      <View style={styles.searchOverlay}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#666" />

          <TextInput
            placeholder="Restoran ara..."
            placeholderTextColor="#999"
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="person-outline" size={22} color="#319795" />
        </TouchableOpacity>
      </View>

      {/* QR Okutma Butonu ve Etiketi */}
      <View style={styles.bottomCenter}>
        <TouchableOpacity style={styles.qrButton} onPress={handleOpenCamera}>
          <Ionicons name="qr-code-outline" size={32} color="white" />
        </TouchableOpacity>

        <Text style={styles.qrText}>SCAN</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* Harita Stili */
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  /* Arama Çubuğu Stili */
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

  /* QR Buton Stili */
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
});
