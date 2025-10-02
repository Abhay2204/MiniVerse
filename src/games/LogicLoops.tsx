import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface Challenge {
  id: number;
  title: string;
  description: string;
  code: string;
  expectedOutput: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hints: string[];
}

const LogicLoops: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [output, setOutput] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [score, setScore] = useState(0);

  const challenges: Challenge[] = [
    {
      id: 1,
      title: 'Simple Loop',
      description: 'Create a loop that prints numbers 1 to 5',
      code: 'for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}',
      expectedOutput: '1\n2\n3\n4\n5',
      difficulty: 'easy',
      hints: [
        'Use a for loop with i starting at 1',
        'The condition should be i <= 5',
        'Use console.log(i) to print each number'
      ]
    },
    {
      id: 2,
      title: 'Even Numbers',
      description: 'Print only even numbers from 2 to 10',
      code: 'for (let i = 2; i <= 10; i += 2) {\n  console.log(i);\n}',
      expectedOutput: '2\n4\n6\n8\n10',
      difficulty: 'easy',
      hints: [
        'Start with i = 2',
        'Increment by 2 each time (i += 2)',
        'Loop while i <= 10'
      ]
    },
    {
      id: 3,
      title: 'Array Sum',
      description: 'Calculate the sum of array [1, 2, 3, 4, 5]',
      code: 'let arr = [1, 2, 3, 4, 5];\nlet sum = 0;\nfor (let i = 0; i < arr.length; i++) {\n  sum += arr[i];\n}\nconsole.log(sum);',
      expectedOutput: '15',
      difficulty: 'medium',
      hints: [
        'Initialize sum to 0',
        'Loop through the array using arr.length',
        'Add each element to sum using sum += arr[i]'
      ]
    },
    {
      id: 4,
      title: 'Factorial',
      description: 'Calculate factorial of 5 (5! = 5 × 4 × 3 × 2 × 1)',
      code: 'let factorial = 1;\nfor (let i = 1; i <= 5; i++) {\n  factorial *= i;\n}\nconsole.log(factorial);',
      expectedOutput: '120',
      difficulty: 'medium',
      hints: [
        'Initialize factorial to 1',
        'Multiply factorial by each number from 1 to 5',
        'Use factorial *= i in the loop'
      ]
    },
    {
      id: 5,
      title: 'Fibonacci Sequence',
      description: 'Generate first 7 Fibonacci numbers (0, 1, 1, 2, 3, 5, 8)',
      code: 'let a = 0, b = 1;\nconsole.log(a);\nconsole.log(b);\nfor (let i = 2; i < 7; i++) {\n  let next = a + b;\n  console.log(next);\n  a = b;\n  b = next;\n}',
      expectedOutput: '0\n1\n1\n2\n3\n5\n8',
      difficulty: 'hard',
      hints: [
        'Start with a = 0, b = 1',
        'Each new number is the sum of the previous two',
        'Update a and b for the next iteration'
      ]
    },
    {
      id: 6,
      title: 'Prime Check',
      description: 'Check if 17 is a prime number (print true/false)',
      code: 'let num = 17;\nlet isPrime = true;\nif (num <= 1) isPrime = false;\nfor (let i = 2; i < num; i++) {\n  if (num % i === 0) {\n    isPrime = false;\n    break;\n  }\n}\nconsole.log(isPrime);',
      expectedOutput: 'true',
      difficulty: 'hard',
      hints: [
        'A prime number is only divisible by 1 and itself',
        'Check if num % i === 0 for any i from 2 to num-1',
        'If divisible, it\'s not prime'
      ]
    }
  ];

  const challenge = challenges[currentChallenge];

  useEffect(() => {
    setUserCode('');
    setOutput('');
    setIsCorrect(false);
    setShowHint(false);
    setHintIndex(0);
  }, [currentChallenge]);

  const runCode = () => {
    try {
      // Create a mock console.log that captures output
      let capturedOutput = '';
      const mockConsole = {
        log: (value: any) => {
          capturedOutput += (capturedOutput ? '\n' : '') + String(value);
        }
      };

      // Create a function with the user's code
      const func = new Function('console', userCode);
      func(mockConsole);

      setOutput(capturedOutput);
      
      // Check if output matches expected
      const correct = capturedOutput.trim() === challenge.expectedOutput.trim();
      setIsCorrect(correct);
      
      if (correct) {
        const points = challenge.difficulty === 'easy' ? 10 : challenge.difficulty === 'medium' ? 20 : 30;
        const hintPenalty = showHint ? Math.floor(points * 0.3) : 0;
        const finalPoints = points - hintPenalty;
        setScore(prev => prev + finalPoints);
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsCorrect(false);
    }
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
    } else {
      // Game complete
      updateScore('logic-loops', score);
    }
  };

  const showNextHint = () => {
    if (hintIndex < challenge.hints.length - 1) {
      setHintIndex(prev => prev + 1);
    }
    setShowHint(true);
  };

  const resetChallenge = () => {
    setUserCode('');
    setOutput('');
    setIsCorrect(false);
    setShowHint(false);
    setHintIndex(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-cosmic-400';
    }
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
            Logic Loops
          </h1>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{score}</div>
            <div className="text-sm text-cosmic-400">Score</div>
          </div>
        </div>

        {/* Challenge Info */}
        <div className="bg-cosmic-800 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-purple-400 mb-2">
                Challenge {challenge.id}: {challenge.title}
              </h2>
              <p className="text-cosmic-300 mb-2">{challenge.description}</p>
              <span className={`text-sm font-bold ${getDifficultyColor(challenge.difficulty)} capitalize`}>
                {challenge.difficulty}
              </span>
            </div>
            <div className="text-sm text-cosmic-400">
              {currentChallenge + 1} / {challenges.length}
            </div>
          </div>

          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 mb-4"
            >
              <h4 className="text-orange-300 font-bold mb-2">Hint {hintIndex + 1}:</h4>
              <p className="text-orange-200">{challenge.hints[hintIndex]}</p>
              {hintIndex < challenge.hints.length - 1 && (
                <button
                  onClick={showNextHint}
                  className="mt-2 text-orange-400 hover:text-orange-300 underline"
                >
                  Show next hint
                </button>
              )}
            </motion.div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => setShowHint(true)}
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              💡 Show Hint
            </button>
            <button
              onClick={resetChallenge}
              className="text-cosmic-400 hover:text-cosmic-300 transition-colors"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <div className="bg-cosmic-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-cosmic-200 mb-4">Your Code</h3>
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              className="w-full h-64 bg-cosmic-900 border border-cosmic-600 rounded-lg p-4 text-green-400 font-mono text-sm focus:border-purple-400 focus:outline-none resize-none"
              placeholder="Write your JavaScript code here..."
              spellCheck={false}
            />
            
            <div className="flex space-x-4 mt-4">
              <button
                onClick={runCode}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Run Code</span>
              </button>
              
              {isCorrect && currentChallenge < challenges.length - 1 && (
                <button
                  onClick={nextChallenge}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <span>Next Challenge</span>
                </button>
              )}
              
              {isCorrect && currentChallenge === challenges.length - 1 && (
                <button
                  onClick={() => setCurrentGame(null)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span>Complete!</span>
                </button>
              )}
            </div>
          </div>

          {/* Output */}
          <div className="bg-cosmic-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-cosmic-200 mb-4">Output</h3>
            
            <div className="mb-4">
              <h4 className="text-sm text-cosmic-400 mb-2">Expected:</h4>
              <div className="bg-cosmic-900 border border-cosmic-600 rounded-lg p-4 font-mono text-sm text-cosmic-300 whitespace-pre-line">
                {challenge.expectedOutput}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm text-cosmic-400 mb-2 flex items-center">
                Your Output:
                {output && (
                  isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-green-400 ml-2" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 ml-2" />
                  )
                )}
              </h4>
              <div className={`bg-cosmic-900 border rounded-lg p-4 font-mono text-sm whitespace-pre-line min-h-[100px] ${
                isCorrect ? 'border-green-500 text-green-400' : 
                output.startsWith('Error:') ? 'border-red-500 text-red-400' : 
                'border-cosmic-600 text-cosmic-300'
              }`}>
                {output || 'Run your code to see output...'}
              </div>
            </div>

            <AnimatePresence>
              {isCorrect && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mt-4 bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center"
                >
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-300 font-bold">Perfect! Challenge completed!</p>
                  {currentChallenge === challenges.length - 1 && (
                    <p className="text-cosmic-300 mt-2">
                      🎉 You've mastered all logic challenges! Final Score: {score}
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

export default LogicLoops;