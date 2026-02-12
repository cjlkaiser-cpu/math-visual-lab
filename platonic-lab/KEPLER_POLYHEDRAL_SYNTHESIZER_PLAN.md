# Kepler Polyhedral Synthesizer

## Vision

Unificar **PlatonicLab** con **Harmonices Mundi**, conectando geometria platonica con armonia musical usando proporciones de Kepler.

```
PLATONIC-LAB + HARMONICES-MUNDI --> KEPLER POLYHEDRAL SYNTHESIZER
```

---

## Entregables

1. `js/audio-engine.js` - Web Audio API wrapper
2. `js/kepler-synth.js` - PolyhedralSynth class
3. `js/harmony-mapper.js` - Map vertices to frequencies
4. `audio/presets/platonic-harmonies.json` - Presets
5. Modificaciones en `index.html` y `js/main.js`

---

## Arquitectura

```
platonic-lab/
├── index.html              # + audio controls
├── css/styles.css          # + audio styles
├── js/
│   ├── main.js             # + audio integration
│   ├── audio-engine.js     # NUEVO
│   ├── kepler-synth.js     # NUEVO
│   └── harmony-mapper.js   # NUEVO
└── audio/presets/
    └── platonic-harmonies.json
```

---

## Fase 1: Audio Engine

```javascript
class AudioEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.oscillators = [];
    }
    
    createOscillator(type, freq, gainVal = 0.1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = gainVal;
        osc.connect(gain);
        gain.connect(this.masterGain);
        this.oscillators.push(osc);
        return { osc, gain };
    }
    
    playChord(frequencies, waveform = 'sine') {
        frequencies.forEach((f, i) => {
            const gainVal = 0.15 / frequencies.length;
            this.createOscillator(waveform, f, gainVal);
        });
        this.oscillators.forEach(o => o.start());
    }
    
    stop() {
        this.oscillators.forEach(o => { try { o.stop(); } catch(e) {} });
        this.oscillators = [];
    }
    
    resume() { this.ctx.resume(); }
    setVolume(val) { this.masterGain.gain.value = val; }
}
```

---

## Fase 2: Kepler Synthesizer

```javascript
class PolyhedralSynth {
    constructor(solidType, audioEngine) {
        this.solidType = solidType;
        this.audio = audioEngine;
        this.baseFreq = 261.63; // C4
        this.waveform = 'sine';
        this.isPlaying = false;
        
        this.keplerRatios = {
            tetrahedron: {
                name: 'Tetraedro', element: 'Fuego',
                description: 'Sharp, piercing',
                ratios: [1, 1.125, 1.25, 1.5]
            },
            cube: {
                name: 'Cubo', element: 'Tierra',
                description: 'Stable, grounded',
                ratios: [1, 1.125, 1.333, 1.5, 1.875, 2]
            },
            octahedron: {
                name: 'Octaedro', element: 'Aire',
                description: 'Flowing, ethereal',
                ratios: [1, 1.125, 1.25, 1.5, 1.6875, 2]
            },
            dodecahedron: {
                name: 'Dodecaedro', element: 'Eter',
                description: 'Cosmic, mysterious',
                ratios: [1, 1.125, 1.25, 1.333, 1.5, 1.6875, 1.875, 2]
            },
            icosahedron: {
                name: 'Icosaedro', element: 'Agua',
                description: 'Fluid, adaptive',
                ratios: [1, 1.125, 1.25, 1.5, 1.6875, 2]
            }
        };
    }
    
    play() {
        if (this.isPlaying) this.stop();
        const config = this.keplerRatios[this.solidType];
        const freqs = config.ratios.map(r => this.baseFreq * r);
        this.audio.playChord(freqs, this.waveform);
        this.isPlaying = true;
        return config;
    }
    
    stop() { this.audio.stop(); this.isPlaying = false; }
    setWaveform(type) { this.waveform = type; }
}
```

---

## Fase 3: Harmony Mapper

```javascript
class HarmonyMapper {
    static verticesToNotes(vertices, baseFreq = 261.63) {
        const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
        return vertices.map((v, i) => {
            const freq = baseFreq * Math.pow(phi, i % 12);
            return {
                vertex: v, freq,
                note: this.freqToNote(freq),
                octave: this.freqToOctave(freq)
            };
        });
    }
    
    static freqToNote(freq) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const midi = Math.round(69 + 12 * Math.log2(freq / 440));
        return notes[midi % 12];
    }
    
    static freqToOctave(freq) {
        const midi = Math.round(69 + 12 * Math.log2(freq / 440));
        return Math.floor(midi / 12) - 1;
    }
    
    static velocityToInterval(vMin, vMax, vCurrent) {
        const ratio = vCurrent / vMin;
        const intervals = [
            { name: 'Unisono', ratio: 1 },
            { name: 'Segunda menor', ratio: 1.059 },
            { name: 'Segunda mayor', ratio: 1.122 },
            { name: 'Tercera menor', ratio: 1.189 },
            { name: 'Tercera mayor', ratio: 1.260 },
            { name: 'Cuarta', ratio: 1.335 },
            { name: 'Cuarta aumentada', ratio: 1.414 },
            { name: 'Quinta', ratio: 1.498 },
            { name: 'Sexta menor', ratio: 1.587 },
            { name: 'Sexta mayor', ratio: 1.682 },
            { name: 'Septima menor', ratio: 1.782 },
            { name: 'Septima mayor', ratio: 1.888 },
            { name: 'Octava', ratio: 2 }
        ];
        let closest = intervals[0];
        let minDiff = Math.abs(ratio - closest.ratio);
        for (const interval of intervals) {
            const diff = Math.abs(ratio - interval.ratio);
            if (diff < minDiff) { minDiff = diff; closest = interval; }
        }
        return closest;
    }
}
```

---

## Fase 4: UI Integration

HTML para sidebar:
```html
<div id="audio-panel" class="panel audio-controls">
    <h3>Polyhedral Audio</h3>
    <p class="audio-subtitle">Kepler's Harmonic Synthesis</p>
    <div class="audio-buttons">
        <button id="btn-play" class="audio-btn play">Play</button>
        <button id="btn-stop" class="audio-btn stop">Stop</button>
    </div>
    <select id="waveform">
        <option value="sine">Sine</option>
        <option value="triangle">Triangle</option>
    </select>
    <input type="range" id="volume" min="0" max="1" step="0.01" value="0.5">
    <select id="preset">
        <option value="tetrahedron">Tetraedro - Fuego</option>
        <option value="cube">Cubo - Tierra</option>
        <option value="octahedron">Octaedro - Aire</option>
        <option value="dodecahedron">Dodecaedro - Eter</option>
        <option value="icosahedron">Icosaedro - Agua</option>
    </select>
    <div id="current-chord"><span class="chord-notes">--</span></div>
</div>
```

Integracion en main.js:
```javascript
let audioEngine, polyhedralSynth;

function init() {
    audioEngine = new AudioEngine();
    polyhedralSynth = new PolyhedralSynth('tetrahedron', audioEngine);
    setupAudioControls();
}

function setupAudioControls() {
    document.getElementById('btn-play').onclick = () => {
        audioEngine.resume();
        const config = polyhedralSynth.play();
        updateChordDisplay(config);
    };
    document.getElementById('btn-stop').onclick = () => {
        polyhedralSynth.stop();
        updateChordDisplay(null);
    };
}

function updateChordDisplay(config) {
    const span = document.querySelector('.chord-notes');
    if (config && config.ratios) {
        const notes = config.ratios.map(r => {
            const midi = Math.round(69 + 12 * Math.log2(261.63 * r / 440));
            return ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][midi % 12];
        });
        span.textContent = notes.join(' - ');
    } else { span.textContent = '--'; }
}
```

---

## Fase 5: Presets JSON

```json
{
    "tetrahedron": {
        "name": "Tetraedro", "element": "Fuego",
        "waveform": "sine", "baseFreq": 261.63,
        "notes": [261.63, 294.33, 329.63, 392.00],
        "chord": "C major (incomplete)"
    },
    "cube": {
        "name": "Cubo", "element": "Tierra",
        "waveform": "triangle", "baseFreq": 196.00,
        "notes": [196.00, 220.50, 261.63, 294.33, 367.50, 392.00],
        "chord": "G mixolydian"
    },
    "octahedron": {
        "name": "Octaedro", "element": "Aire",
        "waveform": "sine", "baseFreq": 329.63,
        "notes": [329.63, 370.81, 412.04, 494.45, 556.88, 659.25],
        "chord": "E major hexachord"
    },
    "dodecahedron": {
        "name": "Dodecaedro", "element": "Eter",
        "waveform": "triangle", "baseFreq": 220.00,
        "notes": [220.00, 247.50, 275.00, 293.66, 330.00, 371.25, 412.50, 440.00],
        "chord": "A major with added 9th"
    },
    "icosahedron": {
        "name": "Icosaedro", "element": "Agua",
        "waveform": "sine", "baseFreq": 349.23,
        "notes": [349.23, 392.00, 436.04, 523.25, 589.33, 698.46],
        "chord": "F major hexachord"
    }
}
```

---

## Conexion con Proyectos Existentes

| Proyecto | Link |
|----------|------|
| harmonices-mundi/ | Reutilizar formulas orbitales de Kepler |
| kepler-vs-voyager/ | Comparar armonias polyhedrales vs datos Voyager |
| contrapunctus/ | Polifonia polyhedral |
| tonnetz-atractor/ | Grids armonicos relacionados |

---

## Tiempo Estimado: 10 horas

| Fase | Tiempo |
|------|--------|
| 1. Audio Engine | 2h |
| 2. Kepler Synth | 3h |
| 3. Harmony Mapper | 2h |
| 4. UI Integration | 2h |
| 5. Presets | 1h |

---

## Archivos

**Crear (4):**
- js/audio-engine.js
- js/kepler-synth.js
- js/harmony-mapper.js
- audio/presets/platonic-harmonies.json

**Modificar (2):**
- index.html
- js/main.js

---

*Plan preparado para ejecucion por otra IA.*
