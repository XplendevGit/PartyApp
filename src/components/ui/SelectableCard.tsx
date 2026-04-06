import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { CardData, DeckTheme } from "../../constants/decks";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 4;
const GAP = 12;
const PADDING_HORIZONTAL = 20;
export const CARD_WIDTH =
  (width - PADDING_HORIZONTAL * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
export const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface Props {
  item: CardData;
  theme: DeckTheme;
  onPress: (item: CardData) => void;
}

// SOLUCIÓN 1: Le damos un nombre explícito a la función dentro del memo()
export const SelectableCard = memo(function SelectableCard({
  item,
  theme,
  onPress,
}: Props) {
  const activeAnim = useSharedValue(item.isActive ? 1 : 0);

  useEffect(() => {
    activeAnim.value = withTiming(item.isActive ? 1 : 0, { duration: 200 });
    // SOLUCIÓN 2: Agregamos activeAnim a las dependencias para callar a ESLint
  }, [item.isActive, activeAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(activeAnim.value, [0, 1], [0.85, 1]) }],
    opacity: interpolate(activeAnim.value, [0, 1], [0.4, 1]),
  }));

  return (
    <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT, marginBottom: GAP }}>
      <Pressable onPress={() => onPress(item)} className="flex-1">
        <Animated.View
          style={animatedStyle}
          className={`flex-1 rounded-xl border-[1.5px] overflow-hidden justify-center items-center ${theme.border}`}
        >
          <LinearGradient
            colors={theme.bg}
            style={StyleSheet.absoluteFillObject}
          />
          <Text className="text-xl z-10">{item.icon}</Text>
          {!item.isActive && (
            <View className="absolute inset-0 bg-black/60 items-center justify-center z-20">
              <Ionicons name="eye-off" size={20} color="#94a3b8" />
            </View>
          )}
          {item.isActive && (
            <View className="absolute bottom-1 right-1 bg-emerald-500 rounded-full p-[2px] z-20">
              <Ionicons name="checkmark" size={8} color="white" />
            </View>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
});

SelectableCard.displayName = "SelectableCard";
