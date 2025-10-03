import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Info, Zap, Home, Star, Gamepad2, Trophy, Clock, Target } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

// Enhanced solar system data
const solarSystemData = {
  sun: {
    name: "Sun",
    type: "G-type Main-sequence Star",
    diameter: "1,392,000 km",
    mass: "1.989 × 10³⁰ kg",
    temperature: "5,778 K (surface), 15,000,000 K (core)",
    age: "4.6 billion years",
    description: "The Sun is a yellow dwarf star at the center of our Solar System. It contains 99.86% of the system's mass and generates energy through nuclear fusion of hydrogen into helium.",
    color: "#FDB813",
    discoveryYear: "Ancient times",
    composition: "73% Hydrogen, 25% Helium, 2% heavier elements",
    moons: 0,
    image: "/images/sun.jpg",
    facts: [
      "The Sun is 109 times wider than Earth",
      "It takes 8 minutes for sunlight to reach Earth",
      "The Sun's core temperature is 15 million°C",
      "Every second, the Sun converts 600 million tons of hydrogen to helium",
      "The Sun produces the energy equivalent of 100 billion nuclear bombs every second"
    ]
  },
  mercury: {
    name: "Mercury",
    type: "Terrestrial Planet",
    diameter: "4,879 km",
    mass: "3.301 × 10²³ kg",
    distance: "57.9 million km from Sun",
    day: "176 Earth days",
    year: "88 Earth days",
    orbitalSpeed: "47.8 km/s (170,868 km/h)",
    description: "Mercury is the smallest planet and closest to the Sun. It has extreme temperature variations and no atmosphere to retain heat.",
    color: "#8C7853",
    discoveryYear: "Ancient times",
    composition: "Iron core (75% of radius), silicate mantle",
    moons: 0,
    image: "/images/mercury.jpg",
    facts: [
      "Mercury has no moons or rings",
      "Temperature ranges from -173°C to 427°C",
      "It's shrinking as its iron core cools",
      "Mercury has water ice in its polar craters",
      "A day on Mercury is twice as long as its year"
    ]
  },
  venus: {
    name: "Venus",
    type: "Terrestrial Planet",
    diameter: "12,104 km",
    mass: "4.867 × 10²⁴ kg",
    distance: "108.2 million km from Sun",
    day: "243 Earth days (retrograde)",
    year: "225 Earth days",
    orbitalSpeed: "35.0 km/s (126,028 km/h)",
    description: "Venus is the hottest planet with a thick, toxic atmosphere composed mainly of carbon dioxide with sulfuric acid clouds.",
    color: "#FFA649",
    discoveryYear: "Ancient times",
    composition: "Similar to Earth - iron core, silicate mantle",
    moons: 0,
    image: "/images/venus.jpg",
    facts: [
      "Venus rotates backwards (retrograde rotation)",
      "Surface temperature is 462°C - hot enough to melt lead",
      "It rains sulfuric acid in its atmosphere",
      "Venus is sometimes called Earth's 'evil twin'",
      "The atmospheric pressure is 90 times that of Earth"
    ]
  },
  earth: {
    name: "Earth",
    type: "Terrestrial Planet",
    diameter: "12,756 km",
    mass: "5.972 × 10²⁴ kg",
    distance: "149.6 million km from Sun (1 AU)",
    day: "24 hours",
    year: "365.25 days",
    orbitalSpeed: "29.8 km/s (107,088 km/h)",
    description: "Earth is the only known planet with life. It has liquid water, a protective atmosphere, and a magnetic field that shields us from harmful solar radiation.",
    color: "#4F94CD",
    discoveryYear: "N/A - Home planet",
    composition: "Iron-nickel core, silicate mantle, water oceans",
    moons: 1,
    image: "/images/earth.jpg",
    facts: [
      "71% of Earth's surface is covered by water",
      "Earth has one natural satellite: the Moon",
      "The magnetic field protects us from solar radiation",
      "Earth is the densest planet in the solar system",
      "Life has existed on Earth for about 3.8 billion years"
    ]
  },
  mars: {
    name: "Mars",
    type: "Terrestrial Planet",
    diameter: "6,792 km",
    mass: "6.417 × 10²³ kg",
    distance: "227.9 million km from Sun",
    day: "24.6 hours",
    year: "687 Earth days",
    orbitalSpeed: "24.1 km/s (86,676 km/h)",
    description: "Mars is known as the Red Planet due to iron oxide on its surface. It has the largest volcano and deepest canyon in the solar system.",
    color: "#CD5C5C",
    discoveryYear: "Ancient times",
    composition: "Iron sulfide core, basaltic mantle, iron oxide surface",
    moons: 2,
    image: "/src/images/mars.jpg",
    facts: [
      "Mars has two small moons: Phobos and Deimos",
      "Olympus Mons is the largest volcano in the solar system (21 km high)",
      "Evidence suggests Mars once had liquid water",
      "Mars has seasons similar to Earth due to its axial tilt",
      "The Valles Marineris canyon is 4000 km long and 7 km deep"
    ]
  },
  jupiter: {
    name: "Jupiter",
    type: "Gas Giant",
    diameter: "142,984 km",
    mass: "1.898 × 10²⁷ kg",
    distance: "778.5 million km from Sun",
    day: "9.9 hours",
    year: "12 Earth years",
    orbitalSpeed: "13.1 km/s (47,076 km/h)",
    description: "Jupiter is the largest planet with a Great Red Spot storm that has raged for centuries. It acts as a cosmic vacuum cleaner, protecting inner planets from asteroids and comets.",
    color: "#D2691E",
    discoveryYear: "Ancient times",
    composition: "Mostly hydrogen and helium with a rocky core",
    moons: 95,
    image: "/src/images/jupiter.jpg",
    facts: [
      "Jupiter has 95 known moons, including the four Galilean moons",
      "The Great Red Spot is a storm larger than Earth that has lasted 400+ years",
      "Jupiter radiates more energy than it receives from the Sun",
      "Jupiter's moon Europa may have more water than all Earth's oceans",
      "Jupiter has a faint ring system discovered in 1979"
    ]
  },
  saturn: {
    name: "Saturn",
    type: "Gas Giant",
    diameter: "120,536 km",
    mass: "5.683 × 10²⁶ kg",
    distance: "1.432 billion km from Sun",
    day: "10.7 hours",
    year: "29 Earth years",
    orbitalSpeed: "9.7 km/s (34,852 km/h)",
    description: "Saturn is famous for its spectacular ring system and low density. It would float in water if there was a bathtub big enough!",
    color: "#FAD5A5",
    discoveryYear: "Ancient times",
    composition: "Mostly hydrogen and helium, less dense than water",
    moons: 146,
    image: "/src/images/saturn.jpg",
    facts: [
      "Saturn has 146 confirmed moons, including Titan with lakes of methane",
      "Its rings are made of ice and rock particles, some as small as dust",
      "Saturn is less dense than water (0.687 g/cm³)",
      "The rings span 282,000 km but are only 10 meters thick on average",
      "Saturn's moon Enceladus shoots water geysers from its south pole"
    ]
  },
  uranus: {
    name: "Uranus",
    type: "Ice Giant",
    diameter: "51,118 km",
    mass: "8.681 × 10²⁵ kg",
    distance: "2.867 billion km from Sun",
    day: "17.2 hours",
    year: "84 Earth years",
    orbitalSpeed: "6.8 km/s (24,480 km/h)",
    description: "Uranus rotates on its side at a 98° tilt and has a faint ring system. It's the coldest planetary atmosphere in the solar system.",
    color: "#4FD0E7",
    discoveryYear: "1781 by William Herschel",
    composition: "Water, methane, and ammonia ices with a rocky core",
    moons: 27,
    image: "/src/images/uranus.jpg",
    facts: [
      "Uranus rotates on its side (98° axial tilt)",
      "It has 27 known moons named after Shakespeare characters",
      "Discovered by William Herschel in 1781, first planet found with telescope",
      "Uranus has 13 known rings, much fainter than Saturn's",
      "Its unusual rotation may be due to a collision with an Earth-sized object"
    ]
  },
  neptune: {
    name: "Neptune",
    type: "Ice Giant",
    diameter: "49,528 km",
    mass: "1.024 × 10²⁶ kg",
    distance: "4.515 billion km from Sun",
    day: "16.1 hours",
    year: "165 Earth years",
    orbitalSpeed: "5.4 km/s (19,440 km/h)",
    description: "Neptune has the strongest winds in the solar system reaching up to 2,100 km/h and gets its deep blue color from methane in its atmosphere.",
    color: "#4169E1",
    discoveryYear: "1846 by mathematical prediction",
    composition: "Water, methane, and ammonia ices with a rocky core",
    moons: 16,
    image: "/src/images/neptune.jpg",
    facts: [
      "Wind speeds reach up to 2,100 km/h - faster than the speed of sound",
      "Neptune has 16 known moons, largest being Triton",
      "It takes 165 Earth years to orbit the Sun",
      "Neptune was the first planet discovered through mathematical prediction",
      "Triton orbits backwards and is likely a captured Kuiper Belt object"
    ]
  }
};

