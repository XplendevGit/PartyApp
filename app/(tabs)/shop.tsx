import TopHeader from "@/components/ui/TopHeader";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { useEffect } from "react";
import {
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

// 🧠 1. TIPADO ESTRICTO DE LA TIENDA
type ShopTheme = {
  bg: string;
  border: string;
  borderBottom: string;
  textTitle: string;
  particleColor: string;
  baseColor: string;
};

type ShopItemType = {
  id: string;
  title: string;
  amount: number;
  price: string;
  icon: string;
  type: "AD" | "BASIC" | "POPULAR" | "EPIC";
  tag?: string;
  theme: ShopTheme;
};

interface ShopCardProps {
  item: ShopItemType;
  index: number;
  onPress: (item: ShopItemType) => void;
}

// 2. DATA DE LA TIENDA (Mockup)
const SHOP_ITEMS: ShopItemType[] = [
  {
    id: "item-ad-001",
    title: "Mendigar Tapitas",
    amount: 20,
    price: "GRATIS",
    icon: "📺",
    type: "AD",
    tag: "VER ANUNCIO",
    theme: {
      bg: "bg-slate-900",
      border: "border-slate-700",
      borderBottom: "border-slate-600",
      textTitle: "text-slate-300",
      particleColor: "rgba(148, 163, 184, 0.2)",
      baseColor: "#94a3b8", // slate-400
    },
  },
  {
    id: "item-basic-002",
    title: "Puñado Piola",
    amount: 150,
    price: "$0.99",
    icon: "🪙",
    type: "BASIC",
    theme: {
      bg: "bg-cyan-950",
      border: "border-cyan-800",
      borderBottom: "border-cyan-700",
      textTitle: "text-cyan-400",
      particleColor: "rgba(34, 211, 238, 0.2)",
      baseColor: "#22d3ee", // cyan-400
    },
  },
  {
    id: "item-pop-003",
    title: "Botella Llena",
    amount: 500,
    price: "$2.99",
    icon: "🍾",
    type: "POPULAR",
    tag: "MÁS VENDIDO",
    theme: {
      bg: "bg-fuchsia-950",
      border: "border-fuchsia-600",
      borderBottom: "border-fuchsia-700",
      textTitle: "text-fuchsia-400",
      particleColor: "rgba(232, 121, 249, 0.4)",
      baseColor: "#e879f9", // fuchsia-400
    },
  },
  {
    id: "item-epic-004",
    title: "Barril VIP",
    amount: 2000,
    price: "$9.99",
    icon: "🛢️",
    type: "EPIC",
    tag: "MEJOR VALOR",
    theme: {
      bg: "bg-amber-950",
      border: "border-amber-500",
      borderBottom: "border-amber-600",
      textTitle: "text-amber-400",
      particleColor: "rgba(251, 191, 36, 0.5)",
      baseColor: "#fbbf24", // amber-400
    },
  },
];

// 3. COMPONENTE DE CARTA DE TIENDA
const ShopCard = ({ item, index, onPress }: ShopCardProps) => {
  const shimmerValue = useSharedValue(-width);
  const particle1Y = useSharedValue(0);
  const particle1Op = useSharedValue(0.5);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withDelay(
        index * 800,
        withTiming(width * 1.2, { duration: 2000, easing: Easing.linear }),
      ),
      -1,
      false,
    );

    if (item.type === "POPULAR" || item.type === "EPIC") {
      particle1Y.value = withRepeat(
        withSequence(
          withTiming(-20, { duration: 1200 + index * 100 }),
          withTiming(0, { duration: 1200 + index * 100 }),
        ),
        -1,
        true,
      );
      particle1Op.value = withRepeat(
        withSequence(
          withTiming(0.2, { duration: 1200 }),
          withTiming(0.8, { duration: 1200 }),
        ),
        -1,
        true,
      );
    }
  }, [item.type, index, shimmerValue, particle1Y, particle1Op]);

  const isPressed = useSharedValue(1);
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
  const animatedParticle = useAnimatedStyle(() => ({
    transform: [{ translateY: particle1Y.value }],
    opacity: particle1Op.value,
  }));

  const isPremium = item.type === "POPULAR" || item.type === "EPIC";

  return (
    <Animated.View
      entering={FadeInDown.delay(150 + index * 100)
        .springify()
        .damping(14)
        .stiffness(100)}
    >
      <Pressable
        onPressIn={() => {
          isPressed.value = 0.95;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => (isPressed.value = 1)}
        onPress={() => onPress(item)}
        className="mb-5 w-full"
      >
        <Animated.View
          style={animatedPressStyle}
          className={`w-full ${item.theme.bg} border-x-2 border-t-2 ${item.theme.border} border-b-[8px] ${item.theme.borderBottom} rounded-[24px] overflow-hidden relative shadow-xl shadow-black/80`}
        >
          {/* SHIMMER EFFECT */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              animatedShimmer,
              { pointerEvents: "none", zIndex: 5 },
            ]}
          >
            <LinearGradient
              colors={[
                "transparent",
                "rgba(255,255,255,0.05)",
                "rgba(255,255,255,0.15)",
                "rgba(255,255,255,0.05)",
                "transparent",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ ...StyleSheet.absoluteFillObject, width: "50%" }}
            />
          </Animated.View>

          {isPremium && (
            <LinearGradient
              colors={[
                `${item.theme.particleColor.replace("0.4", "0.2").replace("0.5", "0.2")}`,
                "transparent",
              ]}
              className="absolute inset-0 z-0"
              style={StyleSheet.absoluteFill}
            />
          )}

          <View className="p-5 flex-row items-center z-10">
            <View className="w-20 h-20 bg-black/40 rounded-2xl items-center justify-center mr-4 border border-white/10 relative">
              <Text
                className="text-5xl"
                style={
                  isPremium
                    ? {
                        textShadowColor: item.theme.particleColor,
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 15,
                      }
                    : {}
                }
              >
                {item.icon}
              </Text>
              {isPremium && (
                <Animated.View
                  style={[
                    animatedParticle,
                    {
                      position: "absolute",
                      top: 5,
                      right: 5,
                      width: 6,
                      height: 6,
                      backgroundColor: item.theme.baseColor,
                      borderRadius: 3,
                    },
                  ]}
                />
              )}
            </View>

            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <Text
                  className={`${item.theme.textTitle} font-black text-xl uppercase tracking-wider`}
                  style={{
                    textShadowColor: "rgba(0,0,0,0.5)",
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 3,
                  }}
                >
                  {item.title}
                </Text>

                {item.tag && (
                  <View
                    className={`${item.type === "AD" ? "bg-slate-700" : item.type === "POPULAR" ? "bg-fuchsia-600" : "bg-amber-500"} px-2 py-1 rounded-md`}
                  >
                    <Text className="text-white text-[10px] font-black">
                      {item.tag}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row items-baseline mt-1">
                <Text className="text-amber-400 font-black text-3xl mr-1">
                  {item.amount}
                </Text>
                <Text className="text-amber-400/80 font-bold text-sm">
                  Tapitas
                </Text>
              </View>
            </View>
          </View>

          {/* PRICE TAG BADGE (Bottom Right) */}
          <View
            className={`absolute bottom-0 right-0 ${item.theme.borderBottom.replace("border-", "bg-")} px-4 py-2 rounded-tl-xl`}
          >
            <Text className="text-white font-black text-lg">{item.price}</Text>
          </View>

          {/* PARTICLES FOR PREMIUM */}
          {isPremium && (
            <>
              <Animated.View
                style={[
                  animatedParticle,
                  {
                    position: "absolute",
                    bottom: "20%",
                    left: "30%",
                    width: 4,
                    height: 4,
                    backgroundColor: item.theme.baseColor,
                    borderRadius: 2,
                  },
                ]}
              />
              <Animated.View
                style={[
                  animatedParticle,
                  {
                    position: "absolute",
                    top: "15%",
                    left: "50%",
                    width: 5,
                    height: 5,
                    backgroundColor: item.theme.baseColor,
                    borderRadius: 3,
                  },
                ]}
              />
            </>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const currentTapitas = 150;

  // ATMÓSFERA VIVA
  const orb1X = useSharedValue(-50);
  const orb1Y = useSharedValue(-30);
  const orb2X = useSharedValue(100);
  const orb2Scale = useSharedValue(1);

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
  }, [orb1X, orb1Y, orb2X, orb2Scale]);

  const animatedOrb1 = useAnimatedStyle(() => ({
    transform: [{ translateX: orb1X.value }, { translateY: orb1Y.value }],
  }));
  const animatedOrb2 = useAnimatedStyle(() => ({
    transform: [{ translateX: orb2X.value }, { scale: orb2Scale.value }],
  }));

  const handlePurchase = (item: ShopItemType) => {
    if (item.type === "AD") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert("📺 Simulando Anuncio... ¡Ganaste 20 Tapitas!");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    alert(
      `🛒 Procesando pago de ${item.price} por ${item.title}... ¡Pronto RevenueCat!`,
    );
  };

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-[#020617] overflow-hidden"
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* FONDO MÁGICO */}
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
              backgroundColor: "rgba(251, 191, 36, 0.08)",
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
              backgroundColor: "rgba(232, 121, 249, 0.06)",
            },
          ]}
        />
      </View>

      {/* 👑 AQUI USAMOS EL NUEVO COMPONENTE GLOBAL */}
      <TopHeader tapitas={currentTapitas} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: insets.bottom + 120, // 👈 Se mantiene para dejarle espacio al Custom Tab Bar
        }}
        className="z-10"
      >
        {/* TÍTULO DE LA TIENDA */}
        <Animated.View
          entering={FadeInLeft.delay(100).springify()}
          className="mb-8 mt-2"
        >
          <Text
            className="text-5xl font-black text-white tracking-tighter mb-1"
            style={{
              textShadowColor: "rgba(245, 158, 11, 0.4)",
              textShadowOffset: { width: 0, height: 4 },
              textShadowRadius: 10,
            }}
          >
            TIENDA<Text className="text-amber-500"> VIP</Text>
          </Text>
          <Text className="text-slate-400 text-sm font-medium">
            Más tapitas = Más diversión. No seas cagado.
          </Text>
        </Animated.View>

        {/* LISTA DE PAQUETES */}
        <View className="pb-6">
          {SHOP_ITEMS.map((item, index) => (
            <ShopCard
              key={item.id}
              item={item}
              index={index}
              onPress={handlePurchase}
            />
          ))}
        </View>

        {/* FOOTER DE CONFIANZA */}
        <Animated.View
          entering={FadeInDown.delay(600)}
          className="items-center mt-4 opacity-50"
        >
          <Text className="text-slate-500 text-xs font-bold text-center">
            Pagos 100% Seguros
          </Text>
          <Text className="text-slate-600 text-[10px] text-center mt-1">
            Al comprar aceptas nuestros Términos y Condiciones
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
