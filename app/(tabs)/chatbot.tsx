import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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

// Mesajların veri yapısını tanımlar
type Message = {
  id: string; // Mesajın benzersiz kimliği
  text: string; // Mesaj içeriği
  sender: "user" | "ai"; // Mesajı gönderen taraf
  time: string; // Mesajın gönderilme saati
};

export default function ChatbotScreen() {
  // Kullanıcının input alanına yazdığı metni tutar
  const [inputText, setInputText] = useState("");

  // Sohbet ekranındaki tüm mesajları saklar
  const [messages, setMessages] = useState<Message[]>([]);

  // Kullanıcıya hızlı seçim için gösterilen öneri mesajları
  const suggestions = [
    "100 TL altı sağlıklı öğle yemeği",
    "Yakındaki vegan seçenekler",
    "Düşük kalorili akşam yemeği",
    "Helal restoranlar",
  ];

  // Kullanıcı mesaj gönderdiğinde çalışan fonksiyon
  const handleSendMessage = (textToProcess: string) => {
    // Eğer mesaj boşsa işlem yapılmaz
    if (textToProcess.trim() === "") return;

    // Mesaj gönderildiği anın saat bilgisini oluşturur
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Yeni kullanıcı mesajı oluşturulur
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: textToProcess,
      sender: "user",
      time: currentTime,
    };

    // Yeni mesaj mevcut mesaj listesine eklenir
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    // Mesaj gönderildikten sonra input alanı temizlenir
    setInputText("");
  };

  return (
    // Güvenli ekran alanı
    <SafeAreaView style={styles.container}>
      {/* Klavye açıldığında ekranın düzgün görünmesini sağlar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Üst başlık alanı */}
        <View style={styles.header}>
          {/* Geri dönüş butonu */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={26} color="#1C1C1E" />
          </TouchableOpacity>

          {/* Yapay zeka icon alanı */}
          <View style={styles.headerIconWrapper}>
            <Ionicons name="sparkles" size={20} color="#FFF" />
          </View>

          {/* Başlık ve durum bilgisi */}
          <View>
            <Text style={styles.headerTitle}>Yapay Zeka Asistanı</Text>
            <Text style={styles.headerSubtitle}>Çevrimiçi</Text>
          </View>
        </View>

        {/* Sohbet mesajlarının bulunduğu alan */}
        <ScrollView
          style={styles.chatArea}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Sistem karşılama mesajı */}
          <View style={styles.systemBubble}>
            <Text style={styles.systemText}>
              Merhaba! Ben yapay zeka yemek asistanınım. Ne aradığınızı
              söyleyin, size mükemmel lezzeti bulmanızda yardımcı olayım!
            </Text>

            <Text style={styles.timeText}>10:30</Text>
          </View>

          {/* Eğer sohbet boşsa öneri kartlarını gösterir */}
          {messages.length === 0 && (
            <>
              <Text style={styles.suggestionHeader}>
                Şunları sormayı deneyin:
              </Text>

              <View style={styles.suggestionGrid}>
                {/* Öneri kartlarını liste halinde oluşturur */}
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionCard}
                    // Öneri kartına tıklanınca mesaj olarak gönderir
                    onPress={() => handleSendMessage(item)}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Mesaj listesini ekrana basar */}
          {messages.map((msg) => {
            // Kullanıcı mesajı ise sağ tarafta gösterilir
            if (msg.sender === "user") {
              return (
                <View key={msg.id} style={styles.userBubble}>
                  <Text style={styles.userText}>{msg.text}</Text>
                  <Text style={styles.userTimeText}>{msg.time}</Text>
                </View>
              );
            }

            // Yapay zeka mesajı ise sol tarafta gösterilir
            else {
              return (
                <View key={msg.id} style={styles.systemBubble}>
                  <Text style={styles.systemText}>{msg.text}</Text>
                  <Text style={styles.timeText}>{msg.time}</Text>
                </View>
              );
            }
          })}
        </ScrollView>

        {/* Alt mesaj giriş alanı */}
        <View style={styles.inputContainer}>
          {/* Kullanıcının mesaj yazdığı input alanı */}
          <TextInput
            style={styles.textInput}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor="#A0A0A0"
            value={inputText}
            // Input değiştikçe state güncellenir
            onChangeText={setInputText}
            // Klavyeden gönder tuşuna basılınca mesaj gönderilir
            onSubmitEditing={() => handleSendMessage(inputText)}
          />

          {/* Mesaj gönderme butonu */}
          <TouchableOpacity
            style={styles.sendButton}
            // Butona basılınca mesaj gönderilir
            onPress={() => handleSendMessage(inputText)}
          >
            <Ionicons
              name="send"
              size={18}
              color="#FFF"
              style={{ marginLeft: 3 }}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    zIndex: 10,
  },
  backBtn: { marginRight: 15 },
  headerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#A4A88E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 2,
  },
  headerSubtitle: { fontSize: 13, color: "#8E8E93" },
  chatArea: { flex: 1, paddingHorizontal: 20, paddingTop: 25 },

  systemBubble: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    maxWidth: "85%",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  systemText: {
    color: "#1C1C1E",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 5,
  },
  timeText: { color: "#A0A0A0", fontSize: 11, alignSelf: "flex-start" },

  userBubble: {
    backgroundColor: "#4A978E",
    padding: 16,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    maxWidth: "85%",
    alignSelf: "flex-end",
    marginBottom: 20,
    shadowColor: "#4A978E",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  userText: { color: "#FFFFFF", fontSize: 15, lineHeight: 22, marginBottom: 5 },
  userTimeText: { color: "#D1E8E5", fontSize: 11, alignSelf: "flex-start" },

  suggestionHeader: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 12,
    marginLeft: 4,
  },
  suggestionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  suggestionCard: {
    backgroundColor: "#FFFFFF",
    width: "48%",
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionText: {
    color: "#1C1C1E",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 5,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 12,
    fontSize: 15,
    color: "#1C1C1E",
  },
  sendButton: {
    width: 50,
    height: 50,
    backgroundColor: "#4A978E",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4A978E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});
