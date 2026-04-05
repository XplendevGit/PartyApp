import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Player, usePlayerStore } from "../../store/playerStore";

const { width } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// =====================================================================
// 🧱 ARQUITECTURA DE CONSTANTES (Ideal para mover a /constants luego)
// =====================================================================

// 🧪 DICCIONARIO DE VENENOS (Expandido y escalable)
export const POISONS = [
  {
    label: "Agüita Perra",
    icon: "💧",
    color: "text-blue-400",
    glow: "#60a5fa",
  },
  { label: "Chelita", icon: "🍺", color: "text-amber-400", glow: "#fbbf24" },
  { label: "Vinito", icon: "🍷", color: "text-rose-400", glow: "#fb7185" },
  { label: "Piscola CTM", icon: "🥃", color: "text-zinc-100", glow: "#d4d4d8" },
  { label: "Tequilazo", icon: "🍋", color: "text-lime-400", glow: "#a3e635" },
  {
    label: "Hierbabuena",
    icon: "🌿",
    color: "text-emerald-400",
    glow: "#34d399",
  },
  {
    label: "Juguito en Caja",
    icon: "🧃",
    color: "text-orange-400",
    glow: "#fb923c",
  }, // Pa los más sanos
  {
    label: "Veneno Fatal",
    icon: "☠️",
    color: "text-fuchsia-500",
    glow: "#d946ef",
  },
];

// 🎮 DICCIONARIO DE BOTONES SEGÚN EL MAZO
const START_BUTTON_CONFIG: Record<string, { title: string; subtitle: string }> =
  {
    "d290f1ee-6c54-4b01-90e6-d701748f0851": {
      // Previa Piola
      title: "🍺 DESTAPAR CHELAS",
      subtitle: "Pa calentar motores",
    },
    "e439569b-9806-441d-91b7-60e0a4ec2912": {
      // Modo Destrucción
      title: "☠️ AL HOSPITAL CTMARE",
      subtitle: "Preparen el hígado",
    },
    "f6324908-412e-4b2e-84d4-28b3b3fa1094": {
      // Familiar
      title: "🎲 A JUGAR CTM...",
      subtitle: "Ah no, verdad, con respeto",
    },
    "a82b9881-1921-4f18-bc71-70ab5570024f": {
      // 2 Pa 2 / Citas
      title: "😏 QUE FLUYA LA MAGIA",
      subtitle: "Asegura el terreno campeón",
    },
    "c48e244b-4a53-43cb-8c9e-5e7b2cd90ab1": {
      // Modo HOT
      title: "🔥 A SACARSE LA ROPA",
      subtitle: "El que tenga miedo a morir que no nazca",
    },
    default: {
      title: "⚔️ QUE EMPIECE EL WEBEO",
      subtitle: "Sin llorar después",
    },
  };

