import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Rocket, User, Trophy } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Game Worlds', href: '#games', icon: Rocket },
    { name: 'Developer Zone', href: '#section4', icon: User },
    { name: 'Leaderboard', href: '#leaderboard', icon: Trophy },
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
            <motion.a
              key={item.name}
              href={item.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, color: '#7C3AED' }}
              className="text-cosmic-200 hover:text-purple-400 transition-colors flex items-center space-x-1"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </motion.a>
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
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-cosmic-200 hover:text-purple-400 transition-colors flex items-center space-x-2"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
