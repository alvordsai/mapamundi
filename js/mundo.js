

export async function crearSkybox(tamanyo) {

    // SKYBOX
    const sky = new Image();
    sky.src = 'images/skybox.png';


    // al final el error venia de que la imagen tarda un tiempo en cargarse
    await sky.decode();

    const tamaño = sky.width / 4;
    const materialesHabitacion = [];

    const caras = [
        [2, 1],
        [0, 1],
        [1, 0],
        [1, 2],
        [1, 1],
        [3, 1]
    ];

    for (let i = 0; i < 6; i++) {

        const canvas = document.createElement('canvas');
        canvas.width = tamaño;
        canvas.height = tamaño;

        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            sky,
            caras[i][0] * tamaño,
            caras[i][1] * tamaño,
            tamaño,
            tamaño,
            0,
            0,
            tamaño,
            tamaño
        );

        const textura = new THREE.CanvasTexture(canvas);

        materialesHabitacion.push(
            new THREE.MeshBasicMaterial({
                map: textura,
                side: THREE.BackSide
            })
        );
    }

    const skybox = new THREE.Mesh(
        new THREE.BoxGeometry(tamanyo, tamanyo, tamanyo),
        materialesHabitacion
    );

    return skybox;
}

let texAgua, normalAgua;

export function crearOceano(tamanyo) {
    const loader = new THREE.TextureLoader();

    texAgua = loader.load("images/water.png");
    texAgua.center.set(0.5, 0.5);
    texAgua.rotation = Math.PI * 2;
    normalAgua = loader.load("images/waternormals.jpg");

    texAgua.wrapS = THREE.RepeatWrapping;
    texAgua.wrapT = THREE.RepeatWrapping;
    normalAgua.wrapS = THREE.RepeatWrapping;
    normalAgua.wrapT = THREE.RepeatWrapping;

    texAgua.repeat.set(8, 8);
    normalAgua.repeat.set(8, 8);

    const geomOceano = new THREE.PlaneGeometry(tamanyo, tamanyo);
    const materialOceano = new THREE.MeshPhongMaterial({
        color: 0x4fa7d6,
        transparent: true,
        opacity: 0.6,
        map: texAgua,
        normalMap: normalAgua,
        shinyness: 10,
        side: THREE.DoubleSide
    });

    const oceano = new THREE.Mesh(geomOceano, materialOceano);
    oceano.rotation.x = -Math.PI / 2;
    oceano.position.y = -2;
    oceano.receiveShadow = true;
    //No proyecta sombras

    return oceano;
}

export function updateOcean() {
    const t = 0.001;

    texAgua.offset.x += t;
    //texAgua.offset.y += t;

    normalAgua.offset.x += -t;
    //normalAgua.offset.y += t;;
}


