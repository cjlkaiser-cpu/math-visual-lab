# PlatonicLab

Interactive exploration of the 5 Platonic solids: geometry, mathematics, history, and 3D printing.

## Quick Start

Open `index.html` in a browser. All dependencies load from CDN.

## Modes (7)

| Mode | Description |
|------|-------------|
| **Explore** | Rotate, zoom and inspect any solid with overlays (dual, spheres, cross-section) |
| **Construct** | Step-by-step GSAP-animated assembly (vertices → edges → faces → complete) |
| **Compare** | Two solids side by side for visual comparison |
| **Conway** | Apply Conway operations (dual, truncate, ambo, expand, snub) with morph slider |
| **4D** | Six regular polytopes with interactive 4D rotations (XW, YW planes) |
| **Schlegel** | Planar graph projections with Hamiltonian paths and chromatic coloring |
| **Calculator** | Compute all properties for arbitrary edge length |

## Solids

| Solid | V | E | F | Schläfli | Symmetry | Dual | Element |
|-------|---|---|---|----------|----------|------|---------|
| Tetrahedron | 4 | 6 | 4 | {3,3} | T_d (24) | Self-dual | Fire |
| Cube | 8 | 12 | 6 | {4,3} | O_h (48) | Octahedron | Earth |
| Octahedron | 6 | 12 | 8 | {3,4} | O_h (48) | Cube | Air |
| Dodecahedron | 20 | 30 | 12 | {5,3} | I_h (120) | Icosahedron | Ether |
| Icosahedron | 12 | 30 | 20 | {3,5} | I_h (120) | Dodecahedron | Water |

## Features

### Visualization
- 3 render modes: solid, translucent, wireframe
- Dual overlay (scaled to face centroids), circumsphere, insphere
- Edges, vertices, coordinate axes toggles
- Mouse drag rotation + scroll zoom + touch support

### Cross-Section
- Adjustable cutting plane (height, theta, phi)
- Real-time intersection polygon with outline + fill
- 2D canvas projection with area, perimeter, regularity analysis
- Polygon name identification (triangle, square, pentagon, hexagon...)

### Conway Operations
- 5 operations: dual (d), truncate (t), ambo (a), expand (e), snub (s)
- Continuous morph slider (T: 0→1) between seed and result
- Generates Archimedean solids (truncated icosahedron, cuboctahedron, etc.)

### 4D Polytopes
- 6 regular polytopes: 5-cell, tesseract, 16-cell, 24-cell, 120-cell, 600-cell
- Interactive XW/YW rotation sliders + auto-rotation
- W-coordinate depth coloring

### Schlegel Diagrams
- Planar graph for all 5 solids
- Optional Hamiltonian path highlight
- Chromatic vertex coloring
- Vertex labels

### Mathematics (KaTeX)
- Volume, surface area, radii formulas
- Step-by-step derivations
- Symmetry groups with generators
- Euler's formula proof (V − E + F = 2)
- Classification theorem (1/p + 1/q > 1/2)

### History
- Platonic elements (fire, earth, air, water, ether)
- Timeline: Euclid → Kepler → modern
- Timaeus passages (original Greek context)
- Modern applications (chemistry, biology, architecture, gaming)

### 3D Printing (STL Export)
- Binary STL with 50mm/unit scaling
- Includes dual overlay when visible
- Cross-section clipping with watertight cap generation
- Cut modes: cerrado, tapa abierta (top removed), corte medio (half)
- Works with Conway operation results

## Stack

| Library | Version | Use |
|---------|---------|-----|
| Three.js | r128 | 3D rendering + clipping planes |
| Tailwind CSS | CDN | Responsive layout |
| KaTeX | 0.16.9 | LaTeX formula rendering |
| GSAP | 3.12.2 | Construction/morph animations |
| Inter + JetBrains Mono | — | Typography |

## File Structure

```
platonic-lab/
├── index.html              # Layout, panels, tabs, CDN imports, inline CSS
├── js/
│   ├── main.js             # Three.js core, state, render loop, UI, STL clipping
│   ├── geometry.js         # Solid data, coordinates, construction steps, dual scale
│   ├── math.js             # KaTeX formulas, derivations, symmetry, calculator
│   ├── history.js          # Elements, timeline, Timaeus, modern applications
│   ├── animations.js       # GSAP construction + morph animations
│   ├── cross-section.js    # Plane-solid intersection, 2D projection, analysis
│   ├── conway.js           # Conway operations (d/t/a/e/s), seed geometry, morphing
│   ├── polytopes4d.js      # 6 regular 4D polytopes, projection, rotation
│   ├── schlegel.js         # Planar graphs, Hamilton paths, chromatic coloring
│   ├── stl-exporter.js     # Binary STL generation + triangle extraction
│   ├── audio-engine.js     # Web Audio API (Kepler synthesizer support)
│   └── kepler-synth.js     # Kepler polyhedral synthesizer
├── PlatonicLab-Tutorial.html  # Interactive guided tutorial
├── tutorial.md             # Tutorial source (markdown)
├── curso/                  # Course materials
└── README.md
```

## Roadmap

### Short-term
- [ ] **CSV export** — Export property tables (V, E, F, angles, volumes...)
- [ ] **LaTeX export** — Export formulas and derivations as LaTeX source
- [ ] **URL state persistence** — Save/restore solid + mode + view via URL params
- [ ] **Archimedean solids** — Direct access to 13 Archimedean solids without Conway
- [ ] **Catalan solids** — Duals of Archimedean solids (triakis tetrahedron, etc.)

### Medium-term
- [ ] **Exam/quiz mode** — Locked interactive assessment (identify solid, compute properties)
- [ ] **Net unfolding** — 2D net with fold animation (print and assemble)
- [ ] **Stellations** — Stellation of icosahedron and dodecahedron (59 icosahedra)
- [ ] **Compound polyhedra** — Star compounds (stella octangula, 5 tetrahedra in dodecahedron)
- [ ] **Symmetry orbit visualization** — Show rotation/reflection axes and orbit paths
- [ ] **Cross-section animation** — Auto-sweep plane through solid, showing all sections

### Long-term
- [ ] **Johnson solids** — All 92 Johnson solids with classification
- [ ] **Geodesic subdivision** — Icosahedral frequency domes (Class I/II/III)
- [ ] **Polyhedral graph theory** — Chromatic number, planarity, Steinitz theorem
- [ ] **Kepler-Poinsot** — 4 regular star polyhedra ({5/2, 5}, {5, 5/2}, {5/2, 3}, {3, 5/2})
- [ ] **Space-filling** — Tessellations with cubes, truncated octahedra, etc.
- [ ] **Multi-format export** — OBJ, GLTF, PLY alongside STL

---

**Last updated:** 2026-02-12
