/**
 * Slicer4D — Hyperplane slicing of 4D polytopes
 * Computes 3D cross-sections and renders them
 */
window.Slicer4D = (() => {
    const P = window.Polytopes4D;

    // ==================== CUT NORMALS ====================

    function getSliceNormal(cutType, polytopeKey) {
        const data = P.getPolytope(polytopeKey);
        switch (cutType) {
            case 'w':
                return [0, 0, 0, 1];
            case 'vertex': {
                // Slice perpendicular to first vertex direction
                const v = data.vertices[0];
                return P.normalize4(v);
            }
            case 'edge': {
                // Slice perpendicular to midpoint of first edge
                const [i, j] = data.edges[0];
                const mid = data.vertices[i].map((x, k) => (x + data.vertices[j][k]) / 2);
                return P.normalize4(mid);
            }
            case 'diagonal':
                return P.normalize4([1, 1, 1, 1]);
            default:
                return [0, 0, 0, 1];
        }
    }

    function getSliceRange(cutType, polytopeKey) {
        const data = P.getPolytope(polytopeKey);
        const normal = getSliceNormal(cutType, polytopeKey);
        let minD = Infinity, maxD = -Infinity;
        for (const v of data.vertices) {
            const d = P.dot4(v, normal);
            if (d < minD) minD = d;
            if (d > maxD) maxD = d;
        }
        return { min: minD, max: maxD };
    }

    // ==================== SLICE COMPUTATION ====================

    function computeSlice(polytopeKey, cutType, position) {
        const data = P.getPolytope(polytopeKey);
        const normal = getSliceNormal(cutType, polytopeKey);
        const offset = position;

        // Find edge-hyperplane intersections
        const intersections = [];
        for (const [i, j] of data.edges) {
            const di = P.dot4(data.vertices[i], normal) - offset;
            const dj = P.dot4(data.vertices[j], normal) - offset;
            if (di * dj < 0) {
                const t = di / (di - dj);
                const point = data.vertices[i].map((x, k) => x + t * (data.vertices[j][k] - x));
                intersections.push(point);
            } else if (Math.abs(di) < 0.0001) {
                intersections.push([...data.vertices[i]]);
            }
        }

        if (intersections.length < 3) return null;

        // Deduplicate
        const unique = P.dedup4(intersections);
        if (unique.length < 3) return null;

        return {
            points4D: unique,
            normal,
            offset,
        };
    }

    // ==================== 3D MESH FROM SLICE ====================

    function buildSliceMesh(sliceResult, angles, viewDist, projType, scale) {
        if (!sliceResult || sliceResult.points4D.length < 3) return null;

        // Rotate and project intersection points to 3D
        const points3D = sliceResult.points4D.map(p => {
            const r = P.rotate4D(p, angles);
            return P.projectTo3D(r, viewDist, projType).map(x => x * scale);
        });

        // Order points for convex polygon (they lie on a 2D plane in 3D)
        const ordered = orderConvex(points3D);
        if (ordered.length < 3) return null;

        const group = new THREE.Group();

        // Fill mesh (triangle fan from centroid)
        const centroid = [0, 0, 0];
        for (const p of ordered) {
            centroid[0] += p[0]; centroid[1] += p[1]; centroid[2] += p[2];
        }
        centroid[0] /= ordered.length;
        centroid[1] /= ordered.length;
        centroid[2] /= ordered.length;

        const fillPositions = [];
        for (let i = 0; i < ordered.length; i++) {
            const j = (i + 1) % ordered.length;
            fillPositions.push(...centroid, ...ordered[i], ...ordered[j]);
        }

        const fillGeom = new THREE.BufferGeometry();
        fillGeom.setAttribute('position', new THREE.Float32BufferAttribute(fillPositions, 3));
        fillGeom.computeVertexNormals();
        const fillMat = new THREE.MeshBasicMaterial({
            color: 0x06b6d4, transparent: true, opacity: 0.25,
            side: THREE.DoubleSide, depthWrite: false,
        });
        group.add(new THREE.Mesh(fillGeom, fillMat));

        // Outline
        const outlinePts = [];
        for (let i = 0; i < ordered.length; i++) {
            const j = (i + 1) % ordered.length;
            outlinePts.push(new THREE.Vector3(...ordered[i]), new THREE.Vector3(...ordered[j]));
        }
        const outlineGeom = new THREE.BufferGeometry().setFromPoints(outlinePts);
        const outlineMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.9 });
        group.add(new THREE.LineSegments(outlineGeom, outlineMat));

        // Vertex dots
        const dotPositions = [];
        for (const p of ordered) dotPositions.push(...p);
        const dotGeom = new THREE.BufferGeometry();
        dotGeom.setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3));
        const dotMat = new THREE.PointsMaterial({ color: 0x67e8f9, size: 0.08, sizeAttenuation: true });
        group.add(new THREE.Points(dotGeom, dotMat));

        return { group, ordered, centroid };
    }

    // ==================== SLICE PLANE HELPER ====================

    function buildPlaneHelper(sliceResult, angles, viewDist, projType, scale) {
        if (!sliceResult) return null;

        // Create a plane quad in the hyperplane, centered at the slice region
        const normal = sliceResult.normal;
        const offset = sliceResult.offset;

        // Build orthonormal basis on the hyperplane
        const basis = orthonormalBasis4(normal);
        const size = 1.8;

        const corners4D = [
            P.add4(P.scale4(normal, offset), P.add4(P.scale4(basis[0], -size), P.scale4(basis[1], -size))),
            P.add4(P.scale4(normal, offset), P.add4(P.scale4(basis[0],  size), P.scale4(basis[1], -size))),
            P.add4(P.scale4(normal, offset), P.add4(P.scale4(basis[0],  size), P.scale4(basis[1],  size))),
            P.add4(P.scale4(normal, offset), P.add4(P.scale4(basis[0], -size), P.scale4(basis[1],  size))),
        ];

        const corners3D = corners4D.map(c => {
            const r = P.rotate4D(c, angles);
            return P.projectTo3D(r, viewDist, projType).map(x => x * scale);
        });

        const positions = [
            ...corners3D[0], ...corners3D[1], ...corners3D[2],
            ...corners3D[0], ...corners3D[2], ...corners3D[3],
        ];

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const mat = new THREE.MeshBasicMaterial({
            color: 0x06b6d4, transparent: true, opacity: 0.06,
            side: THREE.DoubleSide, depthWrite: false,
        });
        return new THREE.Mesh(geom, mat);
    }

    function orthonormalBasis4(normal) {
        // Find 3 vectors orthogonal to normal
        const candidates = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
        const basis = [];
        for (const c of candidates) {
            let v = c.map((x, i) => x - P.dot4(c, normal) * normal[i]);
            for (const b of basis) {
                const d = P.dot4(v, b);
                v = v.map((x, i) => x - d * b[i]);
            }
            const l = P.len4(v);
            if (l > 0.01) {
                basis.push(v.map(x => x / l));
                if (basis.length === 3) break;
            }
        }
        return basis;
    }

    // ==================== ORDERING ====================

    function orderConvex(points3D) {
        if (points3D.length < 3) return points3D;

        const centroid = [0, 0, 0];
        for (const p of points3D) {
            centroid[0] += p[0]; centroid[1] += p[1]; centroid[2] += p[2];
        }
        centroid[0] /= points3D.length;
        centroid[1] /= points3D.length;
        centroid[2] /= points3D.length;

        // Find plane normal from first two vectors
        const v0 = P.sub3(points3D[0], centroid);
        let normal = null;
        for (let i = 1; i < points3D.length; i++) {
            const vi = P.sub3(points3D[i], centroid);
            const c = P.cross3(v0, vi);
            if (P.len3(c) > 0.0001) { normal = P.normalize3(c); break; }
        }
        if (!normal) return points3D;

        // Create 2D basis on the plane
        const u = P.normalize3(v0);
        const v = P.normalize3(P.cross3(normal, u));

        // Sort by angle
        const withAngle = points3D.map(p => {
            const dp = P.sub3(p, centroid);
            return { point: p, angle: Math.atan2(P.dot3(dp, v), P.dot3(dp, u)) };
        });
        withAngle.sort((a, b) => a.angle - b.angle);
        return withAngle.map(w => w.point);
    }

    // ==================== 2D CANVAS DRAWING ====================

    function draw2D(canvas, sliceResult, info) {
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        if (!sliceResult || sliceResult.points4D.length < 3) {
            ctx.fillStyle = '#6b7280';
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Sin intersección', W/2, H/2);
            return;
        }

        // Project 4D slice points to 2D using the hyperplane basis
        const normal = sliceResult.normal;
        const basis = orthonormalBasis4(normal);
        const points2D = sliceResult.points4D.map(p => {
            const rel = p.map((x, i) => x - normal[i] * sliceResult.offset);
            return [P.dot4(rel, basis[0]), P.dot4(rel, basis[1])];
        });

        // Order by angle
        const cx = points2D.reduce((s, p) => s + p[0], 0) / points2D.length;
        const cy = points2D.reduce((s, p) => s + p[1], 0) / points2D.length;
        const sorted = points2D.map(p => ({
            x: p[0], y: p[1],
            angle: Math.atan2(p[1] - cy, p[0] - cx)
        }));
        sorted.sort((a, b) => a.angle - b.angle);

        // Find scale to fit
        let maxR = 0;
        for (const p of sorted) {
            const dx = p.x - cx, dy = p.y - cy;
            maxR = Math.max(maxR, Math.sqrt(dx*dx + dy*dy));
        }
        const viewScale = maxR > 0.001 ? (W * 0.38) / maxR : 1;

        // Transform
        const tx = (p) => W/2 + (p.x - cx) * viewScale;
        const ty = (p) => H/2 - (p.y - cy) * viewScale;

        // Fill
        ctx.beginPath();
        ctx.moveTo(tx(sorted[0]), ty(sorted[0]));
        for (let i = 1; i < sorted.length; i++) ctx.lineTo(tx(sorted[i]), ty(sorted[i]));
        ctx.closePath();
        ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.fill();

        // Outline
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Vertices
        for (const p of sorted) {
            ctx.beginPath();
            ctx.arc(tx(p), ty(p), 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#67e8f9';
            ctx.fill();
        }

        // Info text
        if (info) {
            ctx.fillStyle = '#d1d5db';
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText(info, 6, H - 6);
        }
    }

    // ==================== ANALYSIS ====================

    function analyzeSlice(sliceResult) {
        if (!sliceResult || sliceResult.points4D.length < 3) return null;

        const normal = sliceResult.normal;
        const basis = orthonormalBasis4(normal);
        const points2D = sliceResult.points4D.map(p => {
            const rel = p.map((x, i) => x - normal[i] * sliceResult.offset);
            return [P.dot4(rel, basis[0]), P.dot4(rel, basis[1])];
        });

        const n = points2D.length;

        // Order points
        const cx = points2D.reduce((s, p) => s + p[0], 0) / n;
        const cy = points2D.reduce((s, p) => s + p[1], 0) / n;
        const sorted = [...points2D].sort((a, b) =>
            Math.atan2(a[1]-cy, a[0]-cx) - Math.atan2(b[1]-cy, b[0]-cx)
        );

        // Compute area (shoelace)
        let area = 0;
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += sorted[i][0] * sorted[j][1] - sorted[j][0] * sorted[i][1];
        }
        area = Math.abs(area) / 2;

        // Compute perimeter
        let perimeter = 0;
        const sideLengths = [];
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const dx = sorted[j][0] - sorted[i][0];
            const dy = sorted[j][1] - sorted[i][1];
            const len = Math.sqrt(dx*dx + dy*dy);
            sideLengths.push(len);
            perimeter += len;
        }

        // Check regularity
        const avgSide = perimeter / n;
        const isRegular = sideLengths.every(l => Math.abs(l - avgSide) < avgSide * 0.05);

        // Name the shape
        const names = { 3: 'Triángulo', 4: 'Cuadrilátero', 5: 'Pentágono', 6: 'Hexágono',
            8: 'Octágono', 10: 'Decágono', 12: 'Dodecágono' };
        let shapeName = names[n] || `${n}-gono`;
        if (isRegular) shapeName += ' regular';

        return { vertices: n, area, perimeter, shapeName, isRegular };
    }

    // ==================== PUBLIC API ====================

    return {
        getSliceNormal,
        getSliceRange,
        computeSlice,
        buildSliceMesh,
        buildPlaneHelper,
        draw2D,
        analyzeSlice,
    };
})();
