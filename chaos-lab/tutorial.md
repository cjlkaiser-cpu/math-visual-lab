# ChaosLab — Tutorial Completo de Atractores Extraños y Sistemas Dinámicos Caóticos

> **ChaosLab** es un explorador interactivo de atractores extraños que visualiza en 3D las trayectorias de 10 sistemas dinámicos caóticos, con herramientas de análisis como exponentes de Lyapunov y diagramas de bifurcación.

---

## Tabla de Contenidos

1. [Fundamentos de Teoría del Caos](#1-fundamentos-de-teoría-del-caos)
2. [Sistemas Dinámicos Continuos](#2-sistemas-dinámicos-continuos)
3. [Los 10 Atractores de ChaosLab](#3-los-10-atractores-de-chaoslab)
   - 3.1 [Atractor de Lorenz](#31-atractor-de-lorenz)
   - 3.2 [Atractor de Rössler](#32-atractor-de-rössler)
   - 3.3 [Atractor de Aizawa](#33-atractor-de-aizawa)
   - 3.4 [Atractor de Thomas](#34-atractor-de-thomas)
   - 3.5 [Atractor de Halvorsen](#35-atractor-de-halvorsen)
   - 3.6 [Atractor de Sprott (B)](#36-atractor-de-sprott-b)
   - 3.7 [Atractor de Chen](#37-atractor-de-chen)
   - 3.8 [Atractor de Dadras](#38-atractor-de-dadras)
   - 3.9 [Atractor de Lü (Three-Scroll)](#39-atractor-de-lü-three-scroll)
   - 3.10 [Atractor de Rabinovich-Fabrikant](#310-atractor-de-rabinovich-fabrikant)
4. [Integración Numérica: El Método Runge-Kutta de Orden 4](#4-integración-numérica-el-método-runge-kutta-de-orden-4)
5. [Herramientas de Análisis](#5-herramientas-de-análisis)
   - 5.1 [Exponente de Lyapunov](#51-exponente-de-lyapunov)
   - 5.2 [Diagramas de Bifurcación](#52-diagramas-de-bifurcación)
   - 5.3 [Divergencia de Sensibilidad](#53-divergencia-de-sensibilidad)
   - 5.4 [Estadísticas de Trayectoria](#54-estadísticas-de-trayectoria)
6. [Guía de Uso de ChaosLab](#6-guía-de-uso-de-chaoslab)
7. [Ejercicios Explicativos](#7-ejercicios-explicativos)
8. [Glosario](#8-glosario)
9. [Referencias Bibliográficas](#9-referencias-bibliográficas)

---

## 1. Fundamentos de Teoría del Caos

### 1.1 ¿Qué es el caos determinista?

Un sistema **caótico** es un sistema determinista — gobernado por ecuaciones exactas sin componente aleatorio — cuyo comportamiento a largo plazo es **impredecible** debido a una sensibilidad extrema a las condiciones iniciales. Esto se conoce coloquialmente como el **efecto mariposa**: una diferencia infinitesimal en el estado inicial produce trayectorias que divergen exponencialmente con el tiempo.

Formalmente, un sistema dinámico es caótico si cumple tres condiciones:

1. **Sensibilidad a condiciones iniciales**: Existe un $\delta > 0$ tal que para cualquier estado $\mathbf{x}$ y cualquier vecindario de $\mathbf{x}$, existe un estado $\mathbf{y}$ en ese vecindario y un tiempo $t > 0$ donde $\|\Phi^t(\mathbf{x}) - \Phi^t(\mathbf{y})\| > \delta$.

2. **Transitividad topológica**: Para cualquier par de conjuntos abiertos $U, V$ en el espacio de fases, existe un tiempo $t$ tal que $\Phi^t(U) \cap V \neq \emptyset$.

3. **Densidad de órbitas periódicas**: Las órbitas periódicas forman un subconjunto denso del espacio de fases.

### 1.2 Espacio de fases y trayectorias

El **espacio de fases** de un sistema dinámico es el espacio de todos los estados posibles. Para un sistema tridimensional como los que visualiza ChaosLab, cada punto $(x, y, z) \in \mathbb{R}^3$ representa un estado completo del sistema en un instante dado.

Una **trayectoria** (u **órbita**) es la curva que traza un punto inicial $\mathbf{x}_0$ al evolucionar bajo las ecuaciones del sistema:

$$\mathbf{x}(t) = \Phi^t(\mathbf{x}_0), \quad t \geq 0$$

donde $\Phi^t$ es el **flujo** del sistema — la función que mapea estados iniciales a estados futuros tras un tiempo $t$.

### 1.3 Atractores y atractores extraños

Un **atractor** es un conjunto $A$ en el espacio de fases hacia el cual las trayectorias cercanas convergen con el paso del tiempo:

$$\lim_{t \to \infty} d(\Phi^t(\mathbf{x}), A) = 0$$

para todo $\mathbf{x}$ en una **cuenca de atracción** $B(A)$ — la región del espacio de fases cuyos puntos son atraídos hacia $A$.

Los tipos de atractores son:

| Tipo | Geometría | Ejemplo |
|------|-----------|---------|
| Punto fijo | 0-dimensional | Péndulo con fricción |
| Ciclo límite | 1-dimensional (curva cerrada) | Oscilador Van der Pol |
| Toro | 2-dimensional (superficie) | Movimiento cuasiperiódico |
| **Atractor extraño** | **Dimensión fractal** | **Lorenz, Rössler, etc.** |

Un **atractor extraño** tiene estructura fractal: su dimensión topológica es fraccionaria (por ejemplo, ~2.06 para Lorenz). Las trayectorias nunca se repiten exactamente pero permanecen confinadas en una región acotada del espacio, creando las formas intrincadas que ChaosLab visualiza.

### 1.4 Disipatividad y contracción de volumen

Todos los sistemas en ChaosLab son **disipativos**: el volumen de cualquier región del espacio de fases se contrae bajo la evolución temporal. Matemáticamente, la **divergencia** del campo vectorial es negativa:

$$\nabla \cdot \mathbf{F} = \frac{\partial F_x}{\partial x} + \frac{\partial F_y}{\partial y} + \frac{\partial F_z}{\partial z} < 0$$

Esto es necesario para la existencia de atractores: en sistemas conservativos (volumen constante), como los hamiltonianos, no existen atractores. La contracción de volumen implica que el flujo comprime las trayectorias hacia un conjunto de medida cero — el atractor.

**Ejemplo para Lorenz:**

$$\nabla \cdot \mathbf{F} = -\sigma - 1 - \beta = -10 - 1 - \frac{8}{3} \approx -13.67$$

El volumen se contrae a un ritmo de $e^{-13.67 \cdot t}$, lo que explica por qué las trayectorias colapsan rápidamente sobre el atractor.

---

## 2. Sistemas Dinámicos Continuos

### 2.1 Ecuaciones diferenciales ordinarias (ODE)

Los sistemas de ChaosLab están definidos como sistemas de EDO autónomas de primer orden:

$$\frac{d\mathbf{x}}{dt} = \mathbf{F}(\mathbf{x}; \boldsymbol{\mu})$$

donde:
- $\mathbf{x} = (x, y, z) \in \mathbb{R}^3$ es el vector de estado
- $\mathbf{F}: \mathbb{R}^3 \to \mathbb{R}^3$ es el campo vectorial
- $\boldsymbol{\mu}$ es el vector de parámetros del sistema
- $t$ es el tiempo (variable independiente)

El sistema es **autónomo** porque $\mathbf{F}$ no depende explícitamente de $t$.

### 2.2 Puntos de equilibrio

Un **punto de equilibrio** (o punto fijo) es un estado $\mathbf{x}^*$ donde el campo vectorial se anula:

$$\mathbf{F}(\mathbf{x}^*) = \mathbf{0}$$

La estabilidad de un punto de equilibrio se determina por los **eigenvalores** de la **matriz jacobiana** evaluada en ese punto:

$$J(\mathbf{x}^*) = \begin{pmatrix} \frac{\partial F_x}{\partial x} & \frac{\partial F_x}{\partial y} & \frac{\partial F_x}{\partial z} \\ \frac{\partial F_y}{\partial x} & \frac{\partial F_y}{\partial y} & \frac{\partial F_y}{\partial z} \\ \frac{\partial F_z}{\partial x} & \frac{\partial F_z}{\partial y} & \frac{\partial F_z}{\partial z} \end{pmatrix}_{\mathbf{x} = \mathbf{x}^*}$$

Si todos los eigenvalores tienen parte real negativa, el punto es **estable**. Si al menos uno tiene parte real positiva, es **inestable**. Para que exista un atractor extraño, típicamente todos los puntos de equilibrio deben ser inestables.

### 2.3 Teorema de Poincaré-Bendixson y la necesidad de 3D

En sistemas bidimensionales autónomos, el teorema de Poincaré-Bendixson establece que las trayectorias acotadas solo pueden converger a puntos fijos o ciclos límite — **no puede haber caos**. Por eso todos los sistemas de ChaosLab son tridimensionales: se necesitan al menos 3 dimensiones para que un flujo continuo exhiba caos.

### 2.4 Dimensión fractal

La dimensión fractal de un atractor cuantifica su complejidad geométrica. La **dimensión de correlación** $D_2$ se estima frecuentemente con el algoritmo de Grassberger-Procaccia:

$$C(r) = \lim_{N \to \infty} \frac{1}{N^2} \sum_{i \neq j} \Theta(r - \|\mathbf{x}_i - \mathbf{x}_j\|)$$

$$D_2 = \lim_{r \to 0} \frac{\log C(r)}{\log r}$$

donde $\Theta$ es la función escalón de Heaviside. Para el atractor de Lorenz, $D_2 \approx 2.06$, indicando que el atractor es "casi" una superficie bidimensional pero con estructura infinitamente plegada.

---

## 3. Los 10 Atractores de ChaosLab

### 3.1 Atractor de Lorenz

**Descubierto por:** Edward Lorenz (1963)
**Contexto:** Modelo simplificado de convección atmosférica derivado de las ecuaciones de Navier-Stokes.
**Simetría:** $\mathbb{Z}_2$ — invariante bajo la transformación $(x, y, z) \to (-x, -y, z)$.

#### Ecuaciones

$$\dot{x} = \sigma(y - x)$$

$$\dot{y} = x(\rho - z) - y$$

$$\dot{z} = xy - \beta z$$

#### Parámetros y significado físico

| Parámetro | Símbolo | Valor por defecto | Rango | Significado |
|-----------|---------|-------------------|-------|-------------|
| Número de Prandtl | $\sigma$ | 10 | [0, 30] | Relación entre difusividad de momento y térmica |
| Número de Rayleigh | $\rho$ | 28 | [0, 50] | Fuerza de la convección (gradiente térmico) |
| Factor geométrico | $\beta$ | 8/3 ≈ 2.667 | [0, 10] | Relación de aspecto de la celda convectiva |

#### Estado inicial

$$\mathbf{x}_0 = (1, 1, 1)$$

#### Puntos de equilibrio

El sistema tiene tres puntos de equilibrio:

1. **Origen:** $\mathbf{x}^*_0 = (0, 0, 0)$ — siempre existe, inestable para $\rho > 1$.

2. **Puntos simétricos** (para $\rho > 1$):

$$\mathbf{x}^*_{\pm} = \left(\pm\sqrt{\beta(\rho - 1)},\; \pm\sqrt{\beta(\rho - 1)},\; \rho - 1\right)$$

Con los valores por defecto ($\rho = 28, \beta = 8/3$):

$$\mathbf{x}^*_{\pm} = (\pm 8.485, \pm 8.485, 27)$$

Estos puntos son inestables (espirales inestables) para $\rho > \rho_H \approx 24.74$, que es la bifurcación de Hopf subcrítica.

#### Divergencia (disipatividad)

$$\nabla \cdot \mathbf{F} = -\sigma - 1 - \beta = -(10 + 1 + 2.667) = -13.667$$

El volumen se contrae exponencialmente: $V(t) = V(0) \cdot e^{-13.667t}$.

#### Comportamiento según $\rho$

| Rango de $\rho$ | Comportamiento |
|------------------|---------------|
| $0 < \rho < 1$ | Punto fijo estable en el origen |
| $1 < \rho < 13.926$ | Dos puntos fijos estables (espirales) |
| $13.926 < \rho < 24.06$ | Coexistencia: puntos fijos estables + caos transitorio |
| $24.06 < \rho < 24.74$ | Ciclo límite estable + caos transitorio |
| $\rho > 24.74$ | **Atractor extraño** (caos permanente, $\lambda_1 \approx 0.9$) |

#### Ejemplo de uso en ChaosLab

Selecciona **Lorenz** en la barra de sistemas. Observa las dos "alas" del atractor — la trayectoria orbita un ala durante un número variable de vueltas antes de saltar a la otra. Prueba incrementar $\rho$ a 40: las alas se expanden y las transiciones se vuelven más frecuentes.

---

### 3.2 Atractor de Rössler

**Descubierto por:** Otto Rössler (1976)
**Contexto:** Diseñado como el sistema caótico más simple posible — solo un término no lineal ($xz$).
**Simetría:** Ninguna (asimétrico).

#### Ecuaciones

$$\dot{x} = -(y + z)$$

$$\dot{y} = x + ay$$

$$\dot{z} = b + z(x - c)$$

#### Parámetros

| Parámetro | Valor por defecto | Rango | Efecto |
|-----------|-------------------|-------|--------|
| $a$ | 0.2 | [0, 1] | Controla la espiral en el plano xy |
| $b$ | 0.2 | [0, 1] | Inyección de energía en z |
| $c$ | 5.7 | [0, 20] | **Parámetro de bifurcación principal** |

#### Estado inicial

$$\mathbf{x}_0 = (1, 1, 0)$$

#### Análisis del no-linealismo

El único término no lineal es $z \cdot x$ en la ecuación de $\dot{z}$. Cuando $x < c$, el término $z(x - c)$ actúa como amortiguamiento sobre $z$, manteniéndolo pequeño. Cuando $x$ supera temporalmente el umbral $c$, la variable $z$ experimenta un crecimiento rápido — produciendo la "oreja" vertical del atractor donde la trayectoria se dispara hacia arriba antes de reinyectarse en la espiral principal.

#### Diagrama de bifurcación según $c$

| Rango de $c$ | Comportamiento |
|---------------|---------------|
| $c < 2.5$ | Punto fijo estable |
| $2.5 < c < 4.2$ | Ciclo límite (oscilación periódica) |
| $4.2 < c < 5.0$ | Cascada de duplicación de periodo |
| $c \approx 5.0$ | Inicio del caos |
| $5.0 < c < 5.7$ | **Caos de banda simple** |
| $c > 5.7$ | **Caos de banda doble** (con "reinserción") |

#### Ruta al caos

El sistema de Rössler sigue la **ruta de duplicación de periodo** (ruta de Feigenbaum). Al incrementar $c$, un ciclo límite estable se bifurca en un ciclo de periodo 2, luego 4, 8, 16... hasta alcanzar caos a través de infinitas bifurcaciones acumuladas en un intervalo finito del parámetro.

---

### 3.3 Atractor de Aizawa

**Descubierto por:** Yoji Aizawa (1982)
**Contexto:** Sistema con simetría rotacional que genera trayectorias toroidales deformadas.
**Simetría:** Rotacional SO(2) — invariante bajo rotaciones en el plano $(x, y)$.

#### Ecuaciones

$$\dot{x} = (z - b)x - dy$$

$$\dot{y} = dx + (z - b)y$$

$$\dot{z} = c + az - \frac{z^3}{3} - (x^2 + y^2)(1 + ez) + fzx^3$$

donde $r^2 = x^2 + y^2$ es el radio en el plano ecuatorial.

#### Parámetros

| Parámetro | Valor por defecto | Rango |
|-----------|-------------------|-------|
| $a$ | 0.95 | [0, 2] |
| $b$ | 0.7 | [0, 2] |
| $c$ | 0.6 | [0, 2] |
| $d$ | 3.5 | [0, 10] |
| $e$ | 0.25 | [0, 1] |
| $f$ | 0.1 | [0, 1] |

#### Estado inicial

$$\mathbf{x}_0 = (0.1, 0, 0)$$

#### Estructura geométrica

El atractor de Aizawa tiene una morfología similar a un **toroide deformado** con una apertura. La simetría SO(2) de las primeras dos ecuaciones (estructura de rotación con frecuencia $d$) genera un movimiento espiral alrededor del eje $z$, mientras que la ecuación de $z$ contiene un potencial cúbico $az - z^3/3$ y el acoplamiento no lineal $fzx^3$ que rompe parcialmente la simetría, creando la forma asimétrica característica.

Las ecuaciones para $\dot{x}$ y $\dot{y}$ pueden reescribirse en coordenadas polares $(r, \theta)$ con $x = r\cos\theta$, $y = r\sin\theta$:

$$\dot{r} = (z - b)r + fr \cos^3\theta \cdot z$$

$$\dot{\theta} = d$$

La frecuencia angular $\dot{\theta} = d = 3.5$ implica que la trayectoria completa aproximadamente una vuelta cada $T = 2\pi/d \approx 1.8$ unidades de tiempo.

---

### 3.4 Atractor de Thomas

**Descubierto por:** René Thomas (1999)
**Contexto:** Sistema cíclicamente simétrico diseñado para estudiar la relación entre simetría y caos.
**Simetría:** Cíclica $\mathbb{Z}_3$ — invariante bajo permutación cíclica $(x, y, z) \to (y, z, x)$.

#### Ecuaciones

$$\dot{x} = \sin(y) - bx$$

$$\dot{y} = \sin(z) - by$$

$$\dot{z} = \sin(x) - bz$$

#### Parámetro

| Parámetro | Símbolo | Valor por defecto | Rango | Significado |
|-----------|---------|-------------------|-------|-------------|
| Disipación | $b$ | 0.208186 | [0, 1] | Coeficiente de amortiguamiento |

#### Estado inicial

$$\mathbf{x}_0 = (1, 0, 0)$$

#### Estructura y simetría

La elegancia del atractor de Thomas reside en su perfecta simetría cíclica: cada variable es amortiguada por $-b$ y forzada por el seno de la siguiente variable en el ciclo $x \to y \to z \to x$. La función $\sin(\cdot)$ confina las fuerzas al rango $[-1, 1]$, lo que acota naturalmente las trayectorias sin necesidad de términos cuadráticos o cúbicos.

La simetría $\mathbb{Z}_3$ implica que si $\mathbf{x}(t) = (x(t), y(t), z(t))$ es solución, entonces $(y(t), z(t), x(t))$ y $(z(t), x(t), y(t))$ también son soluciones. El atractor hereda esta simetría, exhibiendo una estructura tridimensional con triple rotación.

#### Comportamiento según $b$

| Rango de $b$ | Comportamiento |
|---------------|---------------|
| $b > 1$ | Punto fijo estable en el origen |
| $0.32 < b < 1$ | Punto fijo con espirales amortiguadas |
| $0.208186 < b < 0.32$ | **Atractor extraño** |
| $b < 0.208186$ | Atractor hipercaótico, cuenca extendida |

El valor $b = 0.208186$ es el valor "crítico" que produce un atractor particularmente estético y bien definido.

---

### 3.5 Atractor de Halvorsen

**Descubierto por:** Christian Halvorsen (2015)
**Contexto:** Sistema cíclicamente simétrico con geometría de tres alas.
**Simetría:** Cíclica $\mathbb{Z}_3$ — invariante bajo $(x, y, z) \to (y, z, x)$.

#### Ecuaciones

$$\dot{x} = -ax - 4y - 4z - y^2$$

$$\dot{y} = -ay - 4z - 4x - z^2$$

$$\dot{z} = -az - 4x - 4y - x^2$$

#### Parámetro

| Parámetro | Valor por defecto | Rango |
|-----------|-------------------|-------|
| $a$ | 1.89 | [0.5, 3] |

#### Estado inicial

$$\mathbf{x}_0 = (-5, 0, 0)$$

#### Análisis de la simetría

Al igual que Thomas, Halvorsen tiene simetría cíclica $\mathbb{Z}_3$. La estructura es más agresiva: los acoplamientos lineales $-4y - 4z$ (factor 4) dominan sobre la disipación $-ax$ (factor ~1.89), creando rotaciones rápidas. Los términos cuadráticos $-y^2$, $-z^2$, $-x^2$ rompen la simetría local y generan la estructura de tres "alas" o lóbulos del atractor.

La divergencia del campo vectorial es:

$$\nabla \cdot \mathbf{F} = -3a = -5.67$$

lo que confirma la disipatividad uniforme del sistema.

---

### 3.6 Atractor de Sprott (B)

**Descubierto por:** Julien Clinton Sprott (1994)
**Contexto:** Uno de los sistemas caóticos más simples conocidos, con solo 5 términos y 1 parámetro.
**Simetría:** Ninguna.

#### Ecuaciones

$$\dot{x} = yz$$

$$\dot{y} = x - y$$

$$\dot{z} = a - xy$$

#### Parámetro

| Parámetro | Valor por defecto | Rango |
|-----------|-------------------|-------|
| $a$ | 1.0 | [0.1, 3] |

#### Estado inicial

$$\mathbf{x}_0 = (0.1, 0.1, 0.1)$$

#### Minimalismo caótico

Sprott catalogó 19 sistemas caóticos cuadráticos tridimensionales, etiquetados de la A a la S, cada uno con la menor cantidad posible de términos. El caso B es notable por su extrema simplicidad:

- Solo 5 términos (frente a los 7 de Lorenz)
- Solo 2 no-linealidades ($yz$ y $xy$)
- 1 solo parámetro

La ecuación de $\dot{y} = x - y$ es un filtro paso bajo que suaviza $y$ hacia $x$. La ecuación de $\dot{x} = yz$ acopla las dos variables restantes multiplicativamente, y $\dot{z} = a - xy$ proporciona una constante de "inyección" $a$ compensada por el producto $xy$.

#### Divergencia

$$\nabla \cdot \mathbf{F} = 0 + (-1) + 0 = -1$$

La contracción volumétrica es constante e independiente del estado — el sistema es uniformemente disipativo con tasa de contracción $e^{-t}$.

---

### 3.7 Atractor de Chen

**Descubierto por:** Guanrong Chen (1999)
**Contexto:** Generalización "dual" del sistema de Lorenz, parte de la familia unificada Lorenz-Chen-Lü.
**Simetría:** $\mathbb{Z}_2$ — invariante bajo $(x, y, z) \to (-x, -y, z)$.

#### Ecuaciones

$$\dot{x} = a(y - x)$$

$$\dot{y} = (c - a)x - xz + cy$$

$$\dot{z} = xy - bz$$

#### Parámetros

| Parámetro | Valor por defecto | Rango |
|-----------|-------------------|-------|
| $a$ | 35 | [20, 50] |
| $b$ | 3 | [1, 10] |
| $c$ | 28 | [15, 40] |

#### Estado inicial

$$\mathbf{x}_0 = (-10, 0, 37)$$

#### Relación con Lorenz

El sistema de Chen fue diseñado como el "anti-Lorenz" en el sentido de la **condición de Šilnikov**: mientras que en Lorenz la matriz jacobiana en el punto de equilibrio tiene una particular estructura, Chen invierte esa relación. La **familia unificada** Lorenz-Chen-Lü se parametriza como:

$$\dot{x} = (25\alpha + 10)(y - x)$$

$$\dot{y} = (28 - 35\alpha)x - xz + (29\alpha - 1)y$$

$$\dot{z} = xy - \frac{8 + \alpha}{3}z$$

donde $\alpha = 0$ da Lorenz, $\alpha = 0.8$ da Lü, y $\alpha = 1$ da Chen.

#### Puntos de equilibrio

Para los valores por defecto ($a=35, b=3, c=28$), el sistema tiene tres equilibrios:

1. $\mathbf{x}^*_0 = (0, 0, 0)$ — tipo silla con eigenvalores reales mixtos.

2. $\mathbf{x}^*_{\pm} = (\pm\sqrt{b(2c - a)}, \pm\sqrt{b(2c - a)}, 2c - a) = (\pm\sqrt{63}, \pm\sqrt{63}, 21)$

---

### 3.8 Atractor de Dadras

**Descubierto por:** Sara Dadras (2010)
**Contexto:** Sistema con cuatro puntos de equilibrio y atractor de doble ala.
**Simetría:** Ninguna.

#### Ecuaciones

$$\dot{x} = y - ax + byz$$

$$\dot{y} = cy - xz + z$$

$$\dot{z} = dxy - ez$$

#### Parámetros

| Parámetro | Valor por defecto | Rango |
|-----------|-------------------|-------|
| $a$ | 3 | [1, 8] |
| $b$ | 2.7 | [0.5, 5] |
| $c$ | 1.7 | [0.5, 5] |
| $d$ | 2 | [0.5, 5] |
| $e$ | 9 | [1, 15] |

#### Estado inicial

$$\mathbf{x}_0 = (1, 1, 1)$$

#### Riqueza dinámica

El sistema de Dadras es notable por su riqueza paramétrica: con 5 parámetros, ofrece un vasto espacio de comportamientos. El término $byz$ en $\dot{x}$ y el término $-xz$ en $\dot{y}$ crean acoplamientos bilineales cruzados que generan la estructura de doble ala.

La divergencia es:

$$\nabla \cdot \mathbf{F} = -a + c - e = -3 + 1.7 - 9 = -10.3$$

El sistema tiene cuatro puntos de equilibrio, de los cuales ninguno es estable, permitiendo la existencia del atractor caótico.

---

### 3.9 Atractor de Lü (Three-Scroll)

**Descubierto por:** Jinhu Lü & Guanrong Chen (2002)
**Contexto:** Sistema unificado que representa el caso crítico entre Lorenz y Chen.
**Simetría:** $\mathbb{Z}_2$ — invariante bajo $(x, y, z) \to (-x, -y, z)$.

#### Ecuaciones

$$\dot{x} = a(y - x)$$

$$\dot{y} = -xz + cy$$

$$\dot{z} = xy - bz$$

#### Parámetros

| Parámetro | Valor por defecto | Rango |
|-----------|-------------------|-------|
| $a$ | 36 | [20, 50] |
| $b$ | 3 | [1, 10] |
| $c$ | 20 | [10, 30] |

#### Estado inicial

$$\mathbf{x}_0 = (-2, -2, 20)$$

#### Caso puente Lorenz-Chen

Comparación estructural con Lorenz y Chen:

| | Lorenz | **Lü** | Chen |
|---|--------|--------|------|
| $\dot{y}$ | $\rho x - xz - y$ | $-xz + cy$ | $(c-a)x - xz + cy$ |
| Término lineal en $\dot{y}$ | $\rho x - y$ | $cy$ | $(c-a)x + cy$ |
| Parámetro unificado $\alpha$ | 0 | 0.8 | 1 |

La diferencia clave es la ausencia del término $x$ lineal en $\dot{y}$ del sistema Lü (presente como $\rho x$ en Lorenz y $(c-a)x$ en Chen). Esto lo sitúa como un caso de transición algebraica.

---

### 3.10 Atractor de Rabinovich-Fabrikant

**Descubierto por:** Mikhail Rabinovich & Anatoly Fabrikant (1979)
**Contexto:** Modelo de inestabilidades modulacionales en ondas no lineales.
**Simetría:** $\mathbb{Z}_2$ — invariante bajo $(x, y, z) \to (-x, -y, z)$.

#### Ecuaciones

$$\dot{x} = y(z - 1 + x^2) + \gamma x$$

$$\dot{y} = x(3z + 1 - x^2) + \gamma y$$

$$\dot{z} = -2z(\alpha + xy)$$

#### Parámetros

| Parámetro | Símbolo | Valor por defecto | Rango |
|-----------|---------|-------------------|-------|
| Alpha | $\alpha$ | 1.1 | [0.01, 2] |
| Gamma | $\gamma$ | 0.87 | [0.01, 1.5] |

#### Estado inicial

$$\mathbf{x}_0 = (-1, 0, 0.5)$$

#### Complejidad del sistema

Rabinovich-Fabrikant es uno de los sistemas más complicados de ChaosLab. Las no-linealidades incluyen términos cúbicos ($x^3$ aparece implícitamente como $x \cdot x^2$) y acoplamientos triples ($xyz$ implícito en $-2z \cdot xy$). Esto genera una geometría del atractor extremadamente intrincada con múltiples escalas.

La ecuación de $\dot{z}$ tiene la forma $\dot{z} = -2z(\alpha + xy)$, lo que implica que $z = 0$ es un plano invariante. Dado que $\alpha > 0$, para estados donde $xy > -\alpha$, la variable $z$ es atraída hacia cero, creando la estructura "aplastada" característica del atractor.

#### Sensibilidad paramétrica

Este sistema es particularmente sensible a sus parámetros. Pequeñas variaciones en $\gamma$ pueden cambiar el comportamiento de caótico a periódico y viceversa. Se recomienda explorar lentamente el slider de $\gamma$ en ChaosLab para observar estas transiciones.

---

## 4. Integración Numérica: El Método Runge-Kutta de Orden 4

### 4.1 El problema de la integración numérica

Las ecuaciones diferenciales de los atractores no tienen solución analítica cerrada (de hecho, esa es parte de la esencia del caos). Debemos aproximar las soluciones numéricamente, avanzando paso a paso con un incremento de tiempo $\Delta t$ (llamado `dt` en ChaosLab).

### 4.2 Derivación del método RK4

Dado el sistema $\dot{\mathbf{x}} = \mathbf{F}(\mathbf{x})$ con estado actual $\mathbf{x}_n$ en el tiempo $t_n$, queremos estimar $\mathbf{x}_{n+1}$ en $t_{n+1} = t_n + \Delta t$.

El método RK4 computa cuatro "pendientes" intermedias:

$$\mathbf{k}_1 = \mathbf{F}(\mathbf{x}_n)$$

$$\mathbf{k}_2 = \mathbf{F}\!\left(\mathbf{x}_n + \frac{\Delta t}{2}\,\mathbf{k}_1\right)$$

$$\mathbf{k}_3 = \mathbf{F}\!\left(\mathbf{x}_n + \frac{\Delta t}{2}\,\mathbf{k}_2\right)$$

$$\mathbf{k}_4 = \mathbf{F}\!\left(\mathbf{x}_n + \Delta t\,\mathbf{k}_3\right)$$

Y la actualización final es la media ponderada:

$$\mathbf{x}_{n+1} = \mathbf{x}_n + \frac{\Delta t}{6}\left(\mathbf{k}_1 + 2\mathbf{k}_2 + 2\mathbf{k}_3 + \mathbf{k}_4\right)$$

### 4.3 Interpretación geométrica

- $\mathbf{k}_1$: pendiente al **inicio** del intervalo
- $\mathbf{k}_2$: pendiente en el **punto medio**, usando $\mathbf{k}_1$ para llegar allí
- $\mathbf{k}_3$: pendiente en el **punto medio**, usando $\mathbf{k}_2$ para llegar allí (corrección)
- $\mathbf{k}_4$: pendiente al **final** del intervalo, usando $\mathbf{k}_3$ para llegar allí

La ponderación $\frac{1}{6}(1, 2, 2, 1)$ da mayor peso a las pendientes del punto medio, lo que proporciona una precisión de orden 4: el error local es $O(\Delta t^5)$ y el error global es $O(\Delta t^4)$.

### 4.4 Implementación en ChaosLab

En `js/systems.js`, la función `rk4Step` implementa exactamente el esquema descrito:

```javascript
function rk4Step(equations, state, params, dt) {
    var k1 = equations(state, params);
    var s2 = [
        state[0] + k1[0] * dt * 0.5,
        state[1] + k1[1] * dt * 0.5,
        state[2] + k1[2] * dt * 0.5
    ];
    var k2 = equations(s2, params);
    // ... (k3, k4 análogos)
    return [
        state[0] + (k1[0] + 2*k2[0] + 2*k3[0] + k4[0]) * dt / 6,
        state[1] + (k1[1] + 2*k2[1] + 2*k3[1] + k4[1]) * dt / 6,
        state[2] + (k1[2] + 2*k2[2] + 2*k3[2] + k4[2]) * dt / 6
    ];
}
```

### 4.5 Elección del paso temporal $\Delta t$

El valor `dt = 0.005` por defecto es un compromiso:

| $\Delta t$ | Precisión | Velocidad | Estabilidad |
|-------------|-----------|-----------|-------------|
| 0.0001 | Excelente | Muy lenta (muchos pasos) | Excelente |
| 0.001 | Muy buena | Lenta | Muy buena |
| **0.005** | **Buena** | **Equilibrada** | **Buena** |
| 0.01 | Aceptable | Rápida | Marginal para algunos sistemas |
| 0.05 | Pobre | Muy rápida | Inestable (diverge) |

Para sistemas "rápidos" como Lorenz o Chen (velocidades de derivada altas), se recomienda $\Delta t \leq 0.005$. Para sistemas "lentos" como Thomas ($b \approx 0.2$, velocidades $\leq 1$), se puede usar $\Delta t = 0.01$ sin pérdida de precisión.

**Regla práctica:** Si la trayectoria "explota" (diverge a infinito), reducir $\Delta t$ o verificar que los parámetros estén en el régimen caótico.

### 4.6 Protección contra divergencia

La función `integrate()` incluye un mecanismo de seguridad que limita los valores:

```javascript
if (!isFinite(state[j])) state[j] = 0;
if (state[j] > 1e6) state[j] = 1e6;
if (state[j] < -1e6) state[j] = -1e6;
```

Esto previene que valores `NaN` o `Infinity` corrompan el buffer de la GPU, aunque la trayectoria resultante ya no será físicamente significativa.

---

## 5. Herramientas de Análisis

### 5.1 Exponente de Lyapunov

#### Definición

El **exponente máximo de Lyapunov** $\lambda_1$ cuantifica la tasa promedio de separación exponencial de trayectorias infinitesimalmente cercanas:

$$\lambda_1 = \lim_{t \to \infty} \frac{1}{t} \ln \frac{\|\delta\mathbf{x}(t)\|}{\|\delta\mathbf{x}(0)\|}$$

donde $\delta\mathbf{x}(t)$ es la separación entre dos trayectorias que comienzan a distancia $\|\delta\mathbf{x}(0)\| = \epsilon \to 0$.

#### Interpretación

| $\lambda_1$ | Comportamiento |
|---|---|
| $\lambda_1 < 0$ | Punto fijo estable (atractor) |
| $\lambda_1 = 0$ | Ciclo límite o toro (movimiento periódico/cuasiperiódico) |
| $\lambda_1 > 0$ | **Caos** — las trayectorias divergen exponencialmente |

Para el atractor de Lorenz con parámetros estándar: $\lambda_1 \approx 0.9056$.

Esto significa que la distancia entre trayectorias cercanas se multiplica por $e \approx 2.718$ cada $1/\lambda_1 \approx 1.1$ unidades de tiempo. Después de $t = 10$, la separación crece por un factor de $e^{9} \approx 8100$.

#### Espectro completo de Lyapunov

Un sistema 3D tiene tres exponentes de Lyapunov $\lambda_1 \geq \lambda_2 \geq \lambda_3$. Para un atractor extraño típico:

- $\lambda_1 > 0$ (estiramiento — caos)
- $\lambda_2 = 0$ (dirección del flujo — neutral)
- $\lambda_3 < 0$ (contracción hacia el atractor)

La **dimensión de Kaplan-Yorke** se estima como:

$$D_{KY} = j + \frac{\sum_{i=1}^{j} \lambda_i}{|\lambda_{j+1}|}$$

donde $j$ es el mayor entero tal que $\sum_{i=1}^{j} \lambda_i \geq 0$.

Para Lorenz: $\lambda_1 \approx 0.906$, $\lambda_2 = 0$, $\lambda_3 \approx -14.57$, lo que da $D_{KY} \approx 2 + 0.906/14.57 \approx 2.062$.

#### Algoritmo en ChaosLab

ChaosLab estima $\lambda_1$ con el método de **renormalización de trayectoria perturbada**:

1. Evolucionar un estado de referencia $\mathbf{x}$ durante un **transitorio** (1000 pasos) para que alcance el atractor.
2. Crear una copia perturbada $\mathbf{x}' = \mathbf{x} + (\epsilon, 0, 0)$ con $\epsilon = 10^{-7}$.
3. Evolucionar ambos durante $N$ pasos (5000 por defecto). En cada paso:
   - Medir la distancia $d_n = \|\mathbf{x}'_n - \mathbf{x}_n\|$.
   - Acumular $\sum \ln(d_n / \epsilon)$.
   - **Renormalizar**: reposicionar $\mathbf{x}'$ a distancia $\epsilon$ de $\mathbf{x}$ en la misma dirección.
4. El exponente es $\lambda_1 = \frac{1}{N \cdot \Delta t} \sum_{n=1}^{N} \ln\frac{d_n}{\epsilon}$.

La renormalización es esencial: sin ella, la distancia crecería hasta saturar y dejaría de reflejar la divergencia local.

### 5.2 Diagramas de Bifurcación

#### Concepto

Un **diagrama de bifurcación** muestra cómo cambia el comportamiento asintótico de un sistema al variar un parámetro. Se grafica:

- Eje horizontal: valor del parámetro $\mu$
- Eje vertical: valores visitados por una variable (típicamente $x$) después de pasar el transitorio

#### Construcción

Para cada valor de $\mu$ en un rango discretizado:

1. Inicializar el estado en $\mathbf{x}_0$.
2. Evolucionar $n_{\text{trans}}$ pasos (transitorio) para que la trayectoria llegue al atractor.
3. Evolucionar $n_{\text{cap}}$ pasos adicionales, registrando los valores de $x$.
4. Graficar los puntos $(\mu, x)$.

**Resultado visual:**
- **Punto fijo** → un solo punto por valor de $\mu$
- **Ciclo periodo-2** → dos puntos
- **Ciclo periodo-$2^n$** → $2^n$ puntos
- **Caos** → nube densa de puntos

#### Cascada de duplicación de periodo

La secuencia de bifurcaciones $1 \to 2 \to 4 \to 8 \to \cdots \to 2^n \to \cdots \to \text{caos}$ sigue la **constante de Feigenbaum**:

$$\delta = \lim_{n \to \infty} \frac{\mu_n - \mu_{n-1}}{\mu_{n+1} - \mu_n} \approx 4.669201\ldots$$

donde $\mu_n$ es el valor del parámetro donde ocurre la bifurcación de periodo $2^n$. Esta constante es **universal** — independiente del sistema particular.

#### Implementación en ChaosLab

El botón "Bifurcación" en la pestaña Analizar barre el primer parámetro del sistema actual (por ejemplo, $\sigma$ para Lorenz) sobre su rango completo con 200 muestras, 500 pasos de transitorio y 100 pasos de captura por muestra.

### 5.3 Divergencia de Sensibilidad

La función `sensitivityDivergence` mide la **separación temporal** entre dos trayectorias que comienzan a distancia $\epsilon$ una de la otra. A diferencia del cálculo de Lyapunov (que renormaliza), aquí se deja que la divergencia crezca libremente, produciendo una curva exponencial:

$$\|\delta\mathbf{x}(t)\| \sim \epsilon \cdot e^{\lambda_1 t}$$

En escala logarítmica, la pendiente de esta curva da directamente $\lambda_1$. Las desviaciones de la linealidad indican la estructura de plegamiento del atractor.

### 5.4 Estadísticas de Trayectoria

La función `trajectoryStats` calcula sobre el buffer de posiciones del trail:

- **Centroide**: $\bar{\mathbf{x}} = \frac{1}{N}\sum_{i=1}^{N}\mathbf{x}_i$ — centro de masa del atractor muestreado.
- **Bounding box**: $[\mathbf{x}_{\min}, \mathbf{x}_{\max}]$ — la caja alineada con los ejes que contiene el atractor.
- **Spread**: $\sqrt{(\Delta x)^2 + (\Delta y)^2 + (\Delta z)^2}$ donde $\Delta = \max - \min$ — diagonal de la bounding box, medida del "tamaño" del atractor.

---

## 6. Guía de Uso de ChaosLab

### 6.1 Interfaz principal

```
┌──────────────────────────────────────────────────────────────┐
│ ChaosLab  │ Lorenz  Rössler  Aizawa  Thomas  ...  │ nombre │
├────────────────────────────────────┬─────────────────────────┤
│                                    │ [Explorar] [Analizar]   │
│                                    ├─────────────────────────┤
│                                    │ Parámetros del sistema  │
│         Viewport 3D                │  σ ────●──────── 10.00  │
│         (canvas WebGL)             │  ρ ──────●────── 28.00  │
│                                    │  β ──●────────── 2.67   │
│         Arrastrar = orbitar        │                         │
│         Scroll = zoom              │ dt: 0.005               │
│                                    │ Trail length: 50000     │
│                                    │ Velocidad: 20           │
│                                    │                         │
│                                    │ ☑ Auto-rotar            │
│                                    │ ☑ Mostrar ejes          │
│                                    │ ☑ Color por velocidad   │
│                                    │ ☐ Mostrar puntos        │
│                                    │                         │
│                                    │ Ecuaciones (KaTeX)      │
│                                    ├─────────────────────────┤
│                                    │ Propiedades             │
│                                    │  Nombre: Lorenz         │
│                                    │  Tipo: Continuo (ODE)   │
│                                    │  ...                    │
└────────────────────────────────────┴─────────────────────────┘
```

### 6.2 Controles de navegación 3D

| Acción | Mouse | Touch |
|--------|-------|-------|
| Orbitar (rotar la vista) | Arrastrar con botón izquierdo | Arrastrar con un dedo |
| Zoom (acercar/alejar) | Rueda del ratón | — |

La cámara orbita en coordenadas esféricas $(\theta, \phi, r)$ alrededor del centroide del atractor, donde:
- $\theta$ es el ángulo azimutal (rotación horizontal)
- $\phi$ es el ángulo polar (elevación)
- $r$ es la distancia radial (zoom)

### 6.3 Panel Explorar

#### Parámetros del sistema
Sliders generados dinámicamente según el sistema seleccionado. Cada slider muestra la etiqueta del parámetro (por ejemplo, σ, ρ, β) y su valor actual. **Los cambios son en tiempo real** — el atractor se deforma mientras arrastras el slider.

#### Controles globales
- **dt**: Paso temporal del integrador. Reducir para mayor precisión, aumentar para velocidad.
- **Trail length**: Número máximo de puntos en la estela. Más puntos = atractor más definido pero más uso de GPU.
- **Velocidad**: Pasos de integración por frame de animación. Más pasos = el atractor se dibuja más rápido.

#### Opciones de visualización
- **Auto-rotar**: La cámara gira automáticamente 0.17°/frame para ver el atractor desde todos los ángulos.
- **Mostrar ejes**: Ejes X (rojo), Y (verde), Z (azul) con etiquetas.
- **Color por velocidad**: Colorea la trayectoria según la velocidad local: azul (lento) → rojo (rápido).
- **Mostrar puntos**: Superpone una nube de puntos sobre la línea del trail.

### 6.4 Panel Analizar

#### Exponente de Lyapunov
Haz clic en "Calcular Lyapunov" para estimar el exponente máximo. El resultado se muestra en color:
- **Rojo**: Positivo → el sistema es caótico.
- **Cian**: No positivo → el sistema es periódico o convergente.

#### Diagrama de bifurcación
Haz clic en "Bifurcación" para generar un diagrama que barre el primer parámetro del sistema. La visualización aparece en el canvas inferior.

#### Estadísticas
Se actualizan automáticamente cada 30 frames:
- **Centroide**: Centro de masa del atractor.
- **Spread**: Tamaño de la diagonal de la caja envolvente.
- **Puntos**: Número actual de puntos en el trail.

### 6.5 Selección de sistema

Haz clic en cualquier botón de la barra superior para cambiar de sistema. Al cambiar:
1. Se resetea el trail (nueva estela desde cero)
2. Se actualizan los sliders de parámetros
3. Se renderizan las ecuaciones en KaTeX
4. Se actualizan las propiedades
5. El estado del integrador se reinicia a las condiciones iniciales del sistema

---

## 7. Ejercicios Explicativos

### Ejercicio 1: El efecto mariposa en Lorenz

**Objetivo:** Demostrar experimentalmente la sensibilidad a condiciones iniciales.

**Procedimiento:**
1. Selecciona el sistema **Lorenz** con parámetros por defecto ($\sigma = 10$, $\rho = 28$, $\beta = 2.667$).
2. Deja que el atractor se dibuje durante ~10 segundos.
3. Ve a la pestaña **Analizar** y haz clic en "Calcular Lyapunov".
4. Anota el valor obtenido: $\lambda_1 \approx$ __________.

**Preguntas:**
- a) Si el exponente de Lyapunov es $\lambda_1 \approx 0.9$, ¿por cuánto se multiplica la distancia entre dos trayectorias cercanas después de $t = 5$ unidades de tiempo?

   **Solución:** La separación crece como $\delta(t) = \delta_0 \cdot e^{\lambda_1 t}$. Para $t = 5$:

   $$\frac{\delta(5)}{\delta_0} = e^{0.9 \times 5} = e^{4.5} \approx 90$$

   La distancia se multiplica por ~90 en 5 unidades de tiempo.

- b) Si partimos de dos condiciones iniciales que difieren en $10^{-10}$ (una parte en diez mil millones), ¿cuánto tiempo tarda la diferencia en alcanzar el tamaño del atractor (~30 unidades)?

   **Solución:** Resolvemos $30 = 10^{-10} \cdot e^{0.9 t}$:

   $$e^{0.9 t} = 3 \times 10^{11}$$

   $$0.9 t = \ln(3 \times 10^{11}) \approx 26.4$$

   $$t \approx 29.4 \text{ unidades de tiempo}$$

   Después de ~30 unidades de tiempo, las trayectorias son completamente independientes.

---

### Ejercicio 2: Cascada de duplicación de periodo en Rössler

**Objetivo:** Observar la ruta al caos de Feigenbaum.

**Procedimiento:**
1. Selecciona **Rössler**.
2. Fija $a = 0.2$, $b = 0.2$.
3. Varía el parámetro $c$ lentamente desde $c = 2$ hasta $c = 6$, observando la trayectoria.

**Observaciones esperadas:**

| Valor de $c$ | Comportamiento observado | Tipo |
|---|---|---|
| $c = 2.5$ | Órbita circular simple | Ciclo periodo-1 |
| $c = 3.5$ | Órbita que se cierra tras 2 vueltas | Ciclo periodo-2 |
| $c = 4.2$ | Órbita que se cierra tras 4 vueltas | Ciclo periodo-4 |
| $c = 4.5$ | Órbita que parece no cerrarse | Inicio del caos |
| $c = 5.7$ | Estructura de banda con "reinserción" | Caos de banda |

**Preguntas:**
- a) ¿Por qué no puede haber caos en un sistema bidimensional autónomo, pero sí en el sistema de Rössler que es 3D?

   **Respuesta:** El teorema de Poincaré-Bendixson establece que en $\mathbb{R}^2$ las trayectorias acotadas solo pueden converger a puntos fijos o ciclos límite. En $\mathbb{R}^3$, las trayectorias tienen suficiente libertad para "esquivarse" sin cruzarse (por unicidad de soluciones), permitiendo la dinámica caótica.

- b) Genera el diagrama de bifurcación para $c$. ¿Puedes identificar las bifurcaciones de duplicación de periodo?

   **Procedimiento:** En la pestaña Analizar, haz clic en "Bifurcación". El diagrama mostrará cómo el atractor pasa de un punto a dos ramas, luego cuatro, y finalmente una nube densa.

---

### Ejercicio 3: Simetría cíclica en Thomas vs. Halvorsen

**Objetivo:** Comparar dos sistemas con simetría $\mathbb{Z}_3$.

**Procedimiento:**
1. Selecciona **Thomas** ($b = 0.208186$). Observa la forma del atractor.
2. Selecciona **Halvorsen** ($a = 1.89$). Observa la forma del atractor.

**Preguntas:**
- a) Ambos sistemas son invariantes bajo $(x, y, z) \to (y, z, x)$. ¿Cómo se manifiesta esta simetría visualmente?

   **Respuesta:** El atractor tiene tres "brazos" o "lóbulos" idénticos, dispuestos con simetría de rotación de 120° alrededor del eje $(1, 1, 1)/\sqrt{3}$. Si giras el atractor 120° alrededor de este eje diagonal, luce idéntico.

- b) ¿Qué diferencia fundamental hay entre las no-linealidades de Thomas ($\sin$) y Halvorsen ($x^2$)?

   **Respuesta:** La función seno de Thomas es **acotada** ($|\sin(x)| \leq 1$), lo que confina naturalmente las trayectorias a una región compacta del espacio de fases. En cambio, los términos cuadráticos de Halvorsen son **no acotados**, requiriendo que el amortiguamiento lineal $-a$ sea suficientemente fuerte para prevenir la divergencia. Esto hace que Halvorsen sea más sensible al valor de $a$ y que la transición de caos a divergencia sea más abrupta.

- c) Cambia $b$ de Thomas a 0.3. ¿Qué ocurre? ¿Y a 0.15?

   **Respuesta esperada:** Con $b = 0.3$, el atractor se simplifica (posiblemente a un ciclo límite o punto fijo, dado que el amortiguamiento es mayor). Con $b = 0.15$, el atractor se expande y se vuelve más complejo, ocupando un volumen mayor en el espacio de fases.

---

### Ejercicio 4: Error de integración y paso temporal

**Objetivo:** Verificar experimentalmente el efecto del paso temporal $\Delta t$ en la precisión.

**Procedimiento:**
1. Selecciona **Lorenz** con parámetros por defecto.
2. Usa $\Delta t = 0.005$ (por defecto). Deja correr 5 segundos. Calcula el exponente de Lyapunov y anota: $\lambda_1 \approx$ __________.
3. Cambia $\Delta t = 0.001$. Resetea y repite. Anota: $\lambda_1 \approx$ __________.
4. Cambia $\Delta t = 0.05$. Resetea y repite. Anota: $\lambda_1 \approx$ __________.

**Preguntas:**
- a) ¿Cuánto varían los exponentes de Lyapunov entre los tres valores de $\Delta t$?

   **Explicación:** Para $\Delta t = 0.005$ y $\Delta t = 0.001$, los valores deberían ser similares (dentro de ~5% de diferencia), ya que RK4 es preciso a orden 4. Para $\Delta t = 0.05$, el error de integración es mucho mayor y puede producir un valor de Lyapunov significativamente diferente (o incluso negativo si la trayectoria diverge y se "clampa").

- b) El error global de RK4 es $O(\Delta t^4)$. Si el error con $\Delta t = 0.005$ es $E$, ¿cuál debería ser con $\Delta t = 0.001$?

   **Solución:** $E_{0.001} / E_{0.005} \approx (0.001/0.005)^4 = (0.2)^4 = 0.0016$. El error se reduce por un factor de ~625.

---

### Ejercicio 5: Familia unificada Lorenz-Lü-Chen

**Objetivo:** Explorar la continuidad entre tres sistemas aparentemente distintos.

**Procedimiento:**
1. Selecciona **Lorenz** ($\sigma = 10$, $\rho = 28$, $\beta = 8/3$). Observa el atractor de doble ala.
2. Selecciona **Lü (Three-Scroll)** ($a = 36$, $b = 3$, $c = 20$). Observa el cambio de forma.
3. Selecciona **Chen** ($a = 35$, $b = 3$, $c = 28$). Compara con los anteriores.

**Preguntas:**
- a) Escribe las ecuaciones de los tres sistemas uno al lado del otro. ¿Cuál es la diferencia estructural en la ecuación de $\dot{y}$?

   | | $\dot{y}$ |
   |---|---|
   | **Lorenz** | $x(\rho - z) - y$ |
   | **Lü** | $-xz + cy$ |
   | **Chen** | $(c - a)x - xz + cy$ |

   La diferencia está en los términos lineales: Lorenz tiene $\rho x - y$, Lü elimina el término $x$ y usa $cy$, y Chen tiene $(c-a)x + cy$.

- b) ¿Por qué estos tres sistemas comparten la simetría $\mathbb{Z}_2$ bajo $(x, y, z) \to (-x, -y, z)$?

   **Respuesta:** En las tres ecuaciones, $\dot{x}$ y $\dot{y}$ son combinaciones de términos lineales en $x$, $y$ y el producto $xz$. Si sustituimos $x \to -x$ y $y \to -y$: los términos lineales cambian de signo (correcto), $xz \to (-x)z = -xz$ cambia de signo (correcto), y $xy \to (-x)(-y) = xy$ no cambia (correcto, aparece en $\dot{z}$). Por lo tanto, $\dot{z}$ no cambia y $\dot{x}$, $\dot{y}$ cambian de signo — la simetría se preserva.

---

### Ejercicio 6: Complejidad de Rabinovich-Fabrikant

**Objetivo:** Explorar el sistema más complejo de ChaosLab.

**Procedimiento:**
1. Selecciona **R-F** (Rabinovich-Fabrikant) con $\alpha = 1.1$, $\gamma = 0.87$.
2. Observa el atractor — debería mostrar una estructura intrincada y no simétrica en apariencia.
3. Varía $\gamma$ lentamente de 0.87 a 0.10.

**Preguntas:**
- a) ¿Por qué la ecuación $\dot{z} = -2z(\alpha + xy)$ implica que $z$ tiende a cero cuando $xy > -\alpha$?

   **Respuesta:** Si $xy > -\alpha$, entonces $\alpha + xy > 0$, y $\dot{z} = -2z(\alpha + xy)$. Si $z > 0$, entonces $\dot{z} < 0$ (z decrece). Si $z < 0$, entonces $\dot{z} > 0$ (z crece hacia cero). Por tanto, $z = 0$ es un atractor para esta ecuación cuando $\alpha + xy > 0$, lo que ocurre la mayor parte del tiempo dado que $\alpha = 1.1 > 0$.

- b) Para $\gamma = 0.1$, ¿el sistema sigue siendo caótico? Calcula el exponente de Lyapunov y verifica.

   **Procedimiento:** Ajusta $\gamma = 0.1$, espera que el atractor se estabilice, y calcula Lyapunov. Para valores bajos de $\gamma$, el sistema puede transitionar a comportamiento periódico ($\lambda_1 \leq 0$).

---

### Ejercicio 7: Sprott — Minimalismo y caos

**Objetivo:** Demostrar que el caos no requiere ecuaciones complicadas.

**Procedimiento:**
1. Selecciona **Sprott (B)** con $a = 1.0$.
2. Observa el atractor — a pesar de tener solo 5 términos, la dinámica es caótica.

**Preguntas:**
- a) ¿Cuántas evaluaciones de funciones trigonométricas, exponenciales, o raíces cuadradas requiere una iteración RK4 del sistema de Sprott?

   **Respuesta:** Cero. Sprott solo usa multiplicación ($yz$, $xy$), suma y resta. Cada evaluación del campo vectorial requiere 2 multiplicaciones y 3 sumas/restas. Con 4 evaluaciones por paso RK4, son 8 multiplicaciones + 12 sumas por paso — extremadamente eficiente.

- b) ¿Cuál es la divergencia del campo vectorial? ¿Es constante o depende del estado?

   **Solución:**

   $$\nabla \cdot \mathbf{F} = \frac{\partial(yz)}{\partial x} + \frac{\partial(x - y)}{\partial y} + \frac{\partial(a - xy)}{\partial z} = 0 + (-1) + 0 = -1$$

   La divergencia es **constante** ($-1$), independiente del estado. El volumen en el espacio de fases se contrae a tasa $e^{-t}$ uniformemente.

- c) Cambia $a$ de 1.0 a 0.5, luego a 2.0. ¿Cómo cambia el atractor?

   **Indicación:** Para $a$ bajos, el sistema puede perder la caoticidad. Para $a$ altos, el atractor puede expandirse. Observa el tamaño (spread) en las estadísticas.

---

### Ejercicio 8: Diagrama de bifurcación del Lorenz

**Objetivo:** Construir un diagrama de bifurcación y localizar la transición al caos.

**Procedimiento:**
1. Selecciona **Lorenz**. Ve a la pestaña **Analizar**.
2. Haz clic en **Bifurcación**. El diagrama barre $\sigma$ de 0 a 30.
3. Observa el diagrama resultante.

**Preguntas:**
- a) ¿Puedes identificar regiones de comportamiento periódico (líneas delgadas) y caótico (nubes densas)?

   **Indicación:** Para $\sigma$ bajo, el sistema puede converger a un punto fijo (un solo punto por valor de $\sigma$). A medida que $\sigma$ aumenta, aparecen bifurcaciones y eventualmente caos.

- b) ¿El parámetro más interesante para el diagrama de bifurcación de Lorenz es $\sigma$ o $\rho$? ¿Por qué?

   **Respuesta:** $\rho$ es el parámetro de bifurcación clásico de Lorenz, ya que controla directamente la transición de convección estable a caos (es el número de Rayleigh normalizado). Sin embargo, ChaosLab barre por defecto el primer parámetro ($\sigma$). Para un análisis más revelador, se podría modificar el código para barrer $\rho$.

---

### Ejercicio 9: Buffer circular y visualización

**Objetivo:** Entender cómo ChaosLab gestiona la memoria de visualización.

**Preguntas teóricas:**

- a) Si el trail length es 50,000 puntos y cada punto ocupa 3 componentes `float32` (x, y, z) para posición más 3 para color, ¿cuánta memoria GPU consume un trail?

   **Solución:**

   $$\text{Memoria} = 50{,}000 \times 3 \times 4 \text{ bytes (posición)} + 50{,}000 \times 3 \times 4 \text{ bytes (color)}$$

   $$= 600{,}000 + 600{,}000 = 1{,}200{,}000 \text{ bytes} \approx 1.14 \text{ MB}$$

- b) Con `stepsPerFrame = 20` y `dt = 0.005`, ¿cuánto tiempo simulado pasa por frame de animación (asumiendo 60 fps)?

   **Solución:**

   - Tiempo simulado por frame: $20 \times 0.005 = 0.1$ unidades.
   - A 60 fps: $0.1 \times 60 = 6$ unidades de tiempo simulado por segundo real.
   - Para llenar 50,000 puntos: $50{,}000 / 20 = 2{,}500$ frames = ~42 segundos a 60 fps.

- c) ¿Por qué el buffer circular produce un artefacto visual de "línea cruzada" cuando se llena por completo?

   **Respuesta:** Cuando el buffer circular se llena, el puntero `head` vuelve a la posición 0 y sobrescribe los puntos más antiguos. `THREE.Line` dibuja los puntos en orden de índice (0, 1, 2, ..., N-1). En el punto donde `head` ha hecho wrap-around, el punto `head-1` (recién escrito) está lejos espacialmente del punto `head` (antiguo, a punto de ser sobrescrito), creando un segmento de línea largo que cruza el espacio. Con 50,000 puntos, este único segmento errante es prácticamente imperceptible entre miles de segmentos legítimos.

---

### Ejercicio 10: Aizawa — Coordenadas polares

**Objetivo:** Analizar matemáticamente la estructura rotacional del sistema de Aizawa.

**Preguntas:**

- a) Reescribe las ecuaciones de $\dot{x}$ y $\dot{y}$ del sistema de Aizawa en coordenadas polares $(r, \theta)$ donde $x = r\cos\theta$, $y = r\sin\theta$.

   **Solución:** Las ecuaciones son:
   $$\dot{x} = (z - b)x - dy$$
   $$\dot{y} = dx + (z - b)y$$

   Esto es una rotación con frecuencia $d$ modulada por el factor $(z - b)$:

   $$\dot{r} = (z - b)r$$

   $$\dot{\theta} = d$$

   (Ignorando el término $fzx^3$ que rompe la simetría perfecta.)

   La velocidad angular es constante $\dot{\theta} = d = 3.5$ rad/s, y el radio crece exponencialmente cuando $z > b = 0.7$ y decrece cuando $z < b$.

- b) ¿Cuántas vueltas completa la trayectoria alrededor del eje $z$ por unidad de tiempo?

   **Solución:**

   $$\text{Frecuencia} = \frac{d}{2\pi} = \frac{3.5}{2\pi} \approx 0.557 \text{ vueltas/unidad de tiempo}$$

   O equivalentemente, una vuelta completa cada $T = 2\pi / 3.5 \approx 1.80$ unidades de tiempo.

