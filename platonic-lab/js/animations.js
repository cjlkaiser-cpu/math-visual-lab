/**
 * PlatonicAnimations — GSAP animations for construction, morph, nets, duality
 */
window.PlatonicAnimations = (() => {

    let activeTimeline = null;
    let activeTweens = [];

    /**
     * Build construction timeline for step-by-step build animation
     * @param {string} solidKey
     * @param {object} sceneObjects - { vertexDots, edgeLines, faceMesh }
     * @param {function} onStepChange - callback(stepIndex)
     * @returns {gsap.core.Timeline}
     */
    function buildConstructionTimeline(solidKey, sceneObjects, onStepChange) {
        killAll();

        const tl = gsap.timeline({ paused: true });
        const { vertexDots, edgeLines, faceMesh } = sceneObjects;

        // Initial state: everything invisible
        if (vertexDots) {
            vertexDots.visible = true;
            vertexDots.material.opacity = 0;
            vertexDots.scale.set(0.01, 0.01, 0.01);
        }
        if (edgeLines) {
            edgeLines.visible = true;
            edgeLines.material.opacity = 0;
        }
        if (faceMesh) {
            faceMesh.visible = true;
            faceMesh.material.opacity = 0;
        }

        // Step 1: Vertices appear
        if (vertexDots) {
            tl.to(vertexDots.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.8,
                ease: 'back.out(1.7)',
                onStart: () => onStepChange && onStepChange(0),
            });
            tl.to(vertexDots.material, {
                opacity: 1,
                duration: 0.5,
            }, '<');
        }

        // Step 2: Edges appear
        if (edgeLines) {
            tl.to(edgeLines.material, {
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out',
                onStart: () => onStepChange && onStepChange(1),
            }, '+=0.2');
        }

        // Step 3: Faces appear
        if (faceMesh) {
            tl.to(faceMesh.material, {
                opacity: 0.35,
                duration: 1.0,
                ease: 'power2.out',
                onStart: () => onStepChange && onStepChange(2),
            }, '+=0.2');
        }

        // Step 4: Complete — pulse glow
        tl.to({}, {
            duration: 0.1,
            onStart: () => onStepChange && onStepChange(3),
        });

        if (faceMesh) {
            tl.to(faceMesh.material, {
                opacity: 0.5,
                duration: 0.5,
                ease: 'power2.inOut',
                yoyo: true,
                repeat: 1,
            });
        }

        activeTimeline = tl;
        return tl;
    }

    /**
     * Go to specific construction step
     */
    function goToStep(timeline, stepIndex) {
        if (!timeline) return;
        const labels = timeline.getLabelsArray ? timeline.getLabelsArray() : [];
        // Use progress-based stepping: each step is ~25%
        const progress = Math.min((stepIndex + 1) / 4, 1);
        timeline.progress(progress);
    }

    /**
     * Start morph animation between two solids
     * @param {number} duration
     * @param {function} onUpdate - callback(progress 0-1)
     * @param {function} onComplete
     * @returns {gsap.core.Tween}
     */
    function startMorph(duration, onUpdate, onComplete) {
        const proxy = { progress: 0 };

        const tween = gsap.to(proxy, {
            progress: 1,
            duration: duration || 2,
            ease: 'power2.inOut',
            onUpdate: () => onUpdate && onUpdate(proxy.progress),
            onComplete: () => onComplete && onComplete(),
        });

        activeTweens.push(tween);
        return tween;
    }

    /**
     * Net fold/unfold animation
     * @param {'fold'|'unfold'} direction
     * @param {number} duration
     * @param {function} onUpdate - callback(progress 0-1)
     * @param {function} onComplete
     */
    function startNetFold(direction, duration, onUpdate, onComplete) {
        const startVal = direction === 'fold' ? 0 : 1;
        const endVal = direction === 'fold' ? 1 : 0;
        const proxy = { progress: startVal };

        const tween = gsap.to(proxy, {
            progress: endVal,
            duration: duration || 2,
            ease: 'power2.inOut',
            onUpdate: () => onUpdate && onUpdate(proxy.progress),
            onComplete: () => onComplete && onComplete(),
        });

        activeTweens.push(tween);
        return tween;
    }

    /**
     * Show/hide dual with fade animation
     * @param {THREE.Mesh} dualMesh
     * @param {boolean} fadeIn
     * @param {number} duration
     */
    function showDual(dualMesh, fadeIn, duration) {
        if (!dualMesh || !dualMesh.material) return;

        const targetOpacity = fadeIn ? 0.3 : 0;

        if (fadeIn) {
            dualMesh.visible = true;
            dualMesh.material.opacity = 0;
        }

        const tween = gsap.to(dualMesh.material, {
            opacity: targetOpacity,
            duration: duration || 0.6,
            ease: 'power2.out',
            onComplete: () => {
                if (!fadeIn) dualMesh.visible = false;
            },
        });

        activeTweens.push(tween);
        return tween;
    }

    /**
     * Animate sphere appearance
     */
    function showSphere(sphereMesh, show, duration) {
        if (!sphereMesh || !sphereMesh.material) return;

        if (show) {
            sphereMesh.visible = true;
            sphereMesh.material.opacity = 0;
        }

        const tween = gsap.to(sphereMesh.material, {
            opacity: show ? 0.15 : 0,
            duration: duration || 0.5,
            ease: 'power2.out',
            onComplete: () => {
                if (!show) sphereMesh.visible = false;
            },
        });

        activeTweens.push(tween);
        return tween;
    }

    /**
     * Animate solid transition (scale down old, scale up new)
     */
    function transitionSolid(oldGroup, newGroup, duration, onMidpoint) {
        if (!oldGroup && !newGroup) return;

        const tl = gsap.timeline();

        if (oldGroup) {
            tl.to(oldGroup.scale, {
                x: 0.01, y: 0.01, z: 0.01,
                duration: (duration || 0.6) / 2,
                ease: 'power2.in',
                onComplete: () => {
                    oldGroup.visible = false;
                    if (onMidpoint) onMidpoint();
                },
            });
        }

        if (newGroup) {
            newGroup.scale.set(0.01, 0.01, 0.01);
            newGroup.visible = true;
            tl.to(newGroup.scale, {
                x: 1, y: 1, z: 1,
                duration: (duration || 0.6) / 2,
                ease: 'back.out(1.4)',
            });
        }

        activeTweens.push(tl);
        return tl;
    }

    /**
     * Kill all active GSAP tweens and timelines
     */
    function killAll() {
        if (activeTimeline) {
            activeTimeline.kill();
            activeTimeline = null;
        }
        activeTweens.forEach(t => {
            if (t && t.kill) t.kill();
        });
        activeTweens = [];
    }

    return {
        buildConstructionTimeline,
        goToStep,
        startMorph,
        startNetFold,
        showDual,
        showSphere,
        transitionSolid,
        killAll,
    };
})();
