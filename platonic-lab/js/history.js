/**
 * PlatonicHistory — Elements, timeline, Timaeus, modern applications
 */
window.PlatonicHistory = (() => {

    // ==================== ELEMENTS ====================
    const elements = {
        tetrahedron: {
            element: 'Fuego',
            symbol: '🔥',
            cssClass: 'element-fire',
            solid: 'Tetraedro',
            color: '#ef4444',
            reason: 'Platón asoció el tetraedro al fuego porque es el sólido más puntiagudo y afilado, capaz de cortar y penetrar, tal como el fuego que quema y transforma.',
            quote: '«El que tiene la menor cantidad de bases debe ser naturalmente el más móvil y penetrante de todos, y también el más ligero, estando compuesto del menor número de partes idénticas.»',
            quoteSource: 'Timeo, 56a',
        },
        cube: {
            element: 'Tierra',
            symbol: '🌍',
            cssClass: 'element-earth',
            solid: 'Cubo',
            color: '#22c55e',
            reason: 'El cubo representa la tierra por su estabilidad y solidez. Sus caras cuadradas permiten que se apile y rellene el espacio, como la tierra firme bajo nuestros pies.',
            quote: '«A la tierra asignemos la forma cúbica, pues la tierra es el más inmóvil de los cuatro cuerpos y el más plástico de todos.»',
            quoteSource: 'Timeo, 55d-e',
        },
        octahedron: {
            element: 'Aire',
            symbol: '💨',
            cssClass: 'element-air',
            solid: 'Octaedro',
            color: '#facc15',
            reason: 'El octaedro se asocia al aire por su ligereza intermedia. Es más libre que la tierra pero menos penetrante que el fuego, flotando entre ambos.',
            quote: '«Al aire corresponde la forma que ocupa el segundo lugar en cuanto al número de partes y caras triangulares.»',
            quoteSource: 'Timeo, 56b',
        },
        icosahedron: {
            element: 'Agua',
            symbol: '💧',
            cssClass: 'element-water',
            solid: 'Icosaedro',
            color: '#3b82f6',
            reason: 'El icosaedro, con sus 20 caras, es el más esférico de los sólidos con caras triangulares. Su forma redondeada evoca la fluidez del agua.',
            quote: '«El que tiene el mayor número de caras debe ser el más esférico y, por tanto, el más resbaladizo.»',
            quoteSource: 'Timeo, 55b',
        },
        dodecahedron: {
            element: 'Éter',
            symbol: '✨',
            cssClass: 'element-ether',
            solid: 'Dodecaedro',
            color: '#a855f7',
            reason: 'El dodecaedro, con sus caras pentagonales llenas de la razón áurea, fue asignado al cosmos mismo —el quinto elemento o éter— que compone la bóveda celeste.',
            quote: '«Quedaba aún una quinta combinación, y el dios la usó para el universo cuando lo adornó con constelaciones.»',
            quoteSource: 'Timeo, 55c',
        },
    };

    // ==================== TIMELINE ====================
    const timeline = [
        {
            date: '~530 a.C.',
            title: 'Pitágoras y los pitagóricos',
            description: 'Los pitagóricos conocían al menos tres de los cinco sólidos regulares. Se les atribuye el descubrimiento del tetraedro, cubo y dodecaedro.',
        },
        {
            date: '~470 a.C.',
            title: 'Teeteto de Atenas',
            description: 'Teeteto demostró matemáticamente que solo existen cinco poliedros regulares convexos y estudió sistemáticamente sus propiedades.',
        },
        {
            date: '~360 a.C.',
            title: 'Platón — El Timeo',
            description: 'En su diálogo "Timeo", Platón asocia los cinco sólidos a los cuatro elementos clásicos más el cosmos. Esta asociación da nombre a los "sólidos platónicos".',
        },
        {
            date: '~300 a.C.',
            title: 'Euclides — Los Elementos',
            description: 'El Libro XIII de los Elementos de Euclides presenta las construcciones rigurosas de los cinco sólidos platónicos y demuestra que no pueden existir más.',
        },
        {
            date: '1596',
            title: 'Kepler — Mysterium Cosmographicum',
            description: 'Johannes Kepler propuso que las órbitas de los seis planetas conocidos podían explicarse inscribiendo y circunscribiendo los cinco sólidos platónicos.',
        },
        {
            date: '1619',
            title: 'Kepler — Harmonices Mundi',
            description: 'Kepler amplía su visión de la armonía geométrica del cosmos, conectando los poliedros con la música de las esferas y las proporciones armónicas.',
        },
        {
            date: '1758',
            title: 'Euler — Fórmula V−E+F=2',
            description: 'Leonhard Euler descubre su famosa fórmula que conecta vértices, aristas y caras de todo poliedro convexo, inaugurando la topología combinatoria.',
        },
    ];

    // ==================== TIMAEUS ====================
    const timaeus = {
        intro: 'El Timeo de Platón (~360 a.C.) es uno de los diálogos más influyentes de la filosofía occidental. En él, Timeo de Locri expone una cosmología donde la geometría es el fundamento de la realidad material.',
        passages: [
            {
                topic: 'La creación de los elementos',
                text: '«En primer lugar, que el fuego, la tierra, el agua y el aire son cuerpos es evidente para todos. Ahora bien, toda forma de cuerpo tiene también profundidad. Y toda profundidad comprende necesariamente la naturaleza del plano. La superficie plana más básica está compuesta de triángulos.»',
                ref: 'Timeo, 53c-d',
            },
            {
                topic: 'Los triángulos fundamentales',
                text: '«Todos los triángulos se derivan de dos tipos: uno que tiene un ángulo recto y los otros dos agudos, y otro que es isósceles. De estos dos, el semitriángulo equilátero [30-60-90] es el más bello.»',
                ref: 'Timeo, 54a-b',
            },
            {
                topic: 'Asignación del fuego al tetraedro',
                text: '«Asignemos al fuego la pirámide [tetraedro], que tiene las bases más pequeñas y las puntas más afiladas, y es, por tanto, el más móvil y penetrante de todos los cuerpos.»',
                ref: 'Timeo, 56a',
            },
            {
                topic: 'La tierra como cubo',
                text: '«A la tierra le corresponde la forma cúbica, pues de los cuatro géneros la tierra es la más inmóvil y la más plástica, y es necesario que el cuerpo que tiene las bases más estables sea así.»',
                ref: 'Timeo, 55d-e',
            },
            {
                topic: 'El dodecaedro y el cosmos',
                text: '«Y dado que aún quedaba una quinta construcción, el dios la empleó para decorar el universo.»',
                ref: 'Timeo, 55c',
            },
            {
                topic: 'Transformación entre elementos',
                text: '«Cuando el agua es comprimida por el fuego o por el aire, es posible que al juntarse sus partes, una porción de agua se transforme en una de fuego y dos de aire, y los fragmentos de aire de una sola porción pueden producir dos de fuego.»',
                ref: 'Timeo, 56d-e',
            },
        ],
    };

    // ==================== MODERN APPLICATIONS ====================
    const modern = [
        {
            title: 'Fullerenos (Buckyballs)',
            solid: 'Icosaedro truncado',
            relatedSolid: 'icosahedron',
            description: 'La molécula C₆₀, descubierta en 1985, tiene la forma de un icosaedro truncado (balón de fútbol). Cada átomo de carbono se sitúa en un vértice de 12 pentágonos y 20 hexágonos. Premio Nobel de Química 1996.',
        },
        {
            title: 'Cápsidas virales',
            solid: 'Icosaedro',
            relatedSolid: 'icosahedron',
            description: 'La mayoría de los virus esféricos (adenovirus, herpesvirus, poliovirus) tienen cápsidas con simetría icosaédrica. Es la forma más eficiente de construir una cubierta cerrada con proteínas idénticas.',
        },
        {
            title: 'Cuasicristales',
            solid: 'Icosaedro / Dodecaedro',
            relatedSolid: 'dodecahedron',
            description: 'Descubiertos en 1982 por Dan Shechtman (Nobel 2011), los cuasicristales presentan simetría icosaédrica "prohibida" en cristalografía clásica. Su patrón de difracción muestra simetría de orden 5.',
        },
        {
            title: 'Dados de rol (RPG)',
            solid: 'Todos',
            relatedSolid: 'icosahedron',
            description: 'Los dados regulares de D&D usan exactamente los 5 sólidos platónicos: d4 (tetraedro), d6 (cubo), d8 (octaedro), d12 (dodecaedro) y d20 (icosaedro). La equidad de las caras garantiza probabilidades uniformes.',
        },
        {
            title: 'Geodésicas y arquitectura',
            solid: 'Icosaedro',
            relatedSolid: 'icosahedron',
            description: 'Buckminster Fuller popularizó las cúpulas geodésicas basadas en subdivisiones del icosaedro. La Biosfera de Montreal (1967) y el Spaceship Earth de Epcot son ejemplos icónicos.',
        },
    ];

    // ==================== RENDER FUNCTIONS ====================

    function renderElements(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '<div class="section-header">Los cinco elementos de Platón</div><div class="space-y-3">';

        const order = ['tetrahedron', 'cube', 'octahedron', 'icosahedron', 'dodecahedron'];
        order.forEach(key => {
            const el = elements[key];
            html += `
                <div class="element-card ${el.cssClass}">
                    <div class="element-symbol">${el.symbol}</div>
                    <div class="element-name">${el.element}</div>
                    <div class="element-solid">${el.solid} — ${window.PlatonicGeometry.solids[key].schlafli}</div>
                    <div class="element-reason">${el.reason}</div>
                    <div class="element-quote">
                        ${el.quote}
                        <div class="element-quote-source">— ${el.quoteSource}</div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    function renderTimeline(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '<div class="section-header">Cronología de los sólidos platónicos</div><div class="mt-4">';

        timeline.forEach(item => {
            html += `
                <div class="timeline-item">
                    <div class="timeline-date">${item.date}</div>
                    <div class="timeline-title">${item.title}</div>
                    <div class="timeline-desc">${item.description}</div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    function renderTimaeus(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = `
            <div class="section-header">El Timeo de Platón</div>
            <p class="text-xs text-gray-400 mb-4 leading-relaxed">${timaeus.intro}</p>
            <div class="section-subheader">Pasajes selectos</div>
        `;

        timaeus.passages.forEach(passage => {
            html += `
                <div class="timaeus-passage">
                    <div class="timaeus-topic">${passage.topic}</div>
                    <div class="timaeus-text">${passage.text}</div>
                    <div class="timaeus-ref">${passage.ref}</div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    function renderModern(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '<div class="section-header">Aplicaciones modernas</div><div class="space-y-3">';

        modern.forEach(app => {
            html += `
                <div class="modern-card">
                    <div class="modern-card-title">${app.title}</div>
                    <div class="modern-card-solid">${app.solid}</div>
                    <div class="modern-card-desc">${app.description}</div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    return {
        elements,
        timeline,
        timaeus,
        modern,
        renderElements,
        renderTimeline,
        renderTimaeus,
        renderModern,
    };
})();
