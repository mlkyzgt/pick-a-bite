import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BURSA_MERKEZ, DEFAULT_YARICAP_KM } from "@/constants/location";
import { api } from "@/services/apiClient";
import {
  clearChatSession,
  loadChatSession,
  saveChatSession,
  type ChatMessage,
} from "@/services/chatStorage";
import { showApiError } from "@/services/errors";
import type { OnerilenUrun } from "@/services/types";

function dedupeOneriler(list: OnerilenUrun[]): OnerilenUrun[] {
  const seen = new Set<number>();
  return list.filter((o) => {
    if (seen.has(o.urunId)) return false;
    seen.add(o.urunId);
    return true;
  });
}

export default function ChatbotScreen() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [allOneriler, setAllOneriler] = useState<OnerilenUrun[]>([]);
  const [haricTutUrunIds, setHaricTutUrunIds] = useState<number[]>([]);
  const [sending, setSending] = useState(false);
  const [showSessionChoice, setShowSessionChoice] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const suggestions = [
    "100 TL altı sağlıklı öğle yemeği",
    "Yakındaki vegan seçenekler",
    "Düşük kalorili akşam yemeği",
    "Helal restoranlar",
  ];

  const applySession = useCallback((msgs: ChatMessage[], ids: number[]) => {
    setMessages(msgs);
    setHaricTutUrunIds(ids);
    setAllOneriler(dedupeOneriler(msgs.flatMap((m) => m.oneriler ?? [])));
  }, []);

  const persistSession = useCallback(
    async (msgs: ChatMessage[], ids: number[]) => {
      await saveChatSession({ messages: msgs, onerilenUrunIdleri: ids });
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const saved = await loadChatSession();
        if (!active) return;
        if (saved?.messages?.length) {
          setShowSessionChoice(true);
          setSessionReady(false);
        } else {
          setShowSessionChoice(false);
          setSessionReady(true);
        }
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  const continuePreviousChat = async () => {
    const saved = await loadChatSession();
    if (saved) {
      applySession(saved.messages, saved.onerilenUrunIdleri);
    }
    setShowSessionChoice(false);
    setSessionReady(true);
  };

  const startNewChat = async () => {
    await clearChatSession();
    setMessages([]);
    setAllOneriler([]);
    setHaricTutUrunIds([]);
    setShowSessionChoice(false);
    setSessionReady(true);
  };

  const handleSendMessage = async (textToProcess: string) => {
    if (textToProcess.trim() === "" || sending || !sessionReady) return;

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      text: textToProcess,
      sender: "user",
      time: currentTime,
    };

    const msgsAfterUser = [...messages, newUserMessage];
    setMessages(msgsAfterUser);
    setInputText("");
    setSending(true);

    try {
      let enlem = BURSA_MERKEZ.latitude;
      let boylam = BURSA_MERKEZ.longitude;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        try {
          const loc = await Location.getCurrentPositionAsync({});
          enlem = loc.coords.latitude;
          boylam = loc.coords.longitude;
        } catch {
          // Bursa demo merkezi
        }
      }

      const yanit = await api.chat(
        textToProcess,
        undefined,
        enlem,
        boylam,
        DEFAULT_YARICAP_KM,
        haricTutUrunIds,
      );

      const aiTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      let aiText = yanit.yanitMetni;
      if (yanit.uyariMesaji) {
        aiText += "\n\n⚠ " + yanit.uyariMesaji;
      }

      const yeniOneriler = yanit.onerilenUrunler ?? [];
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: "ai",
        time: aiTime,
        oneriler: yeniOneriler,
      };

      const finalMessages = [...msgsAfterUser, aiMessage];
      const yeniIds = [
        ...haricTutUrunIds,
        ...yeniOneriler.map((o) => o.urunId),
      ].slice(-10);
      const birlesikOneriler = dedupeOneriler([...allOneriler, ...yeniOneriler]);

      setMessages(finalMessages);
      setHaricTutUrunIds(yeniIds);
      setAllOneriler(birlesikOneriler);
      await persistSession(finalMessages, yeniIds);
    } catch (e) {
      showApiError(e);
      setMessages(messages);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={showSessionChoice} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sohbet</Text>
            <Text style={styles.modalSubtitle}>
              Önceki sohbete devam etmek veya yeni bir sohbet başlatmak
              ister misiniz?
            </Text>
            <TouchableOpacity
              style={styles.modalPrimary}
              onPress={continuePreviousChat}
            >
              <Text style={styles.modalPrimaryText}>Önceki sohbete devam et</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSecondary}
              onPress={startNewChat}
            >
              <Text style={styles.modalSecondaryText}>Yeni sohbet başlat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={26} color="#1C1C1E" />
          </TouchableOpacity>
          <View style={styles.headerIconWrapper}>
            <Ionicons name="sparkles" size={20} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Yapay Zeka Asistanı</Text>
            <Text style={styles.headerSubtitle}>Çevrimiçi</Text>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity onPress={startNewChat} style={styles.newChatBtn}>
              <Ionicons name="add-circle-outline" size={26} color="#4A978E" />
            </TouchableOpacity>
          )}
        </View>

        {allOneriler.length > 0 && (
          <View style={styles.recoPanel}>
            <Text style={styles.recoTitle}>
              Önerilen yemekler ({allOneriler.length})
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recoScroll}
            >
              {allOneriler.map((o) => (
                <View key={o.urunId} style={styles.recoCard}>
                  <Text style={styles.recoName} numberOfLines={2}>
                    {o.urunAdi}
                  </Text>
                  <Text style={styles.recoRestoran} numberOfLines={1}>
                    {o.restoranAdi}
                  </Text>
                  <Text style={styles.recoFiyat}>{o.fiyat} TL</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <ScrollView
          style={styles.chatArea}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && sessionReady && (
            <View style={styles.systemBubble}>
              <Text style={styles.systemText}>
                Merhaba! Ne aradığınızı söyleyin; her yeni soruda önceki
                önerileriniz kaybolmaz, yeni seçenekler eklenir.
              </Text>
            </View>
          )}

          {messages.length === 0 && sessionReady && (
            <>
              <Text style={styles.suggestionHeader}>Şunları sormayı deneyin:</Text>
              <View style={styles.suggestionGrid}>
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionCard}
                    onPress={() => handleSendMessage(item)}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {messages.map((msg) =>
            msg.sender === "user" ? (
              <View key={msg.id} style={styles.userBubble}>
                <Text style={styles.userText}>{msg.text}</Text>
                <Text style={styles.userTimeText}>{msg.time}</Text>
              </View>
            ) : (
              <View key={msg.id}>
                <View style={styles.systemBubble}>
                  <Text style={styles.systemText}>{msg.text}</Text>
                  <Text style={styles.timeText}>{msg.time}</Text>
                </View>
                {msg.oneriler && msg.oneriler.length > 0 && (
                  <Text style={styles.msgRecoLabel}>Bu yanıttaki öneriler:</Text>
                )}
                {msg.oneriler?.map((o) => (
                  <View key={`${msg.id}-${o.urunId}`} style={styles.inlineReco}>
                    <Text style={styles.inlineRecoText}>
                      • {o.urunAdi} — {o.restoranAdi} ({o.fiyat} TL)
                    </Text>
                  </View>
                ))}
              </View>
            ),
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor="#A0A0A0"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSendMessage(inputText)}
            editable={sessionReady && !showSessionChoice}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => handleSendMessage(inputText)}
            disabled={sending || !sessionReady || showSessionChoice}
          >
            {sending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Ionicons
                name="send"
                size={18}
                color="#FFF"
                style={{ marginLeft: 3 }}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1C1C1E", marginBottom: 8 },
  modalSubtitle: { fontSize: 15, color: "#666", lineHeight: 22, marginBottom: 20 },
  modalPrimary: {
    backgroundColor: "#4A978E",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  modalPrimaryText: { color: "#FFF", fontWeight: "600", fontSize: 16 },
  modalSecondary: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4A978E",
  },
  modalSecondaryText: { color: "#4A978E", fontWeight: "600", fontSize: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 3,
    zIndex: 10,
  },
  backBtn: { marginRight: 15 },
  newChatBtn: { marginLeft: 8 },
  headerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#A4A88E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1C1C1E", marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: "#8E8E93" },
  recoPanel: {
    backgroundColor: "#FFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  recoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4A978E",
    marginLeft: 20,
    marginBottom: 8,
  },
  recoScroll: { paddingHorizontal: 16, gap: 10 },
  recoCard: {
    width: 140,
    backgroundColor: "#F5FAF9",
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#D8EDE9",
  },
  recoName: { fontSize: 14, fontWeight: "600", color: "#1C1C1E", marginBottom: 4 },
  recoRestoran: { fontSize: 11, color: "#666", marginBottom: 6 },
  recoFiyat: { fontSize: 13, fontWeight: "700", color: "#4A978E" },
  chatArea: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  systemBubble: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    maxWidth: "85%",
    marginBottom: 16,
    elevation: 2,
  },
  systemText: { color: "#1C1C1E", fontSize: 15, lineHeight: 22 },
  timeText: { color: "#A0A0A0", fontSize: 11, marginTop: 6 },
  userBubble: {
    backgroundColor: "#4A978E",
    padding: 16,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    maxWidth: "85%",
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  userText: { color: "#FFFFFF", fontSize: 15, lineHeight: 22 },
  userTimeText: { color: "#D1E8E5", fontSize: 11, marginTop: 6 },
  msgRecoLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 6,
    marginLeft: 4,
  },
  inlineReco: { marginBottom: 8, marginLeft: 8 },
  inlineRecoText: { fontSize: 13, color: "#4A978E", lineHeight: 18 },
  suggestionHeader: { fontSize: 14, color: "#8E8E93", marginBottom: 12, marginLeft: 4 },
  suggestionGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  suggestionCard: {
    backgroundColor: "#FFFFFF",
    width: "48%",
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
  },
  suggestionText: { color: "#1C1C1E", fontSize: 14, fontWeight: "500", lineHeight: 20 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  },
});