---

## 8. Glosario

| Término | Definición |
|---------|-----------|
| **Atractor** | Conjunto en el espacio de fases hacia el cual convergen las trayectorias cercanas |
| **Atractor extraño** | Atractor con dimensión fractal y sensibilidad a condiciones iniciales |
| **Bifurcación** | Cambio cualitativo en el comportamiento del sistema al variar un parámetro |
| **Buffer circular** | Estructura de datos de tamaño fijo donde el puntero de escritura vuelve al inicio al llegar al final |
| **Campo vectorial** | Función $\mathbf{F}: \mathbb{R}^3 \to \mathbb{R}^3$ que asigna una "velocidad" a cada punto del espacio de fases |
| **Caos** | Comportamiento aperiódico acotado de un sistema determinista con sensibilidad exponencial a condiciones iniciales |
| **Ciclo límite** | Trayectoria cerrada aislada hacia la cual convergen trayectorias cercanas |
| **Condiciones iniciales** | Estado $\mathbf{x}_0$ del sistema en $t = 0$ |
| **Cuenca de atracción** | Región del espacio de fases cuyos puntos convergen a un atractor dado |
| **Dimensión de correlación** | Medida fractal del atractor basada en la distribución de distancias entre puntos |
| **Dimensión de Kaplan-Yorke** | Estimación de la dimensión fractal a partir del espectro de Lyapunov |
| **Disipativo** | Sistema donde el volumen del espacio de fases se contrae ($\nabla \cdot \mathbf{F} < 0$) |
| **Divergencia** | $\nabla \cdot \mathbf{F}$ — tasa de cambio de volumen en el espacio de fases |
| **Duplicación de periodo** | Bifurcación donde un ciclo de periodo $T$ se convierte en uno de periodo $2T$ |
| **Efecto mariposa** | Sensibilidad extrema a condiciones iniciales en sistemas caóticos |
| **Eigenvalor** | Valor propio de la matriz jacobiana; determina la estabilidad local |
| **Espacio de fases** | Espacio de todos los estados posibles del sistema |
| **Exponente de Lyapunov** | Tasa promedio de divergencia/convergencia exponencial de trayectorias cercanas |
| **Feigenbaum (constante de)** | $\delta \approx 4.669$ — razón de convergencia universal de las bifurcaciones de duplicación de periodo |
| **Flujo** | Mapa $\Phi^t$ que evoluciona estados iniciales un tiempo $t$ |
| **Jacobiana** | Matriz de derivadas parciales del campo vectorial |
| **ODE** | Ecuación diferencial ordinaria |
| **Poincaré-Bendixson** | Teorema que prohibe el caos en sistemas 2D autónomos |
| **Punto de equilibrio** | Estado $\mathbf{x}^*$ donde $\mathbf{F}(\mathbf{x}^*) = 0$ |
| **Renormalización** | Técnica de reescalar la perturbación para evitar saturación en el cálculo de Lyapunov |
| **RK4** | Método Runge-Kutta de orden 4 — integrador numérico con error $O(\Delta t^4)$ |
| **Simetría $\mathbb{Z}_2$** | Invariancia bajo inversión de signo de un par de variables |
| **Simetría $\mathbb{Z}_3$** | Invariancia bajo permutación cíclica de las tres variables |
| **Trayectoria** | Curva que traza un punto del espacio de fases al evolucionar bajo el flujo |
| **Transitorio** | Evolución inicial antes de que la trayectoria alcance el atractor |