export async function crearTerrenoDeHeightmap(tamanyo) {

    // Cargar imagen
    const img = new Image();
    img.src = 'images/heightmap.png';

    await img.decode();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const datos = ctx.getImageData(0, 0, img.width, img.height).data;

    const anchoTerreno = tamanyo;
    const fondoTerreno = tamanyo;
    const alturaMaxima = 200;

    const columnas = img.width;
    const filas = img.height;

    const vertices = [];
    const indices = [];
    // U: Posición horizontal dentro d ela textura
    // V: Posición vertical. Van de 0 a 1
    const uvs = [];

    // vertices
    for (let z = 0; z < filas; z++) {
        for (let x = 0; x < columnas; x++) {

            const i = (z * columnas + x) * 4;

            // luminoisidad
            const gris = datos[i];

            // altura en base a ella
            const y = (gris / 255) * alturaMaxima;

            const px = (x / (columnas - 1)) * anchoTerreno - anchoTerreno / 2;
            const pz = (z / (filas - 1)) * fondoTerreno - fondoTerreno / 2;

            vertices.push(px, y, pz);
            uvs.push(
                x / (columnas - 1),
                1 - z / (filas - 1)
            );
        }
    }

    const indicesPorMaterial = Array.from(
        { length: 6 },
        () => []
    );

    function materialSegunAltura(altura) {
        if (altura < alturaMaxima / 8) return 0;   // Arena
        if (altura < alturaMaxima / 6) return 1;   // Hierba
        if (altura < alturaMaxima / 4) return 2;   // Bosque
        if (altura < alturaMaxima / 3) return 3;   // Tierra
        if (altura < alturaMaxima / 2.5) return 4; // Piedra
        return 5;                                  // Nieve
    }

    function añadirTriangulo(a, b, c) {
        const altura = (
            vertices[a * 3 + 1] +
            vertices[b * 3 + 1] +
            vertices[c * 3 + 1]
        ) / 3;

        const material = materialSegunAltura(altura);

        indicesPorMaterial[material].push(a, b, c);
    }

    // triangulos
    for (let z = 0; z < filas - 1; z++) {
        for (let x = 0; x < columnas - 1; x++) {

            const a = z * columnas + x;
            const b = a + 1;
            const c = (z + 1) * columnas + x;
            const d = c + 1;

            añadirTriangulo(a, c, b);
            añadirTriangulo(b, c, d);
        }
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(vertices), 3)
    );

    geometry.setAttribute(
        'uv',
        new THREE.Float32BufferAttribute(uvs, 2)
    );

    const indicesOrdenados = [];

    //Todos los indices de triangulos en un solo array que esta ordenado por tipo de material
    // porque asi tiene que recibir los triangulos addGroup para pdoer
    // aplicarle texturas diferentes
    for (let i = 0; i < indicesPorMaterial.length; i++) {

        const inicio = indicesOrdenados.length;

        for (const indice of indicesPorMaterial[i]) {
            indicesOrdenados.push(indice);
        }

        const cantidad = indicesOrdenados.length - inicio;

        if (cantidad > 0) {
            geometry.addGroup(inicio, cantidad, i);
        }
    }
    geometry.setIndex(indicesOrdenados);
    geometry.computeVertexNormals();
    /*
    //colores
    const posiciones = geometry.getAttribute('position');
    const colores = [];
    for (let i = 0; i < posiciones.count; i++) {
        const altura = posiciones.getY(i);

        if (altura < alturaMaxima/8) {
            colores.push(0.7, 0.5, 0.3);       // arena
        } else if (altura < alturaMaxima/6) {
            colores.push(0, 0.6, 0);     // Verde
        } else if (altura < alturaMaxima/4) {
            colores.push(0, 0.3, 0);     // Verde osc
        } else if (altura < alturaMaxima/3) {
            colores.push(0.5, 0.3, 0.1); // marrón
        } else if (altura < alturaMaxima/2.5) {
            colores.push(0.5, 0.5, 0.5); // piedra
        } else {
            colores.push(1, 1, 1);       // nieve
        }
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colores, 3));
    // Si se pone en lambert da un bug terrible que me ha costado 4 horas resolver. Mejor lo dejamos con brillito
    const material = new THREE.MeshPhongMaterial({
        vertexColors: true,
        side: THREE.FrontSide
    });
    */

    //texturas
    const loader = new THREE.TextureLoader();

    /*
    const texArena = loader.load("images/sand.png");
    const texTierra = loader.load("images/ground.png");
    const texHierba = loader.load("images/grass.png");
    */

    const nombresTexturas = [
        'sand',
        'grass',
        'forest',
        'ground',
        'stone',
        'snow'
    ];
    
    //Es un mapeo que coge el nombre d ela textura en mis archivos y lo
    // convierte en un material de three
    const materiales = nombresTexturas.map(nombre => {

        const textura = loader.load(`images/${nombre}.png`);

        textura.wrapS = THREE.RepeatWrapping;
        textura.wrapT = THREE.RepeatWrapping;

        textura.repeat.set(128, 128);

        // matiene aspecto pixelado
        textura.magFilter = THREE.NearestFilter;

        return new THREE.MeshPhongMaterial({
            map: textura,
            side: THREE.FrontSide
        });
    });

    const terreno = new THREE.Mesh(geometry, materiales);

    terreno.position.set(0, -20, 0);

    terreno.castShadow = true;
    terreno.receiveShadow = true;

    return terreno;
}


