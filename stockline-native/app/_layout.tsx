import { AlertStack } from "@/components/AlertStack";
import { AppProvider } from "@/context/AppContext";
import { colors } from "@/constants/theme";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded] = useFonts({
    ArchivoBlack_400Regular: require("../assets/fonts/ArchivoBlack_400Regular.ttf"),
    SpaceGrotesk_400Regular: require("../assets/fonts/SpaceGrotesk_400Regular.ttf"),
    SpaceGrotesk_500Medium: require("../assets/fonts/SpaceGrotesk_500Medium.ttf"),
    SpaceGrotesk_700Bold: require("../assets/fonts/SpaceGrotesk_700Bold.ttf"),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded]);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            headerTintColor: colors.ink,
            headerStyle: { backgroundColor: colors.bg },
            contentStyle: { backgroundColor: colors.bg },
            headerTitleStyle: {
              fontFamily: "ArchivoBlack_400Regular",
              color: colors.ink,
            },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="empty" options={{ headerShown: false }} />
          <Stack.Screen
            name="borrow"
            options={{ title: "Borrow USDC", presentation: "modal" }}
          />
          <Stack.Screen
            name="deposit"
            options={{ title: "Add collateral", presentation: "modal" }}
          />
          <Stack.Screen name="withdraw" options={{ title: "Withdraw" }} />
          <Stack.Screen name="auto-repay" options={{ title: "Auto-Repay" }} />
          <Stack.Screen name="risk" options={{ title: "Portfolio health" }} />
        </Stack>
        <AlertStack />
      </AppProvider>
    </View>
  );
}
