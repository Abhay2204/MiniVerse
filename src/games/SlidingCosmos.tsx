import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Target } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface Tile {
  id: number;
  position: number;
  isEmpty: boolean;
}

const SlidingCosmos: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const galaxyImages = [
    '🌌', '🌠', '⭐', '🌟',
    '💫', '🌙', '☄️', '🪐',
    '🌍', '🌕', '🌖', '🌗',
    '🌘', '🌑', '🌒', ''
  ];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const initialTiles: Tile[] = [];
    for (let i = 0; i < 16; i++) {
      initialTiles.push({
        id: i,
        position: i,
        isEmpty: i === 15
      });
    }

    // Shuffle the tiles
    const shuffled = shuffleTiles(initialTiles);
    setTiles(shuffled);
    setMoves(0);
    setIsComplete(false);
    setStartTime(Date.now());
  };

  const shuffleTiles = (currentTiles: Tile[]) => {
    const shuffled = [...currentTiles];

    // Perform 1000 random valid moves to ensure solvability
    for (let i = 0; i < 1000; i++) {
      const emptyIndex = shuffled.findIndex(tile => tile.isEmpty);
      const validMoves = getValidMoves(emptyIndex);
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        [shuffled[emptyIndex], shuffled[randomMove]] = [shuffled[randomMove], shuffled[emptyIndex]];
      }
    }

    return shuffled;
  };

  const getValidMoves = (emptyIndex: number) => {
    const validMoves: number[] = [];
    const row = Math.floor(emptyIndex / 4);
    const col = emptyIndex % 4;

    // Up
    if (row > 0) validMoves.push(emptyIndex - 4);
    // Down
    if (row < 3) validMoves.push(emptyIndex + 4);
    // Left
    if (col > 0) validMoves.push(emptyIndex - 1);
    // Right
    if (col < 3) validMoves.push(emptyIndex + 1);

    return validMoves;
  };

  const handleTileClick = (clickedIndex: number) => {
    if (isComplete) return;

    const emptyIndex = tiles.findIndex(tile => tile.isEmpty);
    const validMoves = getValidMoves(emptyIndex);

    if (validMoves.includes(clickedIndex)) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[clickedIndex]] = [newTiles[clickedIndex], newTiles[emptyIndex]];

      setTiles(newTiles);
      setMoves(prev => prev + 1);

      // Check if puzzle is complete
      const complete = newTiles.every((tile, index) =>
        tile.isEmpty ? index === 15 : tile.id === index
      );

      if (complete) {
        setIsComplete(true);
        const timeBonus = Math.max(0, 300 - Math.floor((Date.now() - startTime) / 1000));
        const moveBonus = Math.max(0, 200 - moves);
        const finalScore = timeBonus + moveBonus + 100;
        updateScore('sliding-cosmos', finalScore);
      }
    }
  };

  return (
    <div className="min-h-screen bg-cosmic-900 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <button
            onClick={() => setCurrentGame(null)}
            className="flex items-center space-x-2 text-cosmic-300 hover:text-purple-400 transition-colors order-2 sm:order-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Games</span>
            <span className="sm:hidden">Back</span>
          </button>

          <h1 className="text-2xl sm:text-3xl font-orbitron font-bold text-center bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent order-1 sm:order-2">
            Sliding Cosmos
          </h1>

          <button
            onClick={initializeGame}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors order-3"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Game Stats */}
        <div className="flex justify-center space-x-4 sm:space-x-8 mb-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-400">{moves}</div>
            <div className="text-sm text-cosmic-400">Moves</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-400">
              {Math.floor((Date.now() - startTime) / 1000)}s
            </div>
            <div className="text-sm text-cosmic-400">Time</div>
          </div>
        </div>

        {/* Game Board and Goal State */}
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-6 lg:gap-8 mb-6">
          {/* Current Puzzle */}
          <div className="text-center w-full lg:w-auto">
            <h3 className="text-lg font-semibold text-cosmic-300 mb-3">Current Puzzle</h3>
            <div className="bg-cosmic-800 p-3 sm:p-4 rounded-xl mx-auto max-w-md">
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full aspect-square max-w-[320px] sm:max-w-[360px] mx-auto">
                {tiles.map((tile, index) => (
                  <motion.div
                    key={tile.id}
                    layout
                    whileHover={tile.isEmpty ? {} : { scale: 1.05 }}
                    whileTap={tile.isEmpty ? {} : { scale: 0.95 }}
                    onClick={() => handleTileClick(index)}
                    className={`
                      rounded-lg flex items-center justify-center text-3xl sm:text-4xl font-bold cursor-pointer
                      transition-all duration-200
                      ${tile.isEmpty
                        ? 'bg-cosmic-700 cursor-default'
                        : 'bg-gradient-to-br from-purple-500 to-orange-500 hover:from-purple-400 hover:to-orange-400'
                      }
                    `}
                  >
                    {!tile.isEmpty && galaxyImages[tile.id]}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Goal State */}
          <div className="text-center w-full lg:w-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Target className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-green-400">Goal</h3>
            </div>
            <div className="bg-cosmic-800/50 p-3 sm:p-4 rounded-xl border-2 border-green-400/30 mx-auto max-w-xs">
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full aspect-square max-w-[240px] sm:max-w-[260px] mx-auto">
                {galaxyImages.map((symbol, index) => (
                  <div
                    key={index}
                    className={`
                      rounded-lg flex items-center justify-center text-xl sm:text-2xl font-bold
                      ${index === 15
                        ? 'bg-cosmic-700/50 border-2 border-dashed border-cosmic-500'
                        : 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-400/20'
                      }
                    `}
                  >
                    {symbol}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-cosmic-400 mt-2 max-w-60 mx-auto">
              Arrange symbols in this order with the empty space at bottom-right
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center text-cosmic-400 mb-6">
          <p>Click on tiles adjacent to the empty space to slide them</p>
          <p>Match the goal pattern shown on the right</p>
        </div>

        {/* Complete Modal */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-cosmic-800 rounded-xl p-4 sm:p-8 text-center max-w-md mx-4"
              >
                <div className="text-4xl sm:text-6xl mb-4">🌌</div>
                <h2 className="text-xl sm:text-3xl font-bold text-purple-400 mb-2">Cosmos Aligned!</h2>
                <p className="text-cosmic-300 mb-4 text-sm sm:text-base">
                  You've arranged the cosmic puzzle perfectly!
                </p>
                <div className="text-cosmic-300 mb-4 text-sm sm:text-base">
                  <p>Moves: {moves}</p>
                  <p>Time: {Math.floor((Date.now() - startTime) / 1000)}s</p>
                </div>
                <p className="text-base sm:text-lg font-bold text-orange-400 mb-4 sm:mb-6">
                  Score: {Math.max(0, 300 - Math.floor((Date.now() - startTime) / 1000)) + Math.max(0, 200 - moves) + 100}
                </p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={initializeGame}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => setCurrentGame(null)}
                    className="flex-1 bg-cosmic-600 hover:bg-cosmic-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Back to Games
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SlidingCosmos;
