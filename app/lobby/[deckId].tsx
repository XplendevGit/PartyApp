import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Player, usePlayerStore } from "../../src/store/playerStore";

// Componente individual blindado para evitar el Crash de Reanimated + NativeWind
const AnimatedPlayerItem = ({
  player,
  onToggle,
  onRemove,
  index,
}: {
  player: Player;
  onToggle: any;
  onRemove: any;
  index: number;
}) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)
        .springify()
        .damping(14)}
      exiting={FadeOutDown.duration(200)}
      className="mb-3"
    >
      <LinearGradient
        colors={["#1e293b", "#0f172a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-row items-center p-4 rounded-3xl border-b-[6px] border-slate-950 border-x-2 border-slate-800 shadow-xl"
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            Haptics.selectionAsync();
            onToggle(player.id);
          }}
          className="bg-cyan-950 w-16 h-16 rounded-2xl items-center justify-center mr-4 border-[3px] border-cyan-800 shadow-inner"
        >
          <Text
            className="text-4xl"
            style={{
              textShadowColor: "rgba(6, 182, 212, 0.5)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}
          >
            {player.fuel}
          </Text>
        </TouchableOpacity>

        <View className="flex-1">
          <Text
            className="text-white font-black text-2xl uppercase tracking-tighter"
            style={{
              textShadowColor: "rgba(0,0,0,0.8)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 2,
            }}
          >
            {player.name}
          </Text>
          <Text className="text-cyan-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1">
            Gladiador Listo
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onRemove(player.id);
          }}
          className="bg-rose-500/10 w-12 h-12 rounded-full items-center justify-center border-2 border-rose-900/50 ml-2"
        >
          <Text className="text-rose-500 font-black text-xl">✕</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

export default function LobbyScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const insets = useSafeAreaInsets();
  const [newPlayerName, setNewPlayerName] = useState("");
  const { players, addPlayer, removePlayer, toggleFuel } = usePlayerStore();

  // Animación de latido para el botón principal
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    if (players.length >= 2) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 800 }),
          withTiming(1, { duration: 800 }),
        ),
        -1,
        true,
      );
    } else {
      pulseScale.value = withTiming(1);
    }
  }, [players.length]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleAddPlayer = () => {
    if (newPlayerName.trim().length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPlayer(newPlayerName.trim());
    setNewPlayerName("");
  };

  const handleStartGame = () => {
    if (players.length < 2) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert("¡La arena exige al menos 2 sacrificios!");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.replace(`/game/${deckId}`);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#020617" }}
    >
      <Stack.Screen
        options={{
          title: "RECLUTAMIENTO",
          headerStyle: { backgroundColor: "#020617" },
          headerTintColor: "#22d3ee",
          headerTitleStyle: { fontWeight: "900", fontSize: 20 },
          headerShadowVisible: false,
        }}
      />

      <View
        style={{
          paddingTop: 10,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 24,
        }}
        className="flex-1 px-5"
      >
        {/* Input Area */}
        <View className="flex-row gap-3 mb-6 relative z-10">
          <LinearGradient
            colors={["#0f172a", "#020617"]}
            className="flex-1 rounded-2xl border-2 border-slate-800 shadow-xl shadow-cyan-900/20"
          >
            <TextInput
              value={newPlayerName}
              onChangeText={setNewPlayerName}
              placeholder="Escribe un nombre..."
              placeholderTextColor="#475569"
              className="text-white px-5 py-5 font-black text-xl"
              onSubmitEditing={handleAddPlayer}
              autoCorrect={false}
            />
          </LinearGradient>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleAddPlayer}
            className="w-[72px] bg-cyan-600 justify-center items-center rounded-2xl border-b-[6px] border-cyan-900 active:border-b-0 active:translate-y-[6px] shadow-lg shadow-cyan-600/30"
          >
            <Text
              className="text-white text-4xl font-black"
              style={{
                textShadowColor: "rgba(0,0,0,0.5)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 2,
              }}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Jugadores */}
        <ScrollView
          className="flex-1 mt-2"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {players.length === 0 ? (
            <Animated.View
              entering={FadeInDown}
              className="items-center justify-center mt-20 opacity-40"
            >
              <Text className="text-8xl mb-4">👻</Text>
              <Text className="text-slate-500 font-black text-2xl uppercase tracking-widest text-center">
                Nadie se atreve...
              </Text>
            </Animated.View>
          ) : (
            players.map((player, index) => (
              <AnimatedPlayerItem
                key={player.id}
                player={player}
                index={index}
                onToggle={toggleFuel}
                onRemove={removePlayer}
              />
            ))
          )}
        </ScrollView>

        {/* Botón de Acción Pesado */}
        <Animated.View style={animatedButtonStyle} className="mt-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleStartGame}
            className={`py-6 rounded-3xl items-center border-b-[8px] border-x-2 border-t-2 relative overflow-hidden active:border-b-0 active:translate-y-[8px] transition-all ${players.length >= 2 ? "bg-emerald-500 border-emerald-900 border-x-emerald-400 border-t-emerald-300 shadow-2xl shadow-emerald-500/50" : "bg-slate-800 border-slate-950 border-x-slate-700 border-t-slate-700 opacity-80"}`}
          >
            {players.length >= 2 && (
              <LinearGradient
                colors={["rgba(255,255,255,0.2)", "transparent"]}
                className="absolute inset-0"
              />
            )}
            <Text
              className={`font-black text-3xl tracking-widest uppercase ${players.length >= 2 ? "text-white" : "text-slate-500"}`}
              style={
                players.length >= 2
                  ? {
                      textShadowColor: "rgba(0, 0, 0, 0.6)",
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 4,
                    }
                  : {}
              }
            >
              {players.length >= 2 ? "🔥 A LA ARENA 🔥" : "FALTAN VÍCTIMAS"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
