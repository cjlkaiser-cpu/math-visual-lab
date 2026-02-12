/**
 * Polytopes4D — 4D regular polytope data, geometry, projections, rotations
 */
window.Polytopes4D = (() => {
    const PHI = (1 + Math.sqrt(5)) / 2;
    const IPHI = 1 / PHI;

    // ==================== VECTOR MATH ====================

    function dot4(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2] + a[3]*b[3]; }
    function len4(v) { return Math.sqrt(dot4(v, v)); }
    function normalize4(v) { const l = len4(v); return l > 0 ? v.map(x => x/l) : [0,0,0,0]; }
    function dist4(a, b) {
        const dx=a[0]-b[0], dy=a[1]-b[1], dz=a[2]-b[2], dw=a[3]-b[3];
        return Math.sqrt(dx*dx + dy*dy + dz*dz + dw*dw);
    }
    function sub4(a, b) { return a.map((x,i) => x - b[i]); }
    function add4(a, b) { return a.map((x,i) => x + b[i]); }
    function scale4(v, s) { return v.map(x => x * s); }

    function dot3(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
    function len3(v) { return Math.sqrt(dot3(v, v)); }
    function normalize3(v) { const l = len3(v); return l > 0 ? v.map(x => x/l) : [0,0,0]; }
    function sub3(a, b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
    function cross3(a, b) {
        return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
    }

    function dedup4(verts) {
        const unique = [];
        const seen = new Set();
        for (const v of verts) {
            const key = v.map(x => x.toFixed(5)).join(',');
            if (!seen.has(key)) { seen.add(key); unique.push(v); }
        }
        return unique;
    }

    // ==================== POLYTOPE REGISTRY ====================

    const registry = {
        '5cell':    { name: 'Pentacoro (5-cell)',     schlafli: '{3,3,3}', cellType: 'Tetraedro',  analogy: 'Tetraedro', V:5,   E:10,   F:10,  C:5,   dual: '5cell' },
        'tesseract':{ name: 'Teseracto (Tesseract)',   schlafli: '{4,3,3}', cellType: 'Cubo',       analogy: 'Cubo',      V:16,  E:32,   F:24,  C:8,   dual: '16cell' },
        '16cell':   { name: 'Hexadecacoro (16-cell)',  schlafli: '{3,3,4}', cellType: 'Tetraedro',  analogy: 'Octaedro',  V:8,   E:24,   F:32,  C:16,  dual: 'tesseract' },
        '24cell':   { name: 'Icositetracoro (24-cell)',schlafli: '{3,4,3}', cellType: 'Octaedro',   analogy: 'Sin análogo 3D', V:24, E:96, F:96, C:24, dual: '24cell' },
        '120cell':  { name: 'Hecatonicosacoro (120-cell)', schlafli: '{5,3,3}', cellType: 'Dodecaedro', analogy: 'Dodecaedro', V:600, E:1200, F:720, C:120, dual: '600cell' },
        '600cell':  { name: 'Hexacosicoro (600-cell)', schlafli: '{3,3,5}', cellType: 'Tetraedro',  analogy: 'Icosaedro', V:120, E:720,  F:1200,C:600, dual: '120cell' },
    };

    // ==================== BUILD FUNCTIONS ====================

    const cache = {};

    function getPolytope(key) {
        if (cache[key]) return cache[key];
        const builders = { '5cell': build5Cell, 'tesseract': buildTesseract, '16cell': build16Cell, '24cell': build24Cell, '120cell': build120Cell, '600cell': build600Cell };
        cache[key] = builders[key]();
        return cache[key];
    }

    function build5Cell() {
        const verts = [
            [1, 1, 1, -1/Math.sqrt(5)],
            [1,-1,-1, -1/Math.sqrt(5)],
            [-1, 1,-1, -1/Math.sqrt(5)],
            [-1,-1, 1, -1/Math.sqrt(5)],
            [0, 0, 0, Math.sqrt(5) - 1/Math.sqrt(5)],
        ].map(normalize4);

        const edges = [];
        for (let i = 0; i < 5; i++)
            for (let j = i+1; j < 5; j++)
                edges.push([i, j]);

        const cells = [];
        for (let skip = 0; skip < 5; skip++) {
            const cv = [];
            for (let i = 0; i < 5; i++) if (i !== skip) cv.push(i);
            cells.push({ vertices: cv, type: 'tetrahedron' });
        }

        return { vertices: verts, edges, cells, hasCells: true };
    }

    function buildTesseract() {
        const verts = [];
        for (let w = -1; w <= 1; w += 2)
            for (let z = -1; z <= 1; z += 2)
                for (let y = -1; y <= 1; y += 2)
                    for (let x = -1; x <= 1; x += 2)
                        verts.push([x*0.5, y*0.5, z*0.5, w*0.5]);

        const edges = [];
        for (let i = 0; i < 16; i++)
            for (let j = i+1; j < 16; j++) {
                let diff = 0;
                for (let k = 0; k < 4; k++)
                    if (Math.abs(verts[i][k] - verts[j][k]) > 0.01) diff++;
                if (diff === 1) edges.push([i, j]);
            }

        // 8 cubic cells: fix one axis to ±0.5
        const cells = [];
        for (let axis = 0; axis < 4; axis++) {
            for (const sign of [0.5, -0.5]) {
                const cv = [];
                for (let i = 0; i < 16; i++)
                    if (Math.abs(verts[i][axis] - sign) < 0.01) cv.push(i);
                cells.push({ vertices: cv, type: 'cube', axis, sign });
            }
        }

        return { vertices: verts, edges, cells, hasCells: true };
    }

    function build16Cell() {
        const verts = [];
        for (let axis = 0; axis < 4; axis++)
            for (const sign of [-1, 1]) {
                const v = [0,0,0,0]; v[axis] = sign; verts.push(v);
            }
        // indices: 0:(+x),1:(-x),2:(+y),3:(-y),4:(+z),5:(-z),6:(+w),7:(-w)

        const edges = [];
        for (let i = 0; i < 8; i++)
            for (let j = i+1; j < 8; j++)
                if (dist4(verts[i], verts[j]) < 1.5) edges.push([i, j]);

        // 16 cells: pick one from each axis pair {0,1},{2,3},{4,5},{6,7}
        const cells = [];
        for (let a = 0; a < 2; a++)
            for (let b = 0; b < 2; b++)
                for (let c = 0; c < 2; c++)
                    for (let d = 0; d < 2; d++)
                        cells.push({ vertices: [a, 2+b, 4+c, 6+d], type: 'tetrahedron' });

        return { vertices: verts, edges, cells, hasCells: true };
    }

    function build24Cell() {
        const pairs = [];
        for (let i = 0; i < 4; i++)
            for (let j = i+1; j < 4; j++)
                pairs.push([i, j]);
        // pairs: [0,1],[0,2],[0,3],[1,2],[1,3],[2,3]

        const verts = [];
        for (const [i, j] of pairs)
            for (const si of [1, -1])
                for (const sj of [1, -1]) {
                    const v = [0,0,0,0]; v[i] = si; v[j] = sj;
                    verts.push(v);
                }
        // 24 vertices, indexed: pair_p * 4 + signCombo

        const edges = [];
        const SQRT2 = Math.SQRT2;
        for (let i = 0; i < 24; i++)
            for (let j = i+1; j < 24; j++)
                if (Math.abs(dist4(verts[i], verts[j]) - SQRT2) < 0.01)
                    edges.push([i, j]);

        // 24 cells = 8 type-1 + 16 type-2
        const cells = [];

        // Type 1: fix one coord to ±1
        for (let axis = 0; axis < 4; axis++)
            for (const sign of [1, -1]) {
                const cv = [];
                for (let k = 0; k < 24; k++)
                    if (Math.abs(verts[k][axis] - sign) < 0.01) cv.push(k);
                cells.push({ vertices: cv, type: 'octahedron' });
            }

        // Type 2: sign vector (s0,s1,s2,s3) → one vertex per coord pair
        for (let s0 = -1; s0 <= 1; s0 += 2)
            for (let s1 = -1; s1 <= 1; s1 += 2)
                for (let s2 = -1; s2 <= 1; s2 += 2)
                    for (let s3 = -1; s3 <= 1; s3 += 2) {
                        const signs = [s0, s1, s2, s3];
                        const cv = [];
                        for (let p = 0; p < 6; p++) {
                            const [i, j] = pairs[p];
                            const idx = p*4 + (signs[i]===-1?2:0) + (signs[j]===-1?1:0);
                            cv.push(idx);
                        }
                        cells.push({ vertices: cv, type: 'octahedron' });
                    }

        return { vertices: verts, edges, cells, hasCells: true };
    }

    function build600Cell() {
        const verts = [];

        // 8 axis vertices
        for (let axis = 0; axis < 4; axis++)
            for (const sign of [-1, 1]) {
                const v = [0,0,0,0]; v[axis] = sign; verts.push(v);
            }

        // 16 half-integer vertices
        for (let s0 = -1; s0 <= 1; s0 += 2)
            for (let s1 = -1; s1 <= 1; s1 += 2)
                for (let s2 = -1; s2 <= 1; s2 += 2)
                    for (let s3 = -1; s3 <= 1; s3 += 2)
                        verts.push([s0*0.5, s1*0.5, s2*0.5, s3*0.5]);

        // 96 vertices from even permutations of (0, ±1/(2φ), ±1/2, ±φ/2)
        const a = IPHI / 2, b = 0.5, c = PHI / 2;
        const template = [0, a, b, c];
        const evenPerms = [
            [0,1,2,3],[0,2,3,1],[0,3,1,2],
            [1,0,3,2],[1,2,0,3],[1,3,2,0],
            [2,0,1,3],[2,1,3,0],[2,3,0,1],
            [3,0,2,1],[3,1,0,2],[3,2,1,0],
        ];

        for (const perm of evenPerms) {
            const vals = perm.map(i => template[i]);
            const nzPos = [];
            for (let i = 0; i < 4; i++) if (vals[i] !== 0) nzPos.push(i);
            for (let s = 0; s < 8; s++) {
                const v = [...vals];
                for (let k = 0; k < nzPos.length; k++)
                    if (s & (1 << k)) v[nzPos[k]] *= -1;
                verts.push(v);
            }
        }

        const unique = dedup4(verts);
        const edgeLen = IPHI; // 1/φ for circumradius-1
        const edges = [];
        for (let i = 0; i < unique.length; i++)
            for (let j = i+1; j < unique.length; j++)
                if (Math.abs(dist4(unique[i], unique[j]) - edgeLen) < 0.02)
                    edges.push([i, j]);

        // Find tetrahedral cells via common-neighbor triangles
        const adj = buildAdj(unique.length, edges);
        const cellSet = new Set();
        const cells = [];
        for (const [u, v] of edges) {
            const common = [];
            for (const w of adj[u]) if (adj[v].has(w)) common.push(w);
            for (let i = 0; i < common.length; i++)
                for (let j = i+1; j < common.length; j++)
                    if (adj[common[i]].has(common[j])) {
                        const cell = [u, v, common[i], common[j]].sort((a,b)=>a-b);
                        const key = cell.join(',');
                        if (!cellSet.has(key)) {
                            cellSet.add(key);
                            cells.push({ vertices: cell, type: 'tetrahedron' });
                        }
                    }
        }

        return { vertices: unique, edges, cells, hasCells: true };
    }

    function build120Cell() {
        // Build from 600-cell dual: cell centers become vertices
        const cell600 = getPolytope('600cell');
        const verts600 = cell600.vertices;
        const cells600 = cell600.cells;

        // 120-cell vertices = centroids of 600-cell cells
        const verts = cells600.map(cell => {
            const centroid = [0,0,0,0];
            for (const vi of cell.vertices)
                for (let k = 0; k < 4; k++) centroid[k] += verts600[vi][k];
            return centroid.map(x => x / cell.vertices.length);
        });

        // Normalize to unit circumradius
        const R = len4(verts[0]);
        const normalized = verts.map(v => v.map(x => x / R));

        // Edges: two 600-cell cells sharing a triangular face → adjacent 120-cell vertices
        const edgeLen = findMinEdgeLen(normalized);
        const edges = [];
        for (let i = 0; i < normalized.length; i++)
            for (let j = i+1; j < normalized.length; j++)
                if (Math.abs(dist4(normalized[i], normalized[j]) - edgeLen) < edgeLen * 0.05)
                    edges.push([i, j]);

        return { vertices: normalized, edges, cells: [], hasCells: false };
    }

    function findMinEdgeLen(verts) {
        let minD = Infinity;
        const n = Math.min(verts.length, 80);
        for (let i = 0; i < n; i++)
            for (let j = i+1; j < n; j++) {
                const d = dist4(verts[i], verts[j]);
                if (d > 0.001 && d < minD) minD = d;
            }
        return minD;
    }

    function buildAdj(n, edges) {
        const adj = new Array(n).fill(null).map(() => new Set());
        for (const [i, j] of edges) { adj[i].add(j); adj[j].add(i); }
        return adj;
    }

    // ==================== TESSERACT NET DATA ====================

    // Dalí cross: 8 cubes in 3D forming a cross
    // Each entry: { netCenter, mapLocal(lx,ly,lz) → 4D vertex }
    const tesseractNet = [
        { label: 'Central (w⁻)',  netCenter: [0,0,0],    map: (l) => [l[0], l[1], l[2], -0.5] },
        { label: 'Outer (w⁺)',    netCenter: [0,0,-2],   map: (l) => [l[0], l[1], -l[2], 0.5] },
        { label: 'Derecha (x⁺)',  netCenter: [1,0,0],    map: (l) => [0.5, l[1], l[2], l[0]] },
        { label: 'Izquierda (x⁻)',netCenter: [-1,0,0],   map: (l) => [-0.5, l[1], l[2], -l[0]] },
        { label: 'Frente (y⁺)',   netCenter: [0,1,0],    map: (l) => [l[0], 0.5, l[2], l[1]] },
        { label: 'Atrás (y⁻)',    netCenter: [0,-1,0],   map: (l) => [l[0], -0.5, l[2], -l[1]] },
        { label: 'Arriba (z⁺)',   netCenter: [0,0,1],    map: (l) => [l[0], l[1], 0.5, l[2]] },
        { label: 'Abajo (z⁻)',    netCenter: [0,0,-1],   map: (l) => [l[0], l[1], -0.5, -l[2]] },
    ];

    // 8 local vertices of a unit cube (±0.5)
    const cubeLocalVerts = [];
    for (let z = -1; z <= 1; z += 2)
        for (let y = -1; y <= 1; y += 2)
            for (let x = -1; x <= 1; x += 2)
                cubeLocalVerts.push([x*0.5, y*0.5, z*0.5]);

    // 12 edges of a cube (pairs differing in 1 coord)
    const cubeLocalEdges = [];
    for (let i = 0; i < 8; i++)
        for (let j = i+1; j < 8; j++) {
            let d = 0;
            for (let k = 0; k < 3; k++) if (cubeLocalVerts[i][k] !== cubeLocalVerts[j][k]) d++;
            if (d === 1) cubeLocalEdges.push([i, j]);
        }

    // 6 quad faces of a cube (triangulated)
    const cubeLocalFaces = [
        [0,1,3,2],[4,6,7,5], // z- z+
        [0,4,5,1],[2,3,7,6], // y- y+
        [0,2,6,4],[1,5,7,3], // x- x+
    ];

    function getNetPositions(foldT, viewDist, projType) {
        // foldT: 0=unfolded, 1=folded
        const cubes = [];
        for (let ci = 0; ci < 8; ci++) {
            const net = tesseractNet[ci];
            const positions = [];
            for (const lv of cubeLocalVerts) {
                // Net 3D position
                const net3D = lv.map((x, k) => x + net.netCenter[k]);
                // Folded 4D → project to 3D
                const v4D = net.map(lv);
                const proj3D = projectTo3D(v4D, viewDist, projType);
                // Interpolate
                const pos = net3D.map((n, k) => n * (1 - foldT) + proj3D[k] * foldT);
                positions.push(pos);
            }
            cubes.push({ positions, label: net.label, edges: cubeLocalEdges, faces: cubeLocalFaces });
        }
        return cubes;
    }

    // ==================== 4D ROTATIONS ====================

    function rotateXY(v, a) { const c=Math.cos(a),s=Math.sin(a); return [v[0]*c-v[1]*s, v[0]*s+v[1]*c, v[2], v[3]]; }
    function rotateXZ(v, a) { const c=Math.cos(a),s=Math.sin(a); return [v[0]*c-v[2]*s, v[1], v[0]*s+v[2]*c, v[3]]; }
    function rotateXW(v, a) { const c=Math.cos(a),s=Math.sin(a); return [v[0]*c-v[3]*s, v[1], v[2], v[0]*s+v[3]*c]; }
    function rotateYZ(v, a) { const c=Math.cos(a),s=Math.sin(a); return [v[0], v[1]*c-v[2]*s, v[1]*s+v[2]*c, v[3]]; }
    function rotateYW(v, a) { const c=Math.cos(a),s=Math.sin(a); return [v[0], v[1]*c-v[3]*s, v[2], v[1]*s+v[3]*c]; }
    function rotateZW(v, a) { const c=Math.cos(a),s=Math.sin(a); return [v[0], v[1], v[2]*c-v[3]*s, v[2]*s+v[3]*c]; }

    function rotate4D(v, angles) {
        let r = v;
        if (angles.xy) r = rotateXY(r, angles.xy);
        if (angles.xz) r = rotateXZ(r, angles.xz);
        if (angles.xw) r = rotateXW(r, angles.xw);
        if (angles.yz) r = rotateYZ(r, angles.yz);
        if (angles.yw) r = rotateYW(r, angles.yw);
        if (angles.zw) r = rotateZW(r, angles.zw);
        return r;
    }

    // ==================== PROJECTION ====================

    function perspectiveProject(v4, d) {
        const factor = d / (d + v4[3]);
        return [v4[0]*factor, v4[1]*factor, v4[2]*factor];
    }

    function stereographicProject(v4, d) {
        const scale = d / (d - v4[3]);
        return [v4[0]*scale, v4[1]*scale, v4[2]*scale];
    }

    function projectTo3D(v4, viewDist, type) {
        return type === 'stereographic'
            ? stereographicProject(v4, viewDist)
            : perspectiveProject(v4, viewDist);
    }

    // ==================== CONVEX HULL (small point sets) ====================

    function convexHullTriangles(points) {
        const n = points.length;
        if (n < 3) return [];
        if (n === 3) return [[0,1,2]];

        const triangles = [];
        for (let i = 0; i < n; i++)
            for (let j = i+1; j < n; j++)
                for (let k = j+1; k < n; k++) {
                    const ab = sub3(points[j], points[i]);
                    const ac = sub3(points[k], points[i]);
                    const normal = cross3(ab, ac);
                    if (len3(normal) < 0.0001) continue;

                    let side = 0, valid = true;
                    for (let l = 0; l < n; l++) {
                        if (l===i||l===j||l===k) continue;
                        const d = dot3(sub3(points[l], points[i]), normal);
                        if (Math.abs(d) < 0.001) continue;
                        const s = Math.sign(d);
                        if (side === 0) side = s;
                        else if (s !== side) { valid = false; break; }
                    }
                    if (valid && side !== 0) {
                        triangles.push(side > 0 ? [i,k,j] : [i,j,k]);
                    }
                }
        return triangles;
    }

    // ==================== THREE.JS HELPERS ====================

    function buildProjectedEdges(polytopeKey, angles, viewDist, projType, scale, depthColor) {
        const data = getPolytope(polytopeKey);
        const { vertices, edges } = data;
        const points = [];
        const colors = [];

        for (const [i, j] of edges) {
            const vi = rotate4D(vertices[i], angles);
            const vj = rotate4D(vertices[j], angles);
            const pi = projectTo3D(vi, viewDist, projType);
            const pj = projectTo3D(vj, viewDist, projType);

            points.push(
                new THREE.Vector3(pi[0]*scale, pi[1]*scale, pi[2]*scale),
                new THREE.Vector3(pj[0]*scale, pj[1]*scale, pj[2]*scale)
            );

            if (depthColor) {
                const wi = (vi[3] + 1.2) / 2.4;
                const wj = (vj[3] + 1.2) / 2.4;
                // Violet (near) to cyan (far)
                colors.push(
                    0.55+0.45*wi, 0.2+0.3*(1-wi), 0.6+0.4*(1-wi),
                    0.55+0.45*wj, 0.2+0.3*(1-wj), 0.6+0.4*(1-wj)
                );
            }
        }

        const geom = new THREE.BufferGeometry().setFromPoints(points);
        let mat;
        if (depthColor && colors.length > 0) {
            geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.75 });
        } else {
            mat = new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.6 });
        }
        return new THREE.LineSegments(geom, mat);
    }

    function buildProjectedVertices(polytopeKey, angles, viewDist, projType, scale) {
        const data = getPolytope(polytopeKey);
        const positions = [];
        for (const v of data.vertices) {
            const r = rotate4D(v, angles);
            const p = projectTo3D(r, viewDist, projType);
            positions.push(p[0]*scale, p[1]*scale, p[2]*scale);
        }
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.06, sizeAttenuation: true, transparent: true, opacity: 0.8 });
        return new THREE.Points(geom, mat);
    }

    function buildCellMesh(polytopeKey, cellIndex, angles, viewDist, projType, scale, highlight) {
        const data = getPolytope(polytopeKey);
        if (!data.hasCells || cellIndex >= data.cells.length) return null;

        const cell = data.cells[cellIndex];
        const positions3D = cell.vertices.map(vi => {
            const r = rotate4D(data.vertices[vi], angles);
            return projectTo3D(r, viewDist, projType).map(x => x * scale);
        });

        // Edges of this cell
        const cellVertSet = new Set(cell.vertices);
        const cellEdges = [];
        for (const [a, b] of data.edges)
            if (cellVertSet.has(a) && cellVertSet.has(b))
                cellEdges.push([cell.vertices.indexOf(a), cell.vertices.indexOf(b)]);

        const group = new THREE.Group();

        // Edge highlight
        const edgePts = [];
        for (const [a, b] of cellEdges) {
            edgePts.push(
                new THREE.Vector3(...positions3D[a]),
                new THREE.Vector3(...positions3D[b])
            );
        }
        const edgeGeom = new THREE.BufferGeometry().setFromPoints(edgePts);
        const edgeMat = new THREE.LineBasicMaterial({
            color: highlight ? 0xfbbf24 : 0xa78bfa,
            transparent: true, opacity: highlight ? 1 : 0.4, linewidth: 1
        });
        group.add(new THREE.LineSegments(edgeGeom, edgeMat));

        // Face mesh (convex hull)
        const tris = convexHullTriangles(positions3D);
        if (tris.length > 0) {
            const facePositions = [];
            for (const [a, b, c] of tris) {
                facePositions.push(...positions3D[a], ...positions3D[b], ...positions3D[c]);
            }
            const faceGeom = new THREE.BufferGeometry();
            faceGeom.setAttribute('position', new THREE.Float32BufferAttribute(facePositions, 3));
            faceGeom.computeVertexNormals();
            const faceMat = new THREE.MeshBasicMaterial({
                color: highlight ? 0xfbbf24 : 0x8b5cf6,
                transparent: true, opacity: highlight ? 0.15 : 0.05,
                side: THREE.DoubleSide, depthWrite: false,
            });
            group.add(new THREE.Mesh(faceGeom, faceMat));
        }

        return group;
    }

    function buildCellExploded(polytopeKey, angles, viewDist, projType, scale, explodeAmt, highlightIdx, showFaces) {
        const data = getPolytope(polytopeKey);
        if (!data.hasCells) return new THREE.Group();

        const group = new THREE.Group();
        const allRotated = data.vertices.map(v => rotate4D(v, angles));
        const allProjected = allRotated.map(v => projectTo3D(v, viewDist, projType).map(x => x * scale));

        for (let ci = 0; ci < data.cells.length; ci++) {
            const cell = data.cells[ci];
            const isHighlight = ci === highlightIdx;

            // Cell centroid (for explosion offset)
            const centroid = [0, 0, 0];
            for (const vi of cell.vertices) {
                centroid[0] += allProjected[vi][0];
                centroid[1] += allProjected[vi][1];
                centroid[2] += allProjected[vi][2];
            }
            const nv = cell.vertices.length;
            centroid[0] /= nv; centroid[1] /= nv; centroid[2] /= nv;

            const offset = centroid.map(x => x * explodeAmt);

            // Cell vertex positions (with explosion offset)
            const positions = cell.vertices.map(vi =>
                allProjected[vi].map((x, k) => x + offset[k])
            );

            // Edges
            const cellVertSet = new Set(cell.vertices);
            const edgePts = [];
            for (const [a, b] of data.edges) {
                if (cellVertSet.has(a) && cellVertSet.has(b)) {
                    const ai = cell.vertices.indexOf(a);
                    const bi = cell.vertices.indexOf(b);
                    edgePts.push(
                        new THREE.Vector3(...positions[ai]),
                        new THREE.Vector3(...positions[bi])
                    );
                }
            }

            if (edgePts.length > 0) {
                const eGeom = new THREE.BufferGeometry().setFromPoints(edgePts);
                const eMat = new THREE.LineBasicMaterial({
                    color: isHighlight ? 0xfbbf24 : 0x8b5cf6,
                    transparent: true,
                    opacity: isHighlight ? 1 : 0.25,
                });
                group.add(new THREE.LineSegments(eGeom, eMat));
            }

            // Faces
            if (showFaces) {
                const tris = convexHullTriangles(positions);
                if (tris.length > 0) {
                    const fp = [];
                    for (const [a, b, c] of tris) fp.push(...positions[a], ...positions[b], ...positions[c]);
                    const fGeom = new THREE.BufferGeometry();
                    fGeom.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3));
                    fGeom.computeVertexNormals();
                    const fMat = new THREE.MeshBasicMaterial({
                        color: isHighlight ? 0xfbbf24 : 0x7c3aed,
                        transparent: true, opacity: isHighlight ? 0.2 : 0.04,
                        side: THREE.DoubleSide, depthWrite: false,
                    });
                    group.add(new THREE.Mesh(fGeom, fMat));
                }
            }
        }
        return group;
    }

    // ==================== PUBLIC API ====================

    return {
        registry,
        getPolytope,
        getNetPositions,
        tesseractNet,
        cubeLocalVerts,
        cubeLocalEdges,
        cubeLocalFaces,
        rotate4D,
        projectTo3D,
        perspectiveProject,
        stereographicProject,
        buildProjectedEdges,
        buildProjectedVertices,
        buildCellMesh,
        buildCellExploded,
        convexHullTriangles,
        // Expose math for slicer
        dot4, len4, normalize4, dist4, sub4, add4, scale4,
        dot3, len3, normalize3, sub3, cross3,
        dedup4,
    };
})();
