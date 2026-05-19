import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* İsterseniz ekranları burada belirtebilirsiniz, ancak 
          headerShown: false demek tüm ekranlarda üst barı gizler */}
      <Stack.Screen name="index" />
    </Stack>
  );
}