// Historic comets data
const historicComets = [
  {
    name: "Halley's Comet",
    period: "75-76 years",
    lastSeen: "1986",
    nextVisible: "2061",
    description: "The most famous comet, visible to the naked eye every 75-76 years",
    color: "#87CEEB",
    image: "/src/images/comets.jpg",
    facts: [
      "Named after astronomer Edmond Halley",
      "Mentioned in Chinese records from 240 BCE",
      "Nucleus is about 15 km long and 8 km wide",
      "Travels at speeds up to 70 km/s"
    ]
  },
  {
    name: "Comet Hale-Bopp",
    period: "~2,533 years",
    lastSeen: "1997",
    nextVisible: "4530",
    description: "One of the brightest comets of the 20th century",
    color: "#FFD700",
    image: "/src/images/comets.jpg",
    facts: [
      "Visible to naked eye for 18 months",
      "Nucleus is 30-40 km in diameter",
      "Discovered independently by Alan Hale and Thomas Bopp",
      "Had two distinct tails: dust and ion"
    ]
  },
  {
    name: "Comet Hyakutake",
    period: "~70,000 years",
    lastSeen: "1996",
    nextVisible: "68,000 CE",
    description: "Known for its extremely long tail",
    color: "#98FB98",
    image: "/src/images/comets.jpg",
    facts: [
      "Tail stretched over 100 degrees across the sky",
      "Discovered by amateur astronomer Yuji Hyakutake",
      "Closest approach to Earth in 200 years",
      "X-ray emissions were detected for the first time in a comet"
    ]
  }
];

