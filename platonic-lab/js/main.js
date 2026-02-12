/**
 * PlatonicLab — Core: Three.js, state, render loop, UI, orchestration
 */
(() => {
    'use strict';

    const { solids, getConstructionSteps, getDualScale } = window.PlatonicGeometry;
    const Anim = window.PlatonicAnimations;
    const CS = window.PlatonicCrossSection;
    const Conway = window.PlatonicConway;
    const P4D = window.PlatonicPolytopes4D;
    const Schlegel = window.PlatonicSchlegel;

    // ==================== STATE ====================
    const state = {
        mode: 'explore',
        currentSolid: 'tetrahedron',
        edgeLength: 1.0,
        renderMode: 'translucent',
        showEdges: true,
        showVertices: false,
        showAxes: true,
        showDual: false,
        showCircumsphere: false,
        showInsphere: false,
        autoRotate: true,
        rotation: { x: 0.3, y: 0.5 },
        // Mouse interaction
        isDragging: false,
        lastMouse: { x: 0, y: 0 },
        // Construction mode
        constructionStep: 0,
        constructionTimeline: null,
        // Compare mode
        compareSolidA: 'tetrahedron',
        compareSolidB: 'cube',
        // Math panel
        currentPanel: 'solid',
        currentMathTab: 'formulas',
        currentHistoryTab: 'elements',
        mathDerivationProperty: 'volume',
        // Conway
        conwaySeed: 'tetrahedron',
        conwayOp: null,
        conwayT: 1.0,
        conwaySeedPoly: null,
        conwayResultPoly: null,
        // 4D Polytopes
        p4dType: 'tesseract',
        p4dXW: 0,
        p4dYW: 0,
        p4dAutoRotate4D: true,
        p4dDepthColor: true,
        p4dAngle: 0, // auto-rotation accumulator
        // Schlegel
        schlegelSolid: 'tetrahedron',
        schlegelHamilton: false,
        schlegelColoring: false,
        schlegelLabels: false,
        // Cross-section
        showCrossSection: false,
        csHeight: 0,
        csTheta: 0,
        csPhi: 0,
    };

    // ==================== THREE.JS SETUP ====================
    const canvas = document.getElementById('main-canvas');
    const container = document.getElementById('canvas-container');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(0, 0, 4);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.localClippingEnabled = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 0.3);
    dirLight2.position.set(-3, -2, 4);
    scene.add(dirLight2);

    // Scene graph containers
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    let primaryMesh = null;
    let primaryEdges = null;
    let vertexDots = null;
    let dualMesh = null;
    let dualEdges = null;
    let circumsphereMesh = null;
    let insphereMesh = null;
    let axesGroup = null;
    let gridHelper = null;

    // Cross-section
    let csOutline = null;
    let csFill = null;
    let csPlaneHelper = null;
    let csLocalPlane = null; // THREE.Plane in local (mainGroup) space

    // Conway mode
    let conwayMesh = null;
    let conwayEdgeLines = null;
    const conwayGroup = new THREE.Group();

    // 4D mode
    let p4dEdges = null;
    let p4dVertices = null;
    let p4dPolytopeData = null;
    const p4dGroup = new THREE.Group();

    // Compare mode
    let secondaryMesh = null;
    let secondaryEdges = null;
    const compareGroupA = new THREE.Group();
    const compareGroupB = new THREE.Group();
    compareGroupA.position.x = -2;
    compareGroupB.position.x = 2;

    // ==================== GEOMETRY CREATION ====================

    function createThreeGeometry(solidKey, edgeLength) {
        const s = solids[solidKey];
        const a = edgeLength;

        if (solidKey === 'cube') {
            return new THREE.BoxGeometry(a, a, a);
        }

        // All others take circumradius
        const radius = s.circumradiusCoeff * a;

        switch (solidKey) {
            case 'tetrahedron': return new THREE.TetrahedronGeometry(radius);
            case 'octahedron': return new THREE.OctahedronGeometry(radius);
            case 'dodecahedron': return new THREE.DodecahedronGeometry(radius);
            case 'icosahedron': return new THREE.IcosahedronGeometry(radius);
            default: return new THREE.TetrahedronGeometry(radius);
        }
    }

    function createMaterial(solidKey) {
        const s = solids[solidKey];
        const color = s.color;

        switch (state.renderMode) {
            case 'solid':
                return new THREE.MeshPhongMaterial({
                    color,
                    shininess: 80,
                    side: THREE.DoubleSide,
                });
            case 'wireframe':
                return new THREE.MeshBasicMaterial({
                    color,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.6,
                });
            case 'translucent':
            default:
                return new THREE.MeshPhongMaterial({
                    color,
                    transparent: true,
                    opacity: 0.35,
                    shininess: 100,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                });
        }
    }

    function createEdgeLines(geometry, color) {
        const edges = new THREE.EdgesGeometry(geometry);
        const mat = new THREE.LineBasicMaterial({
            color: color || 0xffffff,
            transparent: true,
            opacity: 0.6,
        });
        return new THREE.LineSegments(edges, mat);
    }

    function createVertexDots(geometry, color) {
        const positions = geometry.getAttribute('position');
        const uniqueVertices = [];
        const seen = new Set();

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueVertices.push(x, y, z);
            }
        }

        const dotGeom = new THREE.BufferGeometry();
        dotGeom.setAttribute('position', new THREE.Float32BufferAttribute(uniqueVertices, 3));

        const mat = new THREE.PointsMaterial({
            color: color || 0xffffff,
            size: 0.06,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9,
        });

        return new THREE.Points(dotGeom, mat);
    }

    // ==================== AXES ====================

    function createAxes() {
        const group = new THREE.Group();
        const len = 2;
        const colors = [0xff4444, 0x44ff44, 0x4488ff];
        const dirs = [
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 1),
        ];

        dirs.forEach((dir, i) => {
            const points = [
                dir.clone().multiplyScalar(-len),
                dir.clone().multiplyScalar(len),
            ];
            const geom = new THREE.BufferGeometry().setFromPoints(points);
            const mat = new THREE.LineBasicMaterial({
                color: colors[i],
                transparent: true,
                opacity: 0.2,
            });
            group.add(new THREE.LineSegments(geom, mat));
        });

        return group;
    }

    // ==================== SPHERES ====================

    function createSphere(radius, color) {
        const geom = new THREE.SphereGeometry(radius, 32, 24);
        const mat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.12,
            wireframe: true,
            depthWrite: false,
        });
        return new THREE.Mesh(geom, mat);
    }

    // ==================== DUAL ====================

    function createDualSolid(solidKey, edgeLength) {
        const s = solids[solidKey];
        const dualKey = s.dual;
        const dualSolid = solids[dualKey];
        const scale = getDualScale(solidKey);

        const dualGeom = createThreeGeometry(dualKey, edgeLength * scale);
        const dualMat = new THREE.MeshPhongMaterial({
            color: dualSolid.color,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide,
            depthWrite: false,
        });

        return new THREE.Mesh(dualGeom, dualMat);
    }

    // ==================== DISPOSE ====================

    function disposeObject(obj) {
        if (!obj) return;
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(m => m.dispose());
            } else {
                obj.material.dispose();
            }
        }
        if (obj.parent) obj.parent.remove(obj);
    }

    function clearMainGroup() {
        disposeObject(primaryMesh);
        disposeObject(primaryEdges);
        disposeObject(vertexDots);
        disposeObject(dualMesh);
        disposeObject(dualEdges);
        disposeObject(circumsphereMesh);
        disposeObject(insphereMesh);
        disposeObject(axesGroup);
        if (axesGroup) {
            axesGroup.children.forEach(c => disposeObject(c));
            mainGroup.remove(axesGroup);
        }

        disposeObject(csOutline);
        disposeObject(csFill);
        disposeObject(csPlaneHelper);

        primaryMesh = null;
        primaryEdges = null;
        vertexDots = null;
        dualMesh = null;
        dualEdges = null;
        circumsphereMesh = null;
        insphereMesh = null;
        axesGroup = null;
        csOutline = null;
        csFill = null;
        csPlaneHelper = null;
        csLocalPlane = null;
    }

    // ==================== UPDATE SOLID ====================

    function updateSolid() {
        clearMainGroup();
        const solidKey = state.currentSolid;
        const a = state.edgeLength;
        const s = solids[solidKey];

        // Primary mesh
        const geom = createThreeGeometry(solidKey, a);
        primaryMesh = new THREE.Mesh(geom, createMaterial(solidKey));
        mainGroup.add(primaryMesh);

        // Edges
        if (state.showEdges && state.renderMode !== 'wireframe') {
            primaryEdges = createEdgeLines(geom, s.color);
            mainGroup.add(primaryEdges);
        }

        // Vertices
        if (state.showVertices) {
            vertexDots = createVertexDots(geom, 0xffffff);
            mainGroup.add(vertexDots);
        }

        // Axes
        if (state.showAxes) {
            axesGroup = createAxes();
            mainGroup.add(axesGroup);
        }

        // Dual
        if (state.showDual) {
            dualMesh = createDualSolid(solidKey, a);
            mainGroup.add(dualMesh);

            const dualKey = s.dual;
            const dualScale = getDualScale(solidKey);
            const dualGeom = createThreeGeometry(dualKey, a * dualScale);
            dualEdges = createEdgeLines(dualGeom, solids[dualKey].color);
            dualEdges.material.opacity = 0.4;
            mainGroup.add(dualEdges);
        }

        // Circumsphere
        if (state.showCircumsphere) {
            const R = s.circumradiusCoeff * a;
            circumsphereMesh = createSphere(R, 0x06b6d4);
            mainGroup.add(circumsphereMesh);
        }

        // Insphere
        if (state.showInsphere) {
            const r = s.insphereCoeff * a;
            insphereMesh = createSphere(r, 0x8b5cf6);
            mainGroup.add(insphereMesh);
        }

        updatePropertiesPanel();
        updateSolidFormulas();
        updateHeaderSolidName();

        // Cross-section
        if (state.showCrossSection) {
            updateCrossSection();
        }
    }

    // ==================== CROSS-SECTION ====================

    function updateCrossSection() {
        // Dispose old cross-section objects
        disposeObject(csOutline);
        disposeObject(csFill);
        disposeObject(csPlaneHelper);
        csOutline = null;
        csFill = null;
        csPlaneHelper = null;

        if (!state.showCrossSection || !primaryMesh) {
            clearClipPlanes();
            return;
        }

        // Compute the cutting plane in local space
        csLocalPlane = CS.computePlane(state.csHeight, state.csTheta, state.csPhi);

        // Compute intersection
        const segments = CS.computeIntersection(primaryMesh.geometry, csLocalPlane);
        const polygon = CS.orderSegments(segments);

        // Create visual objects
        if (polygon.length >= 3) {
            csOutline = CS.createOutline(polygon, 0x22d3ee);
            mainGroup.add(csOutline);

            csFill = CS.createFill(polygon, 0x22d3ee);
            mainGroup.add(csFill);

            // 2D projection
            const pts2D = CS.projectTo2D(polygon, csLocalPlane.normal);
            const info = CS.analyzePolygon(polygon, pts2D);

            // Draw on 2D canvas
            const canvas2D = document.getElementById('cs-2d-canvas');
            if (canvas2D) CS.draw2D(canvas2D, pts2D, info);

            // Update info panel
            const csInfoEl = document.getElementById('cs-info');
            if (csInfoEl && info) {
                csInfoEl.innerHTML = `<span class="text-cyan-400">${info.name}</span><br>` +
                    `Lados: ${info.sides} | Área: ${info.area.toFixed(4)}<br>` +
                    `Perímetro: ${info.perimeter.toFixed(4)}`;
            }

            const cs2dInfo = document.getElementById('cs-2d-info');
            if (cs2dInfo && info) {
                cs2dInfo.textContent = `${info.sides} lados — ${info.isRegular ? 'regular' : 'irregular'}`;
            }
        } else {
            // No intersection
            const canvas2D = document.getElementById('cs-2d-canvas');
            if (canvas2D) CS.draw2D(canvas2D, null, null);

            const csInfoEl = document.getElementById('cs-info');
            if (csInfoEl) csInfoEl.innerHTML = '<span class="text-gray-500">Sin intersección en esta posición</span>';
        }

        // Semi-transparent plane helper
        csPlaneHelper = CS.createPlaneHelper(csLocalPlane, 5, 0x22d3ee);
        mainGroup.add(csPlaneHelper);

        // Apply clipping to solid materials
        applyClipPlanes();
    }

    function applyClipPlanes() {
        if (!csLocalPlane) return;
        // We clip in world space, updated per-frame in animate()
        // For now, set a placeholder that gets updated
        const plane = csLocalPlane.clone();
        if (primaryMesh) primaryMesh.material.clippingPlanes = [plane];
        if (primaryEdges) primaryEdges.material.clippingPlanes = [plane];
        if (vertexDots) vertexDots.material.clippingPlanes = [plane];
    }

    function clearClipPlanes() {
        if (primaryMesh && primaryMesh.material) primaryMesh.material.clippingPlanes = [];
        if (primaryEdges && primaryEdges.material) primaryEdges.material.clippingPlanes = [];
        if (vertexDots && vertexDots.material) vertexDots.material.clippingPlanes = [];
    }

    function updateClipPlanesWorldSpace() {
        // Transform local-space clip plane to world space for correct clipping during rotation
        if (!csLocalPlane || !state.showCrossSection) return;

        mainGroup.updateMatrixWorld(true);
        const worldPlane = csLocalPlane.clone().applyMatrix4(mainGroup.matrixWorld);

        if (primaryMesh && primaryMesh.material.clippingPlanes && primaryMesh.material.clippingPlanes.length) {
            primaryMesh.material.clippingPlanes[0].copy(worldPlane);
        }
        if (primaryEdges && primaryEdges.material.clippingPlanes && primaryEdges.material.clippingPlanes.length) {
            primaryEdges.material.clippingPlanes[0].copy(worldPlane);
        }
        if (vertexDots && vertexDots.material.clippingPlanes && vertexDots.material.clippingPlanes.length) {
            vertexDots.material.clippingPlanes[0].copy(worldPlane);
        }
    }

    // ==================== CONWAY MODE ====================

    function updateConway() {
        // Clean conway group
        if (conwayMesh) { disposeObject(conwayMesh); conwayMesh = null; }
        if (conwayEdgeLines) { disposeObject(conwayEdgeLines); conwayEdgeLines = null; }
        while (conwayGroup.children.length) {
            disposeObject(conwayGroup.children[0]);
            conwayGroup.remove(conwayGroup.children[0]);
        }

        // Get seed
        const seed = Conway.getSeed(state.conwaySeed);
        state.conwaySeedPoly = seed;

        let displayPoly;

        if (state.conwayOp && Conway.operations[state.conwayOp]) {
            // Apply operation
            const result = Conway.operations[state.conwayOp].fn(seed);
            state.conwayResultPoly = result;

            // Interpolate if t < 1
            if (state.conwayT < 0.999) {
                // Interpolate vertices (approximate morph)
                const interpVerts = Conway.interpolateVertices(
                    seed.vertices.length <= result.vertices.length
                        ? seed.vertices : seed.vertices,
                    result.vertices,
                    state.conwayT
                );
                displayPoly = { vertices: interpVerts, faces: result.faces, name: result.name };
            } else {
                displayPoly = result;
            }
        } else {
            displayPoly = seed;
            state.conwayResultPoly = null;
        }

        // Create mesh
        const scale = state.edgeLength * 1.5; // Scale up for visibility
        const geom = Conway.toBufferGeometry(displayPoly, scale);
        const color = window.PlatonicGeometry.solids[state.conwaySeed].color;
        const mat = new THREE.MeshPhongMaterial({
            color,
            transparent: true,
            opacity: 0.35,
            shininess: 100,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        conwayMesh = new THREE.Mesh(geom, mat);
        conwayGroup.add(conwayMesh);

        // Create edges
        const edgeGeom = Conway.toEdgeGeometry(displayPoly, scale);
        const edgeMat = new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: 0.6,
        });
        conwayEdgeLines = new THREE.LineSegments(edgeGeom, edgeMat);
        conwayGroup.add(conwayEdgeLines);

        // Update info display
        updateConwayInfo(displayPoly);
    }

    function updateConwayInfo(poly) {
        const nameEl = document.getElementById('conway-result-name');
        const infoEl = document.getElementById('conway-result-info');
        if (!nameEl || !infoEl) return;

        const info = Conway.getInfo(poly);

        // Check known name
        const key = `${state.conwaySeed}+${state.conwayOp}`;
        const knownName = Conway.knownResults[key];

        nameEl.textContent = knownName || info.name;

        const faceDesc = Object.entries(info.faceSizes)
            .map(([sides, count]) => `${count}×${sides}-gono`)
            .join(', ');

        infoEl.innerHTML = `
            <div>V=${info.V}  E=${info.E}  F=${info.F}  χ=${info.euler}</div>
            <div>Caras: ${faceDesc}</div>
        `;
    }

    // ==================== 4D POLYTOPES ====================

    function update4DPolytope() {
        // Clean
        while (p4dGroup.children.length) {
            disposeObject(p4dGroup.children[0]);
            p4dGroup.remove(p4dGroup.children[0]);
        }
        p4dEdges = null;
        p4dVertices = null;

        const polyInfo = P4D.polytopes[state.p4dType];
        if (!polyInfo) return;

        p4dPolytopeData = polyInfo.build();

        render4DFrame();

        // Update info
        const infoEl = document.getElementById('p4d-info');
        if (infoEl) {
            infoEl.innerHTML = `
                <div class="text-cyan-400 font-medium text-xs mb-1">${polyInfo.name}</div>
                <div>Schläfli: ${polyInfo.schlafli}</div>
                <div>Celdas: ${polyInfo.cells} | Caras: ${polyInfo.faces}</div>
                <div>Aristas: ${polyInfo.edges} | Vértices: ${polyInfo.vertices}</div>
                <div>Celda: ${polyInfo.cellType}</div>
                <div>Análogo 3D: ${polyInfo.analogy}</div>
            `;
        }
    }

    function render4DFrame() {
        if (!p4dPolytopeData) return;

        // Remove old
        while (p4dGroup.children.length) {
            const child = p4dGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            p4dGroup.remove(child);
        }

        const xwAngle = (state.p4dXW + (state.p4dAutoRotate4D ? state.p4dAngle : 0)) * Math.PI / 180;
        const ywAngle = (state.p4dYW + (state.p4dAutoRotate4D ? state.p4dAngle * 0.7 : 0)) * Math.PI / 180;

        const angles = { xw: xwAngle, yw: ywAngle };

        p4dEdges = P4D.createProjectedEdges(p4dPolytopeData, angles, 3, 1.5, state.p4dDepthColor);
        p4dGroup.add(p4dEdges);

        p4dVertices = P4D.createProjectedVertices(p4dPolytopeData, angles, 3, 1.5);
        p4dGroup.add(p4dVertices);
    }

    // ==================== SCHLEGEL ====================

    function updateSchlegel() {
        const canvas = document.getElementById('schlegel-canvas');
        if (!canvas) return;

        Schlegel.draw(canvas, state.schlegelSolid, {
            showHamilton: state.schlegelHamilton,
            showColoring: state.schlegelColoring,
            showLabels: state.schlegelLabels,
        });

        const infoEl = document.getElementById('schlegel-info');
        if (infoEl) {
            infoEl.innerHTML = Schlegel.getInfoHTML(state.schlegelSolid);
        }
    }

    // ==================== COMPARE MODE ====================

    function updateCompare() {
        // Clean compare groups
        compareGroupA.children.forEach(c => disposeObject(c));
        compareGroupB.children.forEach(c => disposeObject(c));
        while (compareGroupA.children.length) compareGroupA.remove(compareGroupA.children[0]);
        while (compareGroupB.children.length) compareGroupB.remove(compareGroupB.children[0]);

        const a = state.edgeLength;

        // Solid A
        const geomA = createThreeGeometry(state.compareSolidA, a);
        const solidA = solids[state.compareSolidA];
        const matA = new THREE.MeshPhongMaterial({
            color: solidA.color,
            transparent: true,
            opacity: 0.35,
            shininess: 100,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        const meshA = new THREE.Mesh(geomA, matA);
        compareGroupA.add(meshA);
        const edgesA = createEdgeLines(geomA, solidA.color);
        compareGroupA.add(edgesA);

        // Solid B
        const geomB = createThreeGeometry(state.compareSolidB, a);
        const solidB = solids[state.compareSolidB];
        const matB = new THREE.MeshPhongMaterial({
            color: solidB.color,
            transparent: true,
            opacity: 0.35,
            shininess: 100,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        const meshB = new THREE.Mesh(geomB, matB);
        compareGroupB.add(meshB);
        const edgesB = createEdgeLines(geomB, solidB.color);
        compareGroupB.add(edgesB);
    }

    // ==================== UI UPDATES ====================

    function updateHeaderSolidName() {
        const el = document.getElementById('header-solid-name');
        if (el) el.textContent = solids[state.currentSolid].name;
    }

    function updatePropertiesPanel() {
        const s = solids[state.currentSolid];
        const a = state.edgeLength;
        const calc = window.PlatonicMath.calculate(state.currentSolid, a);

        document.getElementById('prop-V').textContent = s.V;
        document.getElementById('prop-E').textContent = s.E;
        document.getElementById('prop-F').textContent = s.F;
        document.getElementById('prop-euler').textContent = s.V - s.E + s.F;
        document.getElementById('prop-face-type').textContent = s.faceType;
        document.getElementById('prop-faces-vertex').textContent = s.facesPerVertex;
        document.getElementById('prop-schlafli').textContent = s.schlafli;
        document.getElementById('prop-dihedral').textContent = s.dihedralAngleDeg.toFixed(2) + '°';
        document.getElementById('prop-volume').textContent = calc.volume.toFixed(4) + ' a³';
        document.getElementById('prop-area').textContent = calc.area.toFixed(4) + ' a²';
        document.getElementById('prop-symmetry').textContent = `${s.symmetryGroup} (${s.symmetryOrder})`;
        document.getElementById('prop-dual').textContent = s.dualName;
        document.getElementById('prop-element').textContent = `${s.element} ${s.elementEmoji}`;
    }

    function updateSolidFormulas() {
        window.PlatonicMath.renderFormulas(state.currentSolid, 'solid-formulas');
    }

    function updateEdgeLengthDisplay() {
        const el = document.getElementById('edge-length-value');
        if (el) el.textContent = `a = ${state.edgeLength.toFixed(2)}`;
    }

    function updateRotationDisplay() {
        const el = document.getElementById('header-rotation');
        if (el) {
            const thetaDeg = ((state.rotation.x * 180 / Math.PI) % 360).toFixed(0);
            const phiDeg = ((state.rotation.y * 180 / Math.PI) % 360).toFixed(0);
            el.textContent = `θ ${thetaDeg}° φ ${phiDeg}°`;
        }
    }

    // ==================== CALCULATOR ====================

    function updateCalculator() {
        const input = document.getElementById('calc-edge-input');
        const select = document.getElementById('calc-solid-select');
        const resultsDiv = document.getElementById('calc-results');
        if (!input || !select || !resultsDiv) return;

        const a = parseFloat(input.value) || 1;
        const solidKey = select.value;
        const calc = window.PlatonicMath.calculate(solidKey, a);
        if (!calc) return;

        resultsDiv.innerHTML = `
            <div class="calc-result-row"><span class="calc-result-label">Vértices</span><span class="calc-result-value">${calc.V}</span></div>
            <div class="calc-result-row"><span class="calc-result-label">Aristas</span><span class="calc-result-value">${calc.E}</span></div>
            <div class="calc-result-row"><span class="calc-result-label">Caras</span><span class="calc-result-value">${calc.F}</span></div>
            <div class="calc-result-row"><span class="calc-result-label">Euler (V−E+F)</span><span class="calc-result-value">${calc.euler}</span></div>
            <div class="calc-result-row"><span class="calc-result-label">Volumen</span><span class="calc-result-value">${calc.volume.toFixed(6)}</span></div>
            <div class="calc-result-row"><span class="calc-result-label">Área superficial</span><span class="calc-result-value">${calc.area.toFixed(6)}</span></div>
            <div class="calc-result-row"><span class="calc-result-label">Circumradio</span><span class="calc-result-value">${calc.circumradius.toFixed(6)}</span></div>
            <div class="calc-result-row"><span class="calc-result-label">Inradio</span><span class="calc-result-value">${calc.insphere.toFixed(6)}</span></div>
            <div class="calc-result-row"><span class="calc-result-label">Mesoradio</span><span class="calc-result-value">${calc.midradius.toFixed(6)}</span></div>
            <div class="calc-result-row"><span class="calc-result-label">Ángulo diedro</span><span class="calc-result-value">${calc.dihedralAngle.toFixed(3)}°</span></div>
            <div class="calc-result-row"><span class="calc-result-label">Simetría</span><span class="calc-result-value">${calc.symmetryGroup} (${calc.symmetryOrder})</span></div>
            <div class="calc-result-row"><span class="calc-result-label">Dual</span><span class="calc-result-value">${calc.dual}</span></div>
            <div class="calc-result-row"><span class="calc-result-label">Elemento</span><span class="calc-result-value">${calc.element}</span></div>
        `;
    }

    // ==================== MATH PANEL ====================

    function updateMathPanel() {
        const container = document.getElementById('math-content');
        if (!container) return;

        container.innerHTML = '';

        switch (state.currentMathTab) {
            case 'formulas':
                renderMathFormulas(container);
                break;
            case 'derivations':
                renderMathDerivations(container);
                break;
            case 'symmetry':
                container.id = 'math-content';
                window.PlatonicMath.renderSymmetry(state.currentSolid, 'math-content');
                break;
            case 'euler':
                // Euler + Classification
                const eulerDiv = document.createElement('div');
                eulerDiv.id = 'euler-section';
                container.appendChild(eulerDiv);
                window.PlatonicMath.renderEuler('euler-section');

                const classDiv = document.createElement('div');
                classDiv.id = 'classification-section';
                classDiv.className = 'mt-6';
                container.appendChild(classDiv);
                window.PlatonicMath.renderClassification('classification-section');
                break;
            case 'spheres':
                container.id = 'math-content';
                window.PlatonicMath.renderSpheres(state.currentSolid, 'math-content');
                break;
        }
    }

    function renderMathFormulas(container) {
        const header = document.createElement('div');
        header.className = 'section-header';
        header.textContent = `Fórmulas — ${solids[state.currentSolid].name}`;
        container.appendChild(header);

        const formulasDiv = document.createElement('div');
        formulasDiv.id = 'math-formulas-content';
        formulasDiv.className = 'math-box space-y-2';
        container.appendChild(formulasDiv);

        window.PlatonicMath.renderFormulas(state.currentSolid, 'math-formulas-content');

        // Also show golden ratio note for dodecahedron/icosahedron
        if (state.currentSolid === 'dodecahedron' || state.currentSolid === 'icosahedron') {
            const note = document.createElement('div');
            note.className = 'mt-3 p-3 bg-gray-900/50 rounded-lg border border-purple-900/30';
            note.innerHTML = '<div class="text-xs text-purple-400 font-medium mb-1">Razón áurea</div>';
            const phiDiv = document.createElement('div');
            phiDiv.id = 'golden-ratio-note';
            note.appendChild(phiDiv);
            container.appendChild(note);
            katex.render('\\varphi = \\frac{1+\\sqrt{5}}{2} \\approx 1.618', phiDiv, { displayMode: true, throwOnError: false });
        }
    }

    function renderMathDerivations(container) {
        const header = document.createElement('div');
        header.className = 'section-header';
        header.textContent = `Derivaciones — ${solids[state.currentSolid].name}`;
        container.appendChild(header);

        // Property selector
        const selectorDiv = document.createElement('div');
        selectorDiv.className = 'flex gap-2 mb-3';

        ['volume', 'area'].forEach(prop => {
            const btn = document.createElement('button');
            btn.className = `render-btn ${state.mathDerivationProperty === prop ? 'active' : ''}`;
            btn.textContent = prop === 'volume' ? 'Volumen' : 'Área';
            btn.addEventListener('click', () => {
                state.mathDerivationProperty = prop;
                updateMathPanel();
            });
            selectorDiv.appendChild(btn);
        });

        container.appendChild(selectorDiv);

        const derivDiv = document.createElement('div');
        derivDiv.id = 'derivation-content';
        container.appendChild(derivDiv);

        window.PlatonicMath.renderDerivation(state.currentSolid, state.mathDerivationProperty, 'derivation-content');
    }

    // ==================== HISTORY PANEL ====================

    function updateHistoryPanel() {
        const container = document.getElementById('history-content');
        if (!container) return;

        container.innerHTML = '';
        container.id = 'history-content';

        switch (state.currentHistoryTab) {
            case 'elements':
                window.PlatonicHistory.renderElements('history-content');
                break;
            case 'timeline':
                window.PlatonicHistory.renderTimeline('history-content');
                break;
            case 'timaeus':
                window.PlatonicHistory.renderTimaeus('history-content');
                break;
            case 'modern':
                window.PlatonicHistory.renderModern('history-content');
                break;
        }
    }

    // ==================== CONSTRUCTION MODE ====================

    function startConstruction() {
        const steps = getConstructionSteps(state.currentSolid);
        state.constructionStep = 0;
        updateConstructionUI(steps);

        // Build the construction timeline with GSAP
        if (primaryMesh && primaryEdges) {
            const sceneObjects = {
                vertexDots: vertexDots,
                edgeLines: primaryEdges,
                faceMesh: primaryMesh,
            };

            // Ensure vertices are visible for construction
            if (!vertexDots) {
                const geom = createThreeGeometry(state.currentSolid, state.edgeLength);
                vertexDots = createVertexDots(geom, 0xffffff);
                mainGroup.add(vertexDots);
                sceneObjects.vertexDots = vertexDots;
            }

            state.constructionTimeline = Anim.buildConstructionTimeline(
                state.currentSolid,
                sceneObjects,
                (stepIdx) => {
                    state.constructionStep = stepIdx;
                    updateConstructionUI(steps);
                }
            );

            // Start at step 0
            state.constructionTimeline.play();
        }
    }

    function updateConstructionUI(steps) {
        const step = steps[state.constructionStep];
        const label = document.getElementById('construction-step-label');
        const text = document.getElementById('construction-step-text');
        const progress = document.getElementById('construction-progress');

        if (label) label.textContent = `Paso ${state.constructionStep + 1} / ${steps.length}`;
        if (text) text.textContent = step ? step.desc : '';
        if (progress) progress.style.width = `${((state.constructionStep + 1) / steps.length) * 100}%`;
    }

    // ==================== MODE SWITCHING ====================

    function switchMode(mode) {
        state.mode = mode;
        Anim.killAll();

        // Update mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Toggle overlays
        document.getElementById('construction-overlay').classList.toggle('hidden', mode !== 'construct');
        document.getElementById('compare-overlay').classList.toggle('hidden', mode !== 'compare');
        document.getElementById('calculator-overlay').classList.toggle('hidden', mode !== 'calculator');
        document.getElementById('conway-overlay').classList.toggle('hidden', mode !== 'conway');
        document.getElementById('polytope4d-overlay').classList.toggle('hidden', mode !== 'polytope4d');
        document.getElementById('schlegel-overlay').classList.toggle('hidden', mode !== 'schlegel');

        // Clean all special groups from scene
        scene.remove(compareGroupA);
        scene.remove(compareGroupB);
        scene.remove(conwayGroup);
        scene.remove(p4dGroup);

        // Handle mode-specific scene graph
        if (mode === 'compare') {
            mainGroup.visible = false;
            scene.add(compareGroupA);
            scene.add(compareGroupB);
            updateCompare();
        } else if (mode === 'conway') {
            mainGroup.visible = false;
            scene.add(conwayGroup);
            updateConway();
        } else if (mode === 'polytope4d') {
            mainGroup.visible = false;
            scene.add(p4dGroup);
            update4DPolytope();
        } else if (mode === 'schlegel') {
            mainGroup.visible = true;
            updateSchlegel();
        } else {
            mainGroup.visible = true;
        }

        // Handle construction mode
        if (mode === 'construct') {
            updateSolid();
            startConstruction();
        }

        // Handle calculator
        if (mode === 'calculator') {
            updateCalculator();
        }

        // Reset for explore
        if (mode === 'explore') {
            updateSolid();
        }
    }

    // ==================== MOUSE CONTROLS ====================

    function onMouseDown(e) {
        if (e.target !== canvas) return;
        state.isDragging = true;
        state.lastMouse.x = e.clientX;
        state.lastMouse.y = e.clientY;
    }

    function onMouseMove(e) {
        if (!state.isDragging) return;
        const dx = e.clientX - state.lastMouse.x;
        const dy = e.clientY - state.lastMouse.y;
        state.rotation.y += dx * 0.005;
        state.rotation.x += dy * 0.005;
        state.lastMouse.x = e.clientX;
        state.lastMouse.y = e.clientY;
    }

    function onMouseUp() {
        state.isDragging = false;
    }

    function onWheel(e) {
        e.preventDefault();
        camera.position.z = Math.max(1.5, Math.min(12, camera.position.z + e.deltaY * 0.005));
    }

    // Touch support
    function onTouchStart(e) {
        if (e.touches.length === 1) {
            state.isDragging = true;
            state.lastMouse.x = e.touches[0].clientX;
            state.lastMouse.y = e.touches[0].clientY;
        }
    }

    function onTouchMove(e) {
        if (!state.isDragging || e.touches.length !== 1) return;
        e.preventDefault();
        const dx = e.touches[0].clientX - state.lastMouse.x;
        const dy = e.touches[0].clientY - state.lastMouse.y;
        state.rotation.y += dx * 0.005;
        state.rotation.x += dy * 0.005;
        state.lastMouse.x = e.touches[0].clientX;
        state.lastMouse.y = e.touches[0].clientY;
    }

    function onTouchEnd() {
        state.isDragging = false;
    }

    // ==================== RESIZE ====================

    function onResize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    // ==================== ANIMATION LOOP ====================

    function animate() {
        requestAnimationFrame(animate);

        // Auto-rotation
        if (state.autoRotate && !state.isDragging) {
            state.rotation.y += 0.003;
        }

        // Apply rotation
        const targetGroup = state.mode === 'compare' ? null : mainGroup;

        if (targetGroup) {
            targetGroup.rotation.x = state.rotation.x;
            targetGroup.rotation.y = state.rotation.y;
        }

        if (state.mode === 'compare') {
            compareGroupA.rotation.x = state.rotation.x;
            compareGroupA.rotation.y = state.rotation.y;
            compareGroupB.rotation.x = state.rotation.x;
            compareGroupB.rotation.y = state.rotation.y;
        }

        if (state.mode === 'conway') {
            conwayGroup.rotation.x = state.rotation.x;
            conwayGroup.rotation.y = state.rotation.y;
        }

        if (state.mode === 'polytope4d') {
            p4dGroup.rotation.x = state.rotation.x;
            p4dGroup.rotation.y = state.rotation.y;

            // 4D auto-rotation
            if (state.p4dAutoRotate4D) {
                state.p4dAngle += 0.3;
                render4DFrame();
            }
        }

        // Update cross-section clipping planes in world space
        if (state.showCrossSection) {
            updateClipPlanesWorldSpace();
        }

        updateRotationDisplay();
        renderer.render(scene, camera);
    }

    // ==================== EVENT BINDINGS ====================

    function bindEvents() {
        // Mouse controls
        canvas.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('wheel', onWheel, { passive: false });

        // Touch controls
        canvas.addEventListener('touchstart', onTouchStart, { passive: true });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onTouchEnd, { passive: true });

        // Resize
        window.addEventListener('resize', onResize);

        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => switchMode(btn.dataset.mode));
        });

        // Panel tabs
        document.querySelectorAll('.panel-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                state.currentPanel = btn.dataset.panel;
                document.querySelectorAll('.panel-tab').forEach(b => b.classList.toggle('active', b === btn));
                document.querySelectorAll('.panel-content').forEach(p => p.classList.add('hidden'));
                const panel = document.getElementById(`panel-${btn.dataset.panel}`);
                if (panel) panel.classList.remove('hidden');

                // Render content on tab switch
                if (btn.dataset.panel === 'math') updateMathPanel();
                if (btn.dataset.panel === 'history') updateHistoryPanel();
            });
        });

        // Math sub-tabs
        document.querySelectorAll('.math-subtab').forEach(btn => {
            btn.addEventListener('click', () => {
                state.currentMathTab = btn.dataset.mathtab;
                document.querySelectorAll('.math-subtab').forEach(b => b.classList.toggle('active', b === btn));
                updateMathPanel();
            });
        });

        // History sub-tabs
        document.querySelectorAll('.history-subtab').forEach(btn => {
            btn.addEventListener('click', () => {
                state.currentHistoryTab = btn.dataset.historytab;
                document.querySelectorAll('.history-subtab').forEach(b => b.classList.toggle('active', b === btn));
                updateHistoryPanel();
            });
        });

        // Shape buttons
        document.querySelectorAll('.shape-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.currentSolid = btn.dataset.solid;
                document.querySelectorAll('.shape-btn').forEach(b => b.classList.toggle('active', b === btn));
                updateSolid();
                // Also update math/history if visible
                if (state.currentPanel === 'math') updateMathPanel();
            });
        });

        // Edge length slider
        const slider = document.getElementById('edge-length-slider');
        if (slider) {
            slider.addEventListener('input', () => {
                state.edgeLength = parseFloat(slider.value);
                updateEdgeLengthDisplay();
                updateSolid();
            });
        }

        // Render mode buttons
        document.querySelectorAll('.render-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.renderMode = btn.dataset.render;
                document.querySelectorAll('.render-btn').forEach(b => b.classList.toggle('active', b === btn));
                updateSolid();
            });
        });

        // Checkboxes
        const checkboxMap = {
            'opt-edges': 'showEdges',
            'opt-vertices': 'showVertices',
            'opt-axes': 'showAxes',
            'opt-dual': 'showDual',
            'opt-circumsphere': 'showCircumsphere',
            'opt-insphere': 'showInsphere',
            'opt-autorotate': 'autoRotate',
        };

        for (const [id, prop] of Object.entries(checkboxMap)) {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => {
                    state[prop] = el.checked;
                    if (prop !== 'autoRotate') updateSolid();
                });
            }
        }

        // Cross-section checkbox (separate handling for UI toggle)
        const csCheckbox = document.getElementById('opt-cross-section');
        if (csCheckbox) {
            csCheckbox.addEventListener('change', () => {
                state.showCrossSection = csCheckbox.checked;
                const controls = document.getElementById('cross-section-controls');
                const overlay2D = document.getElementById('cross-section-2d');
                if (controls) controls.classList.toggle('hidden', !state.showCrossSection);
                if (overlay2D) overlay2D.classList.toggle('hidden', !state.showCrossSection);

                if (state.showCrossSection) {
                    updateCrossSection();
                } else {
                    // Dispose cross-section objects and clear clipping
                    disposeObject(csOutline);
                    disposeObject(csFill);
                    disposeObject(csPlaneHelper);
                    csOutline = null;
                    csFill = null;
                    csPlaneHelper = null;
                    csLocalPlane = null;
                    clearClipPlanes();
                }
            });
        }

        // Cross-section sliders
        const csHeightSlider = document.getElementById('cs-height');
        const csThetaSlider = document.getElementById('cs-theta');
        const csPhiSlider = document.getElementById('cs-phi');

        function onCsSliderChange() {
            if (csHeightSlider) state.csHeight = parseFloat(csHeightSlider.value);
            if (csThetaSlider) state.csTheta = parseFloat(csThetaSlider.value);
            if (csPhiSlider) state.csPhi = parseFloat(csPhiSlider.value);

            // Update display values
            const hv = document.getElementById('cs-height-value');
            const tv = document.getElementById('cs-theta-value');
            const pv = document.getElementById('cs-phi-value');
            if (hv) hv.textContent = state.csHeight.toFixed(2);
            if (tv) tv.textContent = state.csTheta + '°';
            if (pv) pv.textContent = state.csPhi + '°';

            if (state.showCrossSection) updateCrossSection();
        }

        if (csHeightSlider) csHeightSlider.addEventListener('input', onCsSliderChange);
        if (csThetaSlider) csThetaSlider.addEventListener('input', onCsSliderChange);
        if (csPhiSlider) csPhiSlider.addEventListener('input', onCsSliderChange);

        // 4D Polytope controls
        const p4dSelect = document.getElementById('polytope4d-select');
        const p4dXW = document.getElementById('p4d-xw');
        const p4dYW = document.getElementById('p4d-yw');
        const p4dAutoRotate = document.getElementById('p4d-auto-rotate');
        const p4dDepthColor = document.getElementById('p4d-depth-color');

        if (p4dSelect) {
            p4dSelect.addEventListener('change', () => {
                state.p4dType = p4dSelect.value;
                if (state.mode === 'polytope4d') update4DPolytope();
            });
        }

        function onP4dSliderChange() {
            if (p4dXW) {
                state.p4dXW = parseFloat(p4dXW.value);
                const v = document.getElementById('p4d-xw-value');
                if (v) v.textContent = state.p4dXW + '°';
            }
            if (p4dYW) {
                state.p4dYW = parseFloat(p4dYW.value);
                const v = document.getElementById('p4d-yw-value');
                if (v) v.textContent = state.p4dYW + '°';
            }
            if (state.mode === 'polytope4d') render4DFrame();
        }

        if (p4dXW) p4dXW.addEventListener('input', onP4dSliderChange);
        if (p4dYW) p4dYW.addEventListener('input', onP4dSliderChange);

        if (p4dAutoRotate) {
            p4dAutoRotate.addEventListener('change', () => {
                state.p4dAutoRotate4D = p4dAutoRotate.checked;
            });
        }

        if (p4dDepthColor) {
            p4dDepthColor.addEventListener('change', () => {
                state.p4dDepthColor = p4dDepthColor.checked;
                if (state.mode === 'polytope4d') render4DFrame();
            });
        }

        // Schlegel controls
        const schlegelSolid = document.getElementById('schlegel-solid');
        const schlegelHamilton = document.getElementById('schlegel-hamilton');
        const schlegelColoring = document.getElementById('schlegel-coloring');
        const schlegelLabels = document.getElementById('schlegel-labels');

        if (schlegelSolid) {
            schlegelSolid.addEventListener('change', () => {
                state.schlegelSolid = schlegelSolid.value;
                if (state.mode === 'schlegel') updateSchlegel();
            });
        }

        function onSchlegelOptionChange() {
            if (schlegelHamilton) state.schlegelHamilton = schlegelHamilton.checked;
            if (schlegelColoring) state.schlegelColoring = schlegelColoring.checked;
            if (schlegelLabels) state.schlegelLabels = schlegelLabels.checked;
            if (state.mode === 'schlegel') updateSchlegel();
        }

        if (schlegelHamilton) schlegelHamilton.addEventListener('change', onSchlegelOptionChange);
        if (schlegelColoring) schlegelColoring.addEventListener('change', onSchlegelOptionChange);
        if (schlegelLabels) schlegelLabels.addEventListener('change', onSchlegelOptionChange);

        // Conway controls
        const conwaySeedSelect = document.getElementById('conway-seed');
        const conwayTSlider = document.getElementById('conway-t-slider');
        const conwayResetBtn = document.getElementById('conway-reset');

        document.querySelectorAll('.conway-op-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.conwayOp = btn.dataset.op;
                document.querySelectorAll('.conway-op-btn').forEach(b => b.classList.toggle('active', b === btn));
                if (state.mode === 'conway') updateConway();
            });
        });

        if (conwaySeedSelect) {
            conwaySeedSelect.addEventListener('change', () => {
                state.conwaySeed = conwaySeedSelect.value;
                state.conwayOp = null;
                document.querySelectorAll('.conway-op-btn').forEach(b => b.classList.remove('active'));
                if (state.mode === 'conway') updateConway();
            });
        }

        if (conwayTSlider) {
            conwayTSlider.addEventListener('input', () => {
                state.conwayT = parseFloat(conwayTSlider.value);
                const display = document.getElementById('conway-t-value');
                if (display) display.textContent = state.conwayT.toFixed(2);
                if (state.mode === 'conway') updateConway();
            });
        }

        if (conwayResetBtn) {
            conwayResetBtn.addEventListener('click', () => {
                state.conwayOp = null;
                state.conwayT = 1.0;
                if (conwayTSlider) conwayTSlider.value = '1';
                const display = document.getElementById('conway-t-value');
                if (display) display.textContent = '1.00';
                document.querySelectorAll('.conway-op-btn').forEach(b => b.classList.remove('active'));
                if (state.mode === 'conway') updateConway();
            });
        }

        // Construction controls
        const prevBtn = document.getElementById('construction-prev');
        const nextBtn = document.getElementById('construction-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (state.constructionTimeline && state.constructionStep > 0) {
                    state.constructionStep--;
                    const progress = (state.constructionStep + 1) / 4;
                    state.constructionTimeline.progress(progress);
                    const steps = getConstructionSteps(state.currentSolid);
                    updateConstructionUI(steps);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (state.constructionTimeline && state.constructionStep < 3) {
                    state.constructionStep++;
                    const progress = (state.constructionStep + 1) / 4;
                    state.constructionTimeline.progress(progress);
                    const steps = getConstructionSteps(state.currentSolid);
                    updateConstructionUI(steps);
                }
            });
        }

        // Compare selects
        const compareA = document.getElementById('compare-solid-a');
        const compareB = document.getElementById('compare-solid-b');

        if (compareA) {
            compareA.addEventListener('change', () => {
                state.compareSolidA = compareA.value;
                if (state.mode === 'compare') updateCompare();
            });
        }
        if (compareB) {
            compareB.addEventListener('change', () => {
                state.compareSolidB = compareB.value;
                if (state.mode === 'compare') updateCompare();
            });
        }

        // Calculator
        const calcInput = document.getElementById('calc-edge-input');
        const calcSelect = document.getElementById('calc-solid-select');

        if (calcInput) calcInput.addEventListener('input', updateCalculator);
        if (calcSelect) calcSelect.addEventListener('change', updateCalculator);

        // Export stubs
        const exportCSV = document.getElementById('calc-export-btn');
        const exportLatex = document.getElementById('calc-latex-btn');

        if (exportCSV) {
            exportCSV.addEventListener('click', () => {
                alert('Exportar CSV — Próximamente');
            });
        }
        if (exportLatex) {
            exportLatex.addEventListener('click', () => {
                alert('Exportar LaTeX — Próximamente');
            });
        }

        // STL Export
        const stlBtn = document.getElementById('export-stl-btn');
        if (stlBtn) {
            stlBtn.addEventListener('click', () => {
                const STL = window.STLExporter;
                if (!STL) return;

                let geometry = null;
                let name = '';

                if (state.mode === 'conway' && conwayMesh) {
                    geometry = conwayMesh.geometry;
                    const op = state.conwayOp || 'seed';
                    name = `${state.conwaySeed}-${op}`;
                } else if (primaryMesh) {
                    geometry = primaryMesh.geometry;
                    name = state.currentSolid;
                }

                if (!geometry) {
                    alert('No hay geometría para exportar');
                    return;
                }

                const scaleMM = state.edgeLength * 50; // 50mm per unit edge
                STL.exportSTL(geometry, `${name}.stl`, scaleMM);
            });
        }
    }

    // ==================== INIT ====================

    function init() {
        onResize();
        bindEvents();
        updateSolid();
        updateEdgeLengthDisplay();
        animate();

        // Pre-render solid formulas
        updateSolidFormulas();
    }

    // Wait for DOM and libraries
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // TODO: URL state persistence
    // TODO: Exam mode

})();
