import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import { Stack, router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeInRight,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot, { captureRef } from "react-native-view-shot";
import { usePlayerStore } from "../store/playerStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// 🛡️ HELPER: Alertas asíncronas para pausar la ejecución
const alertAsync = (
  title: string,
  message: string,
  buttonText: string = "OK",
): Promise<void> => {
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: buttonText, onPress: () => resolve() },
    ]);
  });
};

// ==========================================
// 🛡️ 1. TIPOS E INTERFACES
// ==========================================
export interface TavernPlayer {
  id: string;
  name: string;
  fuel: string;
  drinksTaken?: number;
  smokes?: number;
  cardsPlayed?: number;
  legendaryCards?: number;
  coward?: number;
  activityScore?: number;
}

export interface TavernStats {
  mostActive: TavernPlayer[];
  chillPlayers: TavernPlayer[];
  leaderboard: TavernPlayer[];
  maxActivity: number;
}

// ==========================================
// 🧠 2. LÓGICA DE NEGOCIO
// ==========================================
const calculateTavernStats = (players: TavernPlayer[]): TavernStats | null => {
  if (!players || players.length === 0) return null;

  const playersWithActivity = players.map((p) => ({
    ...p,
    activityScore:
      (p.drinksTaken || 0) * 2 +
      (p.smokes || 0) * 3 +
      (p.legendaryCards || 0) * 5 +
      (p.cardsPlayed || 0),
  }));

  const maxActivity = Math.max(
    ...playersWithActivity.map((p) => p.activityScore),
  );
  const mostActive =
    maxActivity > 0
      ? playersWithActivity.filter((p) => p.activityScore === maxActivity)
      : [];
  const others = playersWithActivity.filter(
    (p) => !mostActive.some((active) => active.id === p.id),
  );

  const maxCoward =
    others.length > 0 ? Math.max(...others.map((p) => p.coward || 0)) : 0;
  const chillPlayers =
    maxCoward > 0 ? others.filter((p) => (p.coward || 0) === maxCoward) : [];

  const leaderboard = [...playersWithActivity].sort(
    (a, b) =>
      (b.activityScore || 0) - (a.activityScore || 0) ||
      (a.coward || 0) - (b.coward || 0),
  );

  return { mostActive, chillPlayers, leaderboard, maxActivity };
};

