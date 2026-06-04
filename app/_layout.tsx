import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

function RootNavigator() {
  const { token, yukleniyor } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (yukleniyor) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!token && !inAuthGroup) {
      router.replace("/(auth)/giris");
    } else if (token && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [token, yukleniyor, segments, router]);

  if (yukleniyor) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#ED8936" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="camera"
        options={{ headerShown: false, presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="menu/[restoranId]"
        options={{ title: "Menü", headerBackTitle: "Geri" }}
      />
      <Stack.Screen
        name="karsilastir"
        options={{ title: "Karşılaştır", headerBackTitle: "Geri" }}
      />
      <Stack.Screen
        name="restaurant/details"
        options={{ title: "Restoran", headerBackTitle: "Geri" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RootNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
