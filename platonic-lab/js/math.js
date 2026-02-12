/**
 * PlatonicMath — KaTeX formulas, derivations, symmetry, calculator
 */
window.PlatonicMath = (() => {

    // ==================== FORMULAS ====================
    const formulas = {
        tetrahedron: {
            volume: 'V = \\frac{\\sqrt{2}}{12}\\,a^3',
            area: 'A = \\sqrt{3}\\,a^2',
            circumradius: 'R = \\frac{\\sqrt{6}}{4}\\,a',
            insphere: 'r = \\frac{\\sqrt{6}}{12}\\,a = \\frac{R}{3}',
            midradius: '\\rho = \\frac{\\sqrt{2}}{4}\\,a',
            dihedral: '\\theta = \\arccos\\!\\left(\\tfrac{1}{3}\\right) \\approx 70.53°',
        },
        cube: {
            volume: 'V = a^3',
            area: 'A = 6\\,a^2',
            circumradius: 'R = \\frac{\\sqrt{3}}{2}\\,a',
            insphere: 'r = \\frac{a}{2}',
            midradius: '\\rho = \\frac{\\sqrt{2}}{2}\\,a',
            dihedral: '\\theta = 90°',
        },
        octahedron: {
            volume: 'V = \\frac{\\sqrt{2}}{3}\\,a^3',
            area: 'A = 2\\sqrt{3}\\,a^2',
            circumradius: 'R = \\frac{\\sqrt{2}}{2}\\,a',
            insphere: 'r = \\frac{\\sqrt{6}}{6}\\,a',
            midradius: '\\rho = \\frac{a}{2}',
            dihedral: '\\theta = \\arccos\\!\\left(-\\tfrac{1}{3}\\right) \\approx 109.47°',
        },
        dodecahedron: {
            volume: 'V = \\frac{15 + 7\\sqrt{5}}{4}\\,a^3',
            area: 'A = 3\\sqrt{25 + 10\\sqrt{5}}\\,a^2',
            circumradius: 'R = \\frac{\\sqrt{3}}{2}\\,\\varphi\\,a',
            insphere: 'r = \\frac{\\varphi^2}{2\\sqrt{3}}\\,a',
            midradius: '\\rho = \\frac{\\varphi^2}{2}\\,a',
            dihedral: '\\theta = \\arctan(2) \\approx 116.57°',
        },
        icosahedron: {
            volume: 'V = \\frac{5(3+\\sqrt{5})}{12}\\,a^3',
            area: 'A = 5\\sqrt{3}\\,a^2',
            circumradius: 'R = \\frac{\\sqrt{10 + 2\\sqrt{5}}}{4}\\,a',
            insphere: 'r = \\frac{\\varphi^2}{2\\sqrt{3}}\\,a',
            midradius: '\\rho = \\frac{\\varphi}{2}\\,a',
            dihedral: '\\theta = \\arccos\\!\\left(-\\tfrac{\\sqrt{5}}{3}\\right) \\approx 138.19°',
        },
    };

    // ==================== DERIVATIONS ====================
    const derivations = {
        tetrahedron: {
            volume: [
                { title: 'Altura del tetraedro', latex: 'h = a\\sqrt{\\frac{2}{3}}', explanation: 'Desde el centroide de la base hasta el vértice opuesto, usando el teorema de Pitágoras.' },
                { title: 'Área de la base', latex: 'A_{\\text{base}} = \\frac{\\sqrt{3}}{4}\\,a^2', explanation: 'La base es un triángulo equilátero de lado a.' },
                { title: 'Volumen de pirámide', latex: 'V = \\frac{1}{3}\\,A_{\\text{base}} \\cdot h', explanation: 'Fórmula general de volumen de pirámide.' },
                { title: 'Resultado', latex: 'V = \\frac{1}{3} \\cdot \\frac{\\sqrt{3}}{4}a^2 \\cdot a\\sqrt{\\frac{2}{3}} = \\frac{\\sqrt{2}}{12}\\,a^3', explanation: 'Sustituyendo y simplificando.' },
            ],
            area: [
                { title: 'Área de un triángulo equilátero', latex: 'A_{\\triangle} = \\frac{\\sqrt{3}}{4}\\,a^2', explanation: 'Cada cara es un triángulo equilátero de lado a.' },
                { title: 'Total de caras', latex: 'F = 4', explanation: 'El tetraedro tiene exactamente 4 caras.' },
                { title: 'Resultado', latex: 'A = 4 \\cdot \\frac{\\sqrt{3}}{4}\\,a^2 = \\sqrt{3}\\,a^2', explanation: 'Área total = número de caras × área de cada cara.' },
            ],
        },
        cube: {
            volume: [
                { title: 'Definición', latex: 'V = a \\times a \\times a', explanation: 'El cubo tiene tres dimensiones iguales.' },
                { title: 'Resultado', latex: 'V = a^3', explanation: 'El caso más simple: largo × ancho × alto.' },
            ],
            area: [
                { title: 'Área de una cara', latex: 'A_{\\square} = a^2', explanation: 'Cada cara es un cuadrado de lado a.' },
                { title: 'Resultado', latex: 'A = 6 \\cdot a^2 = 6a^2', explanation: '6 caras cuadradas idénticas.' },
            ],
        },
        octahedron: {
            volume: [
                { title: 'Descomposición en pirámides', latex: 'V = 2 \\cdot V_{\\text{pirámide cuadrada}}', explanation: 'El octaedro se puede ver como dos pirámides de base cuadrada pegadas base con base.' },
                { title: 'Base cuadrada', latex: 'A_{\\text{base}} = \\left(\\frac{a\\sqrt{2}}{\\sqrt{2}}\\right)^2 = \\frac{a^2 \\cdot 2}{2}', explanation: 'La diagonal del cuadrado ecuatorial tiene longitud a√2, así que el lado es a.' },
                { title: 'Altura de cada pirámide', latex: 'h = \\frac{a}{\\sqrt{2}}', explanation: 'Desde el centro del cuadrado al vértice superior.' },
                { title: 'Resultado', latex: 'V = 2 \\cdot \\frac{1}{3} \\cdot a^2 \\cdot \\frac{a}{\\sqrt{2}} = \\frac{\\sqrt{2}}{3}\\,a^3', explanation: 'Dos pirámides de base cuadrada.' },
            ],
            area: [
                { title: 'Caras triangulares', latex: 'A_{\\triangle} = \\frac{\\sqrt{3}}{4}\\,a^2', explanation: 'Cada cara es un triángulo equilátero.' },
                { title: 'Resultado', latex: 'A = 8 \\cdot \\frac{\\sqrt{3}}{4}\\,a^2 = 2\\sqrt{3}\\,a^2', explanation: '8 caras triangulares.' },
            ],
        },
        dodecahedron: {
            volume: [
                { title: 'Descomposición', latex: 'V = 12 \\cdot V_{\\text{pirámide pentagonal}}', explanation: 'Se puede descomponer en 12 pirámides con base pentagonal, con vértice en el centro.' },
                { title: 'Área del pentágono regular', latex: 'A_5 = \\frac{\\sqrt{25+10\\sqrt{5}}}{4}\\,a^2', explanation: 'Área de un pentágono regular de lado a.' },
                { title: 'Insfera como altura', latex: 'h = r = \\frac{\\varphi^2}{2\\sqrt{3}}\\,a', explanation: 'La altura de cada pirámide es el radio de la insfera.' },
                { title: 'Resultado', latex: 'V = \\frac{15 + 7\\sqrt{5}}{4}\\,a^3', explanation: 'Tras calcular 12 × (1/3) × A₅ × r y simplificar con la razón áurea.' },
            ],
            area: [
                { title: 'Área del pentágono regular', latex: 'A_5 = \\frac{\\sqrt{25+10\\sqrt{5}}}{4}\\,a^2', explanation: 'Cada cara es un pentágono regular.' },
                { title: 'Resultado', latex: 'A = 12 \\cdot \\frac{\\sqrt{25+10\\sqrt{5}}}{4}\\,a^2 = 3\\sqrt{25+10\\sqrt{5}}\\,a^2', explanation: '12 caras pentagonales.' },
            ],
        },
        icosahedron: {
            volume: [
                { title: 'Descomposición', latex: 'V = 20 \\cdot V_{\\text{pirámide triangular}}', explanation: '20 pirámides desde el centro, cada una con base triangular.' },
                { title: 'Usando la razón áurea', latex: '\\varphi = \\frac{1+\\sqrt{5}}{2}', explanation: 'Las dimensiones del icosaedro están íntimamente ligadas a φ.' },
                { title: 'Resultado', latex: 'V = \\frac{5(3+\\sqrt{5})}{12}\\,a^3', explanation: 'Tras integrar la geometría de los 3 rectángulos áureos ortogonales.' },
            ],
            area: [
                { title: 'Caras triangulares', latex: 'A_{\\triangle} = \\frac{\\sqrt{3}}{4}\\,a^2', explanation: 'Cada cara es un triángulo equilátero.' },
                { title: 'Resultado', latex: 'A = 20 \\cdot \\frac{\\sqrt{3}}{4}\\,a^2 = 5\\sqrt{3}\\,a^2', explanation: '20 caras triangulares.' },
            ],
        },
    };

    // ==================== SYMMETRY GROUPS ====================
    const symmetryGroups = {
        tetrahedron: {
            group: 'T_d',
            order: 24,
            description: 'Grupo tetraédrico completo. Incluye las 12 rotaciones propias del grupo T más las reflexiones.',
            generators: ['Rotación 120° alrededor de un eje vértice-centro de cara opuesta', 'Reflexión en plano que contiene una arista y biseca la arista opuesta'],
            elements: [
                { type: 'Identidad', symbol: 'E', count: 1 },
                { type: 'Rotaciones C₃', symbol: 'C_3, C_3^2', count: 8 },
                { type: 'Rotaciones C₂', symbol: 'C_2', count: 3 },
                { type: 'Reflexiones σ_d', symbol: '\\sigma_d', count: 6 },
                { type: 'Rotoreflexiones S₄', symbol: 'S_4, S_4^3', count: 6 },
            ],
        },
        cube: {
            group: 'O_h',
            order: 48,
            description: 'Grupo octaédrico completo. Compartido con el octaedro (su dual). 24 rotaciones propias + inversión.',
            generators: ['Rotación 90° alrededor de un eje cara-cara', 'Rotación 120° alrededor de un eje vértice-vértice diagonal'],
            elements: [
                { type: 'Identidad', symbol: 'E', count: 1 },
                { type: 'Rotaciones C₃', symbol: 'C_3, C_3^2', count: 8 },
                { type: 'Rotaciones C₄', symbol: 'C_4, C_4^3', count: 6 },
                { type: 'Rotaciones C₂ (caras)', symbol: 'C_2', count: 3 },
                { type: 'Rotaciones C₂ (aristas)', symbol: 'C_2\'', count: 6 },
                { type: 'Inversión + reflexiones', symbol: 'i, \\sigma_h, S_4, S_6', count: 24 },
            ],
        },
        octahedron: {
            group: 'O_h',
            order: 48,
            description: 'Mismo grupo que el cubo (son duales). Cada simetría del cubo es también simetría del octaedro inscrito.',
            generators: ['Rotación 90° alrededor de un eje vértice-vértice', 'Inversión respecto al centro'],
            elements: [
                { type: 'Identidad', symbol: 'E', count: 1 },
                { type: 'Rotaciones C₃', symbol: 'C_3, C_3^2', count: 8 },
                { type: 'Rotaciones C₄', symbol: 'C_4, C_4^3', count: 6 },
                { type: 'Rotaciones C₂ (ejes principales)', symbol: 'C_2', count: 3 },
                { type: 'Rotaciones C₂ (aristas)', symbol: 'C_2\'', count: 6 },
                { type: 'Inversión + reflexiones', symbol: 'i, \\sigma_h, S_4, S_6', count: 24 },
            ],
        },
        dodecahedron: {
            group: 'I_h',
            order: 120,
            description: 'Grupo icosaédrico completo. El grupo de simetría más grande entre los poliedros regulares. Compartido con el icosaedro.',
            generators: ['Rotación 72° alrededor de un eje cara-cara', 'Rotación 120° alrededor de un eje vértice-vértice'],
            elements: [
                { type: 'Identidad', symbol: 'E', count: 1 },
                { type: 'Rotaciones C₅', symbol: 'C_5, C_5^2, C_5^3, C_5^4', count: 24 },
                { type: 'Rotaciones C₃', symbol: 'C_3, C_3^2', count: 20 },
                { type: 'Rotaciones C₂', symbol: 'C_2', count: 15 },
                { type: 'Inversión + reflexiones', symbol: 'i, S_{10}, S_6, \\sigma', count: 60 },
            ],
        },
        icosahedron: {
            group: 'I_h',
            order: 120,
            description: 'Mismo grupo que el dodecaedro (son duales). 60 rotaciones propias forman el grupo alterno A₅.',
            generators: ['Rotación 72° alrededor de un eje vértice-vértice', 'Rotación 120° alrededor de un eje cara-cara'],
            elements: [
                { type: 'Identidad', symbol: 'E', count: 1 },
                { type: 'Rotaciones C₅', symbol: 'C_5, C_5^2, C_5^3, C_5^4', count: 24 },
                { type: 'Rotaciones C₃', symbol: 'C_3, C_3^2', count: 20 },
                { type: 'Rotaciones C₂', symbol: 'C_2', count: 15 },
                { type: 'Inversión + reflexiones', symbol: 'i, S_{10}, S_6, \\sigma', count: 60 },
            ],
        },
    };

    // ==================== EULER CONTENT ====================
    const eulerContent = {
        theorem: 'V - E + F = 2',
        theoremLatex: 'V - E + F = 2',
        description: 'Para todo poliedro convexo, el número de vértices menos el número de aristas más el número de caras es siempre igual a 2. Esta es la característica de Euler para superficies cerradas de género 0.',
        verification: [
            { name: 'Tetraedro', V: 4, E: 6, F: 4 },
            { name: 'Cubo', V: 8, E: 12, F: 6 },
            { name: 'Octaedro', V: 6, E: 12, F: 8 },
            { name: 'Dodecaedro', V: 20, E: 30, F: 12 },
            { name: 'Icosaedro', V: 12, E: 30, F: 20 },
        ],
        proofSketch: [
            { step: 'Proyectar el poliedro sobre un plano (proyección estereográfica).', latex: '' },
            { step: 'Obtener un grafo planar con V vértices, E aristas y F-1 caras finitas (la cara exterior se "pierde").', latex: '' },
            { step: 'Eliminar aristas una por una. Si una arista bordea la cara exterior, se elimina sin cambiar V-E+F. Si no, se fusionan dos caras, reduciendo F y E en 1.', latex: '' },
            { step: 'Continuar hasta obtener un árbol (F=1). Un árbol tiene E=V-1.', latex: 'V - (V-1) + 1 = 2 \\quad \\checkmark' },
        ],
    };

    // ==================== CLASSIFICATION CONTENT ====================
    const classificationContent = {
        title: 'Clasificación: ¿Por qué solo 5?',
        intro: 'Un sólido platónico {p, q} requiere que al menos 3 caras regulares de p lados se junten en cada vértice, con ángulo total < 360°.',
        condition: '\\frac{1}{p} + \\frac{1}{q} > \\frac{1}{2}',
        conditionExplanation: 'La condición necesaria y suficiente para que exista un poliedro regular convexo {p, q}.',
        cases: [
            { p: 3, q: 3, name: 'Tetraedro', sum: '1/3 + 1/3 = 2/3', valid: true },
            { p: 3, q: 4, name: 'Octaedro', sum: '1/3 + 1/4 = 7/12', valid: true },
            { p: 3, q: 5, name: 'Icosaedro', sum: '1/3 + 1/5 = 8/15', valid: true },
            { p: 3, q: 6, name: '—', sum: '1/3 + 1/6 = 1/2', valid: false },
            { p: 4, q: 3, name: 'Cubo', sum: '1/4 + 1/3 = 7/12', valid: true },
            { p: 4, q: 4, name: '—', sum: '1/4 + 1/4 = 1/2', valid: false },
            { p: 5, q: 3, name: 'Dodecaedro', sum: '1/5 + 1/3 = 8/15', valid: true },
            { p: 5, q: 4, name: '—', sum: '1/5 + 1/4 = 9/20', valid: false },
            { p: 6, q: 3, name: '—', sum: '1/6 + 1/3 = 1/2', valid: false },
        ],
    };

    // ==================== SPHERE CONTENT ====================
    const sphereContent = {
        title: 'Tres esferas concéntricas',
        description: 'Todo sólido platónico tiene tres esferas naturales concéntricas: la circunesfera (pasa por los vértices), la insfera (tangente a las caras) y la mesoesfera (tangente a las aristas).',
        formulas: {
            tetrahedron: { R: '\\frac{\\sqrt{6}}{4}a', r: '\\frac{\\sqrt{6}}{12}a', rho: '\\frac{\\sqrt{2}}{4}a', ratio: 'R/r = 3' },
            cube: { R: '\\frac{\\sqrt{3}}{2}a', r: '\\frac{a}{2}', rho: '\\frac{\\sqrt{2}}{2}a', ratio: 'R/r = \\sqrt{3}' },
            octahedron: { R: '\\frac{\\sqrt{2}}{2}a', r: '\\frac{\\sqrt{6}}{6}a', rho: '\\frac{a}{2}', ratio: 'R/r = \\sqrt{3}' },
            dodecahedron: { R: '\\frac{\\sqrt{3}}{2}\\varphi\\,a', r: '\\frac{\\varphi^2}{2\\sqrt{3}}a', rho: '\\frac{\\varphi^2}{2}a', ratio: 'R/r \\approx 1.258' },
            icosahedron: { R: '\\frac{\\sqrt{10+2\\sqrt{5}}}{4}a', r: '\\frac{\\varphi^2}{2\\sqrt{3}}a', rho: '\\frac{\\varphi}{2}a', ratio: 'R/r \\approx 1.258' },
        },
    };

    // ==================== RENDER FUNCTIONS ====================

    function renderKaTeX(latex, container, displayMode = true) {
        if (typeof katex !== 'undefined') {
            katex.render(latex, container, { displayMode, throwOnError: false });
        }
    }

    function renderFormulas(solidKey, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const f = formulas[solidKey];
        if (!f) return;

        const labels = {
            volume: 'Volumen',
            area: 'Área superficial',
            circumradius: 'Circumradio',
            insphere: 'Inradio',
            midradius: 'Mesoradio',
            dihedral: 'Ángulo diedro',
        };

        container.innerHTML = '';
        for (const [key, latex] of Object.entries(f)) {
            const row = document.createElement('div');
            row.className = 'katex-formula-row';
            const label = document.createElement('div');
            label.className = 'katex-formula-label';
            label.textContent = labels[key] || key;
            const math = document.createElement('div');
            row.appendChild(label);
            row.appendChild(math);
            container.appendChild(row);
            renderKaTeX(latex, math);
        }
    }

    function renderDerivation(solidKey, property, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const steps = derivations[solidKey]?.[property];
        if (!steps) {
            container.innerHTML = '<p class="text-xs text-gray-500">Derivación no disponible.</p>';
            return;
        }

        container.innerHTML = '';
        steps.forEach((step, i) => {
            const div = document.createElement('div');
            div.className = 'derivation-step';
            const title = document.createElement('div');
            title.className = 'derivation-step-title';
            title.textContent = step.title;
            div.appendChild(title);

            if (step.latex) {
                const math = document.createElement('div');
                div.appendChild(math);
                renderKaTeX(step.latex, math);
            }

            const explanation = document.createElement('div');
            explanation.className = 'derivation-step-explanation';
            explanation.textContent = step.explanation;
            div.appendChild(explanation);

            container.appendChild(div);
        });
    }

    function renderSymmetry(solidKey, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const sym = symmetryGroups[solidKey];
        if (!sym) return;

        let html = `
            <div class="section-header">${sym.group} — Orden ${sym.order}</div>
            <p class="text-xs text-gray-400 mb-3 leading-relaxed">${sym.description}</p>
            <div class="section-subheader">Generadores</div>
            <ul class="text-xs text-gray-400 mb-3 space-y-1 list-disc list-inside">
                ${sym.generators.map(g => `<li>${g}</li>`).join('')}
            </ul>
            <div class="section-subheader">Elementos de simetría</div>
            <table class="symmetry-table">
                <thead><tr><th>Tipo</th><th>Símbolo</th><th>Nº</th></tr></thead>
                <tbody>
        `;
        sym.elements.forEach(el => {
            html += `<tr><td>${el.type}</td><td>`;
            html += `<span id="sym-${solidKey}-${el.type.replace(/\s/g, '')}" class="sym-symbol"></span>`;
            html += `</td><td>${el.count}</td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;

        // Render KaTeX symbols
        sym.elements.forEach(el => {
            const id = `sym-${solidKey}-${el.type.replace(/\s/g, '')}`;
            const span = document.getElementById(id);
            if (span) renderKaTeX(el.symbol, span, false);
        });
    }

    function renderEuler(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = `
            <div class="section-header">Fórmula de Euler para poliedros</div>
            <div class="math-box mb-4" id="euler-formula-box"></div>
            <p class="text-xs text-gray-400 mb-4 leading-relaxed">${eulerContent.description}</p>

            <div class="section-subheader">Verificación para los 5 sólidos</div>
            <table class="euler-table mb-4">
                <thead><tr><th>Sólido</th><th>V</th><th>E</th><th>F</th><th>V−E+F</th></tr></thead>
                <tbody>
        `;
        eulerContent.verification.forEach(v => {
            html += `<tr><td class="text-left">${v.name}</td><td>${v.V}</td><td>${v.E}</td><td>${v.F}</td><td class="euler-result">${v.V - v.E + v.F}</td></tr>`;
        });
        html += `</tbody></table>

            <div class="section-subheader">Esquema de la demostración</div>
            <div class="space-y-2">
        `;
        eulerContent.proofSketch.forEach((step, i) => {
            html += `<div class="derivation-step">
                <div class="derivation-step-title">Paso ${i + 1}</div>
                <div class="derivation-step-explanation">${step.step}</div>
                ${step.latex ? `<div id="euler-proof-step-${i}" class="mt-2"></div>` : ''}
            </div>`;
        });
        html += '</div>';

        container.innerHTML = html;

        // Render theorem formula
        const formulaBox = document.getElementById('euler-formula-box');
        if (formulaBox) renderKaTeX(eulerContent.theoremLatex, formulaBox);

        // Render proof step formulas
        eulerContent.proofSketch.forEach((step, i) => {
            if (step.latex) {
                const el = document.getElementById(`euler-proof-step-${i}`);
                if (el) renderKaTeX(step.latex, el);
            }
        });
    }

    function renderClassification(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const c = classificationContent;

        let html = `
            <div class="section-header">${c.title}</div>
            <p class="text-xs text-gray-400 mb-3 leading-relaxed">${c.intro}</p>
            <div class="math-box mb-3" id="classification-condition"></div>
            <p class="text-xs text-gray-400 mb-4 leading-relaxed">${c.conditionExplanation}</p>

            <div class="section-subheader">Todas las combinaciones {p, q}</div>
            <div class="classification-row header">
                <span>{p, q}</span><span>1/p + 1/q</span><span>Sólido</span>
            </div>
        `;
        c.cases.forEach(cas => {
            const colorClass = cas.valid ? 'text-green-400' : 'text-red-400';
            const icon = cas.valid ? '✓' : '✗';
            html += `<div class="classification-row">
                <span class="font-mono text-gray-300">{${cas.p}, ${cas.q}}</span>
                <span class="font-mono ${colorClass}">${cas.sum} ${icon}</span>
                <span class="text-gray-300">${cas.name}</span>
            </div>`;
        });

        container.innerHTML = html;

        const condBox = document.getElementById('classification-condition');
        if (condBox) renderKaTeX(c.condition, condBox);
    }

    function renderSpheres(solidKey, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const s = sphereContent;

        let html = `
            <div class="section-header">${s.title}</div>
            <p class="text-xs text-gray-400 mb-4 leading-relaxed">${s.description}</p>
        `;

        // Show formulas for current solid
        const sf = s.formulas[solidKey];
        if (sf) {
            html += `<div class="section-subheader">Fórmulas para ${window.PlatonicGeometry.solids[solidKey].name}</div>`;
            html += '<div class="math-box space-y-2">';
            html += `<div class="katex-formula-row"><div class="katex-formula-label">Circumradio (R)</div><div id="sphere-R"></div></div>`;
            html += `<div class="katex-formula-row"><div class="katex-formula-label">Inradio (r)</div><div id="sphere-r"></div></div>`;
            html += `<div class="katex-formula-row"><div class="katex-formula-label">Mesoradio (ρ)</div><div id="sphere-rho"></div></div>`;
            html += `<div class="katex-formula-row"><div class="katex-formula-label">Razón R/r</div><div id="sphere-ratio"></div></div>`;
            html += '</div>';

            // Comparison table
            html += '<div class="section-subheader mt-4">Comparación R/r</div>';
            html += '<table class="symmetry-table"><thead><tr><th>Sólido</th><th>R/r</th></tr></thead><tbody>';
            for (const [key, data] of Object.entries(s.formulas)) {
                const name = window.PlatonicGeometry.solids[key].name;
                const highlight = key === solidKey ? ' class="text-cyan-400 font-semibold"' : '';
                html += `<tr><td>${name}</td><td${highlight}><span id="sphere-ratio-${key}"></span></td></tr>`;
            }
            html += '</tbody></table>';
        }

        container.innerHTML = html;

        // Render KaTeX
        if (sf) {
            const rEl = document.getElementById('sphere-R');
            if (rEl) renderKaTeX('R = ' + sf.R, rEl, false);
            const rSmall = document.getElementById('sphere-r');
            if (rSmall) renderKaTeX('r = ' + sf.r, rSmall, false);
            const rhoEl = document.getElementById('sphere-rho');
            if (rhoEl) renderKaTeX('\\rho = ' + sf.rho, rhoEl, false);
            const ratioEl = document.getElementById('sphere-ratio');
            if (ratioEl) renderKaTeX(sf.ratio, ratioEl, false);

            for (const [key, data] of Object.entries(s.formulas)) {
                const el = document.getElementById(`sphere-ratio-${key}`);
                if (el) renderKaTeX(data.ratio, el, false);
            }
        }
    }

    // ==================== CALCULATOR ====================

    function calculate(solidKey, edgeLength) {
        const s = window.PlatonicGeometry.solids[solidKey];
        if (!s) return null;
        const a = edgeLength;

        return {
            name: s.name,
            schlafli: s.schlafli,
            V: s.V,
            E: s.E,
            F: s.F,
            euler: s.V - s.E + s.F,
            faceType: s.faceType,
            facesPerVertex: s.facesPerVertex,
            dihedralAngle: s.dihedralAngleDeg,
            volume: s.volumeCoeff * Math.pow(a, 3),
            area: s.areaCoeff * Math.pow(a, 2),
            circumradius: s.circumradiusCoeff * a,
            insphere: s.insphereCoeff * a,
            midradius: s.midradiusCoeff * a,
            symmetryGroup: s.symmetryGroup,
            symmetryOrder: s.symmetryOrder,
            element: s.element,
            dual: s.dualName,
        };
    }

    return {
        formulas,
        derivations,
        symmetryGroups,
        eulerContent,
        classificationContent,
        sphereContent,
        renderFormulas,
        renderDerivation,
        renderSymmetry,
        renderEuler,
        renderClassification,
        renderSpheres,
        calculate,
    };
})();
