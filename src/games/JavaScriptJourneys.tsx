import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface Challenge {
  id: number;
  title: string;
  description: string;
  starterCode: string;
  expectedOutput: string;
  testCases: { input: any; expected: any }[];
  difficulty: 'easy' | 'medium' | 'hard';
  hints: string[];
}

const JavaScriptJourneys: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState<boolean[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [score, setScore] = useState(0);

  const challenges: Challenge[] = [
    {
      id: 1,
      title: 'Array Explorer',
      description: 'Create a function that returns the sum of all numbers in an array',
      starterCode: 'function sumArray(arr) {\n  // Your code here\n  \n}',
      expectedOutput: 'Function should return sum of array elements',
      testCases: [
        { input: [1, 2, 3, 4, 5], expected: 15 },
        { input: [10, -5, 3], expected: 8 },
        { input: [], expected: 0 }
      ],
      difficulty: 'easy',
      hints: [
        'Use a loop to iterate through the array',
        'Initialize a sum variable to 0',
        'Add each element to the sum'
      ]
    },
    {
      id: 2,
      title: 'String Manipulator',
      description: 'Create a function that reverses a string',
      starterCode: 'function reverseString(str) {\n  // Your code here\n  \n}',
      expectedOutput: 'Function should return reversed string',
      testCases: [
        { input: 'hello', expected: 'olleh' },
        { input: 'JavaScript', expected: 'tpircSavaJ' },
        { input: 'a', expected: 'a' }
      ],
      difficulty: 'easy',
      hints: [
        'Convert string to array using split()',
        'Use the reverse() method',
        'Join back to string with join()'
      ]
    },
    {
      id: 3,
      title: 'Object Navigator',
      description: 'Create a function that finds the maximum value in an object',
      starterCode: 'function findMaxValue(obj) {\n  // Your code here\n  \n}',
      expectedOutput: 'Function should return the maximum value',
      testCases: [
        { input: { a: 5, b: 10, c: 3 }, expected: 10 },
        { input: { x: -1, y: -5, z: -2 }, expected: -1 },
        { input: { single: 42 }, expected: 42 }
      ],
      difficulty: 'medium',
      hints: [
        'Use Object.values() to get all values',
        'Use Math.max() with spread operator',
        'Or loop through values to find maximum'
      ]
    },
    {
      id: 4,
      title: 'Array Filter Master',
      description: 'Create a function that filters even numbers from an array',
      starterCode: 'function filterEvenNumbers(arr) {\n  // Your code here\n  \n}',
      expectedOutput: 'Function should return array of even numbers',
      testCases: [
        { input: [1, 2, 3, 4, 5, 6], expected: [2, 4, 6] },
        { input: [1, 3, 5], expected: [] },
        { input: [2, 4, 8, 10], expected: [2, 4, 8, 10] }
      ],
      difficulty: 'medium',
      hints: [
        'Use the filter() method',
        'Check if number % 2 === 0',
        'Return the filtered array'
      ]
    },
    {
      id: 5,
      title: 'Async Space Mission',
      description: 'Create an async function that simulates a space mission delay',
      starterCode: 'async function spaceMission(delay) {\n  // Your code here\n  // Should wait for delay milliseconds\n  // Then return "Mission Complete"\n}',
      expectedOutput: 'Function should return "Mission Complete" after delay',
      testCases: [
        { input: 100, expected: 'Mission Complete' },
        { input: 50, expected: 'Mission Complete' },
        { input: 0, expected: 'Mission Complete' }
      ],
      difficulty: 'hard',
      hints: [
        'Use new Promise with setTimeout',
        'Use await to wait for the promise',
        'Return the completion message'
      ]
    },
    {
      id: 6,
      title: 'Recursive Factorial',
      description: 'Create a recursive function to calculate factorial',
      starterCode: 'function factorial(n) {\n  // Your code here\n  // Use recursion\n}',
      expectedOutput: 'Function should return factorial of n',
      testCases: [
        { input: 5, expected: 120 },
        { input: 0, expected: 1 },
        { input: 3, expected: 6 }
      ],
      difficulty: 'hard',
      hints: [
        'Base case: if n <= 1, return 1',
        'Recursive case: return n * factorial(n-1)',
        'Remember factorial of 0 is 1'
      ]
    }
  ];

  const challenge = challenges[currentChallenge];

  useEffect(() => {
    setUserCode(challenge.starterCode);
    setOutput('');
    setTestResults([]);
    setIsCorrect(false);
    setShowHint(false);
    setHintIndex(0);
  }, [currentChallenge]);

  const runTests = async () => {
    try {
      // Create function from user code
      const func = new Function('return ' + userCode)();
      
      const results: boolean[] = [];
      let allPassed = true;
      
      for (const testCase of challenge.testCases) {
        try {
          let result;
          if (challenge.id === 5) { // Async challenge
            result = await func(testCase.input);
          } else {
            result = func(testCase.input);
          }
          
          const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
          results.push(passed);
          if (!passed) allPassed = false;
        } catch (error) {
          results.push(false);
          allPassed = false;
        }
      }
      
      setTestResults(results);
      setIsCorrect(allPassed);
      
      if (allPassed) {
        const points = challenge.difficulty === 'easy' ? 20 : challenge.difficulty === 'medium' ? 35 : 50;
        const hintPenalty = showHint ? Math.floor(points * 0.2) : 0;
        const finalPoints = points - hintPenalty;
        setScore(prev => prev + finalPoints);
        setOutput('All tests passed! 🎉');
      } else {
        setOutput('Some tests failed. Check your logic and try again.');
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults([]);
      setIsCorrect(false);
    }
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
    } else {
      updateScore('javascript-journeys', score);
    }
  };

  const showNextHint = () => {
    if (hintIndex < challenge.hints.length - 1) {
      setHintIndex(prev => prev + 1);
    }
    setShowHint(true);
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
            JavaScript Journeys
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
                Mission {challenge.id}: {challenge.title}
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
              <h4 className="text-orange-300 font-bold mb-2 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2" />
                Hint {hintIndex + 1}:
              </h4>
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

          <button
            onClick={() => setShowHint(true)}
            className="text-orange-400 hover:text-orange-300 transition-colors"
          >
            💡 Show Hint
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <div className="bg-cosmic-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-cosmic-200 mb-4">Code Editor</h3>
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              className="w-full h-80 bg-cosmic-900 border border-cosmic-600 rounded-lg p-4 text-green-400 font-mono text-sm focus:border-purple-400 focus:outline-none resize-none"
              spellCheck={false}
            />
            
            <div className="flex space-x-4 mt-4">
              <button
                onClick={runTests}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Run Tests</span>
              </button>
              
              {isCorrect && currentChallenge < challenges.length - 1 && (
                <button
                  onClick={nextChallenge}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <span>Next Mission</span>
                </button>
              )}
              
              {isCorrect && currentChallenge === challenges.length - 1 && (
                <button
                  onClick={() => setCurrentGame(null)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span>Journey Complete!</span>
                </button>
              )}
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-cosmic-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-cosmic-200 mb-4">Test Results</h3>
            
            {/* Test Cases */}
            <div className="space-y-3 mb-6">
              {challenge.testCases.map((testCase, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    testResults[index] === true
                      ? 'border-green-500 bg-green-500/10'
                      : testResults[index] === false
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-cosmic-600 bg-cosmic-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cosmic-400">Test {index + 1}</span>
                    {testResults[index] === true && <CheckCircle className="w-4 h-4 text-green-400" />}
                    {testResults[index] === false && <XCircle className="w-4 h-4 text-red-400" />}
                  </div>
                  <div className="text-sm font-mono">
                    <div className="text-cosmic-300">
                      Input: {JSON.stringify(testCase.input)}
                    </div>
                    <div className="text-cosmic-300">
                      Expected: {JSON.stringify(testCase.expected)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Output */}
            <div className="bg-cosmic-900 border border-cosmic-600 rounded-lg p-4">
              <h4 className="text-sm text-cosmic-400 mb-2">Output:</h4>
              <div className={`font-mono text-sm ${
                isCorrect ? 'text-green-400' : output.startsWith('Error:') ? 'text-red-400' : 'text-cosmic-300'
              }`}>
                {output || 'Run tests to see results...'}
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
                  <p className="text-green-300 font-bold">Mission Accomplished!</p>
                  {currentChallenge === challenges.length - 1 && (
                    <p className="text-cosmic-300 mt-2">
                      🚀 You've completed all JavaScript missions! Final Score: {score}
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

export default JavaScriptJourneys;