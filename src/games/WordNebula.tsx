import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Lightbulb, Star } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface WordPuzzle {
  word: string;
  scrambled: string;
  hint: string;
  category: string;
}

const wordPuzzles: WordPuzzle[] = [
  // Beginner Space Objects
  { word: 'STAR', scrambled: 'RATS', hint: 'A bright ball of gas that shines', category: 'Space Objects' },
  { word: 'MOON', scrambled: 'NOOM', hint: 'Earth\'s natural satellite', category: 'Space Objects' },
  { word: 'SUN', scrambled: 'NUS', hint: 'Our closest star', category: 'Space Objects' },
  { word: 'MARS', scrambled: 'SRAM', hint: 'The red planet', category: 'Planets' },
  { word: 'EARTH', scrambled: 'HTRAE', hint: 'Our home planet', category: 'Planets' },
  
  // Planets & Moons
  { word: 'VENUS', scrambled: 'SUNEV', hint: 'The hottest planet', category: 'Planets' },
  { word: 'JUPITER', scrambled: 'RETIPUJ', hint: 'The largest planet', category: 'Planets' },
  { word: 'SATURN', scrambled: 'NRUTAS', hint: 'The ringed planet', category: 'Planets' },
  { word: 'MERCURY', scrambled: 'YRUCREM', hint: 'Closest planet to the sun', category: 'Planets' },
  { word: 'NEPTUNE', scrambled: 'ENUTPEN', hint: 'The windiest planet', category: 'Planets' },
  { word: 'URANUS', scrambled: 'SUNARU', hint: 'The tilted ice giant', category: 'Planets' },
  { word: 'PLUTO', scrambled: 'OTULP', hint: 'Former ninth planet', category: 'Planets' },
  { word: 'EUROPA', scrambled: 'APORUE', hint: 'Jupiter\'s icy moon', category: 'Moons' },
  { word: 'TITAN', scrambled: 'NATIT', hint: 'Saturn\'s largest moon', category: 'Moons' },
  { word: 'GANYMEDE', scrambled: 'EDEMYNAG', hint: 'Largest moon in solar system', category: 'Moons' },
  
  // Space Phenomena
  { word: 'GALAXY', scrambled: 'YXALAG', hint: 'A collection of stars and planets', category: 'Space Phenomena' },
  { word: 'NEBULA', scrambled: 'ABULEN', hint: 'A cloud of gas and dust in space', category: 'Space Phenomena' },
  { word: 'COMET', scrambled: 'TEMOC', hint: 'An icy body with a tail', category: 'Space Phenomena' },
  { word: 'ASTEROID', scrambled: 'DIORETSA', hint: 'A rocky object orbiting the sun', category: 'Space Phenomena' },
  { word: 'SUPERNOVA', scrambled: 'AVONREPUS', hint: 'An exploding star', category: 'Space Phenomena' },
  { word: 'QUASAR', scrambled: 'RASAUQ', hint: 'A bright galactic nucleus', category: 'Space Phenomena' },
  { word: 'PULSAR', scrambled: 'RASLUP', hint: 'A rotating neutron star', category: 'Space Phenomena' },
  { word: 'COSMOS', scrambled: 'SMOCOS', hint: 'The universe as a whole', category: 'Universe' },
  { word: 'ORBIT', scrambled: 'TIBOR', hint: 'The path of a celestial body', category: 'Space Physics' },
  { word: 'METEOR', scrambled: 'ROETEM', hint: 'A shooting star', category: 'Space Phenomena' },
  { word: 'ECLIPSE', scrambled: 'ESPILCE', hint: 'When one celestial body blocks another', category: 'Space Phenomena' },
  { word: 'AURORA', scrambled: 'ARUORA', hint: 'Northern or southern lights', category: 'Space Phenomena' },
  { word: 'BLACKHOLE', scrambled: 'ELOKHCALB', hint: 'A region where nothing can escape', category: 'Space Phenomena' },
  { word: 'WORMHOLE', scrambled: 'ELOHOMRW', hint: 'Theoretical tunnel through spacetime', category: 'Space Phenomena' },
  { word: 'MAGNETAR', scrambled: 'RATENGAM', hint: 'A highly magnetic neutron star', category: 'Space Phenomena' },
  
  // Constellations & Astrology
  { word: 'ORION', scrambled: 'NOIRO', hint: 'The hunter constellation', category: 'Constellations' },
  { word: 'URSA', scrambled: 'ARSU', hint: 'Bear constellation family', category: 'Constellations' },
  { word: 'DRACO', scrambled: 'ORCAD', hint: 'The dragon constellation', category: 'Constellations' },
  { word: 'VEGA', scrambled: 'AGEV', hint: 'Brightest star in Lyra', category: 'Stars' },
  { word: 'SIRIUS', scrambled: 'SUIRIS', hint: 'The brightest star in night sky', category: 'Stars' },
  { word: 'POLARIS', scrambled: 'SIRLAOP', hint: 'The North Star', category: 'Stars' },
  { word: 'BETELGEUSE', scrambled: 'ESUEGLETEB', hint: 'Red giant star in Orion', category: 'Stars' },
  { word: 'RIGEL', scrambled: 'LEGIR', hint: 'Blue supergiant in Orion', category: 'Stars' },
  { word: 'ARIES', scrambled: 'SEIRA', hint: 'The ram zodiac sign', category: 'Zodiac' },
  { word: 'TAURUS', scrambled: 'SUARAT', hint: 'The bull zodiac sign', category: 'Zodiac' },
  { word: 'GEMINI', scrambled: 'INIMEG', hint: 'The twins zodiac sign', category: 'Zodiac' },
  { word: 'CANCER', scrambled: 'RECNAC', hint: 'The crab zodiac sign', category: 'Zodiac' },
  { word: 'LEO', scrambled: 'OEL', hint: 'The lion zodiac sign', category: 'Zodiac' },
  { word: 'VIRGO', scrambled: 'OGRIV', hint: 'The maiden zodiac sign', category: 'Zodiac' },
  { word: 'LIBRA', scrambled: 'ARBIL', hint: 'The scales zodiac sign', category: 'Zodiac' },
  { word: 'SCORPIO', scrambled: 'OIPROCS', hint: 'The scorpion zodiac sign', category: 'Zodiac' },
  { word: 'SAGITTARIUS', scrambled: 'SUIRATTIAGGS', hint: 'The archer zodiac sign', category: 'Zodiac' },
  { word: 'CAPRICORN', scrambled: 'NROCIRPAC', hint: 'The goat zodiac sign', category: 'Zodiac' },
  { word: 'AQUARIUS', scrambled: 'SUIRAUQA', hint: 'The water bearer zodiac sign', category: 'Zodiac' },
  { word: 'PISCES', scrambled: 'SECSIP', hint: 'The fish zodiac sign', category: 'Zodiac' },
  
  // Space Technology & Exploration
  { word: 'ROCKET', scrambled: 'TEKCOR', hint: 'Vehicle that launches into space', category: 'Space Tech' },
  { word: 'SATELLITE', scrambled: 'ETILLETAS', hint: 'Object orbiting a larger body', category: 'Space Tech' },
  { word: 'SHUTTLE', scrambled: 'ELTTUH', hint: 'Reusable spacecraft', category: 'Space Tech' },
  { word: 'STATION', scrambled: 'NOITATS', hint: 'Permanent space laboratory', category: 'Space Tech' },
  { word: 'TELESCOPE', scrambled: 'EPOCSETEL', hint: 'Device for observing distant objects', category: 'Space Tech' },
  { word: 'HUBBLE', scrambled: 'ELBUBH', hint: 'Famous space telescope', category: 'Space Tech' },
  { word: 'VOYAGER', scrambled: 'REGAYOV', hint: 'Deep space exploration probe', category: 'Space Tech' },
  { word: 'APOLLO', scrambled: 'OOLPPA', hint: 'Moon landing mission program', category: 'Space History' },
  { word: 'ASTRONAUT', scrambled: 'TUANORTSA', hint: 'Space traveler', category: 'Space Exploration' },
  { word: 'COSMONAUT', scrambled: 'TUANOMSOC', hint: 'Russian space traveler', category: 'Space Exploration' },
  { word: 'SPACEWALK', scrambled: 'KLAWECAPS', hint: 'Activity outside a spacecraft', category: 'Space Exploration' },
  
  // Universe & Physics
  { word: 'UNIVERSE', scrambled: 'ESREVINU', hint: 'Everything that exists', category: 'Universe' },
  { word: 'INFINITY', scrambled: 'YTINIFNI', hint: 'Endless extent of space', category: 'Universe' },
  { word: 'DIMENSION', scrambled: 'NOISNEMI', hint: 'Aspect of space or spacetime', category: 'Physics' },
  { word: 'GRAVITY', scrambled: 'YTIVARG', hint: 'Force that attracts objects', category: 'Physics' },
  { word: 'RELATIVITY', scrambled: 'YTIVITALER', hint: 'Einstein\'s theory of spacetime', category: 'Physics' },
  { word: 'PHOTON', scrambled: 'NOTOHP', hint: 'Particle of light', category: 'Physics' },
  { word: 'QUANTUM', scrambled: 'MUTNAUQ', hint: 'Smallest unit of energy', category: 'Physics' },
  { word: 'ANTIMATTER', scrambled: 'RETTAMITNA', hint: 'Opposite of regular matter', category: 'Physics' },
  { word: 'SPACETIME', scrambled: 'EMITECAPS', hint: 'Four-dimensional continuum', category: 'Physics' },
  { word: 'MULTIVERSE', scrambled: 'ESREVITLUM', hint: 'Multiple universes theory', category: 'Universe' },
  { word: 'EXPANSION', scrambled: 'NOISNAPXE', hint: 'Universe is getting bigger', category: 'Universe' },
  { word: 'REDSHIFT', scrambled: 'TFIHSDER', hint: 'Light stretching as objects move away', category: 'Physics' },
  
  // Advanced Space Phenomena
  { word: 'EXOPLANET', scrambled: 'TENALPOEX', hint: 'Planet outside our solar system', category: 'Space Phenomena' },
  { word: 'SUPERMASSIVE', scrambled: 'EVISSAM REPUS', hint: 'Extremely large black holes', category: 'Space Phenomena' },
  { word: 'INTERSTELLAR', scrambled: 'RALLETSRETNI', hint: 'Between the stars', category: 'Space Physics' },
  { word: 'INTERGALACTIC', scrambled: 'CITCALAGRETNI', hint: 'Between galaxies', category: 'Space Physics' },
  { word: 'LIGHTYEAR', scrambled: 'RAEYTH GIL', hint: 'Distance light travels in a year', category: 'Space Physics' },
  { word: 'PARSEC', scrambled: 'CESRAP', hint: 'Unit of astronomical distance', category: 'Space Physics' },
  { word: 'STELLAR', scrambled: 'RALLETS', hint: 'Related to stars', category: 'Space Physics' },
  { word: 'GALACTIC', scrambled: 'CITCA LAG', hint: 'Related to galaxies', category: 'Space Physics' },
  { word: 'COSMIC', scrambled: 'CIMSOC', hint: 'Related to the cosmos', category: 'Universe' },
  { word: 'CELESTIAL', scrambled: 'LAITSELEC', hint: 'Related to heavenly bodies', category: 'Space Physics' },
  
  // Space Mythology & Culture
  { word: 'APOLLO', scrambled: 'OLLOPA', hint: 'Greek god of the sun', category: 'Mythology' },
  { word: 'ARTEMIS', scrambled: 'SIMETRA', hint: 'Greek goddess of the moon', category: 'Mythology' },
  { word: 'HELIOS', scrambled: 'SOILEH', hint: 'Greek personification of the sun', category: 'Mythology' },
  { word: 'SELENE', scrambled: 'ENELES', hint: 'Greek personification of the moon', category: 'Mythology' },
  { word: 'ANDROMEDA', scrambled: 'ADEMORDNA', hint: 'Nearest major galaxy', category: 'Galaxies' },
  { word: 'MILKYWAY', scrambled: 'YAWYKLIM', hint: 'Our home galaxy', category: 'Galaxies' },
  
  // Challenging Space Terms
  { word: 'PARALLAX', scrambled: 'XALLARAP', hint: 'Apparent shift in star position', category: 'Space Physics' },
  { word: 'PERIHELION', scrambled: 'NOILEH REP', hint: 'Closest point to the sun in orbit', category: 'Space Physics' },
  { word: 'APHELION', scrambled: 'NOILEH PA', hint: 'Farthest point from sun in orbit', category: 'Space Physics' },
  { word: 'SYZYGY', scrambled: 'YGYZYS', hint: 'Alignment of celestial bodies', category: 'Space Phenomena' },
  { word: 'OCCULTATION', scrambled: 'NOITATLU CCO', hint: 'One object hiding another', category: 'Space Phenomena' },
  { word: 'PRECESSION', scrambled: 'NOISSER ECP', hint: 'Wobbling of Earth\'s axis', category: 'Space Physics' },
  { word: 'RETROGRADE', scrambled: 'EDARGORT ER', hint: 'Backward orbital motion', category: 'Space Physics' },
  { word: 'TIDALLOCKING', scrambled: 'GNIKCOLLADIT', hint: 'Same face always toward planet', category: 'Space Physics' },
];

