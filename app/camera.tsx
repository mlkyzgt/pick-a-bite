import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getQr } from "@/services/restoranlar";

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 10 }}>Kamera izni gerekli</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: "#ED8936", fontWeight: "bold" }}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || yukleniyor) return;
    setScanned(true);
    setYukleniyor(true);

    try {
      const menu = await getQr(data);
      router.replace(`/menu/${menu.restoran.id}`);
    } catch (err: any) {
      Alert.alert(
        "QR Kodu Tanınamadı",
        err.message || "Bu QR kod sistemde kayıtlı bir restorana ait değil.",
        [{ text: "Tekrar Dene", onPress: () => { setScanned(false); setYukleniyor(false); } }]
      );
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Kapat butonu */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tarama çerçevesi */}
      <View style={styles.cerceve} pointerEvents="none" />

      {/* Alt bilgi */}
      <View style={styles.bottomInfo}>
        {yukleniyor ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <Text style={styles.text}>QR kodu çerçeve içine getir</Text>
        )}

        {scanned && !yukleniyor && (
          <TouchableOpacity
            onPress={() => { setScanned(false); setYukleniyor(false); }}
            style={styles.resetBtn}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>Tekrar Tara</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  topBar: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },

  cerceve: {
    position: "absolute",
    top: "30%",
    alignSelf: "center",
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: "#ED8936",
    borderRadius: 16,
    backgroundColor: "transparent",
  },

  bottomInfo: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
    gap: 12,
  },

  text: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
  },

  resetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#ED8936",
    borderRadius: 20,
  },
});
