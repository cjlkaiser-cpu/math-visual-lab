# PolytopeXD — Tutorial Completo de Politopos Regulares en la Cuarta Dimension

> **PolytopeXD** es un explorador interactivo de los 6 politopos regulares convexos en 4 dimensiones, con 4 modos de visualizacion (Explorar, Cortar, Celdas, Red) que permiten comprender la geometria del hiperespacio mediante proyecciones, secciones transversales, descomposicion celular y desplegados.

---

## Tabla de Contenidos

1. [Introduccion a la Cuarta Dimension](#1-introduccion-a-la-cuarta-dimension)
2. [Los 6 Politopos Regulares en 4D](#2-los-6-politopos-regulares-en-4d)
   - 2.1 [Pentacoro (5-cell)](#21-pentacoro-5-cell-333)
   - 2.2 [Teseracto (Tesseract)](#22-teseracto-tesseract-433)
   - 2.3 [Hexadecacoro (16-cell)](#23-hexadecacoro-16-cell-334)
   - 2.4 [Icositetracoro (24-cell)](#24-icositetracoro-24-cell-343)
   - 2.5 [Hecatonicosacoro (120-cell)](#25-hecatonicosacoro-120-cell-533)
   - 2.6 [Hexacosicoro (600-cell)](#26-hexacosicoro-600-cell-335)
3. [Proyeccion 4D a 3D](#3-proyeccion-4d-a-3d)
4. [Rotaciones en 4D](#4-rotaciones-en-4d)
5. [Secciones Transversales (Hiperplanos)](#5-secciones-transversales-hiperplanos)
6. [Celdas y Descomposicion](#6-celdas-y-descomposicion)
7. [Redes (Nets) y Desplegados](#7-redes-nets-y-desplegados)
8. [Caracteristica de Euler Generalizada](#8-caracteristica-de-euler-generalizada)
9. [Dualidad en 4D](#9-dualidad-en-4d)
10. [Guia de Uso de PolytopeXD](#10-guia-de-uso-de-polytopexd)
11. [Ejercicios](#11-ejercicios)
12. [Glosario](#12-glosario)
13. [Referencias Bibliograficas](#13-referencias-bibliograficas)

---

## 1. Introduccion a la Cuarta Dimension

### 1.1 Que es la cuarta dimension espacial

Cuando hablamos de la **cuarta dimension** en este contexto, nos referimos estrictamente a una cuarta dimension **espacial**, no a la dimension temporal de la relatividad. Es una direccion geometrica adicional, perpendicular a las tres que conocemos (largo, ancho, alto), que denotamos con la coordenada $w$.

Un punto en el espacio 4D se representa como un vector de cuatro componentes:

$$\mathbf{p} = (x, y, z, w) \in \mathbb{R}^4$$

Aunque no podemos visualizar directamente el espacio 4D — nuestra experiencia perceptual esta limitada a 3 dimensiones — podemos razonar sobre el usando **analogias dimensionales**, **proyecciones** y **secciones transversales**. Este es precisamente el proposito de PolytopeXD: hacer accesible la geometria 4D mediante herramientas interactivas de visualizacion.

### 1.2 Analogia dimensional: punto, linea, cuadrado, cubo, hipercubo

La estrategia mas poderosa para comprender la cuarta dimension es la **analogia dimensional ascendente**. Observemos como cada objeto se construye a partir del anterior:

```
Dimension 0      Dimension 1      Dimension 2      Dimension 3      Dimension 4

    *             *----------*     *----------*     *----------*     Se proyecta
  (punto)            (linea)      |          |     /|         /|     en 3D como
                                  |          |    / |        / |     un cubo
                                  |          |   *--|-------*  |     dentro de
                                  *----------*   |  *-------|--*     otro cubo
                                  (cuadrado)     | /        | /
                                                 |/         |/
                                                 *----------*
                                                   (cubo)
```

| Dimension | Objeto | Vertices | Aristas | Caras | Celdas |
|-----------|--------|----------|---------|-------|--------|
| 0 | Punto | 1 | 0 | 0 | 0 |
| 1 | Segmento | 2 | 1 | 0 | 0 |
| 2 | Cuadrado | 4 | 4 | 1 | 0 |
| 3 | Cubo | 8 | 12 | 6 | 0 |
| 4 | **Hipercubo** | **16** | **32** | **24** | **8** |

El patron es claro: al extruir un objeto $n$-dimensional en la direccion de la dimension $n+1$, cada vertice genera una arista, cada arista genera una cara, y cada cara genera una celda. Formalmente, si un $n$-cubo tiene $V$ vertices, $E$ aristas y $F$ caras, el $(n+1)$-cubo tiene $2V$ vertices, $2E + V$ aristas, $2F + E$ caras, y asi sucesivamente.

### 1.3 Politopos regulares: generalizacion de poliedros regulares

Un **politopo regular** es la generalizacion a $n$ dimensiones de los poligonos regulares (2D) y los poliedros regulares (3D). Un politopo es regular si:

1. Todas sus **facetas** (elementos de dimension $n-1$) son identicas y regulares.
2. Todas sus figuras de vertice (la configuracion alrededor de cada vertice) son identicas.
3. Es **transitivo por banderas**: el grupo de simetrias actua transitivamente sobre las banderas (cadenas vertice-arista-cara-...-faceta).

En cada dimension, el numero de politopos regulares convexos es finito y esta completamente clasificado:

| Dimension | Cantidad | Politopos regulares |
|-----------|----------|---------------------|
| 2 | $\infty$ | Poligonos regulares: triangulo, cuadrado, pentagono, ... |
| 3 | 5 | **Solidos platonicos**: tetraedro, cubo, octaedro, dodecaedro, icosaedro |
| **4** | **6** | Pentacoro, teseracto, hexadecacoro, **icositetracoro**, hecatonicosacoro, hexacosicoro |
| $n \geq 5$ | 3 | Solo el simplex, el hipercubo y el ortoplex (cross-polytope) |

La dimension 4 es **excepcionalmente rica**: tiene 6 politopos regulares, mas que cualquier otra dimension $n \geq 3$. Esto se debe a la existencia de 3 politopos "excepcionales" que no tienen analogo en dimensiones superiores, siendo el icositetracoro (24-cell) el mas notable porque **tampoco tiene analogo en dimension 3**.

### 1.4 Notacion de Schlafli {p,q,r}

La **notacion de Schlafli** codifica la estructura recursiva de un politopo regular. Para un 4-politopo, el simbolo es $\{p, q, r\}$ donde:

- $p$ = numero de lados de cada **cara** (poligono 2D).
- $\{p, q\}$ = simbolo de Schlafli de cada **celda** (poliedro 3D que forma la frontera).
- $\{q, r\}$ = simbolo de Schlafli de la **figura de vertice** (poliedro que describe la vecindad de cada vertice).

Por ejemplo, el teseracto $\{4, 3, 3\}$ tiene:
- Caras cuadradas ($p = 4$).
- Celdas cubicas $\{4, 3\}$ (cubos).
- Figura de vertice tetraedrica $\{3, 3\}$ (3 cubos se encuentran en cada vertice formando un tetraedro).

Los 6 simbolos de Schlafli para los 4-politopos regulares son:

| Politopo | Schlafli | Caras | Celdas | Fig. vertice |
|----------|----------|-------|--------|--------------|
| Pentacoro | $\{3,3,3\}$ | Triangulos $\{3\}$ | Tetraedros $\{3,3\}$ | Tetraedros $\{3,3\}$ |
| Teseracto | $\{4,3,3\}$ | Cuadrados $\{4\}$ | Cubos $\{4,3\}$ | Tetraedros $\{3,3\}$ |
| Hexadecacoro | $\{3,3,4\}$ | Triangulos $\{3\}$ | Tetraedros $\{3,3\}$ | Octaedros $\{3,4\}$ |
| Icositetracoro | $\{3,4,3\}$ | Triangulos $\{3\}$ | Octaedros $\{3,4\}$ | Cubos $\{4,3\}$ |
| Hecatonicosacoro | $\{5,3,3\}$ | Pentagonos $\{5\}$ | Dodecaedros $\{5,3\}$ | Tetraedros $\{3,3\}$ |
| Hexacosicoro | $\{3,3,5\}$ | Triangulos $\{3\}$ | Tetraedros $\{3,3\}$ | Icosaedros $\{3,5\}$ |

---

## 2. Los 6 Politopos Regulares en 4D

### 2.1 Pentacoro (5-cell) $\{3,3,3\}$

**Nombre sistematico:** 5-celdas | **Analogo 3D:** Tetraedro | **Familia:** Simplex regular

#### Datos combinatorios

| Elemento | Cantidad | Tipo |
|----------|----------|------|
| Vertices ($V$) | 5 | Puntos |
| Aristas ($E$) | 10 | Segmentos |
| Caras ($F$) | 10 | Triangulos equilateros |
| Celdas ($C$) | 5 | Tetraedros regulares |

#### Descripcion

El pentacoro es el **simplex 4-dimensional**: el politopo mas simple posible en 4D. Asi como un tetraedro es la union de 4 puntos en posicion general en $\mathbb{R}^3$ (ningun trio colineal, ningun cuarteto coplanar), el pentacoro es la union de 5 puntos en posicion general en $\mathbb{R}^4$.

Cada par de vertices esta conectado por una arista — el pentacoro es el **grafo completo** $K_5$. Cada trio de vertices forma una cara triangular, y cada cuarteto de vertices forma una celda tetraedrica.

#### Auto-dualidad

El pentacoro es **auto-dual**: su dual (intercambiando vertices por celdas y aristas por caras) es otro pentacoro. Esto se verifica porque $V = C = 5$ y $E = F = 10$.

#### Coordenadas

Una eleccion conveniente de coordenadas para los 5 vertices del pentacoro unitario en $\mathbb{R}^4$ es:

$$v_1 = \left(\frac{1}{\sqrt{10}},\; \frac{1}{\sqrt{6}},\; \frac{1}{\sqrt{3}},\; 1\right)$$

$$v_2 = \left(\frac{1}{\sqrt{10}},\; \frac{1}{\sqrt{6}},\; \frac{1}{\sqrt{3}},\; -1\right)$$

$$v_3 = \left(\frac{1}{\sqrt{10}},\; \frac{1}{\sqrt{6}},\; \frac{-2}{\sqrt{3}},\; 0\right)$$

$$v_4 = \left(\frac{1}{\sqrt{10}},\; \frac{-3}{\sqrt{6}},\; 0,\; 0\right)$$

$$v_5 = \left(\frac{-4}{\sqrt{10}},\; 0,\; 0,\; 0\right)$$

Alternativamente, una version mas simetrica usa las coordenadas de la base canonica aumentada:

$$v_i = e_i \quad (i = 1, \ldots, 5) \quad \text{en } \mathbb{R}^5, \text{ proyectados al hiperplano } \sum x_i = 1$$

#### Grupo de simetria

El grupo de simetria del pentacoro es el **grupo simetrico** $S_5$, con $|S_5| = 120$ elementos. Cualquier permutacion de los 5 vertices es una simetria del politopo, ya que todos los pares son equivalentes.

---

### 2.2 Teseracto (Tesseract) $\{4,3,3\}$

**Nombre sistematico:** 8-celdas, hipercubo | **Analogo 3D:** Cubo | **Familia:** Hipercubos ($\gamma_n$)

#### Datos combinatorios

| Elemento | Cantidad | Tipo |
|----------|----------|------|
| Vertices ($V$) | 16 | Puntos |
| Aristas ($E$) | 32 | Segmentos |
| Caras ($F$) | 24 | Cuadrados |
| Celdas ($C$) | 8 | Cubos |

#### Descripcion

El teseracto es el **hipercubo 4-dimensional**: la generalizacion del cuadrado (2D) y del cubo (3D) a la cuarta dimension. Se construye conceptualmente **extruyendo un cubo** en la direccion de la cuarta dimension $w$:

1. Tomar un cubo en $\mathbb{R}^3$ con $w = -1$.
2. Crear una copia identica con $w = +1$.
3. Conectar cada vertice del primer cubo con el vertice correspondiente del segundo cubo.

Este proceso genera 8 vertices nuevos (los del segundo cubo), 12 aristas nuevas (las conexiones), 6 caras nuevas (las que unen aristas correspondientes) y un cubo nuevo (el "tubo" lateral).

#### Coordenadas

Los 16 vertices del teseracto unitario tienen coordenadas:

$$(\pm 1, \pm 1, \pm 1, \pm 1)$$

Es decir, todas las combinaciones posibles de $+1$ y $-1$ en cuatro coordenadas. La distancia entre vertices adyacentes (los que difieren en exactamente una coordenada) es $2$.

#### Dual: el hexadecacoro (16-cell)

El dual del teseracto es el hexadecacoro $\{3,3,4\}$. Al colocar un vertice en el centro de cada celda del teseracto y conectar los vertices de celdas adyacentes, obtenemos un 16-cell.

#### La red del teseracto y el arte de Dali

La **red** (net) del teseracto es un desplegado tridimensional formado por 8 cubos. La disposicion mas conocida es la **cruz de Dali**: un cubo central rodeado por 4 cubos adyacentes en los lados, mas un cubo arriba y otro abajo. Salvador Dali utilizo esta red en su famosa obra *Corpus Hypercubus* (1954), donde Cristo esta crucificado sobre un desplegado del teseracto, simbolizando la trascendencia a una dimension superior.

```
        +---+
        | 5 |
    +---+---+---+---+
    | 2 | 1 | 4 | 8 |
    +---+---+---+---+
        | 3 |
        +---+
        | 6 |
        +---+
        | 7 |
        +---+

Red del teseracto (cruz de 8 cubos)
Cubo 1: central
Cubos 2,3,4,5: laterales
Cubos 6,7: extremos inferiores
Cubo 8: extremo lateral
```

En realidad, existen **261** redes distintas del teseracto (sin contar reflexiones), a diferencia de la unica red (en forma de cruz) del cubo con 11 variantes.

#### Grupo de simetria

El grupo de simetria del teseracto es el **grupo hiperoctaedrico** $B_4$, con $|B_4| = 2^4 \cdot 4! = 384$ elementos. Incluye permutaciones de coordenadas y cambios de signo independientes.

---

### 2.3 Hexadecacoro (16-cell) $\{3,3,4\}$

**Nombre sistematico:** 16-celdas | **Analogo 3D:** Octaedro | **Familia:** Ortoplex ($\beta_n$, cross-polytope)

#### Datos combinatorios

| Elemento | Cantidad | Tipo |
|----------|----------|------|
| Vertices ($V$) | 8 | Puntos |
| Aristas ($E$) | 24 | Segmentos |
| Caras ($F$) | 32 | Triangulos equilateros |
| Celdas ($C$) | 16 | Tetraedros regulares |

#### Descripcion

El hexadecacoro es el **ortoplex 4-dimensional** (cross-polytope): la generalizacion del octaedro. Se construye tomando los 8 puntos situados a distancia unitaria del origen sobre los 4 ejes coordenados, en ambas direcciones.

#### Coordenadas

Los 8 vertices son las permutaciones de $(\pm 1, 0, 0, 0)$:

$$\pm e_1 = (\pm 1, 0, 0, 0), \quad \pm e_2 = (0, \pm 1, 0, 0), \quad \pm e_3 = (0, 0, \pm 1, 0), \quad \pm e_4 = (0, 0, 0, \pm 1)$$

Dos vertices estan conectados por una arista si y solo si no son **antipodales** (es decir, su suma no es el vector cero). Esto genera $\binom{8}{2} - 4 = 28 - 4 = 24$ aristas.

#### Dual: el teseracto

El dual del hexadecacoro es el teseracto $\{4,3,3\}$. La relacion de dualidad intercambia:

$$8 \text{ vertices} \longleftrightarrow 8 \text{ celdas (cubos del teseracto)}$$
$$24 \text{ aristas} \longleftrightarrow 24 \text{ caras (cuadrados del teseracto)}$$
$$32 \text{ caras} \longleftrightarrow 32 \text{ aristas (del teseracto)}$$
$$16 \text{ celdas} \longleftrightarrow 16 \text{ vertices (del teseracto)}$$

#### Construccion alternativa

El hexadecacoro puede construirse como la **interseccion de dos teseractos** rotados 45 grados uno respecto del otro, reescalados apropiadamente. Equivalentemente, es la envolvente convexa de los vertices $(\pm 1, 0, 0, 0)$ y permutaciones.

#### Grupo de simetria

Comparte el grupo hiperoctaedrico $B_4$ con el teseracto: $|B_4| = 384$, ya que son duales.

---

### 2.4 Icositetracoro (24-cell) $\{3,4,3\}$

**Nombre sistematico:** 24-celdas | **Analogo 3D:** **Ninguno** | **Familia:** Unico en 4D

#### Datos combinatorios

| Elemento | Cantidad | Tipo |
|----------|----------|------|
| Vertices ($V$) | 24 | Puntos |
| Aristas ($E$) | 96 | Segmentos |
| Caras ($F$) | 96 | Triangulos equilateros |
| Celdas ($C$) | 24 | Octaedros regulares |

#### El politopo mas misterioso

El icositetracoro es sin duda el objeto mas fascinante entre los 6 politopos regulares en 4D, por una razon fundamental: **no tiene analogo en ninguna otra dimension**. En 3D existen 5 solidos platonicos; en 5D y superiores, solo 3. Pero en 4D existen 6 porque aparecen 3 politopos excepcionales, y el icositetracoro es el unico de los 6 que no puede entenderse como "la version 4D" de algun solido platonico.

Es, ademas, **auto-dual**: su dual es otro icositetracoro, ya que $V = C = 24$ y $E = F = 96$.

#### Coordenadas

Los 24 vertices del icositetracoro se dividen en dos grupos:

**Grupo 1 — Vertices del hexadecacoro** (8 vertices):
$$(\pm 1, 0, 0, 0), \quad (0, \pm 1, 0, 0), \quad (0, 0, \pm 1, 0), \quad (0, 0, 0, \pm 1)$$

**Grupo 2 — Vertices del teseracto reescalado** (16 vertices):
$$\left(\pm \frac{1}{2}, \pm \frac{1}{2}, \pm \frac{1}{2}, \pm \frac{1}{2}\right)$$

(todas las combinaciones de signos). Estos 16 puntos forman un teseracto de arista $1$ inscrito en la misma esfera.

Equivalentemente, los 24 vertices son todas las permutaciones con signo de:

$$(\pm 1, 0, 0, 0) \quad \text{y} \quad \left(\pm\tfrac{1}{2}, \pm\tfrac{1}{2}, \pm\tfrac{1}{2}, \pm\tfrac{1}{2}\right)$$

todos a distancia $1$ del origen.

#### Conexion con los cuaterniones

Los 24 vertices del icositetracoro, interpretados como **cuaterniones unitarios**, forman el **grupo binario tetraedrico** $2T$ de orden 24. Multiplicados como cuaterniones, estan cerrados bajo la operacion de producto — forman un subgrupo de los cuaterniones unitarios $S^3$. Esto conecta la geometria del icositetracoro con el algebra y la teoria de grupos de manera profunda.

Los 24 cuaterniones son los **cuaterniones de Hurwitz**: $\{\pm 1, \pm i, \pm j, \pm k, \frac{1}{2}(\pm 1 \pm i \pm j \pm k)\}$.

#### Estructura celular

Cada celda es un octaedro regular. Alrededor de cada vertice se encuentran 8 octaedros dispuestos como las caras de un cubo — la **figura de vertice** es precisamente un cubo $\{4,3\}$.

#### Grupo de simetria

El grupo de simetria del icositetracoro tiene $|G| = 1152$ elementos, que es $3 \times 384$ (tres veces el grupo del teseracto). Esto refleja el hecho de que el 24-cell contiene 3 hexadecacoros (16-cells) mutuamente inscritos.

---

### 2.5 Hecatonicosacoro (120-cell) $\{5,3,3\}$

**Nombre sistematico:** 120-celdas | **Analogo 3D:** Dodecaedro | **Familia:** Politopos excepcionales

#### Datos combinatorios

| Elemento | Cantidad | Tipo |
|----------|----------|------|
| Vertices ($V$) | 600 | Puntos |
| Aristas ($E$) | 1200 | Segmentos |
| Caras ($F$) | 720 | Pentagonos regulares |
| Celdas ($C$) | 120 | Dodecaedros regulares |

#### Descripcion

El hecatonicosacoro es el analogo 4D del dodecaedro: un politopo cuyas celdas son dodecaedros regulares (poliedros con 12 caras pentagonales). Es el mas grande de los 6 politopos regulares en terminos de numero de celdas, y uno de los mas complejos de visualizar.

#### Relacion con la proporcion aurea

La proporcion aurea $\varphi = \frac{1 + \sqrt{5}}{2} \approx 1.618$ impregna la estructura del hecatonicosacoro, al igual que impregna la del dodecaedro e icosaedro en 3D. Las coordenadas de sus 600 vertices involucran potencias de $\varphi$ y sus conjugados $\hat{\varphi} = \frac{1 - \sqrt{5}}{2}$.

Un subconjunto de las coordenadas de los vertices incluye todas las permutaciones pares de:

$$\left(0, 0, \pm 2, \pm 2\right), \quad \left(\pm 1, \pm 1, \pm 1, \pm\sqrt{5}\right), \quad \left(\pm\varphi^{-1}, \pm\varphi^{-1}, \pm\varphi^{-1}, \pm\varphi^2\right)$$

$$\left(\pm\varphi^{-2}, \pm\varphi, \pm\varphi, \pm\varphi\right), \quad \left(\pm\varphi^{-1}, \pm\varphi^{-1}, \pm\varphi, \pm\sqrt{5}\right)$$

y muchas mas familias que involucran combinaciones de $\varphi$, $\varphi^2$, $\varphi^{-1}$ y $\sqrt{5}$.

#### Dual: el hexacosicoro (600-cell)

El dual del hecatonicosacoro es el hexacosicoro $\{3,3,5\}$. La dualidad intercambia:

$$600 \text{ vertices} \longleftrightarrow 600 \text{ celdas (tetraedros del 600-cell)}$$
$$120 \text{ celdas (dodecaedros)} \longleftrightarrow 120 \text{ vertices (del 600-cell)}$$

#### Figura de vertice

La figura de vertice del hecatonicosacoro es un **tetraedro** $\{3,3\}$: en cada vertice se encuentran exactamente 4 dodecaedros. Esto es analogo a como en el dodecaedro 3D, cada vertice es compartido por 3 pentagonos.

#### Grupo de simetria

El grupo de simetria tiene $|G| = 14400$ elementos, que es $120 \times 120$ o equivalentemente $|S_5|^2$. Es uno de los grupos de reflexion finitos mas ricos.

---

### 2.6 Hexacosicoro (600-cell) $\{3,3,5\}$

**Nombre sistematico:** 600-celdas | **Analogo 3D:** Icosaedro | **Familia:** Politopos excepcionales

#### Datos combinatorios

| Elemento | Cantidad | Tipo |
|----------|----------|------|
| Vertices ($V$) | 120 | Puntos |
| Aristas ($E$) | 720 | Segmentos |
| Caras ($F$) | 1200 | Triangulos equilateros |
| Celdas ($C$) | 600 | Tetraedros regulares |

#### Descripcion

El hexacosicoro es el analogo 4D del icosaedro: un politopo denso formado por 600 tetraedros regulares. Es el politopo regular 4D con mayor numero de celdas (600) y caras (1200), y su visualizacion proyectada en 3D produce figuras de extraordinaria belleza y complejidad.

#### Coordenadas basadas en la proporcion aurea

Los 120 vertices del hexacosicoro pueden construirse a partir de la proporcion aurea $\varphi = \frac{1+\sqrt{5}}{2}$ y su recíproco $\varphi^{-1} = \varphi - 1$. Los vertices se organizan en varios grupos:

**Grupo 1** — 8 vertices del hexadecacoro:
$$(\pm 1, 0, 0, 0) \quad \text{y permutaciones}$$

**Grupo 2** — 16 vertices del teseracto:
$$\left(\pm\tfrac{1}{2}, \pm\tfrac{1}{2}, \pm\tfrac{1}{2}, \pm\tfrac{1}{2}\right)$$

**Grupo 3** — 96 vertices con proporcion aurea:
Todas las permutaciones pares de:
$$\frac{1}{2}\left(\pm\varphi, \pm 1, \pm\varphi^{-1}, 0\right)$$

Los 24 vertices de los grupos 1 y 2 forman un icositetracoro inscrito, y los 96 vertices restantes completan la estructura.

#### Relacion con los cuaterniones icosaedricos

Los 120 vertices del hexacosicoro, interpretados como cuaterniones unitarios, forman el **grupo binario icosaedrico** $2I$ de orden 120. Este grupo es una extension doble del grupo de rotaciones del icosaedro $A_5$ y esta intimamente conectado con la resolucion de la ecuacion de quinto grado.

#### Figura de vertice

La figura de vertice del hexacosicoro es un **icosaedro** $\{3,5\}$: en cada vertice convergen 12 aristas y 20 tetraedros, dispuestos como las caras de un icosaedro.

#### Dual: el hecatonicosacoro (120-cell)

El dual del hexacosicoro es el hecatonicosacoro. Cada uno de los 600 tetraedros se convierte en un vertice, y cada uno de los 120 vertices se convierte en un dodecaedro.

#### Grupo de simetria

Comparte el grupo de simetria con el hecatonicosacoro: $|G| = 14400$.

---

### Tabla resumen de los 6 politopos

| Politopo | Schlafli | $V$ | $E$ | $F$ | $C$ | Tipo cara | Tipo celda | Dual |
|----------|----------|-----|-----|-----|-----|-----------|------------|------|
| Pentacoro | $\{3,3,3\}$ | 5 | 10 | 10 | 5 | $\triangle$ | Tetraedro | Si mismo |
| Teseracto | $\{4,3,3\}$ | 16 | 32 | 24 | 8 | $\square$ | Cubo | 16-cell |
| Hexadecacoro | $\{3,3,4\}$ | 8 | 24 | 32 | 16 | $\triangle$ | Tetraedro | Teseracto |
| Icositetracoro | $\{3,4,3\}$ | 24 | 96 | 96 | 24 | $\triangle$ | Octaedro | Si mismo |
| Hecatonicosacoro | $\{5,3,3\}$ | 600 | 1200 | 720 | 120 | $\pentagon$ | Dodecaedro | 600-cell |
| Hexacosicoro | $\{3,3,5\}$ | 120 | 720 | 1200 | 600 | $\triangle$ | Tetraedro | 120-cell |

---

## 3. Proyeccion 4D a 3D

### 3.1 El problema fundamental: como "ver" 4 dimensiones

Nosotros habitamos un espacio tridimensional y nuestra retina es una superficie bidimensional. Cuando "vemos" un cubo, en realidad estamos viendo su **proyeccion 2D** (la imagen retiniana), y nuestro cerebro reconstruye la estructura 3D usando pistas como la perspectiva, la oclusion y el sombreado.

Para visualizar un objeto 4D, necesitamos realizar una **doble proyeccion**:

$$\text{4D} \xrightarrow{\text{proyeccion 4D} \to \text{3D}} \text{3D} \xrightarrow{\text{renderizado 3D} \to \text{2D (pantalla)}} \text{2D}$$

PolytopeXD realiza la primera proyeccion ($4D \to 3D$) matematicamente, y delega la segunda ($3D \to 2D$) al motor de renderizado Three.js.

La analogia dimensional es poderosa: un ser 2D intentando comprender un cubo es exactamente analogo a nosotros intentando comprender un teseracto. La "sombra" de un cubo sobre un plano produce un hexagono o un cuadrado dentro de otro cuadrado, dependiendo de la orientacion. Similarmente, la "sombra" de un teseracto sobre el espacio 3D produce un cubo dentro de otro cubo (el **rombododecaedro** o la proyeccion cubica segun la orientacion).

### 3.2 Proyeccion en perspectiva

La **proyeccion en perspectiva** desde 4D a 3D simula la vision desde un punto situado a distancia $d$ en la direccion $w$:

$$\text{factor} = \frac{d}{d + w}$$

Las coordenadas proyectadas son:

$$x' = x \cdot \text{factor} = x \cdot \frac{d}{d + w}$$

$$y' = y \cdot \text{factor} = y \cdot \frac{d}{d + w}$$

$$z' = z \cdot \text{factor} = z \cdot \frac{d}{d + w}$$

Este es el analogo exacto de la proyeccion perspectiva 3D-a-2D que usamos en fotografia y renderizado:

$$x_{2D} = x_{3D} \cdot \frac{f}{f + z_{3D}}$$

donde $f$ es la distancia focal.

**Propiedades de la proyeccion en perspectiva:**
- Los objetos con $w$ mayor (mas "lejanos" en la 4a dimension) aparecen **mas pequenos**.
- El factor tiende a 1 cuando $d \to \infty$ (proyeccion paralela/ortografica).
- El factor diverge cuando $w \to -d$ (el objeto esta en el "centro de proyeccion").
- Las lineas rectas en 4D se proyectan como lineas rectas en 3D.

### 3.3 Proyeccion estereografica

La **proyeccion estereografica** es una alternativa que preserva los angulos (es **conforme**). Se aplica proyectando desde un polo de la 3-esfera $S^3$ en la que estan inscritos los vertices:

$$\text{escala} = \frac{d}{d - w}$$

Las coordenadas proyectadas son:

$$x' = x \cdot \frac{d}{d - w}, \quad y' = y \cdot \frac{d}{d - w}, \quad z' = z \cdot \frac{d}{d - w}$$

**Propiedades de la proyeccion estereografica:**
- Es **conforme**: preserva los angulos locales (las celdas mantienen sus angulos diedricos).
- Las esferas en 4D se proyectan como esferas en 3D (las aristas se curvan).
- El polo de proyeccion ($w = d$) se envia al infinito.
- Las celdas cercanas al polo aparecen enormes y distorsionadas; las lejanas, comprimidas.

### 3.4 Comparacion de ambos metodos

| Propiedad | Perspectiva | Estereografica |
|-----------|-------------|----------------|
| Formula | $\frac{d}{d + w}$ | $\frac{d}{d - w}$ |
| Preserva angulos | No | **Si** (conforme) |
| Preserva lineas rectas | **Si** | No (las curva) |
| Celdas lejanas en $w$ | Se encogen | Se encogen |
| Intuicion | Como una "foto" 4D | Como un "mapa" esferico |
| Mejor para | Estructura global, aristas | Simetria local, angulos |

En PolytopeXD, se puede alternar entre ambas proyecciones para obtener perspectivas complementarias del mismo politopo.

### 3.5 Distancia de vision y su efecto

El parametro $d$ (distancia de vision 4D) controla el grado de "perspectiva":

| Valor de $d$ | Efecto |
|---------------|--------|
| $d = 2$ | Perspectiva extrema: gran diferencia de tamano entre partes cercanas y lejanas |
| $d = 3$ | Perspectiva moderada: buen equilibrio entre profundidad y visibilidad |
| $d = 5$ | Perspectiva suave: las celdas son mas similares en tamano |
| $d \to \infty$ | Proyeccion paralela: sin perspectiva, las celdas lejanas tienen el mismo tamano que las cercanas |

La distancia ideal depende del politopo: para el teseracto, $d \approx 3$ produce el clasico "cubo dentro de cubo". Para el 600-cell, valores mayores ($d \approx 5$) ayudan a ver la estructura interna sin que las celdas exteriores dominen la vista.

---

## 4. Rotaciones en 4D

### 4.1 Planos de rotacion (no ejes como en 3D)

En 3D, una rotacion se especifica por un **eje** (una linea) y un angulo. La rotacion gira todos los puntos alrededor de ese eje. Los puntos sobre el eje permanecen fijos.

En 4D, la situacion es fundamentalmente diferente. Una rotacion se especifica por un **plano de rotacion** y un angulo. Los puntos en el plano complementario (perpendicular al plano de rotacion) permanecen fijos. Esto es porque en 4D, el complemento ortogonal de un plano (2D) es otro plano (2D), no una linea.

**Analogia dimensional:**

| Dimension | Rotacion definida por | Puntos fijos |
|-----------|----------------------|--------------|
| 2D | Un punto (centro) | 0-dimensional |
| 3D | Un eje (linea) | 1-dimensional |
| **4D** | **Un plano** | **2-dimensional (otro plano)** |
| $n$D | Un $(n-2)$-plano | $(n-2)$-dimensional |

### 4.2 Los 6 planos de rotacion: XY, XZ, XW, YZ, YW, ZW

En $\mathbb{R}^4$, existen $\binom{4}{2} = 6$ planos coordenados fundamentales:

| Plano | Coordenadas rotadas | Coordenadas fijas |
|-------|--------------------|--------------------|
| $XY$ | $(x, y)$ | $(z, w)$ |
| $XZ$ | $(x, z)$ | $(y, w)$ |
| $XW$ | $(x, w)$ | $(y, z)$ |
| $YZ$ | $(y, z)$ | $(x, w)$ |
| $YW$ | $(y, w)$ | $(x, z)$ |
| $ZW$ | $(z, w)$ | $(x, y)$ |

Las rotaciones en los planos $XY$, $XZ$ y $YZ$ son las rotaciones 3D habituales (no afectan la coordenada $w$). Las rotaciones en planos que involucran $W$ ($XW$, $YW$, $ZW$) son genuinamente 4-dimensionales: mezclan las coordenadas espaciales con la cuarta dimension, produciendo los efectos de "inversion" y "paso a traves" que hacen tan fascinante la geometria 4D.

### 4.3 Matrices de rotacion 4D

Una rotacion en el plano $XW$ por un angulo $\theta$ se representa como la matriz $4 \times 4$:

$$R_{XW}(\theta) = \begin{pmatrix} \cos\theta & 0 & 0 & -\sin\theta \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ \sin\theta & 0 & 0 & \cos\theta \end{pmatrix}$$

Analogamente, la rotacion en el plano $YW$ por un angulo $\phi$:

$$R_{YW}(\phi) = \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & \cos\phi & 0 & -\sin\phi \\ 0 & 0 & 1 & 0 \\ 0 & \sin\phi & 0 & \cos\phi \end{pmatrix}$$

Y la rotacion en el plano $ZW$ por un angulo $\psi$:

$$R_{ZW}(\psi) = \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & \cos\psi & -\sin\psi \\ 0 & 0 & \sin\psi & \cos\psi \end{pmatrix}$$

Las rotaciones en planos 3D ($XY$, $XZ$, $YZ$) tienen la forma habitual con la cuarta fila y columna como identidad.

### 4.4 Composicion de rotaciones

Una rotacion general en 4D se obtiene componiendo (multiplicando) rotaciones elementales. A diferencia de 3D, el grupo de rotaciones $SO(4)$ tiene dimension $\binom{4}{2} = 6$ (frente a dimension 3 para $SO(3)$). Una rotacion general en 4D requiere hasta 6 parametros angulares.

La composicion se realiza por multiplicacion de matrices:

$$R_{\text{total}} = R_{XY}(\alpha) \cdot R_{XZ}(\beta) \cdot R_{XW}(\gamma) \cdot R_{YZ}(\delta) \cdot R_{YW}(\epsilon) \cdot R_{ZW}(\zeta)$$

En PolytopeXD, la rotacion interactiva permite especificar angulos en los 6 planos independientemente, o usar una auto-rotacion que combina varias simultaneamente.

### 4.5 Fenomenos sin analogia 3D: rotacion doble

El fenomeno mas sorprendente de las rotaciones 4D es la **rotacion doble** (o **rotacion isoclina**). En 3D, toda rotacion tiene un eje fijo (teorema de Euler). En 4D, es posible realizar una rotacion que **no deja fijo ningun punto** (excepto el origen):

$$R_{\text{doble}}(\theta, \phi) = R_{XY}(\theta) \cdot R_{ZW}(\phi)$$

Esta rotacion gira simultaneamente en dos planos completamente perpendiculares. Cuando $\theta = \phi$, la rotacion se llama **isoclina izquierda**; cuando $\theta = -\phi$, **isoclina derecha**.

Una rotacion isoclina mueve **todos** los puntos (excepto el origen) a lo largo de circulos, pero estos circulos estan entrelazados de manera que no existe un plano 2D globalmente fijo. En PolytopeXD, activar la rotacion doble sobre un teseracto produce un efecto hipnotico: todas las celdas se mueven simultaneamente sin que ninguna parezca permanecer en su lugar.

**Propiedad notable:** El grupo $SO(4)$ es localmente isomorfo a $SO(3) \times SO(3)$ (a diferencia de $SO(n)$ para $n \neq 4$, que es simple). Esto es una peculiaridad de la dimension 4 y esta directamente relacionado con la descomposicion de rotaciones 4D en pares de rotaciones 3D mediante cuaterniones.

---

## 5. Secciones Transversales (Hiperplanos)

### 5.1 Analogia: cortando un cubo 3D con un plano 2D

Para comprender las secciones de un 4-politopo, consideremos primero la analogia mas familiar: cortar un cubo con un plano.

Si cortamos un cubo unitario con un plano horizontal a diferentes alturas $z = t$:

| Valor de $t$ | Seccion |
|---------------|---------|
| $t < 0$ o $t > 1$ | Vacia |
| $t = 0$ | Cuadrado (cara inferior) |
| $0 < t < 1$ | Cuadrado (mismo tamano) |
| $t = 1$ | Cuadrado (cara superior) |

Si en cambio cortamos con un plano diagonal (por ejemplo, $x + y + z = c$):

| Valor de $c$ | Seccion |
|---------------|---------|
| $c = 0$ | Punto (vertice) |
| $c = 0.5$ | Triangulo equilatero |
| $c = 1.5$ | Hexagono regular |
| $c = 3$ | Punto (vertice opuesto) |

Aparecen formas inesperadas (un **hexagono** al cortar un cubo). De manera similar, al cortar un 4-politopo con un hiperplano, pueden aparecer poliedros inesperados.

### 5.2 Cortando un politopo 4D con un hiperplano 3D

Un **hiperplano** en $\mathbb{R}^4$ es un subespacio afin de dimension 3, definido por una ecuacion lineal:

$$\mathbf{n} \cdot \mathbf{x} = c \quad \Longleftrightarrow \quad n_x \cdot x + n_y \cdot y + n_z \cdot z + n_w \cdot w = c$$

donde $\mathbf{n}$ es el vector normal al hiperplano y $c$ determina su posicion. La **seccion transversal** es la interseccion del politopo con este hiperplano, que generalmente produce un **poliedro 3D**.

Por ejemplo, cortando un teseracto con el hiperplano $w = t$ para $t \in [-1, 1]$:

| Valor de $t$ | Seccion |
|---------------|---------|
| $t = -1$ | Cubo (celda inferior) |
| $-1 < t < 1$ | Cubo (del mismo tamano, $2 \times 2 \times 2$) |
| $t = 1$ | Cubo (celda superior) |

Esto tiene sentido: un teseracto es un "cubo extruido" en la direccion $w$, asi que cortarlo perpendicularmente a $w$ siempre da un cubo.

### 5.3 Algoritmo de interseccion arista-hiperplano

Para calcular la seccion computacionalmente, PolytopeXD utiliza el siguiente algoritmo para cada arista del politopo:

Dada una arista con vertices $\mathbf{a}$ y $\mathbf{b}$ y un hiperplano $\mathbf{n} \cdot \mathbf{x} = c$:

1. Calcular los valores con signo:
   $$d_a = \mathbf{n} \cdot \mathbf{a} - c, \quad d_b = \mathbf{n} \cdot \mathbf{b} - c$$

2. Si $d_a$ y $d_b$ tienen **signos opuestos** (o alguno es cero), la arista cruza el hiperplano.

3. El punto de interseccion se calcula por **interpolacion lineal**:
   $$t = \frac{d_a}{d_a - d_b}, \quad \mathbf{p} = \mathbf{a} + t(\mathbf{b} - \mathbf{a}) = (1-t)\mathbf{a} + t\mathbf{b}$$

4. El punto $\mathbf{p}$ se proyecta a 3D (eliminando la componente en la direccion de $\mathbf{n}$ o aplicando la proyeccion 4D-a-3D).

Los puntos de interseccion obtenidos forman los vertices de un poliedro 3D. Para reconstruir las caras de este poliedro, se utilizan las caras del 4-politopo original: cada cara triangular o cuadrada cortada por el hiperplano produce una arista del poliedro seccion.

### 5.4 Tipos de corte: W, Vertice, Arista, Diagonal

PolytopeXD ofrece cuatro direcciones de corte, cada una con un vector normal $\mathbf{n}$ diferente:

| Tipo | Normal $\mathbf{n}$ | Descripcion |
|------|---------------------|-------------|
| **W** (estandar) | $(0, 0, 0, 1)$ | Corta perpendicularmente a la 4a dimension |
| **Vertice** | $\frac{1}{2}(1, 1, 1, 1)$ | Corta en la direccion de un vertice del teseracto |
| **Arista** | $\frac{1}{\sqrt{2}}(1, 1, 0, 0)$ | Corta en la direccion de una arista |
| **Diagonal** | $\frac{1}{\sqrt{3}}(1, 1, 1, 0)$ | Corta en la direccion de una diagonal de cara |

Cada direccion revela diferentes simetrias ocultas del politopo. Por ejemplo:
- Cortando el teseracto con el plano $w = 0$ se obtiene siempre un cubo.
- Cortando el teseracto con la diagonal del vertice $x + y + z + w = 0$ en la posicion adecuada se obtiene un **octaedro regular** — una forma que no es celda del teseracto pero emerge de su estructura interna.

### 5.5 Analisis de la seccion: area, perimetro, regularidad

Para cada seccion calculada, PolytopeXD puede determinar:

- **Numero de vertices** del poliedro seccion.
- **Numero de aristas** y **caras**.
- **Volumen** (por descomposicion en tetraedros).
- **Area superficial** (suma de areas de caras).
- **Tipo de poliedro**: si la seccion es un poliedro regular o semi-regular conocido.

Estas propiedades varian continuamente al desplazar el hiperplano, excepto en puntos criticos donde la topologia de la seccion cambia (al pasar por un vertice, arista o cara del politopo).

### 5.6 Secciones notables: que formas aparecen al cortar cada politopo

#### Secciones del teseracto $\{4,3,3\}$

| Direccion | Posicion | Seccion resultante |
|-----------|----------|-------------------|
| $W$ | Cualquiera en $[-1,1]$ | Cubo |
| Vertice | Centro | **Octaedro regular** |
| Vertice | Cerca del vertice | Tetraedro |
| Arista | Centro | Prisma hexagonal |

#### Secciones del hexadecacoro $\{3,3,4\}$

| Direccion | Posicion | Seccion resultante |
|-----------|----------|-------------------|
| $W$ | $t = 0$ (centro) | **Octaedro regular** |
| $W$ | $t \neq 0$ | Octaedro truncado o piramide |
| Vertice | Centro | Cuboctaedro |

#### Secciones del icositetracoro $\{3,4,3\}$

| Direccion | Posicion | Seccion resultante |
|-----------|----------|-------------------|
| $W$ | Centro | **Cuboctaedro** |
| Vertice | $1/3$ del camino | Cubo |
| Vertice | Centro | Cuboctaedro |

El icositetracoro produce secciones particularmente ricas, incluyendo cuboctaedros y octaedros truncados.

---

## 6. Celdas y Descomposicion

### 6.1 Que son las celdas de un 4-politopo

En la jerarquia de elementos de un politopo, las **celdas** son los elementos de dimension $n-1$ que forman la frontera:

| Dimension del politopo | Nombre de los elementos de frontera |
|------------------------|-------------------------------------|
| 2D (poligono) | Aristas (segmentos 1D) |
| 3D (poliedro) | **Caras** (poligonos 2D) |
| **4D (4-politopo)** | **Celdas** (poliedros 3D) |

Asi como un cubo tiene 6 caras cuadradas que forman su superficie, un teseracto tiene 8 celdas cubicas que forman su "hipersuperficie". Dos celdas adyacentes comparten una cara 2D, exactamente como dos caras adyacentes de un cubo comparten una arista.

La intuicion clave es: la frontera de un 4-politopo es un conjunto de poliedros 3D pegados entre si por sus caras, formando una **3-variedad cerrada** (una superficie tridimensional sin borde). Para el teseracto, esta hipersuperficie es un conjunto de 8 cubos que se pegan para formar un 3-toro topologico.

### 6.2 Explosion de celdas: visualizacion radial

Para visualizar todas las celdas de un 4-politopo simultaneamente, PolytopeXD utiliza una tecnica de **explosion radial**: cada celda se desplaza radialmente desde el centro del politopo, separandola de sus vecinas. El factor de explosion controla cuanto se separan:

- **Factor 0**: las celdas estan en su posicion original (superpuestas tras la proyeccion).
- **Factor 0.5**: separacion moderada; se distinguen las celdas individuales.
- **Factor 1**: separacion completa; las celdas flotan individualmente.

Matematicamente, si el centroide del politopo es $\mathbf{c}$ y el centroide de una celda es $\mathbf{g}_i$, la celda se desplaza por:

$$\mathbf{g}'_i = \mathbf{g}_i + f \cdot (\mathbf{g}_i - \mathbf{c})$$

donde $f$ es el factor de explosion.

### 6.3 Navegacion celda a celda

PolytopeXD permite seleccionar y resaltar celdas individuales. Dos celdas son **adyacentes** si comparten una cara 2D. El grafo de adyacencia de celdas es el **grafo dual** del politopo, que tiene propiedades interesantes:

| Politopo | Celdas | Caras compartidas por celda | Grafo dual |
|----------|--------|-----------------------------|------------|
| Pentacoro | 5 tetraedros | 4 (cada cara) | $K_5$ (completo) |
| Teseracto | 8 cubos | 6 (cada cara del cubo con otra celda) | Grafo del hexadecacoro |
| Hexadecacoro | 16 tetraedros | 4 | Grafo del teseracto |
| Icositetracoro | 24 octaedros | 8 | Grafo del icositetracoro (auto-dual) |

Al navegar celda a celda, se puede recorrer este grafo dual y observar como las celdas se ensamblan para formar el politopo completo.

### 6.4 Celdas del pentacoro, teseracto, hexadecacoro y 24-cell

#### Pentacoro: 5 tetraedros

Cada celda es un tetraedro regular. Cada par de celdas comparte exactamente una cara triangular. Eliminando una celda, las 4 restantes forman la "superficie" visible: un tetraedro hueco con las caras abiertas mirando hacia afuera.

#### Teseracto: 8 cubos

Los 8 cubos del teseracto se pueden pensar como:
- 1 cubo "inferior" ($w = -1$, fijo en las 3 coordenadas espaciales).
- 1 cubo "superior" ($w = +1$).
- 6 cubos "laterales" (cada uno conecta una cara del cubo inferior con la correspondiente del superior).

En la proyeccion en perspectiva, el cubo "inferior" aparece grande (exterior) y el "superior" aparece pequeno (interior), con los 6 cubos laterales como frustums truncados entre ambos.

#### Hexadecacoro: 16 tetraedros

Los 16 tetraedros son mas dificiles de visualizar. Cada tetraedro conecta 4 de los 8 vertices, bajo la condicion de que ninguno de los 4 vertices sea antipodal a otro. La explosion de celdas revela una estructura de "estrella" con tetraedros apuntando en 16 direcciones distintas.

#### Icositetracoro: 24 octaedros

Los 24 octaedros se pueden dividir en 3 grupos de 8, donde cada grupo forma un hexadecacoro (16-cell). Es decir, el icositetracoro puede descomponerse como la **union de 3 hexadecacoros mutuamente inscritos**. Esta triple descomposicion es una de las propiedades mas elegantes del 24-cell.

---

## 7. Redes (Nets) y Desplegados

### 7.1 Analogia: red de un cubo (6 cuadrados en cruz)

Una **red** (net) de un poliedro 3D es un desplegado de sus caras en el plano 2D. Las caras se abren como las paginas de un libro, manteniendo las aristas de union, hasta que todas yacen en un mismo plano.

```
        +---+
        | T |  (Top / Arriba)
    +---+---+---+---+
    | I | F | D | B |  (Izquierda, Frente, Derecha, Detras)
    +---+---+---+---+
        | B |  (Bottom / Abajo)
        +---+

Red clasica de un cubo: 6 cuadrados en cruz
```

Un cubo tiene **11** redes distintas (sin contar reflexiones y rotaciones). Al plegar la red, los cuadrados se cierran alrededor de un espacio interior para formar el cubo.

### 7.2 Red del teseracto: la cruz de Dali (8 cubos)

De manera analoga, la **red de un 4-politopo** es un desplegado de sus celdas en el espacio 3D. Cada celda es un poliedro 3D, y la red las dispone de forma que comparten caras 2D, de manera que al "plegar" (en la 4a dimension) se cierra el 4-politopo.

La red mas famosa del teseracto es la **cruz de Dali**: 8 cubos dispuestos en forma de cruz tridimensional.

```
              +-------+
             /       /|
            / Cubo5 / |
           +-------+  |
           |       |  +
           |       | /
           |       |/
+-------+--+-------+--+-------+--+-------+
|       | /|       |\ |       | /|       |
| Cubo2 |/ | Cubo1 | \| Cubo4 |/ | Cubo8 |
+-------+  +-------+  +-------+  +-------+
           |       |  +
           |       | /|
           | Cubo3 |/ |
           +-------+  |
           |       |  +
           |       | /
           | Cubo6 |/
           +-------+
           |       |
           | Cubo7 |
           +-------+

Red del teseracto: 8 cubos en disposicion cruciforme
```

Los cubos se nombran segun su posicion:
- **Cubo 1**: central.
- **Cubos 2, 3, 4, 5**: adyacentes al central por las 4 caras cardinales.
- **Cubos 6, 7**: extension hacia abajo.
- **Cubo 8**: extension lateral.

Para plegar esta red en un teseracto, cada cubo se "dobla" en la cuarta dimension:
1. El Cubo 5 se pliega "hacia arriba" en $w$.
2. El Cubo 3 se pliega "hacia abajo" en $w$.
3. Los cubos laterales se pliegan en direcciones intermedias.
4. Los cubos extremos (6, 7, 8) continuan el plegado hasta cerrarse.

### 7.3 Plegado y desplegado: de la red 3D al politopo 4D

El proceso de plegado se puede parametrizar con un angulo $\alpha \in [0, \pi/2]$:

- $\alpha = 0$: red completamente desplegada (todos los cubos en $\mathbb{R}^3$).
- $\alpha = \pi/2$: teseracto completamente plegado (los cubos forman la hipersuperficie del teseracto en $\mathbb{R}^4$).

PolytopeXD anima este proceso, mostrando como los 8 cubos se cierran progresivamente. En estados intermedios ($0 < \alpha < \pi/2$), la figura no es ni completamente plana ni completamente cerrada, lo que permite ver como las celdas se conectan.

Formalmente, si la cara de union entre el cubo central y un cubo adyacente esta en el plano con normal $\hat{u}$ (en 3D), el plegado consiste en una rotacion del cubo adyacente por angulo $\alpha$ en el plano $(\hat{u}, \hat{w})$, donde $\hat{w}$ es la direccion de la cuarta dimension.

### 7.4 Salvador Dali y "Corpus Hypercubus" (1954)

En 1954, Salvador Dali pinto **Corpus Hypercubus** (Crucifixion), una de las obras mas celebres que conectan el arte con la matematica de dimensiones superiores. En la pintura, la figura de Cristo esta crucificada sobre un desplegado del teseracto — exactamente la red de 8 cubos en cruz que hemos descrito.

Dali estaba influenciado por las ideas de la cuarta dimension que circulaban en los circulos intelectuales de mediados del siglo XX. La eleccion del teseracto desplegado como cruz no es casual: simboliza la trascendencia del sufrimiento terrenal (3D) hacia una realidad superior (4D). La red del teseracto es una cruz 3D que, al plegarse, trasciende nuestro espacio.

El artista consulto a matematicos, incluyendo a Thomas Banchoff (geometra especializado en visualizacion 4D) durante la creacion de la obra. La precision geometrica de los 8 cubos en la pintura es matematicamente correcta.

La pintura se exhibe permanentemente en el **Metropolitan Museum of Art** de Nueva York.

---

## 8. Caracteristica de Euler Generalizada

### 8.1 Formula: $V - E + F - C = 0$ para 4-politopos

La **caracteristica de Euler** para poliedros convexos 3D establece:

$$V - E + F = 2$$

donde $V$ = vertices, $E$ = aristas, $F$ = caras.

Para 4-politopos convexos, la formula se generaliza agregando las celdas con signo alternante:

$$V - E + F - C = 0$$

donde $C$ = celdas (poliedros 3D que forman la frontera). El valor 0 es la caracteristica de Euler de la 3-esfera $S^3$ (que es la frontera de una 4-bola).

### 8.2 Verificacion para los 6 politopos

Verifiquemos la formula para cada uno de los 6 politopos regulares:

| Politopo | $V$ | $E$ | $F$ | $C$ | $V - E + F - C$ |
|----------|-----|-----|-----|-----|------------------|
| Pentacoro | 5 | 10 | 10 | 5 | $5 - 10 + 10 - 5 = 0$ |
| Teseracto | 16 | 32 | 24 | 8 | $16 - 32 + 24 - 8 = 0$ |
| Hexadecacoro | 8 | 24 | 32 | 16 | $8 - 24 + 32 - 16 = 0$ |
| Icositetracoro | 24 | 96 | 96 | 24 | $24 - 96 + 96 - 24 = 0$ |
| Hecatonicosacoro | 600 | 1200 | 720 | 120 | $600 - 1200 + 720 - 120 = 0$ |
| Hexacosicoro | 120 | 720 | 1200 | 600 | $120 - 720 + 1200 - 600 = 0$ |

En todos los casos, $V - E + F - C = 0$, confirmando la formula.

### 8.3 Generalizacion a $n$ dimensiones

La formula de Euler se generaliza a politopos convexos en $n$ dimensiones:

$$\sum_{k=0}^{n-1} (-1)^k f_k = 1 - (-1)^n$$

donde $f_k$ es el numero de $k$-caras (elementos de dimension $k$): $f_0 = V$, $f_1 = E$, $f_2 = F$, $f_3 = C$, etc.

Esto da:

| Dimension $n$ | Formula | Valor |
|---------------|---------|-------|
| 2 | $V - E = 0$ | 0 (para poligonos) |
| 3 | $V - E + F = 2$ | 2 |
| 4 | $V - E + F - C = 0$ | 0 |
| 5 | $V - E + F - C + H = 2$ | 2 |

El patron alterna entre 0 y 2. Para $n$ par, la caracteristica es 0; para $n$ impar, es 2. Esto refleja la caracteristica de Euler de la esfera $S^{n-1}$:

$$\chi(S^{n-1}) = 1 + (-1)^{n-1}$$

---

## 9. Dualidad en 4D

### 9.1 Concepto de dual: intercambio vertices y celdas

El **dual** de un politopo se construye colocando un vertice en el centro de cada celda (faceta de dimension maxima) y conectando dos vertices del dual cuando las celdas correspondientes comparten una cara. Esto produce un nuevo politopo donde:

- Los **vertices** del dual corresponden a las **celdas** del original.
- Las **celdas** del dual corresponden a los **vertices** del original.
- Las **aristas** del dual corresponden a las **caras** del original (y viceversa).

Formalmente, para un 4-politopo con $f$-vector $(V, E, F, C)$, su dual tiene $f$-vector $(C, F, E, V)$ — el vector invertido.

Si el original tiene simbolo de Schlafli $\{p, q, r\}$, su dual tiene simbolo $\{r, q, p\}$ — el simbolo invertido.

### 9.2 Parejas duales

Los 6 politopos regulares en 4D forman tres parejas bajo dualidad:

**Pareja 1: Teseracto $\{4,3,3\}$ y Hexadecacoro $\{3,3,4\}$**

| | Teseracto | Hexadecacoro |
|---|-----------|--------------|
| $V$ | 16 | 8 |
| $E$ | 32 | 24 |
| $F$ | 24 | 32 |
| $C$ | 8 | 16 |
| Celdas | Cubos $\{4,3\}$ | Tetraedros $\{3,3\}$ |

Los vertices del teseracto (16) corresponden a las celdas del hexadecacoro (16), y viceversa. Esta es la generalizacion de la dualidad cubo-octaedro en 3D.

**Pareja 2: Hecatonicosacoro $\{5,3,3\}$ y Hexacosicoro $\{3,3,5\}$**

| | 120-cell | 600-cell |
|---|----------|----------|
| $V$ | 600 | 120 |
| $E$ | 1200 | 720 |
| $F$ | 720 | 1200 |
| $C$ | 120 | 600 |
| Celdas | Dodecaedros $\{5,3\}$ | Tetraedros $\{3,3\}$ |

Esta es la generalizacion de la dualidad dodecaedro-icosaedro en 3D.

**Pareja 3: Auto-duales**

El pentacoro $\{3,3,3\}$ y el icositetracoro $\{3,4,3\}$ son auto-duales (ver seccion 9.3).

### 9.3 Auto-dualidad: pentacoro y 24-cell

Un politopo es **auto-dual** si su dual es combinatoriamente identico a si mismo. Esto requiere:
1. $V = C$ (mismo numero de vertices y celdas).
2. $E = F$ (mismo numero de aristas y caras).
3. El simbolo de Schlafli es un palindromo: $\{p, q, r\} = \{r, q, p\}$, es decir, $p = r$.

Los dos auto-duales en 4D son:

**Pentacoro** $\{3,3,3\}$: $p = r = 3$. Con $V = C = 5$ y $E = F = 10$, el dual de un pentacoro es otro pentacoro. Esto es la generalizacion del tetraedro auto-dual en 3D ($\{3,3\}$).

**Icositetracoro** $\{3,4,3\}$: $p = r = 3$. Con $V = C = 24$ y $E = F = 96$, el dual de un icositetracoro es otro icositetracoro. Esta auto-dualidad es notable porque el 24-cell no tiene analogo 3D — es una auto-dualidad genuinamente nueva.

La auto-dualidad del icositetracoro puede verificarse directamente: los 24 centros de los 24 octaedros (celdas) forman un conjunto de puntos que, reescalado, coincide con los 24 vertices originales.

---

## 10. Guia de Uso de PolytopeXD

### 10.1 Interfaz

```
+--------------------------------------------------------------+
| PolytopeXD    5-cell  Tesseract  16-cell  24-cell  120  600  |
+--------------------------------------+-----------------------+
|                                      | [Explorar][Cortar]    |
|                                      | [Celdas]  [Red]       |
|                                      +-----------------------+
|                                      | Proyeccion            |
|         Viewport 3D                  |  Tipo: Perspectiva  v |
|         (canvas WebGL)               |  Dist: ---o-----  3.0 |
|                                      |                       |
|         Arrastrar = orbitar          | Rotacion 4D           |
|         Scroll = zoom               |  XW: ---o-----  0.00  |
|                                      |  YW: ---o-----  0.00  |
|                                      |  ZW: ---o-----  0.00  |
|                                      |                       |
|                                      | Opciones              |
|                                      |  [x] Aristas          |
|                                      |  [x] Vertices         |
|                                      |  [ ] Caras            |
|                                      |  [x] Auto-rotar       |
|                                      |                       |
|                                      | Info del politopo     |
|                                      |  Nombre: Tesseract    |
|                                      |  Schlafli: {4,3,3}    |
|                                      |  V=16 E=32 F=24 C=8   |
|                                      |  Euler: 16-32+24-8=0  |
+--------------------------------------+-----------------------+
```

### 10.2 Controles de navegacion 3D (mouse, scroll)

| Accion | Mouse | Touch |
|--------|-------|-------|
| Orbitar (rotar la vista 3D) | Arrastrar con boton izquierdo | Arrastrar con un dedo |
| Zoom (acercar/alejar) | Rueda del raton | Pellizco con dos dedos |

La camara orbita alrededor del centro del politopo proyectado. La rotacion 3D afecta solo a la camara; la rotacion 4D afecta al politopo mismo (su orientacion en $\mathbb{R}^4$ antes de proyectar).

**Distincion importante:**
- **Rotacion 3D** (mouse): rota la *camara* alrededor del objeto proyectado. Es como caminar alrededor de una escultura.
- **Rotacion 4D** (sliders): rota el *objeto* en $\mathbb{R}^4$ antes de proyectar. Es como girar la escultura en una dimension que no podemos percibir.

### 10.3 Panel Explorar: sliders, opciones

El panel **Explorar** es el modo principal de visualizacion. Contiene:

#### Seleccion de politopo
Los 6 botones de la barra superior permiten cambiar entre politopos. Al seleccionar uno nuevo:
- Se recalculan los vertices y aristas en 4D.
- Se aplica la proyeccion actual.
- Se actualizan los datos combinatorios ($V$, $E$, $F$, $C$).

#### Tipo de proyeccion
Menu desplegable para alternar entre **Perspectiva** y **Estereografica**. El cambio es inmediato y permite comparar ambas vistas del mismo politopo.

#### Distancia de vision ($d$)
Slider que controla el parametro $d$ en las formulas de proyeccion. Valores tipicos entre 2.0 y 10.0.

#### Rotacion 4D
Tres sliders para las rotaciones en los planos $XW$, $YW$ y $ZW$. Estos son los planos "genuinamente 4D" que mezclan coordenadas espaciales con la cuarta dimension. Arrastrar estos sliders produce las deformaciones caracteristicas de los politopos 4D: el "cubo interior" del teseracto crece mientras el exterior se encoge, celdas pasan a traves de otras, etc.

#### Opciones de visualizacion
- **Aristas**: muestra/oculta las aristas del politopo (segmentos entre vertices).
- **Vertices**: muestra/oculta las esferas en cada vertice.
- **Caras**: muestra/oculta las caras semitransparentes (triangulos, cuadrados o pentagonos).
- **Auto-rotar**: activa una rotacion 4D automatica que combina rotaciones en los planos $XW$ y $YZ$, produciendo una vista dinamica del politopo.

### 10.4 Panel Cortar: direcciones, animacion

El panel **Cortar** permite visualizar secciones transversales del politopo con un hiperplano 3D.

#### Direccion de corte
Selector entre los 4 tipos de corte: $W$, Vertice, Arista, Diagonal (ver seccion 5.4).

#### Posicion del hiperplano
Slider que desplaza el hiperplano a lo largo de la direccion seleccionada. El rango se ajusta automaticamente para cubrir todo el politopo.

#### Animacion
Boton que activa un barrido automatico del hiperplano de un extremo al otro, mostrando como la seccion evoluciona continuamente. Esto es analogo a un escaner de resonancia magnetica que obtiene "rebanadas" de un cuerpo 3D — aqui obtenemos "rebanadas" 3D de un cuerpo 4D.

#### Informacion de la seccion
Muestra en tiempo real:
- Numero de vertices de la seccion.
- Tipo de poliedro (si es reconocible).
- Volumen y area superficial de la seccion.

### 10.5 Panel Celdas: navegacion, explosion

El panel **Celdas** permite explorar la descomposicion celular del politopo.

#### Factor de explosion
Slider que controla la separacion radial de las celdas (0 = sin separacion, 1 = separacion completa).

#### Selector de celda
Permite resaltar una celda individual. La celda seleccionada se muestra en color solido mientras las demas se muestran semitransparentes. Los botones de navegacion permiten pasar a celdas adyacentes.

#### Informacion de la celda
Muestra el tipo de celda (tetraedro, cubo, octaedro, dodecaedro), su numero de vertices, aristas y caras, y los indices de las celdas adyacentes.

### 10.6 Panel Red: plegado del teseracto

El panel **Red** permite visualizar el desplegado del teseracto (disponible principalmente para el teseracto, donde la red es mas intuitiva).

#### Angulo de plegado
Slider que controla el angulo $\alpha$ de plegado de la red:
- $\alpha = 0$: cruz de Dali completamente desplegada.
- $\alpha = \pi/2$: teseracto completamente cerrado.

#### Animacion de plegado
Boton que anima el plegado/desplegado completo, mostrando la transicion de la red 3D al politopo 4D.

#### Cubos individuales
Colores distintos para cada uno de los 8 cubos permiten seguir visualmente como se posiciona cada cubo en el proceso de plegado.

---

## 11. Ejercicios

### Ejercicio 1: Verificar Euler para cada politopo

**Objetivo:** Comprobar la formula $V - E + F - C = 0$ usando la informacion de PolytopeXD.

**Procedimiento:**
1. Selecciona cada uno de los 6 politopos.
2. Anota los valores de $V$, $E$, $F$, $C$ mostrados en el panel de informacion.
3. Calcula $V - E + F - C$ para cada uno.

**Preguntas:**

a) Verifica que la formula se cumple para los 6 politopos. Completa la tabla:

| Politopo | $V$ | $E$ | $F$ | $C$ | $V - E + F - C$ |
|----------|-----|-----|-----|-----|------------------|
| Pentacoro | __ | __ | __ | __ | __ |
| Teseracto | __ | __ | __ | __ | __ |
| Hexadecacoro | __ | __ | __ | __ | __ |
| Icositetracoro | __ | __ | __ | __ | __ |
| Hecatonicosacoro | __ | __ | __ | __ | __ |
| Hexacosicoro | __ | __ | __ | __ | __ |

**Solucion:**

| Politopo | $V$ | $E$ | $F$ | $C$ | $V - E + F - C$ |
|----------|-----|-----|-----|-----|------------------|
| Pentacoro | 5 | 10 | 10 | 5 | $5 - 10 + 10 - 5 = 0$ |
| Teseracto | 16 | 32 | 24 | 8 | $16 - 32 + 24 - 8 = 0$ |
| Hexadecacoro | 8 | 24 | 32 | 16 | $8 - 24 + 32 - 16 = 0$ |
| Icositetracoro | 24 | 96 | 96 | 24 | $24 - 96 + 96 - 24 = 0$ |
| Hecatonicosacoro | 600 | 1200 | 720 | 120 | $600 - 1200 + 720 - 120 = 0$ |
| Hexacosicoro | 120 | 720 | 1200 | 600 | $120 - 720 + 1200 - 600 = 0$ |

b) Para un poliedro 3D convexo, $V - E + F = 2$. Para un 4-politopo, $V - E + F - C = 0$. Si existieran 5-politopos regulares, que valor tendria $V - E + F - C + H$ donde $H$ es el numero de hiperceldas (4-celdas)?

**Solucion:** Siguiendo el patron: $V - E + F - C + H = 2$. La caracteristica de Euler de $S^4$ es $1 + (-1)^4 = 2$. Los tres 5-politopos regulares (5-simplex, 5-cubo y 5-ortoplex) satisfacen esta formula.

---

### Ejercicio 2: Secciones del teseracto — que formas aparecen

**Objetivo:** Descubrir los poliedros ocultos dentro del teseracto.

**Procedimiento:**
1. Selecciona el **Teseracto** y ve al panel **Cortar**.
2. Selecciona la direccion **W** y desliza el hiperplano de $-1$ a $+1$.
3. Cambia a la direccion **Vertice** y repite el barrido.
4. Observa las formas de las secciones.

**Preguntas:**

a) Al cortar con $w = t$ constante, que forma tiene la seccion? Depende de $t$?

**Solucion:** La seccion es siempre un **cubo** de lado 2, para todo $t \in [-1, 1]$. Esto es porque el teseracto $[-1,1]^4$ cortado por $w = t$ da $[-1,1]^3$, que es un cubo. La seccion no depende de $t$ (solo su posicion en $w$).

b) Al cortar con la diagonal del vertice ($x + y + z + w = c$), para que valor de $c$ aparece un octaedro regular? Por que?

**Solucion:** Para $c = 0$, la seccion es un **octaedro regular**. Esto ocurre porque el hiperplano $x + y + z + w = 0$ pasa por el centro del teseracto y corta las 24 caras cuadradas simetricamente. Los 12 puntos de interseccion (puntos medios de ciertas aristas) forman los 6 vertices de un octaedro regular. La simetria $S_4$ del hiperplano diagonal coincide con la simetria del octaedro.

c) Existe alguna seccion del teseracto que sea un tetraedro? A que valor de $c$ en la direccion del vertice?

**Solucion:** Si, para $c$ cercano a $\pm 4$ (cerca de un vertice del teseracto). Cuando el hiperplano diagonal apenas entra en el teseracto, corta exactamente 4 aristas que emanan de un vertice, produciendo un tetraedro regular. Para $c = 4 - \epsilon$ con $\epsilon$ pequeno, se obtiene un tetraedro pequeno.

---

### Ejercicio 3: Rotacion doble en 4D

**Objetivo:** Observar el fenomeno de rotacion doble, exclusivo de 4D.

**Procedimiento:**
1. Selecciona el **Teseracto** en modo **Explorar**.
2. Desactiva **Auto-rotar**.
3. Pon el slider de rotacion $XW$ en un valor fijo (por ejemplo, 45 grados). Observa el efecto.
4. Ahora agrega simultaneamente una rotacion $YZ$ del mismo angulo. Observa el efecto combinado.

**Preguntas:**

a) Cuando aplicas solo la rotacion $XW$, que ocurre visualmente con el teseracto proyectado?

**Solucion:** Al rotar en el plano $XW$, las coordenadas $x$ y $w$ se mezclan. Vertices que estaban "al frente" ($w$ bajo) pasan "al fondo" ($w$ alto) y viceversa. Visualmente, el cubo interior y el exterior del teseracto intercambian tamanos: el interior crece y el exterior se encoge, y en $\theta = \pi/2$ se invierte completamente.

b) Al activar la rotacion doble ($XW$ y $YZ$ simultaneamente), todos los vertices se mueven. Por que no hay puntos fijos (excepto el origen)?

**Solucion:** Una rotacion en $XW$ deja fijo el plano $YZ$. Una rotacion en $YZ$ deja fijo el plano $XW$. Combinadas, la unica interseccion de ambos subespacios fijos es $\{0\}$ — el origen. Por tanto, ningun punto distinto del origen permanece fijo, lo cual es imposible en 3D (donde toda rotacion tiene un eje fijo completo).

c) En 3D, toda rotacion puede descomponerse en una rotacion alrededor de un eje (teorema de Euler). Cuantos parametros se necesitan para describir una rotacion general en 3D? Y en 4D?

**Solucion:** En 3D: 3 parametros (por ejemplo, 3 angulos de Euler, o un eje unitario + un angulo = 2 + 1 = 3). En 4D: 6 parametros (los 6 angulos de rotacion en los 6 planos coordenados, o equivalentemente, $\dim SO(4) = \binom{4}{2} = 6$).

---

### Ejercicio 4: Proyeccion perspectiva vs. estereografica

**Objetivo:** Comparar las dos proyecciones disponibles.

**Procedimiento:**
1. Selecciona el **Icositetracoro** (24-cell).
2. Activa la visualizacion de **Caras**.
3. Alterna entre **Perspectiva** y **Estereografica**.
4. Observa como cambian las aristas y los angulos.

**Preguntas:**

a) En la proyeccion en perspectiva, las aristas del politopo se ven como lineas rectas. Es cierto tambien en la proyeccion estereografica?

**Solucion:** No. En la proyeccion estereografica, las aristas (segmentos rectos en 4D) se proyectan como **arcos de circunferencia** en 3D. Esto es porque la proyeccion estereografica es conforme (preserva angulos) pero no preserva lineas rectas. PolytopeXD puede mostrar las aristas como curvas o como segmentos rectos (la aproximacion recta es la mas comun por eficiencia).

b) Si dos celdas del 24-cell se encuentran con un angulo diedrico de $\theta$ en 4D, en cual de las dos proyecciones se preserva este angulo?

**Solucion:** En la proyeccion **estereografica**, porque es conforme (preserva angulos). En la proyeccion perspectiva, los angulos se distorsionan (especialmente para celdas alejadas del eje de proyeccion).

c) Cambia la distancia de vision $d$ de 2 a 10. Que ocurre con la diferencia visual entre ambas proyecciones?

**Solucion:** A medida que $d$ aumenta, ambas proyecciones convergen hacia la **proyeccion paralela** (ortografica). Para $d = 2$, la diferencia es dramatica; para $d = 10$, son casi indistinguibles. Esto es porque tanto $\frac{d}{d+w}$ como $\frac{d}{d-w}$ tienden a 1 cuando $d \gg |w|$.

---

### Ejercicio 5: Explosion de celdas del 24-cell

**Objetivo:** Comprender la estructura celular del politopo mas misterioso.

**Procedimiento:**
1. Selecciona el **Icositetracoro** (24-cell).
2. Ve al panel **Celdas**.
3. Aumenta lentamente el factor de explosion de 0 a 1.
4. Selecciona celdas individuales y explora la adyacencia.

**Preguntas:**

a) El 24-cell tiene 24 celdas octaedricas. Cuantas caras tiene cada octaedro? Cuantas celdas son adyacentes a cada celda?

**Solucion:** Cada octaedro tiene 8 caras triangulares. Cada celda del 24-cell es adyacente a **8** celdas (una por cada cara del octaedro). Esto contrasta con el teseracto, donde cada cubo es adyacente a 6 cubos (una por cada cara cuadrada del cubo, pero el cubo tiene 6 caras y el teseracto solo provee 3 celdas adyacentes por cubo... en realidad, la adyacencia depende de la estructura especifica).

b) El 24-cell puede descomponerse en 3 hexadecacoros (16-cells) mutuamente inscritos. Si cada hexadecacoro tiene 8 vertices, como se distribuyen los $3 \times 8 = 24$ vertices?

**Solucion:** Los 24 vertices se particionan exactamente en 3 grupos de 8. El primer grupo son los $(\pm 1, 0, 0, 0)$ y permutaciones (8 vertices del 16-cell). Los otros dos grupos son subconjuntos de 8 vertices del tipo $(\pm\frac{1}{2}, \pm\frac{1}{2}, \pm\frac{1}{2}, \pm\frac{1}{2})$, seleccionados por la paridad del numero de signos negativos. Cada grupo de 8 vertices forma un hexadecacoro completo.

c) El 24-cell es auto-dual. Si explotas las celdas y miras los centros de los 24 octaedros, que figura forman?

**Solucion:** Los 24 centros de los octaedros forman otro **icositetracoro** (reescalado). Esto es la esencia de la auto-dualidad: los centros de las celdas replican la estructura de los vertices del original.

---

### Ejercicio 6: Red del teseracto y cubos adyacentes

**Objetivo:** Comprender la topologia del teseracto a traves de su red.

**Procedimiento:**
1. Selecciona el **Teseracto** y ve al panel **Red**.
2. Observa la red desplegada (cruz de 8 cubos).
3. Anima el plegado y sigue un cubo especifico.

**Preguntas:**

a) En la cruz de Dali, el cubo central comparte una cara con 4 cubos laterales. Al plegar, donde queda la cara opuesta del cubo central (la que no toca ningun cubo lateral en la red)?

**Solucion:** La cara opuesta del cubo central se convierte en una cara interna del teseracto, compartida con el cubo que esta "al otro lado" en la 4a dimension. Al plegar, los cubos extremos de la cruz se cierran para formar las tapas del teseracto en la direccion $w$.

b) Cuantas redes distintas tiene un cubo 3D? Y un teseracto?

**Solucion:** El cubo tiene **11** redes distintas (sin contar reflexiones ni rotaciones). El teseracto tiene **261** redes distintas. El crecimiento explosivo refleja la complejidad combinatoria creciente con la dimension.

c) Si cortamos la red del teseracto (8 cubos) a lo largo de las caras compartidas dejando exactamente 7 caras como "bisagras", obtenemos un arbol con 8 nodos en el grafo de adyacencia. Cuantas aristas tiene el grafo de adyacencia completo del teseracto?

**Solucion:** En el teseracto, el grafo de adyacencia de celdas tiene 8 nodos (cubos). Cada cubo tiene 6 caras, pero en el teseracto cada cubo es adyacente a exactamente 6 cubos distintos (a traves de sus 6 caras). Sin embargo, esto daria $8 \times 6 / 2 = 24$ aristas, lo cual es demasiado. Revision: cada cubo del teseracto comparte una cara con otro cubo en 4 de sus 6 caras (las 2 caras restantes son opuestas a lo largo de $w$). El numero total de pares adyacentes es $24/2 = 12$ si cada cara del teseracto es compartida por exactamente 2 cubos. El teseracto tiene 24 caras cuadradas; cada una es compartida por exactamente 2 de las 8 celdas. Entonces hay $24$ pares de adyacencia, pero cada par se cuenta una vez, dando $24$ aristas en el grafo de adyacencia. Es decir, cada cubo es adyacente a 6 cubos, y el grafo completo tiene $8 \times 6 / 2 = 24$ aristas.

---

### Ejercicio 7: Dualidad — verificar intercambio $V \leftrightarrow C$

**Objetivo:** Comprobar experimentalmente la dualidad entre politopos.

**Procedimiento:**
1. Selecciona el **Teseracto** y anota $V$, $E$, $F$, $C$.
2. Selecciona el **Hexadecacoro** y anota $V$, $E$, $F$, $C$.
3. Compara ambos conjuntos de valores.
4. Repite para la pareja 120-cell / 600-cell.

**Preguntas:**

a) Verifica que $(V, E, F, C)$ del teseracto es $(C, F, E, V)$ del hexadecacoro.

**Solucion:**
- Teseracto: $(16, 32, 24, 8)$.
- Hexadecacoro: $(8, 24, 32, 16)$.
- $(C, F, E, V)$ del hexadecacoro: $(16, 32, 24, 8)$. Correcto.

b) Para los politopos auto-duales (pentacoro y 24-cell), que implica la auto-dualidad sobre sus $f$-vectores?

