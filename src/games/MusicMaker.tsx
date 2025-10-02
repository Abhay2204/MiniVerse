import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, Download, Upload, Mic, MicOff } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

interface Note {
  id: string;
  frequency: number;
  name: string;
  color: string;
  octave: number;
}

interface Beat {
  time: number;
  note: string;
  velocity: number;
  duration: number;
}

interface Pattern {
  name: string;
  sequence: Beat[];
  bpm: number;
}

const MusicMaker: React.FC = () => {
  const { setCurrentGame, updateScore } = useGameStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [sequence, setSequence] = useState<Beat[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [selectedOctave, setSelectedOctave] = useState(4);
  const [selectedInstrument, setSelectedInstrument] = useState<OscillatorType>('sine');
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [sustainMode, setSustainMode] = useState(false);
  const [sustainedNotes, setSustainedNotes] = useState<Map<string, { oscillator: OscillatorNode, gainNode: GainNode }>>(new Map());
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [loopMode, setLoopMode] = useState(false);
  const [metronome, setMetronome] = useState(false);
  const [quantizeMode, setQuantizeMode] = useState(true);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTime = useRef<number>(0);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const metronomeRef = useRef<NodeJS.Timeout | null>(null);

  const baseNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const colors = [
    'bg-red-500', 'bg-red-600', 'bg-orange-500', 'bg-orange-600', 
    'bg-yellow-500', 'bg-green-500', 'bg-green-600', 'bg-blue-500', 
    'bg-blue-600', 'bg-indigo-500', 'bg-indigo-600', 'bg-purple-500'
  ];

  const generateNotes = useCallback((): Note[] => {
    return baseNotes.map((noteName, index) => {
      const frequency = 440 * Math.pow(2, (selectedOctave - 4) + (index - 9) / 12);
      return {
        id: `${noteName}${selectedOctave}`,
        frequency,
        name: noteName,
        color: colors[index],
        octave: selectedOctave
      };
    });
  }, [selectedOctave]);

  const notes = generateNotes();

  const instruments: { name: string; type: OscillatorType }[] = [
    { name: 'Sine', type: 'sine' },
    { name: 'Square', type: 'square' },
    { name: 'Sawtooth', type: 'sawtooth' },
    { name: 'Triangle', type: 'triangle' }
  ];

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext!;
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const playNote = useCallback((frequency: number, duration: number = 0.3, velocity: number = 1, noteId?: string) => {
    initAudioContext();
    const audioContext = audioContextRef.current;
    if (!audioContext) return null;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filterNode = audioContext.createBiquadFilter();
    
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = selectedInstrument;
    
    // Add some filter sweep for more interesting sound
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(frequency * 4, audioContext.currentTime);
    filterNode.frequency.exponentialRampToValueAtTime(frequency * 2, audioContext.currentTime + duration * 0.3);
    
    const finalVolume = volume * velocity;
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(finalVolume, audioContext.currentTime + 0.01);
    
    if (!sustainMode) {
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } else if (noteId) {
      oscillator.start(audioContext.currentTime);
      return { oscillator, gainNode };
    } else {
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    }
    
    return null;
  }, [initAudioContext, selectedInstrument, volume, sustainMode]);

  const quantizeTime = useCallback((time: number): number => {
    if (!quantizeMode) return time;
    const beatLength = 60000 / bpm / 4; // 16th note
    return Math.round(time / beatLength) * beatLength;
  }, [quantizeMode, bpm]);

  const handleNoteClick = useCallback((note: Note) => {
    const noteId = note.id;
    
    if (sustainMode) {
      if (sustainedNotes.has(noteId)) {
        // Stop sustained note
        const { oscillator, gainNode } = sustainedNotes.get(noteId)!;
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current!.currentTime + 0.1);
        oscillator.stop(audioContextRef.current!.currentTime + 0.2);
        setSustainedNotes(prev => {
          const newMap = new Map(prev);
          newMap.delete(noteId);
          return newMap;
        });
        setActiveNotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(noteId);
          return newSet;
        });
      } else {
        // Start sustained note
        const nodes = playNote(note.frequency, 0, 1, noteId);
        if (nodes) {
          setSustainedNotes(prev => new Map(prev).set(noteId, nodes));
          setActiveNotes(prev => new Set(prev).add(noteId));
        }
      }
    } else {
      playNote(note.frequency, 0.3);
      setActiveNotes(prev => new Set(prev).add(noteId));
      setTimeout(() => {
        setActiveNotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(noteId);
          return newSet;
        });
      }, 300);
    }
    
    if (isRecording) {
      const currentTime = Date.now() - recordingStartTime.current;
      const quantizedTime = quantizeTime(currentTime);
      setSequence(prev => [...prev, { 
        time: quantizedTime, 
        note: note.id, 
        velocity: Math.random() * 0.3 + 0.7, // Random velocity between 0.7-1.0
        duration: sustainMode ? 1000 : 300
      }]);
    }
  }, [sustainMode, sustainedNotes, playNote, isRecording, quantizeTime]);

  const startRecording = useCallback(() => {
    setSequence([]);
    setIsRecording(true);
    setRecordingDuration(0);
    recordingStartTime.current = Date.now();
    
    recordingTimer.current = setInterval(() => {
      setRecordingDuration(Date.now() - recordingStartTime.current);
    }, 100);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
    }
    if (sequence.length > 0) {
      const complexity = Math.min(sequence.length, 50);
      const timing = sequence.length > 1 ? Math.min(1000 / (sequence[sequence.length - 1].time - sequence[0].time) * sequence.length, 10) : 1;
      const score = Math.round(complexity * 10 + timing * 5);
      updateScore('music-maker', score);
    }
  }, [sequence, updateScore]);

  const playMetronome = useCallback(() => {
    if (!metronome || !audioContextRef.current) return;
    
    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [metronome, volume]);

  const playSequence = useCallback(() => {
    if (sequence.length === 0) return;

    setIsPlaying(true);
    setPlaybackPosition(0);

    const maxTime = Math.max(...sequence.map(s => s.time));
    const beatInterval = 60000 / bpm / 16; // More granular timing
    let beatCount = 0;

    intervalRef.current = setInterval(() => {
      const currentTime = beatCount * beatInterval;
      setPlaybackPosition(currentTime);

      // Play metronome on beat
      if (metronome && beatCount % 16 === 0) {
        playMetronome();
      }

      // Find notes that should play at this time
      const notesToPlay = sequence.filter(beat =>
        Math.abs(beat.time - currentTime) < beatInterval
      );

      notesToPlay.forEach(beat => {
        const note = notes.find(n => n.id === beat.note);
        if (note) {
          playNote(note.frequency, beat.duration / 1000, beat.velocity);
          setActiveNotes(prev => new Set(prev).add(beat.note));
          setTimeout(() => {
            setActiveNotes(prev => {
              const newSet = new Set(prev);
              newSet.delete(beat.note);
              return newSet;
            });
          }, beat.duration);
        }
      });

      beatCount++;

      // Stop or loop when we've played through the entire sequence
      if (currentTime > maxTime + 500) {
        if (loopMode) {
          beatCount = 0;
          setPlaybackPosition(0);
        } else {
          stopSequence();
        }
      }
    }, beatInterval);
  }, [sequence, bpm, metronome, playMetronome, notes, playNote, loopMode]);

  const stopSequence = useCallback(() => {
    setIsPlaying(false);
    setPlaybackPosition(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearSequence = useCallback(() => {
    setSequence([]);
    stopSequence();
    // Clear sustained notes
    sustainedNotes.forEach(({ oscillator, gainNode }) => {
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current!.currentTime + 0.1);
      oscillator.stop(audioContextRef.current!.currentTime + 0.2);
    });
    setSustainedNotes(new Map());
    setActiveNotes(new Set());
  }, [stopSequence, sustainedNotes]);

  const exportSequence = useCallback(() => {
    if (sequence.length === 0) return;
    
    const data = {
      sequence,
      bpm,
      instrument: selectedInstrument,
      volume,
      octave: selectedOctave,
      timestamp: Date.now()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmic-melody-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sequence, bpm, selectedInstrument, volume, selectedOctave]);

  const importSequence = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setSequence(data.sequence || []);
        setBpm(data.bpm || 120);
        setSelectedInstrument(data.instrument || 'sine');
        setVolume(data.volume || 0.5);
        setSelectedOctave(data.octave || 4);
      } catch (error) {
        console.error('Error importing sequence:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, []);

  const presetMelodies: Pattern[] = [
    {
      name: 'Cosmic Harmony',
      bpm: 120,
      sequence: [
        { time: 0, note: `C${selectedOctave}`, velocity: 0.8, duration: 500 },
        { time: 500, note: `E${selectedOctave}`, velocity: 0.7, duration: 500 },
        { time: 1000, note: `G${selectedOctave}`, velocity: 0.9, duration: 500 },
        { time: 1500, note: `C${selectedOctave + 1}`, velocity: 1.0, duration: 1000 }
      ]
    },
    {
      name: 'Space Waltz',
      bpm: 150,
      sequence: [
        { time: 0, note: `A${selectedOctave}`, velocity: 0.8, duration: 300 },
        { time: 400, note: `F${selectedOctave}`, velocity: 0.7, duration: 300 },
        { time: 800, note: `D${selectedOctave}`, velocity: 0.6, duration: 300 },
        { time: 1200, note: `A${selectedOctave}`, velocity: 0.9, duration: 600 }
      ]
    },
    {
      name: 'Nebula Dream',
      bpm: 90,
      sequence: [
        { time: 0, note: `D${selectedOctave}`, velocity: 0.6, duration: 800 },
        { time: 300, note: `F#${selectedOctave}`, velocity: 0.7, duration: 600 },
        { time: 600, note: `A${selectedOctave}`, velocity: 0.8, duration: 600 },
        { time: 1000, note: `D${selectedOctave + 1}`, velocity: 0.9, duration: 1000 }
      ]
    }
  ];

  const loadPreset = useCallback((pattern: Pattern) => {
    setSequence(pattern.sequence);
    setBpm(pattern.bpm);
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keyMap: { [key: string]: number } = {
        'a': 0, 'w': 1, 's': 2, 'e': 3, 'd': 4, 'f': 5, 't': 6, 'g': 7, 'y': 8, 'h': 9, 'u': 10, 'j': 11
      };
      
      const noteIndex = keyMap[event.key.toLowerCase()];
      if (noteIndex !== undefined && noteIndex < notes.length && !event.repeat) {
        handleNoteClick(notes[noteIndex]);
      }
      
      if (event.key === ' ') {
        event.preventDefault();
        if (isPlaying) {
          stopSequence();
        } else if (sequence.length > 0) {
          playSequence();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notes, handleNoteClick, isPlaying, stopSequence, playSequence, sequence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (recordingTimer.current) clearInterval(recordingTimer.current);
      if (metronomeRef.current) clearInterval(metronomeRef.current);
      sustainedNotes.forEach(({ oscillator, gainNode }) => {
        try {
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current!.currentTime + 0.1);
          oscillator.stop(audioContextRef.current!.currentTime + 0.2);
        } catch {
          // Ignore errors on cleanup
        }
      });
    };
  }, [sustainedNotes]);

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
            Music Maker
          </h1>
          
          <div className="flex space-x-2">
            <button
              onClick={clearSequence}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="bg-cosmic-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-purple-400 mb-4">Controls</h3>
            
            {/* Recording Controls */}
            <div className="mb-6">
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-colors ${
                    isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                </button>
              </div>
              
              {isRecording && (
                <div className="mb-4 text-center text-cosmic-300">
                  Recording: {(recordingDuration / 1000).toFixed(1)}s
                </div>
              )}
              
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={isPlaying ? stopSequence : playSequence}
                  disabled={sequence.length === 0}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-cosmic-600 text-white rounded-lg transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Stop' : 'Play'}</span>
                </button>
              </div>

              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setLoopMode(!loopMode)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    loopMode ? 'bg-purple-600 text-white' : 'bg-cosmic-700 text-cosmic-300'
                  }`}
                >
                  Loop
                </button>
                <button
                  onClick={() => setMetronome(!metronome)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    metronome ? 'bg-purple-600 text-white' : 'bg-cosmic-700 text-cosmic-300'
                  }`}
                >
                  Metronome
                </button>
                <button
                  onClick={() => setSustainMode(!sustainMode)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    sustainMode ? 'bg-purple-600 text-white' : 'bg-cosmic-700 text-cosmic-300'
                  }`}
                >
                  Sustain
                </button>
                <button
                  onClick={() => setQuantizeMode(!quantizeMode)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    quantizeMode ? 'bg-purple-600 text-white' : 'bg-cosmic-700 text-cosmic-300'
                  }`}
                >
                  Quantize
                </button>
              </div>
            </div>

            {/* Import/Export Controls */}
            <div className="mb-6">
              <h4 className="text-cosmic-300 mb-2">Import/Export</h4>
              <div className="flex space-x-2">
                <button
                  onClick={exportSequence}
                  disabled={sequence.length === 0}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-green-600 hover:bg-green-700 disabled:bg-cosmic-600 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <label className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSequence}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Instrument Selection */}
            <div className="mb-6">
              <label className="block text-cosmic-300 mb-2">Instrument</label>
              <select
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value as OscillatorType)}
                className="w-full bg-cosmic-700 text-cosmic-300 rounded-lg p-2"
              >
                {instruments.map(inst => (
                  <option key={inst.type} value={inst.type}>{inst.name}</option>
                ))}
              </select>
            </div>

            {/* Octave Selection */}
            <div className="mb-6">
              <label className="block text-cosmic-300 mb-2">Octave: {selectedOctave}</label>
              <input
                type="range"
                min="2"
                max="7"
                value={selectedOctave}
                onChange={(e) => setSelectedOctave(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* BPM Control */}
            <div className="mb-6">
              <label className="block text-cosmic-300 mb-2">BPM: {bpm}</label>
              <input
                type="range"
                min="60"
                max="200"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Volume Control */}
            <div className="mb-6">
              <label className="block text-cosmic-300 mb-2 flex items-center">
                <Volume2 className="w-4 h-4 mr-2" />
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Sequence Info */}
            <div className="mb-6">
              <h4 className="text-cosmic-300 mb-2">Sequence</h4>
              <div className="bg-cosmic-700 rounded-lg p-3">
                <div className="text-sm text-cosmic-400">
                  Notes: {sequence.length}
                </div>
                <div className="text-sm text-cosmic-400">
                  Duration: {sequence.length > 0 ? Math.round(Math.max(...sequence.map(s => s.time)) / 1000) : 0}s
                </div>
                {isPlaying && (
                  <div className="text-sm text-cosmic-400">
                    Position: {(playbackPosition / 1000).toFixed(1)}s
                  </div>
                )}
              </div>
            </div>

            {/* Preset Melodies */}
            <div>
              <h4 className="text-cosmic-300 mb-2">Presets</h4>
              {presetMelodies.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => loadPreset(preset)}
                  className="w-full mb-2 py-2 px-3 bg-cosmic-700 hover:bg-cosmic-600 text-cosmic-300 rounded-lg transition-colors text-left"
                >
                  {preset.name} ({preset.bpm} BPM)
                </button>
              ))}
            </div>
          </div>

          {/* Piano Keys */}
          <div className="lg:col-span-2">
            <div className="bg-cosmic-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-purple-400 mb-4">Cosmic Piano - Octave {selectedOctave}</h3>
              
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 mb-6">
                {notes.map((note) => (
                  <motion.button
                    key={note.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNoteClick(note)}
                    className={`
                      ${note.color} hover:brightness-110 text-white font-bold py-8 px-2 rounded-lg
                      transition-all duration-150 shadow-lg text-xs md:text-sm
                      ${activeNotes.has(note.id) ? 'brightness-150 scale-105' : ''}
                      ${note.name.includes('#') ? 'opacity-90' : ''}
                    `}
                  >
                    {note.name}
                  </motion.button>
                ))}
              </div>

              {/* Progress Bar */}
              {isPlaying && sequence.length > 0 && (
                <div className="mb-4">
                  <div className="bg-cosmic-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-100"
                      style={{ 
                        width: `${(playbackPosition / Math.max(...sequence.map(s => s.time))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Visual Sequencer */}
              {sequence.length > 0 && (
                <div className="bg-cosmic-700 rounded-lg p-4">
                  <h4 className="text-cosmic-300 mb-3">Your Sequence</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sequence.map((beat, index) => {
                      const note = notes.find(n => n.id === beat.note) ||
                                   baseNotes.map((name, i) => ({
                                     id: `${name}${parseInt(beat.note.slice(-1))}`,
                                     name,
                                     color: colors[i]
                                   })).find(n => n.id === beat.note);
                      const isCurrentBeat = isPlaying && Math.abs(playbackPosition - beat.time) < 200;
                      
                      return (
                        <motion.div
                          key={index}
                          animate={isCurrentBeat ? { scale: 1.2 } : { scale: 1 }}
                          style={{ filter: isCurrentBeat ? 'brightness(2)' : 'brightness(1)' }}
                          className={`
                            ${note?.color || 'bg-gray-500'} text-white px-3 py-1 rounded text-sm
                            flex flex-col items-center min-w-12
                            ${isCurrentBeat ? 'ring-2 ring-white shadow-lg' : ''}
                          `}
                        >
                          <span className="font-bold">{note?.name || '?'}</span>
                          <span className="text-xs opacity-75">{(beat.time / 1000).toFixed(1)}s</span>
                          <div
                            className="w-full bg-white bg-opacity-30 rounded-full mt-1"
                            style={{ height: '2px' }}
                          >
                            <div
                              className="bg-white rounded-full h-full"
                              style={{ width: `${beat.velocity * 100}%` }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {/* Timeline visualization */}
                  <div className="bg-cosmic-600 rounded p-2 mt-4">
                    <div className="flex items-center space-x-1 overflow-x-auto">
                      {Array.from({ length: Math.ceil(Math.max(...sequence.map(s => s.time)) / 500) }, (_, i) => (
                        <div 
                          key={i}
                          className={`flex-shrink-0 w-8 h-6 rounded flex items-center justify-center text-xs ${
                            isPlaying && playbackPosition >= i * 500 && playbackPosition < (i + 1) * 500
                              ? 'bg-purple-500 text-white' 
                              : 'bg-cosmic-700 text-cosmic-300'
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Keyboard Guide */}
              <div className="mt-6 bg-cosmic-700 rounded-lg p-4">
                <h4 className="text-cosmic-300 mb-3">Keyboard Shortcuts</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { key: 'A', note: 'C' }, { key: 'W', note: 'C#' }, { key: 'S', note: 'D' }, { key: 'E', note: 'D#' },
                    { key: 'D', note: 'E' }, { key: 'F', note: 'F' }, { key: 'T', note: 'F#' }, { key: 'G', note: 'G' },
                    { key: 'Y', note: 'G#' }, { key: 'H', note: 'A' }, { key: 'U', note: 'A#' }, { key: 'J', note: 'B' }
                  ].map(({ key, note }) => (
                    <div key={key} className="flex items-center justify-between bg-cosmic-600 rounded px-2 py-1">
                      <span className="text-cosmic-300">{key}</span>
                      <span className="text-purple-400">{note}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-cosmic-400 text-xs text-center">
                  Press SPACE to play/stop • Use keyboard keys to play notes
                </div>
              </div>

              <div className="mt-6 text-center text-cosmic-400">
                <p className="mb-2">🎵 Click the colored keys to play notes</p>
                <p className="mb-2">🎙️ Record your melodies with velocity and timing</p>
                <p className="mb-2">🎛️ Use sustain mode for held notes</p>
                <p className="mb-2">🔄 Enable quantize for perfect timing</p>
                <p>🎼 Create cosmic symphonies with different instruments and octaves!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicMaker;
