/**
 * PlatonicLab — Kepler Polyhedral Synthesizer
 * Maps Platonic solids to harmonic structures based on Kepler's Harmonices Mundi.
 * Each solid produces a unique chord derived from its geometric proportions.
 */
window.PlatonicKeplerSynth = (() => {
    'use strict';

    const Audio = window.PlatonicAudio;

    // Kepler's harmonic ratios per solid, derived from geometric proportions
    // and the inscribed/circumscribed sphere ratios
    const SOLID_HARMONICS = {
        tetrahedron: {
            name: 'Tetraedro',
            element: 'Fuego',
            character: 'Penetrante, angular',
            waveform: 'sawtooth',
            baseNote: 'C4',
            // 4 vertices → 4-note chord. Ratios from face angles (60°) and dihedral (70.53°)
            ratios: [1, 9/8, 5/4, 3/2],
            // Major triad + 9th feel, bright and sharp like fire
            filterFreq: 4000,
            attack: 0.02,
            decay: 0.1,
            sustain: 0.7,
        },
        cube: {
            name: 'Cubo',
            element: 'Tierra',
            character: 'Estable, fundamental',
            waveform: 'triangle',
            baseNote: 'G3',
            // 8 vertices, 6 faces → rich chord. Based on right-angle stability
            ratios: [1, 9/8, 4/3, 3/2, 15/8, 2],
            // Mixolydian feel, grounded
            filterFreq: 2500,
            attack: 0.12,
            decay: 0.2,
            sustain: 0.8,
        },
        octahedron: {
            name: 'Octaedro',
            element: 'Aire',
            character: 'Flotante, etéreo',
            waveform: 'sine',
            baseNote: 'E4',
            // Dual of cube. 6 vertices → 6-note chord. Light, airy intervals
            ratios: [1, 9/8, 5/4, 3/2, 27/16, 2],
            // Lydian brightness
            filterFreq: 5000,
            attack: 0.15,
            decay: 0.3,
            sustain: 0.65,
        },
        dodecahedron: {
            name: 'Dodecaedro',
            element: 'Éter',
            character: 'Cósmico, misterioso',
            waveform: 'triangle',
            baseNote: 'A3',
            // 20 vertices, 12 pentagonal faces → rich harmonic. Golden ratio connections
            ratios: [1, 9/8, 5/4, 4/3, 3/2, 8/5, 15/8, 2],
            // Full major scale with φ-influenced voicing
            filterFreq: 3500,
            attack: 0.2,
            decay: 0.4,
            sustain: 0.75,
        },
        icosahedron: {
            name: 'Icosaedro',
            element: 'Agua',
            character: 'Fluido, adaptivo',
            waveform: 'sine',
            baseNote: 'F4',
            // Dual of dodecahedron. 12 vertices → flowing intervals
            ratios: [1, 9/8, 5/4, 3/2, 27/16, 2],
            // Smooth, wave-like
            filterFreq: 3000,
            attack: 0.18,
            decay: 0.25,
            sustain: 0.7,
        },
    };

    // Note name → frequency
    const NOTE_FREQS = {
        'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    };

    const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    let currentSolid = null;
    let currentVoices = [];
    let isPlaying = false;
    let baseFreqOverride = null;
    let waveformOverride = null;
    let arpeggioInterval = null;
    let arpeggioMode = 'chord'; // 'chord' | 'arpeggio' | 'sequence'

    function getBaseFreq(solidKey) {
        if (baseFreqOverride) return baseFreqOverride;
        const h = SOLID_HARMONICS[solidKey];
        return NOTE_FREQS[h.baseNote] || 261.63;
    }

    function getWaveform(solidKey) {
        if (waveformOverride) return waveformOverride;
        return SOLID_HARMONICS[solidKey].waveform;
    }

    function freqToNoteName(freq) {
        const midi = Math.round(69 + 12 * Math.log2(freq / 440));
        const note = ALL_NOTES[((midi % 12) + 12) % 12];
        const octave = Math.floor(midi / 12) - 1;
        return note + octave;
    }

    /**
     * Play the harmonic chord for a solid.
     */
    function play(solidKey) {
        stop();
        Audio.init();
        Audio.resume();

        const h = SOLID_HARMONICS[solidKey];
        if (!h) return null;

        currentSolid = solidKey;
        const baseFreq = getBaseFreq(solidKey);
        const waveform = getWaveform(solidKey);
        const frequencies = h.ratios.map(r => baseFreq * r);

        if (arpeggioMode === 'chord') {
            currentVoices = Audio.playChord(frequencies, {
                type: waveform,
                gain: 0.15,
                attack: h.attack,
                decay: h.decay,
                sustain: h.sustain,
                release: 1.2,
                filterFreq: h.filterFreq,
                spread: 0.5,
                stagger: 0.04,
            });
        } else if (arpeggioMode === 'arpeggio') {
            let idx = 0;
            const playNext = () => {
                const freq = frequencies[idx % frequencies.length];
                Audio.playNote(freq, {
                    type: waveform,
                    gain: 0.1,
                    attack: 0.02,
                    decay: 0.15,
                    sustain: 0.3,
                    release: 0.4,
                    duration: 0.35,
                    filterFreq: h.filterFreq,
                    pan: ((idx % frequencies.length) / frequencies.length - 0.5) * 0.8,
                });
                idx++;
            };
            playNext();
            arpeggioInterval = setInterval(playNext, 280);
        } else if (arpeggioMode === 'sequence') {
            let idx = 0;
            const playNext = () => {
                if (idx >= frequencies.length) {
                    clearInterval(arpeggioInterval);
                    arpeggioInterval = null;
                    isPlaying = false;
                    return;
                }
                Audio.playNote(frequencies[idx], {
                    type: waveform,
                    gain: 0.12,
                    attack: 0.04,
                    decay: 0.2,
                    sustain: 0.4,
                    release: 0.5,
                    duration: 0.5,
                    filterFreq: h.filterFreq,
                });
                idx++;
            };
            playNext();
            arpeggioInterval = setInterval(playNext, 400);
        }

        isPlaying = true;

        return {
            name: h.name,
            element: h.element,
            character: h.character,
            waveform,
            baseFreq,
            frequencies,
            notes: frequencies.map(freqToNoteName),
            ratios: h.ratios,
        };
    }

    /**
     * Play a single vertex note (for hover/click interactions).
     */
    function playVertexNote(solidKey, vertexIndex) {
        Audio.init();
        Audio.resume();

        const h = SOLID_HARMONICS[solidKey];
        if (!h) return;

        const baseFreq = getBaseFreq(solidKey);
        const ratioIdx = vertexIndex % h.ratios.length;
        const freq = baseFreq * h.ratios[ratioIdx];

        Audio.playNote(freq, {
            type: getWaveform(solidKey),
            gain: 0.08,
            attack: 0.01,
            decay: 0.1,
            sustain: 0.3,
            release: 0.4,
            duration: 0.5,
            filterFreq: h.filterFreq,
        });
    }

    /**
     * Play a transition sound when switching solids.
     */
    function playTransition(fromSolid, toSolid) {
        Audio.init();
        Audio.resume();

        const hFrom = SOLID_HARMONICS[fromSolid];
        const hTo = SOLID_HARMONICS[toSolid];
        if (!hFrom || !hTo) return;

        const baseFrom = getBaseFreq(fromSolid);
        const baseTo = getBaseFreq(toSolid);

        // Quick fade-out of old fundamental, fade-in of new
        Audio.playNote(baseFrom, {
            type: 'sine',
            gain: 0.06,
            attack: 0.01,
            decay: 0.15,
            sustain: 0,
            release: 0.01,
            duration: 0.2,
            reverb: true,
        });

        setTimeout(() => {
            Audio.playNote(baseTo, {
                type: 'sine',
                gain: 0.08,
                attack: 0.05,
                decay: 0.2,
                sustain: 0.3,
                release: 0.5,
                duration: 0.6,
                reverb: true,
            });
        }, 150);
    }

    function stop() {
        if (arpeggioInterval) {
            clearInterval(arpeggioInterval);
            arpeggioInterval = null;
        }
        Audio.stopAll(0.4);
        currentVoices = [];
        isPlaying = false;
    }

    function setBaseFreq(freq) { baseFreqOverride = freq > 0 ? freq : null; }
    function setWaveformOverride(type) { waveformOverride = type || null; }
    function setMode(mode) { arpeggioMode = mode; }
    function getMode() { return arpeggioMode; }
    function getIsPlaying() { return isPlaying; }
    function getSolidHarmonics(key) { return SOLID_HARMONICS[key]; }
    function getAllHarmonics() { return SOLID_HARMONICS; }

    /**
     * Get info about the current chord without playing.
     */
    function getChordInfo(solidKey) {
        const h = SOLID_HARMONICS[solidKey];
        if (!h) return null;
        const baseFreq = getBaseFreq(solidKey);
        const frequencies = h.ratios.map(r => baseFreq * r);
        return {
            name: h.name,
            element: h.element,
            character: h.character,
            waveform: getWaveform(solidKey),
            baseFreq,
            frequencies,
            notes: frequencies.map(freqToNoteName),
            ratios: h.ratios,
            ratioNames: h.ratios.map(r => {
                // Find simple fraction
                for (let d = 1; d <= 16; d++) {
                    const n = r * d;
                    if (Math.abs(n - Math.round(n)) < 0.001) {
                        return `${Math.round(n)}/${d}`;
                    }
                }
                return r.toFixed(3);
            }),
        };
    }

    return {
        play,
        stop,
        playVertexNote,
        playTransition,
        setBaseFreq,
        setWaveformOverride,
        setMode,
        getMode,
        getIsPlaying,
        getSolidHarmonics,
        getAllHarmonics,
        getChordInfo,
        freqToNoteName,
    };
})();
