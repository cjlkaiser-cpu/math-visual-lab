/**
 * ChaosSystems — Strange attractor definitions and numerical integration
 *
 * Public API:
 *   listSystems()  -> [{key, name, description, color}]
 *   getSystem(key)  -> full system object
 *   rk4Step(equations, state, params, dt) -> [x,y,z]
 *   integrate(systemKey, params, dt, steps, initialState?) -> {points: Float32Array, velocities: Float32Array}
 */
window.ChaosSystems = (() => {

    // ==================== SYSTEM DEFINITIONS ====================

    const systems = {

        lorenz: {
            key: 'lorenz',
            name: 'Atractor de Lorenz',
            description: 'El primer atractor extraño descubierto, modelando convección atmosférica.',
            discoverer: 'Edward Lorenz',
            year: 1963,
            type: 'Continuo (ODE)',
            dimension: 3,
            symmetry: 'Z\u2082 (inversi\u00f3n x, y)',
            params: [
                { key: 'sigma', label: '\u03c3', min: 0, max: 30, step: 0.1, default: 10 },
                { key: 'rho',   label: '\u03c1', min: 0, max: 50, step: 0.1, default: 28 },
                { key: 'beta',  label: '\u03b2', min: 0, max: 10, step: 0.01, default: 2.667 },
            ],
            defaultState: [1, 1, 1],
            equations: function(state, params) {
                var x = state[0], y = state[1], z = state[2];
                return [
                    params.sigma * (y - x),
                    x * (params.rho - z) - y,
                    x * y - params.beta * z
                ];
            },
            latex: '\\dot{x} = \\sigma(y - x) \\quad \\dot{y} = x(\\rho - z) - y \\quad \\dot{z} = xy - \\beta z',
            color: '#8b5cf6',
            cameraRadius: 80,
            defaultDt: 0.005,
        },

        rossler: {
            key: 'rossler',
            name: 'Atractor de R\u00f6ssler',
            description: 'Sistema ca\u00f3tico minimalista con una sola no-linealidad.',
            discoverer: 'Otto R\u00f6ssler',
            year: 1976,
            type: 'Continuo (ODE)',
            dimension: 3,
            symmetry: 'Ninguna',
            params: [
                { key: 'a', label: 'a', min: 0, max: 1, step: 0.01, default: 0.2 },
                { key: 'b', label: 'b', min: 0, max: 1, step: 0.01, default: 0.2 },
                { key: 'c', label: 'c', min: 0, max: 20, step: 0.1, default: 5.7 },
            ],
            defaultState: [1, 1, 0],
            equations: function(state, params) {
                var x = state[0], y = state[1], z = state[2];
                return [
                    -(y + z),
                    x + params.a * y,
                    params.b + z * (x - params.c)
                ];
            },
            latex: '\\dot{x} = -(y+z) \\quad \\dot{y} = x + ay \\quad \\dot{z} = b + z(x-c)',
            color: '#06b6d4',
            cameraRadius: 40,
            defaultDt: 0.01,
        },

        aizawa: {
            key: 'aizawa',
            name: 'Atractor de Aizawa',
            description: 'Sistema con simetr\u00eda rotacional que genera trayectorias toroidales deformadas.',
            discoverer: 'Yoji Aizawa',
            year: 1982,
            type: 'Continuo (ODE)',
            dimension: 3,
            symmetry: 'Rotacional SO(2)',
            params: [
                { key: 'a', label: 'a', min: 0, max: 2, step: 0.01, default: 0.95 },
                { key: 'b', label: 'b', min: 0, max: 2, step: 0.01, default: 0.7 },
                { key: 'c', label: 'c', min: 0, max: 2, step: 0.01, default: 0.6 },
                { key: 'd', label: 'd', min: 0, max: 10, step: 0.1, default: 3.5 },
                { key: 'e', label: 'e', min: 0, max: 1, step: 0.01, default: 0.25 },
                { key: 'f', label: 'f', min: 0, max: 1, step: 0.01, default: 0.1 },
            ],
            defaultState: [0.1, 0, 0],
            equations: function(state, params) {
                var x = state[0], y = state[1], z = state[2];
                var r2 = x * x + y * y;
                return [
                    (z - params.b) * x - params.d * y,
                    params.d * x + (z - params.b) * y,
                    params.c + params.a * z - (z * z * z) / 3 - r2 * (1 + params.e * z) + params.f * z * x * x * x
                ];
            },
            latex: '\\dot{x} = (z{-}b)x - dy \\quad \\dot{y} = dx + (z{-}b)y \\quad \\dot{z} = c + az - \\tfrac{z^3}{3} - r^2(1{+}ez) + fzx^3',
            color: '#f59e0b',
            cameraRadius: 8,
            defaultDt: 0.01,
        },

        thomas: {
            key: 'thomas',
            name: 'Atractor de Thomas',
            description: 'Sistema c\u00edclicamente sim\u00e9trico con atractor 3D de tipo mariposa.',
            discoverer: 'Ren\u00e9 Thomas',
            year: 1999,
            type: 'Continuo (ODE)',
            dimension: 3,
            symmetry: 'C\u00edclica Z\u2083',
            params: [
                { key: 'b', label: 'b', min: 0, max: 1, step: 0.001, default: 0.208186 },
            ],
            defaultState: [1, 0, 0],
            equations: function(state, params) {
                var x = state[0], y = state[1], z = state[2];
                return [
                    Math.sin(y) - params.b * x,
                    Math.sin(z) - params.b * y,
                    Math.sin(x) - params.b * z
                ];
            },
            latex: '\\dot{x} = \\sin(y) - bx \\quad \\dot{y} = \\sin(z) - by \\quad \\dot{z} = \\sin(x) - bz',
            color: '#10b981',
            cameraRadius: 15,
            defaultDt: 0.03,
        },

        halvorsen: {
            key: 'halvorsen',
            name: 'Atractor de Halvorsen',
            description: 'Sistema c\u00edclicamente sim\u00e9trico con geometr\u00eda de tres alas.',
            discoverer: 'Christian Halvorsen',
            year: 2015,
            type: 'Continuo (ODE)',
            dimension: 3,
            symmetry: 'C\u00edclica Z\u2083',
            params: [
                { key: 'a', label: 'a', min: 0.5, max: 3, step: 0.01, default: 1.89 },
            ],
            defaultState: [-5, 0, 0],
            equations: function(state, params) {
                var x = state[0], y = state[1], z = state[2];
                var a = params.a;
                return [
                    -a * x - 4 * y - 4 * z - y * y,
                    -a * y - 4 * z - 4 * x - z * z,
                    -a * z - 4 * x - 4 * y - x * x
                ];
            },
            latex: '\\dot{x} = -ax - 4y - 4z - y^2 \\quad \\dot{y} = -ay - 4z - 4x - z^2 \\quad \\dot{z} = -az - 4x - 4y - x^2',
            color: '#ef4444',
            cameraRadius: 30,
            defaultDt: 0.005,
        },

        sprott: {
            key: 'sprott',
            name: 'Atractor de Sprott (B)',
            description: 'Uno de los sistemas ca\u00f3ticos m\u00e1s simples conocidos, con solo 5 t\u00e9rminos.',
            discoverer: 'Julien C. Sprott',
            year: 1994,
            type: 'Continuo (ODE)',
            dimension: 3,
            symmetry: 'Ninguna',
            params: [
                { key: 'a', label: 'a', min: 0.1, max: 3, step: 0.01, default: 1.0 },
            ],
            defaultState: [0.1, 0.1, 0.1],
            equations: function(state, params) {
                var x = state[0], y = state[1], z = state[2];
                return [
                    y * z,
                    x - y,
                    params.a - x * y
                ];
            },
            latex: '\\dot{x} = yz \\quad \\dot{y} = x - y \\quad \\dot{z} = a - xy',
            color: '#ec4899',
            cameraRadius: 15,
            defaultDt: 0.01,
        },

        chen: {
            key: 'chen',
            name: 'Atractor de Chen',
            description: 'Generalización del sistema de Lorenz con dinámicas más complejas.',
            discoverer: 'Guanrong Chen',
            year: 1999,
            type: 'Continuo (ODE)',
            dimension: 3,
            symmetry: 'Z\u2082 (inversi\u00f3n x, y)',
            params: [
                { key: 'a', label: 'a', min: 20, max: 50, step: 0.5, default: 35 },
                { key: 'b', label: 'b', min: 1, max: 10, step: 0.1, default: 3 },
                { key: 'c', label: 'c', min: 15, max: 40, step: 0.5, default: 28 },
            ],
            defaultState: [-10, 0, 37],
            equations: function(state, params) {
                var x = state[0], y = state[1], z = state[2];
                return [
                    params.a * (y - x),
                    (params.c - params.a) * x - x * z + params.c * y,
                    x * y - params.b * z
                ];
            },
            latex: '\\dot{x} = a(y{-}x) \\quad \\dot{y} = (c{-}a)x - xz + cy \\quad \\dot{z} = xy - bz',
            color: '#3b82f6',
            cameraRadius: 80,
            defaultDt: 0.002,
        },

        dadras: {
            key: 'dadras',
            name: 'Atractor de Dadras',
            description: 'Sistema con cuatro puntos de equilibrio y atractor de doble ala.',
            discoverer: 'Sara Dadras',
            year: 2010,
            type: 'Continuo (ODE)',
            dimension: 3,
            symmetry: 'Ninguna',
            params: [
                { key: 'a', label: 'a', min: 1, max: 8, step: 0.1, default: 3 },
                { key: 'b', label: 'b', min: 0.5, max: 5, step: 0.1, default: 2.7 },
                { key: 'c', label: 'c', min: 0.5, max: 5, step: 0.1, default: 1.7 },
                { key: 'd', label: 'd', min: 0.5, max: 5, step: 0.1, default: 2 },
                { key: 'e', label: 'e', min: 1, max: 15, step: 0.1, default: 9 },
            ],
            defaultState: [1, 1, 1],
            equations: function(state, params) {
                var x = state[0], y = state[1], z = state[2];
                return [
                    y - params.a * x + params.b * y * z,
                    params.c * y - x * z + z,
                    params.d * x * y - params.e * z
                ];
            },
            latex: '\\dot{x} = y - ax + byz \\quad \\dot{y} = cy - xz + z \\quad \\dot{z} = dxy - ez',
            color: '#f97316',
            cameraRadius: 30,
            defaultDt: 0.005,
        },

        'three-scroll': {
            key: 'three-scroll',
            name: 'Atractor de L\u00fc (Three-Scroll)',
            description: 'Sistema unificado de Lorenz-Chen-L\u00fc con din\u00e1mica de tres lazos.',
            discoverer: 'Jinhu L\u00fc & Guanrong Chen',
            year: 2002,
            type: 'Continuo (ODE)',
            dimension: 3,
            symmetry: 'Z\u2082 (inversi\u00f3n x, y)',
            params: [
                { key: 'a', label: 'a', min: 20, max: 50, step: 0.5, default: 36 },
                { key: 'b', label: 'b', min: 1, max: 10, step: 0.1, default: 3 },
                { key: 'c', label: 'c', min: 10, max: 30, step: 0.5, default: 20 },
            ],
            defaultState: [-2, -2, 20],
            equations: function(state, params) {
                var x = state[0], y = state[1], z = state[2];
                return [
                    params.a * (y - x),
                    -x * z + params.c * y,
                    x * y - params.b * z
                ];
            },
            latex: '\\dot{x} = a(y{-}x) \\quad \\dot{y} = -xz + cy \\quad \\dot{z} = xy - bz',
            color: '#a855f7',
            cameraRadius: 70,
            defaultDt: 0.002,
        },

        rabinovich: {
            key: 'rabinovich',
            name: 'Atractor de Rabinovich-Fabrikant',
            description: 'Modelo de inestabilidad en oscilaciones no lineales con geometr\u00eda compleja.',
            discoverer: 'M. Rabinovich & A. Fabrikant',
            year: 1979,
            type: 'Continuo (ODE)',
            dimension: 3,
            symmetry: 'Z\u2082 (inversi\u00f3n x, y)',
            params: [
                { key: 'alpha', label: '\u03b1', min: 0.01, max: 2, step: 0.01, default: 1.1 },
                { key: 'gamma', label: '\u03b3', min: 0.01, max: 1.5, step: 0.01, default: 0.87 },
            ],
            defaultState: [-1, 0, 0.5],
            equations: function(state, params) {
                var x = state[0], y = state[1], z = state[2];
                return [
                    y * (z - 1 + x * x) + params.gamma * x,
                    x * (3 * z + 1 - x * x) + params.gamma * y,
                    -2 * z * (params.alpha + x * y)
                ];
            },
            latex: '\\dot{x} = y(z{-}1{+}x^2) + \\gamma x \\quad \\dot{y} = x(3z{+}1{-}x^2) + \\gamma y \\quad \\dot{z} = -2z(\\alpha + xy)',
            color: '#14b8a6',
            cameraRadius: 10,
            defaultDt: 0.005,
        },
    };

    // ==================== RK4 INTEGRATOR ====================

    function rk4Step(equations, state, params, dt) {
        var k1 = equations(state, params);
        var s2 = [
            state[0] + k1[0] * dt * 0.5,
            state[1] + k1[1] * dt * 0.5,
            state[2] + k1[2] * dt * 0.5
        ];
        var k2 = equations(s2, params);
        var s3 = [
            state[0] + k2[0] * dt * 0.5,
            state[1] + k2[1] * dt * 0.5,
            state[2] + k2[2] * dt * 0.5
        ];
        var k3 = equations(s3, params);
        var s4 = [
            state[0] + k3[0] * dt,
            state[1] + k3[1] * dt,
            state[2] + k3[2] * dt
        ];
        var k4 = equations(s4, params);
        return [
            state[0] + (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) * dt / 6,
            state[1] + (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) * dt / 6,
            state[2] + (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]) * dt / 6
        ];
    }

    // ==================== INTEGRATION ====================

    function integrate(systemKey, params, dt, steps, initialState) {
        var sys = systems[systemKey];
        if (!sys) return { points: new Float32Array(0), velocities: new Float32Array(0) };

        var state = initialState ? initialState.slice() : sys.defaultState.slice();
        var points = new Float32Array(steps * 3);
        var velocities = new Float32Array(steps);

        // Build params object from defaults if not provided
        var p = {};
        for (var i = 0; i < sys.params.length; i++) {
            var param = sys.params[i];
            p[param.key] = (params && params[param.key] !== undefined) ? params[param.key] : param.default;
        }

        for (var i = 0; i < steps; i++) {
            state = rk4Step(sys.equations, state, p, dt);

            // Clamp to prevent divergence
            for (var j = 0; j < 3; j++) {
                if (!isFinite(state[j])) state[j] = 0;
                if (state[j] > 1e6) state[j] = 1e6;
                if (state[j] < -1e6) state[j] = -1e6;
            }

            var idx = i * 3;
            points[idx]     = state[0];
            points[idx + 1] = state[1];
            points[idx + 2] = state[2];

            // Compute speed = |derivative|
            var deriv = sys.equations(state, p);
            velocities[i] = Math.sqrt(deriv[0] * deriv[0] + deriv[1] * deriv[1] + deriv[2] * deriv[2]);
        }

        return { points: points, velocities: velocities };
    }

    // ==================== PUBLIC API ====================

    function listSystems() {
        return Object.keys(systems).map(function(key) {
            var s = systems[key];
            return { key: s.key, name: s.name, description: s.description, color: s.color };
        });
    }

    function getSystem(key) {
        return systems[key] || null;
    }

    return {
        listSystems: listSystems,
        getSystem: getSystem,
        rk4Step: rk4Step,
        integrate: integrate,
    };
})();