export function crearArboles(terreno, cantidadArboles = 150, rutaTextura="images/leafs.png", rutaNormal = "images/leafs_snow.png",  indiceMaterial=2) {

    const loader = new THREE.TextureLoader();
    const texHojas = loader.load(rutaTextura);

    const normalHojas = loader.load(rutaNormal);

    texHojas.wrapS = THREE.RepeatWrapping;
    texHojas.wrapT = THREE.RepeatWrapping;
    normalHojas.wrapS = THREE.RepeatWrapping;
    normalHojas.wrapT = THREE.RepeatWrapping;

    texHojas.repeat.set(4, 4);
    normalHojas.repeat.set(4, 4);

    const arboles = new THREE.Group();

    const grupoTriangulosForest = terreno.geometry.groups.find(
        grupo => grupo.materialIndex === indiceMaterial
    );

    const indices = terreno.geometry.index;
    const coordenadasVerticesTerreno = terreno.geometry.getAttribute('position');

    // Todas las esferas comparten geometría y material
    const geometriaEsfera = new THREE.SphereGeometry(1, 8, 6);
    const material = new THREE.MeshPhongMaterial({
        map: texHojas,
        normalMap: normalAgua,
        specular: 0x000000,
        shininess: 0
    });

    // Radios de las tres esferas, de abajo hacia arriba
    const radios = [3, 2.2, 1.5];

    // Actualizar coordenadas de lso vertices para que sean las de las escna
    terreno.updateMatrixWorld(true);

    for (let i = 0; i < cantidadArboles; i++) {

        // triang aleatorio
        const triangulo = grupoTriangulosForest.start +
            Math.floor(Math.random() * (grupoTriangulosForest.count / 3)) * 3;

        // vertices del triangulo
        const vertice_a_triangulo = indices.getX(triangulo);
        const vertice_b_triangulo = indices.getX(triangulo + 1);
        const vertice_c_triangulo = indices.getX(triangulo + 2);

        // un punto aleatorio dentro del triángulo
        let u = Math.random();
        let v = Math.random();

        if (u + v > 1) {
            u = 1 - u;
            v = 1 - v;
        }

        const w = 1 - u - v;

        const x = coordenadasVerticesTerreno.getX(vertice_a_triangulo) * w +
                  coordenadasVerticesTerreno.getX(vertice_b_triangulo) * u +
                  coordenadasVerticesTerreno.getX(vertice_c_triangulo) * v;

        const y = coordenadasVerticesTerreno.getY(vertice_a_triangulo) * w +
                  coordenadasVerticesTerreno.getY(vertice_b_triangulo) * u +
                  coordenadasVerticesTerreno.getY(vertice_c_triangulo) * v;

        const z = coordenadasVerticesTerreno.getZ(vertice_a_triangulo) * w +
                  coordenadasVerticesTerreno.getZ(vertice_b_triangulo) * u +
                  coordenadasVerticesTerreno.getZ(vertice_c_triangulo) * v;


        const arbol = new THREE.Group();

        let alturaSiguiente_Bola = 0;

        for (const radio of radios) {
            const esfera = new THREE.Mesh(geometriaEsfera, material);

            esfera.scale.setScalar(radio);
            esfera.position.y = alturaSiguiente_Bola + radio;
            esfera.castShadow = true;
            esfera.receiveShadow = true;

            arbol.add(esfera);

            alturaSiguiente_Bola += radio;
        }


        
        const punto = new THREE.Vector3(x, y, z);
        // pos del punto en el terreno a coordenadas globales
        terreno.localToWorld(punto);

        arbol.position.copy(punto);

        arbol.rotation.y = Math.random() * Math.PI * 2;

        const escala = 0.7 + Math.random() * 0.6;
        arbol.scale.multiplyScalar(escala);

        arboles.add(arbol);
    }

    return arboles;
}


export function colocarAleatoriamente(terreno, modelo, materialIndex, cantidad = 150, rotarXZ = false) {
    // Una version generica de colocar arboles para no repetir codigo tontamente
    const objetos = new THREE.Group();


    const grupoTriangulos = terreno.geometry.groups.find(
        grupo => grupo.materialIndex === materialIndex
    );

    const indices = terreno.geometry.index;
    const vertices = terreno.geometry.getAttribute('position');

    terreno.updateMatrixWorld(true);

    for (let i = 0; i < cantidad; i++) {

        // triang random
        const triangulo = grupoTriangulos.start +
            Math.floor(Math.random() * (grupoTriangulos.count / 3)) * 3;

        const a = indices.getX(triangulo);
        const b = indices.getX(triangulo + 1);
        const c = indices.getX(triangulo + 2);

        // punto random en el
        let u = Math.random();
        let v = Math.random();

        if (u + v > 1) {
            u = 1 - u;
            v = 1 - v;
        }

        const w = 1 - u - v;

        const x = vertices.getX(a) * w +
                  vertices.getX(b) * u +
                  vertices.getX(c) * v;

        const y = vertices.getY(a) * w +
                  vertices.getY(b) * u +
                  vertices.getY(c) * v;

        const z = vertices.getZ(a) * w +
                  vertices.getZ(b) * u +
                  vertices.getZ(c) * v;

        // a coordenadas globales
        const punto = new THREE.Vector3(x, y, z);
        terreno.localToWorld(punto);

        const copia = modelo.clone(true);
        copia.position.copy(punto);

        copia.rotation.y = Math.random() * Math.PI * 2;

        const escala = 0.7 + Math.random() * 0.6;
        copia.scale.multiplyScalar(escala);

        if (rotarXZ) {
            copia.rotation.x = (Math.random() - 0.5) * 0.9;
            copia.rotation.z = (Math.random() - 0.5) * 0.9;
        }

        objetos.add(copia);
    }

    return objetos;
}


export function crearModeloHierba() {


    const textura = new THREE.TextureLoader().load("images/grass.png");
    textura.magFilter = THREE.NearestFilter;

    const material = new THREE.MeshPhongMaterial({
        map: textura,
        side: THREE.DoubleSide,
        specular: 0x000000,
        shininess: 0
    });

    //ojo al truco: Esto permite crear triangulos
    const geometria = new THREE.ConeGeometry(0.5, 2, 3);

    const hierba = new THREE.Mesh(geometria, material);

    hierba.castShadow = true;
    hierba.receiveShadow = true;

    hierba.scale.set(1, 1.5, 1)

    return hierba;
}


export function crearModeloFlor(rutaTextura="images/flowers.png") {

    const textura = new THREE.TextureLoader().load(rutaTextura);

    const flor = new THREE.Group();

    const geometria = new THREE.PlaneGeometry(1, 2);
    const material = new THREE.MeshPhongMaterial({
        map: textura,
        side: THREE.DoubleSide,
        specular: 0x000000,
        shininess: 0
    });

    for (let i = 0; i < 4; i++) {

        const direccion = new THREE.Group();
        direccion.rotation.y = i * Math.PI / 2;

        const inclinacion = new THREE.Group();
        inclinacion.rotation.x = Math.PI / 2 - 0.35;

        const petalo = new THREE.Mesh(geometria, material);
        petalo.position.y = 1;

        inclinacion.add(petalo);
        direccion.add(inclinacion);
        flor.add(direccion);
    }

    flor.castShadow = true;
    flor.receiveShadow = true;

    flor.scale.multiplyScalar(0.5);

    return flor;
}

export function crearModeloGema(rutaTextura="images/iron.png") {


    const textura = new THREE.TextureLoader().load(rutaTextura);
    textura.magFilter = THREE.NearestFilter;

    const material = new THREE.MeshPhongMaterial({
        map: textura,
        specular: 0xffffff,
        shininess: 100
    });

    const geometria = new THREE.OctahedronGeometry(2);

    const gema = new THREE.Mesh(geometria, material);

    gema.castShadow = true;
    gema.receiveShadow = true;

    return gema;
}

export function crearModeloHielo(rutaTextura="images/ice.png") {


    const textura = new THREE.TextureLoader().load(rutaTextura);
    textura.magFilter = THREE.NearestFilter;

    const material = new THREE.MeshPhongMaterial({
        map: textura,
        transparent: true,
        opacity: 0.8,
        specular: 0xffffff,
        shininess: 10
    });

    const geometria = new THREE.OctahedronGeometry(6, 0);

    const gema = new THREE.Mesh(geometria, material);

    gema.scale.set(1, 10, 1)

    gema.receiveShadow = true;

    return gema;
}

let texNube;

export function crearNube(tamanyo, altura, offset) {
    texNube = new THREE.TextureLoader().load("images/clouds.png");

    texNube.magFilter = THREE.NearestFilter;
    texNube.minFilter = THREE.NearestFilter;

    const material = new THREE.MeshBasicMaterial({
        map: texNube,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
    });

    const geometria = new THREE.PlaneGeometry(tamanyo, tamanyo);
    const nube = new THREE.Mesh(geometria, material);

    nube.rotation.x = -Math.PI / 2;
    nube.position.set(0, altura, 0);

    texNube.center.set(0.5, 0.5);
    texNube.wrapS = THREE.RepeatWrapping;
    texNube.wrapT = THREE.RepeatWrapping;
    texNube.repeat.set(1, 1);

    return nube;
}

export function updateClouds() {
    const t = 0.0005;

    texNube.offset.x += t;
}
