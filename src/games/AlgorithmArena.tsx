import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Settings, Info, Trophy } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface ArrayElement {
  value: number;
  id: number;
  color: string;
}

interface SortingAlgorithm {
  name: string;
  emoji: string;
  description: string;
  complexity: string;
  color: string;
  status: 'waiting' | 'running' | 'finished';
  steps: number;
  comparisons: number;
  swaps: number;
  startTime: number;
  finishTime: number;
  currentArray: ArrayElement[];
  highlightIndices: number[];
  winner: boolean;
}

const AlgorithmArena: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [arraySize, setArraySize] = useState(10);
  const [customArray, setCustomArray] = useState<number[]>([]);
  const [tempArrayInput, setTempArrayInput] = useState('');
  const [useCustomArray, setUseCustomArray] = useState(false);
  const [algorithms, setAlgorithms] = useState<SortingAlgorithm[]>([]);
  const [raceStep, setRaceStep] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const animationFrameRef = useRef<number>();



  const shuffleArray = (array: number[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeAlgorithms = useCallback(() => {
    // Create array either from custom input or random generation
    const arrayValues = useCustomArray && customArray.length > 0 ? customArray : Array.from({ length: arraySize }, (_, i) => i + 1);
    const colors = [
      'from-red-400 to-red-600',
      'from-orange-400 to-orange-600',
      'from-yellow-400 to-yellow-600',
      'from-green-400 to-green-600',
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-cyan-400 to-cyan-600'
    ];

    // Shuffle the array if it's a random array, but keep custom array as-is
    const shuffledValues = useCustomArray ? arrayValues : shuffleArray([...arrayValues]);
    const initialArray: ArrayElement[] = shuffledValues.map((value, index) => ({
      value,
      id: index,
      color: colors[index % colors.length]
    }));

    const algorithmList: Omit<SortingAlgorithm, 'currentArray' | 'highlightIndices'>[] = [
      {
        name: 'Bubble Sort',
        emoji: '🫧',
        description: 'Compares adjacent elements and swaps them if out of order',
        complexity: 'O(n²)',
        color: 'from-blue-500 to-cyan-500',
        status: 'waiting',
        steps: 0,
        comparisons: 0,
        swaps: 0,
        startTime: 0,
        finishTime: 0,
        winner: false
      },
      {
        name: 'Selection Sort',
        emoji: '🎯',
        description: 'Finds minimum element and places it at beginning',
        complexity: 'O(n²)',
        color: 'from-purple-500 to-pink-500',
        status: 'waiting',
        steps: 0,
        comparisons: 0,
        swaps: 0,
        startTime: 0,
        finishTime: 0,
        winner: false
      },
      {
        name: 'Quick Sort',
        emoji: '⚡',
        description: 'Divide and conquer using pivot element',
        complexity: 'O(n log n)',
        color: 'from-yellow-500 to-orange-500',
        status: 'waiting',
        steps: 0,
        comparisons: 0,
        swaps: 0,
        startTime: 0,
        finishTime: 0,
        winner: false
      },
      {
        name: 'Merge Sort',
        emoji: '🔀',
        description: 'Divides array and merges sorted halves',
        complexity: 'O(n log n)',
        color: 'from-red-500 to-pink-500',
        status: 'waiting',
        steps: 0,
        comparisons: 0,
        swaps: 0,
        startTime: 0,
        finishTime: 0,
        winner: false
      },
      {
        name: 'Cocktail Sort',
        emoji: '🍸',
        description: 'Bidirectional bubble sort variant',
        complexity: 'O(n²)',
        color: 'from-indigo-500 to-purple-500',
        status: 'waiting',
        steps: 0,
        comparisons: 0,
        swaps: 0,
        startTime: 0,
        finishTime: 0,
        winner: false
      }
    ];

    // Start with algorithms up to level (easy to hard)
    const availableAlgorithms = algorithmList.slice(0, Math.min(6, arraySize / 5 + 2));

    setAlgorithms(availableAlgorithms.map(alg => ({
      ...alg,
      currentArray: [...initialArray],
      highlightIndices: []
    })));
  }, [arraySize, customArray, useCustomArray]);

  // Sorting algorithm generators - yield { array, updates }
  function* bubbleSort(array: ArrayElement[]) {
    const arr = [...array];
    const n = arr.length;
    let swapped = true;
    let pass = 0;
    let steps = 0;
    let comparisons = 0;
    let swaps = 0;

    while (swapped) {
      swapped = false;
      const highlight = [];

      for (let i = 0; i < n - pass - 1; i++) {
        highlight.push(i, i + 1);
        steps++;
        if (arr[i].value > arr[i + 1].value) {
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
          swapped = true;
          swaps++;
          yield { array: arr.slice(), updates: { steps, comparisons, swaps, highlightIndices: [i, i + 1] } };
        } else {
          comparisons++;
          yield { array: arr.slice(), updates: { steps, comparisons, swaps, highlightIndices: [i, i + 1] } };
        }
      }
      pass++;
    }
    yield { array: arr.slice(), updates: { steps, comparisons, swaps, status: 'finished' as const } };
  }



  function* selectionSort(array: ArrayElement[]) {
    const arr = [...array];
    const n = arr.length;
    let steps = 0;
    let comparisons = 0;
    let swaps = 0;

    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;

      for (let j = i + 1; j < n; j++) {
        comparisons++;
        steps++;
        yield { array: arr.slice(), updates: { steps, comparisons, swaps, highlightIndices: [minIndex, j] } };

        if (arr[j].value < arr[minIndex].value) {
          minIndex = j;
        }
      }

      if (minIndex !== i) {
        steps++;
        yield { array: arr.slice(), updates: { steps, comparisons, swaps, highlightIndices: [i, minIndex] } };
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        swaps++;
      }
    }
    yield { array: arr.slice(), updates: { steps, comparisons, swaps, status: 'finished' as const } };
  }

  function* quickSort(array: ArrayElement[]) {
    const arr = [...array];
    let steps = 0;
    let comparisons = 0;
    let swaps = 0;

    function* quickSortHelper(low: number, high: number): Generator<{ array: ArrayElement[], updates: Partial<SortingAlgorithm> }> {
      if (low < high) {
        const pivotIndex = yield* partition(low, high);
        yield* quickSortHelper(low, pivotIndex - 1);
        yield* quickSortHelper(pivotIndex + 1, high);
      }
    }

    function* partition(low: number, high: number): Generator<{ array: ArrayElement[], updates: Partial<SortingAlgorithm> }, number> {
      const pivot = arr[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        comparisons++;
        steps++;
        yield { array: arr.slice(), updates: { steps, comparisons, swaps, highlightIndices: [j, high] } };

        if (arr[j].value < pivot.value) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swaps++;
        }
      }

      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      swaps++;
      steps++;
      yield { array: arr.slice(), updates: { steps, comparisons, swaps, highlightIndices: [] } };
      return i + 1;
    }

    yield* quickSortHelper(0, arr.length - 1);
    yield { array: arr.slice(), updates: { steps, comparisons, swaps, status: 'finished' as const } };
  }

  function* mergeSort(array: ArrayElement[]) {
    const arr = [...array];
    let steps = 0;
    let comparisons = 0;
    let swaps = 0;

    function* mergeSortHelper(low: number, high: number): Generator<{ array: ArrayElement[], updates: Partial<SortingAlgorithm> }> {
      if (low < high) {
        const mid = Math.floor((low + high) / 2);
        yield* mergeSortHelper(low, mid);
        yield* mergeSortHelper(mid + 1, high);
        yield* merge(low, mid, high);
      }
    }

    function* merge(low: number, mid: number, high: number): Generator<{ array: ArrayElement[], updates: Partial<SortingAlgorithm> }> {
      const leftSize = mid - low + 1;
      const rightSize = high - mid;

      const left = arr.slice(low, low + leftSize);
      const right = arr.slice(mid + 1, mid + 1 + rightSize);

      let i = 0, j = 0, k = low;

      while (i < leftSize && j < rightSize) {
        comparisons++;
        steps++;
        yield { array: arr.slice(), updates: { steps, comparisons, swaps, highlightIndices: [low + i, mid + 1 + j] } };

        if (left[i].value <= right[j].value) {
          arr[k] = left[i];
          i++;
        } else {
          arr[k] = right[j];
          j++;
        }

        swaps++;
        k++;
      }

      while (i < leftSize) {
        arr[k] = left[i];
        i++;
        k++;
        steps++;
        yield { array: arr.slice(), updates: { steps, comparisons, swaps, highlightIndices: [] } };
      }

      while (j < rightSize) {
        arr[k] = right[j];
        j++;
        k++;
        steps++;
        yield { array: arr.slice(), updates: { steps, comparisons, swaps, highlightIndices: [] } };
      }
    }

    yield* mergeSortHelper(0, arr.length - 1);
    yield { array: arr.slice(), updates: { steps, comparisons, swaps, status: 'finished' as const } };
  }

  function* cocktailSort(array: ArrayElement[]) {
    const arr = [...array];
    let swapped = true;
    let start = 0;
    let end = arr.length - 1;
    let steps = 0;
    let comparisons = 0;
    let swaps = 0;

    while (swapped) {
      swapped = false;

      // Forward pass
      for (let i = start; i < end; i++) {
        comparisons++;
        steps++;
        yield { array: arr.slice(), updates: { steps, comparisons, swaps, highlightIndices: [i, i + 1] } };

        if (arr[i].value > arr[i + 1].value) {
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
          swapped = true;
          swaps++;
        }
      }

      if (!swapped) break;
      swapped = false;
      end--;

      // Backward pass
      for (let i = end - 1; i >= start; i--) {
        comparisons++;
        steps++;
        yield { array: arr.slice(), updates: { steps, comparisons, swaps, highlightIndices: [i, i + 1] } };

        if (arr[i].value > arr[i + 1].value) {
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
          swapped = true;
          swaps++;
        }
      }
      start++;
    }
    yield { array: arr.slice(), updates: { steps, comparisons, swaps, status: 'finished' as const } };
  }

  const startRace = useCallback(() => {
    if (algorithms.length === 0) initializeAlgorithms();

    setIsRunning(true);
    setIsPaused(false);
    setIsComplete(false);
    setRaceStep(0);

    // Initialize racing algorithms
    setAlgorithms(prev => prev.map((alg) => {
      let generator: Generator<{array: ArrayElement[], updates: Partial<SortingAlgorithm>}>;

      switch (alg.name) {
        case 'Bubble Sort':
          generator = bubbleSort(alg.currentArray);
          break;
        case 'Selection Sort':
          generator = selectionSort(alg.currentArray);
          break;
        case 'Quick Sort':
          generator = quickSort(alg.currentArray);
          break;
        case 'Merge Sort':
          generator = mergeSort(alg.currentArray);
          break;
        case 'Cocktail Sort':
          generator = cocktailSort(alg.currentArray);
          break;
        default:
          generator = bubbleSort(alg.currentArray);
      }

      return {
        ...alg,
        status: 'running',
        startTime: Date.now(),
        steps: 0,
        comparisons: 0,
        swaps: 0,
        finishTime: 0,
        winner: false,
        generator
      } as SortingAlgorithm & { generator: Generator<{array: ArrayElement[], updates: Partial<SortingAlgorithm>}> };
    }));
  }, [algorithms.length, initializeAlgorithms]);

  useEffect(() => {
    if (!isRunning || isPaused || isComplete) return;

    const animate = () => {
      setRaceStep(prev => prev + 1);

      // Update each algorithm
      setAlgorithms(current => {
        let allFinished = true;

  const newAlgorithms = current.map((alg) => {
          if (alg.status === 'finished') return alg;

          allFinished = false;
          const extendedAlg = alg as SortingAlgorithm & { generator: Generator<{array: ArrayElement[], updates: Partial<SortingAlgorithm>}> };

          try {
            const result = extendedAlg.generator.next();

            if (result.done) {
              const finishTime = Date.now() - alg.startTime;

              return {
                ...alg,
                status: 'finished' as const,
                finishTime,
                currentArray: alg.currentArray,
                highlightIndices: []
              } as SortingAlgorithm;
            } else {
              const { array, updates } = result.value;
              const newStatus = updates.status === 'finished' ? 'finished' : 'running';
              return {
                ...alg,
                status: newStatus as 'waiting' | 'running' | 'finished',
                currentArray: array,
                highlightIndices: updates.highlightIndices || [],
                steps: updates.steps || 0,
                comparisons: updates.comparisons || 0,
                swaps: updates.swaps || 0
              };
            }
          } catch (error) {
            console.error(`Error in ${alg.name}:`, error);
            return {
              ...alg,
              status: 'finished' as const,
              finishTime: Date.now() - alg.startTime
            };
          }
        });

        if (allFinished) {
          setIsRunning(false);
          setIsComplete(true);

          // Find winner based on least total operations (steps + comparisons + swaps)
          const winnerIndex = newAlgorithms.reduce((winner, alg, index) => {
            if (alg.status !== 'finished') return winner;

            const totalOps = alg.steps + alg.comparisons + alg.swaps;
            if (winner === -1 || totalOps < newAlgorithms[winner].steps + newAlgorithms[winner].comparisons + newAlgorithms[winner].swaps) {
              return index;
            }
            return winner;
          }, -1);

          // Mark winner
          if (winnerIndex !== -1) {
            newAlgorithms[winnerIndex] = {
              ...newAlgorithms[winnerIndex],
              winner: true
            };
          }

          // Calculate score based on efficiency (lower operations = higher score)
          let totalScore = 0;
          newAlgorithms.forEach((alg) => {
            const totalOps = alg.steps + alg.comparisons + alg.swaps;
            const efficiency = Math.max(0, 1000 - totalOps);
            const winnerBonus = alg.winner ? 500 : 0;
            totalScore += Math.floor(efficiency + winnerBonus);
          });

          updateScore('algorithm-arena', totalScore);
        }

        return newAlgorithms;
      });

      if (isRunning && !isComplete) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, isPaused, isComplete, updateScore]);

  const resetRace = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);
    setRaceStep(0);
    initializeAlgorithms();
  }, [initializeAlgorithms]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  useEffect(() => {
    initializeAlgorithms();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initializeAlgorithms]);

  return (
    <div className="min-h-screen bg-cosmic-900 p-4 overflow-y-auto">
      <div className="container mx-auto max-w-7xl">
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
            Algorithm Arena
          </h1>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 px-3 py-2 bg-cosmic-700 hover:bg-cosmic-600 text-white rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center space-x-2 px-3 py-2 bg-cosmic-700 hover:bg-cosmic-600 text-white rounded-lg transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Race Info */}
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-cosmic-800 rounded-lg p-6"
          >
            <h2 className="text-xl font-bold text-purple-400 mb-4">Algorithm Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="text-yellow-400 font-bold mb-2">Sorting Algorithms</h3>
                {algorithms.map((alg, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex items-center mb-1">
                      <span className="mr-2">{alg.emoji}</span>
                      <span className="font-bold text-cosmic-200">{alg.name}</span>
                      <span className="ml-auto text-purple-400">{alg.complexity}</span>
                    </div>
                    <p className="text-cosmic-400 text-xs">{alg.description}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-green-400 font-bold mb-2">How to Play</h3>
                <ul className="text-cosmic-300 space-y-1 text-sm">
                  <li>• Select your own array to sort or use a random one</li>
                  <li>• Watch 6 sorting algorithms compete simultaneously</li>
                  <li>• Each bar represents an element in the array</li>
                  <li>• Highlighted bars show current comparisons/swaps</li>
                  <li>• Algorithm with least operations (steps) wins!</li>
                  <li>• Score based on algorithm efficiency metrics</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-cosmic-800 rounded-lg p-6"
          >
            <h2 className="text-xl font-bold text-purple-400 mb-4">Custom Array Setup</h2>

            {/* Array Generation Type */}
            <div className="mb-6">
              <label className="block text-cosmic-300 mb-3 text-sm font-semibold">Array Generation:</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!useCustomArray}
                    onChange={() => {
                      setUseCustomArray(false);
                      setTempArrayInput('');
                    }}
                    className="mr-2"
                    disabled={isRunning}
                  />
                  <span className="text-cosmic-300">Random Array</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={useCustomArray}
                    onChange={() => setUseCustomArray(true)}
                    className="mr-2"
                    disabled={isRunning}
                  />
                  <span className="text-cosmic-300">Custom Array</span>
                </label>
              </div>
            </div>

            {useCustomArray ? (
              <div className="mb-6">
                <label className="block text-cosmic-300 mb-2 text-sm font-semibold">
                  Enter your custom array (comma-separated numbers):
                </label>
                <textarea
                  value={tempArrayInput}
                  onChange={(e) => setTempArrayInput(e.target.value)}
                  placeholder="e.g., 64, 34, 25, 12, 22, 11, 90"
                  className="w-full bg-cosmic-900 border border-cosmic-600 rounded-lg p-3 text-white placeholder-cosmic-500 focus:border-purple-400 focus:outline-none resize-y min-h-[80px]"
                  disabled={isRunning}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-cosmic-400">
                    Format: numbers separated by commas (e.g., 10, 20, 5, 8)
                  </div>
                  <div className="text-xs text-cosmic-400">
                    Length: {tempArrayInput.split(',').filter(x => x.trim() !== '').length} numbers
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-cosmic-300 mb-3 text-sm font-semibold">Array Size:</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={arraySize}
                    onChange={(e) => setArraySize(Number(e.target.value))}
                    className="w-24"
                    disabled={isRunning}
                  />
                  <span className="text-white min-w-[3rem]">{arraySize}</span>
                </div>
                <div className="text-xs text-cosmic-400 mt-1">
                  Recommended: 5-15 elements for best visualization
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  if (useCustomArray) {
                    // Validate and apply custom array
                    const values = tempArrayInput
                      .split(',')
                      .map(s => s.trim())
                      .filter(s => s !== '')
                      .map(s => {
                        const num = parseInt(s);
                        return isNaN(num) ? null : num;
                      })
                      .filter(n => n !== null) as number[];

                    if (values.length < 2) {
                      alert('Please enter at least 2 numbers for sorting.');
                      return;
                    }

                    if (values.length > 50) {
                      alert('Please limit to 50 numbers maximum.');
                      return;
                    }

                    setCustomArray(values);
                    setArraySize(values.length);
                  }
                  resetRace();
                  setShowSettings(false);
                }}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
                disabled={isRunning}
              >
                {useCustomArray ? 'Use Custom Array' : 'Generate Random Array'}
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="bg-cosmic-600 hover:bg-cosmic-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

            {/* Current Array Preview */}
            {(customArray.length > 0 || !useCustomArray) && (
              <div className="mt-4 border-t border-cosmic-600 pt-4">
                <h3 className="text-cosmic-300 text-sm mb-2">Current Array Preview:</h3>
                <div className="flex flex-wrap gap-2">
                  {(useCustomArray ? customArray : Array.from({ length: arraySize }, (_, i) => i + 1)).map((num, index) => (
                    <span
                      key={index}
                      className="bg-cosmic-700 text-cosmic-200 px-3 py-1 rounded text-sm font-mono"
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Control Panel */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {!isComplete && (
            <>
              <button
                onClick={startRace}
                disabled={isRunning}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-bold"
              >
                <Play className="w-5 h-5" />
                <span>Start Race</span>
              </button>
              <button
                onClick={togglePause}
                disabled={!isRunning}
                className="flex items-center space-x-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-bold"
              >
                <Pause className="w-5 h-5" />
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
            </>
          )}
          <button
            onClick={resetRace}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-bold"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset Race</span>
          </button>
        </div>

        {/* Race Progress */}
        {(isRunning || isComplete) && (
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              Race Progress: Step {raceStep}
            </div>
            {isComplete && algorithms[algorithms.findIndex(a => a.winner)] && (
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <span className="text-xl font-bold text-yellow-400">
                  Winner: {algorithms[algorithms.findIndex(a => a.winner)].name} {algorithms[algorithms.findIndex(a => a.winner)].emoji}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Algorithm Race Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {algorithms.map((alg, algIndex) => {
            const maxValue = Math.max(...alg.currentArray.map(el => el.value));
            const barWidth = 100 / arraySize;

            return (
              <motion.div
                key={algIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: algIndex * 0.1 }}
                className={`bg-cosmic-800 rounded-lg p-4 border-2 ${alg.winner ? 'border-yellow-400' : 'border-cosmic-700'} transition-colors`}
              >
                {/* Algorithm Header */}
                <div className={`flex items-center justify-between mb-4 p-2 rounded ${alg.winner ? 'bg-yellow-400/20' : 'bg-cosmic-700'}`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{alg.emoji}</span>
                    <div>
                      <h3 className="font-bold text-white">{alg.name}</h3>
                      <p className={`text-xs ${alg.status === 'finished' ? 'text-green-400' : alg.status === 'running' ? 'text-blue-400' : 'text-gray-400'}`}>
                        {alg.status === 'finished' ? `Finished in ${alg.finishTime}ms` : alg.status === 'running' ? 'Running...' : 'Waiting'}
                      </p>
                    </div>
                  </div>
                  {alg.winner && (
                    <Trophy className="w-6 h-6 text-yellow-400" />
                  )}
                </div>

                {/* Visualization Area */}
                <div className="bg-cosmic-900 rounded p-3 mb-4" style={{ height: '200px' }}>
                  <div className="flex items-end justify-center h-full space-x-1">
                    {alg.currentArray.map((element, elementIndex) => {
                      const isHighlighted = alg.highlightIndices.includes(elementIndex);
                      return (
                        <motion.div
                          key={element.id}
                          className={`rounded-t ${isHighlighted ? 'bg-yellow-400/70' : `bg-gradient-to-t ${element.color}`}`}
                          style={{
                            width: `${barWidth}%`,
                            height: `${(element.value / maxValue) * 100}%`,
                            minWidth: '2px'
                          }}
                          animate={{
                            backgroundColor: isHighlighted ? 'rgba(250, 204, 21, 0.7)' : undefined
                          }}
                          transition={{ duration: 0.1 }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-blue-400">Steps</div>
                    <div className="font-bold text-white">{alg.steps}</div>
                  </div>
                  <div>
                    <div className="text-green-400">Comparisons</div>
                    <div className="font-bold text-white">{alg.comparisons}</div>
                  </div>
                  <div>
                    <div className="text-red-400">Swaps</div>
                    <div className="font-bold text-white">{alg.swaps}</div>
                  </div>
                  <div>
                    <div className="text-purple-400">Complexity</div>
                    <div className="font-bold text-white">{alg.complexity}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Race Complete Message */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cosmic-800 rounded-lg p-8 text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-purple-400 mb-4">Race Complete!</h2>
            <div className="mb-6">
              {algorithms
                .filter(alg => alg.status === 'finished')
                .sort((a, b) => (a.steps + a.comparisons + a.swaps) - (b.steps + b.comparisons + b.swaps))
                .map((alg, placement) => (
                  <div key={placement} className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">#{placement + 1}</span>
                      <span className="text-xl">{alg.emoji}</span>
                      <span className="font-bold text-white">{alg.name}</span>
                    </div>
                    <div className="text-cosmic-300 text-sm">
                      {alg.steps + alg.comparisons + alg.swaps} total operations
                    </div>
                  </div>
                ))}
            </div>
            <button
              onClick={resetRace}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors font-bold"
            >
              Race Again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AlgorithmArena;
