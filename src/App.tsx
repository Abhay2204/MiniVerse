import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import Header from './components/Header';
import Hero from './components/Hero';
import GameGrid from './components/GameGrid';
import GameModal from './components/GameModal';
import IntroScreen from './components/IntroScreen';
import StarField from './components/StarField';
import { useGameStore } from './store/gameStore';
import { games, getCategoryTitle } from './utils/gameData';

function App() {
  const { currentGame, isIntroScreen, initializeGames, setCurrentGame } = useGameStore();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-out-cubic',
      once: true,
    });
    initializeGames(games);
    
    // Clear currentGame if it's not in the current games list
    if (currentGame && !games.find(game => game.id === currentGame.id)) {
      setCurrentGame(null);
    }
  }, [initializeGames, currentGame, setCurrentGame]);

  const categories = ['puzzle', 'action', 'reflex', 'creative', 'brain', 'developer'];

  return (
    <div className="min-h-screen parallax-bg text-white relative overflow-x-hidden">
      <StarField />
      
      <AnimatePresence mode="wait">
        {isIntroScreen ? (
          <IntroScreen key="intro-screen" />
        ) : currentGame ? (
          <GameModal key="game-modal" />
        ) : (
          <div key="main-content">
            <Header />
            <main>
              <Hero />
              
              <div id="games" className="py-16">
                {categories.map((category) => (
                  <div key={category} data-aos="fade-up">
                    <GameGrid
                      games={games}
                      title={getCategoryTitle(category)}
                      category={category}
                    />
                  </div>
                ))}
              </div>

              {/* Stats Section */}
              <section id="stats" className="py-16 bg-cosmic-800/20" data-aos="fade-up">
                <div className="container mx-auto px-4 text-center">
                  <h2 className="text-4xl font-orbitron font-bold mb-12 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
                    MiniVerse Statistics
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                      { label: 'Total Games', value: games.length, icon: '🎮' },
                      { label: 'Categories', value: categories.length, icon: '🌟' },
                      { label: 'Difficulty Levels', value: '3', icon: '⚡' },
                      { label: 'Hours of Fun', value: '∞', icon: '🚀' },
                    ].map((stat, index) => (
                      <div
                        key={stat.label}
                        className="game-card rounded-xl p-6 text-center"
                        data-aos="zoom-in"
                        data-aos-delay={index * 100}
                      >
                        <div className="text-4xl mb-2">{stat.icon}</div>
                        <div className="text-3xl font-bold text-purple-400 mb-2">{stat.value}</div>
                        <div className="text-cosmic-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* About Section */}
              <section id="about" className="py-16" data-aos="fade-up">
                <div className="container mx-auto px-4 text-center max-w-4xl">
                  <h2 className="text-4xl font-orbitron font-bold mb-8 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
                    About MiniVerse
                  </h2>
                  <p className="text-xl text-cosmic-300 leading-relaxed mb-8">
                    Welcome to MiniVerse: The Space Adventure World – a cosmic playground where entertainment meets education.
                    Our collection of 30+ mini-games spans from casual brain teasers to advanced developer challenges,
                    all wrapped in a stunning space-themed interface that makes learning and playing an adventure.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="game-card rounded-xl p-6">
                      <h3 className="text-2xl font-bold text-purple-400 mb-4">🎮 For Gamers</h3>
                      <p className="text-cosmic-300">
                        Enjoy classic games with modern twists, brain puzzles, and creative challenges 
                        designed to entertain and engage players of all skill levels.
                      </p>
                    </div>
                    <div className="game-card rounded-xl p-6">
                      <h3 className="text-2xl font-bold text-orange-400 mb-4">💻 For Developers</h3>
                      <p className="text-cosmic-300">
                        Master CSS, JavaScript, algorithms, and more through interactive coding challenges 
                        that make learning programming concepts fun and memorable.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </main>

            <footer className="bg-cosmic-900 py-8 border-t border-cosmic-700">
              <div className="container mx-auto px-4 text-center">
                <p className="text-cosmic-400">
                  © 2025 MiniVerse: The Space Adventure World. Crafted with ❤️ for cosmic adventurers.
                </p>
              </div>
            </footer>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