// ==========================================
// 🎨 3. COMPONENTE UI
// ==========================================
export default function PodiumScreen() {
  const store = usePlayerStore() as any;
  const players: TavernPlayer[] = store.players || [];
  const resetScores =
    store.resetScores || (() => console.log("Falta resetScores"));

  const insets = useSafeAreaInsets();
  const currentDate = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const viewRef = useRef(null);
  const [shotsLeft, setShotsLeft] = useState(3);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [cameraPermissions, requestCameraPermission] =
    ImagePicker.useCameraPermissions();

  // 📸 Lógica de Fotografías REPARADA (Síncrona visualmente, asíncrona en código)
  const handleTakeSnapshot = async () => {
    if (shotsLeft <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      if (permissionResponse?.status !== "granted") {
        const { status } = await requestPermission();
        if (status !== "granted") {
          Alert.alert(
            "Permiso Denegado",
            "Necesitamos acceso para guardar el recuerdo.",
          );
          return;
        }
      }

      if (cameraPermissions?.status !== "granted") {
        const { status } = await requestCameraPermission();
        if (status !== "granted") {
          Alert.alert(
            "Cámara Denegada",
            "Necesitamos la cámara para las selfies grupales.",
          );
          return;
        }
      }

      // --- FASE 1: CAPTURA DE RESULTADOS ---
      const uri = await captureRef(viewRef, { format: "png", quality: 1 });
      await MediaLibrary.saveToLibraryAsync(uri);

      // --- FASE 2: PRIMERA SELFIE ---
      // AHORA ESPERA A QUE EL USUARIO PRESIONE EL BOTÓN
      await alertAsync(
        "📸 ¡Estadísticas guardadas!",
        "¡Acomódense para la primera selfie grupal!",
        "¡Listos, dispara!",
      );

      const photo1 = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.front,
        quality: 1,
      });

      if (!photo1.canceled && photo1.assets[0].uri) {
        await MediaLibrary.saveToLibraryAsync(photo1.assets[0].uri);

        // --- FASE 3: SEGUNDA SELFIE ---
        // ESPERA DE NUEVO PARA EVITAR BUGS
        await alertAsync(
          "🤪 ¡Una más!",
          "¡Esta vez pongan su cara más graciosa/épica!",
          "¡Vamos!",
        );

        const photo2 = await ImagePicker.launchCameraAsync({
          cameraType: ImagePicker.CameraType.front,
          quality: 1,
        });

        if (!photo2.canceled && photo2.assets[0].uri) {
          await MediaLibrary.saveToLibraryAsync(photo2.assets[0].uri);
        }

        // Finalizamos el proceso de forma segura
        setShotsLeft((prev) => prev - 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "🎉 ¡Pack Completo!",
          "Estadísticas y selfies guardadas a salvo en tu galería.",
        );
      }
    } catch (error) {
      console.error("Error guardando la foto:", error);
      Alert.alert("Error", "Hubo un problema al guardar los recuerdos.");
    }
  };

  // 🎇 Animaciones
  const pulseScale = useSharedValue(1);
  const spinRays = useSharedValue(0);
  const crownBounce = useSharedValue(0);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    spinRays.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false,
    );
    crownBounce.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 600, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 600, easing: Easing.bounce }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedOrb = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));
  const animatedRays = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinRays.value}deg` }],
  }));
  const animatedCrown = useAnimatedStyle(() => ({
    transform: [{ translateY: crownBounce.value }],
  }));

  const stats = useMemo(() => calculateTavernStats(players), [players]);

  const handleRematch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (store.resetScores) resetScores();
    router.replace("/game" as any);
  };

  const handleFinish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    if (store.resetScores) resetScores();
    router.replace("/");
  };

  if (!stats) {
    return (
      <View className="flex-1 bg-[#020617] items-center justify-center p-6">
        <Text className="text-slate-500 font-black text-2xl uppercase tracking-widest text-center">
          La Taberna está vacía
        </Text>
      </View>
    );
  }

  const { mostActive, chillPlayers, leaderboard } = stats;

  return (
    <View className="flex-1 bg-[#020617]">
      <Stack.Screen options={{ headerShown: false }} />

      <ViewShot ref={viewRef} style={{ flex: 1, backgroundColor: "#020617" }}>
        <View style={{ paddingTop: insets.top + 10 }} className="flex-1 px-5">
          {/* FONDOS Y DESTELLOS */}
          <View
            style={StyleSheet.absoluteFillObject}
            className="pointer-events-none overflow-hidden"
          >
            <Animated.View
              style={[
                animatedRays,
                {
                  position: "absolute",
                  top: "-20%",
                  left: "-50%",
                  width: "200%",
                  height: 800,
                  opacity: 0.05,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              {[0, 45, 90, -45].map((deg) => (
                <View
                  key={deg}
                  style={{
                    width: "100%",
                    height: 40,
                    backgroundColor: "#fbbf24",
                    position: "absolute",
                    transform: [{ rotate: `${deg}deg` }],
                  }}
                />
              ))}
            </Animated.View>
            <Animated.View
              style={[
                animatedOrb,
                {
                  position: "absolute",
                  top: "0%",
                  left: "0%",
                  width: 300,
                  height: 300,
                  borderRadius: 150,
                  backgroundColor: "rgba(124, 58, 237, 0.08)",
                  shadowColor: "#7c3aed",
                  shadowOpacity: 0.8,
                  shadowRadius: 60,
                  elevation: 20,
                },
              ]}
            />
            <Animated.View
              style={[
                animatedOrb,
                {
                  position: "absolute",
                  bottom: "10%",
                  right: "-10%",
                  width: 350,
                  height: 350,
                  borderRadius: 175,
                  backgroundColor: "rgba(225, 29, 72, 0.05)",
                  shadowColor: "#e11d48",
                  shadowOpacity: 0.8,
                  shadowRadius: 60,
                  elevation: 20,
                },
              ]}
            />
          </View>

          {/* HEADER */}
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            className="w-full items-center mb-6 z-10 mt-2"
          >
            <Text
              className="text-amber-400 font-black text-3xl tracking-[0.2em] uppercase text-center"
              style={{
                textShadowColor: "rgba(251, 191, 36, 0.5)",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 15,
              }}
            >
              SALÓN DE LA FAMA
            </Text>
            <View className="bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20 mt-2">
              <Text className="text-amber-500 font-bold text-[10px] uppercase tracking-[0.3em] text-center">
                Expedición del {currentDate}
              </Text>
            </View>
          </Animated.View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
          >
            {/* MVP CONTAINER */}
            <Animated.View
              entering={ZoomIn.delay(300)
                .springify()
                .damping(15)
                .stiffness(150)}
              className="mb-6 z-20"
            >
              <LinearGradient
                colors={["#1e1b4b", "#0f172a"]}
                className="border-[1.5px] border-indigo-500/40 p-6 rounded-[28px] items-center shadow-xl shadow-indigo-900/40 relative overflow-hidden"
              >
                <LinearGradient
                  colors={["rgba(99,102,241,0.15)", "transparent"]}
                  className="absolute inset-0"
                />

                <Animated.View style={animatedCrown} className="mb-2">
                  <Text
                    className="text-6xl"
                    style={{
                      textShadowColor: "rgba(251,191,36,0.6)",
                      textShadowRadius: 20,
                    }}
                  >
                    👑
                  </Text>
                </Animated.View>

                <Text className="text-indigo-300 font-black text-[11px] tracking-[0.4em] uppercase mb-4 text-center opacity-90">
                  {mostActive.length > 1
                    ? "Reyes de la Noche"
                    : "Rey de la Noche"}
                </Text>

                {mostActive.length > 0 ? (
                  <View className="flex-row flex-wrap justify-center gap-3">
                    {mostActive.map((p) => (
                      <View
                        key={`active-${p.id}`}
                        className="bg-indigo-950/80 border border-indigo-400/50 px-5 py-3 rounded-2xl flex-row items-center shadow-lg shadow-black/50"
                      >
                        <Text className="text-2xl mr-3">{p.fuel}</Text>
                        <Text className="text-indigo-50 font-black text-xl uppercase tracking-wider">
                          {p.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-indigo-200/50 font-bold italic text-sm">
                    Nadie destacó lo suficiente.
                  </Text>
                )}
              </LinearGradient>
            </Animated.View>

            {/* CHILL PLAYERS CONTAINER */}
            <Animated.View
              entering={ZoomIn.delay(500).springify().damping(18)}
              className="mb-8 z-10"
            >
              <LinearGradient
                colors={["#2e1025", "#0f172a"]}
                className="border-[1.5px] border-rose-900/60 p-5 rounded-[24px] items-center relative overflow-hidden"
              >
                <Text
                  className="text-4xl mb-2 opacity-90"
                  style={{ textShadowColor: "#000", textShadowRadius: 10 }}
                >
                  👻
                </Text>
                <Text className="text-rose-500 font-black text-[10px] tracking-[0.4em] uppercase mb-4 text-center">
                  {chillPlayers.length > 1
                    ? "Las Almas en Pena (Pasaron)"
                    : "El Alma en Pena"}
                </Text>
                {chillPlayers.length > 0 ? (
                  <View className="flex-row flex-wrap justify-center gap-2">
                    {chillPlayers.map((p) => (
                      <View
                        key={`chill-${p.id}`}
                        className="bg-rose-950/50 border border-rose-800/40 px-3 py-1.5 rounded-xl flex-row items-center"
                      >
                        <Text className="text-lg mr-2 opacity-80">
                          {p.fuel}
                        </Text>
                        <Text className="text-rose-200 font-bold text-sm uppercase tracking-tighter">
                          {p.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-rose-900/80 font-bold italic text-center text-xs uppercase tracking-widest">
                    Todos fueron valientes.
                  </Text>
                )}
              </LinearGradient>
            </Animated.View>

            {/* LEADERBOARD (ESPECIALIZADO) */}
            <View className="mb-4">
              <Animated.Text
                entering={FadeInRight.delay(600)}
                className="text-slate-400 text-[11px] font-black tracking-[0.4em] uppercase mb-4 ml-2"
              >
                Registro del Gremio
              </Animated.Text>

              <View className="gap-3">
                {leaderboard.map((player, index) => (
                  <Animated.View
                    key={player.id}
                    entering={FadeInRight.delay(700 + index * 100).springify()}
                    className="bg-[#0f172a] border border-slate-800/80 p-4 rounded-[20px] shadow-lg shadow-black/60 overflow-hidden"
                  >
                    <LinearGradient
                      colors={["rgba(255,255,255,0.02)", "transparent"]}
                      className="absolute inset-0"
                    />

                    <View className="flex-row items-center mb-3">
                      <View className="bg-slate-900 w-12 h-12 items-center justify-center rounded-2xl mr-4 border border-slate-700/50 shadow-inner">
                        <Text className="text-2xl">{player.fuel}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-black text-lg uppercase tracking-tight text-slate-100">
                          {player.name}
                        </Text>
                        {(player.legendaryCards || 0) > 0 && (
                          <Text className="text-amber-400 font-bold text-[9px] uppercase tracking-widest mt-0.5">
                            ✨ {player.legendaryCards} Cartas Épicas
                          </Text>
                        )}
                      </View>
                      <View className="bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                        <Text className="text-slate-300 font-black text-xs">
                          #{index + 1}
                        </Text>
                      </View>
                    </View>

                    {/* STATS DE JUGADOR (MÁS COMPACTO Y GAMER) */}
                    <View className="flex-row justify-between bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800/50">
                      <View className="items-center flex-1">
                        <Ionicons name="beer" size={14} color="#fcd34d" />
                        <Text className="text-amber-200 font-black text-base mt-1">
                          {player.drinksTaken || 0}
                        </Text>
                      </View>
                      <View className="w-[1px] bg-slate-800" />
                      <View className="items-center flex-1">
                        <Ionicons name="cloud" size={14} color="#a7f3d0" />
                        <Text className="text-emerald-200 font-black text-base mt-1">
                          {player.smokes || 0}
                        </Text>
                      </View>
                      <View className="w-[1px] bg-slate-800" />
                      <View className="items-center flex-1">
                        <Ionicons name="albums" size={14} color="#e2e8f0" />
                        <Text className="text-slate-200 font-black text-base mt-1">
                          {player.cardsPlayed || 0}
                        </Text>
                      </View>
                      <View className="w-[1px] bg-slate-800" />
                      <View className="items-center flex-1">
                        <Ionicons name="walk" size={14} color="#f43f5e" />
                        <Text className="text-rose-400 font-black text-base mt-1">
                          {player.coward || 0}
                        </Text>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </ViewShot>

      {/* FOOTER ACTIONS - BOTONES MEJORADOS */}
      <Animated.View
        entering={FadeInDown.delay(1200).springify().damping(20)}
        className="absolute bottom-0 w-full px-5 bg-[#020617]/95 pt-4 pb-8 border-t border-slate-800/50"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <View className="gap-3">
          <AnimatedPressable
            onPress={handleTakeSnapshot}
            disabled={shotsLeft <= 0}
            className={`w-full py-4 items-center justify-center rounded-2xl overflow-hidden active:scale-95 transition-transform shadow-lg ${shotsLeft > 0 ? "bg-indigo-600 shadow-indigo-900/50" : "bg-slate-800 opacity-50"}`}
            style={{
              borderBottomWidth: 4,
              borderBottomColor: shotsLeft > 0 ? "#4f46e5" : "#0f172a",
            }}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.1)", "transparent"]}
              className="absolute inset-0"
            />
            <View className="flex-row items-center justify-center">
              <Ionicons
                name="camera"
                size={22}
                color={shotsLeft > 0 ? "#e0e7ff" : "#64748b"}
                style={{ marginRight: 10 }}
              />
              <Text
                className={`font-black text-lg uppercase tracking-[0.2em] ${shotsLeft > 0 ? "text-indigo-50" : "text-slate-400"}`}
              >
                {shotsLeft > 0
                  ? `GUARDAR RECUERDOS (${shotsLeft})`
                  : "MEMORIA LLENA"}
              </Text>
            </View>
          </AnimatedPressable>

          <View className="flex-row gap-3">
            <AnimatedPressable
              onPress={handleRematch}
              className="flex-1 bg-teal-600 py-3.5 items-center justify-center rounded-2xl overflow-hidden active:scale-95 transition-transform shadow-lg shadow-teal-900/40"
              style={{ borderBottomWidth: 4, borderBottomColor: "#0d9488" }}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.1)", "transparent"]}
                className="absolute inset-0"
              />
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="flash"
                  size={18}
                  color="#ccfbf1"
                  style={{ marginRight: 6 }}
                />
                <Text className="text-teal-50 font-black text-sm uppercase tracking-[0.1em]">
                  Otra Ronda
                </Text>
              </View>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={handleFinish}
              className="flex-1 bg-slate-800 py-3.5 items-center justify-center rounded-2xl overflow-hidden active:scale-95 transition-transform border border-slate-700"
              style={{ borderBottomWidth: 4, borderBottomColor: "#0f172a" }}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="exit"
                  size={18}
                  color="#94a3b8"
                  style={{ marginRight: 6 }}
                />
                <Text className="text-slate-300 font-black text-sm uppercase tracking-[0.1em]">
                  Al Gremio
                </Text>
              </View>
            </AnimatedPressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
