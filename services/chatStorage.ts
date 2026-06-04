import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OnerilenUrun } from "./types";

export type ChatMessage = {
  id: string;
  text: string;
  sender: "user" | "ai";
  time: string;
  oneriler?: OnerilenUrun[];
};

export type ChatSession = {
  messages: ChatMessage[];
  onerilenUrunIdleri: number[];
};

const SESSION_KEY = "pickabite_chat_session";

export async function loadChatSession(): Promise<ChatSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ChatSession;
  } catch {
    return null;
  }
}

export async function saveChatSession(session: ChatSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearChatSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
