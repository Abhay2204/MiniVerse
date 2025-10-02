import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, ArrowUp, ArrowDown, ArrowLeftIcon, ArrowRight } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

type Direction = 'up' | 'down' | 'left' | 'right';

const NumberSupernova: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [grid, setGrid] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const addRandomTile = (currentGrid: number[][]) => {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentGrid[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentGrid[randomCell[0]][randomCell[1]] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const moveGrid = (direction: Direction) => {
    if (gameOver || won) return;

    const newGrid = grid.map(row => [...row]);
    let moved = false;
    let newScore = score;

    const moveRow = (row: number[], reverse = false) => {
      const filtered = row.filter(cell => cell !== 0);
      if (reverse) filtered.reverse();
      
      const merged: number[] = [];
      let i = 0;
      
      while (i < filtered.length) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          const mergedValue = filtered[i] * 2;
          merged.push(mergedValue);
          newScore += mergedValue;
          if (mergedValue === 2048 && !won) {
            setWon(true);
            updateScore('number-supernova', newScore);
          }
          i += 2;
        } else {
          merged.push(filtered[i]);
          i++;
        }
      }
      
      while (merged.length < 4) {
        merged.push(0);
      }
      
      if (reverse) merged.reverse();
      return merged;
    };

    if (direction === 'left') {
      for (let i = 0; i < 4; i++) {
        const newRow = moveRow(newGrid[i]);
        if (JSON.stringify(newRow) !== JSON.stringify(newGrid[i])) moved = true;
        newGrid[i] = newRow;
      }
    } else if (direction === 'right') {
      for (let i = 0; i < 4; i++) {
        const newRow = moveRow(newGrid[i], true);
        if (JSON.stringify(newRow) !== JSON.stringify(newGrid[i])) moved = true;
        newGrid[i] = newRow;
      }
    } else if (direction === 'up') {
      for (let j = 0; j < 4; j++) {
        const column = [newGrid[0][j], newGrid[1][j], newGrid[2][j], newGrid[3][j]];
        const newColumn = moveRow(column);
        if (JSON.stringify(newColumn) !== JSON.stringify(column)) moved = true;
        for (let i = 0; i < 4; i++) {
          newGrid[i][j] = newColumn[i];
        }
      }
    } else if (direction === 'down') {
      for (let j = 0; j < 4; j++) {
        const column = [newGrid[0][j], newGrid[1][j], newGrid[2][j], newGrid[3][j]];
        const newColumn = moveRow(column, true);
        if (JSON.stringify(newColumn) !== JSON.stringify(column)) moved = true;
        for (let i = 0; i < 4; i++) {
          newGrid[i][j] = newColumn[i];
        }
      }
    }

    if (moved) {
      addRandomTile(newGrid);
      setGrid(newGrid);
      setScore(newScore);
      
      // Check for game over
      if (isGameOver(newGrid)) {
        setGameOver(true);
        updateScore('number-supernova', newScore);
      }
    }
  };

  const isGameOver = (currentGrid: number[][]) => {
    // Check for empty cells
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentGrid[i][j] === 0) return false;
      }
    }
    
    // Check for possible merges
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = currentGrid[i][j];
        if (
          (i < 3 && currentGrid[i + 1][j] === current) ||
          (j < 3 && currentGrid[i][j + 1] === current)
        ) {
          return false;
        }
      }
    }
    
    return true;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          moveGrid('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveGrid('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          moveGrid('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveGrid('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [grid, gameOver, won]);

  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      2: 'bg-purple-200 text-purple-900',
      4: 'bg-purple-300 text-purple-900',
      8: 'bg-orange-300 text-orange-900',
      16: 'bg-orange-400 text-white',
      32: 'bg-red-400 text-white',
      64: 'bg-red-500 text-white',
      128: 'bg-yellow-400 text-yellow-900',
      256: 'bg-yellow-500 text-white',
      512: 'bg-green-400 text-white',
      1024: 'bg-green-500 text-white',
      2048: 'bg-blue-500 text-white animate-pulse',
    };
    return colors[value] || 'bg-blue-600 text-white';
  };

  return (
    <div className="min-h-screen bg-cosmic-900 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentGame(null)}
            className="flex items-center space-x-2 text-cosmic-300 hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Games</span>
          </button>
          
          <h1 className="text-3xl font-orbitron font-bold text-center bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            Number Supernova
          </h1>
          
          <button
            onClick={initializeGame}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Score */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-purple-400">{score}</div>
          <div className="text-cosmic-400">Score</div>
        </div>

        {/* Game Grid */}
        <div className="flex justify-center mb-6">
          <div className="bg-cosmic-800 p-4 rounded-xl">
            <div className="grid grid-cols-4 gap-2 w-80 h-80">
              {grid.map((row, i) =>
                row.map((cell, j) => (
                  <motion.div
                    key={`${i}-${j}`}
                    initial={{ scale: cell === 0 ? 1 : 0 }}
                    animate={{ scale: 1 }}
                    className={`
                      rounded-lg flex items-center justify-center font-bold text-lg
                      ${cell === 0 
                        ? 'bg-cosmic-700' 
                        : getTileColor(cell)
                      }
                    `}
                  >
                    {cell !== 0 && cell}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="text-center mb-6">
          <p className="text-cosmic-400 mb-4">Use arrow keys or buttons to move tiles</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => moveGrid('up')}
              className="p-3 bg-cosmic-700 hover:bg-cosmic-600 rounded-lg transition-colors"
            >
              <ArrowUp className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="flex justify-center space-x-4 mt-2">
            <button
              onClick={() => moveGrid('left')}
              className="p-3 bg-cosmic-700 hover:bg-cosmic-600 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => moveGrid('down')}
              className="p-3 bg-cosmic-700 hover:bg-cosmic-600 rounded-lg transition-colors"
            >
              <ArrowDown className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => moveGrid('right')}
              className="p-3 bg-cosmic-700 hover:bg-cosmic-600 rounded-lg transition-colors"
            >
              <ArrowRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Win/Game Over Modals */}
        <AnimatePresence>
          {(won || gameOver) && (
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
                className="bg-cosmic-800 rounded-xl p-8 text-center max-w-md mx-4"
              >
                <div className="text-6xl mb-4">{won ? '🎉' : '💥'}</div>
                <h2 className={`text-3xl font-bold mb-2 ${won ? 'text-green-400' : 'text-red-400'}`}>
                  {won ? 'Supernova Achieved!' : 'Game Over'}
                </h2>
                <p className="text-cosmic-300 mb-4">
                  {won ? 'You reached 2048!' : 'No more moves available'}
                </p>
                <p className="text-lg font-bold text-orange-400 mb-6">
                  Final Score: {score}
                </p>
                <div className="flex space-x-4">
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

export default NumberSupernova;