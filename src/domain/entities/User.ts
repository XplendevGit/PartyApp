// src/domain/entities/User.ts

export interface User {
  id: string; // UUID que viene de auth.users de Supabase
  username: string | null;
  tapitasBalance: number; // Su dinero para comprar mazos PREMIUM
  isPremium: boolean; // Si pagó alguna suscripción global o quitó ads
  createdAt: Date;
}

// Opcional: El perfil del jugador dentro de una partida (Lo que manejas en tu playerStore)
export interface Player {
  id: string;
  ownerId: string; // Quién creó la partida
  name: string; // "Ben", "Juan", "Mati"
  avatarUrl: string | null;
  timesPlayed: number;
  createdAt: Date;
}
