/**
 * PlatonicCrossSection — Plane-solid intersection, 2D projection, analysis
 */
window.PlatonicCrossSection = (() => {

    /**
     * Compute a THREE.Plane from UI parameters.
     * height: offset along the normal direction
     * thetaDeg: tilt of normal from Y axis (0 = horizontal cut)
     * phiDeg: rotation of normal around Y axis
     */
    function computePlane(height, thetaDeg, phiDeg) {
        const theta = thetaDeg * Math.PI / 180;
        const phi = phiDeg * Math.PI / 180;

        const normal = new THREE.Vector3(
            Math.sin(theta) * Math.cos(phi),
            Math.cos(theta),
            Math.sin(theta) * Math.sin(phi)
        ).normalize();

        // THREE.Plane: normal · point + constant = 0
        // We want the plane at distance `height` along the normal from origin
        return new THREE.Plane(normal, -height);
    }

    /**
     * Compute intersection segments of a plane with a BufferGeometry.
     * Returns array of [Vector3, Vector3] segments.
     */
    function computeIntersection(bufferGeometry, plane) {
        const position = bufferGeometry.getAttribute('position');
        const index = bufferGeometry.getIndex();
        const segments = [];

        if (!index) return segments;

        for (let i = 0; i < index.count; i += 3) {
            const ai = index.getX(i);
            const bi = index.getX(i + 1);
            const ci = index.getX(i + 2);

            const a = new THREE.Vector3(position.getX(ai), position.getY(ai), position.getZ(ai));
            const b = new THREE.Vector3(position.getX(bi), position.getY(bi), position.getZ(bi));
            const c = new THREE.Vector3(position.getX(ci), position.getY(ci), position.getZ(ci));

            const da = plane.distanceToPoint(a);
            const db = plane.distanceToPoint(b);
            const dc = plane.distanceToPoint(c);

            const pts = [];

            if (da * db < 0) pts.push(lerpEdge(a, b, da, db));
            if (db * dc < 0) pts.push(lerpEdge(b, c, db, dc));
            if (dc * da < 0) pts.push(lerpEdge(c, a, dc, da));

            // Handle vertices exactly on the plane
            const EPS = 1e-7;
            if (Math.abs(da) < EPS) pts.push(a.clone());
            if (Math.abs(db) < EPS) pts.push(b.clone());
            if (Math.abs(dc) < EPS) pts.push(c.clone());

            // Deduplicate very close points
            if (pts.length >= 2) {
                const unique = [pts[0]];
                for (let j = 1; j < pts.length; j++) {
                    let isDup = false;
                    for (const u of unique) {
                        if (pts[j].distanceTo(u) < 1e-5) { isDup = true; break; }
                    }
                    if (!isDup) unique.push(pts[j]);
                }
                if (unique.length >= 2) {
                    segments.push([unique[0], unique[1]]);
                }
            }
        }

        return segments;
    }

    function lerpEdge(p1, p2, d1, d2) {
        const t = d1 / (d1 - d2);
        return new THREE.Vector3().lerpVectors(p1, p2, t);
    }

    /**
     * Order unordered segments into a closed polygon.
     * Returns array of Vector3 (polygon vertices in order).
     */
    function orderSegments(segments) {
        if (segments.length === 0) return [];

        const EPS = 1e-4;
        const result = [segments[0][0].clone(), segments[0][1].clone()];
        const used = new Set([0]);

        let safety = segments.length + 2;
        while (used.size < segments.length && safety-- > 0) {
            const last = result[result.length - 1];
            let found = false;

            for (let i = 0; i < segments.length; i++) {
                if (used.has(i)) continue;

                if (last.distanceTo(segments[i][0]) < EPS) {
                    result.push(segments[i][1].clone());
                    used.add(i);
                    found = true;
                    break;
                }
                if (last.distanceTo(segments[i][1]) < EPS) {
                    result.push(segments[i][0].clone());
                    used.add(i);
                    found = true;
                    break;
                }
            }

            if (!found) break;
        }

        // Remove duplicate closing point
        if (result.length > 2 && result[0].distanceTo(result[result.length - 1]) < EPS) {
            result.pop();
        }

        return result;
    }

    /**
     * Project 3D polygon onto the cutting plane's local 2D coordinate system.
     */
    function projectTo2D(points, planeNormal) {
        if (points.length < 3) return [];

        // Build orthonormal basis on the plane
        const up = Math.abs(planeNormal.y) < 0.9
            ? new THREE.Vector3(0, 1, 0)
            : new THREE.Vector3(1, 0, 0);
        const u = new THREE.Vector3().crossVectors(planeNormal, up).normalize();
        const v = new THREE.Vector3().crossVectors(u, planeNormal).normalize();

        // Centroid
        const centroid = new THREE.Vector3();
        points.forEach(p => centroid.add(p));
        centroid.divideScalar(points.length);

        return points.map(p => {
            const d = new THREE.Vector3().subVectors(p, centroid);
            return { x: d.dot(u), y: d.dot(v) };
        });
    }

    /**
     * Analyze a cross-section polygon: sides, area, perimeter, regularity, name.
     */
    function analyzePolygon(points3D, points2D) {
        const n = points3D.length;
        if (n < 3) return null;

        // Side lengths
        const sideLengths = [];
        for (let i = 0; i < n; i++) {
            sideLengths.push(points3D[i].distanceTo(points3D[(i + 1) % n]));
        }

        const perimeter = sideLengths.reduce((a, b) => a + b, 0);

        // Area via 2D shoelace
        let area = 0;
        for (let i = 0; i < points2D.length; i++) {
            const j = (i + 1) % points2D.length;
            area += points2D[i].x * points2D[j].y;
            area -= points2D[j].x * points2D[i].y;
        }
        area = Math.abs(area) / 2;

        // Regularity check
        const avgSide = perimeter / n;
        const isRegular = n >= 3 && sideLengths.every(s => Math.abs(s - avgSide) < avgSide * 0.08);

        return {
            sides: n,
            sideLengths,
            perimeter,
            area,
            isRegular,
            name: getPolygonName(n, isRegular),
        };
    }

    function getPolygonName(n, isRegular) {
        const names = {
            3: 'Triángulo',
            4: 'Cuadrilátero',
            5: 'Pentágono',
            6: 'Hexágono',
            7: 'Heptágono',
            8: 'Octógono',
            9: 'Eneágono',
            10: 'Decágono',
            12: 'Dodecágono',
        };
        const base = names[n] || `${n}-gono`;
        return isRegular ? `${base} regular` : base;
    }

    // ==================== THREE.JS OBJECTS ====================

    /**
     * Create a line loop outlining the cross-section polygon.
     */
    function createOutline(orderedPoints, color) {
        if (orderedPoints.length < 3) return null;

        const pts = [...orderedPoints, orderedPoints[0]];
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({
            color: color || 0x22d3ee,
            transparent: true,
            opacity: 0.95,
            depthTest: false,
        });
        const line = new THREE.Line(geom, mat);
        line.renderOrder = 10;
        return line;
    }

    /**
     * Create a filled mesh for the cross-section polygon (triangle fan from centroid).
     */
    function createFill(orderedPoints, color) {
        if (orderedPoints.length < 3) return null;

        const centroid = new THREE.Vector3();
        orderedPoints.forEach(p => centroid.add(p));
        centroid.divideScalar(orderedPoints.length);

        const vertices = [];
        const n = orderedPoints.length;
        for (let i = 0; i < n; i++) {
            const next = (i + 1) % n;
            vertices.push(
                centroid.x, centroid.y, centroid.z,
                orderedPoints[i].x, orderedPoints[i].y, orderedPoints[i].z,
                orderedPoints[next].x, orderedPoints[next].y, orderedPoints[next].z
            );
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geom.computeVertexNormals();

        const mat = new THREE.MeshBasicMaterial({
            color: color || 0x22d3ee,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide,
            depthTest: false,
        });

        const mesh = new THREE.Mesh(geom, mat);
        mesh.renderOrder = 9;
        return mesh;
    }

    /**
     * Create a semi-transparent helper plane showing the cutting surface.
     */
    function createPlaneHelper(plane, size, color) {
        const geom = new THREE.PlaneGeometry(size, size);
        const mat = new THREE.MeshBasicMaterial({
            color: color || 0x22d3ee,
            transparent: true,
            opacity: 0.04,
            side: THREE.DoubleSide,
            depthWrite: false,
        });

        const mesh = new THREE.Mesh(geom, mat);

        // Orient to match plane normal
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), plane.normal);
        mesh.quaternion.copy(quaternion);

        // Position on the plane
        mesh.position.copy(plane.normal.clone().multiplyScalar(-plane.constant));

        return mesh;
    }

    // ==================== 2D CANVAS DRAWING ====================

    /**
     * Draw the cross-section polygon on a 2D canvas with info.
     */
    function draw2D(canvas, points2D, info) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const pad = 20;

        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, w, h);

        if (!points2D || points2D.length < 3 || !info) {
            ctx.fillStyle = '#4b5563';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Sin intersección', w / 2, h / 2);
            return;
        }

        // Compute bounds
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        points2D.forEach(p => {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        });

        const rangeX = maxX - minX || 0.001;
        const rangeY = maxY - minY || 0.001;
        const scale = Math.min((w - 2 * pad) / rangeX, (h - 2 * pad) / rangeY);
        const cx = w / 2;
        const cy = h / 2;
        const midX = (minX + maxX) / 2;
        const midY = (minY + maxY) / 2;

        const tx = p => cx + (p.x - midX) * scale;
        const ty = p => cy - (p.y - midY) * scale;

        // Fill
        ctx.beginPath();
        ctx.moveTo(tx(points2D[0]), ty(points2D[0]));
        for (let i = 1; i < points2D.length; i++) {
            ctx.lineTo(tx(points2D[i]), ty(points2D[i]));
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.fill();

        // Outline
        ctx.beginPath();
        ctx.moveTo(tx(points2D[0]), ty(points2D[0]));
        for (let i = 1; i < points2D.length; i++) {
            ctx.lineTo(tx(points2D[i]), ty(points2D[i]));
        }
        ctx.closePath();
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Vertex dots
        points2D.forEach(p => {
            ctx.beginPath();
            ctx.arc(tx(p), ty(p), 3, 0, Math.PI * 2);
            ctx.fillStyle = '#22d3ee';
            ctx.fill();
        });

        // Info
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(info.name, 6, h - 24);
        ctx.fillText(`A=${info.area.toFixed(3)}  P=${info.perimeter.toFixed(3)}`, 6, h - 10);
    }

    return {
        computePlane,
        computeIntersection,
        orderSegments,
        projectTo2D,
        analyzePolygon,
        createOutline,
        createFill,
        createPlaneHelper,
        draw2D,
    };
})();