// 🎨 EL MOTOR DE TEMAS (Tu DB)
export const DECK_THEMES: Record<string, any> = {
  "d290f1ee-6c54-4b01-90e6-d701748f0851": {
    name: "Previa Piola",
    primaryText: "text-cyan-400",
    primaryBorder: "border-cyan-400",
    primaryBorderLeft: "border-l-cyan-500",
    primaryBorderBottom: "border-b-cyan-800",
    primaryBg: "bg-cyan-600",
    shadowColor: "rgba(34, 211, 238, 0.8)",
    shadowTailwind: "shadow-cyan-500/50",
    bgOrbs: ["rgba(34, 211, 238, 0.15)", "rgba(56, 189, 248, 0.1)"],
  },
  "e439569b-9806-441d-91b7-60e0a4ec2912": {
    name: "Modo Destrucción",
    primaryText: "text-purple-500",
    primaryBorder: "border-purple-500",
    primaryBorderLeft: "border-l-purple-500",
    primaryBorderBottom: "border-b-purple-900",
    primaryBg: "bg-purple-600",
    shadowColor: "rgba(168, 85, 247, 0.8)",
    shadowTailwind: "shadow-purple-500/50",
    bgOrbs: ["rgba(168, 85, 247, 0.15)", "rgba(147, 51, 234, 0.1)"],
  },
  "f6324908-412e-4b2e-84d4-28b3b3fa1094": {
    name: "Familiar",
    primaryText: "text-emerald-400",
    primaryBorder: "border-emerald-400",
    primaryBorderLeft: "border-l-emerald-500",
    primaryBorderBottom: "border-b-emerald-800",
    primaryBg: "bg-emerald-600",
    shadowColor: "rgba(52, 211, 153, 0.8)",
    shadowTailwind: "shadow-emerald-500/50",
    bgOrbs: ["rgba(52, 211, 153, 0.15)", "rgba(16, 185, 129, 0.1)"],
  },
  "a82b9881-1921-4f18-bc71-70ab5570024f": {
    name: "2 Pa 2 / Citas",
    primaryText: "text-pink-400",
    primaryBorder: "border-pink-400",
    primaryBorderLeft: "border-l-pink-500",
    primaryBorderBottom: "border-b-pink-800",
    primaryBg: "bg-pink-600",
    shadowColor: "rgba(244, 114, 182, 0.8)",
    shadowTailwind: "shadow-pink-500/50",
    bgOrbs: ["rgba(244, 114, 182, 0.15)", "rgba(219, 39, 119, 0.1)"],
  },
  "c48e244b-4a53-43cb-8c9e-5e7b2cd90ab1": {
    name: "Modo HOT 🔥",
    primaryText: "text-red-500",
    primaryBorder: "border-red-500",
    primaryBorderLeft: "border-l-red-500",
    primaryBorderBottom: "border-b-red-900",
    primaryBg: "bg-red-600",
    shadowColor: "rgba(239, 68, 68, 0.8)",
    shadowTailwind: "shadow-red-500/50",
    bgOrbs: ["rgba(239, 68, 68, 0.15)", "rgba(185, 28, 28, 0.15)"],
  },
  default: {
    name: "La Arena",
    primaryText: "text-fuchsia-400",
    primaryBorder: "border-fuchsia-400",
    primaryBorderLeft: "border-l-fuchsia-500",
    primaryBorderBottom: "border-b-fuchsia-800",
    primaryBg: "bg-fuchsia-600",
    shadowColor: "rgba(217, 70, 239, 0.8)",
    shadowTailwind: "shadow-fuchsia-500/50",
    bgOrbs: ["rgba(217, 70, 239, 0.15)", "rgba(192, 38, 211, 0.1)"],
  },
};

// =====================================================================
// 🎭 COMPONENTE INDIVIDUAL DE JUGADOR (Separación de Lógica)
// =====================================================================
interface PlayerRowProps {
  player: Player;
  index: number;
  onToggleFuel: (id: string) => void;
  onRemove: (id: string) => void;
  theme: any;
}

