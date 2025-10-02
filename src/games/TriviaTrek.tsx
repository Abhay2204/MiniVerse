import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Clock, Trophy } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
}

const TriviaTrek: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameComplete, setGameComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const questions: Question[] = [
    {
      id: 1,
      question: "What is the closest star to Earth?",
      options: ["Alpha Centauri", "Sirius", "The Sun", "Proxima Centauri"],
      correctAnswer: 2,
      category: "Astronomy",
      difficulty: "easy",
      explanation: "The Sun is our closest star, located about 93 million miles away from Earth."
    },
    {
      id: 2,
      question: "How many planets are in our solar system?",
      options: ["7", "8", "9", "10"],
      correctAnswer: 1,
      category: "Solar System",
      difficulty: "easy",
      explanation: "There are 8 planets in our solar system since Pluto was reclassified as a dwarf planet in 2006."
    },
    {
      id: 3,
      question: "What is the largest planet in our solar system?",
      options: ["Saturn", "Jupiter", "Neptune", "Uranus"],
      correctAnswer: 1,
      category: "Planets",
      difficulty: "easy",
      explanation: "Jupiter is the largest planet, with a mass greater than all other planets combined."
    },
    {
      id: 4,
      question: "What galaxy do we live in?",
      options: ["Andromeda", "Milky Way", "Whirlpool", "Sombrero"],
      correctAnswer: 1,
      category: "Galaxies",
      difficulty: "medium",
      explanation: "We live in the Milky Way galaxy, which contains over 100 billion stars."
    },
    {
      id: 5,
      question: "What is the speed of light in a vacuum?",
      options: ["299,792,458 m/s", "300,000,000 m/s", "186,000 mph", "150,000,000 km/s"],
      correctAnswer: 0,
      category: "Physics",
      difficulty: "medium",
      explanation: "The speed of light in a vacuum is exactly 299,792,458 meters per second."
    },
    {
      id: 6,
      question: "What is a supernova?",
      options: ["A new star forming", "A star exploding", "A black hole", "A comet"],
      correctAnswer: 1,
      category: "Stellar Evolution",
      difficulty: "medium",
      explanation: "A supernova is the explosive death of a massive star, briefly outshining entire galaxies."
    },
    {
      id: 7,
      question: "What is the event horizon of a black hole?",
      options: ["The center of the black hole", "The point of no return", "The edge of space", "A type of radiation"],
      correctAnswer: 1,
      category: "Black Holes",
      difficulty: "hard",
      explanation: "The event horizon is the boundary around a black hole beyond which nothing can escape."
    },
    {
      id: 8,
      question: "What is dark matter?",
      options: ["Matter that doesn't emit light", "Antimatter", "Black holes", "Unknown matter that doesn't interact electromagnetically"],
      correctAnswer: 3,
      category: "Cosmology",
      difficulty: "hard",
      explanation: "Dark matter is mysterious matter that doesn't interact electromagnetically but affects gravity."
    },
    {
      id: 9,
      question: "What is the Hubble constant?",
      options: ["The age of the universe", "The rate of universal expansion", "The size of the observable universe", "The temperature of space"],
      correctAnswer: 1,
      category: "Cosmology",
      difficulty: "hard",
      explanation: "The Hubble constant describes how fast the universe is expanding."
    },
    {
      id: 10,
      question: "What are pulsars?",
      options: ["Exploding stars", "Rotating neutron stars", "Binary star systems", "Planetary nebulae"],
      correctAnswer: 1,
      category: "Neutron Stars",
      difficulty: "hard",
      explanation: "Pulsars are rapidly rotating neutron stars that emit beams of radiation."
    }
  ];

  const question = questions[currentQuestion];

  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, showResult, gameComplete]);

  const handleTimeUp = () => {
    setSelectedAnswer(null);
    setShowResult(true);
    setStreak(0);
    
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === question.correctAnswer;
    
    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft / 3);
      const difficultyBonus = question.difficulty === 'easy' ? 10 : question.difficulty === 'medium' ? 20 : 30;
      const streakBonus = streak >= 3 ? 10 : 0;
      const points = difficultyBonus + timeBonus + streakBonus;
      
      setScore(prev => prev + points);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
    
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    } else {
      setGameComplete(true);
      updateScore('trivia-trek', score);
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTimeLeft(30);
    setGameComplete(false);
    setStreak(0);
    setMaxStreak(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-cosmic-400';
    }
  };

  const getOptionClass = (index: number) => {
    if (!showResult) {
      return 'bg-cosmic-700 hover:bg-cosmic-600 border-cosmic-600';
    }
    
    if (index === question.correctAnswer) {
      return 'bg-green-500/30 border-green-500 text-green-300';
    }
    
    if (index === selectedAnswer && selectedAnswer !== question.correctAnswer) {
      return 'bg-red-500/30 border-red-500 text-red-300';
    }
    
    return 'bg-cosmic-700 border-cosmic-600 opacity-50';
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
            Trivia Trek
          </h1>
          
          <button
            onClick={resetGame}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Trophy className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {!gameComplete ? (
          <>
            {/* Game Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                <div className="text-xl font-bold text-yellow-400">{streak}</div>
                <div className="text-sm text-cosmic-400">Streak</div>
              </div>
              <div className="text-center bg-cosmic-800 rounded-lg p-3">
                <div className="text-xl font-bold text-blue-400">{currentQuestion + 1}/{questions.length}</div>
                <div className="text-sm text-cosmic-400">Progress</div>
              </div>
            </div>

            {/* Streak Indicator */}
            {streak >= 3 && (
              <div className="text-center mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg font-bold"
                >
                  🔥 {streak} STREAK! +10 Bonus Points!
                </motion.div>
              </div>
            )}

            {/* Question Card */}
            <div className="bg-cosmic-800 rounded-xl p-8 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm bg-cosmic-700 px-3 py-1 rounded-full text-cosmic-300">
                      {question.category}
                    </span>
                    <span className={`text-sm font-bold ${getDifficultyColor(question.difficulty)} capitalize`}>
                      {question.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-cosmic-400">
                  <Clock className="w-4 h-4" />
                  <span>{timeLeft}s</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-purple-400 mb-8">
                {question.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {question.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={!showResult ? { scale: 1.02 } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={`
                      p-4 rounded-lg border-2 transition-all text-left
                      ${getOptionClass(index)}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-cosmic-600 flex items-center justify-center text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Result and Explanation */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-cosmic-700 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      {selectedAnswer === question.correctAnswer ? (
                        <>
                          <Star className="w-5 h-5 text-green-400" />
                          <span className="text-green-400 font-bold">Correct!</span>
                        </>
                      ) : selectedAnswer === null ? (
                        <>
                          <Clock className="w-5 h-5 text-orange-400" />
                          <span className="text-orange-400 font-bold">Time's up!</span>
                        </>
                      ) : (
                        <>
                          <span className="text-red-400 font-bold">Incorrect</span>
                        </>
                      )}
                    </div>
                    <p className="text-cosmic-300">{question.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* Game Complete */
          <div className="bg-cosmic-800 rounded-xl p-8 text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-3xl font-bold text-purple-400 mb-4">Trek Complete!</h2>
            <p className="text-cosmic-300 mb-6">
              You've completed your journey through the cosmos of knowledge!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-cosmic-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">{score}</div>
                <div className="text-cosmic-300">Final Score</div>
              </div>
              <div className="bg-cosmic-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">{maxStreak}</div>
                <div className="text-cosmic-300">Best Streak</div>
              </div>
              <div className="bg-cosmic-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">
                  {Math.round((questions.filter((_, i) => i < currentQuestion).length / questions.length) * 100)}%
                </div>
                <div className="text-cosmic-300">Accuracy</div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetGame}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Trek Again
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
    </div>
  );
};

export default TriviaTrek;