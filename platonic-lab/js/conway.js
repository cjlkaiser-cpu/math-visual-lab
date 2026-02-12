/**
 * PlatonicConway — Conway polyhedron operations
 *
 * Polyhedron format:
 *   { vertices: [[x,y,z], ...], faces: [[i,j,k,...], ...], name: string }
 *
 * Operations: dual (d), truncate (t), ambo/rectify (a), expand (e), snub (s)
 * These generate Archimedean solids from Platonic seeds.
 */
window.PlatonicConway = (() => {

    // ==================== SEED POLYHEDRA ====================

    /**
     * Generate seed polyhedra as vertex/face data (unit circumradius).
     */
    function getSeed(solidKey) {
        switch (solidKey) {
            case 'tetrahedron': return tetrahedronSeed();
            case 'cube': return cubeSeed();
            case 'octahedron': return octahedronSeed();
            case 'dodecahedron': return dodecahedronSeed();
            case 'icosahedron': return icosahedronSeed();
            default: return tetrahedronSeed();
        }
    }

    function tetrahedronSeed() {
        const v = [
            [1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]
        ].map(normalize);
        return {
            vertices: v,
            faces: [[0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 3, 2]],
            name: 'Tetraedro',
        };
    }

    function cubeSeed() {
        const s = 1 / Math.sqrt(3);
        const v = [
            [-s, -s, -s], [-s, -s, s], [-s, s, -s], [-s, s, s],
            [s, -s, -s], [s, -s, s], [s, s, -s], [s, s, s],
        ];
        return {
            vertices: v,
            faces: [
                [0, 2, 3, 1], [4, 5, 7, 6], [0, 1, 5, 4],
                [2, 6, 7, 3], [0, 4, 6, 2], [1, 3, 7, 5],
            ],
            name: 'Cubo',
        };
    }

    function octahedronSeed() {
        const v = [
            [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]
        ];
        return {
            vertices: v,
            faces: [
                [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2],
                [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5],
            ],
            name: 'Octaedro',
        };
    }

    function dodecahedronSeed() {
        const phi = (1 + Math.sqrt(5)) / 2;
        const a = 1 / Math.sqrt(3);
        const b = a / phi;
        const c = a * phi;

        const raw = [
            [a, a, a], [a, a, -a], [a, -a, a], [a, -a, -a],
            [-a, a, a], [-a, a, -a], [-a, -a, a], [-a, -a, -a],
            [0, b, c], [0, b, -c], [0, -b, c], [0, -b, -c],
            [b, c, 0], [b, -c, 0], [-b, c, 0], [-b, -c, 0],
            [c, 0, b], [c, 0, -b], [-c, 0, b], [-c, 0, -b],
        ];

        const v = raw.map(normalize);

        // Faces of a dodecahedron (pentagons, CCW from outside)
        const faces = [
            [0, 8, 4, 14, 12], [0, 16, 2, 10, 8], [0, 12, 1, 17, 16],
            [1, 9, 5, 14, 12], [1, 12, 14, 5, 9].reverse().reverse(), // fix:
            [2, 16, 17, 3, 13], [2, 13, 15, 6, 10],
            [3, 17, 1, 9, 11], [3, 11, 7, 15, 13],
            [4, 8, 10, 6, 18], [4, 18, 19, 5, 14],
            [5, 19, 7, 11, 9], [6, 15, 7, 19, 18],
        ];

        // Recompute faces properly using adjacency
        return {
            vertices: v,
            faces: computeDodecahedronFaces(v),
            name: 'Dodecaedro',
        };
    }

    function computeDodecahedronFaces(vertices) {
        // Build edge adjacency from known dodecahedron connectivity
        const phi = (1 + Math.sqrt(5)) / 2;
        const edgeLen = 2 / (Math.sqrt(3) * phi); // edge length for unit circumradius
        const threshold = edgeLen * 1.1;

        const adj = vertices.map(() => []);
        for (let i = 0; i < vertices.length; i++) {
            for (let j = i + 1; j < vertices.length; j++) {
                if (dist(vertices[i], vertices[j]) < threshold) {
                    adj[i].push(j);
                    adj[j].push(i);
                }
            }
        }

        // Each vertex of dodecahedron has degree 3
        // Find pentagonal faces by walking edges
        return findFaces(vertices, adj, 5);
    }

    function icosahedronSeed() {
        const phi = (1 + Math.sqrt(5)) / 2;
        const len = Math.sqrt(1 + phi * phi);
        const a = 1 / len;
        const b = phi / len;

        const v = [
            [0, a, b], [0, a, -b], [0, -a, b], [0, -a, -b],
            [a, b, 0], [a, -b, 0], [-a, b, 0], [-a, -b, 0],
            [b, 0, a], [b, 0, -a], [-b, 0, a], [-b, 0, -a],
        ];

        // Build adjacency: each icosahedron vertex has degree 5
        const edgeLen = 2 * a;
        const threshold = edgeLen * 1.1;
        const adj = v.map(() => []);
        for (let i = 0; i < v.length; i++) {
            for (let j = i + 1; j < v.length; j++) {
                if (dist(v[i], v[j]) < threshold) {
                    adj[i].push(j);
                    adj[j].push(i);
                }
            }
        }

        return {
            vertices: v,
            faces: findFaces(v, adj, 3),
            name: 'Icosaedro',
        };
    }

    // ==================== FACE FINDING ====================

    /**
     * Find faces of a convex polyhedron given vertices and adjacency list.
     * expectedSides: expected polygon size per face (3 for icosahedron, 5 for dodecahedron, etc.)
     * For general use (after operations), pass 0 to auto-detect.
     */
    function findFaces(vertices, adj, expectedSides) {
        const edgeSet = new Set();
        const edges = [];

        for (let i = 0; i < adj.length; i++) {
            for (const j of adj[i]) {
                const key = i < j ? `${i}-${j}` : `${j}-${i}`;
                if (!edgeSet.has(key)) {
                    edgeSet.add(key);
                    edges.push([i, j]);
                }
            }
        }

        // For each directed edge (i→j), find the next edge in the face (j→k)
        // by choosing the neighbor of j (other than i) that is most clockwise
        // when viewed from outside.
        const faces = [];
        const usedDirected = new Set();

        for (const [a, b] of edges) {
            for (const dir of [[a, b], [b, a]]) {
                const startKey = `${dir[0]}-${dir[1]}`;
                if (usedDirected.has(startKey)) continue;

                const face = [];
                let cur = dir[0], next = dir[1];
                let safety = 20;

                while (safety-- > 0) {
                    face.push(cur);
                    const dKey = `${cur}-${next}`;
                    usedDirected.add(dKey);

                    // Find next vertex: among neighbors of `next` (excluding `cur`),
                    // pick the one that makes the smallest CCW angle
                    const prev = cur;
                    cur = next;
                    next = nextInFace(vertices, adj, prev, cur);

                    if (next === face[0] && cur === face[1 % face.length]) {
                        // Duplicate face
                        break;
                    }
                    if (next === face[0]) {
                        break;
                    }
                }

                if (face.length >= 3 && (expectedSides === 0 || face.length === expectedSides)) {
                    // Check we haven't already recorded this face
                    const faceKey = [...face].sort().join(',');
                    const isDup = faces.some(f => [...f].sort().join(',') === faceKey);
                    if (!isDup) {
                        faces.push(face);
                    }
                }
            }
        }

        // Orient faces consistently (normals pointing outward)
        const center = centroid(vertices);
        return faces.map(face => orientFace(vertices, face, center));
    }

    function nextInFace(vertices, adj, prev, cur) {
        const neighbors = adj[cur].filter(n => n !== prev);
        if (neighbors.length === 0) return prev;
        if (neighbors.length === 1) return neighbors[0];

        // Pick neighbor that makes the smallest left turn
        const vPrev = sub(vertices[prev], vertices[cur]);
        const normal = normalize3(vertices[cur]); // outward from origin for convex

        let bestAngle = Infinity;
        let bestN = neighbors[0];

        for (const n of neighbors) {
            const vNext = sub(vertices[n], vertices[cur]);
            const angle = signedAngle(vPrev, vNext, normal);
            // We want the most clockwise (smallest signed angle)
            const adjusted = angle < -1e-10 ? angle + 2 * Math.PI : angle;
            if (adjusted < bestAngle) {
                bestAngle = adjusted;
                bestN = n;
            }
        }

        return bestN;
    }

    function signedAngle(a, b, normal) {
        const cross = cross3(a, b);
        const dot = dot3(a, b);
        const sinA = dot3(cross, normal);
        return Math.atan2(sinA, dot);
    }

    // ==================== CONWAY OPERATIONS ====================

    /**
     * Dual (d): vertices↔faces. Each face becomes a vertex (at centroid),
     * each vertex becomes a face.
     */
    function dual(poly) {
        const { vertices, faces } = poly;

        // New vertices = centroids of old faces
        const newVerts = faces.map(face => {
            const c = [0, 0, 0];
            face.forEach(i => { c[0] += vertices[i][0]; c[1] += vertices[i][1]; c[2] += vertices[i][2]; });
            return [c[0] / face.length, c[1] / face.length, c[2] / face.length];
        });

        // Build vertex→face map: for each old vertex, which faces contain it?
        const vertToFaces = vertices.map(() => []);
        faces.forEach((face, fi) => {
            face.forEach(vi => vertToFaces[vi].push(fi));
        });

        // New faces: for each old vertex, the surrounding face-centroids in order
        const newFaces = [];
        for (let vi = 0; vi < vertices.length; vi++) {
            const surroundingFaces = vertToFaces[vi];
            if (surroundingFaces.length < 3) continue;

            // Order them by angle around the vertex
            const ordered = orderFacesAroundVertex(vertices, faces, vi, surroundingFaces);
            newFaces.push(ordered);
        }

        // Normalize to unit circumradius
        const result = { vertices: newVerts.map(normalize), faces: newFaces, name: `d(${poly.name})` };
        return result;
    }

    /**
     * Ambo / Rectify (a): vertices at edge midpoints.
     * Each old face becomes a smaller version, each old vertex becomes a new face.
     */
    function ambo(poly) {
        const { vertices, faces } = poly;

        // Edge midpoints as new vertices
        const edgeMap = {};
        const newVerts = [];

        function getEdgeVertex(i, j) {
            const key = i < j ? `${i}-${j}` : `${j}-${i}`;
            if (edgeMap[key] !== undefined) return edgeMap[key];
            const mid = [
                (vertices[i][0] + vertices[j][0]) / 2,
                (vertices[i][1] + vertices[j][1]) / 2,
                (vertices[i][2] + vertices[j][2]) / 2,
            ];
            const idx = newVerts.length;
            newVerts.push(mid);
            edgeMap[key] = idx;
            return idx;
        }

        // Face-derived faces: each old face → polygon of edge midpoints
        const newFaces = [];
        for (const face of faces) {
            const newFace = [];
            for (let i = 0; i < face.length; i++) {
                const j = (i + 1) % face.length;
                newFace.push(getEdgeVertex(face[i], face[j]));
            }
            newFaces.push(newFace);
        }

        // Vertex-derived faces: for each old vertex, collect surrounding edge midpoints
        const vertToEdges = vertices.map(() => []);
        for (const face of faces) {
            for (let i = 0; i < face.length; i++) {
                const j = (i + 1) % face.length;
                const ev = getEdgeVertex(face[i], face[j]);
                vertToEdges[face[i]].push(ev);
                vertToEdges[face[j]].push(ev);
            }
        }

        for (let vi = 0; vi < vertices.length; vi++) {
            const edgeVerts = [...new Set(vertToEdges[vi])];
            if (edgeVerts.length >= 3) {
                const ordered = orderVerticesAroundPoint(newVerts, edgeVerts, vertices[vi]);
                newFaces.push(ordered);
            }
        }

        return { vertices: newVerts.map(normalize), faces: newFaces, name: `a(${poly.name})` };
    }

    /**
     * Truncate (t): cut off each vertex, creating a new face per vertex.
     * Equivalent to ambo(ambo(poly)) but done directly for better control.
     */
    function truncate(poly, amount) {
        const t = amount !== undefined ? amount : 1 / 3;
        const { vertices, faces } = poly;

        // For each vertex, create new vertices along each edge at fraction t
        const newVerts = [];
        const edgePairMap = {}; // maps "vi-ei" to new vertex index

        // Build adjacency info
        const vertEdges = vertices.map(() => new Set());
        for (const face of faces) {
            for (let i = 0; i < face.length; i++) {
                const j = (i + 1) % face.length;
                vertEdges[face[i]].add(face[j]);
                vertEdges[face[j]].add(face[i]);
            }
        }

        // Create new vertices: for each edge endpoint, add a vertex at t from the vertex
        function getTruncVert(vi, vj) {
            const key = `${vi}-${vj}`;
            if (edgePairMap[key] !== undefined) return edgePairMap[key];
            const p = [
                vertices[vi][0] + t * (vertices[vj][0] - vertices[vi][0]),
                vertices[vi][1] + t * (vertices[vj][1] - vertices[vi][1]),
                vertices[vi][2] + t * (vertices[vj][2] - vertices[vi][2]),
            ];
            const idx = newVerts.length;
            newVerts.push(p);
            edgePairMap[key] = idx;
            return idx;
        }

        // Initialize all truncation vertices
        for (let vi = 0; vi < vertices.length; vi++) {
            for (const vj of vertEdges[vi]) {
                getTruncVert(vi, vj);
            }
        }

        const newFaces = [];

        // Face-derived faces: each old face → polygon with truncated corners
        for (const face of faces) {
            const newFace = [];
            for (let i = 0; i < face.length; i++) {
                const vi = face[i];
                const vj = face[(i + 1) % face.length];
                newFace.push(getTruncVert(vi, vj));
                newFace.push(getTruncVert(vj, vi));
            }
            newFaces.push(newFace);
        }

        // Vertex-derived faces: for each old vertex, collect the truncation vertices
        for (let vi = 0; vi < vertices.length; vi++) {
            const neighbors = [...vertEdges[vi]];
            const truncVerts = neighbors.map(vj => getTruncVert(vi, vj));
            if (truncVerts.length >= 3) {
                const ordered = orderVerticesAroundPoint(newVerts, truncVerts, vertices[vi]);
                newFaces.push(ordered);
            }
        }

        return { vertices: newVerts.map(normalize), faces: newFaces, name: `t(${poly.name})` };
    }

    /**
     * Expand / Cantellate (e): move faces outward and connect with squares.
     * Simplified: ambo of ambo.
     */
    function expand(poly) {
        return ambo(ambo(poly));
    }

    /**
     * Snub (s): like expand but with triangulated connections and chirality.
     * Simplified version using ambo + triangulation.
     */
    function snub(poly) {
        // Approximate: truncate then take dual, or use alternation
        // For now, use a simplified approach: ambo + slight twist
        const expanded = ambo(poly);
        // Triangulate non-triangular faces
        const newFaces = [];
        const verts = [...expanded.vertices];

        for (const face of expanded.faces) {
            if (face.length === 3) {
                newFaces.push(face);
            } else {
                // Fan triangulation from centroid
                const c = [0, 0, 0];
                face.forEach(i => {
                    c[0] += verts[i][0];
                    c[1] += verts[i][1];
                    c[2] += verts[i][2];
                });
                c[0] /= face.length;
                c[1] /= face.length;
                c[2] /= face.length;
                const ci = verts.length;
                verts.push(normalize(c));

                for (let i = 0; i < face.length; i++) {
                    const j = (i + 1) % face.length;
                    newFaces.push([face[i], face[j], ci]);
                }
            }
        }

        return { vertices: verts, faces: newFaces, name: `s(${poly.name})` };
    }

    // ==================== INTERPOLATION ====================

    /**
     * Interpolate between two polyhedra for animated transitions.
     * The polyhedra must have the same number of vertices.
     * Returns a new vertices array at parameter t ∈ [0, 1].
     */
    function interpolateVertices(vertsA, vertsB, t) {
        const maxLen = Math.max(vertsA.length, vertsB.length);
        const result = [];

        for (let i = 0; i < maxLen; i++) {
            const a = vertsA[i % vertsA.length];
            const b = vertsB[i % vertsB.length];
            result.push([
                a[0] + (b[0] - a[0]) * t,
                a[1] + (b[1] - a[1]) * t,
                a[2] + (b[2] - a[2]) * t,
            ]);
        }
        return result;
    }

    // ==================== THREE.JS CONVERSION ====================

    /**
     * Convert vertex/face polyhedron to a Three.js BufferGeometry.
     * Triangulates non-triangular faces via fan from centroid.
     */
    function toBufferGeometry(poly, scale) {
        const s = scale || 1;
        const positions = [];
        const normals = [];

        for (const face of poly.faces) {
            if (face.length < 3) continue;

            // Compute face normal
            const v0 = poly.vertices[face[0]];
            const v1 = poly.vertices[face[1]];
            const v2 = poly.vertices[face[2]];
            const n = normalize3(cross3(
                sub(v1, v0),
                sub(v2, v0)
            ));

            if (face.length === 3) {
                // Simple triangle
                for (const idx of face) {
                    const v = poly.vertices[idx];
                    positions.push(v[0] * s, v[1] * s, v[2] * s);
                    normals.push(n[0], n[1], n[2]);
                }
            } else {
                // Fan triangulation from first vertex
                for (let i = 1; i < face.length - 1; i++) {
                    const a = poly.vertices[face[0]];
                    const b = poly.vertices[face[i]];
                    const c = poly.vertices[face[i + 1]];
                    positions.push(a[0] * s, a[1] * s, a[2] * s);
                    positions.push(b[0] * s, b[1] * s, b[2] * s);
                    positions.push(c[0] * s, c[1] * s, c[2] * s);
                    normals.push(n[0], n[1], n[2], n[0], n[1], n[2], n[0], n[1], n[2]);
                }
            }
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        return geom;
    }

    /**
     * Create edge lines from vertex/face polyhedron.
     */
    function toEdgeGeometry(poly, scale) {
        const s = scale || 1;
        const edgeSet = new Set();
        const points = [];

        for (const face of poly.faces) {
            for (let i = 0; i < face.length; i++) {
                const a = face[i];
                const b = face[(i + 1) % face.length];
                const key = a < b ? `${a}-${b}` : `${b}-${a}`;
                if (!edgeSet.has(key)) {
                    edgeSet.add(key);
                    const va = poly.vertices[a];
                    const vb = poly.vertices[b];
                    points.push(
                        new THREE.Vector3(va[0] * s, va[1] * s, va[2] * s),
                        new THREE.Vector3(vb[0] * s, vb[1] * s, vb[2] * s)
                    );
                }
            }
        }

        const geom = new THREE.BufferGeometry().setFromPoints(points);
        return geom;
    }

    /**
     * Get info about a Conway result.
     */
    function getInfo(poly) {
        const V = poly.vertices.length;
        const edgeSet = new Set();
        for (const face of poly.faces) {
            for (let i = 0; i < face.length; i++) {
                const a = face[i];
                const b = face[(i + 1) % face.length];
                edgeSet.add(a < b ? `${a}-${b}` : `${b}-${a}`);
            }
        }
        const E = edgeSet.size;
        const F = poly.faces.length;
        const faceSizes = {};
        poly.faces.forEach(f => {
            faceSizes[f.length] = (faceSizes[f.length] || 0) + 1;
        });

        return { V, E, F, euler: V - E + F, faceSizes, name: poly.name };
    }

    // ==================== OPERATION REGISTRY ====================

    const operations = {
        dual: { fn: dual, label: 'Dual (d)', desc: 'Intercambia vértices y caras' },
        truncate: { fn: truncate, label: 'Truncar (t)', desc: 'Corta los vértices' },
        ambo: { fn: ambo, label: 'Rectificar (a)', desc: 'Vértices en puntos medios de aristas' },
        expand: { fn: expand, label: 'Expandir (e)', desc: 'Separa caras y conecta con cuadrados' },
        snub: { fn: snub, label: 'Snub (s)', desc: 'Expansión con triangulación quiral' },
    };

    // ==================== KNOWN RESULTS ====================

    const knownResults = {
        'tetrahedron+dual': 'Tetraedro (auto-dual)',
        'tetrahedron+truncate': 'Tetraedro truncado',
        'tetrahedron+ambo': 'Octaedro (rectificación)',
        'cube+dual': 'Octaedro',
        'cube+truncate': 'Cubo truncado',
        'cube+ambo': 'Cuboctaedro',
        'cube+expand': 'Rombicuboctaedro',
        'cube+snub': 'Cubo snub',
        'octahedron+dual': 'Cubo',
        'octahedron+truncate': 'Octaedro truncado',
        'octahedron+ambo': 'Cuboctaedro',
        'dodecahedron+dual': 'Icosaedro',
        'dodecahedron+truncate': 'Dodecaedro truncado',
        'dodecahedron+ambo': 'Icosidodecaedro',
        'dodecahedron+expand': 'Rombicosidodecaedro',
        'dodecahedron+snub': 'Dodecaedro snub',
        'icosahedron+dual': 'Dodecaedro',
        'icosahedron+truncate': 'Icosaedro truncado (C₆₀)',
        'icosahedron+ambo': 'Icosidodecaedro',
    };

    // ==================== UTILITY ====================

    function normalize(v) {
        const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
    }

    function normalize3(v) {
        const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 1];
    }

    function sub(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }

    function add(a, b) {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    }

    function scale3(v, s) {
        return [v[0] * s, v[1] * s, v[2] * s];
    }

    function dot3(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    function cross3(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0],
        ];
    }

    function dist(a, b) {
        const d = sub(a, b);
        return Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    }

    function centroid(vertices) {
        const c = [0, 0, 0];
        vertices.forEach(v => { c[0] += v[0]; c[1] += v[1]; c[2] += v[2]; });
        return [c[0] / vertices.length, c[1] / vertices.length, c[2] / vertices.length];
    }

    function orientFace(vertices, face, center) {
        // Ensure face normal points away from center
        const v0 = vertices[face[0]];
        const v1 = vertices[face[1]];
        const v2 = vertices[face[2]];
        const n = cross3(sub(v1, v0), sub(v2, v0));
        const toCenter = sub(center, v0);
        if (dot3(n, toCenter) > 0) {
            return [...face].reverse();
        }
        return face;
    }

    function orderFacesAroundVertex(vertices, faces, vi, faceIndices) {
        // Order face indices (which become dual vertices) around original vertex vi
        const center = vertices[vi];
        const normal = normalize3(center);

        // Build local 2D coordinate system
        const up = Math.abs(normal[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        const u = normalize3(cross3(normal, up));
        const v = normalize3(cross3(u, normal));

        // Project face centroids
        const projections = faceIndices.map(fi => {
            const face = faces[fi];
            const c = [0, 0, 0];
            face.forEach(i => { c[0] += vertices[i][0]; c[1] += vertices[i][1]; c[2] += vertices[i][2]; });
            c[0] /= face.length; c[1] /= face.length; c[2] /= face.length;
            const d = sub(c, center);
            return { idx: fi, angle: Math.atan2(dot3(d, v), dot3(d, u)) };
        });

        projections.sort((a, b) => a.angle - b.angle);
        return projections.map(p => p.idx);
    }

    function orderVerticesAroundPoint(vertices, indices, center) {
        const normal = normalize3(center);
        const up = Math.abs(normal[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        const u = normalize3(cross3(normal, up));
        const v = normalize3(cross3(u, normal));

        const projections = indices.map(i => {
            const d = sub(vertices[i], center);
            return { idx: i, angle: Math.atan2(dot3(d, v), dot3(d, u)) };
        });

        projections.sort((a, b) => a.angle - b.angle);
        return projections.map(p => p.idx);
    }

    return {
        getSeed,
        operations,
        knownResults,
        dual,
        ambo,
        truncate,
        expand,
        snub,
        interpolateVertices,
        toBufferGeometry,
        toEdgeGeometry,
        getInfo,
    };
})();
