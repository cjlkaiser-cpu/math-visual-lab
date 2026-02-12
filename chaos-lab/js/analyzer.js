/**
 * ChaosAnalyzer — Dynamical systems analysis tools
 *
 * Public API:
 *   lyapunovExponent(systemKey, params, dt, transient, steps) -> number
 *   trajectoryStats(pointsFloat32, count) -> {min, max, centroid, spread}
 *   bifurcationData(systemKey, paramKey, range, samples, dt, transient, capture) -> {paramValues, capturedValues}
 *   sensitivityDivergence(systemKey, params, epsilon, dt, steps) -> {times, divergences}
 *   drawBifurcation(canvas, bifData, color)
 */
window.ChaosAnalyzer = (() => {

    const CS = () => window.ChaosSystems;

    // ==================== LYAPUNOV EXPONENT ====================

    /**
     * Estimate the maximal Lyapunov exponent via trajectory divergence.
     * 1. Evolve a reference trajectory past the transient.
     * 2. Create a perturbed copy at distance epsilon.
     * 3. Evolve both, measuring and renormalizing divergence.
     */
    function lyapunovExponent(systemKey, params, dt, transient, steps) {
        const sys = CS().getSystem(systemKey);
        if (!sys) return 0;

        const p = buildParams(sys, params);
        const eps = 1e-7;
        let state = sys.defaultState.slice();

        // Pass transient
        for (let i = 0; i < transient; i++) {
            state = CS().rk4Step(sys.equations, state, p, dt);
            if (!isStateValid(state)) return 0;
        }

        // Perturbed state
        let perturbed = [state[0] + eps, state[1], state[2]];
        let lyapSum = 0;
        let count = 0;

        for (let i = 0; i < steps; i++) {
            state = CS().rk4Step(sys.equations, state, p, dt);
            perturbed = CS().rk4Step(sys.equations, perturbed, p, dt);

            if (!isStateValid(state) || !isStateValid(perturbed)) break;

            // Distance between trajectories
            const dx = perturbed[0] - state[0];
            const dy = perturbed[1] - state[1];
            const dz = perturbed[2] - state[2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist === 0 || !isFinite(dist)) break;

            lyapSum += Math.log(dist / eps);
            count++;

            // Renormalize: pull perturbed back to distance eps
            const ratio = eps / dist;
            perturbed[0] = state[0] + dx * ratio;
            perturbed[1] = state[1] + dy * ratio;
            perturbed[2] = state[2] + dz * ratio;
        }

        return count > 0 ? lyapSum / (count * dt) : 0;
    }

    // ==================== TRAJECTORY STATISTICS ====================

    /**
     * Compute bounding box, centroid, and spread of a point cloud.
     * pointsFloat32: flat [x,y,z, x,y,z, ...], count: number of points.
     */
    function trajectoryStats(pointsFloat32, count) {
        if (count === 0) {
            return { min: [0,0,0], max: [0,0,0], centroid: [0,0,0], spread: 0 };
        }

        const min = [Infinity, Infinity, Infinity];
        const max = [-Infinity, -Infinity, -Infinity];
        const sum = [0, 0, 0];

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            for (let j = 0; j < 3; j++) {
                const v = pointsFloat32[idx + j];
                if (v < min[j]) min[j] = v;
                if (v > max[j]) max[j] = v;
                sum[j] += v;
            }
        }

        const centroid = [sum[0] / count, sum[1] / count, sum[2] / count];
        const spread = Math.sqrt(
            (max[0] - min[0]) * (max[0] - min[0]) +
            (max[1] - min[1]) * (max[1] - min[1]) +
            (max[2] - min[2]) * (max[2] - min[2])
        );

        return { min, max, centroid, spread };
    }

    // ==================== BIFURCATION DATA ====================

    /**
     * Generate bifurcation diagram data by sweeping one parameter.
     * For each parameter value, evolve past the transient then capture
     * values of the x-coordinate.
     *
     * Returns {paramValues: number[], capturedValues: number[][]}
     * where capturedValues[i] contains the captured x-values for paramValues[i].
     */
    function bifurcationData(systemKey, paramKey, range, samples, dt, transient, capture) {
        const sys = CS().getSystem(systemKey);
        if (!sys) return { paramValues: [], capturedValues: [] };

        const paramValues = [];
        const capturedValues = [];
        const step = (range[1] - range[0]) / (samples - 1);

        for (let s = 0; s < samples; s++) {
            const pVal = range[0] + s * step;
            paramValues.push(pVal);

            // Build params with the swept parameter overridden
            const p = buildParams(sys, null);
            p[paramKey] = pVal;

            let state = sys.defaultState.slice();

            // Transient
            for (let i = 0; i < transient; i++) {
                state = CS().rk4Step(sys.equations, state, p, dt);
                if (!isStateValid(state)) { state = sys.defaultState.slice(); break; }
            }

            // Capture
            const captured = [];
            for (let i = 0; i < capture; i++) {
                state = CS().rk4Step(sys.equations, state, p, dt);
                if (!isStateValid(state)) break;
                captured.push(state[0]);
            }
            capturedValues.push(captured);
        }

        return { paramValues, capturedValues };
    }

    // ==================== SENSITIVITY DIVERGENCE ====================

    /**
     * Measure how two nearby trajectories diverge over time.
     * Starts two trajectories separated by epsilon on the x-axis
     * and records the Euclidean distance between them at each step.
     */
    function sensitivityDivergence(systemKey, params, epsilon, dt, steps) {
        const sys = CS().getSystem(systemKey);
        if (!sys) return { times: [], divergences: [] };

        const p = buildParams(sys, params);
        let s1 = sys.defaultState.slice();
        let s2 = [s1[0] + epsilon, s1[1], s1[2]];

        const times = [];
        const divergences = [];

        for (let i = 0; i < steps; i++) {
            s1 = CS().rk4Step(sys.equations, s1, p, dt);
            s2 = CS().rk4Step(sys.equations, s2, p, dt);

            if (!isStateValid(s1) || !isStateValid(s2)) break;

            const dx = s2[0] - s1[0];
            const dy = s2[1] - s1[1];
            const dz = s2[2] - s1[2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            times.push(i * dt);
            divergences.push(dist);
        }

        return { times, divergences };
    }

    // ==================== DRAW BIFURCATION ====================

    /**
     * Render a bifurcation diagram onto a 2D canvas.
     * bifData: {paramValues, capturedValues} from bifurcationData().
     * color: hex string for dot color.
     */
    function drawBifurcation(canvas, bifData, color) {
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        // Clear
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, W, H);

        const pv = bifData.paramValues;
        const cv = bifData.capturedValues;
        if (pv.length === 0) return;

        // Find value range
        let vMin = Infinity, vMax = -Infinity;
        for (let i = 0; i < cv.length; i++) {
            for (let j = 0; j < cv[i].length; j++) {
                const v = cv[i][j];
                if (isFinite(v)) {
                    if (v < vMin) vMin = v;
                    if (v > vMax) vMax = v;
                }
            }
        }

        if (!isFinite(vMin) || !isFinite(vMax) || vMin === vMax) {
            vMin -= 1; vMax += 1;
        }

        const pMin = pv[0];
        const pMax = pv[pv.length - 1];
        const pRange = pMax - pMin || 1;
        const vRange = vMax - vMin || 1;

        // Draw axes
        ctx.strokeStyle = 'rgba(107, 114, 128, 0.3)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, H); ctx.lineTo(W, H);
        ctx.moveTo(0, 0); ctx.lineTo(0, H);
        ctx.stroke();

        // Draw points
        ctx.fillStyle = color || '#8b5cf6';
        ctx.globalAlpha = 0.15;

        for (let i = 0; i < pv.length; i++) {
            const px = ((pv[i] - pMin) / pRange) * W;
            const vals = cv[i];
            for (let j = 0; j < vals.length; j++) {
                if (!isFinite(vals[j])) continue;
                const py = H - ((vals[j] - vMin) / vRange) * H;
                ctx.fillRect(px, py, 1.2, 1.2);
            }
        }

        ctx.globalAlpha = 1;

        // Axis labels
        ctx.fillStyle = '#6b7280';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(pMin.toFixed(2), 4, H - 4);
        ctx.textAlign = 'right';
        ctx.fillText(pMax.toFixed(2), W - 4, H - 4);
        ctx.textAlign = 'left';
        ctx.fillText(vMax.toFixed(1), 4, 12);
        ctx.fillText(vMin.toFixed(1), 4, H - 14);
    }

    // ==================== HELPERS ====================

    function buildParams(sys, overrides) {
        const p = {};
        for (let i = 0; i < sys.params.length; i++) {
            const param = sys.params[i];
            p[param.key] = (overrides && overrides[param.key] !== undefined) ? overrides[param.key] : param.default;
        }
        return p;
    }

    function isStateValid(state) {
        for (let i = 0; i < 3; i++) {
            if (!isFinite(state[i]) || Math.abs(state[i]) > 1e8) return false;
        }
        return true;
    }

    // ==================== PUBLIC API ====================

    return {
        lyapunovExponent,
        trajectoryStats,
        bifurcationData,
        sensitivityDivergence,
        drawBifurcation,
    };
})();
