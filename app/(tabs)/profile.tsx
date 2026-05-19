import { Ionicons } from "@expo/vector-icons"; // Sayfa içerisindeki ikonları kullanmak için import edildi
import { router } from "expo-router"; // Sayfalar arası geçiş işlemleri için kullanıldı
import React, { useState } from "react"; // State yönetimi için useState hook'u kullanıldı
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/Colors"; // Projede kullanılan ortak renkler import edildi

export default function ProfileScreen() {
  // Vegan tercihini tutan state
  const [isVegan, setIsVegan] = useState(false);

  // Glutensiz tercihini tutan state
  const [isGlutenFree, setIsGlutenFree] = useState(false);

  // Laktozsuz tercihini tutan state
  const [isLactoseFree, setIsLactoseFree] = useState(false);

  // Fıstık alerjisi bilgisini tutan state
  const [hasPeanutAllergy, setHasPeanutAllergy] = useState(false);

  // Helal beslenme tercihini tutan state
  const [isHalal, setIsHalal] = useState(false);

  // Kullanıcı tercih kartlarını tekrar tekrar yazmamak için oluşturulan component
  const PreferenceItem = ({ title, subtitle, value, onValueChange }: any) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceTextContainer}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceSubtitle}>{subtitle}</Text>
      </View>

      {/* Kullanıcının tercihlerini açıp kapatmasını sağlayan switch */}
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D1D1D6", true: Colors.primary }}
        thumbColor={Colors.white}
        ios_backgroundColor="#D1D1D6"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Sayfanın üst başlık alanı */}
      <View style={styles.header}>
        {/* Önceki sayfaya dönmek için kullanılan geri butonu */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profil ve Tercihler</Text>
      </View>

      {/* Sayfa içeriğinin kaydırılabilir olmasını sağlar */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Kullanıcının profil bilgilerinin gösterildiği kart */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfoWrapper}>
            {/* Kullanıcı avatar alanı */}
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={30} color={Colors.white} />
            </View>

            {/* Kullanıcı adı ve e-posta bilgisi */}
            <View>
              <Text style={styles.name}>Sarah Johnson</Text>
              <Text style={styles.email}>sarah.j@email.com</Text>
            </View>
          </View>

          {/* Profil düzenleme butonu */}
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Kullanıcının beslenme tercihlerini seçtiği alan */}
        <View style={styles.preferencesCard}>
          <Text style={styles.cardTitle}>Beslenme Tercihleri</Text>

          <Text style={styles.cardDesc}>
            Yemek önerilerini kişiselleştirmemize yardımcı olun
          </Text>

          {/* Vegan tercih kartı */}
          <PreferenceItem
            title="Vegan"
            subtitle="Sadece bitkisel"
            value={isVegan}
            onValueChange={setIsVegan}
          />

          {/* Glutensiz tercih kartı */}
          <PreferenceItem
            title="Glutensiz"
            subtitle="Buğday, arpa veya çavdar yok"
            value={isGlutenFree}
            onValueChange={setIsGlutenFree}
          />

          {/* Laktozsuz tercih kartı */}
          <PreferenceItem
            title="Laktoz İntoleransı"
            subtitle="Süt ürünleri içermeyen seçenekler"
            value={isLactoseFree}
            onValueChange={setIsLactoseFree}
          />

          {/* Fıstık alerjisi tercih kartı */}
          <PreferenceItem
            title="Fıstık Alerjisi"
            subtitle="Fıstık ve sert kabuklu yemişlerden kaçının"
            value={hasPeanutAllergy}
            onValueChange={setHasPeanutAllergy}
          />

          {/* Helal tercih kartı */}
          <PreferenceItem
            title="Helal"
            subtitle="Sadece helal sertifikalı"
            value={isHalal}
            onValueChange={setIsHalal}
          />
        </View>

        {/* Kullanıcının yaptığı tercihleri kaydetmesini sağlayan buton */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => router.replace("./(tabs)/index")}
        >
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>

        {/* Kullanıcının uygulamadan çıkış yapmasını sağlayan buton */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            router.replace("/auth/login");
          }}
        >
          <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },

  backButton: {
    marginRight: 15,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textDark,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  profileInfoWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  name: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textDark,
    marginBottom: 2,
  },

  email: {
    fontSize: 14,
    color: Colors.textLight,
  },

  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F7F6",
    justifyContent: "center",
    alignItems: "center",
  },

  preferencesCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textDark,
  },

  cardDesc: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 25,
    marginTop: 5,
    lineHeight: 20,
  },

  preferenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 15,
    paddingVertical: 18,
    borderRadius: 15,
    marginBottom: 12,
  },

  preferenceTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  preferenceTitle: {
    fontSize: 15,
    color: Colors.textDark,
    fontWeight: "500",
    marginBottom: 3,
  },

  preferenceSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
  },

  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 15,
  },

  saveButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 16,
  },

  logoutButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FF3B30",
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
  },

  logoutButtonText: {
    color: "#FF3B30",
    fontWeight: "600",
    fontSize: 16,
  },
});
