import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Eye, Bug, CheckCircle, XCircle, Telescope } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface Bug {
  id: number;
  type: 'syntax' | 'logic' | 'performance' | 'typo' | 'missing_import' | 'infinite_loop' | 'wrong_operator';
  description: string;
  hint: string;
}

interface AlienCode {
  id: number;
  language: string;
  code: string;
  bugs: Bug[];
  difficulty: number;
  timeLimit: number;
}

const DebugDetective: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [currentCode, setCurrentCode] = useState<AlienCode | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [foundBugs, setFoundBugs] = useState<Set<number>>(new Set());
  const [selectedBug, setSelectedBug] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introPhase, setIntroPhase] = useState(0);

  // Alien code templates with intentionally-placed bugs
  const alienCodeTemplates: AlienCode[] = [
    {
      id: 1,
      language: 'Zorg-BASIC',
      code: `FUNCTION CALCULATE_ENERGY(X, Y)
    POWER = X * Y + 2
    IF X > 10 THEN
        POWER = POWER * 2  -- Missing ELSE
  END FUNCTION`,
      bugs: [
        {
          id: 1,
          type: 'logic',
          description: 'Missing ELSE clause causes incorrect calculation when X <= 10',
          hint: 'What happens when the condition is false?'
        }
      ],
      difficulty: 1,
      timeLimit: 60
    },
    {
      id: 2,
      language: 'NebulaScript',
      code: `PROCEDURE STAR_ALIGN(TARGET[])
    FOR I = 1 TO LENGTH(TARGET)
        IF TARGET[I] == "QUASAR" THEN
            RETURN FALSE
        ENDIF
    NEXT I
    RETURN TRUE  -- Logic error: should return false if no quasar found?
END PROCEDURE`,
      bugs: [
        {
          id: 2,
          type: 'logic',
          description: 'Function returns wrong value - should return false if target is NOT aligned',
          hint: 'Check what should be returned to indicate proper alignment'
        }
      ],
      difficulty: 2,
      timeLimit: 70
    },
    {
      id: 3,
      language: 'Cosmic++',
      code: `CLASS SHIP_CONTROL {
    PRIVATE ENERGY_LEVEL = 100
    
    METHOD FIRE_LASER()
        IF ENERGY_LEVEL > 10 THEN  -- Wrong operator
            ENERGY_LEVEL = ENERGY_LEVEL - 10
            RETURN "FIRE_SUCCESS"
        ELSE
            RETURN "INSUFFICIENT_ENERGY"
        END IF
    END METHOD
}`,
      bugs: [
        {
          id: 3,
          type: 'logic',
          description: 'Energy check uses wrong comparison operator',
          hint: 'Should lasers fire when energy is greater than OR equal to 10?'
        }
      ],
      difficulty: 1,
      timeLimit: 65
    },
    {
      id: 4,
      language: 'QuantumASM',
      code: `START PROGRAM TELEPORT
LOAD QUANTUM_STATE = "COHERENT"
FOR ATOM IN PARTICLE_STREAM
    IF ATOM.POSITION.UNCERTAIN THEN
        PERFORM QUANTUM_ENTANGLEMENT(ATOM)
    END IF
NEXT ATOM  -- Infinite loop potential
JUMP TO START
END PROGRAM`,
      bugs: [
        {
          id: 4,
          type: 'infinite_loop',
          description: 'JUMP TO START creates infinite loop, no exit condition',
          hint: 'Where should this program actually end?'
        }
      ],
      difficulty: 3,
      timeLimit: 75
    },
    {
      id: 5,
      language: 'OrganicCode',
      code: `BIO_FUNCTION GROW_PLANT(NUTRIENTS, SUNLIGHT)
    PLANT_HEIGHT = 0
    WHILE NUTRIENTS > 0:
        PLANT_HEIGHT = PLANT_HEIGHT + 5
        NUTRIENTS = NUTRIENTS -1
    END WHILE  -- Missing sunlight check
    RETURN PLANT_HEIGHT
END BIO_FUNCTION`,
      bugs: [
        {
          id: 5,
          type: 'logic',
          description: 'Growth only checks nutrients, ignoring sunlight requirement',
          hint: 'What else do plants need besides nutrients?'
        }
      ],
      difficulty: 2,
      timeLimit: 70
    },
    {
      id: 6,
      language: 'PlasmaScript',
      code: `IMPORT REACT_COMPONENT
IMPORT EVENT_HANDLER  -- Missing import

PROCEDURE GAME_BUTTON(ON_CLICK)
    RENDER (
        <plasma-button onClick={CLICK_HANDLER}>  // Wrong handler name
            "ENGAGE PLASMAS"
        </plasma-button>
    )
END PROCEDURE`,
      bugs: [
        {
          id: 6,
          type: 'missing_import',
          description: 'Event handler not imported but used in component',
          hint: 'What module provides the event handling?'
        },
        {
          id: 7,
          type: 'typo',
          description: 'Click handler variable name is incorrect',
          hint: 'ON_CLICK parameter vs actual usage'
        }
      ],
      difficulty: 2,
      timeLimit: 80
    }
  ];

  const generateLevelCode = useCallback(() => {
    const availableCodes = alienCodeTemplates.filter(code => code.difficulty <= Math.ceil(level / 2));
    const randomCode = availableCodes[Math.floor(Math.random() * availableCodes.length)];
    setCurrentCode(randomCode);
    setFoundBugs(new Set());
    setTimeLeft(randomCode.timeLimit);
    setShowHint(false);
    setSelectedBug(null);
    setShowFeedback(false);
  }, [level]);

  useEffect(() => {
    generateLevelCode();
  }, [generateLevelCode]);

  const startGame = () => {
    setIsRunning(true);
    setIsPaused(false);
    setGameOver(false);
    generateLevelCode();
  };

  const pauseResume = () => {
    setIsPaused(!isPaused);
  };

  const resetGame = () => {
    setIsRunning(false);
    setIsPaused(false);
    setScore(0);
    setTimeLeft(120);
    setLevel(1);
    setLives(3);
    setGameOver(false);
    setFoundBugs(new Set());
    generateLevelCode();
  };

  useEffect(() => {
    if (!isRunning || isPaused || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setLives(lives => lives - 1);
          if (lives <= 1) {
            setGameOver(true);
            setIsRunning(false);
            updateScore('debug-detective', score);
          } else {
            generateLevelCode();
          }
          return currentCode?.timeLimit || 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isPaused, gameOver, lives, score, generateLevelCode, updateScore, currentCode]);

  const checkBugType = (bugType: string) => {
    if (!currentCode) return;

    // Find all bugs of this type in the current code
    const bugsOfType = currentCode.bugs.filter(bug => bug.type === bugType);
    const isCorrectType = bugsOfType.length > 0;

    setFeedbackCorrect(isCorrectType);
    setShowFeedback(true);

    if (isCorrectType) {
      // Mark all bugs of this type as found
      const newFoundBugs = new Set(foundBugs);
      bugsOfType.forEach(bug => {
        if (!foundBugs.has(bug.id)) {
          newFoundBugs.add(bug.id);
        }
      });
      setFoundBugs(newFoundBugs);

      const basePoints = 100 * bugsOfType.length * currentCode.difficulty;
      const timeBonus = Math.floor(timeLeft / 10) * 10;
      const hintPenalty = showHint ? 30 : 0;
      const points = basePoints + timeBonus - hintPenalty;

      setScore(prev => prev + points);

      // Check if a specific bug is being highlighted (for visual feedback)
      if (bugsOfType.length > 0) {
        setSelectedBug(bugsOfType[0].id);
      }

      // Level up if all bugs found
      if (newFoundBugs.size === currentCode.bugs.length) {
        setTimeout(() => {
          setLevel(prev => prev + 1);
        }, 2000);
      }
    } else {
      // Wrong guess penalty
      setLives(prev => Math.max(0, prev - 1));
      if (lives <= 1) {
        setGameOver(true);
        setIsRunning(false);
        updateScore('debug-detective', score);
      }
    }
  };

  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(false);
        setSelectedBug(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showFeedback]);

  const getCodeWithHighlights = (code: string, foundBugs: Set<number>) => {
    if (!currentCode) return code;

    let highlightedCode = code;

    // Highlight found bugs in green
    currentCode.bugs.forEach(bug => {
      if (foundBugs.has(bug.id)) {
        // Find lines that contain bug indicators and highlight them
        const lines = highlightedCode.split('\n');
        lines.forEach((line, index) => {
          // Highlight lines with bug indicators (comments or specific text)
          if (line.includes('--') || line.includes('//') ||
              line.includes('Logic error') || line.includes('Wrong operator') ||
              line.includes('Infinite loop') || line.includes('Missing import') ||
              line.includes('Typo') || line.includes('Missing ELSE')) {
            const commentMatch = line.match(/(.*)(--|\/\/|Logic error|Wrong operator|Infinite loop|Missing import|Typo|Missing ELSE)(.*)$/);
            if (commentMatch) {
              lines[index] = `${commentMatch[1]}<span class="text-green-400 font-bold">${commentMatch[2]}${commentMatch[3]}</span>`;
            } else {
              // Fallback - highlight the entire line
              lines[index] = `<span class="text-green-400 font-bold">${line}</span>`;
            }
          }
        });
        highlightedCode = lines.join('\n');
      }
    });

    // Wrap each line for highlighting
    return highlightedCode.split('\n').map((line, index) => (
      <div key={index} className="font-mono text-sm leading-relaxed">
        <span className="text-cosmic-400 mr-4 inline-block w-8 text-right">{index + 1}</span>
        <span dangerouslySetInnerHTML={{ __html: line.replace(/<span/g, `<span class="${selectedBug === currentCode.bugs.find(() => line.includes('-- ') || line.includes('// '))?.id ? 'bg-yellow-400/20' : ''}"`) }} />
      </div>
    ));
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
            Debug Detective
          </h1>

          <div className="flex space-x-2">
            {!isRunning && !gameOver && (
              <button
                onClick={startGame}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Start Hunt</span>
              </button>
            )}

            {isRunning && (
              <button
                onClick={pauseResume}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
            )}

            <button
              onClick={resetGame}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-cosmic-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{score}</div>
            <div className="text-xs text-cosmic-400">Score</div>
          </div>
          <div className="bg-cosmic-800 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${timeLeft <= 30 ? 'text-red-400' : 'text-orange-400'}`}>
              {timeLeft}s
            </div>
            <div className="text-xs text-cosmic-400">Time Left</div>
          </div>
          <div className="bg-cosmic-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{level}</div>
            <div className="text-xs text-cosmic-400">Level</div>
          </div>
          <div className="bg-cosmic-800 rounded-lg p-4 text-center">
            <div className="flex justify-center space-x-1">
              {Array.from({length: 3}).map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-red-400' : 'bg-cosmic-600'}`} />
              ))}
            </div>
            <div className="text-xs text-cosmic-400">Lives</div>
          </div>
          <div className="bg-cosmic-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {currentCode ? foundBugs.size : 0}/{currentCode?.bugs.length || 0}
            </div>
            <div className="text-xs text-cosmic-400">Bugs Found</div>
          </div>
        </div>

        {(!isRunning && !gameOver) && (
          <div className="text-center text-cosmic-300 mb-8">
            <div className="mb-4">
              <Telescope className="w-16 h-16 mx-auto text-purple-400 mb-4" />
              <h2 className="text-2xl font-bold text-purple-400 mb-2">Galactic Bug Hunt</h2>
              <p className="text-lg text-cosmic-400">
                Scan alien code bases for hidden bugs before they crash the space station!
              </p>
            </div>
          </div>
        )}

        {/* Game Area */}
        {currentCode && isRunning && !gameOver && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Code Display */}
            <div className="bg-cosmic-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-cosmic-200">
                  {currentCode.language} Code
                </h3>
                <div className="flex items-center space-x-2">
                  {showHint && (
                    <button
                      onClick={() => setShowHint(false)}
                      className="flex items-center space-x-1 px-3 py-1 bg-cosmic-600 hover:bg-cosmic-500 text-white rounded text-sm"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-cosmic-900 rounded-lg p-4 font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
                {showHint ? (
                  <div className="text-yellow-400 p-2 bg-yellow-400/10 rounded border border-yellow-400/30 mb-4">
                    <strong>🔍 Hint:</strong> {currentCode.bugs[Math.floor(Math.random() * currentCode.bugs.length)].hint}
                  </div>
                ) : null}
                {getCodeWithHighlights(currentCode.code, foundBugs)}
              </div>
            </div>

            {/* Bug Database */}
            <div className="bg-cosmic-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-cosmic-200 mb-4 flex items-center">
                <Bug className="w-5 h-5 text-red-400 mr-2" />
                Bug Database
              </h3>

              <div className="space-y-3">
                {[
                  { type: 'syntax', emoji: '⚠️', name: 'Syntax Error', description: 'Basic syntax issues' },
                  { type: 'logic', emoji: '🧠', name: 'Logic Error', description: 'Wrong programming logic' },
                  { type: 'performance', emoji: '🚀', name: 'Performance Issue', description: 'Inefficient code patterns' },
                  { type: 'typo', emoji: '🔤', name: 'Typo', description: 'Spelling errors in code' },
                  { type: 'missing_import', emoji: '📦', name: 'Missing Import', description: 'Required modules not imported' },
                  { type: 'infinite_loop', emoji: '🔄', name: 'Infinite Loop', description: 'Code that never terminates' },
                  { type: 'wrong_operator', emoji: '⚖️', name: 'Wrong Operator', description: 'Incorrect operators used' }
                ].map((bugType) => (
                  <button
                    key={bugType.type}
                    onClick={() => checkBugType(bugType.type)}
                    disabled={isPaused}
                    className="w-full p-3 bg-cosmic-700 hover:bg-cosmic-600 disabled:bg-gray-600 text-left rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{bugType.emoji}</span>
                      <div>
                        <div className="font-bold text-white">{bugType.name}</div>
                        <div className="text-sm text-cosmic-400">{bugType.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {showHint === false && (
                <button
                  onClick={() => setShowHint(true)}
                  className="w-full mt-4 py-2 bg-cosmic-600 hover:bg-cosmic-500 text-white rounded-lg transition-colors flex items-center justify-center"
                  disabled={isPaused}
                >
                  <Telescope className="w-4 h-4 mr-2" />
                  Use Scanner (Penalty: 30pts)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Feedback Animation */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.5 }}
                className={`bg-cosmic-800 rounded-lg p-6 text-center border-2 ${feedbackCorrect ? 'border-green-400' : 'border-red-400'}`}
              >
                <div className={`text-6xl mb-4 ${feedbackCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {feedbackCorrect ? <CheckCircle className="w-16 h-16" /> : <XCircle className="w-16 h-16" />}
                </div>
                <div className={`text-xl font-bold ${feedbackCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {feedbackCorrect ? 'Bug Found!' : 'Wrong Identification!'}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cosmic-800 rounded-lg p-8 text-center max-w-lg mx-auto"
          >
            <div className="text-6xl mb-4">
              {lives <= 0 ? '💥' : '🎉'}
            </div>
            <h2 className="text-2xl font-bold text-purple-400 mb-4">
              {lives <= 0 ? 'Space Station Lost!' : 'Galactic Hero!'}
            </h2>
              <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-yellow-400">{score.toLocaleString()}</div>
                  <div className="text-sm text-cosmic-400">Final Score</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">{level}</div>
                  <div className="text-sm text-cosmic-400">Max Level</div>
                </div>
              </div>
            <div className="space-x-2">
              <button
                onClick={resetGame}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Hunt Again
              </button>
              <button
                onClick={() => setCurrentGame(null)}
                className="bg-cosmic-600 hover:bg-cosmic-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Back to Games
              </button>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        {!isRunning && !gameOver && (
          <div className="text-center text-cosmic-400">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-cosmic-800 rounded-lg p-6">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-bold text-purple-400 mb-2">Scan Code</h3>
                <p className="text-sm">
                  Examine alien programming languages for hidden bugs. Each level brings more complex code from distant planets.
                </p>
              </div>
              <div className="bg-cosmic-800 rounded-lg p-6">
                <div className="text-4xl mb-3">🐛</div>
                <h3 className="text-lg font-bold text-red-400 mb-2">Identify Bugs</h3>
                <p className="text-sm">
                  Click on the correct bug type from our database. Wrong identifications cost lives!
                </p>
              </div>
              <div className="bg-cosmic-800 rounded-lg p-6">
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2">Earn Points</h3>
                <p className="text-sm">
                  Score points based on difficulty, time remaining, and accuracy. Hints reduce your score!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugDetective;
