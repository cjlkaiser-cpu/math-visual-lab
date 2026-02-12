/**
 * STLExporter — Export Three.js BufferGeometry to binary STL for 3D printing
 */
window.STLExporter = (() => {

    /**
     * Extract triangles from a Three.js BufferGeometry.
     * Returns array of { normal: [nx,ny,nz], vertices: [[x,y,z],[x,y,z],[x,y,z]] }
     */
    function extractTriangles(geometry) {
        const pos = geometry.getAttribute('position');
        const norm = geometry.getAttribute('normal');
        const index = geometry.getIndex();
        const triangles = [];

        const getVertex = (i) => [pos.getX(i), pos.getY(i), pos.getZ(i)];
        const getNormal = (i) => norm
            ? [norm.getX(i), norm.getY(i), norm.getZ(i)]
            : null;

        const triCount = index
            ? index.count / 3
            : pos.count / 3;

        for (let t = 0; t < triCount; t++) {
            let a, b, c;
            if (index) {
                a = index.getX(t * 3);
                b = index.getX(t * 3 + 1);
                c = index.getX(t * 3 + 2);
            } else {
                a = t * 3;
                b = t * 3 + 1;
                c = t * 3 + 2;
            }

            const v0 = getVertex(a);
            const v1 = getVertex(b);
            const v2 = getVertex(c);

            let normal;
            if (norm) {
                const n0 = getNormal(a);
                // Use first vertex normal as face normal (good enough for flat faces)
                normal = n0;
            } else {
                // Compute face normal from cross product
                const e1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
                const e2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
                normal = [
                    e1[1] * e2[2] - e1[2] * e2[1],
                    e1[2] * e2[0] - e1[0] * e2[2],
                    e1[0] * e2[1] - e1[1] * e2[0]
                ];
                const len = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2);
                if (len > 0) {
                    normal[0] /= len;
                    normal[1] /= len;
                    normal[2] /= len;
                }
            }

            triangles.push({ normal, vertices: [v0, v1, v2] });
        }

        return triangles;
    }

    /**
     * Apply a scale factor (mm) to triangles for 3D printing.
     * Default: 50mm (good size for desktop prints).
     */
    function scaleTriangles(triangles, scaleMM) {
        return triangles.map(tri => ({
            normal: tri.normal,
            vertices: tri.vertices.map(v => [v[0] * scaleMM, v[1] * scaleMM, v[2] * scaleMM])
        }));
    }

    /**
     * Generate binary STL buffer from triangles.
     * Binary STL format:
     *   80 bytes header
     *   4 bytes uint32 triangle count
     *   Per triangle (50 bytes):
     *     12 bytes normal (3 × float32)
     *     36 bytes vertices (3 × 3 × float32)
     *     2 bytes attribute byte count (0)
     */
    function toBinarySTL(triangles) {
        const triCount = triangles.length;
        const bufferSize = 80 + 4 + triCount * 50;
        const buffer = new ArrayBuffer(bufferSize);
        const view = new DataView(buffer);

        // Header (80 bytes) — ASCII text
        const header = 'Binary STL exported from PlatonicLab — EigenLab';
        for (let i = 0; i < 80; i++) {
            view.setUint8(i, i < header.length ? header.charCodeAt(i) : 0);
        }

        // Triangle count
        view.setUint32(80, triCount, true);

        // Triangles
        let offset = 84;
        for (const tri of triangles) {
            // Normal
            view.setFloat32(offset, tri.normal[0], true); offset += 4;
            view.setFloat32(offset, tri.normal[1], true); offset += 4;
            view.setFloat32(offset, tri.normal[2], true); offset += 4;
            // 3 vertices
            for (const v of tri.vertices) {
                view.setFloat32(offset, v[0], true); offset += 4;
                view.setFloat32(offset, v[1], true); offset += 4;
                view.setFloat32(offset, v[2], true); offset += 4;
            }
            // Attribute byte count
            view.setUint16(offset, 0, true); offset += 2;
        }

        return buffer;
    }

    /**
     * Trigger browser download of an ArrayBuffer as a file.
     */
    function download(buffer, filename) {
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Export a Three.js mesh (or geometry) to STL and download.
     * @param {THREE.Mesh|THREE.BufferGeometry} meshOrGeometry
     * @param {string} filename - e.g. 'icosahedron.stl'
     * @param {number} scaleMM - scale factor in mm (default 50)
     */
    function exportSTL(meshOrGeometry, filename, scaleMM) {
        const geometry = meshOrGeometry.isMesh
            ? meshOrGeometry.geometry
            : meshOrGeometry;

        if (!geometry || !geometry.getAttribute('position')) {
            console.warn('STLExporter: no valid geometry to export');
            return;
        }

        const scale = scaleMM || 50;
        let triangles = extractTriangles(geometry);
        triangles = scaleTriangles(triangles, scale);
        const buffer = toBinarySTL(triangles);
        download(buffer, filename || 'model.stl');
    }

    return {
        extractTriangles,
        scaleTriangles,
        toBinarySTL,
        download,
        exportSTL,
    };
})();