**Solucion:** El $f$-vector debe ser un palindromo: $(V, E, F, C) = (C, F, E, V)$, lo que requiere $V = C$ y $E = F$.
- Pentacoro: $(5, 10, 10, 5)$. Palindromo.
- Icositetracoro: $(24, 96, 96, 24)$. Palindromo.

c) Si inventaramos un 4-politopo con $f$-vector $(V, E, F, C) = (10, 30, 30, 10)$, seria auto-dual? Cumple la formula de Euler?

**Solucion:** El $f$-vector es un palindromo, asi que seria candidato a auto-dual. Verificamos Euler: $10 - 30 + 30 - 10 = 0$. Si, cumple la formula. Sin embargo, que exista un $f$-vector valido no garantiza que exista un politopo con esos valores — se necesitarian verificar las **relaciones de Dehn-Sommerville** completas y la realizabilidad geometrica.

---

### Ejercicio 8: Secciones diagonales del 600-cell

**Objetivo:** Explorar las secciones del politopo mas complejo.

**Procedimiento:**
1. Selecciona el **Hexacosicoro** (600-cell).
2. Ve al panel **Cortar**.
3. Selecciona la direccion **Vertice** y barre la posicion lentamente.
4. Observa la evolucion de la seccion.

**Preguntas:**

