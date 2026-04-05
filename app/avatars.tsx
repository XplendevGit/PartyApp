// app/avatars.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    FadeInDown,
    FadeInUp,
    ZoomIn,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TopHeader from "../components/ui/TopHeader";
import { AVATARS_LIST, AvatarData } from "../constants/avatars";

export default function AvatarsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarData>(
    AVATARS_LIST[0],
  );

  const renderItem = ({ item, index }: { item: AvatarData; index: number }) => {
    const isSelected = selectedAvatar.id === item.id;

    return (
      <Animated.View
        entering={ZoomIn.delay(index * 50)}
        className="flex-1 m-1.5"
      >
        <Pressable
          onPress={() => setSelectedAvatar(item)}
          className={`aspect-square rounded-2xl border-2 items-center justify-center active:scale-95 transition-transform overflow-hidden
            ${isSelected ? "border-fuchsia-500" : "border-[#1e293b] bg-[#0f172a]"}
          `}
        >
          {isSelected && (
            <LinearGradient
              colors={["#4c1d95", "#020617"]}
              style={StyleSheet.absoluteFillObject}
            />
          )}

          <Text
            className="text-5xl"
            style={{ opacity: item.unlocked ? 1 : 0.4 }}
          >
            {item.icon}
          </Text>

          {!item.unlocked && (
            <View className="absolute inset-0 bg-black/40 items-center justify-center">
              <Ionicons name="lock-closed" size={24} color="#ef4444" />
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-[#020617]">
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ paddingTop: insets.top + 10 }} />
      <TopHeader tapitas={150} />

      {/* HEADER DE LA PANTALLA */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="px-5 mt-4 mb-2"
      >
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center mb-4 active:opacity-50"
        >
          <Ionicons name="chevron-back" size={24} color="#94a3b8" />
          <Text className="text-slate-400 font-semibold text-base ml-1">
            Atrás
          </Text>
        </Pressable>
        <Text className="text-4xl font-black text-white uppercase tracking-tighter">
          SALA DE <Text className="text-fuchsia-500">ESPEJOS</Text>
        </Text>
        <Text className="text-slate-400 text-sm mt-1">
          Desbloquea y equipa nuevas apariencias.
        </Text>
      </Animated.View>

      {/* GRID DE AVATARES */}
      <FlatList
        data={AVATARS_LIST}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingBottom: 180,
          paddingTop: 10,
        }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      {/* PANEL INFERIOR FIJO (Equipar / Comprar) */}
      <Animated.View
        entering={FadeInUp.duration(500).springify()}
        style={{ paddingBottom: insets.bottom + 20 }}
        className="absolute bottom-0 w-full px-5 bg-[#020617]/95 pt-5 border-t border-[#1e293b] shadow-2xl shadow-black"
      >
        <View className="flex-row items-center mb-5">
          <View className="w-16 h-16 bg-[#0f172a] rounded-full border-2 border-fuchsia-500 items-center justify-center mr-4">
            <Text className="text-3xl">{selectedAvatar.icon}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-black text-xl uppercase">
              {selectedAvatar.name}
            </Text>
            {selectedAvatar.unlocked ? (
              <Text className="text-emerald-400 font-bold text-xs uppercase tracking-widest mt-1">
                Desbloqueado
              </Text>
            ) : (
              <Text className="text-amber-500 font-bold text-xs uppercase tracking-widest mt-1">
                {selectedAvatar.cost
                  ? `Costo: ${selectedAvatar.cost} 🟡`
                  : `Evento: ${selectedAvatar.event}`}
              </Text>
            )}
          </View>
        </View>

        {selectedAvatar.unlocked ? (
          <Pressable className="w-full bg-fuchsia-600 py-4 rounded-2xl items-center border-b-4 border-black/30 flex-row justify-center space-x-2 active:scale-95 transition-transform">
            <Ionicons name="body-outline" size={24} color="white" />
            <Text className="text-white font-black text-lg tracking-widest uppercase ml-2">
              Equipar Avatar
            </Text>
          </Pressable>
        ) : (
          <Pressable
            disabled={!selectedAvatar.cost}
            className={`w-full py-4 rounded-2xl items-center border-b-4 border-black/30 flex-row justify-center space-x-2 active:scale-95 transition-transform
              ${selectedAvatar.cost ? "bg-amber-500" : "bg-slate-800 opacity-50"}
            `}
          >
            <Ionicons
              name={selectedAvatar.cost ? "cart" : "lock-closed"}
              size={24}
              color={selectedAvatar.cost ? "#020617" : "#94a3b8"}
            />
            <Text
              className={`font-black text-lg tracking-widest uppercase ml-2 ${selectedAvatar.cost ? "text-[#020617]" : "text-slate-400"}`}
            >
              {selectedAvatar.cost ? "Comprar Avatar" : "No Disponible"}
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}
