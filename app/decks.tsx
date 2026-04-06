// app/decks.tsx
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useCallback } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CardPreviewModal from "../src/components/ui/CardPreviewModal";
import { SelectableCard } from "../src/components/ui/SelectableCard";
import TopHeader from "../src/components/ui/TopHeader"; // <-- AQUÍ IMPORTAMOS TU TOPHEADER
import { CardData, DECKS_LIST } from "../src/constants/decks";
import { useDecksLogic } from "../src/hooks/useDecksLogic";

export default function DecksScreen() {
  const insets = useSafeAreaInsets();
  const logic = useDecksLogic();

  const renderItem = useCallback(
    ({ item }: { item: CardData }) => (
      <SelectableCard
        item={item}
        theme={logic.activeTheme}
        onPress={logic.setSelectedCard}
      />
    ),
    [logic.activeTheme, logic.setSelectedCard],
  );

  // Aseguramos que la carta seleccionada tenga el isActive actual del estado de la lógica
  const currentSelectedCard = logic.selectedCard
    ? logic.currentCards.find((c) => c.id === logic.selectedCard?.id)
    : null;

  return (
    <View className="flex-1 bg-[#020617]">
      <Stack.Screen options={{ headerShown: false }} />

      {/* ESPACIO SEGURO SUPERIOR (Mantiene todo debajo del notch/barra de estado) */}
      <View style={{ paddingTop: insets.top + 10 }} />

      {/* TOP HEADER GLOBAL (Perfil y Tapitas) */}
      <TopHeader tapitas={150} />

      {/* HEADER LOCAL DE LA PANTALLA (Navegación y Título) */}
      <View className="px-5 mt-4 mb-6">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center mb-4"
        >
          <Ionicons name="chevron-back" size={24} color="#94a3b8" />
          <Text className="text-slate-400 font-semibold text-base ml-1">
            Atrás
          </Text>
        </Pressable>
        <Text className="text-4xl font-black text-white uppercase tracking-tighter">
          LA <Text className={logic.activeTheme.primaryText}>FORJA</Text>
        </Text>
        <Text className="text-slate-400 text-sm mt-1">
          Activa o desactiva castigos para este mazo.
        </Text>
      </View>

      {/* MENÚ MAZOS */}
      <View className="mb-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          {DECKS_LIST.map((deck) => (
            <Pressable
              key={deck.id}
              onPress={() => logic.setSelectedDeckId(deck.id)}
              className={`px-6 py-3 rounded-2xl border-2 ${logic.selectedDeckId === deck.id ? `${deck.primaryBg} ${deck.border}` : "bg-[#0f172a] border-[#1e293b]"}`}
            >
              <Text
                className={`font-black uppercase ${logic.selectedDeckId === deck.id ? "text-white" : "text-slate-500"}`}
              >
                {deck.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* GRID CARTAS */}
      <FlatList
        data={logic.currentCards}
        keyExtractor={(item) => item.id}
        numColumns={4}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 150 }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      {/* FOOTER */}
      <View
        style={{ paddingBottom: insets.bottom + 20 }}
        className="absolute bottom-0 w-full px-5 bg-[#020617]/95 pt-4 border-t border-[#1e293b]"
      >
        <View className="flex-row justify-between items-center mb-4 px-2">
          <Text className="text-slate-400 font-bold text-xs tracking-widest uppercase">
            Cartas en juego
          </Text>
          <Text
            className={`${logic.activeTheme.primaryText} font-black text-sm`}
          >
            {logic.activeCount} / {logic.currentCards.length}
          </Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          className={`w-full ${logic.activeTheme.primaryBg} py-4 rounded-2xl items-center border-b-4 border-black/30 flex-row justify-center space-x-2`}
        >
          <Ionicons name="save-outline" size={24} color="white" />
          <Text className="text-white font-black text-lg tracking-widest uppercase ml-2">
            Guardar Mazo
          </Text>
        </Pressable>
      </View>

      {/* MODAL PREVIEW CON TUS ANIMACIONES 3D INTACTAS */}
      <CardPreviewModal
        card={currentSelectedCard as CardData}
        theme={logic.activeTheme}
        isActive={currentSelectedCard?.isActive}
        onClose={logic.closePreview}
        onToggle={logic.toggleCard}
      />
    </View>
  );
}
