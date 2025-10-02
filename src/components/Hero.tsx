import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const Hero: React.FC = () => {
  const { setIsIntroScreen } = useGameStore();

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Floating Elements */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-20 blur-sm"
      />
      
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/3 right-1/4 w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full opacity-20 blur-sm"
      />

      <motion.div
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 3, 0]
        }}
        transition={{ 
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full opacity-15 blur-sm"
      />

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-6"
        >
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse-slow" />
          <motion.h1
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-6xl md:text-8xl font-orbitron font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent"
          >
            MiniVerse
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-2xl md:text-3xl font-orbitron text-cosmic-300 mb-2"
          >
            The Space Adventure World
          </motion.p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-xl md:text-2xl text-cosmic-400 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          Explore an infinite universe of mini-games and developer challenges. 
          Test your skills, build your logic, and conquer the cosmos!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsIntroScreen(true)}
            className="glow-button px-8 py-4 rounded-full text-white font-bold text-lg flex items-center space-x-2 transition-all duration-300"
          >
            <Play className="w-5 h-5" />
            <span>Enter the Verse</span>
          </motion.button>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="flex items-center space-x-8 text-cosmic-400"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">30+</div>
              <div className="text-sm">Games</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">∞</div>
              <div className="text-sm">Fun</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">✨</div>
              <div className="text-sm">Magic</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
