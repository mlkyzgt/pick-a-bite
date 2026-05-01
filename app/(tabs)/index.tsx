import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { Camera } from "expo-camera";

const HomeScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    const granted = status === "granted";

    setHasPermission(granted);

    if (!granted) {
      Alert.alert(
        "İzin Gerekli",
        "QR kod okutmak için kameraya izin vermelisin.",
      );
    }

    return granted;
  };

  const handleOpenCamera = async () => {
    const granted = await requestCameraPermission();

    if (granted) {
      console.log("Kamera açılabilir");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />

          <TextInput
            placeholder="Restoran ara..."
            placeholderTextColor="#999"
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-outline" size={22} color="#319795" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 40.195,
            longitude: 29.06,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Marker
            coordinate={{
              latitude: 40.195,
              longitude: 29.06,
            }}
            title="Örnek Restoran"
            description="Lezzetli yemekler burada"
          />
        </MapView>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.qrButton} onPress={handleOpenCamera}>
          <Ionicons name="camera-outline" size={30} color="white" />
        </TouchableOpacity>

        <Text style={styles.qrText}>QR Kod Okut</Text>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF9F0",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 50,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
    marginRight: 10,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },

  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },

  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },

  /* HARİTA */
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 20,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  map: {
    width: "100%",
    height: "100%",
  },

  /* ALT QR */
  bottomContainer: {
    alignItems: "center",
    marginBottom: 25,
  },

  qrButton: {
    backgroundColor: "#ED8936",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  qrText: {
    marginTop: 8,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
});