// Exact games from your website
const gameCategories = {
  puzzle: {
    name: "Puzzle Planet",
    icon: "🧠",
    games: [
      { name: "Memory Space", icon: "📝", difficulty: "easy", points: 381, description: "Match cosmic pairs in this intergalactic memory challenge" },
      { name: "Word Nebula", icon: "📝", difficulty: "medium", points: 20, description: "Unscramble cosmic vocabulary in stellar word puzzles" },
      { name: "Number Supernova", icon: "🔢", difficulty: "medium", points: 4540, description: "2048-style number merging with explosive space action" },
      { name: "Sliding Cosmos", icon: "🧩", difficulty: "hard", points: 100, description: "Arrange beautiful galaxy images in sliding puzzles" }
    ]
  },
  action: {
    name: "Action Asteroid",
    icon: "🎮",
    games: [
      { name: "Snake Universe", icon: "🐍", difficulty: "easy", points: 180, description: "Classic snake game with stunning space visuals" },
      { name: "Meteor Dodge", icon: "☄️", difficulty: "medium", points: 690, description: "Navigate through dangerous asteroid fields" },
      { name: "Alien Invader", icon: "👽", difficulty: "hard", points: 0, description: "Defend Earth from waves of alien attackers" },
      { name: "Planet Hopper", icon: "🪐", difficulty: "medium", points: 180, description: "Jump between moving planets in zero gravity" }
    ]
  },
  reflex: {
    name: "Reflex Realm",
    icon: "⚡",
    games: [
      { name: "Reaction Nebula", icon: "⚡", difficulty: "easy", points: 687, description: "Test your reaction time with color-change challenges" },
      { name: "Click Comet", icon: "☄️", difficulty: "medium", points: 70, description: "Catch speeding comets as they zoom across space" },
      { name: "Speed Typing Orbit", icon: "⌨️", difficulty: "hard", points: 0, description: "Type space-themed words at light speed" }
    ]
  },
  creative: {
    name: "Creative Cosmos",
    icon: "🎨",
    games: [
      { name: "Pixel Painter", icon: "🎨", difficulty: "easy", points: 100, description: "Create cosmic artwork with stellar drawing tools" },
      { name: "Music Maker", icon: "🎵", difficulty: "medium", points: 0, description: "Compose otherworldly beats and space symphonies" },
      { name: "Story Builder", icon: "📚", difficulty: "easy", points: 0, description: "Create epic space adventures with mad lib magic" }
    ]
  },
  brain: {
    name: "Brain Galaxy",
    icon: "🧠",
    games: [
      { name: "Logic Loops", icon: "🧮", difficulty: "hard", points: 0, description: "Solve programming puzzles to unlock cosmic mysteries" },
      { name: "Trivia Trek", icon: "🚀", difficulty: "medium", points: 0, description: "Journey through space with science and astronomy trivia" }
    ]
  }
};

