// src/utils/themeMapper.ts

export const getThemeForDeck = (deckTitle: string, index: number) => {
  // Themes por defecto basados en tus colores
  const themes = [
    {
      bg: "bg-cyan-950",
      border: "border-cyan-800",
      borderBottom: "border-cyan-700",
      textTitle: "text-cyan-400",
      textDesc: "text-cyan-100/70",
      particleColor: "rgba(34, 211, 238, 0.2)",
    },
    {
      bg: "bg-rose-950",
      border: "border-rose-800",
      borderBottom: "border-rose-700",
      textTitle: "text-rose-400",
      textDesc: "text-rose-100/70",
      particleColor: "rgba(251, 113, 133, 0.2)",
    },
    {
      bg: "bg-emerald-950",
      border: "border-emerald-800",
      borderBottom: "border-emerald-700",
      textTitle: "text-emerald-400",
      textDesc: "text-emerald-100/70",
      particleColor: "rgba(52, 211, 153, 0.2)",
    },
    {
      bg: "bg-fuchsia-950",
      border: "border-fuchsia-800",
      borderBottom: "border-fuchsia-700",
      textTitle: "text-fuchsia-400",
      textDesc: "text-fuchsia-100/70",
      particleColor: "rgba(232, 121, 249, 0.2)",
    },
    {
      bg: "bg-orange-950",
      border: "border-orange-500",
      borderBottom: "border-orange-600",
      textTitle: "text-orange-400",
      textDesc: "text-orange-100/90",
      particleColor: "rgba(251, 146, 60, 0.4)",
    },
  ];

  // Si conoces el nombre, asignas uno fijo. Si no, usas el índice para que siempre tenga un color lindo.
  if (deckTitle.includes("Destrucción")) return themes[1];
  if (deckTitle.includes("Familiar")) return themes[2];
  if (deckTitle.includes("HOT")) return themes[4];

  return themes[index % themes.length];
};
