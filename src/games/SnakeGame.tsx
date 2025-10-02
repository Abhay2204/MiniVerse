import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Zap, Shield, Clock, Star } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface Position {
  x: number;
  y: number;
}

interface PowerUp {
  position: Position;
  type: 'speed' | 'shield' | 'slow' | 'bonus';
  icon: React.ReactNode;
  color: string;
  effect: string;
}

interface Level {
  number: number;
  speed: number;
  scoreTarget: number;
  powerUpChance: number;
  name: string;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

const LEVELS: Level[] = [
  { number: 1, speed: 200, scoreTarget: 50, powerUpChance: 0.1, name: "Asteroid Belt" },
  { number: 2, speed: 180, scoreTarget: 120, powerUpChance: 0.15, name: "Mars Orbit" },
  { number: 3, speed: 160, scoreTarget: 200, powerUpChance: 0.2, name: "Jupiter's Moons" },
  { number: 4, speed: 140, scoreTarget: 300, powerUpChance: 0.25, name: "Saturn's Rings" },
  { number: 5, speed: 120, scoreTarget: 420, powerUpChance: 0.3, name: "Uranus Storm" },
  { number: 6, speed: 100, scoreTarget: 560, powerUpChance: 0.35, name: "Neptune Deep" },
  { number: 7, speed: 80, scoreTarget: 720, powerUpChance: 0.4, name: "Pluto's Edge" },
  { number: 8, speed: 60, scoreTarget: 900, powerUpChance: 0.45, name: "Deep Space" },
];

const POWER_UP_TYPES = {
  speed: { icon: <Zap className="w-4 h-4" />, color: 'bg-yellow-500', effect: 'Speed x2' },
  shield: { icon: <Shield className="w-4 h-4" />, color: 'bg-blue-500', effect: 'Wall Pass' },
  slow: { icon: <Clock className="w-4 h-4" />, color: 'bg-green-500', effect: 'Slow Mo' },
  bonus: { icon: <Star className="w-4 h-4" />, color: 'bg-purple-500', effect: '+100 pts' },
};

const EnhancedSnakeGame: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<{ [key: string]: number }>({});
  const [gameSpeed, setGameSpeed] = useState(200);
  const [shieldActive, setShieldActive] = useState(false);
  const [levelUp, setLevelUp] = useState(false);

  const currentLevel = LEVELS[Math.min(level - 1, LEVELS.length - 1)];

