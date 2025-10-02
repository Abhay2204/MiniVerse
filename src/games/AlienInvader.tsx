import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const AlienInvader: React.FC = () => {
  const { setCurrentGame } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    player: { x: 375, y: 520, width: 50, height: 30 },
    aliens: [] as Array<{ x: number; y: number; width: number; height: number; health: number; type: string }>,
    bullets: [] as Array<{ x: number; y: number; width: number; height: number; isPlayer: boolean }>,
    alienBullets: [] as Array<{ x: number; y: number; width: number; height: number }>,
    keys: { left: false, right: false, space: false },
    lastShot: 0,
    alienDirection: 1,
    alienDropTimer: 0
  });

  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const PLAYER_SPEED = 5;
  const BULLET_SPEED = 7;
  const ALIEN_SPEED = 1;

  // Initialize aliens for a wave
  const createAliens = () => {
    const aliens = [];
    const rows = 5;
    const cols = 10;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        aliens.push({
          x: col * 70 + 50,
          y: row * 50 + 50,
          width: 40,
          height: 30,
          health: row === 0 ? 3 : row === 1 ? 2 : 1,
          type: row === 0 ? 'tank' : row === 1 ? 'fast' : 'basic'
        });
      }
    }

    gameStateRef.current.aliens = aliens;
  };

  // Check collision between two rectangles
  const checkCollision = (rect1: any, rect2: any) => {
    return rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y;
  };

  // Game update loop
  const updateGame = () => {
    if (!gameRunning || gameOver) return;

    const state = gameStateRef.current;
    const now = Date.now();

    // Move player
    if (state.keys.left && state.player.x > 0) {
      state.player.x -= PLAYER_SPEED;
    }
    if (state.keys.right && state.player.x < GAME_WIDTH - state.player.width) {
      state.player.x += PLAYER_SPEED;
    }

    // Player shooting
    if (state.keys.space && now - state.lastShot > 300) {
      state.bullets.push({
        x: state.player.x + state.player.width / 2 - 2,
        y: state.player.y,
        width: 4,
        height: 10,
        isPlayer: true
      });
      state.lastShot = now;
    }

    // Move player bullets
    state.bullets = state.bullets.filter(bullet => {
      bullet.y -= BULLET_SPEED;
      return bullet.y > -10;
    });

    // Move alien bullets
    state.alienBullets = state.alienBullets.filter(bullet => {
      bullet.y += BULLET_SPEED - 2;
      return bullet.y < GAME_HEIGHT + 10;
    });

    // Move aliens
    let moveDown = false;

    // Check if aliens hit the edge
    for (let alien of state.aliens) {
      if ((alien.x <= 0 && state.alienDirection === -1) ||
        (alien.x >= GAME_WIDTH - alien.width && state.alienDirection === 1)) {
        moveDown = true;
        break;
      }
    }

    if (moveDown) {
      state.alienDirection *= -1;
      state.aliens.forEach(alien => {
        alien.y += 20;
      });
    } else {
      state.aliens.forEach(alien => {
        alien.x += state.alienDirection * ALIEN_SPEED;
      });
    }

    // Alien shooting
    if (Math.random() < 0.02 && state.aliens.length > 0) {
      const randomAlien = state.aliens[Math.floor(Math.random() * state.aliens.length)];
      state.alienBullets.push({
        x: randomAlien.x + randomAlien.width / 2 - 2,
        y: randomAlien.y + randomAlien.height,
        width: 4,
        height: 8
      });
    }

    // Check bullet-alien collisions
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const bullet = state.bullets[i];
      for (let j = state.aliens.length - 1; j >= 0; j--) {
        const alien = state.aliens[j];
        if (checkCollision(bullet, alien)) {
          state.bullets.splice(i, 1);
          alien.health--;
          if (alien.health <= 0) {
            state.aliens.splice(j, 1);
            setScore(prev => prev + (alien.type === 'tank' ? 30 : alien.type === 'fast' ? 20 : 10));
          }
          break;
        }
      }
    }

    // Check alien bullet-player collisions
    for (let i = state.alienBullets.length - 1; i >= 0; i--) {
      const bullet = state.alienBullets[i];
      if (checkCollision(bullet, state.player)) {
        state.alienBullets.splice(i, 1);
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
            setGameRunning(false);
          }
          return newLives;
        });
        break;
      }
    }

    // Check if aliens reached the bottom
    for (let alien of state.aliens) {
      if (alien.y + alien.height >= GAME_HEIGHT - 100) {
        setGameOver(true);
        setGameRunning(false);
        break;
      }
    }

    // Check if wave is complete
    if (state.aliens.length === 0) {
      setWave(prev => prev + 1);
      setTimeout(() => {
        createAliens();
      }, 2000);
    }
  };

  // Draw player spaceship
  const drawPlayer = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    // Player ship - sleek blue fighter
    ctx.fillStyle = '#4A90E2';
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y); // Top point
    ctx.lineTo(x + width * 0.8, y + height * 0.7); // Right wing
    ctx.lineTo(x + width * 0.6, y + height); // Right bottom
    ctx.lineTo(x + width * 0.4, y + height); // Left bottom
    ctx.lineTo(x + width * 0.2, y + height * 0.7); // Left wing
    ctx.closePath();
    ctx.fill();

    // Engine glow
    ctx.fillStyle = '#00FFFF';
    ctx.fillRect(x + width * 0.4, y + height * 0.8, width * 0.2, height * 0.2);
  };

  // Draw alien ships
  const drawAlien = (ctx: CanvasRenderingContext2D, alien: any) => {
    const { x, y, width, height, type, health } = alien;

    if (type === 'tank') {
      // Tank alien - large red menacing ship
      const colors = ['#8B0000', '#FF4500', '#FFD700'];
      ctx.fillStyle = colors[3 - health] || colors[2];

      // Main body
      ctx.fillRect(x + width * 0.1, y + height * 0.3, width * 0.8, height * 0.4);
      // Wings
      ctx.fillRect(x, y + height * 0.5, width * 0.3, height * 0.2);
      ctx.fillRect(x + width * 0.7, y + height * 0.5, width * 0.3, height * 0.2);
      // Cockpit
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(x + width * 0.4, y + height * 0.1, width * 0.2, height * 0.3);

    } else if (type === 'fast') {
      // Fast alien - sleek purple ship
      const alpha = health === 2 ? '1.0' : '0.7';
      ctx.fillStyle = `rgba(138, 43, 226, ${alpha})`;

      // Diamond shape
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y); // Top
      ctx.lineTo(x + width * 0.9, y + height / 2); // Right
      ctx.lineTo(x + width / 2, y + height); // Bottom
      ctx.lineTo(x + width * 0.1, y + height / 2); // Left
      ctx.closePath();
      ctx.fill();

      // Center glow
      ctx.fillStyle = '#DDA0DD';
      ctx.fillRect(x + width * 0.4, y + height * 0.4, width * 0.2, height * 0.2);

    } else {
      // Basic alien - green saucer
      ctx.fillStyle = '#32CD32';

      // Saucer shape
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height / 2, width * 0.4, height * 0.3, 0, 0, 2 * Math.PI);
      ctx.fill();

      // Dome
      ctx.fillStyle = '#90EE90';
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height * 0.3, width * 0.25, height * 0.2, 0, 0, 2 * Math.PI);
      ctx.fill();

      // Lights
      ctx.fillStyle = '#FFFF00';
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const lx = x + width / 2 + Math.cos(angle) * width * 0.3;
        const ly = y + height / 2 + Math.sin(angle) * height * 0.2;
        ctx.beginPath();
        ctx.arc(lx, ly, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  // Draw bullets
  const drawBullet = (ctx: CanvasRenderingContext2D, bullet: any, isPlayer: boolean) => {
    if (isPlayer) {
      // Player bullets - bright cyan energy
      ctx.fillStyle = '#00FFFF';
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 8;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      ctx.shadowBlur = 0;
    } else {
      // Alien bullets - red plasma
      ctx.fillStyle = '#FF0000';
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.ellipse(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2,
        bullet.width / 2, bullet.height / 2, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };

  // Render game
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;

    // Clear canvas with space background
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#000011');
    gradient.addColorStop(0.5, '#000033');
    gradient.addColorStop(1, '#000055');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw animated stars
    ctx.fillStyle = 'white';
    const time = Date.now() * 0.001;
    for (let i = 0; i < 150; i++) {
      const x = (i * 123 + time * 20) % GAME_WIDTH;
      const y = (i * 456) % GAME_HEIGHT;
      const size = Math.sin(i + time) * 0.5 + 1;
      ctx.globalAlpha = Math.sin(i * 0.5 + time * 2) * 0.5 + 0.5;
      ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;

    // Draw nebula effects
    for (let i = 0; i < 5; i++) {
      const nebulaGradient = ctx.createRadialGradient(
        (i * 200 + time * 10) % GAME_WIDTH, (i * 150) % GAME_HEIGHT, 0,
        (i * 200 + time * 10) % GAME_WIDTH, (i * 150) % GAME_HEIGHT, 100
      );
      nebulaGradient.addColorStop(0, `rgba(${100 + i * 30}, ${50 + i * 20}, ${150 + i * 20}, 0.1)`);
      nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebulaGradient;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    // Draw player
    drawPlayer(ctx, state.player.x, state.player.y, state.player.width, state.player.height);

    // Draw player bullets
    state.bullets.forEach(bullet => {
      drawBullet(ctx, bullet, true);
    });

    // Draw alien bullets
    state.alienBullets.forEach(bullet => {
      drawBullet(ctx, bullet, false);
    });

    // Draw aliens
    state.aliens.forEach(alien => {
      drawAlien(ctx, alien);
    });

    // Draw UI with better styling
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 18px Arial';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 3;

    ctx.strokeText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Score: ${score}`, 20, 30);

    ctx.strokeText(`Lives: ${lives}`, 20, 55);
    ctx.fillText(`Lives: ${lives}`, 20, 55);

    ctx.strokeText(`Wave: ${wave}`, 20, 80);
    ctx.fillText(`Wave: ${wave}`, 20, 80);
  };

  // Game loop
  useEffect(() => {
    if (!gameRunning || gameOver) return;

    const gameLoop = setInterval(() => {
      updateGame();
      render();
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [gameRunning, gameOver, score, lives, wave]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          state.keys.left = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          state.keys.right = true;
          e.preventDefault();
          break;
        case ' ':
          state.keys.space = true;
          e.preventDefault();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          state.keys.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          state.keys.right = false;
          break;
        case ' ':
          state.keys.space = false;
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

  const startGame = () => {
    if (gameOver) {
      // Reset game
      setScore(0);
      setLives(3);
      setWave(1);
      setGameOver(false);
      gameStateRef.current.player.x = 375;
      gameStateRef.current.bullets = [];
      gameStateRef.current.alienBullets = [];
    }
    createAliens();
    setGameRunning(true);
    render(); // Initial render
  };

  const pauseGame = () => {
    setGameRunning(false);
  };

  const resetGame = () => {
    setGameRunning(false);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setWave(1);
    gameStateRef.current.player.x = 375;
    gameStateRef.current.aliens = [];
    gameStateRef.current.bullets = [];
    gameStateRef.current.alienBullets = [];
    render();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentGame(null)}
            className="flex items-center space-x-2 text-purple-300 hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Games</span>
          </button>

          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            Alien Invader
          </h1>

          <div className="flex space-x-2">
            <button
              onClick={gameRunning ? pauseGame : startGame}
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
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex justify-center mb-6">
          <div className="border-4 border-purple-500 rounded-lg overflow-hidden shadow-2xl">
            <canvas
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              className="block bg-black"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center text-gray-300">
          {!gameRunning && !gameOver && (
            <div className="space-y-2">
              <p className="text-lg">🚀 Use arrow keys or A/D to move, SPACE to shoot 🚀</p>
              <p className="text-sm">🔵 Blue Fighter = Your Ship | ⚡ Cyan Energy = Your Shots | 🔴 Red Plasma = Enemy Fire</p>
              <p className="text-sm">🛸 Red Ships = Tanks (3 hits) | 💎 Purple Ships = Fast (2 hits) | 🛸 Green Saucers = Basic (1 hit)</p>
            </div>
          )}

          {gameOver && (
            <div className="bg-black/80 backdrop-blur rounded-lg p-8 inline-block border border-purple-500">
              <h2 className="text-3xl font-bold text-red-400 mb-4">Game Over!</h2>
              <div className="space-y-3 mb-6">
                <p className="text-gray-300 text-lg">
                  Final Score: <span className="text-purple-400 font-bold">{score}</span>
                </p>
                <p className="text-gray-300 text-lg">
                  Waves Completed: <span className="text-orange-400 font-bold">{wave - 1}</span>
                </p>
              </div>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white px-8 py-3 rounded-lg transition-all duration-300 font-bold"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlienInvader;