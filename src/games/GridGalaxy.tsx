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
    description: "Create a 3x3 grid layout",
    target: "basic-grid",
    initialCSS: "display: grid;",
    solution: ["grid-template-columns: repeat(3, 1fr)", "grid-template-rows: repeat(3, 1fr)"],
    hint: "Use grid-template-columns and grid-template-rows with repeat()"
  },
  {
    id: 2,
    description: "Place item in the center cell (row 2, column 2)",
    target: "grid-placement",
    initialCSS: "display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngrid-template-rows: repeat(3, 1fr);",
    solution: ["grid-column: 2", "grid-row: 2"],
    hint: "Use grid-column and grid-row to position the item"
  },
  {
    id: 3,
    description: "Create gaps between grid items",
    target: "grid-gap",
    initialCSS: "display: grid;\ngrid-template-columns: repeat(3, 1fr);",
    solution: ["gap: 20px"],
    hint: "Use the gap property to add space between items"
  },
  {
    id: 4,
    description: "Span an item across 2 columns",
    target: "grid-span",
    initialCSS: "display: grid;\ngrid-template-columns: repeat(3, 1fr);",
    solution: ["grid-column: span 2"],
    hint: "Use grid-column: span 2 to make an item span multiple columns"
  },
  {
    id: 5,
    description: "Create a responsive grid with auto-fit columns",
    target: "auto-fit",
    initialCSS: "display: grid;",
    solution: ["grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))"],
    hint: "Use repeat(auto-fit, minmax()) for responsive columns"
  },
  {
    id: 6,
    description: "Create named grid lines and place item using names",
    target: "named-lines",
    initialCSS: "display: grid;",
    solution: ["grid-template-columns: [start] 1fr [middle] 1fr [end]", "grid-column: start / middle"],
    hint: "Define named lines in brackets and use them for positioning"
  }
];

const GridGalaxy: React.FC = () => {
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
      updateScore('grid-galaxy', (completedChallenges + 1) * 30);
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

    const renderGridItems = () => {
      switch (challenge.id) {
        case 1:
        case 3:
          return Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="bg-purple-500 rounded p-2 text-white text-center text-sm">
              {i + 1}
            </div>
          ));
        case 2:
          return [
            ...Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="bg-cosmic-600 rounded p-2 text-white text-center text-sm">
                {i + 1}
              </div>
            )),
            <div key="center" className="bg-red-500 rounded p-2 text-white text-center text-sm" style={{
              gridColumn: userCSS.includes('grid-column: 2') ? '2' : 'auto',
              gridRow: userCSS.includes('grid-row: 2') ? '2' : 'auto'
            }}>
              CENTER
            </div>,
            ...Array.from({ length: 4 }, (_, i) => (
              <div key={i + 5} className="bg-cosmic-600 rounded p-2 text-white text-center text-sm">
                {i + 6}
              </div>
            ))
          ];
        case 4:
          return [
            <div key="span" className="bg-red-500 rounded p-2 text-white text-center text-sm" style={{
              gridColumn: userCSS.includes('span 2') ? 'span 2' : 'auto'
            }}>
              SPAN 2
            </div>,
            ...Array.from({ length: 4 }, (_, i) => (
              <div key={i + 1} className="bg-purple-500 rounded p-2 text-white text-center text-sm">
                {i + 1}
              </div>
            ))
          ];
        case 5:
          return Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="bg-green-500 rounded p-2 text-white text-center text-sm">
              Item {i + 1}
            </div>
          ));
        case 6:
          return [
            <div key="named" className="bg-red-500 rounded p-2 text-white text-center text-sm" style={{
              gridColumn: userCSS.includes('start / middle') ? 'start / middle' : 'auto'
            }}>
              NAMED
            </div>,
            ...Array.from({ length: 3 }, (_, i) => (
              <div key={i + 1} className="bg-purple-500 rounded p-2 text-white text-center text-sm">
                {i + 1}
              </div>
            ))
          ];
        default:
          return [];
      }
    };

    return (
      <div className="bg-cosmic-800 p-4 rounded-lg">
        <div 
          className="w-full min-h-48 bg-cosmic-700 border-2 border-cosmic-600 rounded p-2"
          style={style}
        >
          {renderGridItems()}
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
            Grid Galaxy
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
            <h3 className="text-lg font-bold text-cosmic-200">CSS Grid Editor</h3>
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
                  <p className="text-green-300 font-bold">Perfect Grid Layout!</p>
                  {currentChallenge === challenges.length - 1 && (
                    <p className="text-cosmic-300 mt-2">
                      🎉 You've mastered CSS Grid! You're a Grid Galaxy champion!
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Grid Reference */}
        <div className="mt-8 bg-cosmic-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-purple-400 mb-4">CSS Grid Quick Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="bg-cosmic-700 rounded p-3">
              <h4 className="text-orange-400 font-bold mb-2">Container Properties</h4>
              <ul className="text-cosmic-300 space-y-1">
                <li>display: grid</li>
                <li>grid-template-columns</li>
                <li>grid-template-rows</li>
                <li>gap</li>
              </ul>
            </div>
            <div className="bg-cosmic-700 rounded p-3">
              <h4 className="text-orange-400 font-bold mb-2">Item Properties</h4>
              <ul className="text-cosmic-300 space-y-1">
                <li>grid-column</li>
                <li>grid-row</li>
                <li>grid-area</li>
                <li>justify-self</li>
              </ul>
            </div>
            <div className="bg-cosmic-700 rounded p-3">
              <h4 className="text-orange-400 font-bold mb-2">Functions</h4>
              <ul className="text-cosmic-300 space-y-1">
                <li>repeat()</li>
                <li>minmax()</li>
                <li>auto-fit</li>
                <li>auto-fill</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridGalaxy;