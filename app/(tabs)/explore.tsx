import TopHeader from "@/src/components/ui/TopHeader";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router"; // 👈 Añadido 'router' aquí
import { useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// --- COMPONENTES REUTILIZABLES INTERNOS ---

// 1. Botón 3D Dinámico (Estilo Clash/Tienda)
const ActionCard = ({
  title,
  subtitle,
  icon,
  theme,
  onPress,
  isSpecial = false,
}: any) => {
  const isPressed = useSharedValue(1);
  const shimmerValue = useSharedValue(-width);

  useEffect(() => {
    if (isSpecial) {
      shimmerValue.value = withRepeat(
        withDelay(
          2000,
          withTiming(width * 1.5, { duration: 2500, easing: Easing.linear }),
        ),
        -1,
        false,
      );
    }
  }, [isSpecial, shimmerValue]);

  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(isPressed.value, { damping: 12 }) },
      {
        translateY: withSpring(isPressed.value === 1 ? 0 : 6, { damping: 12 }),
      },
    ],
  }));

  const animatedShimmer = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerValue.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        isPressed.value = 0.95;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => (isPressed.value = 1)}
      onPress={onPress}
      className="mb-5 w-full"
    >
      <Animated.View
        style={animatedPressStyle}
        className={`w-full ${theme.bg} border-x-2 border-t-2 ${theme.border} border-b-[8px] ${theme.borderBottom} rounded-[24px] overflow-hidden relative shadow-xl shadow-black/80`}
      >
        {isSpecial && (
          <Animated.View
            style={[StyleSheet.absoluteFill, animatedShimmer, { zIndex: 5 }]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={[
                "transparent",
                "rgba(255,255,255,0.1)",
                "rgba(255,255,255,0.3)",
                "rgba(255,255,255,0.1)",
                "transparent",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ ...StyleSheet.absoluteFillObject, width: "60%" }}
            />
          </Animated.View>
        )}

        <View className="p-5 flex-row items-center justify-between z-10">
          <View className="flex-row items-center flex-1">
            <View className="w-16 h-16 bg-black/40 rounded-2xl items-center justify-center mr-4 border border-white/10">
              <Text className="text-4xl">{icon}</Text>
            </View>
            <View className="flex-1 pr-2">
              <Text
                className={`${theme.textTitle} font-black text-xl uppercase tracking-wider mb-1`}
                style={{
                  textShadowColor: "rgba(0,0,0,0.5)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 3,
                }}
              >
                {title}
              </Text>
              {subtitle}
            </View>
          </View>
          <View className="bg-black/20 w-10 h-10 rounded-full items-center justify-center border border-white/5">
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.iconColor}
            />
          </View>
        </View>
      </Animated.View>
    </AnimatedPressable>
  );
};

// --- PANTALLA PRINCIPAL ---

