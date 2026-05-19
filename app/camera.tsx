import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CameraScreen() {
  const router = useRouter();

  // Cihazın kamera izin durumunu takip eden hook
  const [permission, requestPermission] = useCameraPermissions();

  // Aynı QR kodun üst üste birden fazla kez taranmasını engelleyen durum kontrolü
  const [scanned, setScanned] = useState(false);

  // İzin durumu henüz yüklenmediyse boş bir görünüm render eder
  if (!permission) {
    return <View />;
  }

  // Kamera izni reddedilmişse kullanıcıya izin isteme butonunu içeren bir arayüz gösterir
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 10 }}>Kamera izni gerekli</Text>

        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: "#319795", fontWeight: "bold" }}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // QR kod başarıyla algılandığında tetiklenen veri işleme fonksiyonu
  const handleBarcodeScanned = ({ data }: any) => {
    // Tarama işlemi zaten kilitlendiyse fonksiyonun çalışmasını durdurur
    if (scanned) return;

    // Yeni taramaları durdurmak için kilit durumunu aktif hale getirir
    setScanned(true);

    console.log("QR DATA:", data);

    // QR kodundan okunan veri işlendikten sonra kullanıcıyı bir önceki ekrana döndürür
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Cihaz kamerasını tam ekran olarak açan ve yalnızca QR kod türünü tarayan kamera bileşeni */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Ekranın sol üst köşesinde yer alan, kamera modülünü kapatma butonu */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Ekranın alt kısmında yer alan bilgilendirme ve yeniden tarama arayüzü */}
      <View style={styles.bottomInfo}>
        <Text style={styles.text}>QR kodu çerçeve içine getir</Text>

        {/* Tarama başarıyla sonlandığında tarama kilidini açmak için kullanılan buton */}
        {scanned && (
          <TouchableOpacity
            onPress={() => setScanned(false)}
            style={styles.resetBtn}
          >
            <Text style={{ color: "white" }}>Tekrar Tara</Text>
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

  bottomInfo: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
  },

  text: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
  },

  resetBtn: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#ED8936",
    borderRadius: 20,
  },
});
