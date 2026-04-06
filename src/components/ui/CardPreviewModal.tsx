// components/ui/CardPreviewModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type GameMode = "PREVIA" | "DESTRUCCION" | "FAMILIAR" | "CITAS" | "HOT";

interface CardData {
  id: string;
  title: string;
  mode: GameMode;
  isUnlocked: boolean;
  icon: string;
  rarity: "COMUN" | "RARA" | "EPICA" | "LEGENDARIA";
  description?: string;
}

interface CardPreviewModalProps {
  card: CardData | null;
  onClose: () => void;
  theme: {
    bg: readonly [string, string, ...string[]];
    border: string;
    iconBg: string;
  };
  // AGREGADOS OPCIONALES PARA "LA FORJA"
  isActive?: boolean;
  onToggle?: (id: string) => void;
}

export default function CardPreviewModal({
  card,
  onClose,
  theme,
  isActive,
  onToggle,
}: CardPreviewModalProps) {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (card) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      rotateX.value = withSequence(
        withTiming(-10, { duration: 300 }),
        withSpring(0),
      );
      rotateY.value = withSequence(
        withTiming(10, { duration: 300 }),
        withSpring(0),
      );
    } else {
      scale.value = 0.8;
    }
  }, [card]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      rotateX.value = interpolate(
        event.y,
        [-200, 200],
        [25, -25],
        Extrapolation.CLAMP,
      );
      rotateY.value = interpolate(
        event.x,
        [-200, 200],
        [-25, 25],
        Extrapolation.CLAMP,
      );
    })
    .onEnd(() => {
      rotateX.value = withSpring(0, { damping: 10, stiffness: 80 });
      rotateY.value = withSpring(0, { damping: 10, stiffness: 80 });
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { scale: scale.value },
    ],
  }));

  const animatedGlareStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: rotateY.value * -3 },
      { translateY: rotateX.value * -3 },
    ],
    opacity: interpolate(
      Math.abs(rotateX.value) + Math.abs(rotateY.value),
      [0, 30],
      [0, 0.6],
      Extrapolation.CLAMP,
    ),
  }));

  if (!card) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="absolute inset-0 z-50 justify-center items-center"
      style={{ width, height }}
    >
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            animatedCardStyle,
            { width: width * 0.75, height: width * 1.15 },
          ]}
          className={`rounded-[32px] border-4 ${theme.border} shadow-2xl shadow-black bg-slate-900 overflow-hidden`}
        >
          <LinearGradient
            colors={theme.bg}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              animatedGlareStyle,
              { zIndex: 10 },
            ]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.4)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              locations={[0.3, 0.5, 0.7]}
              style={{
                flex: 1,
                transform: [{ scale: 1.5 }, { rotate: "45deg" }],
              }}
            />
          </Animated.View>

          <View className="flex-1 p-6 justify-between z-0">
            <View className="flex-row justify-between items-start">
              <View
                className={`${theme.iconBg} px-3 py-1.5 rounded-full border border-white/20`}
              >
                <Text className="text-white text-[10px] font-black tracking-widest uppercase">
                  {card.mode}
                </Text>
              </View>
              {card.rarity === "LEGENDARIA" && (
                <View className="bg-amber-500/90 px-3 py-1.5 rounded-full border border-amber-300">
                  <Text className="text-black text-[10px] font-black tracking-widest uppercase">
                    LEGENDARIA
                  </Text>
                </View>
              )}
            </View>

            <View className="items-center justify-center my-6">
              <View
                className={`w-32 h-32 rounded-full ${theme.iconBg} items-center justify-center border-4 border-white/10 shadow-lg`}
              >
                <Text style={{ fontSize: 64 }}>{card.icon}</Text>
              </View>
            </View>

            <View className="bg-black/40 p-4 rounded-2xl border border-white/10">
              <Text className="text-2xl font-black text-white text-center mb-2 uppercase tracking-wide">
                {card.title}
              </Text>
              <Text className="text-slate-300 text-center text-sm font-medium leading-5">
                {card.description ||
                  "El jugador que lea esta carta debe tomar 2 tragos o contar un secreto inconfesable."}
              </Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* CONTROLES INFERIORES: TOGGLE (SOLO SI SE PASA onToggle) Y CERRAR */}
      <Animated.View
        entering={SlideInDown.delay(200)}
        exiting={SlideOutDown}
        className="absolute bottom-10 w-full items-center px-8"
      >
        {onToggle && isActive !== undefined && (
          <AnimatedPressable
            onPress={() => onToggle(card.id)}
            className={`w-full max-w-[300px] mb-6 py-4 rounded-[24px] border-x-[3px] border-t-[3px] border-b-[8px] flex-row justify-center items-center shadow-xl active:border-b-[3px] active:translate-y-[5px] ${isActive ? "bg-rose-600 border-rose-400 border-b-rose-900 shadow-rose-900/50" : "bg-emerald-500 border-emerald-300 border-b-emerald-800 shadow-emerald-900/50"}`}
          >
            <Text className="text-white font-black text-xl tracking-[0.2em] uppercase">
              {isActive ? "🛑 DESACTIVAR" : "✅ ACTIVAR"}
            </Text>
          </AnimatedPressable>
        )}

        <Pressable
          onPress={onClose}
          className="w-14 h-14 bg-white/10 rounded-full items-center justify-center border border-white/20"
        >
          <Ionicons name="close" size={28} color="white" />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}