const EnhancedIntroScreen: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [selectedComet, setSelectedComet] = useState<number | null>(null);
  const [showGames, setShowGames] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(0.3);
  const cameraAngleRef = useRef(0);
  const [zoomLevel, setZoomLevel] = useState(0.8);
  const [showComets, setShowComets] = useState(true);
  const [cameraX, setCameraX] = useState(0);
  const [cameraY, setCameraY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(0);
  const [lastMouseY, setLastMouseY] = useState(0);

  // Enhanced planet positions with astronomical(relative) speeds based on Kepler's laws
  const planets = useRef({
    mercury: { angle: 0, distance: 60, size: 2.5, speed: 0.04 },
    venus: { angle: Math.PI * 0.3, distance: 85, size: 3.8, speed: 0.016 },
    earth: { angle: Math.PI * 0.6, distance: 115, size: 4, speed: 0.01 },
    mars: { angle: Math.PI * 0.9, distance: 150, size: 3.2, speed: 0.005 },
    jupiter: { angle: Math.PI * 1.2, distance: 220, size: 14, speed: 0.002 },
    saturn: { angle: Math.PI * 1.5, distance: 280, size: 12, speed: 0.001 },
    uranus: { angle: Math.PI * 1.8, distance: 340, size: 8, speed: 0.0005 },
    neptune: { angle: Math.PI * 0.1, distance: 400, size: 8, speed: 0.0003 }
  });

  // Comet positions with slower animation
  const comets = useRef([
    { angle: 0, distance: 180, size: 1.5, speed: 0.008, tail: [] as {x: number, y: number}[] },
    { angle: Math.PI, distance: 320, size: 1.2, speed: -0.005, tail: [] as {x: number, y: number}[] },
    { angle: Math.PI * 0.7, distance: 450, size: 1.8, speed: 0.003, tail: [] as {x: number, y: number}[] }
  ]);

  // Asteroid belt
  const asteroids = useRef(
    Array.from({ length: 80 }, (_, i) => ({
      angle: (i / 80) * Math.PI * 2,
      distance: 200 + Math.random() * 30,
      size: 0.5 + Math.random() * 1,
      speed: 0.001 + Math.random() * 0.002
    }))
  );

  const drawEnhancedStarField = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Distant galaxies
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 20 + Math.random() * 30;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, '#ff69b430');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }

    // Nebulae
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 50 + Math.random() * 100;
      const colors = ['#ff6b9d', '#4ecdc4', '#45b7d1', '#96ceb4'];
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, colors[Math.floor(Math.random() * colors.length)] + '20');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }

    // Stars with twinkling
    ctx.globalAlpha = 1;
    const time = Date.now() * 0.001;
    for (let i = 0; i < 300; i++) {
      const x = (Math.sin(i * 0.1) * width/4) + width/2 + Math.cos(i * 0.05) * width/3;
      const y = (Math.cos(i * 0.1) * height/4) + height/2 + Math.sin(i * 0.05) * height/3;
      const size = 0.5 + Math.sin(time + i * 0.1) * 0.5 + Math.random() * 1;
      const brightness = 0.3 + Math.sin(time * 2 + i * 0.2) * 0.3 + 0.4;
      ctx.globalAlpha = brightness;
      ctx.fillStyle = i % 10 === 0 ? '#ffeb3b' : (i % 7 === 0 ? '#ff6b9d' : '#ffffff');
      ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;
  }, []);

  const drawComet = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, comet: any, index: number) => {
    // Update tail
    comet.tail.unshift({ x, y });
    if (comet.tail.length > 20) comet.tail.pop();

    // Draw tail
    ctx.strokeStyle = index === 0 ? '#87CEEB' : index === 1 ? '#FFD700' : '#98FB98';
    ctx.lineWidth = 3;
    for (let i = 0; i < comet.tail.length - 1; i++) {
      const alpha = (comet.tail.length - i) / comet.tail.length;
      ctx.globalAlpha = alpha * 0.8;
      ctx.beginPath();
      ctx.moveTo(comet.tail[i].x, comet.tail[i].y);
      ctx.lineTo(comet.tail[i + 1].x, comet.tail[i + 1].y);
      ctx.stroke();
    }

    // Draw coma (glowing head)
    ctx.globalAlpha = 1;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, comet.size * 8);
    gradient.addColorStop(0, ctx.strokeStyle + 'AA');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - comet.size * 8, y - comet.size * 8, comet.size * 16, comet.size * 16);

    // Draw nucleus
    ctx.fillStyle = '#FFFACD';
    ctx.beginPath();
    ctx.arc(x, y, comet.size, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const drawAsteroidBelt = useCallback((ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    ctx.fillStyle = '#8B4513';
    asteroids.current.forEach(asteroid => {
      const x = centerX + Math.cos(asteroid.angle) * asteroid.distance * zoomLevel;
      const y = centerY + Math.sin(asteroid.angle) * asteroid.distance * zoomLevel;
      
      if (isPlaying) {
        asteroid.angle += asteroid.speed * speed;
      }

      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(x, y, asteroid.size * zoomLevel, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }, [isPlaying, speed, zoomLevel]);

  const drawPlanet = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, name: string, showRings = false) => {
    // Enhanced planet glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
    gradient.addColorStop(0, color + '60');
    gradient.addColorStop(0.5, color + '20');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - size * 3, y - size * 3, size * 6, size * 6);

    // Planet body with enhanced shading
    const planetGradient = ctx.createRadialGradient(x - size/2, y - size/2, 0, x, y, size);
    planetGradient.addColorStop(0, color + 'FF');
    planetGradient.addColorStop(0.7, color + 'CC');
    planetGradient.addColorStop(1, color + '66');
    ctx.fillStyle = planetGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Enhanced Saturn's rings
    if (showRings && name === 'saturn') {
      const ringColors = ['#FAD5A5', '#E6C79A', '#D4B896'];
      ringColors.forEach((ringColor, i) => {
        ctx.strokeStyle = ringColor + 'CC';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y, size * (1.6 + i * 0.3), size * (0.2 + i * 0.05), 0, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

    // Planet surface details
    if (name === 'jupiter') {
      // Great Red Spot
      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      ctx.ellipse(x + size * 0.3, y, size * 0.3, size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Planet highlight
    ctx.fillStyle = '#FFFFFF40';
    ctx.beginPath();
    ctx.arc(x - size/2, y - size/2, size/3, 0, Math.PI * 2);
    ctx.fill();

    // Planet label with enhanced styling
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.max(10, size/2)}px Arial`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText(solarSystemData[name as keyof typeof solarSystemData].name, x, y + size + 20);
    ctx.fillText(solarSystemData[name as keyof typeof solarSystemData].name, x, y + size + 20);
  }, []);

  const drawSun = useCallback((ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    const time = Date.now() * 0.001;
    
    // Enhanced sun corona with multiple layers
    for (let i = 0; i < 5; i++) {
      const radius = 30 + i * 12 + Math.sin(time * 0.5 + i) * 8;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      const alpha = Math.floor(60 - i * 8).toString(16).padStart(2, '0');
      gradient.addColorStop(0, '#FDB813' + alpha);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
    }

    // Sun body with more detail
    const sunGradient = ctx.createRadialGradient(centerX - 8, centerY - 8, 0, centerX, centerY, 25);
    sunGradient.addColorStop(0, '#FFFF99');
    sunGradient.addColorStop(0.3, '#FFE135');
    sunGradient.addColorStop(0.7, '#FDB813');
    sunGradient.addColorStop(1, '#FF8C00');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
    ctx.fill();

    // Enhanced solar flares
    ctx.strokeStyle = '#FFE135';
    ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time * 0.3;
      const flareLength = 45 + Math.sin(time * 3 + i) * 15;
      const x1 = centerX + Math.cos(angle) * 30;
      const y1 = centerY + Math.sin(angle) * 30;
      const x2 = centerX + Math.cos(angle) * flareLength;
      const y2 = centerY + Math.sin(angle) * flareLength;
      
      ctx.globalAlpha = 0.8 + Math.sin(time * 2 + i) * 0.2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Solar surface texture
    ctx.fillStyle = '#FF6B35';
    for (let i = 0; i < 8; i++) {
      const spotAngle = Math.random() * Math.PI * 2;
      const spotDistance = Math.random() * 15;
      const spotSize = 1 + Math.random() * 3;
      const spotX = centerX + Math.cos(spotAngle) * spotDistance;
      const spotY = centerY + Math.sin(spotAngle) * spotDistance;
      ctx.beginPath();
      ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Enhanced space background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(canvas.width, canvas.height));
    bgGradient.addColorStop(0, '#0a0a1a');
    bgGradient.addColorStop(0.5, '#1a0a2e');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw enhanced star field
    drawEnhancedStarField(ctx, canvas.width, canvas.height);

    // Update planet positions
    if (isPlaying) {
      Object.entries(planets.current).forEach(([name, planet]) => {
        planet.angle += planet.speed * speed;
      });
      cameraAngleRef.current += 0.0002 * speed;
    }

    // Draw orbital paths with enhanced styling
    Object.entries(planets.current).forEach(([name, planet]) => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#ffffff08');
      gradient.addColorStop(0.5, '#ffffff15');
      gradient.addColorStop(1, '#ffffff08');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 10]);
      ctx.beginPath();
      ctx.arc(centerX + cameraX, centerY + cameraY, planet.distance * zoomLevel, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw asteroid belt
    drawAsteroidBelt(ctx, centerX, centerY);

    // Draw sun
    drawSun(ctx, centerX, centerY);

    // Draw planets
    Object.entries(planets.current).forEach(([name, planet]) => {
      const adjustedDistance = planet.distance * zoomLevel;
      const x = centerX + Math.cos(planet.angle + cameraAngleRef.current) * adjustedDistance;
      const y = centerY + Math.sin(planet.angle + cameraAngleRef.current) * adjustedDistance;
      const planetData = solarSystemData[name as keyof typeof solarSystemData];
      
      drawPlanet(ctx, x, y, planet.size * zoomLevel, planetData.color, name, name === 'saturn');
    });

    // Draw comets
    if (showComets) {
      comets.current.forEach((comet, index) => {
        if (isPlaying) {
          comet.angle += comet.speed * speed;
        }
        
        const x = centerX + Math.cos(comet.angle) * comet.distance * zoomLevel;
        const y = centerY + Math.sin(comet.angle) * comet.distance * zoomLevel;
        
        drawComet(ctx, x, y, comet, index);
      });
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, speed, zoomLevel, showComets, drawSun, drawPlanet, drawEnhancedStarField, drawAsteroidBelt, drawComet]);

  useEffect(() => {
    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Check if click is on sun
    const sunDistance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    if (sunDistance <= 30) {
      setSelectedPlanet('sun');
      setSelectedComet(null);
      return;
    }

    // Check if click is on any planet
    Object.entries(planets.current).forEach(([name, planet]) => {
      const adjustedDistance = planet.distance * zoomLevel;
      const planetX = centerX + Math.cos(planet.angle + cameraAngleRef.current) * adjustedDistance;
      const planetY = centerY + Math.sin(planet.angle + cameraAngleRef.current) * adjustedDistance;
      const distance = Math.sqrt((x - planetX) ** 2 + (y - planetY) ** 2);
      
      if (distance <= planet.size * zoomLevel + 15) {
        setSelectedPlanet(name);
        setSelectedComet(null);
      }
    });

    // Check if click is on any comet
    if (showComets) {
      comets.current.forEach((comet, index) => {
        const cometX = centerX + Math.cos(comet.angle) * comet.distance * zoomLevel;
        const cometY = centerY + Math.sin(comet.angle) * comet.distance * zoomLevel;
        const distance = Math.sqrt((x - cometX) ** 2 + (y - cometY) ** 2);
        
        if (distance <= comet.size * 8) {
          setSelectedComet(index);
          setSelectedPlanet(null);
        }
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-orange-400';
      case 'expert': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const { setIsIntroScreen } = useGameStore();

  // Mouse drag handlers for free camera movement
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.button === 0) { // Left mouse button only
      setIsDragging(true);
      setLastMouseX(event.clientX);
      setLastMouseY(event.clientY);
    }
  };

  // Handle back button click to go to home screen
  const handleBackToHome = () => {
    // Assuming setIsIntroScreen(false) goes to home screen
    setIsIntroScreen(false);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const deltaX = event.clientX - lastMouseX;
      const deltaY = event.clientY - lastMouseY;
      setCameraX(prev => prev + deltaX * 0.5); // Scale movement
      setCameraY(prev => prev + deltaY * 0.5);
      setLastMouseX(event.clientX);
      setLastMouseY(event.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Enhanced Header */}
      <div className="relative z-10 bg-gradient-to-r from-black/80 via-purple-900/30 to-black/80 backdrop-blur-sm border-b border-purple-500/30 p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2 sm:gap-0">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 w-full sm:w-auto"
          >
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent text-center sm:text-left">
              🌌 MiniVerse Galaxy
            </h1>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>Interactive Universe</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Gamepad2 className="w-4 h-4 text-green-400" />
                <span>Gaming Hub</span>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-center sm:justify-end">
            {/* Enhanced Controls */}
            <div className="flex items-center space-x-3 bg-black/40 rounded-xl p-3 border border-purple-500/20">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all transform hover:scale-105"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-300">Speed:</span>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-purple-300 w-8">{speed.toFixed(1)}x</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-300">Zoom:</span>
                <input
                  type="range"
                  min="0.3"
                  max="2.5"
                  step="0.1"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                  className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-blue-300 w-8">{zoomLevel.toFixed(1)}x</span>
              </div>

              <button
                onClick={() => setShowComets(!showComets)}
                className={`p-2 rounded-lg transition-all ${showComets ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                title="Toggle Comets"
              >
                ☄️
              </button>

              <button
                onClick={() => {
                  Object.values(planets.current).forEach(planet => planet.angle = Math.random() * Math.PI * 2);
                  cameraAngleRef.current = 0;
                  setCameraX(0);
                  setCameraY(0);
                  setSpeed(0.3);
                  setZoomLevel(0.8);
                }}
                className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowGames(!showGames)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${showGames ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Games</span>
            </button>

            <button
              onClick={handleBackToHome}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 rounded-lg transition-all font-medium transform hover:scale-105"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp} // Stop dragging when mouse leaves canvas
          className={`absolute inset-0 w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        />

        {/* Planet Info Panel */}
        <AnimatePresence>
          {selectedPlanet && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
            className="absolute top-0 left-0 w-96 h-full bg-gradient-to-b from-black/95 via-purple-900/20 to-black/95 backdrop-blur-lg border-r border-purple-500/30 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
                    {solarSystemData[selectedPlanet as keyof typeof solarSystemData].name}
                  </h2>
                  <button
                    onClick={() => setSelectedPlanet(null)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Planet Visual */}
                <div
                  className="w-full h-48 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${solarSystemData[selectedPlanet as keyof typeof solarSystemData].color}20, ${solarSystemData[selectedPlanet as keyof typeof solarSystemData].color}10)`,
                    border: `2px solid ${solarSystemData[selectedPlanet as keyof typeof solarSystemData].color}40`
                  }}
                >
                  {(solarSystemData[selectedPlanet as keyof typeof solarSystemData] as any).image ? (
                    <img
                      src={(solarSystemData[selectedPlanet as keyof typeof solarSystemData] as any).image}
                      alt={`${solarSystemData[selectedPlanet as keyof typeof solarSystemData].name} planet`}
                      className="w-full h-full object-cover rounded-xl"

                    />
                  ) : (
                    <span className="text-6xl">🪐</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-xl"></div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-lg p-3 border border-purple-500/20">
                    <h4 className="font-medium text-purple-300 mb-1">Type</h4>
                    <p className="text-sm text-gray-300">
                      {solarSystemData[selectedPlanet as keyof typeof solarSystemData].type}
                    </p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-orange-500/20">
                    <h4 className="font-medium text-orange-300 mb-1">Discovery</h4>
                    <p className="text-sm text-gray-300">
                      {solarSystemData[selectedPlanet as keyof typeof solarSystemData].discoveryYear}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-black/20 rounded-lg p-4 border border-blue-500/20">
                  <h3 className="text-lg font-semibold mb-2 text-blue-300">Description</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {solarSystemData[selectedPlanet as keyof typeof solarSystemData].description}
                  </p>
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-purple-900/20 to-transparent rounded-lg p-3 border border-purple-500/20">
                    <h4 className="font-medium text-purple-300 mb-1">Diameter</h4>
                    <p className="text-sm text-gray-300">
                      {solarSystemData[selectedPlanet as keyof typeof solarSystemData].diameter}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-900/20 to-transparent rounded-lg p-3 border border-orange-500/20">
                    <h4 className="font-medium text-orange-300 mb-1">Mass</h4>
                    <p className="text-sm text-gray-300">
                      {solarSystemData[selectedPlanet as keyof typeof solarSystemData].mass}
                    </p>
                  </div>
                  {'distance' in solarSystemData[selectedPlanet as keyof typeof solarSystemData] && (
                    <>
                      <div className="bg-gradient-to-br from-blue-900/20 to-transparent rounded-lg p-3 border border-blue-500/20">
                        <h4 className="font-medium text-blue-300 mb-1">Distance</h4>
                        <p className="text-sm text-gray-300">
                          {(solarSystemData[selectedPlanet as keyof typeof solarSystemData] as any).distance || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-green-900/20 to-transparent rounded-lg p-3 border border-green-500/20">
                        <h4 className="font-medium text-green-300 mb-1">Moons</h4>
                        <p className="text-sm text-gray-300">
                          {solarSystemData[selectedPlanet as keyof typeof solarSystemData].moons}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-900/20 to-transparent rounded-lg p-3 border border-yellow-500/20">
                        <h4 className="font-medium text-yellow-300 mb-1">Day</h4>
                        <p className="text-sm text-gray-300">
                          {(solarSystemData[selectedPlanet as keyof typeof solarSystemData] as any).day || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-pink-900/20 to-transparent rounded-lg p-3 border border-pink-500/20">
                        <h4 className="font-medium text-pink-300 mb-1">Year</h4>
                        <p className="text-sm text-gray-300">
                          {(solarSystemData[selectedPlanet as keyof typeof solarSystemData] as any).year || 'N/A'}
                        </p>
                      </div>
                      {'orbitalSpeed' in solarSystemData[selectedPlanet as keyof typeof solarSystemData] && (
                        <div className="bg-gradient-to-br from-red-900/20 to-transparent rounded-lg p-3 border border-red-500/20">
                          <h4 className="font-medium text-red-300 mb-1">Orbital Speed</h4>
                          <p className="text-sm text-gray-300">
                            {(solarSystemData[selectedPlanet as keyof typeof solarSystemData] as any).orbitalSpeed || 'N/A'}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Composition */}
                <div className="bg-black/20 rounded-lg p-4 border border-green-500/20">
                  <h3 className="text-lg font-semibold mb-2 text-green-300">Composition</h3>
                  <p className="text-sm text-gray-300">
                    {solarSystemData[selectedPlanet as keyof typeof solarSystemData].composition}
                  </p>
                </div>

                {/* Amazing Facts */}
                <div className="bg-black/20 rounded-lg p-4 border border-yellow-500/20">
                  <h3 className="text-lg font-semibold mb-3 text-yellow-300">🌟 Amazing Facts</h3>
                  <ul className="space-y-3">
                    {solarSystemData[selectedPlanet as keyof typeof solarSystemData].facts.map((fact, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3 text-gray-300 bg-gradient-to-r from-yellow-900/10 to-transparent rounded-lg p-2"
                      >
                        <span className="text-yellow-400 mt-1 text-xs">✨</span>
                        <span className="text-sm leading-relaxed">{fact}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comet Info Panel */}
        <AnimatePresence>
          {selectedComet !== null && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute top-0 left-0 w-96 h-full bg-gradient-to-b from-black/95 via-blue-900/20 to-black/95 backdrop-blur-lg border-r border-blue-500/30 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {historicComets[selectedComet].name}
                  </h2>
                  <button
                    onClick={() => setSelectedComet(null)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Comet Visual */}
                <div
                  className="w-full h-48 rounded-xl flex items-center justify-center relative overflow-hidden border-2"
                  style={{
                    background: `radial-gradient(ellipse 80% 30% at 20% 50%, ${historicComets[selectedComet].color}60, transparent), radial-gradient(circle at 20% 50%, ${historicComets[selectedComet].color}40, transparent)`,
                    borderColor: `${historicComets[selectedComet].color}60`
                  }}
                >
                  {historicComets[selectedComet].image ? (
                    <img
                      src={historicComets[selectedComet].image}
                      alt={`${historicComets[selectedComet].name} comet`}
                      className="w-full h-full object-cover rounded-xl"

                    />
                  ) : (
                    <span className="text-4xl">☄️</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl"></div>
                </div>

                <div className="bg-black/20 rounded-lg p-4 border border-cyan-500/20">
                  <h3 className="text-lg font-semibold mb-2 text-cyan-300">Description</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {historicComets[selectedComet].description}
                  </p>
                </div>

                {/* Comet Stats */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-gradient-to-br from-blue-900/20 to-transparent rounded-lg p-3 border border-blue-500/20">
                    <h4 className="font-medium text-blue-300 mb-1">Orbital Period</h4>
                    <p className="text-sm text-gray-300">{historicComets[selectedComet].period}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-900/20 to-transparent rounded-lg p-3 border border-green-500/20">
                    <h4 className="font-medium text-green-300 mb-1">Last Seen</h4>
                    <p className="text-sm text-gray-300">{historicComets[selectedComet].lastSeen}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-900/20 to-transparent rounded-lg p-3 border border-purple-500/20">
                    <h4 className="font-medium text-purple-300 mb-1">Next Visible</h4>
                    <p className="text-sm text-gray-300">{historicComets[selectedComet].nextVisible}</p>
                  </div>
                </div>

                {/* Comet Facts */}
                <div className="bg-black/20 rounded-lg p-4 border border-yellow-500/20">
                  <h3 className="text-lg font-semibold mb-3 text-yellow-300">✨ Fascinating Facts</h3>
                  <ul className="space-y-3">
                    {historicComets[selectedComet].facts.map((fact, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3 text-gray-300 bg-gradient-to-r from-cyan-900/10 to-transparent rounded-lg p-2"
                      >
                        <span className="text-cyan-400 mt-1 text-xs">⭐</span>
                        <span className="text-sm leading-relaxed">{fact}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Games Panel */}
        <AnimatePresence>
          {showGames && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute top-0 left-0 w-96 h-full bg-gradient-to-b from-black/95 via-green-900/20 to-black/95 backdrop-blur-lg border-r border-green-500/30 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    🎮 MiniVerse Games
                  </h2>
                  <button
                    onClick={() => setShowGames(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {Object.entries(gameCategories).map(([categoryKey, category]) => (
                    <motion.div
                      key={categoryKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-black/30 rounded-xl p-4 border border-gray-700"
                    >
                      <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                        <span className="text-2xl">{category.icon}</span>
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          {category.name}
                        </span>
                      </h3>
                      
                      <div className="space-y-3">
                        {category.games.map((game, gameIndex) => (
                          <motion.div
                            key={gameIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: gameIndex * 0.1 }}
                            className="flex items-center justify-between bg-black/40 rounded-lg p-3 hover:bg-black/60 transition-all cursor-pointer border border-gray-600 hover:border-purple-500/50 group"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-xl group-hover:scale-110 transition-transform">{game.icon}</span>
                              <div>
                                <div className="font-medium text-white group-hover:text-purple-300 transition-colors">
                                  {game.name}
                                </div>
                                <div className="text-xs text-gray-400">{game.description}</div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <div className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(game.difficulty)} bg-gray-800`}>
                                {game.difficulty}
                              </div>
                              {game.points > 0 && (
                                <div className="flex items-center space-x-1 text-xs text-yellow-400">
                                  <Trophy className="w-3 h-3" />
                                  <span>{game.points}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Game Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-500/30 mt-6"
                >
                  <h3 className="text-lg font-semibold mb-3 text-purple-300">🏆 Your Gaming Stats</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">15</div>
                      <div className="text-xs text-gray-400">Games Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">6,687</div>
                      <div className="text-xs text-gray-400">Total Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">5</div>
                      <div className="text-xs text-gray-400">Categories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">∞</div>
                      <div className="text-xs text-gray-400">Fun Factor</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Instructions Overlay */}
        {!selectedPlanet && !selectedComet && !showGames && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-auto bg-black/80 backdrop-blur-lg rounded-xl p-3 sm:p-4 max-w-md border border-purple-500/30"
          >
            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <h3 className="font-semibold text-sm sm:text-base text-purple-300">🌟 Galactic Explorer Guide</h3>
            </div>
            <ul className="text-xs sm:text-sm text-gray-300 space-y-1 sm:space-y-2">
              <li className="flex items-center space-x-2">
                <span className="text-blue-400">🪐</span>
                <span>Click planets to discover amazing facts</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-yellow-400">☄️</span>
                <span>Click comets to learn about historic visitors</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-400">🎮</span>
                <span>Explore 15+ games across 5 categories</span>
              </li>
              <li className="hidden sm:flex items-center space-x-2">
                <span className="text-purple-400">⚙️</span>
                <span>Use controls to customize speed, zoom, and comets</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-orange-400">🌌</span>
                <span>Watch real-time orbital mechanics with asteroids</span>
              </li>
            </ul>
          </motion.div>
        )}

        {/* Combined Navigation Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-lg rounded-full px-6 py-3 border border-purple-500/30 flex items-center space-x-8"
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-300">Live Simulation</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-400">8</div>
              <div className="text-xs text-gray-400">Planets</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">Thousands+</div>
              <div className="text-xs text-gray-400">Comets</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">~1,000,000+</div>
              <div className="text-xs text-gray-400">Asteroids</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">15</div>
              <div className="text-xs text-gray-400">Games</div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">4.6B Years</div>
            <div className="text-xs text-gray-400">System Age</div>
          </div>
        </motion.div>

        {/* Comet Tracker */}
        {showComets && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-40 right-6 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-blue-500/30 max-w-xs"
          >
            <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center space-x-1">
              <span>☄️</span>
              <span>Active Comets</span>
            </h4>
            <div className="space-y-1 text-xs text-gray-300">
              {historicComets.map((comet, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{comet.name}</span>
                  <div className="flex items-center space-x-1">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: comet.color }}
                    ></div>
                    <span className="text-gray-400">{comet.period}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Performance Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-6 right-6 bg-black/70 backdrop-blur-sm rounded-lg p-2 border border-gray-600"
        >
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>60 FPS</span>
            <Target className="w-3 h-3 text-green-400" />
            <span className="text-green-400">Optimized</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EnhancedIntroScreen;