const PlayerRow = ({
  player,
  index,
  onToggleFuel,
  onRemove,
  theme,
}: PlayerRowProps) => {
  const isPressed = useSharedValue(1);
  const venenoScale = useSharedValue(1);
  const venenoRotate = useSharedValue(0);
  const breathPulse = useSharedValue(0.3);

  const [poisonIndex, setPoisonIndex] = useState(() => {
    const rawFuel = Number(player.fuel);
    return (
      (isNaN(rawFuel) || rawFuel < 0 ? 0 : Math.floor(rawFuel)) % POISONS.length
    );
  });

  const currentPoison = POISONS[poisonIndex];

  useEffect(() => {
    breathPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [breathPulse]);

  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isPressed.value, { damping: 12 }) }],
  }));

  const animatedVenenoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: venenoScale.value },
      { rotate: `${venenoRotate.value}deg` },
    ],
  }));

  const animatedTocaGlowStyle = useAnimatedStyle(() => {
    const glowHex = currentPoison.glow || "#ffffff";
    const r = parseInt(glowHex.slice(1, 3), 16) || 255;
    const g = parseInt(glowHex.slice(3, 5), 16) || 255;
    const b = parseInt(glowHex.slice(5, 7), 16) || 255;

    return {
      borderColor: `rgba(${r}, ${g}, ${b}, ${breathPulse.value})`,
      shadowColor: glowHex,
      shadowOpacity: breathPulse.value * 1.5,
      shadowRadius: 15 + breathPulse.value * 5,
    };
  }, [currentPoison]);

  const handleToggleVeneno = () => {
    Haptics.selectionAsync();
    venenoScale.value = withSequence(
      withTiming(1.3, { duration: 100 }),
      withSpring(1, { damping: 5, stiffness: 200 }),
    );
    venenoRotate.value = withSequence(
      withTiming(-15, { duration: 50 }),
      withSpring(360, { damping: 10, stiffness: 100 }),
    );
    setPoisonIndex((prevIndex) => (prevIndex + 1) % POISONS.length);
    onToggleFuel(player.id);
    setTimeout(() => {
      venenoRotate.value = 0;
    }, 500);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)
        .springify()
        .damping(14)}
      exiting={FadeOutUp.duration(200)}
      className="mb-5"
    >
      <View
        className={`flex-row items-center bg-slate-900/80 border-y-2 border-r-2 rounded-2xl p-3 shadow-xl shadow-black relative ${
          player.isOwner ? "border-amber-500/30" : "border-slate-800"
        }`}
        style={{ borderLeftWidth: 6, borderLeftColor: player.color }}
      >
        {/* AVATAR / VENENO */}
        <AnimatedPressable
          onPress={handleToggleVeneno}
          className="bg-slate-950/80 w-[72px] h-[72px] rounded-2xl items-center justify-center mr-4 border-l-2 border-slate-700 border-t-2 border-r-2 border-b-[6px] border-slate-800 active:border-b-2 active:translate-y-1 z-20 relative"
        >
          <Animated.View
            style={animatedVenenoStyle}
            className="items-center justify-center"
          >
            <Text
              className="text-4xl"
              style={{
                textShadowColor: currentPoison.glow,
                textShadowRadius: 10,
              }}
            >
              {currentPoison.icon}
            </Text>
          </Animated.View>

          <Animated.View
            style={animatedTocaGlowStyle}
            className="absolute -bottom-4 bg-slate-950 px-3 py-[3px] rounded-full border flex-row gap-1 items-center z-30 shadow-lg"
          >
            <Text
              className="text-[10px] font-black tracking-[0.2em]"
              style={{ color: currentPoison.glow }}
            >
              TOCA
            </Text>
          </Animated.View>
        </AnimatedPressable>

        {/* INFO JUGADOR */}
        <View className="flex-1 justify-center z-10 ml-1">
          <View className="flex-row items-center">
            {player.isOwner && (
              <Text
                className="text-amber-400 mr-2 text-xs"
                style={{ textShadowColor: "#fbbf24", textShadowRadius: 5 }}
              >
                👑
              </Text>
            )}
            <Text
              className="font-black text-xl uppercase tracking-wider"
              style={{
                color: player.color, // Color persistente del jugador
                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 2,
              }}
            >
              {player.name}
            </Text>
          </View>
          <Text className="text-slate-400 text-[11px] font-bold uppercase mt-1 tracking-wider">
            Copete:{" "}
            <Text className={`${currentPoison.color} font-black`}>
              {currentPoison.label}
            </Text>
          </Text>
        </View>

        {/* BOTÓN ELIMINAR */}
        <AnimatedPressable
          onPressIn={() => (isPressed.value = 0.8)}
          onPressOut={() => (isPressed.value = 1)}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onRemove(player.id);
          }}
          style={animatedPressStyle}
          className="w-12 h-12 bg-rose-950/50 rounded-full border border-rose-900 items-center justify-center ml-2 z-10"
        >
          <Text className="text-rose-500 font-black text-xl">X</Text>
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
};

