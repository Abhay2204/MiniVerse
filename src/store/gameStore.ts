import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Game, Player, GameState } from '../types';

interface GameStore extends GameState {
  isIntroScreen: boolean;
  setCurrentGame: (game: Game | null) => void;
  setIsIntroScreen: (value: boolean) => void;
  updateScore: (gameId: string, score: number) => void;
  setPlayer: (player: Player) => void;
  initializeGames: (games: Game[]) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentGame: null,
      player: null,
      games: [],
      scores: {},
      isIntroScreen: false,

      setCurrentGame: (game) => set({ currentGame: game }),

      setIsIntroScreen: (value) => set({ isIntroScreen: value }),

      updateScore: (gameId, score) => {
        const { scores, player } = get();
        const newScores = { ...scores };
        const currentBest = newScores[gameId] || 0;
        
        if (score > currentBest) {
          newScores[gameId] = score;
          set({ scores: newScores });
          
          if (player) {
            const totalScore = Object.values(newScores).reduce((sum, s) => sum + s, 0);
            set({
              player: {
                ...player,
                totalScore,
                gamesPlayed: Object.keys(newScores).length,
              }
            });
          }
        }
      },
      
      setPlayer: (player) => set({ player }),
      
      initializeGames: (games) => set({ games }),
    }),
    {
      name: 'miniverse-game-storage',
    }
  )
);
