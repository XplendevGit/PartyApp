import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { memo, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  FadeInDown,
  ZoomIn,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DECK_THEMES, DeckTheme } from "../../constants/gameThemes";
import { useGameEngine } from "../../hooks/useGameEngine";

// ==========================================
// COLORES (Se adaptarán al jugador si tiene la propiedad 'color')
// ==========================================
const FALLBACK_COLORS = [
  "#E028E0",
  "#00D8D8",
  "#32D914",
  "#F56016",
  "#E82C8F",
  "#E5E500",
];

const getPlayerColor = (player: any) => {
  if (player?.color) return player.color; // Si ya tienes colores en selección, los usará
  if (!player?.name) return FALLBACK_COLORS[0];
  let hash = 0;
  for (let i = 0; i < player.name.length; i++) {
    hash = player.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
};

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.82;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Interactive3DCardProps {
  content: string;
  penalty: string;
  index: number;
  theme: DeckTheme;
}

const Interactive3DCard = memo(
  ({ content, penalty, index, theme }: Interactive3DCardProps) => {
    const rotateX = useSharedValue(0);
    const rotateY = useSharedValue(0);
    const isTouching = useSharedValue(0);

    const pan = Gesture.Pan()
      .manualActivation(true)
      .onTouchesDown((evt, state) => {
        isTouching.value = withTiming(1, { duration: 150 });
        state.activate();
      })
      .onChange((event) => {
        // Rotación más contenida para no forzar el renderizado 3D
        rotateY.value = interpolate(
          event.x,
          [0, CARD_WIDTH],
          [-8, 8],
          Extrapolation.CLAMP,
        );
        rotateX.value = interpolate(
          event.y,
          [0, CARD_HEIGHT],
          [8, -8],
          Extrapolation.CLAMP,
        );
      })
      .onFinalize(() => {
        isTouching.value = withTiming(0, { duration: 200 });
        rotateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        rotateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      });

    const animatedWrapperStyle = useAnimatedStyle(() => ({
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      alignSelf: "center",
      transform: [
        { perspective: 1000 },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
        { scale: interpolate(isTouching.value, [0, 1], [1, 0.96]) },
      ],
    }));

    return (
      <GestureDetector gesture={pan}>
        <Animated.View style={animatedWrapperStyle}>
          <LinearGradient
            colors={theme.cardGradients}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 p-[2px] shadow-2xl shadow-black"
            style={{ borderRadius: 36, elevation: 15 }}
          >
            <View className="flex-1 bg-[#020617] rounded-[34px] relative overflow-hidden justify-center items-center px-5 py-6">
              <View className="absolute top-6 left-6 flex-row items-center justify-center bg-black/30 px-3 py-1.5 rounded-full border border-white/5 z-20">
                <Text className="text-slate-400 font-bold text-xs uppercase mr-1">
                  Nº
                </Text>
                <Text className="text-white font-black text-sm">
                  {String(index + 1)}
                </Text>
              </View>

              <View className="absolute top-10 items-center justify-center w-full opacity-5 pointer-events-none">
                <Ionicons name="flash" size={140} color={theme.accent} />
              </View>

              <View className="items-center z-10 w-full px-2 mt-8">
                <Text
                  className={`${theme.primaryText} font-black text-[10px] uppercase tracking-[0.5em] mb-6 text-center opacity-80`}
                >
                  Desafío
                </Text>

                <Text
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                  numberOfLines={6}
                  className="text-3xl text-white font-black text-center leading-tight tracking-tighter uppercase"
                >
                  {String(content)}
                </Text>

                {penalty ? (
                  <View className="mt-8 bg-rose-500/5 px-4 py-3 rounded-2xl border border-rose-500/20 w-full">
                    <Text className="text-rose-400 font-black text-xs text-center uppercase tracking-widest mb-1 opacity-70">
                      Penalización
                    </Text>
                    <Text className="text-slate-200 font-bold text-sm text-center">
                      Si no cumples: {String(penalty)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    );
  },
);

Interactive3DCard.displayName = "Interactive3DCard";

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useMemo(
    () => DECK_THEMES[id as string] || DECK_THEMES["default"],
    [id],
  );

  const {
    isLoading,
    players,
    currentCardIndex,
    currentPlayer,
    processedContent,
    processedPenalty,
    isProcessingAction,
    setIsProcessingAction,
    handleAction,
  } = useGameEngine(id);

  // ==========================================
  // ANIMACIONES OPTIMIZADAS
  // ==========================================
  const floatY = useSharedValue(0);
  const activeColor = useSharedValue(theme.accent);
  const flashOpacity = useSharedValue(0);
  const nameScale = useSharedValue(1);

  // Valores compartidos para la transición fluida de la carta (SIN Layout Animations)
  const cardTranslateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  const cardRotateZ = useSharedValue(0);

  // Flotar suave en Y constante
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2500 }),
        withTiming(6, { duration: 2500 }),
      ),
      -1,
      true,
    );
  }, []);

  // Actualizar color y nombre sin interrumpir la carta
  useEffect(() => {
    if (currentPlayer) {
      activeColor.value = withTiming(getPlayerColor(currentPlayer), {
        duration: 600,
      });
      nameScale.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withSpring(1, { damping: 12, stiffness: 100 }),
      );
    }
  }, [currentPlayer]);

  // ORQUESTACIÓN DE ENTRADA DE CARTA
  // Se dispara cuando el índice cambia (después de que handleAction actualiza los datos)
  useEffect(() => {
    if (currentCardIndex >= 0) {
      // 1. Ocultamos la carta y la mandamos a la derecha al instante
      cardTranslateX.value = width;
      cardRotateZ.value = 10;
      cardOpacity.value = 0;

      // 2. La traemos al centro con un rebote elegante y restauramos opacidad
      cardTranslateX.value = withSpring(0, {
        damping: 18,
        stiffness: 120,
        mass: 0.8,
      });
      cardRotateZ.value = withSpring(0, {
        damping: 18,
        stiffness: 120,
        mass: 0.8,
      });
      cardOpacity.value = withTiming(1, { duration: 250 });
    }
  }, [currentCardIndex]);

  // ==========================================
  // ESTILOS ANIMADOS
  // ==========================================
  const animatedCardContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cardTranslateX.value },
      { translateY: floatY.value },
      { rotateZ: `${cardRotateZ.value}deg` },
    ],
    opacity: cardOpacity.value,
    justifyContent: "center",
    alignItems: "center",
  }));

  const animatedNeonBorderStyle = useAnimatedStyle(() => ({
    borderColor: activeColor.value,
    opacity: 0.2, // Súper sutil, no invasivo
  }));

  const animatedPlayerNameStyle = useAnimatedStyle(() => ({
    color: activeColor.value,
    transform: [{ scale: nameScale.value }],
  }));

  const animatedFlashStyle = useAnimatedStyle(() => ({
    backgroundColor: activeColor.value,
    opacity: flashOpacity.value,
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    borderColor: `${activeColor.value}40`,
  }));

  const animatedButtonTextStyle = useAnimatedStyle(() => ({
    color: activeColor.value,
  }));

  // ==========================================
  // LA MAGIA DE LA TRANSICIÓN
  // ==========================================
  const handleNextTurn = () => {
    if (isProcessingAction) return;
    setIsProcessingAction(true); // Bloqueamos el botón

    // Destello muy sutil (Experiencia de Usuario Suave)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    flashOpacity.value = withSequence(
      withTiming(0.12, { duration: 100 }),
      withTiming(0, { duration: 400 }),
    );

    // Animamos la carta hacia afuera (izquierda) PRIMERO, antes de cambiar los datos
    cardTranslateX.value = withTiming(-width, { duration: 250 });
    cardRotateZ.value = withTiming(-10, { duration: 250 });
    cardOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        // Una vez que la carta desapareció, cambiamos los datos en JS
        runOnJS(handleAction)("success");
      }
    });
  };

  if (isLoading || !players || players.length === 0) {
    return (
      <View className="flex-1 bg-[#020617] items-center justify-center">
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-[#020617]">
        <Stack.Screen options={{ headerShown: false }} />

        {/* DESTELLO SUAVE (Max 12% opacidad) */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { zIndex: 100 },
            animatedFlashStyle,
          ]}
        />

        {/* MARCO NEÓN AMBIENTAL */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { borderWidth: 1, borderRadius: 24, margin: 8, zIndex: 90 },
            animatedNeonBorderStyle,
          ]}
        />

        {/* ORBES DE RENDIMIENTO MAXIMO (Sin Blur) */}
        <View
          style={StyleSheet.absoluteFillObject}
          className="pointer-events-none opacity-20"
        >
          <View
            style={{
              position: "absolute",
              top: "-10%",
              left: "-20%",
              width: 400,
              height: 400,
              borderRadius: 200,
              backgroundColor: theme.bgOrbs[0],
              opacity: 0.3,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: "-10%",
              right: "-20%",
              width: 450,
              height: 450,
              borderRadius: 225,
              backgroundColor: theme.bgOrbs[1],
              opacity: 0.3,
            }}
          />
        </View>

        <View style={{ paddingTop: insets.top, flex: 1 }}>
          {/* HEADER */}
          <Animated.View
            entering={FadeInDown.duration(300)}
            className="px-5 py-3 flex-row justify-between items-center z-50"
          >
            <Pressable
              onPress={() => router.back()}
              className="w-12 h-12 bg-white/5 rounded-full items-center justify-center border border-white/5 active:scale-90"
            >
              <Ionicons name="close" size={24} color="#64748b" />
            </Pressable>
            <View className="items-center">
              <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                Mazo Activo
              </Text>
              <Text
                className={`${theme.primaryText} font-black text-lg tracking-widest uppercase`}
              >
                {String(theme.name)}
              </Text>
            </View>
            <View className="w-12 h-12" />
          </Animated.View>

          {/* INDICADOR DE JUGADOR */}
          {currentPlayer && (
            <Animated.View
              entering={ZoomIn.duration(400)}
              className="px-5 mt-2 z-10 items-center"
            >
              <View className="bg-[#0f172a]/60 border border-slate-700/30 rounded-full flex-row items-center py-2 px-6">
                <View className="w-10 h-10 bg-slate-800/80 rounded-full items-center justify-center border border-slate-600/50 mr-3">
                  <Text className="text-base opacity-80">👤</Text>
                </View>
                <View className="mr-6">
                  <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">
                    Turno de
                  </Text>
                  <Animated.Text
                    className="font-black text-xl uppercase leading-tight"
                    style={animatedPlayerNameStyle}
                  >
                    {String(currentPlayer.name)}
                  </Animated.Text>
                </View>
                <View className="bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 flex-row items-center">
                  <Text className="text-amber-400/90 font-black text-sm mr-1">
                    {String(currentPlayer.fuel)}
                  </Text>
                  <Text className="text-sm opacity-80">🟡</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* TARJETA 3D ORQUESTADA */}
          <Animated.View
            style={[animatedCardContainerStyle, { flex: 1, zIndex: 20 }]}
          >
            <Interactive3DCard
              content={processedContent || ""}
              penalty={processedPenalty || ""}
              index={currentCardIndex}
              theme={theme}
            />
          </Animated.View>

          {/* BOTÓN SIGUIENTE */}
          <View
            style={{ paddingBottom: insets.bottom + 20 }}
            className="px-6 pt-4 w-full z-50"
          >
            <AnimatedPressable
              disabled={isProcessingAction}
              onPress={handleNextTurn}
              className={`w-full bg-[#0f172a]/80 rounded-2xl py-4 items-center justify-center active:scale-95 transition-transform border ${isProcessingAction ? "opacity-50" : ""}`}
              style={animatedButtonStyle}
            >
              <Animated.Text
                className="font-black text-xl tracking-widest uppercase"
                style={animatedButtonTextStyle}
              >
                Siguiente Turno
              </Animated.Text>
              <Text className="text-slate-400 font-bold text-[10px] mt-1.5 uppercase tracking-widest opacity-70">
                Pasa el teléfono
              </Text>
            </AnimatedPressable>
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