// =====================================================================
// 🏰 PANTALLA PRINCIPAL
// =====================================================================
export default function PlayersScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const theme = useMemo(
    () => DECK_THEMES[deckId as string] || DECK_THEMES["default"],
    [deckId],
  );
  const btnConfig = useMemo(
    () =>
      START_BUTTON_CONFIG[deckId as string] || START_BUTTON_CONFIG["default"],
    [deckId],
  );

  const [newPlayerName, setNewPlayerName] = useState("");
  const { players, addPlayer, removePlayer, toggleFuel } = usePlayerStore();

  const orb1X = useSharedValue(-50);
  const orb1Y = useSharedValue(-30);
  const orb2X = useSharedValue(100);
  const orb2Scale = useSharedValue(1);
  const startBtnScale = useSharedValue(1);

  useEffect(() => {
    orb1X.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 15000 }),
        withTiming(-50, { duration: 15000 }),
      ),
      -1,
      true,
    );
    orb1Y.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 18000 }),
        withTiming(-30, { duration: 18000 }),
      ),
      -1,
      true,
    );
    orb2X.value = withRepeat(
      withSequence(
        withTiming(-100, { duration: 20000 }),
        withTiming(100, { duration: 20000 }),
      ),
      -1,
      true,
    );
    orb2Scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 5000 }),
        withTiming(1, { duration: 5000 }),
      ),
      -1,
      true,
    );

    if (players.length >= 2) {
      startBtnScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 800 }),
          withTiming(1, { duration: 800 }),
        ),
        -1,
        true,
      );
    } else {
      startBtnScale.value = withSpring(1);
    }
  }, [players.length]);

  const animatedOrb1 = useAnimatedStyle(() => ({
    transform: [{ translateX: orb1X.value }, { translateY: orb1Y.value }],
  }));
  const animatedOrb2 = useAnimatedStyle(() => ({
    transform: [{ translateX: orb2X.value }, { scale: orb2Scale.value }],
  }));
  const animatedStartBtn = useAnimatedStyle(() => ({
    transform: [{ scale: startBtnScale.value }],
  }));

  const handleAddPlayer = () => {
    if (newPlayerName.trim().length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPlayer(newPlayerName);
    setNewPlayerName("");
  };

  const handleStartGame = () => {
    if (players.length < 2) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert("¡Necesitas al menos 2 weones pa' empezar!");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.replace(`/game/${deckId}`);
  };

  const backTintColor = theme.shadowColor.replace(", 0.8)", ", 1)");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#020617" }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* 🌌 FONDOS DINÁMICOS */}
      <View
        style={StyleSheet.absoluteFillObject}
        className="opacity-30 pointer-events-none"
      >
        <Animated.View
          style={[
            animatedOrb1,
            {
              position: "absolute",
              top: "5%",
              right: "-15%",
              width: 400,
              height: 400,
              borderRadius: 200,
              backgroundColor: theme.bgOrbs[0],
            },
          ]}
        />
        <Animated.View
          style={[
            animatedOrb2,
            {
              position: "absolute",
              bottom: "10%",
              left: "-20%",
              width: 500,
              height: 500,
              borderRadius: 250,
              backgroundColor: theme.bgOrbs[1],
            },
          ]}
        />
      </View>

      <View className="flex-1 px-6 pt-16 pb-8">
        {/* BOTÓN VOLVER */}
        <View className="w-full flex-row items-center z-50 mb-2">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center active:opacity-50 p-2 -ml-2"
          >
            <Ionicons name="chevron-back" size={32} color={backTintColor} />
            <Text
              style={{
                color: backTintColor,
                fontSize: 17,
                fontWeight: "600",
                marginLeft: -4,
              }}
            >
              Volver
            </Text>
          </Pressable>
        </View>

        {/* TÍTULO */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="mb-8 items-center"
        >
          <Text
            className="text-4xl font-black text-white tracking-tighter uppercase"
            style={{ textShadowColor: theme.shadowColor, textShadowRadius: 15 }}
          >
            Lista <Text className={theme.primaryText}>{theme.name}</Text>
          </Text>
          <Text className="text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 text-xs text-center">
            {players.length === 0
              ? "Anota a los que van a dar jugo"
              : `Ya van ${players.length} sedientos inscritos`}
          </Text>
        </Animated.View>

        {/* 🗡️ INPUT RPG (Reclutamiento) */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="flex-row gap-3 mb-6 z-20"
          style={{ height: 65 }}
        >
          <View className="flex-1 bg-slate-900/90 rounded-2xl border-x-2 border-t-2 border-slate-700 border-b-[6px] border-slate-800 shadow-lg shadow-black/50 justify-center">
            <TextInput
              value={newPlayerName}
              onChangeText={setNewPlayerName}
              placeholder={
                players.length === 0
                  ? "Recluta al Dueño de casa..."
                  : "Anota a otro guerrero..."
              }
              placeholderTextColor="#64748b"
              className="px-5 font-bold"
              style={{ color: "#ffffff", fontSize: 18, height: "100%" }}
              onSubmitEditing={handleAddPlayer}
              returnKeyType="done"
            />
          </View>

          <AnimatedPressable
            onPress={handleAddPlayer}
            className={`${theme.primaryBg} px-6 justify-center items-center rounded-2xl border-x-2 border-t-2 ${theme.primaryBorder} border-b-[6px] ${theme.primaryBorderBottom} active:border-b-[2px] active:translate-y-1 h-full`}
          >
            <Ionicons
              name="person-add"
              size={24}
              color="#fff"
              style={{
                textShadowColor: "rgba(0,0,0,0.5)",
                textShadowRadius: 5,
              }}
            />
          </AnimatedPressable>
        </Animated.View>

        <ScrollView
          className="flex-1 z-10"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {players.length === 0 ? (
            <Animated.View
              entering={FadeInDown.delay(400)}
              className="items-center justify-center mt-10"
            >
              <Text className="text-6xl mb-4">👻</Text>
              <Text className="text-slate-500 font-bold text-xl uppercase tracking-widest text-center">
                Ni un alma weón...{"\n"}Anota a alguien
              </Text>
            </Animated.View>
          ) : (
            players.map((player: Player, index: number) => (
              <PlayerRow
                key={player.id}
                player={player}
                index={index}
                onToggleFuel={toggleFuel}
                onRemove={removePlayer}
                theme={theme}
              />
            ))
          )}
        </ScrollView>

        {/* 🚀 BOTÓN START DINÁMICO */}
        <AnimatedPressable
          onPress={handleStartGame}
          style={animatedStartBtn}
          className={`mt-2 h-24 rounded-[24px] justify-center items-center border-x-2 border-t-2 border-b-[8px] overflow-hidden relative shadow-2xl z-20
            ${players.length >= 2 ? `${theme.primaryBg} ${theme.primaryBorder} ${theme.primaryBorderBottom} active:border-b-2 active:translate-y-2 ${theme.shadowTailwind}` : "bg-slate-900 border-slate-700 border-b-slate-800 opacity-60 shadow-black"}`}
        >
          {players.length >= 2 && (
            <>
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0.1)",
                  "transparent",
                  "rgba(0,0,0,0.4)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <LinearGradient
                colors={[
                  "transparent",
                  theme.shadowColor.replace("0.8", "0.4"),
                  "transparent",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
            </>
          )}

          <View className="items-center">
            <Text
              className={`font-black text-2xl tracking-[0.1em] uppercase ${players.length >= 2 ? "text-white" : "text-slate-500"}`}
              style={
                players.length >= 2
                  ? {
                      textShadowColor: "rgba(0,0,0,0.6)",
                      textShadowOffset: { width: 0, height: 3 },
                      textShadowRadius: 4,
                    }
                  : {}
              }
            >
              {players.length >= 2 ? btnConfig.title : "FALTAN SEDIENTOS"}
            </Text>
            {players.length >= 2 && (
              <Text className="text-white/80 font-bold text-xs uppercase tracking-widest mt-1 bg-black/20 px-3 py-1 rounded-full">
                {btnConfig.subtitle}
              </Text>
            )}
          </View>
        </AnimatedPressable>
      </View>
    </KeyboardAvoidingView>
  );
}
