/**
 * ChaosRenderer — Three.js r128 rendering for strange attractor trails
 *
 * Features:
 *   - Circular buffer trail with no wrap-around artifact
 *   - Age-based fading (old points dim, new points bright)
 *   - Bloom/glow post-processing via UnrealBloomPass
 *   - Multiple simultaneous trails
 *
 * Public API:
 *   init(canvas)                              -> { scene, camera, renderer, composer }
 *   createTrail(maxPoints, baseColor)         -> trail object
 *   updateTrail(trail, newPoints, newVelocities, colorMode)
 *   applyFading(trail)                        -> update colors with age-based fade
 *   resetTrail(trail)
 *   disposeTrail(trail)
 *   createAxes(size)                          -> THREE.Group
 *   resize(rend, cam, w, h, composer?)
 */
window.ChaosRenderer = (() => {

    // ==================== INIT ====================

    function init(canvas) {
        const container = canvas.parentElement;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            55, container.clientWidth / container.clientHeight, 0.1, 2000
        );

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x030305, 1);
        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.toneMappingExposure = 1.5;

        // Subtle ambient + 2 directional
        scene.add(new THREE.AmbientLight(0x404060, 0.3));
        const d1 = new THREE.DirectionalLight(0xc4b5fd, 0.4);
        d1.position.set(5, 5, 5);
        scene.add(d1);
        const d2 = new THREE.DirectionalLight(0x67e8f9, 0.2);
        d2.position.set(-3, -2, 4);
        scene.add(d2);

        // Bloom post-processing (will be set up after CDN scripts load)
        let composer = null;
        if (window.THREE.EffectComposer) {
            composer = setupBloom(renderer, scene, camera);
        }

        return { scene, camera, renderer, composer };
    }

    function setupBloom(renderer, scene, camera) {
        const renderPass = new THREE.RenderPass(scene, camera);
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.8,   // strength
            0.4,   // radius
            0.2    // threshold
        );
        const composer = new THREE.EffectComposer(renderer);
        composer.addPass(renderPass);
        composer.addPass(bloomPass);
        composer.bloomPass = bloomPass;
        return composer;
    }

    // ==================== TRAIL SYSTEM ====================
    // Uses a linear write buffer. When full, shifts data forward by discarding
    // the oldest half — avoids the circular-buffer wrap artifact entirely.

    function createTrail(maxPoints, baseColor) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(maxPoints * 3);
        const colors = new Float32Array(maxPoints * 3);

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setDrawRange(0, 0);

        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
        });
        const line = new THREE.Line(geometry, material);

        return {
            line,
            geometry,
            positions,
            colors,
            count: 0,        // total valid points
            maxPoints,
            baseColor: new THREE.Color(baseColor),
            // Store raw color (before fading) separately so fading can modulate it
            rawColors: new Float32Array(maxPoints * 3),
        };
    }

    function updateTrail(trail, newPoints, newVelocities, colorMode) {
        const numNew = newPoints.length / 3;
        if (numNew === 0) return;

        const posArr = trail.positions;
        const rawArr = trail.rawColors;

        // If adding would overflow, shift the buffer: keep the newest half
        if (trail.count + numNew > trail.maxPoints) {
            const keep = Math.floor(trail.maxPoints / 2);
            const srcOffset = (trail.count - keep) * 3;
            posArr.copyWithin(0, srcOffset, trail.count * 3);
            rawArr.copyWithin(0, srcOffset, trail.count * 3);
            trail.count = keep;
        }

        // Append new points
        for (let i = 0; i < numNew; i++) {
            const idx = (trail.count + i) * 3;
            const si = i * 3;

            // Write position
            posArr[idx]     = newPoints[si];
            posArr[idx + 1] = newPoints[si + 1];
            posArr[idx + 2] = newPoints[si + 2];

            // Compute raw color based on mode
            let r, g, b;

            switch (colorMode) {
                case 'velocity': {
                    const speed = newVelocities ? (newVelocities[i] || 0) : 0;
                    const t = Math.min(speed / 150, 1);
                    // Deep blue → cyan → white-hot
                    r = t * t;
                    g = 0.1 + 0.6 * t;
                    b = 0.6 + 0.4 * (1 - t);
                    break;
                }
                case 'time': {
                    const t = ((trail.count + i) % trail.maxPoints) / trail.maxPoints;
                    r = 0.3 + 0.5 * t;
                    g = 0.8 * (1 - t);
                    b = 0.8 + 0.2 * t;
                    break;
                }
                case 'dimension': {
                    const z = posArr[idx + 2];
                    const t = Math.min(Math.max((z + 30) / 60, 0), 1);
                    r = 0.2 + 0.8 * t;
                    g = 0.8 * (1 - Math.abs(t - 0.5) * 2);
                    b = 0.8 * (1 - t);
                    break;
                }
                default: { // 'solid'
                    r = trail.baseColor.r;
                    g = trail.baseColor.g;
                    b = trail.baseColor.b;
                }
            }

            rawArr[idx]     = r;
            rawArr[idx + 1] = g;
            rawArr[idx + 2] = b;
        }

        trail.count += numNew;

        // Apply age-based fading over the full trail
        applyFading(trail);

        trail.geometry.getAttribute('position').needsUpdate = true;
        trail.geometry.getAttribute('color').needsUpdate = true;
        trail.geometry.setDrawRange(0, trail.count);
    }

    // ==================== AGE-BASED FADING ====================

    function applyFading(trail) {
        const colArr = trail.colors;
        const rawArr = trail.rawColors;
        const n = trail.count;
        if (n === 0) return;

        // Fade: oldest point → 5% brightness, newest → 100%
        for (let i = 0; i < n; i++) {
            const age = i / n; // 0 = oldest, 1 = newest
            // Smooth curve: more visible at the end, quick fade at start
            const fade = age * age; // quadratic
            const brightness = 0.05 + 0.95 * fade;

            const idx = i * 3;
            colArr[idx]     = rawArr[idx]     * brightness;
            colArr[idx + 1] = rawArr[idx + 1] * brightness;
            colArr[idx + 2] = rawArr[idx + 2] * brightness;
        }
    }

    // ==================== TRAIL MANAGEMENT ====================

    function resetTrail(trail) {
        trail.count = 0;
        trail.geometry.setDrawRange(0, 0);
    }

    function disposeTrail(trail) {
        trail.geometry.dispose();
        trail.line.material.dispose();
    }

    // ==================== AXES ====================

    function createAxes(size) {
        const group = new THREE.Group();
        const axisColors = [0xff4444, 0x44ff44, 0x4488ff];
        const labels = ['X', 'Y', 'Z'];

        for (let i = 0; i < 3; i++) {
            const pts = [new THREE.Vector3(), new THREE.Vector3()];
            pts[1].setComponent(i, size);
            const geom = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = new THREE.LineBasicMaterial({
                color: axisColors[i], transparent: true, opacity: 0.25,
            });
            group.add(new THREE.Line(geom, mat));

            const negPts = [new THREE.Vector3(), new THREE.Vector3()];
            negPts[1].setComponent(i, -size);
            const geom2 = new THREE.BufferGeometry().setFromPoints(negPts);
            const mat2 = new THREE.LineBasicMaterial({
                color: axisColors[i], transparent: true, opacity: 0.1,
            });
            group.add(new THREE.Line(geom2, mat2));

            // Label sprite
            const cvs = document.createElement('canvas');
            cvs.width = 64; cvs.height = 64;
            const ctx = cvs.getContext('2d');
            ctx.fillStyle = '#' + axisColors[i].toString(16).padStart(6, '0');
            ctx.font = 'bold 48px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(labels[i], 32, 32);

            const texture = new THREE.CanvasTexture(cvs);
            const spriteMat = new THREE.SpriteMaterial({
                map: texture, transparent: true, opacity: 0.5,
            });
            const sprite = new THREE.Sprite(spriteMat);
            const pos = new THREE.Vector3();
            pos.setComponent(i, size + 2);
            sprite.position.copy(pos);
            sprite.scale.set(3, 3, 1);
            group.add(sprite);
        }

        return group;
    }

    // ==================== RESIZE ====================

    function resize(rend, cam, w, h, composer) {
        cam.aspect = w / h;
        cam.updateProjectionMatrix();
        rend.setSize(w, h);
        if (composer) composer.setSize(w, h);
    }

    // ==================== PUBLIC API ====================

    return {
        init, setupBloom,
        createTrail, updateTrail, applyFading, resetTrail, disposeTrail,
        createAxes, resize,
    };
})();
