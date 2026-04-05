import CardPreviewModal from "@/components/ui/CardPreviewModal"; // 👈 Tu nuevo componente 3D
import TopHeader from "@/components/ui/TopHeader";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React, { memo, useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // 👈 Fundamental para el 3D
import Animated, {
  FadeInDown,
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// 🧠 1. TIPOS ESTRICTOS (SOLID)
type GameMode = "PREVIA" | "DESTRUCCION" | "FAMILIAR" | "CITAS" | "HOT";

interface CardData {
  id: string;
  title: string;
  mode: GameMode;
  isUnlocked: boolean;
  icon: string;
  rarity: "COMUN" | "RARA" | "EPICA" | "LEGENDARIA";
  description?: string; // 👈 Añadido para el modal
}

// 🎨 2. MAPEO DE TEMAS POR MODO DE JUEGO (Escalable)
type ThemeDefinition = {
  bg: readonly [string, string, ...string[]];
  border: string;
  iconBg: string;
};

const MODE_THEMES: Record<GameMode, ThemeDefinition> = {
  PREVIA: {
    bg: ["#083344", "#164e63"], // cyan-950 to cyan-900
    border: "border-cyan-500",
    iconBg: "bg-cyan-500/20",
  },
  DESTRUCCION: {
    bg: ["#4a044e", "#701a75"], // fuchsia-950 to fuchsia-900
    border: "border-fuchsia-500",
    iconBg: "bg-fuchsia-500/20",
  },
  FAMILIAR: {
    bg: ["#022c22", "#064e3b"], // emerald-950 to emerald-900
    border: "border-emerald-500",
    iconBg: "bg-emerald-500/20",
  },
  CITAS: {
    bg: ["#4c0519", "#881337"], // rose-950 to rose-900
    border: "border-rose-500",
    iconBg: "bg-rose-500/20",
  },
  HOT: {
    bg: ["#450a0a", "#7f1d1d"], // red-950 to red-900
    border: "border-red-500",
    iconBg: "bg-red-500/20",
  },
};

// 📦 3. MOCKUP DE DATOS (Generamos 40 cartas para probar el rendimiento)
const MOCK_CARDS: CardData[] = Array.from({ length: 40 }).map((_, i) => {
  const modes: GameMode[] = [
    "PREVIA",
    "DESTRUCCION",
    "FAMILIAR",
    "CITAS",
    "HOT",
  ];
  const randomMode = modes[i % modes.length];
  const isUnlocked = i < 25; // Las primeras 25 están desbloqueadas

  return {
    id: `card-${i}`,
    title: `Castigo ${i + 1}`,
    description:
      "El jugador que lea esta carta debe tomar 2 tragos o contar un secreto inconfesable. ¡Tú decides!",
    mode: randomMode,
    isUnlocked,
    icon: isUnlocked ? ["🍻", "🔥", "🤡", "💖", "🌶️"][i % 5] : "❓",
    rarity: i % 7 === 0 ? "LEGENDARIA" : "COMUN", // 1 de cada 7 es legendaria
  };
});

// 🃏 4. COMPONENTE DE CARTA INDIVIDUAL (MEMOIZADO PARA 60FPS)
// Calculamos el ancho exacto para 4 columnas con márgenes
const NUM_COLUMNS = 4;
const GAP = 12;
const PADDING_HORIZONTAL = 20;
const CARD_WIDTH =
  (width - PADDING_HORIZONTAL * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const CARD_HEIGHT = CARD_WIDTH * 1.4; // Proporción clásica de carta de póker

interface CardGridItemProps {
  item: CardData;
  index: number;
  onPress: (card: CardData) => void;
}

const CardGridItem = memo(({ item, index, onPress }: CardGridItemProps) => {
  const isPressed = useSharedValue(1);
  const theme = MODE_THEMES[item.mode];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(isPressed.value, { damping: 15, stiffness: 200 }) },
    ],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 50, 500)).springify()}
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT, marginBottom: GAP }}
    >
      <Pressable
        onPressIn={() => {
          isPressed.value = 0.9;
          if (item.isUnlocked) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
        onPressOut={() => (isPressed.value = 1)}
        onPress={() => onPress(item)}
        className="flex-1"
      >
        <Animated.View
          style={[animatedStyle]}
          className={`flex-1 rounded-xl border-[1.5px] overflow-hidden justify-center items-center shadow-lg shadow-black ${
            item.isUnlocked ? theme.border : "border-slate-800 bg-slate-900/50"
          }`}
        >
          {item.isUnlocked ? (
            <>
              {/* Fondo Degradado de la Carta */}
              <LinearGradient
                colors={theme.bg}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />

              {/* Brillo Legendario (Placeholder visual) */}
              {item.rarity === "LEGENDARIA" && (
                <View className="absolute top-0 right-0 bg-amber-400 w-4 h-4 rounded-bl-full opacity-80" />
              )}

              {/* Contenido */}
              <View
                className={`w-10 h-10 rounded-full ${theme.iconBg} items-center justify-center border border-white/10 z-10`}
              >
                <Text className="text-xl">{item.icon}</Text>
              </View>

              {/* Micro indicador de modo */}
              <View className="absolute bottom-1.5 w-[80%] h-1 bg-white/20 rounded-full z-10" />
            </>
          ) : (
            // ESTADO BLOQUEADO
            <View className="flex-1 w-full items-center justify-center">
              <Ionicons name="lock-closed" size={24} color="#334155" />
              <View className="absolute bottom-0 w-full bg-slate-950 py-1">
                <Text className="text-slate-600 text-[8px] text-center font-black">
                  BLOQUEADA
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
});

CardGridItem.displayName = "CardGridItem";

// 🏛️ 5. PANTALLA PRINCIPAL
export default function CardsCollectionScreen() {
  const insets = useSafeAreaInsets();
  const currentTapitas = 150;

  // Estado para el Modal de Previsualización 3D
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  const handleCardPress = useCallback((card: CardData) => {
    if (!card.isUnlocked) {
      // Feedback negativo si está bloqueada
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.selectionAsync();
    setSelectedCard(card);
  }, []);

  // Optimización del renderizado de la lista
  const renderItem = useCallback(
    ({ item, index }: { item: CardData; index: number }) => (
      <CardGridItem item={item} index={index} onPress={handleCardPress} />
    ),
    [handleCardPress],
  );

  return (
    // 👈 Envolvemos todo para que los gestos funcionen
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-[#020617]">
        {/* 👇 Transición nativa desde la derecha */}
        <Stack.Screen
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />

        {/* HEADER COMPATIBLE */}
        <View style={{ paddingTop: insets.top }}>
          <TopHeader tapitas={currentTapitas} />
        </View>

        {/* TÍTULO Y SUBTÍTULO */}
        <View className="px-5 mt-2 mb-4">
          <Animated.View entering={FadeInLeft.delay(100).springify()}>
            <Text
              className="text-4xl font-black text-white tracking-tighter mb-1 uppercase"
              style={{
                textShadowColor: "rgba(255, 255, 255, 0.2)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 8,
              }}
            >
              TU <Text className="text-amber-400">ARSENAL</Text>
            </Text>
            <Text className="text-slate-400 text-sm font-medium">
              Junta todas las cartas y armamos el manso mambo.
            </Text>
          </Animated.View>

          {/* Estadísticas Rápidas */}
          <Animated.View
            entering={FadeInLeft.delay(200).springify()}
            className="mt-4 flex-row items-center"
          >
            <View className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg mr-3">
              <Text className="text-amber-400 font-black text-xs">
                25/40 DESBLOQUEADAS
              </Text>
            </View>
            <View className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
              <Text className="text-cyan-400 font-black text-xs">
                6 LEGENDARIAS
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* GRID DE CARTAS (RENDIMIENTO EXTREMO CON FLATLIST) */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          className="flex-1"
        >
          <FlatList
            data={MOCK_CARDS}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={NUM_COLUMNS}
            columnWrapperStyle={{
              gap: GAP,
              paddingHorizontal: PADDING_HORIZONTAL,
            }}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 100,
              paddingTop: 10,
            }}
            showsVerticalScrollIndicator={false}
            // Optimizaciones de memoria para listas largas:
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        </Animated.View>

        {/* 🚀 MODAL HOLOGRÁFICO 3D */}
        {selectedCard && (
          <CardPreviewModal
            card={selectedCard}
            theme={MODE_THEMES[selectedCard.mode]}
            onClose={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCard(null);
            }}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}
