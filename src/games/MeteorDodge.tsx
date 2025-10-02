import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Zap, Shield, Rocket } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface GameObject {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Meteor extends GameObject {
  speed: number;
  size: 'small' | 'medium' | 'large';
  rotation: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

const MeteorDodge: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [player, setPlayer] = useState<GameObject>({ id: 0, x: 325, y: 425, width: 50, height: 50 });
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [keys, setKeys] = useState({ left: false, right: false, up: false, down: false });
  const [thrusterActive, setThrusterActive] = useState(false);
  const [nearMiss, setNearMiss] = useState(0);
  const [combo, setCombo] = useState(0);

  const GAME_WIDTH = 700;
  const GAME_HEIGHT = 500;
  const PLAYER_SPEED = 6;

  const resetGame = () => {
    setPlayer({ id: 0, x: 325, y: 425, width: 50, height: 50 });
    setMeteors([]);
    setParticles([]);
    setScore(0);
    setGameOver(false);
    setGameRunning(false);
    setCombo(0);
    setNearMiss(0);
  };

  const createExplosionParticles = (x: number, y: number, count: number = 8) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      newParticles.push({
        id: Date.now() + Math.random(),
        x: x,
        y: y,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3),
        life: 30,
        maxLife: 30
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const createThrusterParticles = (x: number, y: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 3; i++) {
      newParticles.push({
        id: Date.now() + Math.random(),
        x: x + Math.random() * 20 - 10,
        y: y + 50,
        vx: (Math.random() - 0.5) * 2,
        vy: 2 + Math.random() * 2,
        life: 15,
        maxLife: 15
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const spawnMeteor = useCallback(() => {
    const sizes = ['small', 'medium', 'large'] as const;
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const sizeMap = { small: 25, medium: 40, large: 60 };
    const speedMap = { small: 4, medium: 3, large: 2 };

    const meteor: Meteor = {
      id: Date.now() + Math.random(),
      x: Math.random() * (GAME_WIDTH - sizeMap[size]),
      y: -sizeMap[size],
      width: sizeMap[size],
      height: sizeMap[size],
      speed: speedMap[size] + Math.random() * 2,
      size,
      rotation: 0
    };

    setMeteors(prev => [...prev, meteor]);
  }, []);

  const updateGame = useCallback(() => {
    if (!gameRunning || gameOver) return;

    // Check if player is moving (for thruster effect)
    const isMoving = keys.left || keys.right || keys.up || keys.down;
    setThrusterActive(isMoving);

    // Move player
    setPlayer(prev => {
      let newX = prev.x;
      let newY = prev.y;

      if (keys.left && newX > 0) newX -= PLAYER_SPEED;
      if (keys.right && newX < GAME_WIDTH - prev.width) newX += PLAYER_SPEED;
      if (keys.up && newY > 0) newY -= PLAYER_SPEED;
      if (keys.down && newY < GAME_HEIGHT - prev.height) newY += PLAYER_SPEED;

      // Create thruster particles when moving
      if (isMoving && Math.random() < 0.3) {
        createThrusterParticles(newX + 25, newY);
      }

      return { ...prev, x: newX, y: newY };
    });

    // Update particles
    setParticles(prev =>
      prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 1
      })).filter(particle => particle.life > 0)
    );

    // Move meteors and check collisions
    setMeteors(prev => {
      const updatedMeteors = prev
        .map(meteor => ({
          ...meteor,
          y: meteor.y + meteor.speed,
          rotation: meteor.rotation + 2
        }))
        .filter(meteor => {
          if (meteor.y > GAME_HEIGHT + meteor.height) {
            // Meteor missed - increase combo
            setCombo(c => c + 1);
            setScore(s => s + 10 + (combo * 2)); // Bonus points for combo
            return false;
          }
          return true;
        });

      // Check collisions with better hit detection
      const collision = updatedMeteors.some(meteor => {
        const distance = Math.sqrt(
          Math.pow((player.x + player.width / 2) - (meteor.x + meteor.width / 2), 2) +
          Math.pow((player.y + player.height / 2) - (meteor.y + meteor.height / 2), 2)
        );

        const minDistance = (player.width + meteor.width) / 3; // More forgiving collision

        if (distance < minDistance) {
          createExplosionParticles(meteor.x + meteor.width / 2, meteor.y + meteor.height / 2, 12);
          return true;
        }

        // Near miss detection
        if (distance < minDistance * 2 && distance > minDistance) {
          setNearMiss(5); // Flash effect duration
          setScore(s => s + 5); // Bonus for near miss
        }

        return false;
      });

      if (collision) {
        setGameOver(true);
        setGameRunning(false);
        updateScore('meteor-dodge', score);
        setCombo(0);
      }

      return updatedMeteors;
    });

    // Decrease near miss effect
    setNearMiss(prev => Math.max(0, prev - 1));

    // Spawn meteors with difficulty scaling
    const spawnRate = 0.015 + (score * 0.000005);
    if (Math.random() < spawnRate) {
      spawnMeteor();
    }
  }, [gameRunning, gameOver, keys, player, score, spawnMeteor, updateScore, combo]);

  useEffect(() => {
    const gameLoop = setInterval(updateGame, 16); // ~60 FPS
    return () => clearInterval(gameLoop);
  }, [updateGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setKeys(prev => ({ ...prev, left: true }));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setKeys(prev => ({ ...prev, right: true }));
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          setKeys(prev => ({ ...prev, up: true }));
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setKeys(prev => ({ ...prev, down: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setKeys(prev => ({ ...prev, left: false }));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setKeys(prev => ({ ...prev, right: false }));
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          setKeys(prev => ({ ...prev, up: false }));
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setKeys(prev => ({ ...prev, down: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            onClick={() => setCurrentGame(null)}
            className="flex items-center space-x-2 text-cosmic-300 hover:text-purple-400 transition-colors"
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Games</span>
          </motion.button>

          <motion.h1
            className="text-4xl font-orbitron font-bold text-center bg-gradient-to-r from-purple-400 via-orange-400 to-purple-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: '200% 100%' }}
          >
            <Rocket className="inline w-8 h-8 mr-2 text-purple-400" />
            METEOR DODGE
            <Zap className="inline w-8 h-8 ml-2 text-orange-400" />
          </motion.h1>

          <div className="flex space-x-2">
            <motion.button
              onClick={toggleGame}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${gameRunning
                ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg shadow-orange-500/25'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/25'
                } text-white`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {gameRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{gameOver ? 'RESTART' : gameRunning ? 'PAUSE' : 'START'}</span>
            </motion.button>

            <motion.button
              onClick={resetGame}
              className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl transition-all shadow-lg shadow-purple-500/25"
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Game Area with Side Stats */}
        <motion.div
          className="flex justify-center items-start gap-6 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Left Side Stats */}
          <motion.div
            className="flex flex-col space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center bg-cosmic-800/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-cosmic-600 min-w-[120px]">
              <motion.div
                className="text-2xl font-bold text-purple-400"
                key={score}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              >
                {score.toLocaleString()}
              </motion.div>
              <div className="text-cosmic-400 text-xs font-medium">SCORE</div>
            </div>

            <div className="text-center bg-cosmic-800/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-cosmic-600">
              <motion.div
                className="text-xl font-bold text-orange-400"
                animate={combo > 0 ? { scale: [1, 1.1, 1] } : {}}
              >
                {combo}x
              </motion.div>
              <div className="text-cosmic-400 text-xs font-medium">COMBO</div>
            </div>

            <div className="text-center bg-cosmic-800/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-cosmic-600">
              <div className="text-lg font-bold text-green-400">{meteors.length}</div>
              <div className="text-cosmic-400 text-xs font-medium">ACTIVE</div>
            </div>
          </motion.div>

          {/* Game Screen */}
          <div
            className={`relative bg-gradient-to-b from-cosmic-900 via-cosmic-800 to-cosmic-900 border-2 rounded-2xl overflow-hidden shadow-2xl ${nearMiss > 0 ? 'border-yellow-400 shadow-yellow-400/50' : 'border-cosmic-600'
              }`}
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          >
            {/* Animated background stars */}
            <div className="absolute inset-0">
              {Array.from({ length: 100 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: Math.random() * 3 + 1,
                    height: Math.random() * 3 + 1,
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Moving star field */}
            <div className="absolute inset-0 opacity-30">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={`moving-${i}`}
                  className="absolute w-1 h-4 bg-gradient-to-b from-transparent via-white to-transparent"
                  style={{
                    left: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [-20, GAME_HEIGHT + 20],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 5,
                  }}
                />
              ))}
            </div>

            {/* Particles */}
            {particles.map(particle => (
              <motion.div
                key={particle.id}
                className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full"
                style={{
                  left: particle.x,
                  top: particle.y,
                  opacity: particle.life / particle.maxLife,
                }}
                animate={{
                  scale: [1, 0],
                }}
                transition={{
                  duration: particle.life / 30,
                }}
              />
            ))}

            {/* Player Spaceship */}
            <motion.div
              className="absolute flex items-center justify-center"
              style={{
                left: player.x,
                top: player.y,
                width: player.width,
                height: player.height
              }}
              animate={{
                rotate: keys.left ? -15 : keys.right ? 15 : 0,
                scale: thrusterActive ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                {/* Spaceship body */}
                <div className="text-4xl filter drop-shadow-lg">🚀</div>

                {/* Thruster effect */}
                <AnimatePresence>
                  {thrusterActive && (
                    <motion.div
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0.8, 1, 0.8],
                        scale: [0.8, 1.2, 0.8],
                        height: [10, 20, 10]
                      }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{
                        duration: 0.2,
                        repeat: Infinity
                      }}
                    >
                      <div className="w-4 h-6 bg-gradient-to-t from-orange-400 via-yellow-400 to-transparent rounded-b-full"></div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Shield effect for near misses */}
                <AnimatePresence>
                  {nearMiss > 0 && (
                    <motion.div
                      className="absolute inset-0 border-2 border-yellow-400 rounded-full"
                      initial={{ opacity: 0, scale: 1 }}
                      animate={{
                        opacity: [0.8, 0],
                        scale: [1, 2],
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Meteors */}
            <AnimatePresence>
              {meteors.map(meteor => (
                <motion.div
                  key={meteor.id}
                  className="absolute flex items-center justify-center"
                  style={{
                    left: meteor.x,
                    top: meteor.y,
                    width: meteor.width,
                    height: meteor.height,
                  }}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{
                    scale: 1,
                    rotate: meteor.rotation,
                  }}
                  exit={{
                    scale: 0,
                    opacity: 0,
                  }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <div className="relative">
                    {/* Meteor trail */}
                    <motion.div
                      className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-1 h-10 bg-gradient-to-t from-orange-400 to-transparent"
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                      }}
                    />

                    {/* Meteor body */}
                    <div
                      className={`
                        rounded-full bg-gradient-to-br border-2 filter drop-shadow-lg
                        ${meteor.size === 'large'
                          ? 'from-red-600 to-orange-600 border-red-400 text-3xl'
                          : meteor.size === 'medium'
                            ? 'from-orange-600 to-yellow-600 border-orange-400 text-2xl'
                            : 'from-yellow-600 to-orange-400 border-yellow-400 text-lg'
                        }
                      `}
                      style={{
                        width: meteor.width,
                        height: meteor.height,
                        background: meteor.size === 'large'
                          ? 'radial-gradient(circle at 30% 30%, #ef4444, #dc2626, #991b1b)'
                          : meteor.size === 'medium'
                            ? 'radial-gradient(circle at 30% 30%, #f97316, #ea580c, #c2410c)'
                            : 'radial-gradient(circle at 30% 30%, #eab308, #ca8a04, #a16207)'
                      }}
                    >
                      {/* Inner glow */}
                      <div
                        className="absolute inset-2 rounded-full opacity-50"
                        style={{
                          background: meteor.size === 'large'
                            ? 'radial-gradient(circle, #fbbf24, transparent)'
                            : meteor.size === 'medium'
                              ? 'radial-gradient(circle, #fed7aa, transparent)'
                              : 'radial-gradient(circle, #fef3c7, transparent)'
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Game state overlay */}
            {!gameRunning && !gameOver && (
              <motion.div
                className="absolute inset-0 bg-cosmic-900/80 backdrop-blur-sm flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center">
                  <Shield className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-4">Ready for Launch?</h2>
                  <p className="text-cosmic-300 mb-6 max-w-md">
                    Navigate through the meteor field using arrow keys or WASD.<br />
                    Avoid meteors and build your combo for bonus points!
                  </p>
                  <motion.button
                    onClick={() => setGameRunning(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-green-500/25"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="inline w-5 h-5 mr-2" />
                    START MISSION
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Game Over Modal */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-cosmic-800 rounded-2xl p-8 text-center max-w-md mx-4 border border-cosmic-600 shadow-2xl"
                initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="text-6xl mb-4"
                  animate={{
                    rotate: [0, -10, 10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: 3
                  }}
                >
                  💥
                </motion.div>
                <h2 className="text-3xl font-bold text-red-400 mb-2">IMPACT!</h2>
                <p className="text-cosmic-300 mb-4">Your ship was destroyed by a meteor</p>
                <div className="bg-cosmic-700/50 rounded-lg p-4 mb-6">
                  <div className="text-2xl font-bold text-orange-400 mb-2">
                    {score.toLocaleString()} Points
                  </div>
                  <div className="text-sm text-cosmic-400">
                    Max Combo: {combo}x
                  </div>
                </div>
                <div className="flex space-x-4">
                  <motion.button
                    onClick={resetGame}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Rocket className="inline w-4 h-4 mr-2" />
                    Launch Again
                  </motion.button>
                  <motion.button
                    onClick={() => setCurrentGame(null)}
                    className="flex-1 bg-cosmic-600 hover:bg-cosmic-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Return to Base
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MeteorDodge;