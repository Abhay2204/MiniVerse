import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Star } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemorySpace: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const spaceEmojis = ['🚀', '🛸', '🌟', '🪐', '🌙', '☄️', '👽', '🌌'];

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameWon) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameWon) {
      const finalScore = Math.max(0, 100 - moves + streak * 10);
      setScore(finalScore);
      updateScore('memory-space', finalScore);
    }
  }, [timeLeft, gameWon, gameStarted, moves, streak]);

  useEffect(() => {
    if (matches === spaceEmojis.length) {
      setGameWon(true);
      const finalScore = Math.max(0, 300 - moves + timeLeft * 2 + streak * 15);
      setScore(finalScore);
      updateScore('memory-space', finalScore);
    }
  }, [matches, moves, timeLeft, streak]);

  const initializeGame = () => {
    const shuffledCards = [...spaceEmojis, ...spaceEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameWon(false);
    setTimeLeft(60);
    setGameStarted(true);
    setScore(0);
    setStreak(0);
    setShowHint(false);
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || gameWon || timeLeft === 0) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards(prev =>
      prev.map(c =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    );

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);

      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard?.emoji === secondCard?.emoji) {
        // Match found
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true }
                : c
            )
          );
          setMatches(prev => prev + 1);
          setStreak(prev => prev + 1);
          setFlippedCards([]);
        }, 600);
      } else {
        // No match
        setStreak(0);
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 1200);
      }
    }
  };

  const handleHint = () => {
    if (showHint) return;
    setShowHint(true);
    setMoves(prev => prev + 2); // Penalty for using hint

    // Show two unmatched cards with same emoji for 2 seconds
    const unmatchedCards = cards.filter(c => !c.isMatched && !c.isFlipped);
    const emojiGroups = unmatchedCards.reduce((acc, card) => {
      if (!acc[card.emoji]) acc[card.emoji] = [];
      acc[card.emoji].push(card);
      return acc;
    }, {} as Record<string, Card[]>);

    const availablePairs = Object.values(emojiGroups).filter(group => group.length >= 2);
    if (availablePairs.length > 0) {
      const randomPair = availablePairs[Math.floor(Math.random() * availablePairs.length)];
      const [card1, card2] = randomPair.slice(0, 2);

      setCards(prev =>
        prev.map(c =>
          c.id === card1.id || c.id === card2.id
            ? { ...c, isFlipped: true }
            : c
        )
      );

      setTimeout(() => {
        setCards(prev =>
          prev.map(c =>
            c.id === card1.id || c.id === card2.id
              ? { ...c, isFlipped: false }
              : c
          )
        );
        setShowHint(false);
      }, 2000);
    }
  };



  return (
    <div className="min-h-screen bg-cosmic-900 p-4 overflow-y-auto">
      <div className="container mx-auto max-w-2xl pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentGame(null)}
            className="flex items-center space-x-2 text-cosmic-300 hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Games</span>
          </button>
          
          <h1 className="text-2xl font-orbitron font-bold text-center bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            Memory Space
          </h1>
          
          <button
            onClick={initializeGame}
            className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Game Stats */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="text-center">
            <div className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-blue-400'}`}>
              {timeLeft}s
            </div>
            <div className="text-sm text-cosmic-400">Time</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-400">{moves}</div>
            <div className="text-sm text-cosmic-400">Moves</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-400">{matches}/{spaceEmojis.length}</div>
            <div className="text-sm text-cosmic-400">Matches</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-400">{streak}</div>
            <div className="text-sm text-cosmic-400">Streak</div>
          </div>
          <div className="text-center">
            <button
              onClick={handleHint}
              disabled={showHint}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            >
              Hint (-2 moves)
            </button>
          </div>
        </div>



        {/* Game Board */}
        <div className="grid grid-cols-4 gap-3 mb-6 max-w-md mx-auto">
          {cards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`
                aspect-square rounded-xl cursor-pointer relative perspective-1000 group
                ${card.isMatched ? 'pointer-events-none' : 'hover:scale-105'}
                transition-all duration-300
              `}
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: !gameStarted ? 'none' : 'slideInUp 0.6s ease-out'
              }}
            >
              <div
                className={`
                  w-full h-full rounded-xl transition-all duration-700 relative preserve-3d
                  ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
                  ${card.isMatched ? 'animate-pulse' : ''}
                `}
              >
                {/* Card Back */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center backface-hidden shadow-xl border border-white/20">
                  <div className="relative">
                    <Star className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '8s' }} />
                    <div className="absolute inset-0 bg-white/30 rounded-full blur-lg animate-pulse" />
                  </div>
                </div>

                {/* Card Front */}
                <div
                  className={`
                    absolute inset-0 rounded-xl flex items-center justify-center text-4xl rotate-y-180 backface-hidden shadow-xl border border-white/20
                    ${card.isMatched
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 animate-bounce'
                      : 'bg-gradient-to-br from-slate-700 to-slate-800'
                    }
                  `}
                >
                  <div className={`transition-all duration-300 ${card.isMatched ? 'scale-125' : ''}`}>
                    {card.emoji}
                  </div>
                  {card.isMatched && (
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-xl animate-ping" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-6">
          <div className="bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
              style={{ width: `${(matches / spaceEmojis.length) * 100}%` }}
            />
          </div>
          <p className="text-center text-white/60 text-sm mt-2">
            Progress: {matches}/{spaceEmojis.length} pairs found
          </p>
        </div>

        {/* Game Won/Lost Modal */}
        {(gameWon || timeLeft === 0) && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn overflow-y-auto p-4">
            <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/90 backdrop-blur-lg rounded-3xl p-6 sm:p-8 text-center max-w-md w-full border border-white/20 shadow-2xl animate-slideInUp my-auto">
              <div className="text-6xl mb-6 animate-bounce">{gameWon ? '🎉' : '⏰'}</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                {gameWon ? 'Mission Accomplished!' : 'Time\'s Up!'}
              </h2>
              <div className="space-y-2 mb-6 text-white/80">
                <p>Moves: <span className="font-bold text-orange-400">{moves}</span></p>
                <p>Matches: <span className="font-bold text-purple-400">{matches}/{spaceEmojis.length}</span></p>
                <p>Streak: <span className="font-bold text-yellow-400">{streak}</span></p>
                <p>Time: <span className="font-bold text-blue-400">{timeLeft}s</span></p>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-8">
                Final Score: {score}
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={initializeGame}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 font-medium shadow-lg"
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
            </div>
          </div>
        )}
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MemorySpace;