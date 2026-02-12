/**
 * PlatonicGeometry — Data and geometry for the 5 Platonic solids
 */
window.PlatonicGeometry = (() => {

    const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio ≈ 1.618

    const solids = {
        tetrahedron: {
            name: 'Tetraedro',
            nameEn: 'Tetrahedron',
            schlafli: '{3,3}',
            V: 4, E: 6, F: 4,
            faceType: 'Triángulo',
            faceTypeEn: 'Triangle',
            faceSides: 3,
            facesPerVertex: 3,
            edgesPerVertex: 3,
            dihedralAngleDeg: 70.528,
            dihedralAngleExact: '\\arccos\\left(\\frac{1}{3}\\right)',
            solidAngleSr: 0.5513,
            symmetryGroup: 'T_d',
            symmetryOrder: 24,
            element: 'Fuego',
            elementEn: 'Fire',
            elementEmoji: '🔥',
            dual: 'tetrahedron',
            dualName: 'Tetraedro',
            // Coefficients: property = coeff * a^n
            volumeCoeff: Math.sqrt(2) / 12,       // V = (√2/12)a³
            areaCoeff: Math.sqrt(3),               // A = √3 a²
            circumradiusCoeff: Math.sqrt(6) / 4,   // R = (√6/4)a
            insphereCoeff: Math.sqrt(6) / 12,      // r = (√6/12)a = R/3
            midradiusCoeff: Math.sqrt(2) / 4,      // ρ = (√2/4)a
            color: 0xef4444,
            accentColor: '#ef4444',
            threeGeometry: 'TetrahedronGeometry',
        },
        cube: {
            name: 'Cubo',
            nameEn: 'Cube',
            schlafli: '{4,3}',
            V: 8, E: 12, F: 6,
            faceType: 'Cuadrado',
            faceTypeEn: 'Square',
            faceSides: 4,
            facesPerVertex: 3,
            edgesPerVertex: 3,
            dihedralAngleDeg: 90,
            dihedralAngleExact: '90°',
            solidAngleSr: 1.5708,
            symmetryGroup: 'O_h',
            symmetryOrder: 48,
            element: 'Tierra',
            elementEn: 'Earth',
            elementEmoji: '🌍',
            dual: 'octahedron',
            dualName: 'Octaedro',
            volumeCoeff: 1,                        // V = a³
            areaCoeff: 6,                           // A = 6a²
            circumradiusCoeff: Math.sqrt(3) / 2,   // R = (√3/2)a
            insphereCoeff: 0.5,                     // r = a/2
            midradiusCoeff: Math.sqrt(2) / 2,       // ρ = (√2/2)a
            color: 0x22c55e,
            accentColor: '#22c55e',
            threeGeometry: 'BoxGeometry',
        },
        octahedron: {
            name: 'Octaedro',
            nameEn: 'Octahedron',
            schlafli: '{3,4}',
            V: 6, E: 12, F: 8,
            faceType: 'Triángulo',
            faceTypeEn: 'Triangle',
            faceSides: 3,
            facesPerVertex: 4,
            edgesPerVertex: 4,
            dihedralAngleDeg: 109.471,
            dihedralAngleExact: '\\arccos\\left(-\\frac{1}{3}\\right)',
            solidAngleSr: 1.3593,
            symmetryGroup: 'O_h',
            symmetryOrder: 48,
            element: 'Aire',
            elementEn: 'Air',
            elementEmoji: '💨',
            dual: 'cube',
            dualName: 'Cubo',
            volumeCoeff: Math.sqrt(2) / 3,         // V = (√2/3)a³
            areaCoeff: 2 * Math.sqrt(3),            // A = 2√3 a²
            circumradiusCoeff: Math.sqrt(2) / 2,   // R = (√2/2)a
            insphereCoeff: Math.sqrt(6) / 6,        // r = (√6/6)a
            midradiusCoeff: 0.5,                    // ρ = a/2
            color: 0xfacc15,
            accentColor: '#facc15',
            threeGeometry: 'OctahedronGeometry',
        },
        dodecahedron: {
            name: 'Dodecaedro',
            nameEn: 'Dodecahedron',
            schlafli: '{5,3}',
            V: 20, E: 30, F: 12,
            faceType: 'Pentágono',
            faceTypeEn: 'Pentagon',
            faceSides: 5,
            facesPerVertex: 3,
            edgesPerVertex: 3,
            dihedralAngleDeg: 116.565,
            dihedralAngleExact: '\\arctan(2)',
            solidAngleSr: 2.9617,
            symmetryGroup: 'I_h',
            symmetryOrder: 120,
            element: 'Éter',
            elementEn: 'Ether',
            elementEmoji: '✨',
            dual: 'icosahedron',
            dualName: 'Icosaedro',
            volumeCoeff: (15 + 7 * Math.sqrt(5)) / 4, // V = ((15+7√5)/4)a³
            areaCoeff: 3 * Math.sqrt(25 + 10 * Math.sqrt(5)), // A = 3√(25+10√5) a²
            circumradiusCoeff: (Math.sqrt(3) / 2) * PHI, // R = (√3/2)φ a  ≈ 1.401
            insphereCoeff: PHI * PHI / (2 * Math.sqrt(3)), // r ≈ 1.113
            midradiusCoeff: (PHI * PHI) / 2,        // ρ = φ²/2 a
            color: 0xa855f7,
            accentColor: '#a855f7',
            threeGeometry: 'DodecahedronGeometry',
        },
        icosahedron: {
            name: 'Icosaedro',
            nameEn: 'Icosahedron',
            schlafli: '{3,5}',
            V: 12, E: 30, F: 20,
            faceType: 'Triángulo',
            faceTypeEn: 'Triangle',
            faceSides: 3,
            facesPerVertex: 5,
            edgesPerVertex: 5,
            dihedralAngleDeg: 138.190,
            dihedralAngleExact: '\\arccos\\left(-\\frac{\\sqrt{5}}{3}\\right)',
            solidAngleSr: 2.6344,
            symmetryGroup: 'I_h',
            symmetryOrder: 120,
            element: 'Agua',
            elementEn: 'Water',
            elementEmoji: '💧',
            dual: 'dodecahedron',
            dualName: 'Dodecaedro',
            volumeCoeff: (5 * (3 + Math.sqrt(5))) / 12, // V = 5(3+√5)/12 a³
            areaCoeff: 5 * Math.sqrt(3),            // A = 5√3 a²
            circumradiusCoeff: PHI * Math.sqrt(5) / (2 * Math.sqrt(5 - Math.sqrt(5)) || 1), // sin(2π/5) formula
            insphereCoeff: PHI * PHI / (2 * Math.sqrt(3)), // r ≈ 0.7558
            midradiusCoeff: PHI / 2,                // ρ = φ/2 a
            color: 0x3b82f6,
            accentColor: '#3b82f6',
            threeGeometry: 'IcosahedronGeometry',
        },
    };

    // Fix icosahedron circumradius using exact formula: R = a * sin(2π/5) * φ / ...
    // Actually: R = (a/2) * φ * √( (5+√5) / (5−√5) ) ... simplify:
    // R = a * φ / 2  * sqrt( (5+√5)/(5-√5) )  ... but simpler: R = a * sin(2π/5) / sin(π/5) / 2
    // Exact: R = a * (√(10 + 2√5)) / 4  ≈ 0.9511a
    solids.icosahedron.circumradiusCoeff = Math.sqrt(10 + 2 * Math.sqrt(5)) / 4;
    // Insphere: r = a * φ² / (2√3) ≈ 0.7558
    solids.icosahedron.insphereCoeff = PHI * PHI / (2 * Math.sqrt(3));

    // Fix dodecahedron insphere with correct formula
    // r = a * √(25 + 11√5) / (4√2)  ... or  r = a * (1/2)√((25 + 11√5)/10)
    // Simpler: r = a * φ² / (2√(3-1/φ))  ... Let's use numeric
    // Exact: r = a * (1/(2√3)) * √(25 + 11√5) * (1/√2)   ... just use numeric ≈ 1.1135
    solids.dodecahedron.insphereCoeff = 1.11352;

    /**
     * Get construction steps for a solid
     */
    function getConstructionSteps(solidKey) {
        const steps = {
            tetrahedron: [
                { title: 'Paso 1: Vértices', desc: 'Posicionar 4 vértices equidistantes en el espacio formando un tetraedro regular.', show: 'vertices' },
                { title: 'Paso 2: Aristas', desc: 'Conectar cada par de vértices con una arista. Son 6 aristas de igual longitud.', show: 'edges' },
                { title: 'Paso 3: Caras', desc: 'Cada grupo de 3 vértices forma una cara triangular equilátera. Son 4 caras.', show: 'faces' },
                { title: 'Paso 4: Sólido completo', desc: 'El tetraedro regular: el más simple de los sólidos platónicos. Auto-dual.', show: 'complete' },
            ],
            cube: [
                { title: 'Paso 1: Vértices', desc: 'Posicionar 8 vértices en las esquinas de un cubo de lado a.', show: 'vertices' },
                { title: 'Paso 2: Aristas', desc: 'Conectar vértices adyacentes con 12 aristas iguales.', show: 'edges' },
                { title: 'Paso 3: Caras', desc: 'Cerrar las 6 caras cuadradas del cubo (hexaedro regular).', show: 'faces' },
                { title: 'Paso 4: Sólido completo', desc: 'El cubo: el único sólido platónico con caras cuadradas. Dual del octaedro.', show: 'complete' },
            ],
            octahedron: [
                { title: 'Paso 1: Vértices', desc: 'Posicionar 6 vértices: uno en cada semieje (±x, ±y, ±z).', show: 'vertices' },
                { title: 'Paso 2: Aristas', desc: 'Conectar cada vértice con sus 4 vecinos. Son 12 aristas iguales.', show: 'edges' },
                { title: 'Paso 3: Caras', desc: 'Formar 8 caras triangulares equiláteras, 4 en cada hemisferio.', show: 'faces' },
                { title: 'Paso 4: Sólido completo', desc: 'El octaedro regular: dual del cubo. Unión de dos pirámides.', show: 'complete' },
            ],
            dodecahedron: [
                { title: 'Paso 1: Vértices', desc: 'Posicionar 20 vértices usando coordenadas basadas en la razón áurea φ.', show: 'vertices' },
                { title: 'Paso 2: Aristas', desc: 'Conectar vértices adyacentes con 30 aristas iguales.', show: 'edges' },
                { title: 'Paso 3: Caras', desc: 'Formar 12 caras pentagonales regulares.', show: 'faces' },
                { title: 'Paso 4: Sólido completo', desc: 'El dodecaedro: el cosmos según Platón. Dual del icosaedro.', show: 'complete' },
            ],
            icosahedron: [
                { title: 'Paso 1: Vértices', desc: 'Posicionar 12 vértices usando la razón áurea en 3 rectángulos áureos ortogonales.', show: 'vertices' },
                { title: 'Paso 2: Aristas', desc: 'Conectar vértices cercanos con 30 aristas iguales.', show: 'edges' },
                { title: 'Paso 3: Caras', desc: 'Formar 20 caras triangulares equiláteras.', show: 'faces' },
                { title: 'Paso 4: Sólido completo', desc: 'El icosaedro: 20 caras, máximo número entre los platónicos. Dual del dodecaedro.', show: 'complete' },
            ],
        };
        return steps[solidKey] || steps.tetrahedron;
    }

    /**
     * Get dual scale factor — scale to place dual at face centroids
     */
    function getDualScale(solidKey) {
        const scales = {
            tetrahedron: 1 / 3,
            cube: 1 / Math.sqrt(3),
            octahedron: Math.sqrt(3) / 3,
            dodecahedron: 1 / (PHI * PHI),
            icosahedron: PHI / (PHI + 1),
        };
        return scales[solidKey] || 0.5;
    }

    /**
     * Compute face centroids of a Three.js geometry for dual placement
     */
    function getFaceCentroids(geometry) {
        const pos = geometry.getAttribute('position');
        const index = geometry.getIndex();
        const centroids = [];

        if (index) {
            for (let i = 0; i < index.count; i += 3) {
                const a = index.getX(i);
                const b = index.getX(i + 1);
                const c = index.getX(i + 2);
                centroids.push(new THREE.Vector3(
                    (pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3,
                    (pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3,
                    (pos.getZ(a) + pos.getZ(b) + pos.getZ(c)) / 3
                ));
            }
        }
        return centroids;
    }

    /**
     * Linear interpolation of vertex arrays for morph
     */
    function getMorphVertices(fromPositions, toPositions, t) {
        const maxLen = Math.max(fromPositions.length, toPositions.length);
        const result = new Float32Array(maxLen);

        for (let i = 0; i < maxLen; i++) {
            const fromVal = i < fromPositions.length ? fromPositions[i] : fromPositions[i % fromPositions.length];
            const toVal = i < toPositions.length ? toPositions[i] : toPositions[i % toPositions.length];
            result[i] = fromVal + (toVal - fromVal) * t;
        }
        return result;
    }

    /**
     * Net fold data (simplified — tetrahedron and cube only for v1)
     */
    function getNetData(solidKey) {
        const nets = {
            tetrahedron: {
                available: true,
                faceCount: 4,
                description: 'Red del tetraedro: 4 triángulos equiláteros dispuestos en forma de triángulo grande.',
            },
            cube: {
                available: true,
                faceCount: 6,
                description: 'Red del cubo: 6 cuadrados en forma de cruz.',
            },
            octahedron: { available: false, faceCount: 8, description: 'Red del octaedro (próximamente).' },
            dodecahedron: { available: false, faceCount: 12, description: 'Red del dodecaedro (próximamente).' },
            icosahedron: { available: false, faceCount: 20, description: 'Red del icosaedro (próximamente).' },
        };
        return nets[solidKey] || nets.tetrahedron;
    }

    return {
        solids,
        PHI,
        getConstructionSteps,
        getDualScale,
        getFaceCentroids,
        getMorphVertices,
        getNetData,
    };
})();
