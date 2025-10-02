import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Palette, Eraser, Download, RotateCcw } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const PixelPainter: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#8B5CF6');
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  const colors = [
    '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#F97316',
    '#EC4899', '#84CC16', '#06B6D4', '#8B5A2B', '#FFFFFF', '#000000'
  ];

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.fillStyle = currentColor;
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
    ctx.fill();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Set space background
    ctx.fillStyle = '#0F0F23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add stars
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const downloadArt = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'cosmic-artwork.png';
    link.href = canvas.toDataURL();
    link.click();
    
    updateScore('pixel-painter', 100);
  };

  React.useEffect(() => {
    clearCanvas();
  }, []);

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
            Pixel Painter
          </h1>
          
          <div className="flex space-x-2">
            <button
              onClick={downloadArt}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={clearCanvas}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tools Panel */}
          <div className="bg-cosmic-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Tools
            </h3>
            
            {/* Brush/Eraser Toggle */}
            <div className="mb-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEraser(false)}
                  className={`flex-1 py-2 px-3 rounded-lg transition-colors ${
                    !isEraser ? 'bg-purple-600 text-white' : 'bg-cosmic-700 text-cosmic-300'
                  }`}
                >
                  Brush
                </button>
                <button
                  onClick={() => setIsEraser(true)}
                  className={`flex-1 py-2 px-3 rounded-lg transition-colors ${
                    isEraser ? 'bg-orange-600 text-white' : 'bg-cosmic-700 text-cosmic-300'
                  }`}
                >
                  <Eraser className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>

            {/* Brush Size */}
            <div className="mb-6">
              <label className="block text-cosmic-300 mb-2">Brush Size: {brushSize}px</label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Color Palette */}
            <div className="mb-6">
              <label className="block text-cosmic-300 mb-2">Colors</label>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      currentColor === color ? 'border-white scale-110' : 'border-cosmic-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Custom Color */}
            <div className="mb-6">
              <label className="block text-cosmic-300 mb-2">Custom Color</label>
              <input
                type="color"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="w-full h-10 rounded-lg bg-cosmic-700 border border-cosmic-600"
              />
            </div>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <div className="bg-cosmic-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-purple-400 mb-4">Canvas</h3>
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={400}
                  className="border-2 border-cosmic-600 rounded-lg cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseUp={stopDrawing}
                  onMouseMove={draw}
                  onMouseLeave={stopDrawing}
                />
              </div>
              
              <div className="mt-4 text-center text-cosmic-400">
                <p>Create your cosmic masterpiece! Click and drag to paint.</p>
                <p>Use different colors and brush sizes to bring your vision to life.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Ideas */}
        <div className="mt-6 bg-cosmic-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-purple-400 mb-4">Cosmic Art Ideas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-cosmic-700 rounded-lg p-3">
              <div className="text-2xl mb-2">🌌</div>
              <div className="text-cosmic-300">Galaxy Spiral</div>
            </div>
            <div className="bg-cosmic-700 rounded-lg p-3">
              <div className="text-2xl mb-2">🪐</div>
              <div className="text-cosmic-300">Planet System</div>
            </div>
            <div className="bg-cosmic-700 rounded-lg p-3">
              <div className="text-2xl mb-2">🚀</div>
              <div className="text-cosmic-300">Spaceship</div>
            </div>
            <div className="bg-cosmic-700 rounded-lg p-3">
              <div className="text-2xl mb-2">👽</div>
              <div className="text-cosmic-300">Alien Portrait</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixelPainter;