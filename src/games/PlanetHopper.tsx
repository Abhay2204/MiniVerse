import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

// Mock store to match the provided code's structure
const useGameStore = () => ({
  setCurrentGame: (game: string | null) => {
    if (game === null) {
      // Redirect to the home page
      window.location.href = '/';
    }
  },
  updateScore: (gameType: string, score: number) => console.log('Updating score:', gameType, score)
});

// --- TYPE DEFINITIONS ---
interface Planet {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  emoji: string;
  velocityX: number;
  velocityY: number;
}

interface Player {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  onPlanet: boolean;
  currentPlanetId?: number;
}

interface MousePosition {
  x: number;
  y: number;
}

// --- CONSTANTS ---
const GAME_WIDTH = 1000; // Increased from 700
const GAME_HEIGHT = 500;  // Reduced to fit screen better
const PLAYER_RADIUS = 15;
const GRAVITY = 0.25;
const MAX_JUMP_POWER = 20;
const PLANET_SPAWN_CHANCE = 0.015;
const BASE_SPEED_MULTIPLIER = 0.7; // Increased from 0.3

const planetEmojis = ['🪐', '🌍', '🌕', '☄️', '✨', '🌟', '💫', '💥'];
const planetColors = ['#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#EC4899'];

// --- THE GAME COMPONENT ---
const PlanetHopper: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();

  // --- STATE MANAGEMENT ---
  const [player, setPlayer] = useState<Player>({ x: 0, y: 0, velocityX: 0, velocityY: 0, onPlanet: true });
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [jumpPower, setJumpPower] = useState(0);
  const [charging, setCharging] = useState(false);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  // Calculate speed multiplier based on score
  const getSpeedMultiplier = useCallback((currentScore: number) => {
    return BASE_SPEED_MULTIPLIER + Math.floor(currentScore / 60) * 0.1; // Speed increases by 0.1x every 60 points
  }, []);

  // --- CORE GAME LOGIC ---

  // Resets the game to its initial state
  const resetGame = useCallback(() => {
    const initialPlanet: Planet = {
      id: 0,
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 1.5,
      radius: 50,
      color: planetColors[0],
      emoji: planetEmojis[0],
      velocityX: 0,
      velocityY: 0,
    };
    setPlanets([initialPlanet]);
    setPlayer({
      x: initialPlanet.x,
      y: initialPlanet.y, // Position at center instead of on surface
      velocityX: 0,
      velocityY: 0,
      onPlanet: true,
      currentPlanetId: initialPlanet.id,
    });
    setScore(0);
    setGameOver(false);
    setGameRunning(false);
    setJumpPower(0);
    setCharging(false);
  }, []);

  // Spawns a new planet from outside the game area
  const spawnPlanet = useCallback(() => {
    let x, y, velocityX, velocityY;
    const side = Math.floor(Math.random() * 4);
    const speedMultiplier = getSpeedMultiplier(score);

    switch (side) {
      case 0: // Top
        x = Math.random() * GAME_WIDTH; y = -100;
        velocityX = (Math.random() - 0.5) * 2 * speedMultiplier; 
        velocityY = (Math.random() * 1.5 + 0.5) * speedMultiplier;
        break;
      case 1: // Right
        x = GAME_WIDTH + 100; y = Math.random() * GAME_HEIGHT;
        velocityX = -(Math.random() * 1.5 + 0.5) * speedMultiplier; 
        velocityY = (Math.random() - 0.5) * 2 * speedMultiplier;
        break;
      case 2: // Bottom
        x = Math.random() * GAME_WIDTH; y = GAME_HEIGHT + 100;
        velocityX = (Math.random() - 0.5) * 2 * speedMultiplier; 
        velocityY = -(Math.random() * 1.5 + 0.5) * speedMultiplier;
        break;
      default: // Left
        x = -100; y = Math.random() * GAME_HEIGHT;
        velocityX = (Math.random() * 1.5 + 0.5) * speedMultiplier; 
        velocityY = (Math.random() - 0.5) * 2 * speedMultiplier;
        break;
    }

    const newPlanet: Planet = {
      id: Date.now(),
      x, y, velocityX, velocityY,
      radius: 25 + Math.random() * 30,
      color: planetColors[Math.floor(Math.random() * planetColors.length)],
      emoji: planetEmojis[Math.floor(Math.random() * planetEmojis.length)],
    };
    setPlanets(prev => [...prev, newPlanet]);
  }, [score, getSpeedMultiplier]);

  // Main game loop function
  const updateGame = useCallback(() => {
    if (!gameRunning || gameOver) return;

    // --- Planet Updates ---
    setPlanets(prevPlanets => {
      const updatedPlanets = prevPlanets
        .map(p => ({ ...p, x: p.x + p.velocityX, y: p.y + p.velocityY }))
        .filter(p => p.x > -150 && p.x < GAME_WIDTH + 150 && p.y > -150 && p.y < GAME_HEIGHT + 150);
      
      if (Math.random() < PLANET_SPAWN_CHANCE && updatedPlanets.length < 10) {
        spawnPlanet();
      }
      return updatedPlanets;
    });

    // --- Player Updates ---
    setPlayer(prevPlayer => {
      let newPlayer = { ...prevPlayer };

      if (newPlayer.onPlanet) {
        const currentPlanet = planets.find(p => p.id === newPlayer.currentPlanetId);
        if (currentPlanet) {
          // Move with the planet - stay at center
          newPlayer.x = currentPlanet.x;
          newPlayer.y = currentPlanet.y;
        } else {
          // Planet despawned, player starts falling
          newPlayer.onPlanet = false;
        }
      } else {
        // --- Player is in the air ---
        newPlayer.velocityY += GRAVITY;
        newPlayer.x += newPlayer.velocityX;
        newPlayer.y += newPlayer.velocityY;

        // Check for landing on a planet
        for (const planet of planets) {
          const dx = newPlayer.x - planet.x;
          const dy = newPlayer.y - planet.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < planet.radius + PLAYER_RADIUS) {
            newPlayer.onPlanet = true;
            newPlayer.currentPlanetId = planet.id;
            newPlayer.velocityX = 0;
            newPlayer.velocityY = 0;
            
            // Position rocket at the center of the planet for 360-degree jumping
            newPlayer.x = planet.x;
            newPlayer.y = planet.y;

            if (planet.id !== 0) {
              setScore(s => s + 10);
            }

            // Remove the previous planet when landing on a new one
            if (newPlayer.currentPlanetId !== planet.id) {
              setPlanets(prevPlanets => prevPlanets.filter(p => p.id === planet.id));
            }
            break;
          }
        }
      }

      // Check for Game Over - if rocket goes outside game screen
      if (newPlayer.y > GAME_HEIGHT + 50 || newPlayer.y < -50 || 
          newPlayer.x > GAME_WIDTH + 50 || newPlayer.x < -50) {
        setGameOver(true);
        setGameRunning(false);
        updateScore('planet-hopper', score);
      }
      return newPlayer;
    });

  }, [gameRunning, gameOver, planets, score, spawnPlanet, updateScore]);
  
  // --- JUMP LOGIC ---
  const jump = useCallback(() => {
    if (!charging || !player.onPlanet) return;
    
    const angle = Math.atan2(mousePosition.y - player.y, mousePosition.x - player.x);
    
    // Calculate position outside the current planet
    const currentPlanet = planets.find(p => p.id === player.currentPlanetId);
    const jumpDistance = currentPlanet ? currentPlanet.radius + PLAYER_RADIUS + 5 : 50; // 5px buffer
    
    setPlayer(prev => ({
      ...prev,
      onPlanet: false,
      currentPlanetId: undefined,
      x: prev.x + Math.cos(angle) * jumpDistance,
      y: prev.y + Math.sin(angle) * jumpDistance,
      velocityX: Math.cos(angle) * jumpPower,
      velocityY: Math.sin(angle) * jumpPower,
    }));
    
    setCharging(false);
    setJumpPower(0);
  }, [charging, player, mousePosition, jumpPower, planets]);

  // --- EFFECT HOOKS ---

  // Initialize game on mount
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Game Loop using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;
    const gameLoop = () => {
      updateGame();
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    if (gameRunning) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameRunning, updateGame]);

  // Handle player input
  useEffect(() => {
    const handleMouseDown = () => { if (player.onPlanet && gameRunning) setCharging(true); };
    const handleMouseUp = () => jump();
    const handleKeyDown = (e: KeyboardEvent) => { if (e.code === 'Space' && player.onPlanet && gameRunning) { e.preventDefault(); setCharging(true); }};
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') jump(); };
    
    const gameArea = gameAreaRef.current;
    const handleMouseMove = (e: MouseEvent) => {
        if (gameArea) {
            const rect = gameArea.getBoundingClientRect();
            setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    gameArea?.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      gameArea?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [player.onPlanet, gameRunning, jump]);

  // Charge jump power
  useEffect(() => {
    if (charging) {
      const interval = setInterval(() => {
        setJumpPower(prev => Math.min(prev + 0.5, MAX_JUMP_POWER));
      }, 20);
      return () => clearInterval(interval);
    }
  }, [charging]);
  // --- RENDER ---
  const angle = Math.atan2(mousePosition.y - player.y, mousePosition.x - player.x);
  const trajectoryLength = (jumpPower / MAX_JUMP_POWER) * 150;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 font-sans flex items-center justify-center">
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-purple-500/30">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side - Game Area */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentGame(null)}
                className="flex items-center space-x-2 text-purple-300 hover:text-purple-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
                Planet Hopper
              </h1>
              <div className="w-24"></div> {/* Spacer for alignment */}
            </div>

            {/* Game Area */}
            <div 
              ref={gameAreaRef}
              className="relative bg-gradient-to-b from-indigo-900 via-purple-900/20 to-blue-900 border-2 border-purple-500/50 rounded-lg overflow-hidden cursor-crosshair select-none"
              style={{ width: GAME_WIDTH, height: GAME_HEIGHT, userSelect: 'none' }}
            >
              {/* Background Stars */}
              {Array.from({ length: 150 }).map((_, i) => (
                <div key={i} className="absolute w-1 h-1 bg-white rounded-full opacity-50" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} />
              ))}
              
              {/* Planets */}
              {planets.map(planet => (
                <div
                  key={planet.id}
                  className="absolute flex items-center justify-center text-4xl shadow-lg select-none pointer-events-none"
                  style={{
                    left: planet.x, top: planet.y,
                    width: planet.radius * 2, height: planet.radius * 2,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: planet.color,
                    borderRadius: '50%',
                    boxShadow: `0 0 20px ${planet.color}40`,
                    userSelect: 'none'
                  }}
                >
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    {planet.emoji}
                  </motion.div>
                </div>
              ))}

              {/* Trajectory line */}
              {charging && player.onPlanet && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line
                    x1={player.x} y1={player.y}
                    x2={player.x + Math.cos(angle) * trajectoryLength}
                    y2={player.y + Math.sin(angle) * trajectoryLength}
                    stroke="rgba(255, 255, 255, 0.7)"
                    strokeWidth="3"
                    strokeDasharray="4 4"
                  />
                </svg>
              )}

              {/* Player */}
              <motion.div
                className="absolute text-2xl flex items-center justify-center select-none pointer-events-none"
                style={{
                  left: player.x, top: player.y,
                  width: PLAYER_RADIUS * 2, height: PLAYER_RADIUS * 2,
                  transform: 'translate(-50%, -50%)',
                  userSelect: 'none'
                }}
                animate={{
                  scale: player.onPlanet ? [1, 1.1, 1] : 1,
                  rotate: player.onPlanet ? 0 : player.velocityX * 10
                }}
                transition={{ scale: { duration: 1, repeat: player.onPlanet ? Infinity : 0 } }}
              >
                🚀
              </motion.div>
            </div>

            {/* Game Instructions */}
            {!gameRunning && !gameOver && (
              <p className="text-center text-purple-300 mt-4 text-sm">
                Click and hold (or press Space) to charge your jump. Aim with the mouse and release to hop!
              </p>
            )}
          </div>

          {/* Right Side - Controls and Score */}
          <div className="w-64 bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-purple-500/30 flex flex-col">
            {/* Score */}
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-purple-400">{score}</div>
              <div className="text-purple-300 uppercase text-sm tracking-wider">Score</div>
              <div className="text-xs text-purple-400 mt-1">
                Speed: {(getSpeedMultiplier(score)).toFixed(1)}x
              </div>
            </div>

            {/* Game Controls */}
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <button
                  onClick={() => setGameRunning(!gameRunning)}
                  disabled={gameOver}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors text-white ${
                    gameRunning ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
                  } disabled:bg-gray-500`}
                >
                  {gameRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{gameRunning ? 'Pause' : 'Start'}</span>
                </button>

                <button 
                  onClick={resetGame} 
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Jump Power Meter */}
              {charging && (
                <div className="mt-6">
                  <div className="text-center text-purple-300 text-xs mb-1">Jump Power</div>
                  <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-400 to-red-400"
                      style={{ width: `${(jumpPower / MAX_JUMP_POWER) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Game Over Message */}
              {gameOver && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <h2 className="text-xl font-bold text-red-400 mb-2">Lost in Space!</h2>
                  <button 
                    onClick={resetGame} 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-bold text-sm"
                  >
                    Play Again
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanetHopper;