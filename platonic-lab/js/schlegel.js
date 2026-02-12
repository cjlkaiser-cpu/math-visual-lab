/**
 * PlatonicSchlegel — Schlegel diagrams and graph theory view
 *
 * A Schlegel diagram projects a polyhedron onto one of its faces,
 * creating a planar graph representation.
 */
window.PlatonicSchlegel = (() => {

    const PHI = (1 + Math.sqrt(5)) / 2;

    // ==================== SCHLEGEL PROJECTIONS ====================
    // Pre-computed 2D vertex positions for Schlegel diagrams of each Platonic solid.

    const diagrams = {
        tetrahedron: buildTetrahedronSchlegel,
        cube: buildCubeSchlegel,
        octahedron: buildOctahedronSchlegel,
        dodecahedron: buildDodecahedronSchlegel,
        icosahedron: buildIcosahedronSchlegel,
    };

    function buildTetrahedronSchlegel() {
        // Project onto a face: outer triangle + center point
        const r = 1;
        const verts = [
            { x: 0, y: -r },                              // 0: top of outer triangle
            { x: r * Math.sin(2 * Math.PI / 3), y: -r * Math.cos(2 * Math.PI / 3) },  // 1
            { x: r * Math.sin(4 * Math.PI / 3), y: -r * Math.cos(4 * Math.PI / 3) },  // 2
            { x: 0, y: 0.15 },                            // 3: projected 4th vertex (center-ish)
        ];
        const edges = [[0, 1], [1, 2], [2, 0], [0, 3], [1, 3], [2, 3]];
        const faces = [[0, 1, 2], [0, 1, 3], [1, 2, 3], [0, 2, 3]]; // outer face = [0,1,2]
        return { vertices: verts, edges, faces, outerFace: [0, 1, 2] };
    }

    function buildCubeSchlegel() {
        // Outer square + inner square, connected
        const o = 1, i = 0.45;
        const verts = [
            // Outer square
            { x: -o, y: -o }, { x: o, y: -o }, { x: o, y: o }, { x: -o, y: o },
            // Inner square
            { x: -i, y: -i }, { x: i, y: -i }, { x: i, y: i }, { x: -i, y: i },
        ];
        const edges = [
            // Outer
            [0, 1], [1, 2], [2, 3], [3, 0],
            // Inner
            [4, 5], [5, 6], [6, 7], [7, 4],
            // Connections
            [0, 4], [1, 5], [2, 6], [3, 7],
        ];
        return { vertices: verts, edges, outerFace: [0, 1, 2, 3] };
    }

    function buildOctahedronSchlegel() {
        // Outer triangle + inner triangle (rotated), all connected
        const r = 1, ri = 0.42;
        const outer = [];
        const inner = [];
        for (let k = 0; k < 3; k++) {
            const a = (k * 2 * Math.PI / 3) - Math.PI / 2;
            outer.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
            const a2 = a + Math.PI / 3;
            inner.push({ x: ri * Math.cos(a2), y: ri * Math.sin(a2) });
        }
        const verts = [...outer, ...inner]; // 0,1,2 outer; 3,4,5 inner
        const edges = [
            // Outer triangle
            [0, 1], [1, 2], [2, 0],
            // Inner triangle
            [3, 4], [4, 5], [5, 3],
            // Cross connections (each outer vertex connects to 2 inner)
            [0, 3], [0, 5],
            [1, 3], [1, 4],
            [2, 4], [2, 5],
        ];
        return { vertices: verts, edges, outerFace: [0, 1, 2] };
    }

    function buildDodecahedronSchlegel() {
        // Pentagon layers: outer, mid-outer, mid-inner, inner
        const makeRing = (r, n, offset) => {
            const pts = [];
            for (let k = 0; k < n; k++) {
                const a = (k * 2 * Math.PI / n) + offset - Math.PI / 2;
                pts.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
            }
            return pts;
        };

        const outer = makeRing(1.0, 5, 0);           // 0-4
        const midOuter = makeRing(0.72, 5, Math.PI / 5); // 5-9
        const midInner = makeRing(0.42, 5, 0);        // 10-14
        const inner = makeRing(0.2, 5, Math.PI / 5);  // 15-19

        const verts = [...outer, ...midOuter, ...midInner, ...inner];

        const edges = [
            // Outer pentagon
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
            // Outer to mid-outer
            [0, 5], [0, 9], [1, 5], [1, 6], [2, 6], [2, 7], [3, 7], [3, 8], [4, 8], [4, 9],
            // Mid-outer to mid-inner
            [5, 10], [5, 14], [6, 10], [6, 11], [7, 11], [7, 12], [8, 12], [8, 13], [9, 13], [9, 14],
            // Mid-inner to inner
            [10, 15], [10, 19], [11, 15], [11, 16], [12, 16], [12, 17], [13, 17], [13, 18], [14, 18], [14, 19],
            // Inner pentagon
            [15, 16], [16, 17], [17, 18], [18, 19], [19, 15],
        ];

        return { vertices: verts, edges, outerFace: [0, 1, 2, 3, 4] };
    }

    function buildIcosahedronSchlegel() {
        // Outer triangle + 3 layers of vertices
        const r = 1.0;
        const outer = [];
        for (let k = 0; k < 3; k++) {
            const a = (k * 2 * Math.PI / 3) - Math.PI / 2;
            outer.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
        }

        // Mid ring: 6 vertices
        const mid = [];
        for (let k = 0; k < 6; k++) {
            const a = (k * Math.PI / 3) - Math.PI / 6;
            const rad = 0.55;
            mid.push({ x: rad * Math.cos(a), y: rad * Math.sin(a) });
        }

        // Inner triangle (rotated)
        const inner = [];
        for (let k = 0; k < 3; k++) {
            const a = (k * 2 * Math.PI / 3) + Math.PI / 6;
            inner.push({ x: 0.22 * Math.cos(a), y: 0.22 * Math.sin(a) });
        }

        // 0,1,2 = outer; 3-8 = mid; 9,10,11 = inner
        const verts = [...outer, ...mid, ...inner];

        const edges = [
            // Outer
            [0, 1], [1, 2], [2, 0],
            // Outer to mid
            [0, 3], [0, 8], [0, 4],
            [1, 4], [1, 5], [1, 6],
            [2, 6], [2, 7], [2, 8],
            // Mid ring
            [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 3],
            // Mid to inner
            [3, 9], [4, 9], [5, 10], [6, 10], [7, 11], [8, 11],
            [3, 11], [5, 9], [7, 10],
            // Inner
            [9, 10], [10, 11], [11, 9],
        ];

        return { vertices: verts, edges, outerFace: [0, 1, 2] };
    }

    // ==================== HAMILTONIAN PATHS ====================

    const hamiltonianPaths = {
        tetrahedron: [0, 1, 2, 3, 0],
        cube: [0, 1, 5, 4, 7, 3, 2, 6, 7], // Hamiltonian cycle: exists
        octahedron: [0, 2, 1, 4, 3, 5, 0],
        dodecahedron: null, // Complex — mark as "exists" without full cycle
        icosahedron: null,
    };

    // Simpler: just mark "Hamiltonian cycle exists" for all 5
    const hamiltonianInfo = {
        tetrahedron: { exists: true, cycle: [0, 1, 2, 3] },
        cube: { exists: true, cycle: [0, 1, 5, 4, 7, 3, 2, 6] },
        octahedron: { exists: true, cycle: [0, 2, 4, 1, 3, 5] },
        dodecahedron: { exists: true, cycle: null },
        icosahedron: { exists: true, cycle: null },
    };

    // ==================== GRAPH PROPERTIES ====================

    const graphProperties = {
        tetrahedron: { chromaticNumber: 4, girth: 3, diameter: 1, isComplete: true, graphName: 'K₄' },
        cube: { chromaticNumber: 2, girth: 4, diameter: 3, isComplete: false, graphName: 'Q₃ (3-cubo)' },
        octahedron: { chromaticNumber: 3, girth: 3, diameter: 2, isComplete: false, graphName: 'K₂,₂,₂' },
        dodecahedron: { chromaticNumber: 3, girth: 5, diameter: 5, isComplete: false, graphName: 'Dodecaedro' },
        icosahedron: { chromaticNumber: 4, girth: 3, diameter: 3, isComplete: false, graphName: 'Icosaedro' },
    };

    // Vertex colorings (using chromatic number of colors)
    const vertexColorings = {
        tetrahedron: [0, 1, 2, 3],
        cube: [0, 1, 1, 0, 1, 0, 0, 1],
        octahedron: [0, 0, 1, 1, 2, 2],
        dodecahedron: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1],
        icosahedron: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3],
    };

    const colorPalette = ['#ef4444', '#22d3ee', '#facc15', '#a78bfa'];

    // ==================== DRAWING ====================

    /**
     * Draw Schlegel diagram on a canvas.
     * @param {HTMLCanvasElement} canvas
     * @param {string} solidKey
     * @param {object} options - { showHamilton, showColoring, showLabels }
     */
    function draw(canvas, solidKey, options = {}) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const pad = 30;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, w, h);

        const builder = diagrams[solidKey];
        if (!builder) return;

        const diagram = builder();
        const { vertices, edges, outerFace } = diagram;

        // Coordinate transform
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        vertices.forEach(v => {
            minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
            minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
        });
        const rangeX = maxX - minX || 1;
        const rangeY = maxY - minY || 1;
        const scale = Math.min((w - 2 * pad) / rangeX, (h - 2 * pad) / rangeY);
        const cx = w / 2, cy = h / 2;
        const midX = (minX + maxX) / 2, midY = (minY + maxY) / 2;

        const tx = v => cx + (v.x - midX) * scale;
        const ty = v => cy + (v.y - midY) * scale;

        // Draw edges
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1.5;
        for (const [i, j] of edges) {
            ctx.beginPath();
            ctx.moveTo(tx(vertices[i]), ty(vertices[i]));
            ctx.lineTo(tx(vertices[j]), ty(vertices[j]));
            ctx.stroke();
        }

        // Draw Hamiltonian path if enabled
        if (options.showHamilton) {
            const hInfo = hamiltonianInfo[solidKey];
            if (hInfo && hInfo.cycle) {
                ctx.strokeStyle = '#8b5cf6';
                ctx.lineWidth = 3;
                ctx.setLineDash([6, 3]);
                ctx.beginPath();
                const cycle = hInfo.cycle;
                ctx.moveTo(tx(vertices[cycle[0]]), ty(vertices[cycle[0]]));
                for (let i = 1; i < cycle.length; i++) {
                    ctx.lineTo(tx(vertices[cycle[i]]), ty(vertices[cycle[i]]));
                }
                ctx.lineTo(tx(vertices[cycle[0]]), ty(vertices[cycle[0]])); // close
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // Draw vertices
        const coloring = options.showColoring ? vertexColorings[solidKey] : null;
        const vertRadius = 6;

        vertices.forEach((v, i) => {
            const px = tx(v), py = ty(v);

            // Glow
            const gradient = ctx.createRadialGradient(px, py, 0, px, py, vertRadius * 2.5);
            const baseColor = coloring ? colorPalette[coloring[i] % colorPalette.length] : '#22d3ee';
            gradient.addColorStop(0, baseColor + '60');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(px, py, vertRadius * 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Dot
            ctx.beginPath();
            ctx.arc(px, py, vertRadius, 0, Math.PI * 2);
            ctx.fillStyle = baseColor;
            ctx.fill();
            ctx.strokeStyle = '#0a0a0f';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Label
            if (options.showLabels) {
                ctx.fillStyle = '#9ca3af';
                ctx.font = '10px "JetBrains Mono", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(i.toString(), px, py - vertRadius - 4);
            }
        });

        // Title
        const solid = window.PlatonicGeometry.solids[solidKey];
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Schlegel — ${solid.name}`, 8, h - 8);
    }

    /**
     * Get info HTML for the graph panel.
     */
    function getInfoHTML(solidKey) {
        const gp = graphProperties[solidKey];
        const hi = hamiltonianInfo[solidKey];
        const solid = window.PlatonicGeometry.solids[solidKey];
        if (!gp) return '';

        return `
            <div class="space-y-1 text-xs font-mono">
                <div class="calc-result-row"><span class="calc-result-label">Grafo</span><span class="calc-result-value">${gp.graphName}</span></div>
                <div class="calc-result-row"><span class="calc-result-label">Vértices</span><span class="calc-result-value">${solid.V}</span></div>
                <div class="calc-result-row"><span class="calc-result-label">Aristas</span><span class="calc-result-value">${solid.E}</span></div>
                <div class="calc-result-row"><span class="calc-result-label">χ (cromático)</span><span class="calc-result-value">${gp.chromaticNumber}</span></div>
                <div class="calc-result-row"><span class="calc-result-label">Cintura</span><span class="calc-result-value">${gp.girth}</span></div>
                <div class="calc-result-row"><span class="calc-result-label">Diámetro</span><span class="calc-result-value">${gp.diameter}</span></div>
                <div class="calc-result-row"><span class="calc-result-label">Hamiltoniano</span><span class="calc-result-value">${hi.exists ? 'Sí' : 'No'}</span></div>
                <div class="calc-result-row"><span class="calc-result-label">Completo</span><span class="calc-result-value">${gp.isComplete ? 'Sí' : 'No'}</span></div>
            </div>
        `;
    }

    return {
        diagrams,
        graphProperties,
        hamiltonianInfo,
        vertexColorings,
        draw,
        getInfoHTML,
    };
})();
