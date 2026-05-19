import { router } from "expo-router"; // Sayfalar arasında geçiş yapmak için kullanıldı
import React, { useState } from "react"; // State yönetimi için useState hook'u kullanıldı
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  // Kullanıcının girdiği e-posta bilgisini tutan state
  const [email, setEmail] = useState("");

  // Kullanıcının girdiği şifre bilgisini tutan state
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      {/* Klavye açıldığında inputların yukarı kaymasını sağlar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Sayfa içeriğinin kaydırılabilir olmasını sağlar */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo ve uygulama başlığı alanı */}
          <View style={styles.header}>
            {/* Uygulama logosunu barındıran alan */}
            <View style={styles.logoBox}>
              <Image
                source={require("../../assets/images/pick_a_bite_logo.png")} // Assets klasöründeki logo dosyası bağlandı
                style={styles.logoImage}
                resizeMode="contain" // Logonun kutu içerisine oran korunarak sığdırılması sağlandı
              />
            </View>

            {/* Uygulama adı */}
            <Text style={styles.title}>Pick a Bite</Text>

            {/* Uygulama açıklaması */}
            <Text style={styles.subtitle}>Yapay zeka destekli yemek keşfi</Text>
          </View>

          {/* Giriş form kartı */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Giriş Yap</Text>

            {/* E-posta giriş alanı */}
            <Text style={styles.label}>E-posta</Text>

            <TextInput
              style={styles.input}
              placeholder="email@ornek.com"
              placeholderTextColor="#A0A0A0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            {/* Şifre giriş alanı */}
            <Text style={styles.label}>Şifre</Text>

            <TextInput
              style={styles.input}
              placeholder="Şifrenizi girin"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Kullanıcıyı ana sayfaya yönlendiren giriş butonu */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace("./(tabs)/index")}
            >
              <Text style={styles.primaryButtonText}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>

          {/* Hesabı olmayan kullanıcılar için kayıt olma alanı */}
          <View style={styles.bottomCard}>
            <Text style={styles.bottomText}>Henüz hesabınız yok mu?</Text>

            {/* Kayıt ekranına yönlendiren buton */}
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => router.replace("/auth/register")}
            >
              <Text style={styles.outlineButtonText}>Hesap Oluştur</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFBF7",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    flexGrow: 1,
    justifyContent: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 35,
  },

  logoBox: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  logoImage: {
    width: "75%",
    height: "75%",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: "#666666",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 24,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 25,
  },

  label: {
    fontSize: 13,
    color: "#555555",
    marginBottom: 8,
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
    fontSize: 15,
    color: "#1C1C1E",
  },

  primaryButton: {
    backgroundColor: "#4A978E",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 5,
    shadowColor: "#4A978E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  bottomCard: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
  },

  bottomText: {
    color: "#666666",
    fontSize: 14,
    marginBottom: 15,
  },

  outlineButton: {
    borderWidth: 1.5,
    borderColor: "#4A978E",
    paddingVertical: 16,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
  },

  outlineButtonText: {
    color: "#4A978E",
    fontWeight: "bold",
    fontSize: 16,
  },
});
