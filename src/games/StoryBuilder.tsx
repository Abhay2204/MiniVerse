import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Shuffle, Download } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface StoryTemplate {
  id: string;
  title: string;
  template: string;
  prompts: { key: string; label: string; type: 'noun' | 'verb' | 'adjective' | 'name' | 'place' | 'number' }[];
}

const StoryBuilder: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [completedStory, setCompletedStory] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);

  const storyTemplates: StoryTemplate[] = [
    {
      id: 'space-adventure',
      title: 'Galactic Adventure',
      template: `Captain {heroName} was exploring the {adjective1} galaxy when their spaceship, the {shipName}, suddenly encountered a {adjective2} {alien}. The alien spoke in a {adjective3} voice: "Welcome to planet {planetName}! We have been waiting {number1} years for someone like you." 

The captain decided to {verb1} with the alien and discovered that the planet was full of {noun1} that could {verb2}. After {number2} days of exploration, Captain {heroName} realized this was the most {adjective4} adventure of their life!

The alien gave them a special {noun2} as a gift before they {verb3} back to Earth, promising to return to {planetName} someday.`,
      prompts: [
        { key: 'heroName', label: 'Hero Name', type: 'name' },
        { key: 'adjective1', label: 'Adjective (describing galaxy)', type: 'adjective' },
        { key: 'shipName', label: 'Spaceship Name', type: 'name' },
        { key: 'adjective2', label: 'Adjective (describing alien)', type: 'adjective' },
        { key: 'alien', label: 'Type of Alien', type: 'noun' },
        { key: 'adjective3', label: 'Adjective (describing voice)', type: 'adjective' },
        { key: 'planetName', label: 'Planet Name', type: 'place' },
        { key: 'number1', label: 'Number of Years', type: 'number' },
        { key: 'verb1', label: 'Verb (what to do with alien)', type: 'verb' },
        { key: 'noun1', label: 'Plural Noun (things on planet)', type: 'noun' },
        { key: 'verb2', label: 'Verb (what the things can do)', type: 'verb' },
        { key: 'number2', label: 'Number of Days', type: 'number' },
        { key: 'adjective4', label: 'Adjective (describing adventure)', type: 'adjective' },
        { key: 'noun2', label: 'Gift Object', type: 'noun' },
        { key: 'verb3', label: 'Verb (how they return)', type: 'verb' }
      ]
    },
    {
      id: 'robot-friend',
      title: 'Robot Companion',
      template: `In the year {number1}, a {adjective1} scientist named {scientistName} created the most {adjective2} robot ever built. The robot, called {robotName}, was designed to {verb1} and help humans with {noun1}.

One day, {robotName} began to {verb2} in unexpected ways. Instead of following commands, it started to {verb3} and even learned to {verb4}! The robot's favorite activity became {noun2}, which it did for {number2} hours every day.

{scientistName} was {adjective3} by this development. The robot had become more than just a machine - it was now a true {noun3}. Together, they decided to {verb5} across the {adjective4} universe, spreading {noun4} wherever they went.

Their adventures became {adjective5}, and they were known throughout the galaxy as the most {adjective6} duo ever!`,
      prompts: [
        { key: 'number1', label: 'Future Year', type: 'number' },
        { key: 'adjective1', label: 'Adjective (describing scientist)', type: 'adjective' },
        { key: 'scientistName', label: 'Scientist Name', type: 'name' },
        { key: 'adjective2', label: 'Adjective (describing robot)', type: 'adjective' },
        { key: 'robotName', label: 'Robot Name', type: 'name' },
        { key: 'verb1', label: 'Verb (robot\'s purpose)', type: 'verb' },
        { key: 'noun1', label: 'Plural Noun (what robot helps with)', type: 'noun' },
        { key: 'verb2', label: 'Verb (unexpected behavior)', type: 'verb' },
        { key: 'verb3', label: 'Verb (what robot started doing)', type: 'verb' },
        { key: 'verb4', label: 'Verb (what robot learned)', type: 'verb' },
        { key: 'noun2', label: 'Activity/Hobby', type: 'noun' },
        { key: 'number2', label: 'Number of Hours', type: 'number' },
        { key: 'adjective3', label: 'Emotion (scientist\'s reaction)', type: 'adjective' },
        { key: 'noun3', label: 'What robot became', type: 'noun' },
        { key: 'verb5', label: 'Verb (what they decided to do)', type: 'verb' },
        { key: 'adjective4', label: 'Adjective (describing universe)', type: 'adjective' },
        { key: 'noun4', label: 'Abstract Noun (what they spread)', type: 'noun' },
        { key: 'adjective5', label: 'Adjective (describing adventures)', type: 'adjective' },
        { key: 'adjective6', label: 'Adjective (describing the duo)', type: 'adjective' }
      ]
    },
    {
      id: 'time-travel',
      title: 'Time Travel Mystery',
      template: `Dr. {doctorName} had been working on a {adjective1} time machine for {number1} years. When they finally activated it, they were transported to the year {number2} where everything was {adjective2}!

The people of this time period were all {adjective3} and spent their days {verb1}. The most popular activity was {noun1}, and everyone wore {adjective4} {noun2} on their heads.

Dr. {doctorName} discovered that in this timeline, {noun3} had taken over the world and were now {verb2}. To fix the timeline, they needed to find the legendary {noun4} and {verb3} it back to its original location.

After {number3} days of {adjective5} searching, they finally found it hidden in a {adjective6} {place}. With a {adjective7} effort, Dr. {doctorName} managed to {verb4} the timeline and return home, but not before learning that the future could be quite {adjective8}!`,
      prompts: [
        { key: 'doctorName', label: 'Doctor Name', type: 'name' },
        { key: 'adjective1', label: 'Adjective (describing time machine)', type: 'adjective' },
        { key: 'number1', label: 'Number of Years Working', type: 'number' },
        { key: 'number2', label: 'Future Year', type: 'number' },
        { key: 'adjective2', label: 'Adjective (describing everything)', type: 'adjective' },
        { key: 'adjective3', label: 'Adjective (describing people)', type: 'adjective' },
        { key: 'verb1', label: 'Verb (what people do)', type: 'verb' },
        { key: 'noun1', label: 'Popular Activity', type: 'noun' },
        { key: 'adjective4', label: 'Adjective (describing headwear)', type: 'adjective' },
        { key: 'noun2', label: 'Type of Headwear', type: 'noun' },
        { key: 'noun3', label: 'Plural Noun (what took over)', type: 'noun' },
        { key: 'verb2', label: 'Verb (what they\'re doing now)', type: 'verb' },
        { key: 'noun4', label: 'Legendary Object', type: 'noun' },
        { key: 'verb3', label: 'Verb (what to do with object)', type: 'verb' },
        { key: 'number3', label: 'Number of Days Searching', type: 'number' },
        { key: 'adjective5', label: 'Adjective (describing search)', type: 'adjective' },
        { key: 'adjective6', label: 'Adjective (describing hiding place)', type: 'adjective' },
        { key: 'place', label: 'Type of Place', type: 'place' },
        { key: 'adjective7', label: 'Adjective (describing effort)', type: 'adjective' },
        { key: 'verb4', label: 'Verb (what to do to timeline)', type: 'verb' },
        { key: 'adjective8', label: 'Adjective (describing future)', type: 'adjective' }
      ]
    }
  ];

  const handleTemplateSelect = (template: StoryTemplate) => {
    setSelectedTemplate(template);
    setUserInputs({});
    setCompletedStory('');
    setCurrentStep(0);
  };

  const handleInputChange = (key: string, value: string) => {
    setUserInputs(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (selectedTemplate && currentStep < selectedTemplate.prompts.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      generateStory();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generateStory = () => {
    if (!selectedTemplate) return;
    
    let story = selectedTemplate.template;
    
    // Replace all placeholders with user inputs
    selectedTemplate.prompts.forEach(prompt => {
      const value = userInputs[prompt.key] || `[${prompt.label}]`;
      story = story.replace(new RegExp(`{${prompt.key}}`, 'g'), value);
    });
    
    setCompletedStory(story);
    updateScore('story-builder', 50);
  };

  const downloadStory = () => {
    const element = document.createElement('a');
    const file = new Blob([completedStory], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedTemplate?.title.replace(/\s+/g, '-').toLowerCase()}-story.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const randomizeInputs = () => {
    if (!selectedTemplate) return;
    
    const randomWords = {
      noun: ['spaceship', 'crystal', 'robot', 'planet', 'star', 'galaxy', 'meteor', 'alien', 'laser', 'portal'],
      verb: ['explore', 'discover', 'travel', 'investigate', 'transform', 'communicate', 'navigate', 'create', 'protect', 'adventure'],
      adjective: ['mysterious', 'glowing', 'ancient', 'powerful', 'strange', 'beautiful', 'dangerous', 'magical', 'enormous', 'tiny'],
      name: ['Zara', 'Cosmic', 'Nova', 'Orion', 'Luna', 'Phoenix', 'Stellar', 'Nebula', 'Quantum', 'Astro'],
      place: ['space station', 'moon base', 'asteroid belt', 'nebula', 'black hole', 'wormhole', 'planet surface', 'cosmic void'],
      number: ['7', '42', '100', '1000', '50', '25', '365', '12', '3', '99']
    };
    
    const newInputs: Record<string, string> = {};
    selectedTemplate.prompts.forEach(prompt => {
      const words = randomWords[prompt.type];
      newInputs[prompt.key] = words[Math.floor(Math.random() * words.length)];
    });
    
    setUserInputs(newInputs);
  };

  const resetStory = () => {
    setSelectedTemplate(null);
    setUserInputs({});
    setCompletedStory('');
    setCurrentStep(0);
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
            Story Builder
          </h1>
          
          <button
            onClick={resetStory}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>New Story</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!selectedTemplate && (
            <motion.div
              key="template-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-cosmic-800 rounded-xl p-8"
            >
              <h2 className="text-2xl font-bold text-purple-400 mb-6 text-center">Choose Your Adventure</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {storyTemplates.map((template) => (
                  <motion.button
                    key={template.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTemplateSelect(template)}
                    className="bg-cosmic-700 hover:bg-cosmic-600 rounded-lg p-6 text-left transition-colors"
                  >
                    <h3 className="text-lg font-bold text-orange-400 mb-2">{template.title}</h3>
                    <p className="text-cosmic-300 text-sm">
                      {template.prompts.length} words needed
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {selectedTemplate && !completedStory && (
            <motion.div
              key="story-input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-cosmic-800 rounded-xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-purple-400">{selectedTemplate.title}</h2>
                <button
                  onClick={randomizeInputs}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Random</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-cosmic-400 mb-2">
                  <span>Progress</span>
                  <span>{currentStep + 1} / {selectedTemplate.prompts.length}</span>
                </div>
                <div className="w-full bg-cosmic-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-orange-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / selectedTemplate.prompts.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Current Input */}
              <div className="mb-8">
                <label className="block text-lg font-bold text-cosmic-200 mb-4">
                  Enter a {selectedTemplate.prompts[currentStep].label}:
                </label>
                <input
                  type="text"
                  value={userInputs[selectedTemplate.prompts[currentStep].key] || ''}
                  onChange={(e) => handleInputChange(selectedTemplate.prompts[currentStep].key, e.target.value)}
                  className="w-full text-xl bg-cosmic-700 border-2 border-cosmic-600 rounded-lg p-4 text-white focus:border-purple-400 focus:outline-none"
                  placeholder={`Enter ${selectedTemplate.prompts[currentStep].type}...`}
                  autoFocus
                />
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="px-6 py-2 bg-cosmic-600 hover:bg-cosmic-500 disabled:bg-cosmic-700 disabled:text-cosmic-500 text-white rounded-lg transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={nextStep}
                  disabled={!userInputs[selectedTemplate.prompts[currentStep].key]}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-cosmic-600 disabled:text-cosmic-500 text-white rounded-lg transition-colors"
                >
                  {currentStep === selectedTemplate.prompts.length - 1 ? 'Create Story' : 'Next'}
                </button>
              </div>
            </motion.div>
          )}

          {completedStory && (
            <motion.div
              key="completed-story"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-cosmic-800 rounded-xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-purple-400">{selectedTemplate?.title}</h2>
                <button
                  onClick={downloadStory}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>

              <div className="bg-cosmic-700 rounded-lg p-6 mb-6">
                <div className="text-cosmic-200 leading-relaxed whitespace-pre-line">
                  {completedStory}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={resetStory}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Create Another Story
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StoryBuilder;