---

## 9. Referencias Bibliográficas

### Artículos originales de los sistemas

1. **Lorenz, E. N.** (1963). "Deterministic Nonperiodic Flow." *Journal of the Atmospheric Sciences*, 20(2), 130–141.

2. **Rössler, O. E.** (1976). "An Equation for Continuous Chaos." *Physics Letters A*, 57(5), 397–398.

3. **Aizawa, Y.** (1982). "Global Aspects of the Dissipative Dynamical Systems." *Progress of Theoretical Physics Supplement*, 72, 7–82.

4. **Thomas, R.** (1999). "Deterministic Chaos Seen in Terms of Feedback Circuits: Analysis, Synthesis, 'Labyrinth Chaos'." *International Journal of Bifurcation and Chaos*, 9(10), 1889–1905.

5. **Halvorsen, C.** (2015). Comunicación personal. Sistema cíclicamente simétrico con tres alas.

6. **Sprott, J. C.** (1994). "Some Simple Chaotic Flows." *Physical Review E*, 50(2), R647–R650.

7. **Chen, G. & Ueta, T.** (1999). "Yet Another Chaotic Attractor." *International Journal of Bifurcation and Chaos*, 9(7), 1465–1466.

8. **Dadras, S. & Momeni, H. R.** (2010). "A Novel Three-Dimensional Autonomous Chaotic System." *Physics Letters A*, 374(13-14), 1368–1373.

