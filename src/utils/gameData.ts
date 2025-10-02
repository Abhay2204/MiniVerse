import { Game } from '../types';
import MemorySpace from '../games/MemorySpace';
import SnakeGame from '../games/SnakeGame';
import FlexboxGame from '../games/FlexboxGame';
import WordNebula from '../games/WordNebula';
import NumberSupernova from '../games/NumberSupernova';
import SlidingCosmos from '../games/SlidingCosmos';
import MeteorDodge from '../games/MeteorDodge';
import AlienInvader from '../games/AlienInvader';
import PlanetHopper from '../games/PlanetHopper';
import ReactionNebula from '../games/ReactionNebula';
import ClickComet from '../games/ClickComet';
import SpeedTypingOrbit from '../games/SpeedTypingOrbit';
import PixelPainter from '../games/PixelPainter';
import MusicMaker from '../games/MusicMaker';
import StoryBuilder from '../games/StoryBuilder';
import LogicLoops from '../games/LogicLoops';
import TriviaTrek from '../games/TriviaTrek';
import GridGalaxy from '../games/GridGalaxy';
import JavaScriptJourneys from '../games/JavaScriptJourneys';
import AlgorithmArena from '../games/AlgorithmArena';
import DebugDetective from '../games/DebugDetective';
import RegexRocket from '../games/RegexRocket';
import ApiAdventure from '../games/ApiAdventure';
import ResponsiveRacer from '../games/ResponsiveRacer';
import AnimationArchitect from '../games/AnimationArchitect';
import PerformancePilot from '../games/PerformancePilot';

