import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function KayitEkrani() {
  const router = useRouter();
  const { kayitOl } = useAuth();

  const [ad, setAd] = useState("");
  const [soyad, setSoyad] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [sifreGorünür, setSifreGorünür] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleKayit = async () => {
    if (!ad.trim() || !soyad.trim() || !email.trim() || !sifre.trim()) {
      Alert.alert("Hata", "Tüm alanlar zorunludur.");
      return;
    }
    if (sifre.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setYukleniyor(true);
    try {
      await kayitOl({ ad: ad.trim(), soyad: soyad.trim(), email: email.trim(), sifre });
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Kayıt Başarısız", err.message);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.logo}>🍽</Text>
          <Text style={styles.baslik}>Pick a Bite</Text>
          <Text style={styles.altBaslik}>Yeni hesap oluştur</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.satir}>
            <View style={[styles.inputGroup, styles.yariGenislik]}>
              <Ionicons name="person-outline" size={18} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ad"
                placeholderTextColor="#999"
                autoCapitalize="words"
                value={ad}
                onChangeText={setAd}
              />
            </View>

            <View style={[styles.inputGroup, styles.yariGenislik]}>
              <TextInput
                style={styles.input}
                placeholder="Soyad"
                placeholderTextColor="#999"
                autoCapitalize="words"
                value={soyad}
                onChangeText={setSoyad}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E-posta"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.sifreInput]}
              placeholder="Şifre (en az 6 karakter)"
              placeholderTextColor="#999"
              secureTextEntry={!sifreGorünür}
              value={sifre}
              onChangeText={setSifre}
            />
            <TouchableOpacity onPress={() => setSifreGorünür(!sifreGorünür)}>
              <Ionicons
                name={sifreGorünür ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, yukleniyor && styles.buttonDisabled]}
            onPress={handleKayit}
            disabled={yukleniyor}
          >
            {yukleniyor ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Giriş yönlendirme */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.link}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#fff" },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },

  header: {
    alignItems: "center",
    marginBottom: 36,
  },

  logo: {
    fontSize: 52,
    marginBottom: 8,
  },

  baslik: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ED8936",
    letterSpacing: 0.5,
  },

  altBaslik: {
    marginTop: 6,
    fontSize: 15,
    color: "#666",
  },

  form: {
    gap: 14,
  },

  satir: {
    flexDirection: "row",
    gap: 12,
  },

  yariGenislik: {
    flex: 1,
  },

  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#EBEBEB",
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#222",
  },

  sifreInput: {
    flex: 1,
  },

  button: {
    backgroundColor: "#ED8936",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#ED8936",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },

  footerText: {
    color: "#666",
    fontSize: 14,
  },

  link: {
    color: "#ED8936",
    fontWeight: "700",
    fontSize: 14,
  },
});
