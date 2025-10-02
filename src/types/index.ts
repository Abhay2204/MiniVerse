import React from 'react';

export interface Game {
  id: string;
  name: string;
  description: string;
  category: 'puzzle' | 'action' | 'reflex' | 'creative' | 'brain' | 'developer';
  difficulty: 'easy' | 'medium' | 'hard';
  isUnlocked: boolean;
  bestScore?: number;
  icon: string;
  component: React.FC;
}

export interface Player {
  id: string;
  name: string;
  totalScore: number;
  gamesPlayed: number;
  achievements: string[];
}

export interface GameState {
  currentGame: Game | null;
  player: Player | null;
  games: Game[];
  scores: Record<string, number>;
  isIntroScreen: boolean;
}
