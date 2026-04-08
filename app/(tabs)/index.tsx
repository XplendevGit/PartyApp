import TopHeader from "@/src/components/ui/TopHeader";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Alert, // 👈 IMPORTADO PARA LA TIENDA
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 🟢 Importamos solo tus estados globales REALES
import { useAuthStore } from "@/src/store/authStore";
import { useDeckStore } from "@/src/store/deckStore";

const { width } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// 🧠 1. TIPADO ESTRICTO
export type DeckTheme = {
  bg: string;
  border: string;
  borderBottom: string;
  textTitle: string;
  textDesc: string;
  particleColor: string;
};

export type Deck = {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: "FREE" | "FREEMIUM" | "PREMIUM";
  cost: number;
  hasAccess: boolean;
  theme: DeckTheme;
};

interface DeckCardProps {
  deck: Deck;
  index: number;
  onPress: (deck: Deck) => void;
}

// 2. COMPONENTE DE TARJETA
const DeckCard = ({ deck, index, onPress }: DeckCardProps) => {
  const shimmerValue = useSharedValue(-width);
  const particle1Y = useSharedValue(0);
  const particle1Op = useSharedValue(0.5);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withDelay(
        index * 1000,
        withTiming(width * 1.5, { duration: 2500, easing: Easing.linear }),
      ),
      -1,
      false,
    );

    if (deck.type === "PREMIUM") {
      particle1Y.value = withRepeat(
        withSequence(
          withTiming(-15, { duration: 1500 + index * 100 }),
          withTiming(0, { duration: 1500 + index * 100 }),
        ),
        -1,
        true,
      );
      particle1Op.value = withRepeat(
        withSequence(
          withTiming(0.1, { duration: 1500 }),
          withTiming(0.6, { duration: 1500 }),
        ),
        -1,
        true,
      );
    }
  }, [deck.type, index, shimmerValue, particle1Y, particle1Op]);

  const isPressed = useSharedValue(1);
  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(isPressed.value, { damping: 10 }) },
      {
        translateY: withSpring(isPressed.value === 1 ? 0 : 8, { damping: 10 }),
      },
    ],
  }));

  const animatedShimmer = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerValue.value }],
  }));
  const animatedParticle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: particle1Y.value }],
    opacity: particle1Op.value,
  }));

  const isPremium = deck.type === "PREMIUM";

  return (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 150)
        .springify()
        .damping(12)
        .stiffness(110)}
    >
      <AnimatedPressable
        onPressIn={() => {
          isPressed.value = 0.96;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => (isPressed.value = 1)}
        onPress={() => onPress(deck)}
        style={animatedPressStyle}
        className={`w-full ${deck.theme.bg} border-x-2 border-t-2 ${deck.theme.border} border-b-[8px] ${deck.theme.borderBottom} rounded-[28px] overflow-hidden relative shadow-2xl shadow-black/80`}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            animatedShimmer,
            { pointerEvents: "none" },
          ]}
        >
          <LinearGradient
            colors={[
              "transparent",
              "rgba(255,255,255,0.03)",
              "rgba(255,255,255,0.08)",
              "rgba(255,255,255,0.03)",
              "transparent",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ ...StyleSheet.absoluteFillObject, width: "40%" }}
          />
        </Animated.View>

        {isPremium && (
          <LinearGradient
            colors={["rgba(249, 115, 22, 0.3)", "transparent"]}
            className="absolute inset-0 z-0"
            style={StyleSheet.absoluteFill}
          />
        )}

        <View className="p-5 flex-row items-center z-10">
          <View className="w-20 h-20 bg-black/40 rounded-2xl items-center justify-center mr-4 border border-white/5 relative">
            <Text
              className="text-5xl"
              style={
                isPremium
                  ? {
                      textShadowColor: "#ea580c",
                      textShadowOffset: { width: 0, height: 0 },
                      textShadowRadius: 20,
                    }
                  : {}
              }
            >
              {deck.icon}
            </Text>
            {isPremium && (
              <Animated.View
                style={[
                  animatedParticle1,
                  {
                    position: "absolute",
                    top: 5,
                    right: 5,
                    width: 6,
                    height: 6,
                    backgroundColor: "#ea580c",
                    borderRadius: 3,
                  },
                ]}
              />
            )}
          </View>

          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text
                className={`${deck.theme.textTitle} font-black text-2xl uppercase tracking-wider`}
                style={{
                  textShadowColor: "rgba(0,0,0,0.5)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 3,
                }}
              >
                {deck.title}
              </Text>

              {deck.type === "FREEMIUM" && (
                <Animated.View
                  entering={ZoomIn.delay(600).springify()}
                  className="bg-fuchsia-500/20 px-2 py-1 rounded-md border border-fuchsia-500/50 flex-row items-center"
                >
                  <Text className="text-fuchsia-300 text-[10px] font-black mr-1">
                    REWARD
                  </Text>
                  <Text className="text-fuchsia-300 text-xs font-black">
                    📺 AD
                  </Text>
                </Animated.View>
              )}
              {deck.type === "PREMIUM" && (
                <Animated.View
                  entering={ZoomIn.delay(800).springify()}
                  className="bg-amber-500/20 px-2 py-1 rounded-md border border-amber-500/50 flex-row items-center"
                >
                  <Text className="text-amber-400 text-xs font-black mr-1">
                    {deck.cost}
                  </Text>
                  <Text className="text-xs">🟡</Text>
                </Animated.View>
              )}
            </View>

            <Text
              className={`${deck.theme.textDesc} mt-2 font-medium leading-5 text-sm`}
            >
              {deck.description}
            </Text>
          </View>
        </View>

        {isPremium && (
          <>
            <Animated.View
              style={[
                animatedParticle1,
                {
                  position: "absolute",
                  bottom: "15%",
                  left: "30%",
                  width: 3,
                  height: 3,
                  backgroundColor: deck.theme.particleColor,
                  borderRadius: 2,
                },
              ]}
            />
            <Animated.View
              style={[
                animatedParticle1,
                {
                  position: "absolute",
                  top: "15%",
                  left: "50%",
                  width: 4,
                  height: 4,
                  backgroundColor: deck.theme.particleColor,
                  borderRadius: 2,
                },
              ]}
            />
            <Animated.View
              style={[
                animatedParticle1,
                {
                  position: "absolute",
                  bottom: "25%",
                  right: "10%",
                  width: 5,
                  height: 5,
                  backgroundColor: deck.theme.particleColor,
                  borderRadius: 3,
                },
              ]}
            />
          </>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
};

export default function IndexScreen() {
  const insets = useSafeAreaInsets();

  // 🟢 3. EXTRAEMOS ESTADOS GLOBALES ESTRICTOS
  const { user } = useAuthStore();
  const { decks, isLoading, error, fetchDecks } = useDeckStore();

  const tapitas = (user as any)?.tapitas_balance ?? 0;

  const orb1X = useSharedValue(-50);
  const orb1Y = useSharedValue(-30);
  const orb2X = useSharedValue(100);
  const orb2Scale = useSharedValue(1);
  const neonShadowOp = useSharedValue(1);

  useEffect(() => {
    if (user) {
      fetchDecks();
    }
  }, [user]);

  useEffect(() => {
    orb1X.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 15000, easing: Easing.linear }),
        withTiming(-50, { duration: 15000, easing: Easing.linear }),
      ),
      -1,
      true,
    );
    orb1Y.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 18000, easing: Easing.linear }),
        withTiming(-30, { duration: 18000, easing: Easing.linear }),
      ),
      -1,
      true,
    );
    orb2X.value = withRepeat(
      withSequence(
        withTiming(-100, { duration: 20000, easing: Easing.linear }),
        withTiming(100, { duration: 20000, easing: Easing.linear }),
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

    neonShadowOp.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 150 }),
        withTiming(1, { duration: 100 }),
        withTiming(0.7, { duration: 100 }),
        withTiming(1, { duration: 2000, easing: Easing.elastic(1) }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedOrb1 = useAnimatedStyle(() => ({
    transform: [{ translateX: orb1X.value }, { translateY: orb1Y.value }],
  }));
  const animatedOrb2 = useAnimatedStyle(() => ({
    transform: [{ translateX: orb2X.value }, { scale: orb2Scale.value }],
  }));
  const animatedTitleNeon = useAnimatedStyle(() => ({
    textShadowColor: `rgba(6, 182, 212, ${neonShadowOp.value})`,
    textShadowRadius: withTiming(neonShadowOp.value * 12, { duration: 100 }),
  }));

  // 🔥 5. LA TIENDA REAL (CERO HARDCODEO)
  const handleSelectDeck = (deck: Deck) => {
    if (!deck.hasAccess) {
      if (deck.type === "PREMIUM") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        Alert.alert(
          "🔒 Mazo Premium",
          `¿Quieres desbloquear el mazo '${deck.title}' por ${deck.cost} Tapitas?`,
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Comprar",
              style: "default",
              onPress: async () => {
                if (!user) return;

                if (tapitas >= deck.cost) {
                  // Llamamos a la lógica real que agregamos en el store
                  const success = await useDeckStore
                    .getState()
                    .unlockPremiumDeck(deck.id, deck.cost, user.id);

                  if (success) {
                    Haptics.notificationAsync(
                      Haptics.NotificationFeedbackType.Success,
                    );
                    Alert.alert(
                      "¡Éxito!",
                      "Mazo desbloqueado para siempre. ¡A beber!",
                    );

                    // Si tienes un método para refrescar al usuario y actualizar el balance visual, llámalo aquí:
                    // (useAuthStore.getState() as any).fetchUser?.();
                  } else {
                    Alert.alert(
                      "Error",
                      useDeckStore.getState().error ||
                        "Ocurrió un error en la compra.",
                    );
                  }
                } else {
                  Alert.alert(
                    "Pobre",
                    "No tienes suficientes Tapitas. ¡Juega más para ganar o recarga!",
                  );
                }
              },
            },
          ],
        );
        return;
      }

      if (deck.type === "FREEMIUM") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          "📺 Freemium",
          "Ver un anuncio de 30s para jugar. ¡Pronto AdMob!",
        );
        return;
      }
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push(`/players/${deck.id}`);
  };

  if (!user || isLoading) {
    return (
      <View className="flex-1 bg-[#020617] justify-center items-center">
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#020617] justify-center items-center px-5">
        <Text className="text-rose-500 text-xl font-bold text-center mb-4">
          Error de Conexión
        </Text>
        <Text className="text-white text-center">{error}</Text>
      </View>
    );
  }

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-[#020617] overflow-hidden"
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={StyleSheet.absoluteFillObject}
        className="opacity-30 pointer-events-none"
      >
        <Animated.View
          style={[
            animatedOrb1,
            {
              position: "absolute",
              top: "10%",
              right: "-10%",
              width: 400,
              height: 400,
              borderRadius: 200,
              backgroundColor: "rgba(56, 189, 248, 0.12)",
            },
          ]}
        />
        <Animated.View
          style={[
            animatedOrb2,
            {
              position: "absolute",
              bottom: "0%",
              left: "-20%",
              width: 500,
              height: 500,
              borderRadius: 250,
              backgroundColor: "rgba(244, 63, 94, 0.08)",
            },
          ]}
        />
      </View>

      <TopHeader tapitas={tapitas} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: insets.bottom + 120,
        }}
        className="z-10"
      >
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="mb-10 items-center"
        >
          <Animated.Text
            className="text-5xl font-black text-white tracking-tighter mb-1"
            style={[
              { textShadowOffset: { width: 0, height: 4 } },
              animatedTitleNeon,
            ]}
          >
            PARTY<Text className="text-cyan-400">APP</Text>
          </Animated.Text>
          <Text
            className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] text-center"
            style={{
              textShadowColor: "rgba(0,0,0,0.8)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 2,
            }}
          >
            Elige tu veneno
          </Text>
        </Animated.View>

        <View className="gap-5 pb-6">
          {decks.map((deck, index) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              index={index}
              onPress={handleSelectDeck}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