  const generateFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
      powerUps.some(powerUp => powerUp.position.x === newFood.x && powerUp.position.y === newFood.y)
    );
    return newFood;
  }, [powerUps]);

  const generatePowerUp = useCallback((currentSnake: Position[], currentFood: Position) => {
    if (Math.random() > currentLevel.powerUpChance) return;

    let position: Position;
    do {
      position = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      currentSnake.some(segment => segment.x === position.x && segment.y === position.y) ||
      (position.x === currentFood.x && position.y === currentFood.y) ||
      powerUps.some(powerUp => powerUp.position.x === position.x && powerUp.position.y === position.y)
    );

    const types = Object.keys(POWER_UP_TYPES) as Array<keyof typeof POWER_UP_TYPES>;
    const type = types[Math.floor(Math.random() * types.length)];
    const powerUpConfig = POWER_UP_TYPES[type];

    const newPowerUp: PowerUp = {
      position,
      type,
      icon: powerUpConfig.icon,
      color: powerUpConfig.color,
      effect: powerUpConfig.effect,
    };

    setPowerUps(prev => [...prev, newPowerUp]);

    // Remove power-up after 10 seconds
    setTimeout(() => {
      setPowerUps(prev => prev.filter(p => p !== newPowerUp));
    }, 10000);
  }, [currentLevel.powerUpChance, powerUps]);

  const activatePowerUp = useCallback((powerUpType: string) => {
    const duration = 8000; // 8 seconds for better effect

    setActivePowerUps(prev => ({
      ...prev,
      [powerUpType]: Date.now() + duration
    }));

    switch (powerUpType) {
      case 'speed':
        setGameSpeed(prev => Math.max(30, prev * 0.4)); // Much faster
        break;
      case 'shield':
        setShieldActive(true);
        break;
      case 'slow':
        setGameSpeed(prev => prev * 2.5); // Much slower
        break;
      case 'bonus':
        setScore(prev => prev + 100); // Better bonus
        break;
    }

    setTimeout(() => {
      setActivePowerUps(prev => {
        const newActivePowerUps = { ...prev };
        delete newActivePowerUps[powerUpType];
        return newActivePowerUps;
      });

      if (powerUpType === 'speed' || powerUpType === 'slow') {
        setGameSpeed(currentLevel.speed);
      }
      if (powerUpType === 'shield') {
        setShieldActive(false);
      }
    }, duration);
  }, [currentLevel.speed]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setGameRunning(false);
    setPowerUps([]);
    setActivePowerUps({});
    setGameSpeed(LEVELS[0].speed);
    setShieldActive(false);
    setLevelUp(false);
  };

  const moveSnake = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        if (!shieldActive) {
          setGameOver(true);
          setGameRunning(false);
          updateScore('snake-universe', score);
          return currentSnake;
        } else {
          // Teleport to opposite side when shield is active
          if (head.x < 0) head.x = GRID_SIZE - 1;
          if (head.x >= GRID_SIZE) head.x = 0;
          if (head.y < 0) head.y = GRID_SIZE - 1;
          if (head.y >= GRID_SIZE) head.y = 0;
        }
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        if (!shieldActive) {
          setGameOver(true);
          setGameRunning(false);
          updateScore('snake-universe', score);
          return currentSnake;
        } else {
          return currentSnake; // Don't move if would hit self with shield
        }
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        const newScore = score + 10 + (level * 5);
        setScore(newScore);
        setFood(generateFood(newSnake));
        generatePowerUp(newSnake, food);

        // Check for level up
        if (newScore >= currentLevel.scoreTarget && level < LEVELS.length) {
          setLevel(prev => prev + 1);
          setLevelUp(true);
          setGameSpeed(LEVELS[level] ? LEVELS[level].speed : 60);
          setTimeout(() => setLevelUp(false), 2000);
        }
      } else {
        newSnake.pop();
      }

      // Check power-up collision
      setPowerUps(prev => {
        const collectedPowerUp = prev.find(p => p.position.x === head.x && p.position.y === head.y);
        if (collectedPowerUp) {
          activatePowerUp(collectedPowerUp.type);
          return prev.filter(p => p !== collectedPowerUp);
        }
        return prev;
      });

      return newSnake;
    });
  }, [direction, food, gameRunning, gameOver, score, level, currentLevel, generateFood, generatePowerUp, activatePowerUp, shieldActive]);

  useEffect(() => {
    const currentSpeed = activePowerUps.speed ? gameSpeed :
      activePowerUps.slow ? gameSpeed : gameSpeed;
    const gameInterval = setInterval(moveSnake, currentSpeed);
    return () => clearInterval(gameInterval);
  }, [moveSnake, gameSpeed, activePowerUps]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunning) return;

      const newDirection = DIRECTIONS[e.key as keyof typeof DIRECTIONS];
      if (newDirection) {
        if (newDirection.x === -direction.x || newDirection.y === -direction.y) return;
        setDirection(newDirection);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameRunning]);

  const toggleGame = () => {
    if (gameOver) {
      resetGame();
    } else {
      setGameRunning(!gameRunning);
    }
  };

  return (
    <div className="min-h-screen bg-cosmic-900 p-4">
      <div className="container mx-auto max-w-6xl">
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
            Snake Universe
          </h1>

          <div className="flex space-x-2">
            <button
              onClick={toggleGame}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${gameRunning
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-green-600 hover:bg-green-700'
                } text-white`}
            >
              {gameRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{gameOver ? 'Restart' : gameRunning ? 'Pause' : 'Start'}</span>
            </button>

            <button
              onClick={resetGame}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Game Stats */}
        <div className="flex justify-center space-x-12 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{score}</div>
            <div className="text-cosmic-400">Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{level}</div>
            <div className="text-cosmic-400">Level</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">{currentLevel.name}</div>
            <div className="text-cosmic-400">Sector</div>
          </div>
        </div>

        {/* Active Power-ups */}
        {Object.keys(activePowerUps).length > 0 && (
          <div className="flex justify-center space-x-4 mb-4">
            {Object.keys(activePowerUps).map(powerUpType => (
              <div
                key={powerUpType}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-white font-medium ${POWER_UP_TYPES[powerUpType as keyof typeof POWER_UP_TYPES].color}`}
              >
                {POWER_UP_TYPES[powerUpType as keyof typeof POWER_UP_TYPES].icon}
                <span>{POWER_UP_TYPES[powerUpType as keyof typeof POWER_UP_TYPES].effect}</span>
              </div>
            ))}
          </div>
        )}

        {/* Level Up Animation */}
        <AnimatePresence>
          {levelUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center z-50"
            >
              <div className="bg-blue-600 text-white px-8 py-6 rounded-lg shadow-xl text-center">
                <h2 className="text-2xl font-bold mb-2">Level {level}!</h2>
                <p className="text-lg">{currentLevel.name}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Board */}
        <div className="flex justify-center mb-6">
          <div
            className="grid bg-cosmic-900 border-2 border-cosmic-600 rounded-lg p-1"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
              width: '500px',
              height: '500px'
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);

              const isSnake = snake.some(segment => segment.x === x && segment.y === y);
              const isHead = snake[0]?.x === x && snake[0]?.y === y;
              const isFood = food.x === x && food.y === y;
              const powerUp = powerUps.find(p => p.position.x === x && p.position.y === y);

              return (
                <div
                  key={index}
                  className={`
                    border border-cosmic-700 transition-colors duration-150
                    ${isFood ? 'bg-red-500 rounded-full' : ''}
                    ${isSnake && !isHead ? `${shieldActive ? 'bg-blue-400' : 'bg-green-500'}` : ''}
                    ${isHead ? `${shieldActive ? 'bg-blue-300' : 'bg-green-400'} rounded-sm` : ''}
                  `}
                >
                  {powerUp && (
                    <div className={`w-full h-full rounded-full ${powerUp.color} flex items-center justify-center text-white`}>
                      {powerUp.icon}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls and Game Over */}
        <div className="text-center text-cosmic-300">
          {!gameRunning && !gameOver && (
            <div className="space-y-4">
              <p>Press Start to begin your cosmic journey</p>
              <p className="text-sm text-cosmic-400">Use arrow keys to navigate • Collect power-ups for advantages</p>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">Speed Boost</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">Wall Shield</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Slow Motion</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-purple-500" />
                  <span className="text-sm">Bonus Points</span>
                </div>
              </div>
            </div>
          )}
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-cosmic-800 rounded-lg p-8 inline-block border border-red-500"
            >
              <h2 className="text-2xl font-bold text-red-400 mb-2">Game Over!</h2>
              <p className="text-cosmic-300 mb-2">Level {level} - {currentLevel.name}</p>
              <p className="text-white mb-6">Final Score: {score}</p>
              <button
                onClick={resetGame}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Play Again
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedSnakeGame;