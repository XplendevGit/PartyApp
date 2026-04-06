import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
// 1. IMPORTAMOS EL PROVIDER DE GESTOS
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

import { useColorScheme } from "@/src/hooks/use-color-scheme";
// Importamos nuestro nuevo store de autenticación (Cerebro)
import { useAuthStore } from "@/src/store/authStore";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Extraemos las funciones y estado de nuestro Zustand Store
  const { initializeAuth, isLoadingAuth } = useAuthStore();

  // Se ejecuta una única vez al abrir la aplicación
  useEffect(() => {
    initializeAuth();
  }, []);

  // 🛡️ PANTALLA DE CARGA INICIAL (Bloquea la UI hasta asegurar la conexión DB)
  if (isLoadingAuth) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    // 2. ENVOLVEMOS TODA LA APP AQUÍ, CON flex: 1 PARA QUE OCUPE TODA LA PANTALLA
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* El enrutador principal de tus pestañas */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Tu modal */}
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />

          {/* Agregamos las rutas de juego que detectó tu Expo Router para que no lance warnings */}
          <Stack.Screen
            name="lobby/[deckId]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="players/[deckId]"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="game/[id]" options={{ headerShown: false }} />

          {/* Eliminamos el <Stack.Screen name="profile" /> de aquí porque ya vive dentro de (tabs) */}
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
