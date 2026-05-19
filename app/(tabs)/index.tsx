import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Colors from "../../constants/Colors";

/*
  Restoran verilerini tutan örnek dizi.
  Gerçek backend bağlantısı yerine demo amaçlı kullanılıyor.
*/
const restaurantData = [
  {
    id: 1,
    name: "Yeşil Kase Bademli",
    latitude: 40.2655,
    longitude: 28.9555,
  },
  {
    id: 2,
    name: "Pick A Bite Burger",
    latitude: 40.267,
    longitude: 28.958,
  },
  {
    id: 3,
    name: "Bademli Organik Mutfak",
    latitude: 40.264,
    longitude: 28.953,
  },
  {
    id: 4,
    name: "Glutensiz Fırın & Kafe",
    latitude: 40.2685,
    longitude: 28.9575,
  },
  {
    id: 5,
    name: "Retro Pizza",
    latitude: 40.266,
    longitude: 28.959,
  },
  {
    id: 6,
    name: "Mudanya Yolu Kebapçısı",
    latitude: 40.2635,
    longitude: 28.9565,
  },
  {
    id: 7,
    name: "Vegan Durağı",
    latitude: 40.269,
    longitude: 28.954,
  },
  {
    id: 8,
    name: "Fit & Fresh Bowl",
    latitude: 40.265,
    longitude: 28.961,
  },
];

export default function MapScreen() {
  /*
    Kullanıcının mevcut konum bilgisini tutar.
  */
  const [location, setLocation] = useState<any>(null);

  /*
    Arama kutusuna yazılan metni tutar.
  */
  const [searchText, setSearchText] = useState("");

  /*
    Haritada gösterilecek restoran listesini tutar.
  */
  const [restaurants, setRestaurants] = useState(restaurantData);

  /*
    Sayfa açıldığında otomatik olarak konum izni ister.
  */
  useEffect(() => {
    getLocationPermission();
  }, []);

  /*
    Kullanıcıdan konum izni alır.
    İzin verilirse mevcut konumu state içerisine kaydeder.
  */
  const getLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    /*
      Kullanıcı konum iznini reddederse uyarı gösterilir.
    */
    if (status !== "granted") {
      Alert.alert(
        "Konum İzni Gerekli",
        "Yakındaki restoranları görmek için konum izni vermelisiniz.",
      );
      return;
    }

    /*
      Kullanıcının güncel konumu alınır.
    */
    const currentLocation = await Location.getCurrentPositionAsync({});

    /*
      Alınan konum bilgisi state içerisine aktarılır.
    */
    setLocation(currentLocation.coords);
  };

  /*
    Restoran arama işlemini gerçekleştirir.
    Kullanıcının yazdığı metne göre restoranları filtreler.
  */
  const handleSearch = (text: string) => {
    setSearchText(text);

    /*
      Büyük-küçük harf duyarsız filtreleme yapılır.
    */
    const filteredRestaurants = restaurantData.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(text.toLowerCase()),
    );

    /*
      Filtrelenen restoran listesi güncellenir.
    */
    setRestaurants(filteredRestaurants);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        /*
          Kullanıcının mevcut konumunu haritada gösterir.
        */
        showsUserLocation={true}
        /*
          Varsayılan konum butonunu gizler.
        */
        showsMyLocationButton={false}
        /*
          Eğer kullanıcı konumu alınmışsa harita o konuma odaklanır.
          Aksi durumda varsayılan olarak Bademli koordinatları gösterilir.
        */
        region={
          location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }
            : {
                latitude: 40.2665,
                longitude: 28.9565,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }
        }
      >
        {/*
          Restoran listesindeki tüm restoranları marker olarak haritaya ekler.
        */}
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={{
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            }}
            title={restaurant.name}
            pinColor={Colors.primary}
            /*
              Marker'a tıklandığında restoran detay sayfasına yönlendirme yapar.
            */
            onPress={() =>
              router.push({
                pathname: "/restaurant/details",
                params: { name: restaurant.name },
              })
            }
          />
        ))}
      </MapView>

      {/*
        Üst bölüm:
        Arama kutusu ve profil butonu bulunur.
      */}
      <View style={styles.topContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Restoran ara..."
            placeholderTextColor="#888"
            value={searchText}
            /*
              Kullanıcı yazdıkça filtreleme işlemi çalışır.
            */
            onChangeText={handleSearch}
          />
        </View>

        {/*
          Profil ekranına geçiş yapan buton.
        */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Ionicons name="person-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/*
        Alt bölüm:
        QR tarama ve chatbot butonları bulunur.
      */}
      <View style={styles.bottomContainer}>
        <View style={styles.qrContainer}>
          {/*
            QR kod tarama ekranına yönlendirir.
          */}
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => router.push("/camera")}
          >
            <Ionicons name="qr-code-outline" size={32} color={Colors.primary} />
          </TouchableOpacity>

          <Text style={styles.scanText}>Menü Tara</Text>
        </View>

        {/*
          Yapay zeka chatbot ekranına yönlendirir.
        */}
        <TouchableOpacity
          style={styles.chatbotButton}
          onPress={() => router.push("/(tabs)/chatbot")}
        >
          <Ionicons name="sparkles" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  map: {
    width: "100%",
    height: "100%",
  },

  topContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
  },

  profileButton: {
    width: 50,
    height: 50,
    backgroundColor: Colors.white,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },

  bottomContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },

  qrContainer: {
    alignItems: "center",
    flex: 1,
    marginLeft: 60,
  },

  scanButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  scanText: {
    color: "#888",
    fontSize: 12,
    fontWeight: "500",
  },

  chatbotButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#A4A88E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});
