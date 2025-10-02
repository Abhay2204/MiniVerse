import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Zap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface TypingChallenge {
  id: number;
  text: string;
  category: string;
}

const SpeedTypingOrbit: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [currentChallenge, setCurrentChallenge] = useState<TypingChallenge | null>(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [correctCharacters, setCorrectCharacters] = useState(0);

  const spaceWords = [
    // Planets and celestial bodies
    'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
    'sun', 'moon', 'asteroid', 'comet', 'meteor', 'meteorite', 'galaxy', 'nebula', 'quasar',
    'pulsar', 'supernova', 'blackhole', 'wormhole', 'constellation', 'orbit', 'satellite',
    
    // Space exploration
    'rocket', 'spacecraft', 'astronaut', 'cosmonaut', 'spacesuit', 'helmet', 'mission',
    'launch', 'landing', 'exploration', 'discovery', 'telescope', 'observatory', 'probe',
    'rover', 'station', 'shuttle', 'capsule', 'module', 'docking',
    
    // Space phenomena
    'gravity', 'radiation', 'vacuum', 'atmosphere', 'magnetic', 'solar', 'cosmic', 'stellar',
    'interstellar', 'intergalactic', 'lightyear', 'parsec', 'redshift', 'blueshift', 'doppler',
    'fusion', 'fission', 'plasma', 'antimatter', 'dark matter', 'dark energy',
    
    // Space technology
    'thruster', 'engine', 'fuel', 'propulsion', 'navigation', 'communication', 'antenna',
    'solar panel', 'heat shield', 'life support', 'oxygen', 'carbon dioxide', 'recycling',
    'artificial gravity', 'zero gravity', 'weightlessness', 'microgravity'
  ];

  const phrases = [
    'exploring the vast cosmos',
    'journey to distant stars',
    'orbiting around planets',
    'cosmic radiation levels',
    'interstellar space travel',
    'galactic civilization',
    'stellar formation process',
    'planetary alignment today',
    'asteroid belt navigation',
    'comet tail composition',
    'nebula gas and dust',
    'black hole event horizon',
    'wormhole theoretical physics',
    'space time continuum',
    'quantum mechanics theory',
    'relativity and gravity',
    'rocket propulsion system',
    'spacecraft heat shield',
    'astronaut training program',
    'mission control center',
    'satellite communication',
    'telescope observations',
    'mars rover exploration',
    'lunar surface samples',
    'space station modules'
  ];

  const getRandomChallenge = (): TypingChallenge => {
    const usePhrase = Math.random() < 0.3;
    
    if (usePhrase) {
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      return {
        id: Date.now(),
        text: phrase,
        category: 'phrase'
      };
    } else {
      const word = spaceWords[Math.floor(Math.random() * spaceWords.length)];
      return {
        id: Date.now(),
        text: word,
        category: 'word'
      };
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setGameRunning(true);
    setWordsCompleted(0);
    setAccuracy(100);
    setTotalCharacters(0);
    setCorrectCharacters(0);
    setUserInput('');
    setCurrentChallenge(getRandomChallenge());
  };

  const resetGame = () => {
    setCurrentChallenge(null);
    setUserInput('');
    setScore(0);
    setTimeLeft(60);
    setGameRunning(false);
    setGameOver(false);
    setWordsCompleted(0);
    setAccuracy(100);
    setTotalCharacters(0);
    setCorrectCharacters(0);
  };

  useEffect(() => {
    if (timeLeft > 0 && gameRunning) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameRunning) {
      setGameOver(true);
      setGameRunning(false);
      const wpm = Math.round((correctCharacters / 5) / ((60 - timeLeft) / 60));
      const finalScore = score + (wpm * 10) + (accuracy * 5);
      updateScore('speed-typing-orbit', finalScore);
    }
  }, [timeLeft, gameRunning, score, correctCharacters, accuracy, updateScore]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gameRunning || !currentChallenge) return;
    
    const value = e.target.value;
    setUserInput(value);
    
    // Calculate accuracy
    const newTotalChars = totalCharacters + 1;
    let newCorrectChars = correctCharacters;
    
    if (value.length <= currentChallenge.text.length) {
      const lastChar = value[value.length - 1];
      const expectedChar = currentChallenge.text[value.length - 1];
      
      if (lastChar === expectedChar) {
        newCorrectChars++;
      }
    }
    
    setTotalCharacters(newTotalChars);
    setCorrectCharacters(newCorrectChars);
    setAccuracy(Math.round((newCorrectChars / newTotalChars) * 100));
    
    // Check if word/phrase is completed
    if (value === currentChallenge.text) {
      const points = currentChallenge.category === 'phrase' ? 50 : 20;
      const accuracyBonus = accuracy >= 95 ? 10 : accuracy >= 90 ? 5 : 0;
      const speedBonus = value.length > 10 ? 15 : value.length > 5 ? 10 : 5;
      
      setScore(prev => prev + points + accuracyBonus + speedBonus);
      setWordsCompleted(prev => prev + 1);
      setUserInput('');
      setCurrentChallenge(getRandomChallenge());
    }
  };

  const getCharacterStatus = (index: number) => {
    if (index >= userInput.length) return 'pending';
    return userInput[index] === currentChallenge?.text[index] ? 'correct' : 'incorrect';
  };

  const wpm = gameRunning && timeLeft < 60 
    ? Math.round((correctCharacters / 5) / ((60 - timeLeft) / 60)) 
    : 0;

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
            Speed Typing Orbit
          </h1>
          
          <button
            onClick={resetGame}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center bg-cosmic-800 rounded-lg p-3">
            <div className="text-xl font-bold text-purple-400">{score}</div>
            <div className="text-sm text-cosmic-400">Score</div>
          </div>
          <div className="text-center bg-cosmic-800 rounded-lg p-3">
            <div className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-orange-400'}`}>
              {timeLeft}s
            </div>
            <div className="text-sm text-cosmic-400">Time</div>
          </div>
          <div className="text-center bg-cosmic-800 rounded-lg p-3">
            <div className="text-xl font-bold text-blue-400">{wpm}</div>
            <div className="text-sm text-cosmic-400">WPM</div>
          </div>
          <div className="text-center bg-cosmic-800 rounded-lg p-3">
            <div className={`text-xl font-bold ${accuracy >= 95 ? 'text-green-400' : accuracy >= 90 ? 'text-yellow-400' : 'text-red-400'}`}>
              {accuracy}%
            </div>
            <div className="text-sm text-cosmic-400">Accuracy</div>
          </div>
          <div className="text-center bg-cosmic-800 rounded-lg p-3">
            <div className="text-xl font-bold text-green-400">{wordsCompleted}</div>
            <div className="text-sm text-cosmic-400">Words</div>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-cosmic-800 rounded-xl p-8 mb-6">
          {!gameRunning && !gameOver && (
            <div className="text-center">
              <div className="text-6xl mb-6">⌨️</div>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">Test Your Typing Speed!</h2>
              <p className="text-cosmic-300 mb-6">
                Type space-themed words and phrases as fast and accurately as you can.
                You have 60 seconds to achieve the highest score!
              </p>
              <button
                onClick={startGame}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-xl font-bold transition-colors"
              >
                Start Typing
              </button>
            </div>
          )}

          {gameRunning && currentChallenge && (
            <div className="text-center">
              <div className="mb-6">
                <div className="text-sm text-cosmic-400 mb-2 capitalize">
                  {currentChallenge.category}
                </div>
                <div className="text-3xl font-mono mb-6 p-4 bg-cosmic-700 rounded-lg">
                  {currentChallenge.text.split('').map((char, index) => (
                    <span
                      key={index}
                      className={`
                        ${getCharacterStatus(index) === 'correct' ? 'text-green-400 bg-green-400/20' : ''}
                        ${getCharacterStatus(index) === 'incorrect' ? 'text-red-400 bg-red-400/20' : ''}
                        ${getCharacterStatus(index) === 'pending' ? 'text-cosmic-300' : ''}
                        ${index === userInput.length ? 'bg-purple-400/50' : ''}
                      `}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
              
              <input
                type="text"
                value={userInput}
                onChange={handleInputChange}
                className="w-full text-center text-xl bg-cosmic-700 border-2 border-cosmic-600 rounded-lg p-4 text-white focus:border-purple-400 focus:outline-none font-mono"
                placeholder="Start typing..."
                autoFocus
              />
            </div>
          )}

          {gameOver && (
            <div className="text-center">
              <div className="text-6xl mb-6">🚀</div>
              <h2 className="text-2xl font-bold text-green-400 mb-4">Typing Mission Complete!</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-cosmic-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">{score}</div>
                  <div className="text-cosmic-300">Final Score</div>
                </div>
                <div className="bg-cosmic-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">{wpm}</div>
                  <div className="text-cosmic-300">Words Per Minute</div>
                </div>
                <div className="bg-cosmic-700 rounded-lg p-4">
                  <div className={`text-2xl font-bold ${accuracy >= 95 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {accuracy}%
                  </div>
                  <div className="text-cosmic-300">Accuracy</div>
                </div>
                <div className="bg-cosmic-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">{wordsCompleted}</div>
                  <div className="text-cosmic-300">Words Completed</div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={startGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Type Again
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

        {/* Instructions */}
        {!gameRunning && !gameOver && (
          <div className="text-center text-cosmic-400">
            <p className="mb-2">🎯 Type the displayed words and phrases exactly</p>
            <p className="mb-2">⚡ Speed and accuracy both matter for your score</p>
            <p>🌟 Longer phrases give bonus points!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeedTypingOrbit;