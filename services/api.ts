import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "@/constants/api";

export const TOKEN_KEY = "jwt_token";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Her isteğe JWT token ekle
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Hata yanıtlarını düzenle
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return Promise.reject(
        new Error(
          "Sunucuya bağlanılamadı. Backend'in çalıştığından ve telefonun bilgisayarla aynı Wi‑Fi'de olduğundan emin olun."
        )
      );
    }

    const mesaj =
      error.response?.data?.mesaj ||
      error.message ||
      "Bir hata oluştu. Lütfen tekrar deneyin.";
    return Promise.reject(new Error(mesaj));
  }
);

export default apiClient;
