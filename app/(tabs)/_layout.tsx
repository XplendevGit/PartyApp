import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { Dimensions, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

// 🧩 1. COMPONENTE DEL BOTÓN INDIVIDUAL (Animado)
const TabBarButton = ({
  isFocused,
  label,
  icon,
  onPress,
  isCenter = false,
}: {
  isFocused: boolean;
  label: string;
  icon: string;
  onPress: () => void;
  isCenter?: boolean;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(scale.value, { damping: 12, stiffness: 200 }) },
    ],
  }));

  const handlePressIn = () => {
    scale.value = 0.85;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = 1;
  };

  // 🌟 Diseño especial para el botón central (JUGAR)
  if (isCenter) {
    return (
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        className="top-[-20px] justify-center items-center z-50"
      >
        <Animated.View
          style={animatedStyle}
          className="w-20 h-20 bg-amber-500 rounded-full border-[6px] border-[#020617] items-center justify-center shadow-2xl shadow-amber-500/50"
        >
          <Text className="text-4xl">{icon}</Text>
        </Animated.View>
        <Text className="text-amber-500 font-black text-[10px] mt-1 tracking-widest uppercase">
          {label}
        </Text>
      </Pressable>
    );
  }

  // 🌟 Diseño para los botones normales
  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      className="flex-1 justify-center items-center"
    >
      <Animated.View style={animatedStyle} className="items-center">
        <Text
          className={`text-2xl mb-1 ${isFocused ? "opacity-100" : "opacity-40"}`}
          style={
            isFocused
              ? {
                  textShadowColor: "#fbbf24",
                  textShadowRadius: 10,
                  textShadowOffset: { width: 0, height: 0 },
                }
              : {}
          }
        >
          {icon}
        </Text>
        <Text
          className={`text-[10px] font-black uppercase tracking-wider ${
            isFocused ? "text-amber-400" : "text-slate-500"
          }`}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

// 🧩 2. LA BARRA DE NAVEGACIÓN PERSONALIZADA
const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  return (
    <View className="absolute bottom-6 w-full items-center px-6 pb-2 pointer-events-box-none">
      <View className="flex-row w-full h-20 bg-slate-900/95 border-t-2 border-slate-800 rounded-[32px] items-center justify-around px-2 shadow-2xl shadow-black">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Iconos temporales basados en el nombre de la ruta
          let icon = "❓";
          let label = route.name;
          let isCenter = false;

          if (route.name === "index") {
            icon = "🏠";
            label = "Lobby";
          }
          if (route.name === "shop") {
            icon = "🛒";
            label = "Tienda";
          }
          if (route.name === "play") {
            icon = "▶️";
            label = "Jugar";
            isCenter = true;
          }
          if (route.name === "ranking") {
            icon = "🏆";
            label = "Ranking";
          }
          if (route.name === "profile") {
            icon = "👤";
            label = "Perfil";
          }

          // Para no renderizar rutas ocultas (como _sitemap)
          if (["_sitemap", "+not-found"].includes(route.name)) return null;

          return (
            <TabBarButton
              key={route.key}
              isFocused={isFocused}
              label={label}
              icon={icon}
              onPress={onPress}
              isCenter={isCenter}
            />
          );
        })}
      </View>
    </View>
  );
};

// 🧩 3. EL LAYOUT PRINCIPAL QUE CONECTA TODO
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Evita que la pantalla se dibuje debajo de la navbar opaca si no lo deseas
        // tabBarStyle: { display: 'none' } <- Ya no es necesario porque usamos tabBar custom
      }}
    >
      {/* AQUÍ DEFINES EL ORDEN DE TUS PESTAÑAS 
        Asegúrate de tener los archivos index.tsx, shop.tsx, play.tsx, etc.
      */}
      <Tabs.Screen name="index" />
      <Tabs.Screen name="shop" />
      <Tabs.Screen name="play" />
      <Tabs.Screen name="ranking" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
