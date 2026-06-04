import { Alert } from "react-native";

export type ApiErrorBody = {
  hataKodu?: number;
  mesaj?: string;
};

export class ApiError extends Error {
  status: number;
  body?: ApiErrorBody;

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export function showApiError(error: unknown, fallback = "Bir hata oluştu.") {
  if (error instanceof ApiError) {
    Alert.alert("Hata", error.body?.mesaj || error.message);
    return;
  }
  if (error instanceof Error) {
    Alert.alert("Hata", error.message);
    return;
  }
  Alert.alert("Hata", fallback);
}
