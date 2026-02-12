# Math Visual Lab - Documentación Técnica

## Descripción

El **Math Visual Lab** es el laboratorio más extenso con **27 simulaciones** que abarcan 12+ áreas matemáticas: geometría, topología, teoría de números, caos, cálculo, probabilidad, fractales y análisis complejo. Implementación en vanilla JavaScript con Canvas 2D, sin dependencias externas.

## Simulaciones (27 Total)

### Fractales y Autómatas (3)
1. **Mandelbrot** - z_{n+1} = z_n² + c, zoom infinito
2. **Juego del Caos** - Sierpinski emergente
3. **Autómatas Elementales** - 256 reglas de Wolfram

### Cálculo y Análisis (5)
4. **Fourier Epicycles** - Transformada Discreta de Fourier
5. **Taylor** - Aproximación polinomial: sin(x) ≈ x - x³/3! + ...
6. **Riemann** - Sumas de Riemann: ∫f(x)dx ≈ Σf(xᵢ)Δx
7. **Funciones** - Explorador interactivo de funciones
8. **EDOs** - Campos de pendientes, dy/dx = f(x,y)

### Teoría del Caos (4)
9. **Lorenz** - Sistema caótico 3D con RK4
10. **Péndulo Doble** - Caos determinista
11. **3 Cuerpos** - Órbitas caóticas gravitacionales
12. **Juego del Caos** - (duplicado, fractales)

### Geometría (6)
13. **Campo Vectorial** - dx/dt = f(x,y), dy/dt = g(x,y)
14. **Transformaciones 2D** - Matrices de rotación, escalado
15. **Voronoi** - Partición de Voronoi
16. **Trigonometría** - Círculo unitario
17. **Geometría 3D** - Poliedros en 3D
18. **Simetrías** - 17 grupos de wallpaper

### Topología (3)
19. **Banda de Möbius** - Superficie no orientable
20. **Nudos** - Trefoil, clasificación de nudos
21. **Poincaré** - Disco hiperbólico, teselaciones

### Teoría de Números (2)
22. **Espiral de Ulam** - Distribución de primos
23. **Collatz** - Conjetura 3n+1

### Probabilidad (3)
24. **Monte Carlo π** - π ≈ 4 · (puntos en círculo / total)
25. **Tablero de Galton** - Distribución binomial
26. **Probabilidad** - Distribuciones múltiples

### Análisis Complejo (1)
27. **Domain Coloring** - f(z) visualizado con hue/brightness

## Algoritmos y Métodos

### RK4 (Runge-Kutta 4to orden)
- Lorenz, Péndulo Doble, 3 Cuerpos
- Precisión O(h⁵)
- Ideal para caos

### Transformada Discreta de Fourier (DFT)
- Epicycles de Fourier
- Complejidad O(N²)
- X_k = Σ x_n · e^{-2πikn/N}

### Iteración Compleja
- Mandelbrot: test |z| > 2
- Suavizado con log₂
- HSV color mapping

### Geometría Computacional
- Voronoi: distancias euclidianas
- Proyección 3D: ortográfica/perspectiva
- Depth sorting para renderizado

### Métodos Estocásticos
- Monte Carlo: muestreo uniforme
- Box-Muller: distribución normal
- Tablero de Galton: probabilidad binomial

## Paleta de Colores por Área

- Fractales/Caos: Violeta `#a855f7`
- Cálculo: Rosa `#f472b6`
- Números/Análisis Complejo: Cyan `#22d3ee`
- Geometría: Amarillo `#facc15`
- Autómatas/Probabilidad: Lima `#a3e635`
- Topología: Naranja `#f97316`

## Ecuaciones Destacadas

```
Mandelbrot:
z_{n+1} = z_n² + c

Lorenz:
dx/dt = σ(y-x)
dy/dt = x(ρ-z)-y
dz/dt = xy-βz

Fourier DFT:
X_k = Σ x_n · e^{-2πikn/N}

Taylor:
f(x) = Σ f^(n)(a)/n! · (x-a)^n

Riemann:
∫ₐᵇf(x)dx ≈ Σf(xᵢ)Δx

Monte Carlo:
π ≈ 4 · N_inside/N_total
```

## Características Técnicas

- **Vanilla JS puro**: Sin dependencias externas
- **Canvas 2D**: Todas las 27 simulaciones
- **DPR handling**: Pantallas Retina
- **60 FPS**: requestAnimationFrame
- **Interactividad**: Mouse drag, zoom, click
- **Presets**: 60+ configuraciones predefinidas

## Referencias

**Total:** 27 simulaciones, ~500-800 líneas cada una
**Áreas matemáticas:** 12+
**Previews animados:** 27 mini-simulaciones en index.html

---

**Última actualización:** 2026-01-10