const WordNebula: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameComplete, setGameComplete] = useState(false);

  const puzzle = wordPuzzles[currentPuzzle];

  useEffect(() => {
    if (timeLeft > 0 && !gameComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      updateScore('word-nebula', score);
    }
  }, [timeLeft, gameComplete, score, updateScore]);

  const checkAnswer = () => {
    if (userInput.toUpperCase() === puzzle.word) {
      setIsCorrect(true);
      const points = showHint ? 5 : 10;
      setScore(prev => prev + points);
      
      setTimeout(() => {
        if (currentPuzzle < wordPuzzles.length - 1) {
          nextPuzzle();
        } else {
          setGameComplete(true);
          updateScore('word-nebula', score + points);
        }
      }, 1500);
    }
  };

  const nextPuzzle = () => {
    setCurrentPuzzle(prev => prev + 1);
    setUserInput('');
    setIsCorrect(false);
    setShowHint(false);
    setTimeLeft(45);
  };

  const resetGame = () => {
    setCurrentPuzzle(0);
    setUserInput('');
    setIsCorrect(false);
    setShowHint(false);
    setScore(0);
    setTimeLeft(45);
    setGameComplete(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value.toUpperCase());
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
            Word Nebula
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
        <div className="flex justify-center space-x-8 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{score}</div>
            <div className="text-sm text-cosmic-400">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{currentPuzzle + 1}/{wordPuzzles.length}</div>
            <div className="text-sm text-cosmic-400">Progress</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-blue-400'}`}>
              {timeLeft}s
            </div>
            <div className="text-sm text-cosmic-400">Time</div>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-cosmic-800 rounded-xl p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-sm text-cosmic-400 mb-2">Category: {puzzle.category}</div>
            <div className="text-4xl font-bold text-purple-400 mb-4 tracking-widest">
              {puzzle.scrambled}
            </div>
            
            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 mb-4"
              >
                <p className="text-orange-300">💡 {puzzle.hint}</p>
              </motion.div>
            )}
            
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center space-x-2 mx-auto text-orange-400 hover:text-orange-300 transition-colors mb-6"
            >
              <Lightbulb className="w-4 h-4" />
              <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
            </button>
          </div>

          <div className="max-w-md mx-auto">
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
              placeholder="Enter your answer..."
              className="w-full text-center text-2xl font-bold bg-cosmic-700 border-2 border-cosmic-600 rounded-lg p-4 text-white focus:border-purple-400 focus:outline-none"
              disabled={isCorrect || gameComplete}
            />
            
            <button
              onClick={checkAnswer}
              disabled={!userInput || isCorrect || gameComplete}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-cosmic-600 text-white py-3 rounded-lg transition-colors font-bold"
            >
              Check Answer
            </button>
          </div>

          <AnimatePresence>
            {isCorrect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center mt-6"
              >
                <div className="text-6xl mb-2">🎉</div>
                <p className="text-green-400 font-bold text-xl">Correct!</p>
                <p className="text-cosmic-300">+{showHint ? 5 : 10} points</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Game Complete Modal */}
        <AnimatePresence>
          {gameComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-cosmic-800 rounded-xl p-8 text-center max-w-md mx-4"
              >
                <div className="text-6xl mb-4">🌌</div>
                <h2 className="text-3xl font-bold text-purple-400 mb-2">Nebula Conquered!</h2>
                <p className="text-cosmic-300 mb-4">
                  You've unscrambled all the cosmic words!
                </p>
                <p className="text-lg font-bold text-orange-400 mb-6">
                  Final Score: {score}
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={resetGame}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WordNebula;