export const games: Game[] = [
  // Puzzle Planet
  {
    id: 'memory-space',
    name: 'Memory Space',
    description: 'Match cosmic pairs in this intergalactic memory challenge',
    category: 'puzzle',
    difficulty: 'easy',
    isUnlocked: true,
    icon: '🧠',
    component: MemorySpace,
  },
  {
    id: 'word-nebula',
    name: 'Word Nebula',
    description: 'Unscramble cosmic vocabulary in stellar word puzzles',
    category: 'puzzle',
    difficulty: 'medium',
    isUnlocked: true,
    icon: '📝',
    component: WordNebula,
  },
  {
    id: 'number-supernova',
    name: 'Number Supernova',
    description: '2048-style number merging with explosive space action',
    category: 'puzzle',
    difficulty: 'medium',
    isUnlocked: true,
    icon: '🔢',
    component: NumberSupernova,
  },
  {
    id: 'sliding-cosmos',
    name: 'Sliding Cosmos',
    description: 'Arrange beautiful galaxy images in sliding puzzles',
    category: 'puzzle',
    difficulty: 'hard',
    isUnlocked: true,
    icon: '🧩',
    component: SlidingCosmos,
  },

  // Action Asteroid
  {
    id: 'snake-universe',
    name: 'Snake Universe',
    description: 'Classic snake game with stunning space visuals',
    category: 'action',
    difficulty: 'easy',
    isUnlocked: true,
    icon: '🐍',
    component: SnakeGame,
  },
  {
    id: 'meteor-dodge',
    name: 'Meteor Dodge',
    description: 'Navigate through dangerous asteroid fields',
    category: 'action',
    difficulty: 'medium',
    isUnlocked: true,
    icon: '☄️',
    component: MeteorDodge,
  },
  {
    id: 'alien-invader',
    name: 'Alien Invader',
    description: 'Defend Earth from waves of alien attackers',
    category: 'action',
    difficulty: 'hard',
    isUnlocked: true,
    icon: '👽',
    component: AlienInvader,
  },
  {
    id: 'planet-hopper',
    name: 'Planet Hopper',
    description: 'Jump between moving planets in zero gravity',
    category: 'action',
    difficulty: 'medium',
    isUnlocked: true,
    icon: '🪐',
    component: PlanetHopper,
  },

  // Reflex Realm
  {
    id: 'reaction-nebula',
    name: 'Reaction Nebula',
    description: 'Test your reaction time with color-change challenges',
    category: 'reflex',
    difficulty: 'easy',
    isUnlocked: true,
    icon: '⚡',
    component: ReactionNebula,
  },
  {
    id: 'click-comet',
    name: 'Click Comet',
    description: 'Catch speeding comets as they zoom across space',
    category: 'reflex',
    difficulty: 'medium',
    isUnlocked: true,
    icon: '☄️',
    component: ClickComet,
  },
  {
    id: 'speed-typing-orbit',
    name: 'Speed Typing Orbit',
    description: 'Type space-themed words at light speed',
    category: 'reflex',
    difficulty: 'hard',
    isUnlocked: true,
    icon: '⌨️',
    component: SpeedTypingOrbit,
  },

  // Creative Cosmos
  {
    id: 'pixel-painter',
    name: 'Pixel Painter',
    description: 'Create cosmic artwork with stellar drawing tools',
    category: 'creative',
    difficulty: 'easy',
    isUnlocked: true,
    icon: '🎨',
    component: PixelPainter,
  },
  {
    id: 'music-maker',
    name: 'Music Maker',
    description: 'Compose otherworldly beats and space symphonies',
    category: 'creative',
    difficulty: 'medium',
    isUnlocked: true,
    icon: '🎵',
    component: MusicMaker,
  },
  {
    id: 'story-builder',
    name: 'Story Builder',
    description: 'Create epic space adventures with mad lib magic',
    category: 'creative',
    difficulty: 'easy',
    isUnlocked: true,
    icon: '📚',
    component: StoryBuilder,
  },

  // Brain Galaxy
  {
    id: 'logic-loops',
    name: 'Logic Loops',
    description: 'Solve programming puzzles to unlock cosmic mysteries',
    category: 'brain',
    difficulty: 'hard',
    isUnlocked: true,
    icon: '🧮',
    component: LogicLoops,
  },
  {
    id: 'trivia-trek',
    name: 'Trivia Trek',
    description: 'Journey through space with science and astronomy trivia',
    category: 'brain',
    difficulty: 'medium',
    isUnlocked: true,
    icon: '🚀',
    component: TriviaTrek,
  },

  // Developer Zone
  {
    id: 'flexbox-fighter',
    name: 'Flexbox Fighter',
    description: 'Master CSS Flexbox through interactive challenges',
    category: 'developer',
    difficulty: 'medium',
    isUnlocked: true,
    icon: '💪',
    component: FlexboxGame,
  },
  {
    id: 'grid-galaxy',
    name: 'Grid Galaxy',
    description: 'Conquer CSS Grid layouts in space-themed puzzles',
    category: 'developer',
    difficulty: 'hard',
    isUnlocked: true,
    icon: '📐',
    component: GridGalaxy,
  },
  {
    id: 'javascript-journeys',
    name: 'JavaScript Journeys',
    description: 'Navigate through JS logic challenges across the cosmos',
    category: 'developer',
    difficulty: 'hard',
    isUnlocked: true,
    icon: '⚡',
    component: JavaScriptJourneys,
  },
  {
    id: 'algorithm-arena',
    name: 'Algorithm Arena',
    description: 'Battle complexity with sorting and searching algorithms',
    category: 'developer',
    difficulty: 'hard',
    isUnlocked: true,
    icon: '⚔️',
    component: AlgorithmArena,
  },
  {
    id: 'debug-detective',
    name: 'Debug Detective',
    description: 'Hunt down bugs in alien code across the galaxy',
    category: 'developer',
    difficulty: 'medium',
    isUnlocked: true,
    icon: '🔍',
    component: DebugDetective,
  },
  {
    id: 'regex-rocket',
    name: 'Regex Rocket',
    description: 'Launch into orbit with regular expression challenges',
    category: 'developer',
    difficulty: 'hard',
    isUnlocked: true,
    icon: '🚀',
    component: RegexRocket,
  },
  {
    id: 'api-adventure',
    name: 'API Adventure',
    description: 'Connect with alien APIs across the digital universe',
    category: 'developer',
    difficulty: 'medium',
    isUnlocked: true,
    icon: '🔗',
    component: ApiAdventure,
  },
  {
    id: 'responsive-racer',
    name: 'Responsive Racer',
    description: 'Race against time to create responsive layouts',
    category: 'developer',
    difficulty: 'medium',
    isUnlocked: true,
    icon: '📱',
    component: ResponsiveRacer,
  },
  {
    id: 'animation-architect',
    name: 'Animation Architect',
    description: 'Design stellar animations with CSS mastery',
    category: 'developer',
    difficulty: 'hard',
    isUnlocked: true,
    icon: '✨',
    component: AnimationArchitect,
  },
  {
    id: 'performance-pilot',
    name: 'Performance Pilot',
    description: 'Optimize code for warp-speed performance',
    category: 'developer',
    difficulty: 'hard',
    isUnlocked: true,
    icon: '⚡',
    component: PerformancePilot,
  },
];

export const getCategoryTitle = (category: string) => {
  switch (category) {
    case 'puzzle': return 'Puzzle Planet';
    case 'action': return 'Action Asteroid';
    case 'reflex': return 'Reflex Realm';
    case 'creative': return 'Creative Cosmos';
    case 'brain': return 'Brain Galaxy';
    case 'developer': return 'Developer Zone';
    default: return 'Unknown Realm';
  }
};