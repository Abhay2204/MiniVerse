import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Zap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface ReactionTest {
  id: number;
  color: string;
  targetColor: string;
  startTime: number;
  reactionTime?: number;
  difficulty: number;
  challengeType: 'normal' | 'reverse' | 'multiple' | 'fade' | 'distraction';
  multipleColors?: string[];
  targetWord?: string;
}

const ReactionNebula: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [currentTest, setCurrentTest] = useState<ReactionTest | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [fadeOpacity, setFadeOpacity] = useState(1);
  const [distractionElements, setDistractionElements] = useState<Array<{id: number, color: string, x: number, y: number}>>([]);
  const [level, setLevel] = useState(1);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);

  const colors = [
    { name: 'red', bg: 'bg-red-500', text: 'Red' },
    { name: 'blue', bg: 'bg-blue-500', text: 'Blue' },
    { name: 'green', bg: 'bg-green-500', text: 'Green' },
    { name: 'yellow', bg: 'bg-yellow-500', text: 'Yellow' },
    { name: 'purple', bg: 'bg-purple-500', text: 'Purple' },
    { name: 'orange', bg: 'bg-orange-500', text: 'Orange' },
    { name: 'pink', bg: 'bg-pink-500', text: 'Pink' },
    { name: 'cyan', bg: 'bg-cyan-500', text: 'Cyan' }
  ];

  const MAX_ROUNDS = 15;
  const LEVEL_UP_THRESHOLD = 3; // Correct answers needed to level up

  const getDifficulty = () => {
    return Math.min(5, Math.floor(round / 3) + 1);
  };

  const getChallengeType = (difficulty: number): ReactionTest['challengeType'] => {
    if (difficulty <= 1) return 'normal';
    
    const types: ReactionTest['challengeType'][] = ['normal', 'reverse'];
    
    if (difficulty >= 2) types.push('multiple');
    if (difficulty >= 3) types.push('fade');
    if (difficulty >= 4) types.push('distraction');
    
    return types[Math.floor(Math.random() * types.length)];
  };

  const startGame = () => {
    setScore(0);
    setRound(0);
    setResults([]);
    setGameComplete(false);
    setGameActive(true);
    setStreak(0);
    setBestStreak(0);
    setLevel(1);
    setIncorrectAnswers(0);
    startRound();
  };

  const generateDistractionElements = () => {
    const elements = [];
    for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
      elements.push({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)].name,
        x: Math.random() * 80 + 10, // 10-90% from left
        y: Math.random() * 60 + 20  // 20-80% from top
      });
    }
    return elements;
  };

  const startRound = () => {
    setWaiting(true);
    setCurrentTest(null);
    setFadeOpacity(1);
    setDistractionElements([]);
    
    const difficulty = getDifficulty();
    const challengeType = getChallengeType(difficulty);
    
    // Dynamic delay based on difficulty - harder levels have shorter delays
    const baseDelay = Math.max(500, 2000 - (difficulty * 200));
    const delay = baseDelay + Math.random() * (3000 - baseDelay);
    
    setTimeout(() => {
      const targetColor = colors[Math.floor(Math.random() * colors.length)];
      let displayColor = targetColor;
      let multipleColors: string[] = [];
      let targetWord = targetColor.text;
      
      // Generate challenge based on type
      switch (challengeType) {
        case 'normal':
          displayColor = Math.random() < 0.6 ? targetColor : colors[Math.floor(Math.random() * colors.length)];
          break;
          
        case 'reverse':
          // Show a different color but ask if it matches
          displayColor = colors[Math.floor(Math.random() * colors.length)];
          break;
          
        case 'multiple':
          // Show multiple colors, user needs to find the matching one
          multipleColors = [targetColor.name];
          for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
            const randomColor = colors[Math.floor(Math.random() * colors.length)].name;
            if (!multipleColors.includes(randomColor)) {
              multipleColors.push(randomColor);
            }
          }
          // Shuffle the array
          multipleColors = multipleColors.sort(() => Math.random() - 0.5);
          displayColor = colors.find(c => c.name === multipleColors[0])!;
          break;
          
        case 'fade':
          displayColor = Math.random() < 0.7 ? targetColor : colors[Math.floor(Math.random() * colors.length)];
          // Start fading effect
          setTimeout(() => {
            const fadeInterval = setInterval(() => {
              setFadeOpacity(prev => {
                const newOpacity = prev - 0.1;
                if (newOpacity <= 0.3) {
                  clearInterval(fadeInterval);
                  return 0.3;
                }
                return newOpacity;
              });
            }, 100);
          }, 500);
          break;
          
        case 'distraction':
          displayColor = Math.random() < 0.7 ? targetColor : colors[Math.floor(Math.random() * colors.length)];
          setDistractionElements(generateDistractionElements());
          break;
      }
      
      const test: ReactionTest = {
        id: Date.now(),
        color: displayColor.name,
        targetColor: targetColor.name,
        startTime: Date.now(),
        difficulty,
        challengeType,
        multipleColors,
        targetWord
      };
      
      setCurrentTest(test);
      setWaiting(false);
    }, delay);
  };

  const handleReaction = (isCorrect: boolean) => {
    if (!currentTest || waiting) return;
    
    const reactionTime = Date.now() - currentTest.startTime;
    const newResults = [...results, reactionTime];
    setResults(newResults);
    
    let points = 0;
    if (isCorrect) {
      // Base points with difficulty multiplier
      const basePoints = Math.max(100, 1000 - reactionTime);
      const difficultyMultiplier = 1 + (currentTest.difficulty - 1) * 0.5;
      const streakBonus = Math.min(streak * 50, 500);
      points = Math.round(basePoints * difficultyMultiplier + streakBonus);
      
      setScore(prev => prev + points);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(best => Math.max(best, newStreak));
        
        // Level up every LEVEL_UP_THRESHOLD correct answers
        if (newStreak > 0 && newStreak % LEVEL_UP_THRESHOLD === 0) {
          setLevel(prev => prev + 1);
        }
        
        return newStreak;
      });
      setIncorrectAnswers(0);
    } else {
      setStreak(0);
      setIncorrectAnswers(prev => prev + 1);
      
      // Penalty for wrong answers increases with difficulty
      const penalty = currentTest.difficulty * 100;
      setScore(prev => Math.max(0, prev - penalty));
    }
    
    const newRound = round + 1;
    setRound(newRound);
    
    if (newRound >= MAX_ROUNDS || incorrectAnswers >= 3) {
      setGameComplete(true);
      setGameActive(false);
      const finalScore = score + points;
      updateScore('reaction-nebula', finalScore);
    } else {
      setTimeout(startRound, 1200);
    }
    
    setCurrentTest(null);
  };

  const resetGame = () => {
    setCurrentTest(null);
    setScore(0);
    setRound(0);
    setGameActive(false);
    setWaiting(false);
    setResults([]);
    setGameComplete(false);
    setStreak(0);
    setBestStreak(0);
    setFadeOpacity(1);
    setDistractionElements([]);
    setLevel(1);
    setIncorrectAnswers(0);
  };

  const getColorClass = (colorName: string) => {
    return colors.find(c => c.name === colorName)?.bg || 'bg-gray-500';
  };

  const getColorText = (colorName: string) => {
    return colors.find(c => c.name === colorName)?.text || 'Unknown';
  };

  const averageReaction = results.length > 0 
    ? Math.round(results.reduce((a, b) => a + b, 0) / results.length)
    : 0;

  const renderGameContent = () => {
    if (!currentTest) return null;

    const isCorrect = currentTest.color === currentTest.targetColor;
    
    switch (currentTest.challengeType) {
      case 'multiple':
        return (
          <div className="text-center">
            <p className="text-cosmic-300 mb-4">Find the color that matches: <span className="text-purple-400 font-bold">{currentTest.targetWord}</span></p>
            <div className="flex justify-center space-x-4 mb-8">
              {currentTest.multipleColors?.map((colorName, index) => (
                <div
                  key={index}
                  className={`w-20 h-20 rounded-xl cursor-pointer transition-transform hover:scale-110 ${getColorClass(colorName)}`}
                  onClick={() => handleReaction(colorName === currentTest.targetColor)}
                />
              ))}
            </div>
          </div>
        );
        
      case 'reverse':
        return (
          <div className="text-center">
            <p className="text-cosmic-300 mb-4">Is this color <span className="text-red-400 font-bold">NOT</span> {currentTest.targetWord}?</p>
            <div className="mb-8">
              <div 
                className={`inline-block px-12 py-8 rounded-xl text-4xl font-bold text-white ${getColorClass(currentTest.color)}`}
                style={{ opacity: fadeOpacity }}
              >
                {getColorText(currentTest.targetColor)}
              </div>
            </div>
            <div className="flex justify-center space-x-8">
              <button
                onClick={() => handleReaction(currentTest.color !== currentTest.targetColor)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-xl font-bold transition-colors"
              >
                YES (Not {currentTest.targetWord})
              </button>
              <button
                onClick={() => handleReaction(currentTest.color === currentTest.targetColor)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-xl font-bold transition-colors"
              >
                NO (Is {currentTest.targetWord})
              </button>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center relative">
            {/* Distraction elements */}
            {distractionElements.map(element => (
              <div
                key={element.id}
                className={`absolute w-8 h-8 rounded-full ${getColorClass(element.color)} animate-pulse`}
                style={{
                  left: `${element.x}%`,
                  top: `${element.y}%`,
                  opacity: 0.6
                }}
              />
            ))}
            
            <p className="text-cosmic-300 mb-4">Does the color match the word?</p>
            <div className="mb-8 relative z-10">
              <div 
                className={`inline-block px-12 py-8 rounded-xl text-4xl font-bold text-white ${getColorClass(currentTest.color)} transition-opacity duration-200`}
                style={{ opacity: fadeOpacity }}
              >
                {getColorText(currentTest.targetColor)}
              </div>
              {currentTest.challengeType === 'fade' && (
                <p className="text-orange-400 text-sm mt-2">Color is fading! Decide quickly!</p>
              )}
            </div>
            
            <div className="flex justify-center space-x-8">
              <button
                onClick={() => handleReaction(currentTest.color === currentTest.targetColor)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-xl font-bold transition-colors"
              >
                YES
              </button>
              <button
                onClick={() => handleReaction(currentTest.color !== currentTest.targetColor)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-xl font-bold transition-colors"
              >
                NO
              </button>
            </div>
          </div>
        );
    }
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
            Reaction Nebula
          </h1>
          
          <button
            onClick={resetGame}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Enhanced Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center bg-cosmic-800 rounded-lg p-3">
            <div className="text-xl font-bold text-purple-400">{score}</div>
            <div className="text-xs text-cosmic-400">Score</div>
          </div>
          <div className="text-center bg-cosmic-800 rounded-lg p-3">
            <div className="text-xl font-bold text-orange-400">{round}/{MAX_ROUNDS}</div>
            <div className="text-xs text-cosmic-400">Round</div>
          </div>
          <div className="text-center bg-cosmic-800 rounded-lg p-3">
            <div className="text-xl font-bold text-blue-400">{averageReaction}ms</div>
            <div className="text-xs text-cosmic-400">Avg Time</div>
          </div>
          <div className="text-center bg-cosmic-800 rounded-lg p-3">
            <div className="text-xl font-bold text-green-400">{streak}</div>
            <div className="text-xs text-cosmic-400">Streak</div>
          </div>
          <div className="text-center bg-cosmic-800 rounded-lg p-3">
            <div className="text-xl font-bold text-yellow-400">L{level}</div>
            <div className="text-xs text-cosmic-400">Level</div>
          </div>
        </div>

        {/* Difficulty Indicator */}
        {gameActive && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center space-x-2 bg-cosmic-800 rounded-full px-4 py-2">
              <span className="text-cosmic-300 text-sm">Difficulty:</span>
              <div className="flex space-x-1">
                {[1,2,3,4,5].map(i => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full ${i <= getDifficulty() ? 'bg-purple-400' : 'bg-cosmic-600'}`} 
                  />
                ))}
              </div>
              {currentTest && (
                <span className="text-purple-400 text-sm capitalize">{currentTest.challengeType}</span>
              )}
            </div>
          </div>
        )}

        {/* Game Area */}
        <div className="bg-cosmic-800 rounded-xl p-8 mb-6 min-h-96 relative overflow-hidden">
          {!gameActive && !gameComplete && (
            <div className="text-center">
              <div className="text-6xl mb-6">⚡</div>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">Enhanced Reaction Challenge!</h2>
              <p className="text-cosmic-300 mb-6">
                Test your reflexes with increasing difficulty! Face multiple challenge types:
                <br />
                <span className="text-purple-400">• Color matching</span> • <span className="text-orange-400">Reverse logic</span> • <span className="text-green-400">Multiple choice</span> • <span className="text-blue-400">Fading colors</span> • <span className="text-red-400">Distractions</span>
              </p>
              <button
                onClick={startGame}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-xl font-bold transition-colors"
              >
                Start Enhanced Test
              </button>
            </div>
          )}

          {gameActive && waiting && (
            <div className="text-center">
              <div className="text-6xl mb-6 animate-pulse">⏳</div>
              <h2 className="text-2xl font-bold text-orange-400 mb-4">Get Ready...</h2>
              <p className="text-cosmic-300">Level {level} Challenge incoming!</p>
              {streak > 0 && <p className="text-green-400 text-sm">🔥 {streak} streak bonus active!</p>}
            </div>
          )}

          {gameActive && currentTest && !waiting && renderGameContent()}

          {gameComplete && (
            <div className="text-center">
              <div className="text-6xl mb-6">
                {incorrectAnswers >= 3 ? '💥' : '🎯'}
              </div>
              <h2 className="text-2xl font-bold text-green-400 mb-4">
                {incorrectAnswers >= 3 ? 'Game Over!' : 'Challenge Complete!'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-cosmic-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">{score}</div>
                  <div className="text-cosmic-300">Final Score</div>
                </div>
                <div className="bg-cosmic-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-400">{averageReaction}ms</div>
                  <div className="text-cosmic-300">Average Time</div>
                </div>
                <div className="bg-cosmic-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">{bestStreak}</div>
                  <div className="text-cosmic-300">Best Streak</div>
                </div>
                <div className="bg-cosmic-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-400">L{level}</div>
                  <div className="text-cosmic-300">Max Level</div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={startGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Challenge Again
                </button>
                <button
                  onClick={() => setCurrentGame(null)}
                  className="bg-cosmic-600 hover:bg-cosmic-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Back to Games
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Instructions */}
        {!gameActive && !gameComplete && (
          <div className="text-center text-cosmic-400 space-y-2">
            <p>🎯 <span className="text-purple-400">Normal:</span> Match color to word</p>
            <p>🔄 <span className="text-orange-400">Reverse:</span> Answer if color does NOT match</p>
            <p>🎨 <span className="text-green-400">Multiple:</span> Click the correct color</p>
            <p>👻 <span className="text-blue-400">Fade:</span> Colors disappear quickly!</p>
            <p>💫 <span className="text-red-400">Distraction:</span> Ignore the moving elements</p>
            <p className="text-yellow-400 mt-4">⚡ Streak bonuses • Level progression • Difficulty scaling!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReactionNebula;