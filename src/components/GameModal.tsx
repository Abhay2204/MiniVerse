import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

const GameModal: React.FC = () => {
  const { currentGame, setCurrentGame } = useGameStore();

  if (!currentGame) return null;

  const GameComponent = currentGame.component;

  if (!GameComponent) {
    // Auto-clear the invalid game and return to main menu
    setCurrentGame(null);
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-cosmic-900 overflow-y-auto"
    >
      <GameComponent />
    </motion.div>
  );
};

export default GameModal;
