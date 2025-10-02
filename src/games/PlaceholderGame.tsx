import React from 'react';
import { ArrowLeft, Construction } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface PlaceholderGameProps {
  gameName: string;
  gameDescription: string;
}

const PlaceholderGame: React.FC<PlaceholderGameProps> = ({ gameName, gameDescription }) => {
  const { setCurrentGame } = useGameStore();

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
            {gameName}
          </h1>
          
          <div></div>
        </div>

        {/* Coming Soon Content */}
        <div className="bg-cosmic-800 rounded-xl p-12 text-center">
          <div className="text-8xl mb-6">🚧</div>
          <h2 className="text-3xl font-bold text-purple-400 mb-4">Coming Soon!</h2>
          <p className="text-xl text-cosmic-300 mb-6">
            {gameDescription}
          </p>
          <div className="bg-cosmic-700 rounded-lg p-6 mb-6">
            <Construction className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <p className="text-cosmic-400">
              This cosmic adventure is currently under development in our space laboratory. 
              Check back soon for an out-of-this-world gaming experience!
            </p>
          </div>
          
          <button
            onClick={() => setCurrentGame(null)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors font-bold"
          >
            Explore Other Games
          </button>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-cosmic-800 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-lg font-bold text-purple-400 mb-2">Interactive Gameplay</h3>
            <p className="text-cosmic-400 text-sm">
              Engaging mechanics designed for maximum fun and learning
            </p>
          </div>
          <div className="bg-cosmic-800 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">🌟</div>
            <h3 className="text-lg font-bold text-orange-400 mb-2">Cosmic Theme</h3>
            <p className="text-cosmic-400 text-sm">
              Beautiful space-themed visuals and immersive experience
            </p>
          </div>
          <div className="bg-cosmic-800 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-lg font-bold text-green-400 mb-2">Score & Progress</h3>
            <p className="text-cosmic-400 text-sm">
              Track your achievements and compete for high scores
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderGame;