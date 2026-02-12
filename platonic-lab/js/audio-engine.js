/**
 * PlatonicLab — Audio Engine
 * Web Audio API wrapper with oscillator management, envelopes, and effects.
 */
window.PlatonicAudio = (() => {
    'use strict';

    let ctx = null;
    let masterGain = null;
    let compressor = null;
    let reverbGain = null;
    let convolver = null;
    let activeVoices = [];
    let volume = 0.5;
    let muted = false;

    function init() {
        if (ctx) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Compressor for clean output
        compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.knee.value = 12;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.15;
        compressor.connect(ctx.destination);

        // Master gain
        masterGain = ctx.createGain();
        masterGain.gain.value = volume;
        masterGain.connect(compressor);

        // Simple reverb via delay feedback
        reverbGain = ctx.createGain();
        reverbGain.gain.value = 0.15;
        const delay = ctx.createDelay(0.5);
        delay.delayTime.value = 0.12;
        const feedback = ctx.createGain();
        feedback.gain.value = 0.3;
        reverbGain.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(masterGain);
    }

    function resume() {
        if (ctx && ctx.state === 'suspended') ctx.resume();
    }

    function setVolume(val) {
        volume = Math.max(0, Math.min(1, val));
        if (masterGain) masterGain.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.05);
    }

    function setMuted(m) {
        muted = m;
        if (masterGain) masterGain.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.05);
    }

    function getVolume() { return volume; }
    function isMuted() { return muted; }

    /**
     * Play a single note with ADSR envelope.
     * Returns a voice object with stop() method.
     */
    function playNote(freq, options = {}) {
        if (!ctx) init();
        resume();

        const {
            type = 'sine',
            gain = 0.12,
            attack = 0.08,
            decay = 0.15,
            sustain = 0.6,
            release = 0.8,
            duration = null, // null = sustain indefinitely until stop()
            detune = 0,
            filterFreq = 3000,
            pan = 0,
            reverb = true,
        } = options;

        const now = ctx.currentTime;

        // Oscillator
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = Math.max(20, Math.min(8000, freq));
        osc.detune.value = detune;

        // Filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = filterFreq;
        filter.Q.value = 0.7;

        // Gain envelope
        const env = ctx.createGain();
        const peakGain = gain;
        const sustainGain = peakGain * sustain;

        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(peakGain, now + attack);
        env.gain.linearRampToValueAtTime(sustainGain, now + attack + decay);

        // Panner
        const panner = ctx.createStereoPanner();
        panner.pan.value = pan;

        // Chain
        osc.connect(filter);
        filter.connect(env);
        env.connect(panner);
        panner.connect(masterGain);

        if (reverb && reverbGain) {
            const reverbSend = ctx.createGain();
            reverbSend.gain.value = 0.25;
            panner.connect(reverbSend);
            reverbSend.connect(reverbGain);
        }

        osc.start(now);

        let stopped = false;

        const voice = {
            osc, env, filter, panner,
            freq,
            stop(fadeTime) {
                if (stopped) return;
                stopped = true;
                const t = ctx.currentTime;
                const fade = fadeTime !== undefined ? fadeTime : release;
                env.gain.cancelScheduledValues(t);
                env.gain.setValueAtTime(env.gain.value, t);
                env.gain.linearRampToValueAtTime(0, t + fade);
                osc.stop(t + fade + 0.05);
                setTimeout(() => {
                    const idx = activeVoices.indexOf(voice);
                    if (idx !== -1) activeVoices.splice(idx, 1);
                }, (fade + 0.1) * 1000);
            }
        };

        // Auto-stop if duration specified
        if (duration !== null) {
            const stopAt = now + duration;
            env.gain.cancelScheduledValues(now + attack + decay);
            env.gain.setValueAtTime(sustainGain, now + attack + decay);
            env.gain.linearRampToValueAtTime(0, stopAt);
            osc.stop(stopAt + 0.05);
            setTimeout(() => {
                stopped = true;
                const idx = activeVoices.indexOf(voice);
                if (idx !== -1) activeVoices.splice(idx, 1);
            }, (duration + 0.1) * 1000);
        }

        activeVoices.push(voice);
        return voice;
    }

    /**
     * Play a chord: array of frequencies with options.
     * Returns array of voice objects.
     */
    function playChord(frequencies, options = {}) {
        const {
            type = 'sine',
            gain = 0.12,
            spread = 0.3, // stereo spread
            stagger = 0.03, // time between notes
            ...rest
        } = options;

        const perNoteGain = gain / Math.sqrt(frequencies.length);
        const voices = [];

        frequencies.forEach((freq, i) => {
            const panVal = frequencies.length > 1
                ? ((i / (frequencies.length - 1)) - 0.5) * 2 * spread
                : 0;

            setTimeout(() => {
                const v = playNote(freq, {
                    type,
                    gain: perNoteGain,
                    pan: panVal,
                    ...rest,
                });
                voices.push(v);
            }, i * stagger * 1000);
        });

        return voices;
    }

    /**
     * Play a short percussive hit (for UI feedback).
     */
    function playClick(freq = 800, dur = 0.06) {
        playNote(freq, {
            type: 'triangle',
            gain: 0.06,
            attack: 0.005,
            decay: dur,
            sustain: 0,
            release: 0.01,
            duration: dur + 0.02,
            reverb: false,
        });
    }

    /**
     * Stop all active voices.
     */
    function stopAll(fadeTime = 0.3) {
        [...activeVoices].forEach(v => v.stop(fadeTime));
    }

    function getActiveCount() { return activeVoices.length; }
    function getContext() { return ctx; }

    return {
        init,
        resume,
        setVolume,
        getVolume,
        setMuted,
        isMuted,
        playNote,
        playChord,
        playClick,
        stopAll,
        getActiveCount,
        getContext,
    };
})();
