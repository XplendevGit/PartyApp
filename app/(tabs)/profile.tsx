// app/(tabs)/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, Stack, router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  BounceIn,
  FadeInDown,
  FadeInRight,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TopHeader from "../../src/components/ui/TopHeader";
import { AVATARS_LIST, AvatarData } from "../../src/constants/avatars";

// Mock del usuario (luego vendrá de Zustand/DB)
const USER_STATS = {
  level: 12,
  title: "Alma de la Fiesta",
  xp: 8500,
  xpNext: 10000,
  gamesPlayed: 142,
  punishments: 87,
  timePlayed: "45h",
  favDeck: "Destrucción",
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [activeAvatar, setActiveAvatar] = useState<AvatarData>(AVATARS_LIST[1]);

  const xpPercentage = (USER_STATS.xp / USER_STATS.xpNext) * 100;

  return (
    <View className="flex-1 bg-[#020617]">
      <Stack.Screen options={{ headerShown: false }} />

      {/* FONDO RPG ESPECTACULAR */}
      <LinearGradient
        colors={["#1e1b4b", "#020617", "#020617"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={{ paddingTop: insets.top + 10 }} />
      <TopHeader tapitas={150} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* TÍTULO (Sin botón volver) */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          className="px-5 mt-4 mb-6"
        >
          <Text className="text-4xl font-black text-white uppercase tracking-tighter">
            TU <Text className="text-fuchsia-500">LEYENDA</Text>
          </Text>
          <Text className="text-slate-400 text-sm mt-1">
            El registro inmutable de tus hazañas.
          </Text>
        </Animated.View>

        {/* AVATAR Y NIVEL ARREGLADO */}
        <View className="items-center mb-8 px-5">
          {/* Añadimos pb-4 al contenedor relativo para que la placa tenga su propio espacio */}
          <Animated.View
            entering={BounceIn.delay(200).springify()}
            className="items-center justify-center relative pb-4"
          >
            <View className="absolute w-32 h-32 bg-fuchsia-500/20 rounded-full blur-2xl top-0" />

            <View className="w-28 h-28 bg-[#0f172a] rounded-full border-4 border-fuchsia-500 items-center justify-center shadow-lg shadow-fuchsia-500/50 z-10 overflow-hidden">
              <LinearGradient
                colors={["#2e1065", "#020617"]}
                style={StyleSheet.absoluteFillObject}
              />
              {/* Le damos un poco de margin bottom al emoji para que suba visualmente */}
              <Text className="text-6xl mb-2">{activeAvatar.icon}</Text>
            </View>

            {/* Placa de Nivel posicionada exactamente en el borde inferior */}
            <View className="absolute bottom-0 bg-amber-500 px-4 py-1 rounded-full border-2 border-[#020617] z-20 shadow-md shadow-black">
              <Text className="text-[#020617] font-black text-sm uppercase">
                Nvl. {USER_STATS.level}
              </Text>
            </View>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(300)}
            className="text-2xl font-black text-white mt-2"
          >
            {USER_STATS.title}
          </Animated.Text>

          {/* Barra XP */}
          <Animated.View
            entering={FadeInDown.delay(400)}
            className="w-full mt-4"
          >
            <View className="flex-row justify-between mb-1">
              <Text className="text-slate-400 font-bold text-xs">XP TOTAL</Text>
              <Text className="text-fuchsia-400 font-bold text-xs">
                {USER_STATS.xp} / {USER_STATS.xpNext}
              </Text>
            </View>
            <View className="w-full h-3 bg-[#0f172a] rounded-full overflow-hidden border border-slate-800">
              <LinearGradient
                colors={["#d946ef", "#8b5cf6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: `${xpPercentage}%`, height: "100%" }}
              />
            </View>
          </Animated.View>
        </View>

        {/* ESTADÍSTICAS (Mismo código tuyo) */}
        <View className="px-5 mb-8">
          <Animated.Text
            entering={FadeInDown.delay(500)}
            className="text-slate-500 font-black tracking-widest uppercase mb-4 text-sm"
          >
            Estadísticas de Batalla
          </Animated.Text>
          <View className="flex-row flex-wrap justify-between">
            <Animated.View
              entering={FadeInDown.delay(600)}
              className="w-[48%] bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 mb-4"
            >
              <Ionicons
                name="game-controller"
                size={24}
                color="#3b82f6"
                className="mb-2"
              />
              <Text className="text-3xl font-black text-white">
                {USER_STATS.gamesPlayed}
              </Text>
              <Text className="text-slate-400 text-xs font-bold uppercase mt-1">
                Partidas
              </Text>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(700)}
              className="w-[48%] bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 mb-4"
            >
              <Ionicons
                name="skull"
                size={24}
                color="#ef4444"
                className="mb-2"
              />
              <Text className="text-3xl font-black text-white">
                {USER_STATS.punishments}
              </Text>
              <Text className="text-slate-400 text-xs font-bold uppercase mt-1">
                Castigos
              </Text>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(800)}
              className="w-[48%] bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4"
            >
              <Ionicons
                name="time"
                size={24}
                color="#10b981"
                className="mb-2"
              />
              <Text className="text-3xl font-black text-white">
                {USER_STATS.timePlayed}
              </Text>
              <Text className="text-slate-400 text-xs font-bold uppercase mt-1">
                Sobrevivido
              </Text>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(900)}
              className="w-[48%] bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4"
            >
              <Ionicons
                name="albums"
                size={24}
                color="#8b5cf6"
                className="mb-2"
              />
              <Text className="text-lg font-black text-white leading-tight">
                {USER_STATS.favDeck}
              </Text>
              <Text className="text-slate-400 text-xs font-bold uppercase mt-1">
                Mazo Top
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* INVENTARIO DE AVATARES */}
        <View className="mb-10">
          <Animated.View
            entering={FadeInDown.delay(1000)}
            className="px-5 flex-row justify-between items-center mb-4"
          >
            <Text className="text-slate-500 font-black tracking-widest uppercase text-sm">
              Colección de Avatares
            </Text>
            {/* BOTÓN CONECTADO A LA NUEVA PANTALLA */}
            <Pressable
              onPress={() => router.push("/avatars" as Href)}
              className="active:opacity-50"
            >
              <Text className="text-fuchsia-500 font-bold text-xs bg-fuchsia-500/10 px-3 py-1 rounded-full border border-fuchsia-500/30">
                VER TODOS
              </Text>
            </Pressable>
          </Animated.View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
          >
            {AVATARS_LIST.map((avatar, index) => {
              const isSelected = activeAvatar.id === avatar.id;
              return (
                <Animated.View
                  key={avatar.id}
                  entering={FadeInRight.delay(1100 + index * 100)}
                >
                  <Pressable
                    onPress={() => avatar.unlocked && setActiveAvatar(avatar)}
                    className={`items-center justify-center rounded-2xl p-4 border-2 transition-transform active:scale-90 w-24 h-32
                      ${isSelected ? "bg-fuchsia-500/20 border-fuchsia-500" : "bg-[#0f172a] border-[#1e293b]"}
                      ${!avatar.unlocked ? "opacity-60" : ""}
                    `}
                  >
                    <Text
                      className="text-4xl mb-2"
                      style={{ opacity: avatar.unlocked ? 1 : 0.3 }}
                    >
                      {avatar.icon}
                    </Text>
                    {avatar.unlocked ? (
                      <Text
                        className={`text-xs font-bold text-center ${isSelected ? "text-fuchsia-400" : "text-slate-400"}`}
                      >
                        {avatar.name}
                      </Text>
                    ) : (
                      <View className="items-center">
                        <Ionicons
                          name="lock-closed"
                          size={14}
                          color="#ef4444"
                        />
                        <Text className="text-[10px] text-amber-500 font-bold mt-1 text-center">
                          {avatar.cost ? `${avatar.cost} 🟡` : "Evento"}
                        </Text>
                      </View>
                    )}
                    {isSelected && (
                      <View className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1 border-2 border-[#020617]">
                        <Ionicons name="checkmark" size={12} color="white" />
                      </View>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