a) Cerca de un vertice del 600-cell, la seccion deberia parecerse a la figura de vertice. Cual es la figura de vertice del 600-cell?

**Solucion:** La figura de vertice del hexacosicoro $\{3,3,5\}$ es un **icosaedro** $\{3,5\}$. Por tanto, cuando el hiperplano apenas corta un vertice, la seccion es un icosaedro pequeno.

b) El 600-cell tiene 720 aristas. Si la seccion ecuatorial (posicion central) tiene $n$ vertices, cada uno proviene de la interseccion del hiperplano con una arista. Aproximadamente cuantas aristas son cortadas?

**Solucion:** La seccion ecuatorial del 600-cell es un **icosidodecaedro** con 30 vertices. Por tanto, el hiperplano corta exactamente 30 de las 720 aristas.

c) La proporcion aurea $\varphi$ aparece en las coordenadas del 600-cell. Si un vertice tiene coordenada $w = \varphi/2$, a que distancia del centro esta en la proyeccion perspectiva con $d = 3$?

**Solucion:** El factor de perspectiva es $\frac{d}{d + w} = \frac{3}{3 + \varphi/2} = \frac{3}{3 + 0.809} = \frac{3}{3.809} \approx 0.788$. Las coordenadas $(x, y, z)$ se multiplican por este factor, acercando el vertice un $\sim$21% hacia el centro respecto de su posicion en proyeccion paralela.

