# PlatonicLab

Interactive exploration of the 5 Platonic solids: geometry, mathematics, and history.

## Quick Start

Open `index.html` in a browser. All dependencies load from CDN.

## Features

- **5 Platonic solids** with 3 render modes (solid, translucent, wireframe)
- **Mouse controls**: drag to rotate, scroll to zoom
- **Properties panel**: V, E, F, Euler, dihedral angle, volume, area, symmetry group
- **Dual overlay**, circumsphere, and insphere visualization
- **KaTeX formulas** with step-by-step derivations for volume and surface area
- **Symmetry groups** (T_d, O_h, I_h) with element counts and generators
- **Euler's formula** verification and classification proof (1/p + 1/q > 1/2)
- **History**: Plato's elements, timeline, Timaeus quotes, modern applications
- **Construction mode**: step-by-step GSAP-animated solid building
- **Compare mode**: two solids side by side
- **Calculator**: input edge length, get all computed properties

## Stack

| Library | Version | Use |
|---------|---------|-----|
| Three.js | r128 | 3D rendering |
| Tailwind CSS | CDN | Utility CSS |
| KaTeX | 0.16.9 | LaTeX formulas |
| GSAP | 3.12.2 | Animations |
| Inter + JetBrains Mono | — | Typography |

## File Structure

```
platonic-lab/
├── index.html          # Layout, panels, tabs, CDN imports
├── css/styles.css      # Custom styles
├── js/
│   ├── geometry.js     # Solid data, coordinates, construction steps
│   ├── math.js         # KaTeX formulas, derivations, symmetry, calculator
│   ├── history.js      # Elements, timeline, Timaeus, modern apps
│   ├── animations.js   # GSAP construction, morph, duality animations
│   └── main.js         # Three.js core, state, render loop, UI
└── README.md
```
