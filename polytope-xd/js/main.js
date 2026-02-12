/**
 * PolytopeXD — Main: Three.js setup, state, modes, UI, render loop
 */
(() => {
    const P = window.Polytopes4D;
    const S = window.Slicer4D;

    // ==================== STATE ====================

    const state = {
        polytope: '5cell',
        mode: 'explore',
        projection: 'perspective',
        viewDistance: 3.0,
        angles: { xy: 0, xz: 0, xw: 0, yz: 0, yw: 0, zw: 0 },
        autoRotate: true,
        depthColor: true,
        showVertices: false,
        showAxes: true,
        // Slice
        sliceCut: 'w',
        slicePos: 0,
        sliceAnimate: false,
        showSlicePlane: true,
        sliceDir: 1,
        // Cells
        currentCell: 0,
        isolateCell: false,
        showCellFaces: true,
        explodeCells: false,
        explodeAmount: 0,
        // Net
        foldAmount: 100,
        netPlaying: false,
        netDir: -1, // -1 = unfolding, +1 = folding
        // 3D camera
        camTheta: 0.4,
        camPhi: 0.3,
        camDist: 4.5,
        // Mouse
        isDragging: false,
        lastX: 0, lastY: 0,
    };

    const SCALE = 1.8;

    // ==================== THREE.JS SETUP ====================

    let scene, camera, renderer;
    let mainGroup, sliceGroup, cellGroup, netGroup, axesGroup;

    function initThree() {
        const container = document.getElementById('canvas-container');
        const canvas = document.getElementById('main-canvas');

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(0, 0, state.camDist);

        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        // Lights
        scene.add(new THREE.AmbientLight(0x404060, 0.5));
        const d1 = new THREE.DirectionalLight(0xc4b5fd, 0.6);
        d1.position.set(5, 5, 5);
        scene.add(d1);
        const d2 = new THREE.DirectionalLight(0x67e8f9, 0.3);
        d2.position.set(-3, -2, 4);
        scene.add(d2);

        // Groups
        mainGroup = new THREE.Group();
        sliceGroup = new THREE.Group();
        cellGroup = new THREE.Group();
        netGroup = new THREE.Group();
        axesGroup = new THREE.Group();
        scene.add(mainGroup, sliceGroup, cellGroup, netGroup, axesGroup);

        createAxes();

        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    function createAxes() {
        clearGroup(axesGroup);
        if (!state.showAxes) return;
        const len = 2.5;
        const colors = [0xff4444, 0x44ff44, 0x4488ff];
        const labels = ['X', 'Y', 'Z'];
        for (let i = 0; i < 3; i++) {
            const pts = [new THREE.Vector3(), new THREE.Vector3()];
            pts[1].setComponent(i, len);
            const geom = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = new THREE.LineBasicMaterial({ color: colors[i], transparent: true, opacity: 0.25 });
            axesGroup.add(new THREE.LineSegments(geom, mat));
        }
    }

    // ==================== DISPOSE HELPERS ====================

    function clearGroup(group) {
        while (group.children.length) {
            const child = group.children[0];
            group.remove(child);
            disposeObject(child);
        }
    }

    function disposeObject(obj) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
        }
        if (obj.children) obj.children.forEach(disposeObject);
    }

    // ==================== UPDATE FUNCTIONS ====================

    // Cached geometry for in-place position updates (explore/slice modes)
    let cachedEdgeLine = null;
    let cachedVertPoints = null;
    let cachedPolyKey = null;
    let cachedDepthColor = null;
    let cachedShowVerts = null;

    function ensureEdgeGeometry() {
        const data = P.getPolytope(state.polytope);
        const needsRebuild = (
            cachedPolyKey !== state.polytope ||
            cachedDepthColor !== state.depthColor ||
            cachedShowVerts !== state.showVertices
        );

        if (needsRebuild) {
            if (cachedEdgeLine) { mainGroup.remove(cachedEdgeLine); disposeObject(cachedEdgeLine); }
            if (cachedVertPoints) { mainGroup.remove(cachedVertPoints); disposeObject(cachedVertPoints); }
            cachedEdgeLine = null;
            cachedVertPoints = null;

            // Edge geometry
            const posArr = new Float32Array(data.edges.length * 6);
            const geom = new THREE.BufferGeometry();
            geom.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
            let mat;
            if (state.depthColor) {
                const colArr = new Float32Array(data.edges.length * 6);
                geom.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
                mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.75 });
            } else {
                mat = new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.6 });
            }
            cachedEdgeLine = new THREE.LineSegments(geom, mat);
            mainGroup.add(cachedEdgeLine);

            // Vertex geometry
            if (state.showVertices) {
                const vPosArr = new Float32Array(data.vertices.length * 3);
                const vGeom = new THREE.BufferGeometry();
                vGeom.setAttribute('position', new THREE.BufferAttribute(vPosArr, 3));
                const vMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.06, sizeAttenuation: true, transparent: true, opacity: 0.8 });
                cachedVertPoints = new THREE.Points(vGeom, vMat);
                mainGroup.add(cachedVertPoints);
            }

            cachedPolyKey = state.polytope;
            cachedDepthColor = state.depthColor;
            cachedShowVerts = state.showVertices;
        }
    }

    function updateEdgePositions() {
        if (!cachedEdgeLine) return;
        const data = P.getPolytope(state.polytope);
        const posAttr = cachedEdgeLine.geometry.getAttribute('position');
        const colAttr = cachedEdgeLine.geometry.getAttribute('color');

        for (let idx = 0; idx < data.edges.length; idx++) {
            const [i, j] = data.edges[idx];
            const vi = P.rotate4D(data.vertices[i], state.angles);
            const vj = P.rotate4D(data.vertices[j], state.angles);
            const pi = P.projectTo3D(vi, state.viewDistance, state.projection);
            const pj = P.projectTo3D(vj, state.viewDistance, state.projection);

            const off = idx * 6;
            posAttr.array[off]   = pi[0]*SCALE;
            posAttr.array[off+1] = pi[1]*SCALE;
            posAttr.array[off+2] = pi[2]*SCALE;
            posAttr.array[off+3] = pj[0]*SCALE;
            posAttr.array[off+4] = pj[1]*SCALE;
            posAttr.array[off+5] = pj[2]*SCALE;

            if (colAttr) {
                const wi = (vi[3]+1.2)/2.4;
                const wj = (vj[3]+1.2)/2.4;
                colAttr.array[off]   = 0.55+0.45*wi;
                colAttr.array[off+1] = 0.2+0.3*(1-wi);
                colAttr.array[off+2] = 0.6+0.4*(1-wi);
                colAttr.array[off+3] = 0.55+0.45*wj;
                colAttr.array[off+4] = 0.2+0.3*(1-wj);
                colAttr.array[off+5] = 0.6+0.4*(1-wj);
            }
        }
        posAttr.needsUpdate = true;
        if (colAttr) colAttr.needsUpdate = true;

        // Update vertex positions
        if (cachedVertPoints) {
            const vAttr = cachedVertPoints.geometry.getAttribute('position');
            for (let i = 0; i < data.vertices.length; i++) {
                const r = P.rotate4D(data.vertices[i], state.angles);
                const p = P.projectTo3D(r, state.viewDistance, state.projection);
                vAttr.array[i*3]   = p[0]*SCALE;
                vAttr.array[i*3+1] = p[1]*SCALE;
                vAttr.array[i*3+2] = p[2]*SCALE;
            }
            vAttr.needsUpdate = true;
        }
    }

    function updatePolytope() {
        clearGroup(sliceGroup);
        clearGroup(cellGroup);
        clearGroup(netGroup);

        if (state.mode === 'net') {
            clearGroup(mainGroup);
            cachedEdgeLine = null; cachedVertPoints = null; cachedPolyKey = null;
            updateNet();
            return;
        }

        if (state.mode === 'cells') {
            clearGroup(mainGroup);
            cachedEdgeLine = null; cachedVertPoints = null; cachedPolyKey = null;
            updateCells();
            return;
        }

        // Explore or Slice mode: use cached geometry with in-place updates
        ensureEdgeGeometry();
        updateEdgePositions();

        // Slice mode
        if (state.mode === 'slice') {
            updateSlice();
        }
    }

    function updateSlice() {
        clearGroup(sliceGroup);

        const result = S.computeSlice(state.polytope, state.sliceCut, state.slicePos);

        // Build 3D mesh
        const meshResult = S.buildSliceMesh(result, state.angles, state.viewDistance, state.projection, SCALE);
        if (meshResult) {
            sliceGroup.add(meshResult.group);
        }

        // Plane helper
        if (state.showSlicePlane && result) {
            const plane = S.buildPlaneHelper(result, state.angles, state.viewDistance, state.projection, SCALE);
            if (plane) sliceGroup.add(plane);
        }

        // 2D canvas
        const canvas = document.getElementById('slice-canvas');
        const info = S.analyzeSlice(result);
        S.draw2D(canvas, result, info ? `${info.shapeName} · ${info.vertices}v` : '');

        // Info panel
        const resultDiv = document.getElementById('slice-result');
        if (info) {
            resultDiv.innerHTML = `
                <div class="prop-row"><span class="prop-label">Forma</span><span class="prop-value">${info.shapeName}</span></div>
                <div class="prop-row"><span class="prop-label">Vértices</span><span class="prop-value">${info.vertices}</span></div>
                <div class="prop-row"><span class="prop-label">Área</span><span class="prop-value">${info.area.toFixed(4)}</span></div>
                <div class="prop-row"><span class="prop-label">Perímetro</span><span class="prop-value">${info.perimeter.toFixed(4)}</span></div>
                <div class="prop-row"><span class="prop-label">Regular</span><span class="prop-value">${info.isRegular ? 'Sí' : 'No'}</span></div>
            `;
        } else {
            resultDiv.innerHTML = '<div class="text-gray-500">Sin intersección en esta posición</div>';
        }
    }

    function updateCells() {
        clearGroup(cellGroup);
        clearGroup(mainGroup);

        const data = P.getPolytope(state.polytope);
        if (!data.hasCells) {
            document.getElementById('cells-unavailable').classList.remove('hidden');
            // Still show basic edges
            mainGroup.add(P.buildProjectedEdges(state.polytope, state.angles, state.viewDistance, state.projection, SCALE, state.depthColor));
            return;
        }
        document.getElementById('cells-unavailable').classList.add('hidden');

        if (state.isolateCell) {
            // Show only the selected cell
            const mesh = P.buildCellMesh(
                state.polytope, state.currentCell, state.angles,
                state.viewDistance, state.projection, SCALE, true
            );
            if (mesh) cellGroup.add(mesh);
        } else if (state.explodeCells) {
            // Exploded view of all cells
            const exploded = P.buildCellExploded(
                state.polytope, state.angles, state.viewDistance, state.projection,
                SCALE, state.explodeAmount, state.currentCell, state.showCellFaces
            );
            cellGroup.add(exploded);
        } else {
            // Ghost all edges, highlight selected cell
            const ghostEdges = P.buildProjectedEdges(state.polytope, state.angles, state.viewDistance, state.projection, SCALE, false);
            ghostEdges.material.opacity = 0.12;
            ghostEdges.material.color.setHex(0x6b7280);
            mainGroup.add(ghostEdges);

            const mesh = P.buildCellMesh(
                state.polytope, state.currentCell, state.angles,
                state.viewDistance, state.projection, SCALE, true
            );
            if (mesh) cellGroup.add(mesh);
        }

        // Update cell info
        updateCellInfo();
    }

    function updateCellInfo() {
        const data = P.getPolytope(state.polytope);
        if (!data.hasCells) return;
        const total = data.cells.length;
        document.getElementById('cell-counter').textContent = `${state.currentCell + 1} / ${total}`;

        const cell = data.cells[state.currentCell];
        const reg = P.registry[state.polytope];
        document.getElementById('cell-detail').innerHTML = `
            <div class="prop-row"><span class="prop-label">Tipo de celda</span><span class="prop-value">${reg.cellType}</span></div>
            <div class="prop-row"><span class="prop-label">Vértices</span><span class="prop-value">${cell.vertices.length}</span></div>
            <div class="prop-row"><span class="prop-label">Índices</span><span class="prop-value text-[10px]">[${cell.vertices.join(', ')}]</span></div>
        `;
    }

    function updateNet() {
        clearGroup(netGroup);
        clearGroup(mainGroup);

        if (state.polytope !== 'tesseract') {
            // Show basic edges
            mainGroup.add(P.buildProjectedEdges(state.polytope, state.angles, state.viewDistance, state.projection, SCALE, state.depthColor));
            return;
        }

        const foldT = state.foldAmount / 100;
        const cubes = P.getNetPositions(foldT, state.viewDistance, state.projection);
        const cubeColors = [0xa78bfa, 0xf472b6, 0x34d399, 0xfbbf24, 0x60a5fa, 0xf87171, 0x22d3ee, 0xc084fc];

        for (let ci = 0; ci < cubes.length; ci++) {
            const cube = cubes[ci];
            const color = cubeColors[ci];

            // Edges
            const edgePts = [];
            for (const [a, b] of cube.edges) {
                const pa = cube.positions[a].map(x => x * SCALE);
                const pb = cube.positions[b].map(x => x * SCALE);
                edgePts.push(new THREE.Vector3(...pa), new THREE.Vector3(...pb));
            }
            const eGeom = new THREE.BufferGeometry().setFromPoints(edgePts);
            const eMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 });
            netGroup.add(new THREE.LineSegments(eGeom, eMat));

            // Faces (translucent)
            for (const quad of cube.faces) {
                const fp = [];
                const q = quad.map(i => cube.positions[i].map(x => x * SCALE));
                fp.push(...q[0], ...q[1], ...q[2]);
                fp.push(...q[0], ...q[2], ...q[3]);
                const fGeom = new THREE.BufferGeometry();
                fGeom.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3));
                fGeom.computeVertexNormals();
                const fMat = new THREE.MeshBasicMaterial({
                    color, transparent: true, opacity: 0.06,
                    side: THREE.DoubleSide, depthWrite: false,
                });
                netGroup.add(new THREE.Mesh(fGeom, fMat));
            }
        }

        // Update overlay
        const infoEl = document.getElementById('net-info-overlay');
        if (foldT < 0.01) {
            infoEl.textContent = 'Red desplegada — Cruz de Dalí (8 cubos en 3D)';
        } else if (foldT > 0.99) {
            infoEl.textContent = 'Tesseract plegado — Proyección perspectiva 4D→3D';
        } else {
            infoEl.textContent = `Plegado: ${Math.round(foldT * 100)}%`;
        }
    }

    // ==================== PROPERTIES ====================

    function updateProperties() {
        const reg = P.registry[state.polytope];
        const data = P.getPolytope(state.polytope);

        const table = document.getElementById('properties-table');
        table.innerHTML = `
            <div class="prop-row"><span class="prop-label">Vértices</span><span class="prop-value highlight">${reg.V}</span></div>
            <div class="prop-row"><span class="prop-label">Aristas</span><span class="prop-value highlight">${reg.E}</span></div>
            <div class="prop-row"><span class="prop-label">Caras</span><span class="prop-value">${reg.F}</span></div>
            <div class="prop-row"><span class="prop-label">Celdas</span><span class="prop-value">${reg.C}</span></div>
            <div class="prop-row"><span class="prop-label">Euler (V−E+F−C)</span><span class="prop-value">${reg.V - reg.E + reg.F - reg.C}</span></div>
            <div class="prop-row"><span class="prop-label">Tipo de celda</span><span class="prop-value">${reg.cellType}</span></div>
            <div class="prop-row"><span class="prop-label">Análogo 3D</span><span class="prop-value">${reg.analogy}</span></div>
        `;

        document.getElementById('polytope-name').textContent = reg.name.split('(')[0].trim();

        // Schläfli
        const schlafli = document.getElementById('schlafli-display');
        try {
            katex.render(reg.schlafli.replace('{','\\{').replace('}','\\}'), schlafli, { throwOnError: false });
        } catch (e) {
            schlafli.textContent = reg.schlafli;
        }
        document.getElementById('schlafli-desc').textContent =
            `Notación de Schläfli para el ${reg.name.split('(')[0].trim()}`;

        // Dual
        const dualReg = P.registry[reg.dual];
        document.getElementById('dual-info').innerHTML = reg.dual === state.polytope
            ? `<span class="text-violet-300">Auto-dual</span> — el dual es él mismo`
            : `Dual: <span class="text-violet-300">${dualReg.name}</span> ${dualReg.schlafli}`;
    }

    // ==================== MODE SWITCHING ====================

    function switchMode(mode) {
        state.mode = mode;

        // Update tabs
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Toggle panels
        ['explore', 'slice', 'cells', 'net'].forEach(m => {
            document.getElementById(`${m}-panel`).classList.toggle('hidden', m !== mode);
        });

        // Overlays
        document.getElementById('slice-overlay').classList.toggle('hidden', mode !== 'slice');
        document.getElementById('cell-overlay').classList.toggle('hidden', mode !== 'cells');
        document.getElementById('net-overlay').classList.toggle('hidden', mode !== 'net');

        // Net panel: show/hide content based on polytope
        if (mode === 'net') {
            const isTesseract = state.polytope === 'tesseract';
            document.getElementById('net-content').classList.toggle('hidden', !isTesseract);
            document.getElementById('net-unavailable').classList.toggle('hidden', isTesseract);
        }

        // Cells panel
        if (mode === 'cells') {
            const data = P.getPolytope(state.polytope);
            state.currentCell = 0;
            updateCellInfo();
        }

        updatePolytope();
    }

    function switchPolytope(key) {
        state.polytope = key;
        state.currentCell = 0;

        document.querySelectorAll('.polytope-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.polytope === key);
        });

        // Reset slice position
        state.slicePos = 0;
        document.getElementById('slice-position').value = 0;
        document.getElementById('slice-pos-val').textContent = '0.00';

        updateProperties();

        // Re-check net availability
        if (state.mode === 'net') {
            const isTesseract = key === 'tesseract';
            document.getElementById('net-content').classList.toggle('hidden', !isTesseract);
            document.getElementById('net-unavailable').classList.toggle('hidden', isTesseract);
        }

        updatePolytope();
    }

    // ==================== MOUSE CONTROLS ====================

    function initMouse() {
        const canvas = document.getElementById('main-canvas');

        canvas.addEventListener('mousedown', (e) => {
            state.isDragging = true;
            state.lastX = e.clientX;
            state.lastY = e.clientY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!state.isDragging) return;
            const dx = e.clientX - state.lastX;
            const dy = e.clientY - state.lastY;
            state.lastX = e.clientX;
            state.lastY = e.clientY;

            state.camTheta += dx * 0.005;
            state.camPhi = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, state.camPhi - dy * 0.005));
        });

        window.addEventListener('mouseup', () => { state.isDragging = false; });

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            state.camDist = Math.max(1.5, Math.min(15, state.camDist + e.deltaY * 0.005));
        }, { passive: false });

        // Touch
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                state.isDragging = true;
                state.lastX = e.touches[0].clientX;
                state.lastY = e.touches[0].clientY;
            }
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && state.isDragging) {
                const dx = e.touches[0].clientX - state.lastX;
                const dy = e.touches[0].clientY - state.lastY;
                state.lastX = e.touches[0].clientX;
                state.lastY = e.touches[0].clientY;
                state.camTheta += dx * 0.005;
                state.camPhi = Math.max(-Math.PI/2+0.1, Math.min(Math.PI/2-0.1, state.camPhi - dy * 0.005));
            }
        }, { passive: false });

        canvas.addEventListener('touchend', () => { state.isDragging = false; });
    }

    // ==================== UI BINDINGS ====================

    function bindEvents() {
        // Polytope selector
        document.querySelectorAll('.polytope-btn').forEach(btn => {
            btn.addEventListener('click', () => switchPolytope(btn.dataset.polytope));
        });

        // Mode tabs
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => switchMode(btn.dataset.mode));
        });

        // Projection buttons
        document.querySelectorAll('.proj-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.projection = btn.dataset.proj;
                document.querySelectorAll('.proj-btn').forEach(b => b.classList.toggle('active', b === btn));
                updatePolytope();
            });
        });

        // View distance
        document.getElementById('view-distance').addEventListener('input', (e) => {
            state.viewDistance = parseFloat(e.target.value);
            document.getElementById('view-dist-val').textContent = state.viewDistance.toFixed(1);
            updatePolytope();
        });

        // Rotation sliders
        document.querySelectorAll('.rotation-slider').forEach(slider => {
            slider.addEventListener('input', () => {
                const plane = slider.dataset.plane;
                const deg = parseInt(slider.value);
                state.angles[plane] = deg * Math.PI / 180;
                document.querySelector(`.rotation-value[data-plane="${plane}"]`).textContent = `${deg}°`;
                updatePolytope();
            });
        });

        // Options
        document.getElementById('auto-rotate').addEventListener('change', (e) => {
            state.autoRotate = e.target.checked;
        });

        document.getElementById('depth-color').addEventListener('change', (e) => {
            state.depthColor = e.target.checked;
            updatePolytope();
        });

        document.getElementById('show-vertices').addEventListener('change', (e) => {
            state.showVertices = e.target.checked;
            updatePolytope();
        });

        document.getElementById('show-axes').addEventListener('change', (e) => {
            state.showAxes = e.target.checked;
            createAxes();
        });

        // Slice controls
        document.querySelectorAll('.cut-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.sliceCut = btn.dataset.cut;
                document.querySelectorAll('.cut-btn').forEach(b => b.classList.toggle('active', b === btn));
                state.slicePos = 0;
                document.getElementById('slice-position').value = 0;
                document.getElementById('slice-pos-val').textContent = '0.00';
                updatePolytope();
            });
        });

        document.getElementById('slice-position').addEventListener('input', (e) => {
            state.slicePos = parseFloat(e.target.value);
            document.getElementById('slice-pos-val').textContent = state.slicePos.toFixed(2);
            if (state.mode === 'slice') updateSlice();
        });

        document.getElementById('slice-animate').addEventListener('change', (e) => {
            state.sliceAnimate = e.target.checked;
            state.sliceDir = 1;
        });

        document.getElementById('show-slice-plane').addEventListener('change', (e) => {
            state.showSlicePlane = e.target.checked;
            if (state.mode === 'slice') updateSlice();
        });

        // Cell controls
        document.getElementById('cell-prev').addEventListener('click', () => {
            const data = P.getPolytope(state.polytope);
            if (!data.hasCells) return;
            state.currentCell = (state.currentCell - 1 + data.cells.length) % data.cells.length;
            updatePolytope();
        });

        document.getElementById('cell-next').addEventListener('click', () => {
            const data = P.getPolytope(state.polytope);
            if (!data.hasCells) return;
            state.currentCell = (state.currentCell + 1) % data.cells.length;
            updatePolytope();
        });

        document.getElementById('isolate-cell').addEventListener('change', (e) => {
            state.isolateCell = e.target.checked;
            updatePolytope();
        });

        document.getElementById('show-cell-faces').addEventListener('change', (e) => {
            state.showCellFaces = e.target.checked;
            updatePolytope();
        });

        document.getElementById('explode-cells').addEventListener('change', (e) => {
            state.explodeCells = e.target.checked;
            document.getElementById('explode-amount').disabled = !e.target.checked;
            updatePolytope();
        });

        document.getElementById('explode-amount').addEventListener('input', (e) => {
            state.explodeAmount = parseFloat(e.target.value);
            document.getElementById('explode-val').textContent = state.explodeAmount.toFixed(1);
            updatePolytope();
        });

        // Net controls
        document.getElementById('fold-slider').addEventListener('input', (e) => {
            state.foldAmount = parseInt(e.target.value);
            document.getElementById('fold-val').textContent = `${state.foldAmount}%`;
            if (state.mode === 'net') updateNet();
        });

        document.getElementById('net-play').addEventListener('click', () => {
            if (state.netPlaying) {
                state.netPlaying = false;
                document.getElementById('net-play').textContent = state.foldAmount > 50 ? '▶ Desplegar' : '▶ Plegar';
            } else {
                state.netPlaying = true;
                document.getElementById('net-play').textContent = '⏸ Pausar';
                // Determine direction based on current position
                if (state.foldAmount >= 99) state.netDir = -1; // unfold
                else if (state.foldAmount <= 1) state.netDir = 1; // fold
                // else keep current direction
            }
        });

        document.getElementById('net-reset').addEventListener('click', () => {
            state.netPlaying = false;
            state.foldAmount = 100;
            document.getElementById('fold-slider').value = 100;
            document.getElementById('fold-val').textContent = '100%';
            document.getElementById('net-play').textContent = '▶ Desplegar';
            if (state.mode === 'net') updateNet();
        });

        document.getElementById('go-tesseract').addEventListener('click', () => {
            switchPolytope('tesseract');
        });
    }

    // ==================== ANIMATE ====================

    let lastTime = 0;

    function animate(time) {
        requestAnimationFrame(animate);

        const dt = Math.min((time - lastTime) / 1000, 0.05);
        lastTime = time;

        let needsRedraw = false;

        // Auto-rotation in 4D
        if (state.autoRotate && !state.isDragging) {
            state.angles.xw += dt * 0.3;
            state.angles.yz += dt * 0.17;

            // Update sliders
            const xwDeg = Math.round((state.angles.xw * 180 / Math.PI) % 360);
            const yzDeg = Math.round((state.angles.yz * 180 / Math.PI) % 360);
            const xwSlider = document.querySelector('.rotation-slider[data-plane="xw"]');
            const yzSlider = document.querySelector('.rotation-slider[data-plane="yz"]');
            if (xwSlider) {
                xwSlider.value = (xwDeg + 360) % 360;
                document.querySelector('.rotation-value[data-plane="xw"]').textContent = `${(xwDeg + 360) % 360}°`;
            }
            if (yzSlider) {
                yzSlider.value = (yzDeg + 360) % 360;
                document.querySelector('.rotation-value[data-plane="yz"]').textContent = `${(yzDeg + 360) % 360}°`;
            }
            needsRedraw = true;
        }

        // Slice animation
        if (state.mode === 'slice' && state.sliceAnimate) {
            const range = S.getSliceRange(state.sliceCut, state.polytope);
            const speed = (range.max - range.min) * 0.3;
            state.slicePos += state.sliceDir * dt * speed;
            if (state.slicePos > range.max * 0.98) { state.sliceDir = -1; }
            if (state.slicePos < range.min * 0.98) { state.sliceDir = 1; }
            document.getElementById('slice-position').value = state.slicePos;
            document.getElementById('slice-pos-val').textContent = state.slicePos.toFixed(2);
            needsRedraw = true;
        }

        // Net animation
        if (state.mode === 'net' && state.netPlaying) {
            state.foldAmount += state.netDir * dt * 40;
            if (state.foldAmount <= 0) {
                state.foldAmount = 0;
                state.netPlaying = false;
                state.netDir = 1;
                document.getElementById('net-play').textContent = '▶ Plegar';
            } else if (state.foldAmount >= 100) {
                state.foldAmount = 100;
                state.netPlaying = false;
                state.netDir = -1;
                document.getElementById('net-play').textContent = '▶ Desplegar';
            }
            document.getElementById('fold-slider').value = state.foldAmount;
            document.getElementById('fold-val').textContent = `${Math.round(state.foldAmount)}%`;
            needsRedraw = true;
        }

        if (needsRedraw) {
            updatePolytope();
        }

        // Update 3D camera
        camera.position.x = state.camDist * Math.sin(state.camTheta) * Math.cos(state.camPhi);
        camera.position.y = state.camDist * Math.sin(state.camPhi);
        camera.position.z = state.camDist * Math.cos(state.camTheta) * Math.cos(state.camPhi);
        camera.lookAt(0, 0, 0);

        // Rotation display
        const dispEl = document.getElementById('rotation-display');
        if (dispEl) {
            const xw = Math.round((state.angles.xw * 180 / Math.PI) % 360);
            const yz = Math.round((state.angles.yz * 180 / Math.PI) % 360);
            dispEl.textContent = `XW:${(xw+360)%360}° YZ:${(yz+360)%360}°`;
        }

        renderer.render(scene, camera);
    }

    // ==================== INIT ====================

    function init() {
        initThree();
        initMouse();
        bindEvents();
        updateProperties();
        updatePolytope();
        requestAnimationFrame(animate);
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