---

## 12. Glosario

| Termino | Definicion |
|---------|-----------|
| **4-politopo** | Politopo en $\mathbb{R}^4$; objeto geometrico 4-dimensional delimitado por celdas 3D |
| **Arista** | Elemento 1-dimensional de un politopo; segmento que conecta dos vertices |
| **Auto-dual** | Politopo cuyo dual es combinatoriamente identico a si mismo |
| **Cara** | Elemento 2-dimensional de un politopo; poligono plano |
| **Caracteristica de Euler** | Invariante topologico $\chi = \sum (-1)^k f_k$; vale 0 para 4-politopos convexos |
| **Celda** | Elemento 3-dimensional de un 4-politopo; poliedro que forma parte de la frontera |
| **Conforme** | Propiedad de una transformacion que preserva angulos locales |
| **Cross-polytope** | Ortoplex; generalizacion del octaedro; envolvente convexa de $\pm e_i$ en $\mathbb{R}^n$ |
| **Cuaternion** | Numero hipercomplejo de la forma $a + bi + cj + dk$; describe rotaciones en 3D y 4D |
| **Desplegado (net)** | Disposicion de las celdas de un 4-politopo en el espacio 3D, manteniendo caras compartidas |
| **Dual** | Politopo obtenido intercambiando vertices por celdas y aristas por caras |
| **Explosion radial** | Tecnica de visualizacion que separa las celdas radialmente desde el centro |
| **Figura de vertice** | Politopo formado por los vecinos inmediatos de un vertice, conectados entre si |
| **$f$-vector** | Tupla $(f_0, f_1, \ldots, f_{n-1})$ que cuenta los elementos de cada dimension |
| **Grupo de simetria** | Conjunto de isometrias que preservan un politopo; su estructura algebraica |
| **Hiperplano** | Subespacio afin de dimension $n-1$ en $\mathbb{R}^n$; generaliza el plano en 3D |
| **Hipercubo** | Generalizacion del cubo a $n$ dimensiones; vertices en $(\pm 1, \ldots, \pm 1)$ |
| **Notacion de Schlafli** | $\{p, q, r, \ldots\}$; codifica recursivamente la estructura de un politopo regular |
| **Ortoplex** | Cross-polytope; dual del hipercubo; generalizacion del octaedro |
| **Plano de rotacion** | En 4D, la rotacion se define sobre un plano (no un eje como en 3D) |
| **Politopo** | Generalizacion de poligonos y poliedros a $n$ dimensiones |
| **Politopo regular** | Politopo cuyos elementos son todos iguales y cuyas simetrias actuan transitivamente |
| **Proporcion aurea** | $\varphi = \frac{1+\sqrt{5}}{2} \approx 1.618$; aparece en el 120-cell y 600-cell |
| **Proyeccion en perspectiva** | Proyeccion $4D \to 3D$ con factor $\frac{d}{d+w}$; preserva lineas rectas |
| **Proyeccion estereografica** | Proyeccion $4D \to 3D$ con factor $\frac{d}{d-w}$; preserva angulos (conforme) |
| **Rotacion doble** | Rotacion en 4D en dos planos perpendiculares simultaneamente; sin eje fijo |
| **Rotacion isoclina** | Rotacion doble donde ambos angulos son iguales (izquierda) u opuestos (derecha) |
| **Seccion transversal** | Interseccion de un politopo con un hiperplano; produce un poliedro de dimension menor |
| **Simplex** | Politopo mas simple en cada dimension; triangulo (2D), tetraedro (3D), pentacoro (4D) |
| **$SO(4)$** | Grupo de rotaciones en $\mathbb{R}^4$; grupo de Lie de dimension 6 |

