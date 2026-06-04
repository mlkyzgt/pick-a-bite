import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { giris as apiGiris, kayit as apiKayit } from "@/services/auth";
import { TOKEN_KEY } from "@/services/api";
import { DtoGiris, DtoKayit, DtoKullanici } from "@/types";

interface AuthContextType {
  kullanici: DtoKullanici | null;
  token: string | null;
  yukleniyor: boolean;
  girisYap: (istek: DtoGiris) => Promise<void>;
  kayitOl: (istek: DtoKayit) => Promise<void>;
  cikisYap: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [kullanici, setKullanici] = useState<DtoKullanici | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    async function tokenYukle() {
      try {
        const kaydedilmisToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (kaydedilmisToken) {
          setToken(kaydedilmisToken);
        }
      } catch {
        // SecureStore hata verirse sessizce devam et
      } finally {
        setYukleniyor(false);
      }
    }
    tokenYukle();
  }, []);

  const girisYap = useCallback(async (istek: DtoGiris) => {
    const yanit = await apiGiris(istek);
    await SecureStore.setItemAsync(TOKEN_KEY, yanit.token);
    setToken(yanit.token);
    setKullanici(yanit.kullanici);
  }, []);

  const kayitOl = useCallback(async (istek: DtoKayit) => {
    const yanit = await apiKayit(istek);
    await SecureStore.setItemAsync(TOKEN_KEY, yanit.token);
    setToken(yanit.token);
    setKullanici(yanit.kullanici);
  }, []);

  const cikisYap = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setKullanici(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ kullanici, token, yukleniyor, girisYap, kayitOl, cikisYap }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth, AuthProvider içinde kullanılmalıdır.");
  }
  return ctx;
}
