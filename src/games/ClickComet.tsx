import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface Comet {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: { x: number; y: number };
  emoji: string;
  points: number;
  color: string;
  type: 'normal' | 'bouncing' | 'splitting' | 'phantom' | 'speed' | 'toxic' | 'bonus' | 'shield';
  health?: number;
  maxHealth?: number;
  bounceCount?: number;
  splitCount?: number;
  invisible?: boolean;
  invulnerable?: boolean;
  explosionRadius?: number;
  trail?: Array<{x: number, y: number}>;
  rotation?: number;
  rotationSpeed?: number;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'freeze' | 'double_points' | 'magnet' | 'shield' | 'slow_time';
  duration: number;
  emoji: string;
  color: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const ClickComet: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [comets, setComets] = useState<Comet[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [activeEffects, setActiveEffects] = useState<{[key: string]: number}>({});
  const [lives, setLives] = useState(3);
  const [shieldHits, setShieldHits] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(1.0);

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;

  const cometTypes = [
    { emoji: '☄️', points: 10, size: 40, speed: 2, color: 'from-orange-400 to-red-500', type: 'normal' as const },
    { emoji: '🌠', points: 15, size: 35, speed: 3, color: 'from-blue-400 to-purple-500', type: 'normal' as const },
    { emoji: '💫', points: 20, size: 30, speed: 4, color: 'from-yellow-400 to-orange-500', type: 'bouncing' as const },
    { emoji: '⭐', points: 25, size: 25, speed: 5, color: 'from-white to-yellow-400', type: 'normal' as const },
    { emoji: '🌟', points: 30, size: 20, speed: 6, color: 'from-yellow-300 to-yellow-600', type: 'speed' as const },
    { emoji: '🔥', points: 35, size: 45, speed: 1.5, color: 'from-red-500 to-orange-600', type: 'splitting' as const },
    { emoji: '👻', points: 40, size: 35, speed: 3, color: 'from-gray-400 to-white', type: 'phantom' as const },
    { emoji: '💀', points: -20, size: 35, speed: 2.5, color: 'from-red-800 to-black', type: 'toxic' as const },
    { emoji: '💎', points: 50, size: 30, speed: 4, color: 'from-cyan-400 to-blue-500', type: 'bonus' as const },
    { emoji: '🛡️', points: 15, size: 40, speed: 2, color: 'from-green-400 to-blue-500', type: 'shield' as const }
  ];

  const powerUpTypes = [
    { emoji: '❄️', type: 'freeze' as const, color: 'from-cyan-400 to-blue-500' },
    { emoji: '2️⃣', type: 'double_points' as const, color: 'from-yellow-400 to-orange-500' },
    { emoji: '🧲', type: 'magnet' as const, color: 'from-purple-400 to-pink-500' },
    { emoji: '🛡️', type: 'shield' as const, color: 'from-green-400 to-emerald-500' },
    { emoji: '⏰', type: 'slow_time' as const, color: 'from-blue-400 to-indigo-500' }
  ];

  const resetGame = () => {
    setComets([]);
    setPowerUps([]);
    setParticles([]);
    setScore(0);
    setTimeLeft(90);
    setGameOver(false);
    setGameRunning(false);
    setCombo(0);
    setMaxCombo(0);
    setLevel(1);
    setActiveEffects({});
    setLives(3);
    setShieldHits(0);
    setTotalClicks(0);
    setAccuracy(0);
  };

  const createParticles = (x: number, y: number, color: string, count: number = 8) => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + Math.random() + i,
      x,
      y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 60,
      maxLife: 60,
      color,
      size: Math.random() * 4 + 2
    }));
    setParticles(prev => [...prev, ...newParticles]);
  };

  const spawnComet = useCallback(() => {
    const difficultyTypes = cometTypes.filter((_, index) => {
      if (level < 2 && index >= 4) return false; // Advanced types at level 2+
      if (level < 3 && index >= 6) return false; // Expert types at level 3+
      return true;
    });
    
    const type = difficultyTypes[Math.floor(Math.random() * difficultyTypes.length)];
    const side = Math.floor(Math.random() * 4);
    
    let x, y, directionX, directionY;
    
    switch (side) {
      case 0: // top
        x = Math.random() * GAME_WIDTH;
        y = -type.size;
        directionX = (Math.random() - 0.5) * 2;
        directionY = 1;
        break;
      case 1: // right
        x = GAME_WIDTH + type.size;
        y = Math.random() * GAME_HEIGHT;
        directionX = -1;
        directionY = (Math.random() - 0.5) * 2;
        break;
      case 2: // bottom
        x = Math.random() * GAME_WIDTH;
        y = GAME_HEIGHT + type.size;
        directionX = (Math.random() - 0.5) * 2;
        directionY = -1;
        break;
      default: // left
        x = -type.size;
        y = Math.random() * GAME_HEIGHT;
        directionX = 1;
        directionY = (Math.random() - 0.5) * 2;
        break;
    }
    
    const speedMultiplier = (activeEffects.slow_time > 0 ? 0.5 : (activeEffects.freeze > 0 ? 0.1 : 1)) * gameSpeed;
    
    const comet: Comet = {
      id: Date.now() + Math.random(),
      x,
      y,
      size: type.size,
      speed: type.speed * (1 + level * 0.2) * speedMultiplier,
      direction: { x: directionX, y: directionY },
      emoji: type.emoji,
      points: type.points,
      color: type.color,
      type: type.type,
      health: type.type === 'shield' ? 3 : 1,
      maxHealth: type.type === 'shield' ? 3 : 1,
      bounceCount: 0,
      splitCount: 0,
      invisible: type.type === 'phantom' ? Math.random() < 0.7 : false,
      invulnerable: false,
      trail: type.type === 'speed' ? [] : undefined,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 10
    };
    
    setComets(prev => [...prev, comet]);
  }, [level, activeEffects, gameSpeed]);

  const spawnPowerUp = useCallback(() => {
    if (Math.random() < 0.02 && powerUps.length < 2) {
      const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      const powerUp: PowerUp = {
        id: Date.now() + Math.random(),
        x: Math.random() * (GAME_WIDTH - 40) + 20,
        y: Math.random() * (GAME_HEIGHT - 40) + 20,
        type: type.type,
        duration: 300, // 5 seconds at 60fps
        emoji: type.emoji,
        color: type.color
      };
      setPowerUps(prev => [...prev, powerUp]);
    }
  }, [powerUps.length]);

  const updateGame = useCallback(() => {
    if (!gameRunning || gameOver) return;

    const timeMultiplier = (activeEffects.slow_time > 0 ? 0.5 : 1) * gameSpeed;

    // Update comets
    setComets(prev =>
      prev
        .map(comet => {
          const newComet = { ...comet };
          
          // Update trail for speed comets
          if (newComet.type === 'speed' && newComet.trail) {
            newComet.trail = [{ x: newComet.x, y: newComet.y }, ...newComet.trail.slice(0, 8)];
          }
          
          // Update rotation
          newComet.rotation = (newComet.rotation || 0) + (newComet.rotationSpeed || 0);
          
          // Handle phantom invisibility
          if (newComet.type === 'phantom') {
            if (Math.random() < 0.05) {
              newComet.invisible = !newComet.invisible;
            }
          }
          
          // Move comet
          newComet.x += newComet.direction.x * newComet.speed * timeMultiplier;
          newComet.y += newComet.direction.y * newComet.speed * timeMultiplier;
          
          // Handle bouncing
          if (newComet.type === 'bouncing' && (newComet.bounceCount || 0) < 3) {
            if (newComet.x <= newComet.size/2 || newComet.x >= GAME_WIDTH - newComet.size/2) {
              newComet.direction.x *= -1;
              newComet.bounceCount = (newComet.bounceCount || 0) + 1;
            }
            if (newComet.y <= newComet.size/2 || newComet.y >= GAME_HEIGHT - newComet.size/2) {
              newComet.direction.y *= -1;
              newComet.bounceCount = (newComet.bounceCount || 0) + 1;
            }
          }
          
          return newComet;
        })
        .filter(comet => {
          // Remove comets that are out of bounds (except bouncing ones still bouncing)
          if (comet.type === 'bouncing' && (comet.bounceCount || 0) < 3) {
            return comet.x > -comet.size && comet.x < GAME_WIDTH + comet.size && 
                   comet.y > -comet.size && comet.y < GAME_HEIGHT + comet.size;
          }
          
          const inBounds = comet.x > -comet.size - 100 && 
                          comet.x < GAME_WIDTH + comet.size + 100 && 
                          comet.y > -comet.size - 100 && 
                          comet.y < GAME_HEIGHT + comet.size + 100;
          
          return inBounds;
        })
    );

    // Update power-ups
    setPowerUps(prev => 
      prev.map(powerUp => ({
        ...powerUp,
        duration: powerUp.duration - 1
      })).filter(powerUp => powerUp.duration > 0)
    );

    // Update particles
    setParticles(prev => 
      prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vx: particle.vx * 0.98,
        vy: particle.vy * 0.98,
        life: particle.life - 1
      })).filter(particle => particle.life > 0)
    );

    // Spawn comets based on level
    const spawnRate = (0.02 + level * 0.005 + score * 0.000005) * gameSpeed;
    if (Math.random() < spawnRate) {
      spawnComet();
    }

    // Spawn power-ups
    spawnPowerUp();

    // Update active effects
    setActiveEffects(prev => {
      const newEffects = { ...prev };
      Object.keys(newEffects).forEach(effect => {
        newEffects[effect] = Math.max(0, newEffects[effect] - 1);
        if (newEffects[effect] === 0) {
          delete newEffects[effect];
        }
      });
      return newEffects;
    });

  }, [gameRunning, gameOver, level, score, activeEffects, gameSpeed, spawnComet, spawnPowerUp]);

  useEffect(() => {
    const gameLoop = setInterval(updateGame, 16); // ~60 FPS
    return () => clearInterval(gameLoop);
  }, [updateGame]);

  useEffect(() => {
    if (timeLeft > 0 && gameRunning) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000 / gameSpeed);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameRunning) {
      setGameOver(true);
      setGameRunning(false);
      updateScore('click-comet', score);
    }
  }, [timeLeft, gameRunning, score, gameSpeed, updateScore]);

  // Level progression
  useEffect(() => {
    const newLevel = Math.floor(score / 500) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      createParticles(GAME_WIDTH/2, GAME_HEIGHT/2, '#22d3ee', 20);
    }
  }, [score, level]);

  const handleCometClick = (cometId: number) => {
    const comet = comets.find(c => c.id === cometId);
    if (!comet) return;

    setTotalClicks(prev => prev + 1);

    // Handle shield comets
    if (comet.type === 'shield') {
      const newHealth = (comet.health || 1) - 1;
      if (newHealth > 0) {
        setComets(prev => prev.map(c => 
          c.id === cometId ? { ...c, health: newHealth } : c
        ));
        createParticles(comet.x, comet.y, '#10b981', 4);
        return;
      }
    }

    // Handle toxic comets
    if (comet.type === 'toxic') {
      if (activeEffects.shield && activeEffects.shield > 0) {
        setShieldHits(prev => prev + 1);
        createParticles(comet.x, comet.y, '#10b981', 6);
      } else {
        setLives(prev => Math.max(0, prev - 1));
        createParticles(comet.x, comet.y, '#ef4444', 12);
        if (lives <= 1) {
          setGameOver(true);
          setGameRunning(false);
          updateScore('click-comet', score);
          return;
        }
      }
      setCombo(0);
      setComets(prev => prev.filter(c => c.id !== cometId));
      return;
    }

    // Calculate points
    const comboMultiplier = Math.floor(combo / 5) + 1;
    const levelMultiplier = level;
    const doublePointsMultiplier = activeEffects.double_points > 0 ? 2 : 1;
    let points = comet.points * comboMultiplier * levelMultiplier * doublePointsMultiplier;

    // Handle magnet effect
    if (activeEffects.magnet > 0) {
      points = Math.round(points * 1.5);
    }

    setScore(prev => prev + points);
    setCombo(prev => {
      const newCombo = prev + 1;
      setMaxCombo(current => Math.max(current, newCombo));
      return newCombo;
    });

    // Handle splitting comets
    if (comet.type === 'splitting' && (comet.splitCount || 0) < 2) {
      const smallComets = Array.from({ length: 2 }, (_, i) => ({
        ...comet,
        id: Date.now() + Math.random() + i,
        size: comet.size * 0.7,
        speed: comet.speed * 1.5,
        points: Math.floor(comet.points * 0.6),
        direction: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2
        },
        splitCount: (comet.splitCount || 0) + 1,
        type: 'normal' as const
      }));
      
      setComets(prev => [...prev.filter(c => c.id !== cometId), ...smallComets]);
    } else {
      setComets(prev => prev.filter(c => c.id !== cometId));
    }

    createParticles(comet.x, comet.y, comet.color.includes('red') ? '#ef4444' : '#22d3ee', 8);
  };

  const handlePowerUpClick = (powerUpId: number) => {
    const powerUp = powerUps.find(p => p.id === powerUpId);
    if (!powerUp) return;

    setActiveEffects(prev => ({
      ...prev,
      [powerUp.type]: 300 // 5 seconds
    }));

    setPowerUps(prev => prev.filter(p => p.id !== powerUpId));
    createParticles(powerUp.x, powerUp.y, '#fbbf24', 12);
  };

  const handleMissClick = () => {
    setTotalClicks(prev => prev + 1);
    setCombo(0);
  };

  const adjustGameSpeed = (delta: number) => {
    setGameSpeed(prev => Math.max(0.25, Math.min(3.0, prev + delta)));
  };

  // Calculate accuracy
  useEffect(() => {
    if (totalClicks > 0) {
      setAccuracy(Math.round((score > 0 ? Math.min(100, (score / 10) / totalClicks * 100) : 0)));
    }
  }, [totalClicks, score, combo]);

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
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentGame(null)}
            className="flex items-center space-x-2 text-cosmic-300 hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Games</span>
          </button>
          
          <h1 className="text-3xl font-orbitron font-bold text-center bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            Click Comet Enhanced
          </h1>
          
          <div className="flex space-x-2">
            <button
              onClick={toggleGame}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                gameRunning 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {gameRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{gameOver ? 'Restart' : gameRunning ? 'Pause' : 'Start'}</span>
            </button>
            
            <button
              onClick={resetGame}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Combo Multiplier */}
        {combo >= 5 && (
          <div className="text-center mb-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg font-bold"
            >
              {Math.floor(combo / 5) + 1}x MULTIPLIER!
            </motion.div>
          </div>
        )}

        {/* Game Area with Side Stats and Controls */}
        <div className="flex justify-center items-start space-x-6 mb-4">
          {/* Left Side: Stats + Active Effects */}
          <div className="flex flex-col space-y-4 mt-8 min-w-[120px]">
            {/* Left Stats */}
            <div className="text-center bg-cosmic-800 rounded-lg p-3 min-w-[80px]">
              <div className="text-2xl font-bold text-purple-400">{score}</div>
              <div className="text-xs text-cosmic-400">Score</div>
            </div>
            <div className="text-center bg-cosmic-800 rounded-lg p-3 min-w-[80px]">
              <div className={`text-2xl font-bold ${timeLeft <= 15 ? 'text-red-400' : 'text-orange-400'}`}>
                {timeLeft}s
              </div>
              <div className="text-xs text-cosmic-400">Time</div>
            </div>
            <div className="text-center bg-cosmic-800 rounded-lg p-3 min-w-[80px]">
              <div className="text-2xl font-bold text-yellow-400">{combo}</div>
              <div className="text-xs text-cosmic-400">Combo</div>
            </div>

            {/* Active Effects on Left */}
            {Object.keys(activeEffects).length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-cosmic-400 text-center font-semibold">Active Effects</div>
                {Object.entries(activeEffects).map(([effect, duration]) => (
                  <div key={effect} className="bg-cosmic-700 rounded-lg px-2 py-1 text-xs text-cosmic-300 text-center">
                    <div className="font-semibold">{effect.replace('_', ' ').toUpperCase()}</div>
                    <div className="text-yellow-400">{Math.ceil(duration / 60)}s</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Game Screen */}
          <div 
            className="relative bg-gradient-to-b from-cosmic-900 via-purple-900/20 to-cosmic-800 border-2 border-cosmic-600 rounded-lg overflow-hidden cursor-crosshair"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
            onClick={handleMissClick}
          >
            {/* Stars background */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>

            {/* Particles */}
            {particles.map(particle => (
              <div
                key={particle.id}
                className="absolute pointer-events-none rounded-full"
                style={{
                  left: particle.x,
                  top: particle.y,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  opacity: particle.life / particle.maxLife
                }}
              />
            ))}

            {/* Power-ups */}
            <AnimatePresence>
              {powerUps.map(powerUp => (
                <motion.div
                  key={powerUp.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  exit={{ scale: 0 }}
                  transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" } }}
                  whileHover={{ scale: 1.2 }}
                  className={`absolute cursor-pointer flex items-center justify-center text-2xl bg-gradient-to-r ${powerUp.color} rounded-full border-2 border-white/50 shadow-lg`}
                  style={{
                    left: powerUp.x - 20,
                    top: powerUp.y - 20,
                    width: 40,
                    height: 40,
                    zIndex: 10
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePowerUpClick(powerUp.id);
                  }}
                >
                  {powerUp.emoji}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Comets */}
            <AnimatePresence>
              {comets.map(comet => (
                <motion.div
                  key={comet.id}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: 1,
                    rotate: comet.rotation
                  }}
                  exit={{ scale: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`absolute cursor-pointer flex items-center justify-center text-2xl bg-gradient-to-r ${comet.color} rounded-full border-2 border-white/30 transition-opacity ${
                    comet.invisible ? 'opacity-30' : 'opacity-100'
                  }`}
                  style={{
                    left: comet.x - comet.size / 2,
                    top: comet.y - comet.size / 2,
                    width: comet.size,
                    height: comet.size,
                    fontSize: `${comet.size * 0.5}px`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCometClick(comet.id);
                  }}
                >
                  {/* Health indicator for shield comets */}
                  {comet.type === 'shield' && comet.health && comet.health > 1 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {comet.health}
                    </div>
                  )}
                  
                  {/* Trail for speed comets */}
                  {comet.trail && comet.trail.map((point, index) => (
                    <div
                      key={index}
                      className="absolute pointer-events-none bg-white rounded-full"
                      style={{
                        left: point.x - comet.x,
                        top: point.y - comet.y,
                        width: (comet.size * 0.3) * (1 - index / comet.trail!.length),
                        height: (comet.size * 0.3) * (1 - index / comet.trail!.length),
                        opacity: 0.6 * (1 - index / comet.trail!.length)
                      }}
                    />
                  ))}
                  
                  {comet.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Right Side: Stats + Speed Control */}
          <div className="flex flex-col space-y-4 mt-8 min-w-[120px]">
            {/* Right Stats */}
            <div className="text-center bg-cosmic-800 rounded-lg p-3 min-w-[80px]">
              <div className="text-2xl font-bold text-green-400">L{level}</div>
              <div className="text-xs text-cosmic-400">Level</div>
            </div>
            <div className="text-center bg-cosmic-800 rounded-lg p-3 min-w-[80px]">
              <div className="flex justify-center space-x-1">
                {Array.from({length: 3}).map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-red-400' : 'bg-cosmic-600'}`} />
                ))}
              </div>
              <div className="text-xs text-cosmic-400">Lives</div>
            </div>
            <div className="text-center bg-cosmic-800 rounded-lg p-3 min-w-[80px]">
              <div className="text-2xl font-bold text-blue-400">{accuracy}%</div>
              <div className="text-xs text-cosmic-400">Accuracy</div>
            </div>

            {/* Speed Control on Right */}
            <div className="bg-cosmic-800 rounded-lg p-3">
              <div className="text-xs text-cosmic-400 text-center font-semibold mb-2">Game Speed</div>
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => adjustGameSpeed(-0.25)}
                  className="p-1 rounded bg-cosmic-600 hover:bg-cosmic-500 text-white transition-colors disabled:opacity-50"
                  disabled={gameSpeed <= 0.25}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <div className="text-center min-w-[50px]">
                  <div className="text-lg font-bold text-cyan-400">{gameSpeed.toFixed(2)}x</div>
                </div>
                <button
                  onClick={() => adjustGameSpeed(0.25)}
                  className="p-1 rounded bg-cosmic-600 hover:bg-cosmic-500 text-white transition-colors disabled:opacity-50"
                  disabled={gameSpeed >= 3.0}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls and Info */}
        <div className="text-center text-cosmic-400">
          {!gameRunning && !gameOver && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-cosmic-800 rounded-lg p-4">
                  <h3 className="text-purple-400 font-bold mb-2">Comet Types</h3>
                  <div className="text-sm space-y-1">
                    <p>☄️🌠⭐ Normal comets - Basic points</p>
                    <p>💫 Bouncing - Bounces off walls 3 times</p>
                    <p>🌟 Speed - Fast with glowing trail</p>
                    <p>🔥 Splitting - Breaks into smaller comets</p>
                    <p>👻 Phantom - Randomly becomes invisible</p>
                    <p>🛡️ Shield - Requires multiple hits</p>
                    <p>💎 Bonus - Extra valuable</p>
                    <p className="text-red-400">💀 Toxic - Avoid! Costs life</p>
                  </div>
                </div>
                
                <div className="bg-cosmic-800 rounded-lg p-4">
                  <h3 className="text-yellow-400 font-bold mb-2">Power-ups</h3>
                  <div className="text-sm space-y-1">
                    <p>❄️ Freeze - Slows all comets</p>
                    <p>2️⃣ Double Points - 2x score bonus</p>
                    <p>🧲 Magnet - Attracts and boosts points</p>
                    <p>🛡️ Shield - Protection from toxic</p>
                    <p>⏰ Slow Time - Matrix mode</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="mb-2">🎯 Build combos for massive multipliers!</p>
                <p className="mb-2">📈 Level up every 500 points for more challenges</p>
                <p className="mb-2">⚡ Use speed control to adjust difficulty (0.25x - 3.0x)</p>
                <p className="text-orange-400">⚡ Survive 90 seconds of cosmic chaos!</p>
              </div>
            </div>
          )}
          
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-cosmic-800 rounded-lg p-6 inline-block max-w-md"
            >
              <h2 className="text-2xl font-bold text-purple-400 mb-4">
                {lives <= 0 ? 'Mission Failed!' : 'Cosmic Hunt Complete!'}
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="bg-cosmic-700 rounded p-2">
                  <div className="text-purple-400 font-bold text-lg">{score}</div>
                  <div className="text-cosmic-300">Final Score</div>
                </div>
                <div className="bg-cosmic-700 rounded p-2">
                  <div className="text-yellow-400 font-bold text-lg">{maxCombo}</div>
                  <div className="text-cosmic-300">Best Combo</div>
                </div>
                <div className="bg-cosmic-700 rounded p-2">
                  <div className="text-green-400 font-bold text-lg">L{level}</div>
                  <div className="text-cosmic-300">Max Level</div>
                </div>
                <div className="bg-cosmic-700 rounded p-2">
                  <div className="text-blue-400 font-bold text-lg">{accuracy}%</div>
                  <div className="text-cosmic-300">Accuracy</div>
                </div>
              </div>
              
              {shieldHits > 0 && (
                <div className="mb-4 text-green-400 text-sm">
                  🛡️ Shield blocked {shieldHits} toxic hit{shieldHits !== 1 ? 's' : ''}!
                </div>
              )}
              
              <div className="space-y-2">
                <button
                  onClick={resetGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors mr-2"
                >
                  Hunt Again
                </button>
                <button
                  onClick={() => setCurrentGame(null)}
                  className="bg-cosmic-600 hover:bg-cosmic-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Back to Games
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClickComet;
