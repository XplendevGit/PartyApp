import { Href, router } from "expo-router";
import { Pressable, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface TopHeaderProps {
  tapitas?: number;
}

export default function TopHeader({ tapitas = 150 }: TopHeaderProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      className="flex-row justify-between items-center px-6 py-2 z-50"
    >
      <Pressable
        onPress={() => router.push("/profile" as Href)}
        className="w-12 h-12 bg-slate-800 rounded-full border-2 border-slate-700 items-center justify-center active:scale-95 transition-transform shadow-lg shadow-black"
      >
        <Text className="text-xl">👤</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/shop")}
        className="bg-amber-950/80 border-2 border-amber-500/50 px-4 py-2 rounded-full flex-row items-center active:scale-95 transition-transform shadow-lg shadow-amber-500/20"
      >
        <Text
          className="text-amber-400 font-black text-lg mr-2"
          style={{
            textShadowColor: "rgba(0,0,0,0.5)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 1,
          }}
        >
          {tapitas}
        </Text>
        <Text className="text-xl">🟡</Text>
      </Pressable>
    </Animated.View>
  );
}
