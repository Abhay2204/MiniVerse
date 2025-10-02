import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Trophy } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface Challenge {
  id: number;
  description: string;
  target: string;
  initialCSS: string;
  solution: string[];
  hint: string;
}

const challenges: Challenge[] = [
  {
    id: 1,
    description: "Center the red box horizontally and vertically",
    target: "center-box",
    initialCSS: "display: flex;",
    solution: ["justify-content: center", "align-items: center"],
    hint: "Use justify-content and align-items properties"
  },
  {
    id: 2,
    description: "Arrange all boxes in a column",
    target: "column-layout",
    initialCSS: "display: flex;",
    solution: ["flex-direction: column"],
    hint: "Change the flex direction"
  },
  {
    id: 3,
    description: "Distribute boxes evenly across the container",
    target: "space-between",
    initialCSS: "display: flex;",
    solution: ["justify-content: space-between"],
    hint: "Use space-between for even distribution"
  },
  {
    id: 4,
    description: "Make the middle box grow to fill available space",
    target: "flex-grow",
    initialCSS: "display: flex;",
    solution: ["flex-grow: 1"],
    hint: "Use flex-grow on the middle box"
  },
];

const FlexboxGame: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [userCSS, setUserCSS] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState(0);

  const challenge = challenges[currentChallenge];

  useEffect(() => {
    setUserCSS(challenge.initialCSS);
    setIsCorrect(false);
    setShowHint(false);
  }, [currentChallenge]);

  const checkSolution = () => {
    const userLines = userCSS.toLowerCase().split(';').map(line => line.trim()).filter(line => line);
    const solutionLines = challenge.solution.map(line => line.toLowerCase().trim());
    
    const hasAllSolutions = solutionLines.every(solutionLine => 
      userLines.some(userLine => userLine.includes(solutionLine))
    );

    setIsCorrect(hasAllSolutions);
    
    if (hasAllSolutions) {
      setCompletedChallenges(prev => prev + 1);
      updateScore('flexbox-fighter', (completedChallenges + 1) * 25);
    }
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
    }
  };

  const renderPreview = () => {
    const style = userCSS.split(';').reduce((acc, rule) => {
      const [property, value] = rule.split(':').map(s => s.trim());
      if (property && value) {
        const camelCase = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        acc[camelCase] = value;
      }
      return acc;
    }, {} as any);

    return (
      <div className="bg-cosmic-800 p-4 rounded-lg">
        <div 
          className="w-full h-48 bg-cosmic-700 border-2 border-cosmic-600 relative"
          style={style}
        >
          {challenge.id === 1 && (
            <div className="w-16 h-16 bg-red-500 rounded"></div>
          )}
          {challenge.id === 2 && (
            <>
              <div className="w-12 h-12 bg-red-500 rounded m-2"></div>
              <div className="w-12 h-12 bg-green-500 rounded m-2"></div>
              <div className="w-12 h-12 bg-blue-500 rounded m-2"></div>
            </>
          )}
          {challenge.id === 3 && (
            <>
              <div className="w-12 h-12 bg-red-500 rounded"></div>
              <div className="w-12 h-12 bg-green-500 rounded"></div>
              <div className="w-12 h-12 bg-blue-500 rounded"></div>
            </>
          )}
          {challenge.id === 4 && (
            <>
              <div className="w-12 h-12 bg-red-500 rounded"></div>
              <div className="w-12 h-12 bg-green-500 rounded" style={{ flexGrow: userCSS.includes('flex-grow: 1') ? 1 : 0 }}></div>
              <div className="w-12 h-12 bg-blue-500 rounded"></div>
            </>
          )}
        </div>
      </div>
    );
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
            Flexbox Fighter
          </h1>
          
          <div className="flex items-center space-x-2 text-cosmic-300">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span>{completedChallenges}/{challenges.length}</span>
          </div>
        </div>

        {/* Challenge Info */}
        <div className="bg-cosmic-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-purple-400 mb-2">
            Challenge {challenge.id}: {challenge.description}
          </h2>
          <p className="text-cosmic-300 mb-4">{challenge.description}</p>
          
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 mb-4"
            >
              <p className="text-orange-300">💡 Hint: {challenge.hint}</p>
            </motion.div>
          )}
          
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-orange-400 hover:text-orange-300 transition-colors"
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-cosmic-200">CSS Editor</h3>
            <textarea
              value={userCSS}
              onChange={(e) => setUserCSS(e.target.value)}
              className="w-full h-64 bg-cosmic-800 border border-cosmic-600 rounded-lg p-4 text-cosmic-200 font-mono focus:border-purple-400 focus:outline-none resize-none"
              placeholder="Enter your CSS here..."
            />
            
            <div className="flex space-x-4">
              <button
                onClick={checkSolution}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Check Solution</span>
              </button>
              
              {isCorrect && currentChallenge < challenges.length - 1 && (
                <button
                  onClick={nextChallenge}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <span>Next Challenge</span>
                </button>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-cosmic-200">Preview</h3>
            {renderPreview()}
            
            <AnimatePresence>
              {isCorrect && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center"
                >
                  <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-300 font-bold">Correct! Well done!</p>
                  {currentChallenge === challenges.length - 1 && (
                    <p className="text-cosmic-300 mt-2">
                      🎉 You've completed all challenges! You're a Flexbox Fighter!
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlexboxGame;