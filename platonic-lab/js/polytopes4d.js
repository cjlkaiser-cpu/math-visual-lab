/**
 * PlatonicPolytopes4D — 4D regular polytopes projected to 3D
 *
 * The 6 regular polytopes in 4D:
 *   5-cell (simplex), tesseract (hypercube), 16-cell, 24-cell, 120-cell, 600-cell
 *
 * We implement the first 4 fully, and simplified versions of 120/600-cell.
 */
window.PlatonicPolytopes4D = (() => {

    // ==================== POLYTOPE DATA ====================

    const polytopes = {
        cell5: {
            name: '5-cell (Pentacoro)',
            nameEn: '5-cell (Pentachoron)',
            analogy: 'Tetraedro',
            cells: 5, faces: 10, edges: 10, vertices: 5,
            cellType: 'Tetraedro',
            schlafli: '{3,3,3}',
            build: build5Cell,
        },
        tesseract: {
            name: 'Teseracto (Hipercubo)',
            nameEn: 'Tesseract (Hypercube)',
            analogy: 'Cubo',
            cells: 8, faces: 24, edges: 32, vertices: 16,
            cellType: 'Cubo',
            schlafli: '{4,3,3}',
            build: buildTesseract,
        },
        cell16: {
            name: '16-cell (Hexadecacoro)',
            nameEn: '16-cell',
            analogy: 'Octaedro',
            cells: 16, faces: 32, edges: 24, vertices: 8,
            cellType: 'Tetraedro',
            schlafli: '{3,3,4}',
            build: build16Cell,
        },
        cell24: {
            name: '24-cell (Icositetracoro)',
            nameEn: '24-cell',
            analogy: '— (sin análogo 3D)',
            cells: 24, faces: 96, edges: 96, vertices: 24,
            cellType: 'Octaedro',
            schlafli: '{3,4,3}',
            build: build24Cell,
        },
        cell120: {
            name: '120-cell (Hecatonicosacoro)',
            nameEn: '120-cell',
            analogy: 'Dodecaedro',
            cells: 120, faces: 720, edges: 1200, vertices: 600,
            cellType: 'Dodecaedro',
            schlafli: '{5,3,3}',
            build: build120Cell,
        },
        cell600: {
            name: '600-cell (Hexacosicoro)',
            nameEn: '600-cell',
            analogy: 'Icosaedro',
            cells: 600, faces: 1200, edges: 720, vertices: 120,
            cellType: 'Tetraedro',
            schlafli: '{3,3,5}',
            build: build600Cell,
        },
    };

    // ==================== BUILDERS ====================

    function build5Cell() {
        // 5 vertices of regular simplex in 4D
        const s = 1 / Math.sqrt(10);
        const verts = [
            [1, 1, 1, -1 / Math.sqrt(5)],
            [1, -1, -1, -1 / Math.sqrt(5)],
            [-1, 1, -1, -1 / Math.sqrt(5)],
            [-1, -1, 1, -1 / Math.sqrt(5)],
            [0, 0, 0, Math.sqrt(5) - 1 / Math.sqrt(5)],
        ].map(v => normalize4(v));

        // All pairs of 5 vertices form edges (complete graph K5)
        const edges = [];
        for (let i = 0; i < 5; i++) {
            for (let j = i + 1; j < 5; j++) {
                edges.push([i, j]);
            }
        }

        return { vertices: verts, edges };
    }

    function buildTesseract() {
        // 16 vertices: all combinations of (±1, ±1, ±1, ±1) / 2
        const verts = [];
        for (let w = -1; w <= 1; w += 2) {
            for (let z = -1; z <= 1; z += 2) {
                for (let y = -1; y <= 1; y += 2) {
                    for (let x = -1; x <= 1; x += 2) {
                        verts.push([x * 0.5, y * 0.5, z * 0.5, w * 0.5]);
                    }
                }
            }
        }

        // Edges connect vertices that differ in exactly one coordinate
        const edges = [];
        for (let i = 0; i < verts.length; i++) {
            for (let j = i + 1; j < verts.length; j++) {
                let diffCount = 0;
                for (let k = 0; k < 4; k++) {
                    if (Math.abs(verts[i][k] - verts[j][k]) > 0.01) diffCount++;
                }
                if (diffCount === 1) edges.push([i, j]);
            }
        }

        return { vertices: verts, edges };
    }

    function build16Cell() {
        // 8 vertices: ±1 along each of 4 axes
        const verts = [];
        for (let axis = 0; axis < 4; axis++) {
            for (const sign of [-1, 1]) {
                const v = [0, 0, 0, 0];
                v[axis] = sign;
                verts.push(v);
            }
        }

        // Edges connect all pairs except antipodal (same axis)
        const edges = [];
        for (let i = 0; i < verts.length; i++) {
            for (let j = i + 1; j < verts.length; j++) {
                // Antipodal: same axis, opposite sign (distance = 2)
                const d = dist4(verts[i], verts[j]);
                if (d < 1.5) edges.push([i, j]); // edge length is √2 ≈ 1.414
            }
        }

        return { vertices: verts, edges };
    }

    function build24Cell() {
        // 24 vertices: all permutations of (±1, ±1, 0, 0) / √2
        const verts = [];
        const s = 1 / Math.sqrt(2);

        // 8 vertices like 16-cell
        for (let axis = 0; axis < 4; axis++) {
            for (const sign of [-1, 1]) {
                const v = [0, 0, 0, 0];
                v[axis] = sign;
                verts.push(v);
            }
        }

        // 16 vertices like tesseract (±1, ±1, ±1, ±1) / 2
        // Wait, 24-cell has exactly 24 vertices. Use the correct ones:
        // All permutations of (±1, ±1, 0, 0)
        for (let i = 0; i < 4; i++) {
            for (let j = i + 1; j < 4; j++) {
                for (const si of [-1, 1]) {
                    for (const sj of [-1, 1]) {
                        const v = [0, 0, 0, 0];
                        v[i] = si;
                        v[j] = sj;
                        verts.push(v);
                    }
                }
            }
        }

        // Remove duplicates (the first 8 are included in the second set)
        const unique = [];
        const seen = new Set();
        for (const v of verts) {
            const key = v.map(x => x.toFixed(4)).join(',');
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(v);
            }
        }

        // Edges: vertices at distance 1 (edge length = 1 for unit 24-cell coords above)
        // Actually, with these coords, edges have length √2
        const edgeThreshold = Math.sqrt(2) * 1.01;
        const edges = [];
        for (let i = 0; i < unique.length; i++) {
            for (let j = i + 1; j < unique.length; j++) {
                const d = dist4(unique[i], unique[j]);
                if (d > 0.1 && d < edgeThreshold) edges.push([i, j]);
            }
        }

        return { vertices: unique, edges };
    }

    function build120Cell() {
        // 120-cell has 600 vertices — too many to enumerate manually.
        // Use a simplified representation: just the 20 vertices of a dodecahedron
        // extruded into 4D, as an approximation for visualization.
        // For a real 120-cell, we'd need the full vertex list.
        //
        // Simplified: use an expanded subset showing the structure
        const phi = (1 + Math.sqrt(5)) / 2;

        // Use permutations of key coordinates
        // For visualization, we'll generate vertices using known formulas
        // and limit to a representative subset
        const verts = [];
        const s = 0.5;

        // 24 vertices from permutations of (±2, ±2, 0, 0) / (2√2)
        const coords = [
            [0, 0, 2, 2], [0, 0, 2, -2], [0, 0, -2, 2], [0, 0, -2, -2],
            [0, 2, 0, 2], [0, 2, 0, -2], [0, -2, 0, 2], [0, -2, 0, -2],
            [0, 2, 2, 0], [0, 2, -2, 0], [0, -2, 2, 0], [0, -2, -2, 0],
            [2, 0, 0, 2], [2, 0, 0, -2], [-2, 0, 0, 2], [-2, 0, 0, -2],
            [2, 0, 2, 0], [2, 0, -2, 0], [-2, 0, 2, 0], [-2, 0, -2, 0],
            [2, 2, 0, 0], [2, -2, 0, 0], [-2, 2, 0, 0], [-2, -2, 0, 0],
        ];

        // Also add tesseract vertices
        for (let w = -1; w <= 1; w += 2)
            for (let z = -1; z <= 1; z += 2)
                for (let y = -1; y <= 1; y += 2)
                    for (let x = -1; x <= 1; x += 2)
                        coords.push([x * phi, y * phi, z * phi, w * phi]);

        // Normalize
        coords.forEach(c => {
            const n = normalize4(c);
            verts.push(n);
        });

        // Edges: closest pairs
        const edges = findEdges4D(verts, 0.85);
        return { vertices: verts, edges };
    }

    function build600Cell() {
        // 600-cell has 120 vertices. Use the icosahedral structure.
        const phi = (1 + Math.sqrt(5)) / 2;
        const verts = [];

        // 8 vertices (±1, 0, 0, 0) and permutations (like 16-cell)
        for (let axis = 0; axis < 4; axis++) {
            for (const sign of [-1, 1]) {
                const v = [0, 0, 0, 0];
                v[axis] = sign;
                verts.push(v);
            }
        }

        // 16 vertices (±0.5, ±0.5, ±0.5, ±0.5)
        for (let w = -1; w <= 1; w += 2)
            for (let z = -1; z <= 1; z += 2)
                for (let y = -1; y <= 1; y += 2)
                    for (let x = -1; x <= 1; x += 2)
                        verts.push([x * 0.5, y * 0.5, z * 0.5, w * 0.5]);

        // 96 vertices from even permutations of (±φ/2, ±1/2, ±1/(2φ), 0)
        const a = phi / 2, b = 0.5, c = 1 / (2 * phi);
        const perms = [
            [a, b, c, 0], [a, b, 0, c], [a, 0, b, c], [0, a, b, c],
            [b, c, 0, a], [b, 0, c, a], [0, b, c, a], [c, 0, a, b],
            [c, a, 0, b], [0, c, a, b], [b, a, c, 0], [c, b, a, 0],
        ];

        for (const perm of perms) {
            // All sign combinations
            for (let s0 = -1; s0 <= 1; s0 += 2)
                for (let s1 = -1; s1 <= 1; s1 += 2)
                    for (let s2 = -1; s2 <= 1; s2 += 2)
                        for (let s3 = -1; s3 <= 1; s3 += 2) {
                            const v = [perm[0] * s0, perm[1] * s1, perm[2] * s2, perm[3] * s3];
                            if (perm[3] === 0 && s3 === -1) continue; // skip ±0
                            if (perm[2] === 0 && s2 === -1) continue;
                            verts.push(v);
                        }
        }

        // Deduplicate
        const unique = dedup4(verts);

        // Normalize to unit sphere
        const normalized = unique.map(normalize4);

        // Edges: nearest neighbors
        const edges = findEdges4D(normalized, 0.75);

        return { vertices: normalized, edges };
    }

    // ==================== 4D PROJECTION ====================

    /**
     * Stereographic projection from 4D to 3D.
     * Projects from the point (0,0,0,d) onto the w=0 hyperplane.
     */
    function stereographicProject(v4, viewDistance) {
        const d = viewDistance || 3;
        const w = v4[3];
        const scale = d / (d - w);
        return [v4[0] * scale, v4[1] * scale, v4[2] * scale];
    }

    /**
     * Perspective projection from 4D to 3D.
     * Simpler than stereographic, good for polytopes near the origin.
     */
    function perspectiveProject(v4, viewDistance) {
        const d = viewDistance || 3;
        const factor = d / (d + v4[3]);
        return [v4[0] * factor, v4[1] * factor, v4[2] * factor];
    }

    // ==================== 4D ROTATION ====================

    /**
     * Rotate a 4D point in the XW plane by angle (radians).
     */
    function rotateXW(v, angle) {
        const c = Math.cos(angle), s = Math.sin(angle);
        return [
            v[0] * c - v[3] * s,
            v[1],
            v[2],
            v[0] * s + v[3] * c,
        ];
    }

    /**
     * Rotate a 4D point in the YW plane by angle (radians).
     */
    function rotateYW(v, angle) {
        const c = Math.cos(angle), s = Math.sin(angle);
        return [
            v[0],
            v[1] * c - v[3] * s,
            v[2],
            v[1] * s + v[3] * c,
        ];
    }

    /**
     * Rotate a 4D point in the ZW plane by angle (radians).
     */
    function rotateZW(v, angle) {
        const c = Math.cos(angle), s = Math.sin(angle);
        return [
            v[0],
            v[1],
            v[2] * c - v[3] * s,
            v[2] * s + v[3] * c,
        ];
    }

    /**
     * Rotate in XY plane (standard 3D Z-axis rotation in 4D context).
     */
    function rotateXY(v, angle) {
        const c = Math.cos(angle), s = Math.sin(angle);
        return [
            v[0] * c - v[1] * s,
            v[0] * s + v[1] * c,
            v[2],
            v[3],
        ];
    }

    /**
     * Apply multiple 4D rotations.
     */
    function rotate4D(v, angles) {
        let r = v;
        if (angles.xw) r = rotateXW(r, angles.xw);
        if (angles.yw) r = rotateYW(r, angles.yw);
        if (angles.zw) r = rotateZW(r, angles.zw);
        if (angles.xy) r = rotateXY(r, angles.xy);
        return r;
    }

    // ==================== THREE.JS CONVERSION ====================

    /**
     * Create Three.js line segments from a 4D polytope projected to 3D.
     */
    function createProjectedEdges(polytope, angles, viewDist, scale, colorByW) {
        const { vertices, edges } = polytope;
        const points = [];
        const colors = [];

        for (const [i, j] of edges) {
            const vi = rotate4D(vertices[i], angles);
            const vj = rotate4D(vertices[j], angles);
            const pi = perspectiveProject(vi, viewDist);
            const pj = perspectiveProject(vj, viewDist);

            points.push(
                new THREE.Vector3(pi[0] * scale, pi[1] * scale, pi[2] * scale),
                new THREE.Vector3(pj[0] * scale, pj[1] * scale, pj[2] * scale)
            );

            if (colorByW) {
                // Color by w-coordinate: near = bright, far = dim
                const wi = (vi[3] + 1) / 2; // normalize to [0, 1]
                const wj = (vj[3] + 1) / 2;
                colors.push(wi, wi, wi, wj, wj, wj); // grayscale by depth
            }
        }

        const geom = new THREE.BufferGeometry().setFromPoints(points);

        let mat;
        if (colorByW && colors.length > 0) {
            geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            mat = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.7,
            });
        } else {
            mat = new THREE.LineBasicMaterial({
                color: 0xa78bfa,
                transparent: true,
                opacity: 0.6,
            });
        }

        return new THREE.LineSegments(geom, mat);
    }

    /**
     * Create vertex dots for projected 4D polytope.
     */
    function createProjectedVertices(polytope, angles, viewDist, scale) {
        const positions = [];
        for (const v of polytope.vertices) {
            const rotated = rotate4D(v, angles);
            const p = perspectiveProject(rotated, viewDist);
            positions.push(p[0] * scale, p[1] * scale, p[2] * scale);
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0x22d3ee,
            size: 0.04,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
        });

        return new THREE.Points(geom, mat);
    }

    // ==================== UTILITIES ====================

    function normalize4(v) {
        const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2] + v[3] * v[3]);
        return len > 0 ? [v[0] / len, v[1] / len, v[2] / len, v[3] / len] : [0, 0, 0, 0];
    }

    function dist4(a, b) {
        const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2], dw = a[3] - b[3];
        return Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
    }

    function dedup4(verts) {
        const unique = [];
        const seen = new Set();
        for (const v of verts) {
            const key = v.map(x => x.toFixed(4)).join(',');
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(v);
            }
        }
        return unique;
    }

    function findEdges4D(verts, threshold) {
        // Find minimum non-zero distance, then use threshold relative to it
        let minDist = Infinity;
        for (let i = 0; i < Math.min(verts.length, 50); i++) {
            for (let j = i + 1; j < Math.min(verts.length, 50); j++) {
                const d = dist4(verts[i], verts[j]);
                if (d > 0.01 && d < minDist) minDist = d;
            }
        }

        const edgeLen = minDist * (threshold ? threshold / (minDist * 0.5) : 1.05);
        const edges = [];
        for (let i = 0; i < verts.length; i++) {
            for (let j = i + 1; j < verts.length; j++) {
                if (dist4(verts[i], verts[j]) < minDist * 1.05) {
                    edges.push([i, j]);
                }
            }
        }
        return edges;
    }

    return {
        polytopes,
        stereographicProject,
        perspectiveProject,
        rotate4D,
        rotateXW,
        rotateYW,
        rotateZW,
        rotateXY,
        createProjectedEdges,
        createProjectedVertices,
    };
})();