export default function LaboratoryScreen() {
  const insets = useSafeAreaInsets();
  const currentTapitas = 150; // Esto luego vendrá de tu Zustand store

  // Estados locales
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // MOCKS DE DATOS (Para reemplazar con Zustand luego)
  const stats = {
    partidasTotales: 142,
    cartasDesbloqueadas: 85,
    totalCartas: 350,
    mejorJugador: "Lucho",
    retosGanados: 41,
  };

  // 🌌 ANIMACIONES DE FONDO VIVO (Atmósfera cian/morada para el "laboratorio")
  const orb1X = useSharedValue(-50);
  const orb1Y = useSharedValue(-30);
  const orb2X = useSharedValue(100);
  const orb2Scale = useSharedValue(1);

  useEffect(() => {
    orb1X.value = withRepeat(
      withSequence(
        withTiming(60, { duration: 16000, easing: Easing.linear }),
        withTiming(-50, { duration: 16000, easing: Easing.linear }),
      ),
      -1,
      true,
    );
    orb1Y.value = withRepeat(
      withSequence(
        withTiming(40, { duration: 19000, easing: Easing.linear }),
        withTiming(-30, { duration: 19000, easing: Easing.linear }),
      ),
      -1,
      true,
    );
    orb2X.value = withRepeat(
      withSequence(
        withTiming(-80, { duration: 22000, easing: Easing.linear }),
        withTiming(100, { duration: 22000, easing: Easing.linear }),
      ),
      -1,
      true,
    );
    orb2Scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 6000 }),
        withTiming(1, { duration: 6000 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedOrb1 = useAnimatedStyle(() => ({
    transform: [{ translateX: orb1X.value }, { translateY: orb1Y.value }],
  }));
  const animatedOrb2 = useAnimatedStyle(() => ({
    transform: [{ translateX: orb2X.value }, { scale: orb2Scale.value }],
  }));

  // --- HANDLERS ---
  const handleToggleHaptics = (val: boolean) => {
    if (val)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setHapticsEnabled(val);
  };

  const handleActionPress = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (action === "cards") {
      router.push("/collection"); // Transición hacia la colección de cartas
    } else if (action === "decks") {
      router.push("/decks"); // 👈 Transición hacia el Taller de Mazos (Forja)
    } else {
      console.log(`Ruta no definida para: ${action}`);
    }
  };

  return (
    <View className="flex-1 bg-[#020617] overflow-hidden">
      <Stack.Screen options={{ headerShown: false }} />

      {/* FONDO MÁGICO DEL LABORATORIO */}
      <View
        style={StyleSheet.absoluteFillObject}
        className="opacity-30 pointer-events-none"
      >
        <Animated.View
          style={[
            animatedOrb1,
            {
              position: "absolute",
              top: "15%",
              left: "-15%",
              width: 350,
              height: 350,
              borderRadius: 175,
              backgroundColor: "rgba(34, 211, 238, 0.08)", // Cyan
            },
          ]}
        />
        <Animated.View
          style={[
            animatedOrb2,
            {
              position: "absolute",
              bottom: "5%",
              right: "-20%",
              width: 450,
              height: 450,
              borderRadius: 225,
              backgroundColor: "rgba(168, 85, 247, 0.06)", // Purple
            },
          ]}
        />
      </View>

      {/* TOP HEADER GLOBAL (Compatible) */}
      <View style={{ paddingTop: insets.top }}>
        <TopHeader tapitas={currentTapitas} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: insets.bottom + 120, // Espacio para la Tab Bar
        }}
        className="z-10"
      >
        {/* TÍTULO PRINCIPAL COHERENTE CON SHOP */}
        <Animated.View
          entering={FadeInLeft.delay(100).springify()}
          className="mb-8 mt-2"
        >
          <Text
            className="text-5xl font-black text-white tracking-tighter mb-1 uppercase"
            style={{
              textShadowColor: "rgba(34, 211, 238, 0.4)",
              textShadowOffset: { width: 0, height: 4 },
              textShadowRadius: 10,
            }}
          >
            EL <Text className="text-cyan-400">LABORATORIO</Text>
          </Text>
          <Text className="text-slate-400 text-sm font-medium">
            Tu centro de comando. Crea reglas, rompe amistades.
          </Text>
        </Animated.View>

        {/* --- PANEL DE ESTADÍSTICAS --- */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="mb-8"
        >
          <View className="bg-[#0f172a] border border-slate-800 rounded-[28px] p-5 shadow-xl shadow-black/50">
            <View className="flex-row justify-between mb-5">
              <View className="items-center flex-1 border-r border-slate-800">
                <Text className="text-2xl mb-1">🎮</Text>
                <Text className="text-white font-black text-2xl">
                  {stats.partidasTotales}
                </Text>
                <Text className="text-slate-500 text-[10px] font-black tracking-widest uppercase text-center mt-1">
                  Partidas Totales
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl mb-1">🏆</Text>
                <Text className="text-amber-400 font-black text-2xl">
                  {stats.retosGanados}
                </Text>
                <Text className="text-slate-500 text-[10px] font-black tracking-widest uppercase text-center mt-1">
                  Retos de {stats.mejorJugador}
                </Text>
              </View>
            </View>

            {/* Fila Inferior del MVP */}
            <View className="bg-slate-900 rounded-2xl p-3 flex-row items-center justify-between border border-slate-800/50">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-amber-900/30 rounded-full items-center justify-center border border-amber-500/30 mr-3">
                  <Text className="text-lg">👑</Text>
                </View>
                <View>
                  <Text className="text-slate-400 text-[10px] font-black tracking-widest uppercase mb-0.5">
                    MVP Histórico
                  </Text>
                  <Text className="text-white font-black text-base">
                    {stats.mejorJugador}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* --- OPCIONES PRINCIPALES --- */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          {/* BOTÓN 1: CARTAS DESBLOQUEADAS */}
          <ActionCard
            title="Cartas Desbloqueadas"
            subtitle={
              <View className="flex-row items-center mt-1">
                <View className="bg-emerald-900/50 px-2 py-1 rounded-md border border-emerald-500/30">
                  <Text className="text-emerald-400 text-[11px] font-black tracking-wider">
                    {stats.cartasDesbloqueadas} / {stats.totalCartas} OBTENIDAS
                  </Text>
                </View>
              </View>
            }
            icon="🃏"
            theme={{
              bg: "bg-emerald-950",
              border: "border-emerald-800",
              borderBottom: "border-emerald-700",
              textTitle: "text-emerald-400",
              iconColor: "#34d399",
            }}
            onPress={() => handleActionPress("cards")}
          />

          {/* BOTÓN 2: VER/EDITAR MAZOS */}
          <ActionCard
            title="Ver / Editar Mazos"
            subtitle={
              <Text className="text-indigo-300/70 text-xs font-bold mt-1">
                Crea tus propias reglas y castigos
              </Text>
            }
            icon="🛠️"
            theme={{
              bg: "bg-indigo-950",
              border: "border-indigo-800",
              borderBottom: "border-indigo-700",
              textTitle: "text-indigo-400",
              iconColor: "#818cf8",
            }}
            onPress={() => handleActionPress("decks")}
          />
        </Animated.View>

        {/* --- AJUSTES Y EXTRAS --- */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          className="mt-4"
        >
          <Text className="text-slate-500 text-xs font-black tracking-[0.3em] uppercase mb-4 ml-2">
            Sistema y Apoyo
          </Text>

          {/* SWITCH VIBRACIÓN */}
          <View className="bg-[#0f172a] border-x-2 border-t-2 border-slate-800 border-b-[6px] border-b-slate-900 rounded-[24px] p-5 mb-5 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-slate-900 w-12 h-12 rounded-xl items-center justify-center border border-slate-700 mr-4">
                <Ionicons name="hardware-chip" size={24} color="#94a3b8" />
              </View>
              <View>
                <Text className="text-slate-200 font-black text-lg tracking-wide">
                  Vibración (Haptics)
                </Text>
                <Text className="text-slate-500 text-xs font-medium">
                  Impactos al jugar
                </Text>
              </View>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={handleToggleHaptics}
              trackColor={{ false: "#1e293b", true: "#0284c7" }}
              thumbColor={hapticsEnabled ? "#38bdf8" : "#64748b"}
            />
          </View>

          {/* BOTÓN ESPECIAL: DONACIONES */}
          <ActionCard
            title="Apoyar al Creador"
            subtitle={
              <Text className="text-amber-200/80 text-xs font-bold mt-1">
                Dona, entra a sorteos y obtén recompensas
              </Text>
            }
            icon="💖"
            theme={{
              bg: "bg-amber-600",
              border: "border-amber-400",
              borderBottom: "border-amber-700",
              textTitle: "text-white",
              iconColor: "#fff",
            }}
            isSpecial={true}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              // Lógica de RevenueCat para propinas
            }}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}
