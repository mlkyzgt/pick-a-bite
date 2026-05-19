import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/Colors"; // Uygulama genelinde kullanılan renk sabitleri

export default function RestaurantDetailsScreen() {
  // Harita ekranından yönlendirilen restoranın adını parametre olarak alır
  const { name } = useLocalSearchParams();

  // Güvenlik Kontrolü: Eğer restoran ismi parametresi boş veya tanımsız gelirse hata ekranı gösterilir
  if (!name) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={50}
          color={Colors.textLight}
        />
        <Text style={styles.errorText}>Restoran bilgisi yüklenemedi.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.errorButton}
        >
          <Text style={styles.errorButtonText}>Haritaya Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Menü öğelerini dinamik olarak oluşturmak için kullanılan alt kart bileşeni
  const MenuItem = ({ title, desc, price, cal, icon }: any) => (
    <View style={styles.menuCard}>
      {/* Yemek görselini veya emojisini barındıran alan */}
      <View style={styles.imagePlaceholder}>
        <Text style={{ fontSize: 32 }}>{icon}</Text>
      </View>

      {/* Yemek adı, açıklaması, fiyatı ve kalori bilgisini içeren metin alanı */}
      <View style={styles.menuInfo}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuDesc}>{desc}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{price} ₺</Text>
          <Text style={styles.cal}>{cal} kal</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Başlık Alanı.
        Restoran adı, puan, mesafe bilgileri ve kategori sekmelerini içerir.
      */}
      <View style={styles.headerWrapper}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={28} color={Colors.textDark} />
          </TouchableOpacity>

          {/* Restoranın adı ve puan, mesafe, süre gibi özet bilgileri */}
          <View>
            <Text style={styles.headerTitle}>{name}</Text>
            <View style={styles.headerSubtitleRow}>
              <Ionicons name="star" size={14} color="#E59A54" />
              <Text style={styles.headerSubtitle}> 4.8 </Text>
              <Ionicons
                name="location-outline"
                size={14}
                color={Colors.textLight}
              />
              <Text style={styles.headerSubtitle}> 500 m </Text>
              <Ionicons
                name="time-outline"
                size={14}
                color={Colors.textLight}
              />
              <Text style={styles.headerSubtitle}> 15-20 dk</Text>
            </View>
          </View>
        </View>

        {/* Menü kategorileri arasında geçiş yapılmasını sağlayan sekmeler */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.activeTab}>
            <Text style={styles.activeTabText}>Ana Yemekler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inactiveTab}>
            <Text style={styles.inactiveTabText}>İçecekler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inactiveTab}>
            <Text style={styles.inactiveTabText}>Tatlılar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menü Listesi.
        Restorana ait yemek kartlarının dikeyde kaydırılabilir şekilde listelenmesini sağlar.
      */}
      <ScrollView
        contentContainerStyle={styles.menuList}
        showsVerticalScrollIndicator={false}
      >
        <MenuItem
          title="Kinoa Kasesi"
          desc="Karışık yeşillikler, közlenmiş sebzeler, tahin sosu"
          price="295"
          cal="420"
          icon="🥗"
        />
        <MenuItem
          title="Izgara Somon Tabağı"
          desc="Doğal somon, kinoa, mevsim sebzeleri"
          price="385"
          cal="580"
          icon="🐟"
        />
        <MenuItem
          title="Akdeniz Dürümü"
          desc="Humus, falafel, taze sebzeler, cacık"
          price="255"
          cal="390"
          icon="🌯"
        />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(tabs)/chatbot")}
      >
        <Ionicons name="chatbubble-outline" size={24} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textDark,
    fontWeight: "500",
  },
  errorButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  errorButtonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 15,
  },
  headerWrapper: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 20,
    paddingBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.textDark,
    marginBottom: 4,
  },
  headerSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  activeTab: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  activeTabText: {
    color: Colors.white,
    fontWeight: "600",
  },
  inactiveTab: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  inactiveTabText: {
    color: Colors.textLight,
    fontWeight: "500",
  },
  menuList: {
    padding: 20,
    paddingBottom: 100,
  },
  menuCard: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  imagePlaceholder: {
    width: 75,
    height: 75,
    backgroundColor: "#F3F4F6",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textDark,
  },
  menuDesc: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 5,
    marginBottom: 10,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
    marginRight: 10,
  },
  cal: {
    fontSize: 13,
    color: Colors.textLight,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#A4A88E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});