---

## 13. Referencias Bibliograficas

### Libros clasicos de geometria

1. **Coxeter, H. S. M.** *Regular Polytopes* (3ra ed., 1973). Dover Publications. — La referencia definitiva sobre politopos regulares en todas las dimensiones. Coxeter clasifica completamente los politopos regulares y establece la notacion y nomenclatura estandar.

2. **Abbott, E. A.** *Flatland: A Romance of Many Dimensions* (1884). — Novela clasica que explora la percepcion dimensional a traves de la historia de un ser 2D que descubre la tercera dimension. Esencial para desarrollar la intuicion sobre dimensiones superiores.

3. **Hilbert, D. & Cohn-Vossen, S.** *Geometry and the Imagination* (1952). Chelsea Publishing. — Tratamiento magistral de la geometria intuitiva, incluyendo secciones sobre politopos y dimensiones superiores, escrito por uno de los matematicos mas influyentes del siglo XX.

4. **Sommerville, D. M. Y.** *An Introduction to the Geometry of N Dimensions* (1929). Dover Publications. — Introduccion sistematica a la geometria en $n$ dimensiones, con enfasis en politopos.

### Visualizacion 4D

5. **Banchoff, T. F.** *Beyond the Third Dimension: Geometry, Computer Graphics, and Higher Dimensions* (1990). Scientific American Library. — Pionero en la visualizacion computacional de objetos 4D; colaboro con Dali en "Corpus Hypercubus".

