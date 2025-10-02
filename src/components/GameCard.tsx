import React from 'react';
import { motion } from 'framer-motion';
import { Play, Star, Lock } from 'lucide-react';
import { Game } from '../types';
import { useGameStore } from '../store/gameStore';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { setCurrentGame, scores } = useGameStore();
  const bestScore = scores[game.id] || 0;

  const handlePlay = () => {
    if (game.isUnlocked) {
      setCurrentGame(game);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-cosmic-400';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, rotateY: 5 }}
      whileTap={{ scale: 0.98 }}
      className="game-card rounded-xl p-6 h-full flex flex-col relative overflow-hidden group"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="text-4xl">{game.icon}</div>
          {!game.isUnlocked && (
            <Lock className="w-5 h-5 text-cosmic-500" />
          )}
          {bestScore > 0 && (
            <div className="flex items-center space-x-1 text-yellow-400">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-bold">{bestScore}</span>
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-cosmic-100 mb-2 group-hover:text-purple-400 transition-colors">
          {game.name}
        </h3>
        
        <p className="text-cosmic-400 text-sm mb-4 flex-grow leading-relaxed">
          {game.description}
        </p>

        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase tracking-wider ${getDifficultyColor(game.difficulty)}`}>
            {game.difficulty}
          </span>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePlay}
            disabled={!game.isUnlocked}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              game.isUnlocked
                ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white hover:shadow-lg hover:shadow-purple-500/25'
                : 'bg-cosmic-700 text-cosmic-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Play</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;