9. **Lü, J. & Chen, G.** (2002). "A New Chaotic Attractor Coined." *International Journal of Bifurcation and Chaos*, 12(3), 659–661.

10. **Rabinovich, M. I. & Fabrikant, A. L.** (1979). "Stochastic Self-Modulation of Waves in Nonequilibrium Media." *Journal of Experimental and Theoretical Physics (JETP)*, 77, 617–629.

### Libros de referencia

- **Strogatz, S. H.** *Nonlinear Dynamics and Chaos* (2nd ed., 2015). Westview Press. — Texto introductorio accesible y completo.

- **Ott, E.** *Chaos in Dynamical Systems* (2nd ed., 2002). Cambridge University Press. — Tratamiento matemático riguroso.

- **Sprott, J. C.** *Elegant Chaos: Algebraically Simple Chaotic Flows* (2010). World Scientific. — Catálogo de sistemas caóticos simples.

- **Hilborn, R. C.** *Chaos and Nonlinear Dynamics* (2nd ed., 2000). Oxford University Press. — Enfoque experimental y computacional.

### Recursos computacionales

- **Press, W. H. et al.** *Numerical Recipes* (3rd ed., 2007). Cambridge University Press. — Referencia para implementación de RK4.

- **Three.js** (r128). Biblioteca WebGL utilizada para el renderizado 3D. https://threejs.org/

- **KaTeX**. Biblioteca de renderizado de LaTeX utilizada para las ecuaciones. https://katex.org/

---

*Tutorial generado para ChaosLab — Explorador de Atractores Extraños.*
*Rama: feature/visualization*