6. **Hanson, A. J.** "Visualizing Quaternions" (2006). Morgan Kaufmann. — Conexion profunda entre cuaterniones, rotaciones 4D y visualizacion.

7. **Miyazaki, K.** *An Adventure in Multidimensional Space: The Art and Geometry of Polygons, Polyhedra, and Polytopes* (1986). Wiley. — Perspectiva artistica y geometrica de los politopos.

### Articulos y recursos

8. **Stillwell, J.** "The Story of the 120-Cell." *Notices of the AMS*, 48(1), 17–24 (2001). — Historia y propiedades del hecatonicosacoro.

9. **Sullivan, J. M.** "Generating and Rendering Four-Dimensional Polytopes." *The Mathematica Journal*, 1(3), 76–85 (1991). — Algoritmos para renderizar politopos 4D.

10. **Wikipedia.** Articulos detallados sobre cada uno de los 6 politopos regulares convexos en 4D. Particularmente utiles:
    - "Regular 4-polytope"
    - "5-cell", "Tesseract", "16-cell", "24-cell", "120-cell", "600-cell"
    - "Schlafli symbol"
    - "4-polytope"

### Arte y cultura

11. **Dali, S.** *Corpus Hypercubus (Crucifixion)* (1954). Oleo sobre lienzo, 194.3 x 123.8 cm. Metropolitan Museum of Art, Nueva York. — La obra que popularizo la red del teseracto.

12. **Robbin, T.** *Shadows of Reality: The Fourth Dimension in Relativity, Cubism, and Modern Thought* (2006). Yale University Press. — La cuarta dimension en el arte y el pensamiento moderno.

### Recursos computacionales

13. **Three.js** (r128+). Biblioteca WebGL para renderizado 3D en navegadores web. https://threejs.org/ — Motor de renderizado utilizado por PolytopeXD para la visualizacion.

14. **Zome System.** Herramienta fisica de construccion de politopos. https://www.zometool.com/ — Permite construir modelos fisicos de las proyecciones de politopos 4D.

---

*Tutorial generado para PolytopeXD — Explorador de Politopos Regulares en 4D.*
