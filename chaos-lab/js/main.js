/**
 * ChaosLab — Main application controller
 *
 * Orchestrates Three.js setup, system selection, dynamic param sliders,
 * integration loop, trail rendering, analysis panel, and all UI bindings.
 *
 * Dependencies: ChaosSystems, ChaosAnalyzer, ChaosRenderer, KaTeX
 */
(() => {
    const R = window.ChaosRenderer;
    const C = window.ChaosSystems;
    const A = window.ChaosAnalyzer;

    // ==================== STATE ====================

    const state = {
        system: 'lorenz',
        params: {},
        dt: 0.005,
        trailLength: 50000,
        stepsPerFrame: 20,
        autoRotate: true,
        showAxes: true,
        colorMode: 'velocity',
        showPoints: false,
        paused: false,
        mode: 'explore',
        // Multi-trail
        multiTrail: false,
        numTrails: 3,
        // Mouse / camera
        isDragging: false,
        mouseX: 0,
        mouseY: 0,
        cameraTheta: 0.4,
        cameraPhi: 0.3,
        cameraRadius: 80,
        targetCameraRadius: 80,
        lookTarget: [0, 0, 0],
        // Trail(s)
        trails: [],           // array of {trail, integratorState}
        pointsMesh: null,
    };

    let scene, camera, renderer, composer;
    let axesGroup = null;
    let frameCount = 0;

    // ==================== THREE.JS SETUP ====================

    function initThree() {
        const canvas = document.getElementById('main-canvas');
        const container = document.getElementById('canvas-container');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        const setup = R.init(canvas);
        scene = setup.scene;
        camera = setup.camera;
        renderer = setup.renderer;
        composer = setup.composer;

        window.addEventListener('resize', () => {
            R.resize(renderer, camera, container.clientWidth, container.clientHeight, composer);
        });
    }

    // ==================== DISPOSE HELPERS ====================

    function disposeGroup(group) {
        if (!group) return;
        group.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (child.material.map) child.material.map.dispose();
                child.material.dispose();
            }
        });
    }

    // ==================== SYSTEM SWITCHING ====================

    function switchSystem(key) {
        state.system = key;
        const sys = C.getSystem(key);

        document.querySelectorAll('.system-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.system === key);
        });

        if (sys) {
            // Copy default param values
            state.params = {};
            for (const p of sys.params) {
                state.params[p.key] = p.default;
            }

            // Adaptive dt and camera
            if (sys.defaultDt) {
                state.dt = sys.defaultDt;
                const dtSlider = document.getElementById('dt-slider');
                dtSlider.value = state.dt;
                document.getElementById('dt-val').textContent = state.dt.toFixed(4);
            }
            if (sys.cameraRadius) {
                state.targetCameraRadius = sys.cameraRadius;
            }

            document.getElementById('system-name').textContent = sys.name;

            generateParamSliders();
            renderEquations(sys);
            updateProperties(sys);
        } else {
            state.params = {};
            document.getElementById('system-name').textContent = key;
            document.getElementById('param-sliders').innerHTML = '';
            document.getElementById('equations-box').innerHTML =
                '<span class="text-gray-500">&mdash;</span>';
            clearProperties();
        }

        resetAllTrails();
    }

    // ==================== DYNAMIC PARAM SLIDERS ====================

    function generateParamSliders() {
        const container = document.getElementById('param-sliders');
        container.innerHTML = '';

        const sys = C.getSystem(state.system);
        if (!sys || !sys.params) return;

        for (const def of sys.params) {
            const row = document.createElement('div');
            row.className = 'param-row';

            const label = document.createElement('span');
            label.className = 'param-label';
            label.textContent = def.label || def.key;

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.className = 'param-slider';
            slider.min = def.min;
            slider.max = def.max;
            slider.step = def.step;
            slider.value = def.default;
            slider.dataset.param = def.key;

            const valDisplay = document.createElement('span');
            valDisplay.className = 'param-value';
            valDisplay.textContent = parseFloat(def.default).toFixed(2);

            slider.addEventListener('input', () => {
                const val = parseFloat(slider.value);
                state.params[def.key] = val;
                valDisplay.textContent = val.toFixed(2);
            });

            row.appendChild(label);
            row.appendChild(slider);
            row.appendChild(valDisplay);
            container.appendChild(row);
        }
    }

    // ==================== KATEX EQUATIONS ====================

    function renderEquations(sys) {
        const box = document.getElementById('equations-box');
        box.innerHTML = '';

        const latex = sys ? (sys.katex || (sys.latex ? [sys.latex] : null)) : null;
        if (!latex) {
            box.innerHTML = '<span class="text-gray-500">&mdash;</span>';
            return;
        }

        for (const eq of latex) {
            const div = document.createElement('div');
            div.style.marginBottom = '4px';
            try {
                katex.render(eq, div, { throwOnError: false, displayMode: true });
            } catch (e) {
                div.textContent = eq;
            }
            box.appendChild(div);
        }
    }

    // ==================== PROPERTIES ====================

    function updateProperties(sys) {
        if (!sys) { clearProperties(); return; }
        document.getElementById('prop-name').textContent = sys.name || '\u2014';
        document.getElementById('prop-type').textContent = sys.type || '\u2014';
        document.getElementById('prop-dimension').textContent = sys.dimension || '\u2014';
        document.getElementById('prop-symmetry').textContent = sys.symmetry || '\u2014';
        document.getElementById('prop-discoverer').textContent = sys.discoverer || '\u2014';
        document.getElementById('prop-year').textContent = sys.year || '\u2014';
    }

    function clearProperties() {
        ['prop-name', 'prop-type', 'prop-dimension', 'prop-symmetry', 'prop-discoverer', 'prop-year']
            .forEach(id => { document.getElementById(id).textContent = '\u2014'; });
    }

    // ==================== TRAIL MANAGEMENT ====================

    function resetAllTrails() {
        // Dispose existing trails
        for (const t of state.trails) {
            scene.remove(t.trail.line);
            R.disposeTrail(t.trail);
        }
        if (state.pointsMesh) {
            scene.remove(state.pointsMesh);
            state.pointsMesh.material.dispose();
            state.pointsMesh = null;
        }

        state.trails = [];
        const sys = C.getSystem(state.system);
        const baseState = sys && sys.defaultState ? [...sys.defaultState] : [1, 1, 1];
        const baseColor = sys ? sys.color : '#a78bfa';

        const numTrails = state.multiTrail ? state.numTrails : 1;
        const hueShifts = [0, 0.15, -0.15, 0.3, -0.3];

        for (let i = 0; i < numTrails; i++) {
            const color = i === 0 ? baseColor : shiftHue(baseColor, hueShifts[i] || 0);
            const trail = R.createTrail(state.trailLength, color);
            scene.add(trail.line);

            // Perturb initial state slightly for secondary trails
            const initState = [...baseState];
            if (i > 0) {
                const eps = 0.001 * i;
                initState[0] += eps;
                initState[1] += eps * 0.7;
            }

            state.trails.push({ trail, integratorState: initState });
        }

        state.lookTarget = [0, 0, 0];
        updatePointsDisplay();
    }

    function shiftHue(hexColor, shift) {
        const c = new THREE.Color(hexColor);
        const hsl = {};
        c.getHSL(hsl);
        hsl.h = (hsl.h + shift + 1) % 1;
        c.setHSL(hsl.h, hsl.s, hsl.l);
        return '#' + c.getHexString();
    }

    function updatePointsDisplay() {
        if (state.showPoints && state.trails.length > 0) {
            if (!state.pointsMesh) {
                const mat = new THREE.PointsMaterial({
                    size: 0.3, sizeAttenuation: true, vertexColors: true,
                    transparent: true, opacity: 0.5,
                });
                state.pointsMesh = new THREE.Points(state.trails[0].trail.geometry, mat);
                scene.add(state.pointsMesh);
            }
        } else if (state.pointsMesh) {
            scene.remove(state.pointsMesh);
            state.pointsMesh.material.dispose();
            state.pointsMesh = null;
        }
    }

    // ==================== AXES ====================

    function updateAxes() {
        if (axesGroup) {
            scene.remove(axesGroup);
            disposeGroup(axesGroup);
            axesGroup = null;
        }
        if (state.showAxes) {
            axesGroup = R.createAxes(50);
            scene.add(axesGroup);
        }
    }

    // ==================== MOUSE CONTROLS ====================

    function initMouse() {
        const canvas = document.getElementById('main-canvas');

        canvas.addEventListener('mousedown', (e) => {
            state.isDragging = true;
            state.mouseX = e.clientX;
            state.mouseY = e.clientY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!state.isDragging) return;
            const dx = e.clientX - state.mouseX;
            const dy = e.clientY - state.mouseY;
            state.mouseX = e.clientX;
            state.mouseY = e.clientY;

            state.cameraTheta += dx * 0.005;
            state.cameraPhi = Math.max(
                -Math.PI / 2 + 0.1,
                Math.min(Math.PI / 2 - 0.1, state.cameraPhi - dy * 0.005)
            );
        });

        window.addEventListener('mouseup', () => { state.isDragging = false; });

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            state.targetCameraRadius = Math.max(3, Math.min(500,
                state.targetCameraRadius + e.deltaY * 0.15));
        }, { passive: false });

        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                state.isDragging = true;
                state.mouseX = e.touches[0].clientX;
                state.mouseY = e.touches[0].clientY;
            }
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && state.isDragging) {
                const dx = e.touches[0].clientX - state.mouseX;
                const dy = e.touches[0].clientY - state.mouseY;
                state.mouseX = e.touches[0].clientX;
                state.mouseY = e.touches[0].clientY;
                state.cameraTheta += dx * 0.005;
                state.cameraPhi = Math.max(
                    -Math.PI / 2 + 0.1,
                    Math.min(Math.PI / 2 - 0.1, state.cameraPhi - dy * 0.005)
                );
            }
        }, { passive: false });

        canvas.addEventListener('touchend', () => { state.isDragging = false; });
    }

    // ==================== UI BINDINGS ====================

    function bindEvents() {
        // System selector
        document.querySelectorAll('.system-btn').forEach(btn => {
            btn.addEventListener('click', () => switchSystem(btn.dataset.system));
        });

        // Mode tabs
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.mode = btn.dataset.mode;
                document.querySelectorAll('.mode-btn').forEach(b =>
                    b.classList.toggle('active', b === btn)
                );
                document.getElementById('explore-panel').classList.toggle('hidden', state.mode !== 'explore');
                document.getElementById('analyze-panel').classList.toggle('hidden', state.mode !== 'analyze');
            });
        });

        // dt slider
        document.getElementById('dt-slider').addEventListener('input', (e) => {
            state.dt = parseFloat(e.target.value);
            document.getElementById('dt-val').textContent = state.dt.toFixed(4);
        });

        // Trail length
        document.getElementById('trail-slider').addEventListener('input', (e) => {
            state.trailLength = parseInt(e.target.value);
            document.getElementById('trail-val').textContent = state.trailLength;
            resetAllTrails();
        });

        // Speed
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            state.stepsPerFrame = parseInt(e.target.value);
            document.getElementById('speed-val').textContent = state.stepsPerFrame;
        });

        // Checkboxes
        document.getElementById('auto-rotate').addEventListener('change', (e) => {
            state.autoRotate = e.target.checked;
        });
        document.getElementById('show-axes').addEventListener('change', (e) => {
            state.showAxes = e.target.checked;
            updateAxes();
        });
        document.getElementById('color-speed').addEventListener('change', (e) => {
            state.colorMode = e.target.checked ? 'velocity' : 'solid';
        });
        document.getElementById('show-points').addEventListener('change', (e) => {
            state.showPoints = e.target.checked;
            updatePointsDisplay();
        });

        // Multi-trail checkbox
        const multiCheck = document.getElementById('multi-trail');
        if (multiCheck) {
            multiCheck.addEventListener('change', (e) => {
                state.multiTrail = e.target.checked;
                resetAllTrails();
            });
        }

        // Pause / Play
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                state.paused = !state.paused;
                pauseBtn.textContent = state.paused ? '▶ Play' : '⏸ Pausa';
            });
        }

        // Reset
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                resetAllTrails();
            });
        }

        // Epsilon slider
        document.getElementById('epsilon-slider').addEventListener('input', (e) => {
            document.getElementById('epsilon-val').textContent = parseFloat(e.target.value).toFixed(4);
        });

        // Lyapunov
        document.getElementById('calc-lyapunov').addEventListener('click', () => {
            const display = document.getElementById('lyapunov-display');
            display.innerHTML = '<span class="text-gray-400">Calculando...</span>';
            setTimeout(() => {
                const lya = A.lyapunovExponent(state.system, state.params, state.dt, 1000, 5000);
                const colorClass = lya > 0 ? 'text-red-400' : 'text-cyan-400';
                const label = lya > 0 ? 'Positivo \u2192 Ca\u00f3tico' : 'No positivo \u2192 No ca\u00f3tico';
                display.innerHTML =
                    '<span class="' + colorClass + '">' + lya.toFixed(6) + '</span>' +
                    '<div class="text-xs text-gray-500 mt-1">' + label + '</div>';
            }, 50);
        });

        // Bifurcation
        document.getElementById('gen-bifurcation').addEventListener('click', () => {
            const sys = C.getSystem(state.system);
            if (!sys || !sys.params || sys.params.length === 0) return;
            const firstDef = sys.params[0];
            const bifData = A.bifurcationData(
                state.system, firstDef.key,
                [firstDef.min, firstDef.max], 200, state.dt, 500, 100
            );
            const canvas = document.getElementById('bifurcation-canvas');
            A.drawBifurcation(canvas, bifData, sys.color || '#a78bfa');
        });
    }

    // ==================== STATS ====================

    function updateStats() {
        if (state.trails.length === 0 || state.trails[0].trail.count < 2) return;
        const t = state.trails[0].trail;
        const stats = A.trajectoryStats(t.positions, t.count);
        document.getElementById('stat-centroid').textContent =
            '(' + stats.centroid[0].toFixed(1) + ', ' +
            stats.centroid[1].toFixed(1) + ', ' +
            stats.centroid[2].toFixed(1) + ')';
        document.getElementById('stat-spread').textContent = stats.spread.toFixed(2);
        document.getElementById('stat-points').textContent = t.count.toLocaleString();
    }

    // ==================== ANIMATE ====================

    function animate() {
        requestAnimationFrame(animate);
        frameCount++;

        // Integrate all trails
        if (!state.paused) {
            for (const t of state.trails) {
                if (!t.integratorState) continue;

                const result = C.integrate(
                    state.system, state.params, state.dt,
                    state.stepsPerFrame, t.integratorState
                );

                if (result.points.length > 0) {
                    const lastIdx = (result.points.length / 3 - 1) * 3;
                    t.integratorState = [
                        result.points[lastIdx],
                        result.points[lastIdx + 1],
                        result.points[lastIdx + 2],
                    ];
                    R.updateTrail(t.trail, result.points, result.velocities, state.colorMode);
                }
            }
        }

        // Smooth camera radius transition
        state.cameraRadius += (state.targetCameraRadius - state.cameraRadius) * 0.05;

        // Auto-rotate
        if (state.autoRotate && !state.isDragging) {
            state.cameraTheta += 0.003;
        }

        // Track attractor centroid smoothly
        if (state.trails.length > 0 && state.trails[0].trail.count > 100 && frameCount % 15 === 0) {
            const t = state.trails[0].trail;
            const stats = A.trajectoryStats(t.positions, t.count);
            for (let i = 0; i < 3; i++) {
                state.lookTarget[i] += (stats.centroid[i] - state.lookTarget[i]) * 0.08;
            }
        }

        // Camera position (spherical around lookTarget)
        const lx = state.lookTarget[0], ly = state.lookTarget[1], lz = state.lookTarget[2];
        camera.position.x = lx + state.cameraRadius * Math.sin(state.cameraTheta) * Math.cos(state.cameraPhi);
        camera.position.y = ly + state.cameraRadius * Math.sin(state.cameraPhi);
        camera.position.z = lz + state.cameraRadius * Math.cos(state.cameraTheta) * Math.cos(state.cameraPhi);
        camera.lookAt(lx, ly, lz);

        // Rotation display
        const dispEl = document.getElementById('rotation-display');
        if (dispEl) {
            const theta = Math.round((state.cameraTheta * 180 / Math.PI) % 360);
            const phi = Math.round(state.cameraPhi * 180 / Math.PI);
            dispEl.textContent = '\u03B8:' + (((theta % 360) + 360) % 360) + '\u00B0 \u03C6:' + phi + '\u00B0';
        }

        // Stats (throttled)
        if (frameCount % 30 === 0) updateStats();

        // Render (use composer for bloom if available)
        if (composer) {
            composer.render();
        } else {
            renderer.render(scene, camera);
        }
    }

    // ==================== INIT ====================

    function init() {
        initThree();
        initMouse();
        bindEvents();

        // Sync UI
        document.getElementById('color-speed').checked = (state.colorMode === 'velocity');

        switchSystem('lorenz');
        updateAxes();

        requestAnimationFrame(animate);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
