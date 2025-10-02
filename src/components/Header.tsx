import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Rocket, User, Trophy, Star } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleLeaderboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowComingSoon(true);
  };

  const navItems = [
    { name: 'Game Worlds', href: '#games', icon: Rocket },
    { name: 'Leaderboard', href: '#leaderboard', icon: Trophy, onClick: handleLeaderboardClick },
    { name: 'About', href: '#about', icon: User },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 bg-cosmic-900/80 backdrop-blur-md border-b border-cosmic-700/50"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2"
        >
          <Rocket className="w-8 h-8 text-purple-500" />
          <h1 className="text-2xl font-orbitron font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            MiniVerse
          </h1>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item, index) => (
            <motion.button
              key={item.name}
              onClick={item.onClick || ((e) => {
                if (item.href.startsWith('#')) {
                  e.preventDefault();
                  document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                }
              })}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, color: '#7C3AED' }}
              className="text-cosmic-200 hover:text-purple-400 transition-colors flex items-center space-x-1 bg-transparent border-none cursor-pointer"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </motion.button>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-cosmic-200 hover:text-purple-400 transition-colors"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-cosmic-900/95 backdrop-blur-md border-t border-cosmic-700/50"
          >
            <div className="container mx-auto px-4 py-4">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={(e) => {
                    if (item.onClick) {
                      item.onClick(e);
                    } else if (item.href.startsWith('#')) {
                      e.preventDefault();
                      document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                    }
                    setIsMenuOpen(false);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="block py-2 text-cosmic-200 hover:text-purple-400 transition-colors flex items-center space-x-2 bg-transparent border-none cursor-pointer w-full text-left"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowComingSoon(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-gradient-to-br from-cosmic-900 via-purple-900/90 to-cosmic-800 rounded-2xl p-8 max-w-md w-full border border-purple-500/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Stars decoration */}
              <div className="absolute top-4 right-4 text-yellow-400">
                <Star className="w-6 h-6 animate-pulse" />
              </div>
              <div className="absolute top-8 left-8 text-purple-400">
                <Star className="w-4 h-4 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              <div className="absolute bottom-8 right-8 text-orange-400">
                <Star className="w-5 h-5 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              <div className="text-center relative z-10">
                <div className="mb-6">
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                    Coming Soon!
                  </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto rounded-full"></div>
                </div>

                <p className="text-cosmic-200 text-lg leading-relaxed mb-6">
                  🚀 The Leaderboard feature is launching soon!
                  <br />
                  <span className="text-purple-300 text-sm mt-2 block">
                    Track your cosmic achievements and compete with fellow space adventurers.
                  </span>
                </p>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowComingSoon(false)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
