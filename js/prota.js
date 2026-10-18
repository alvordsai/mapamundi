


export function crearProta() {

    const prota = new THREE.Group();

    // Materiales
    const piel = new THREE.MeshLambertMaterial({color: 0xe8ad83 });
    const pelo = new THREE.MeshLambertMaterial({color: 0x404040});
    const peloOscuro = new THREE.MeshLambertMaterial({color: 0x252525});
    const camiseta = new THREE.MeshLambertMaterial({color: "blue"});
    const pantalon = new THREE.MeshLambertMaterial({color: "red"});
    const botas = new THREE.MeshLambertMaterial({color: 0x352b16});
    const guantes = new THREE.MeshLambertMaterial({color: "blue"});
    const cuero = new THREE.MeshLambertMaterial({color: 0x754026});
    const oro = new THREE.MeshPhongMaterial({
                    color: 0xD4AF37,
                    specular: 0xffffff,
                    shininess: 100
                });
    prota.userData.materialOro = oro;
    const cristal = new THREE.MeshPhongMaterial({
                    color: "cyan",
                    specular: 0xffffff,
                    shininess: 100
                });
    prota.userData.materialCristal = cristal;
    const negro = new THREE.MeshBasicMaterial({color: 0x16121a});
    const metal = new THREE.MeshPhongMaterial({
                    color: 0x808080,
                    specular: 0xffffff,
                    shininess: 120
                });
    prota.userData.materialMetal = metal;         
    const cabeza = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 8, 6),
        piel
    );
    cabeza.position.set(0, 3.55, 0);
    prota.add(cabeza);

    const cinta = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.40,
            0.40,
            0.12,
            32, 
            1,
            true, 
            Math.PI / 3, 
            Math.PI * 4 / 3
        ),
        oro
    );

    cinta.position.set(0, 3.57, 0);
    prota.add(cinta);


    for (let x of [-0.2, 0.2]) {
        const ojo = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.3, 0.1),
            oro
        );
        ojo.position.set(x, 3.57, 0.36);
        prota.add(ojo);

        const pupila = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 0.1),
            cristal
        );
        pupila.position.set(x, 3.57, 0.39);
        prota.add(pupila);
    }

    const basePelo = new THREE.Mesh(
        new THREE.SphereGeometry(0.40, 7, 5),
        pelo
    );
    basePelo.position.set(0, 3.84, -0.05);
    
    prota.add(basePelo);

    const basePelo2 = basePelo.clone()
    basePelo2.position.set(0, 3.6, -0.05);
    prota.add(basePelo2);

    // Para hacerlos rapido
    // 0 1 2 primeros son x y z
    // 6 7 8 son rotation

    const mechones = [
        
        [-0.27, 4.11, 0, 0.28, 0.8, 0.25, -0.55, 0, 0.4],
        [0.08, 4.28, -0.05, 0.27, 1.05, 0.27, 0, 0, 0.20],
        //[0.35, 4.12, 0, 0.25, 0.75, 0.25, 0.55, 0, -0.4],
        [-0.42, 3.92, 0.05, 0.24, 0.65, 0.24, 0, 0, 1.1],
        [0.43, 3.94, 0.05, 0.23, 0.65, 0.23, 0, 0, -1.1],
        [-0.12, 3.99, 0.32, 0.20, 0.54, 0.20, 0.7, 0, -0.3],
        [0.20, 4.01, 0.32, 0.20, 0.55, 0.20, 0.7, 0, 0.4],

        [-0.6, 3.62, 0, 0.15, 0.65, -1, -1.57, -0.70 , 1.57],
        [-0.3, 3.68, -0.36, 0.16, 0.72, -1,  0.79, 0 , 2.09],
        [ 0.00, 3.68, -0.4, 0.17, 0.70, -1, 0.79, 0 , 3.14],
        [ 0.3, 3.68, -0.36, 0.16, 0.72, -1,  0.79, 0 , -2.09],
        [0.6, 3.62, 0, 0.15, 0.65, -1, 1.57, -0.70 , -1.57],
        

        [-0.30, 3.25, -0.2, 0.15, 0.65, 0, 0.44, 0 , 3.14],
        [-0.15, 3.2, -0.3, 0.16, 0.72, 0,  0.44, 0 , 3.14],
        [ 0.00, 3.1, -0.35, 0.17, 0.70, 0, 0.44, 0 , 3.14],
        [ 0.15, 3.2, -0.3, 0.16, 0.72, 0,  0.44, 0 , 3.14],
        [ 0.30, 3.25, -0.2, 0.15, 0.65, 0,  0.44, 0 , 3.14],

        [-0.32, 3.25, 0.10, 0.13, 0.60, 0,  0, 0 , 3.14],
        [ 0.32, 3.25, 0.10, 0.13, 0.60, 0,  0, 0 , 3.14]

    ];

    for (let m of mechones) {
        const mechon = new THREE.Mesh(
            new THREE.ConeGeometry(m[3], m[4], 4),
            pelo
        );
        mechon.position.set(m[0], m[1], m[2]);
        mechon.rotation.set(m[6], m[7], m[8]);
        prota.add(mechon);
    }


    const cuello = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.15, 0.22, 6),
        piel
    );
    cuello.position.set(0, 3.17, 0);
    prota.add(cuello);

    const largoTorso = 1.05
    const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, largoTorso, 0.43),
        camiseta
    );
    torso.position.set(0, 2.65, 0);
    prota.add(torso);


    const cintur = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.18, 0.48),
        cuero
    );
    cintur.position.set(0, 2.25, 0);
    prota.add(cintur);

    const hebilla = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.14, 0.04),
        new THREE.MeshLambertMaterial({color: 0x999999})
    );
    hebilla.position.set(0, 2.25, 0.26);
    prota.add(hebilla);

    const cadera = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.35, 0.48),
        pantalon
    );
    cadera.position.set(0, 2.03, 0);
    prota.add(cadera);

    for (let lado of [-1, 1]) {

        const articulacionBrazo = new THREE.Group();

        articulacionBrazo.position.set(lado * 0.64, 2.97, 0);

        prota.add(articulacionBrazo);

        const hombro = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.32, 0.48),
            camiseta
        );
        hombro.position.set( 0, 0, 0);
        hombro.rotation.z = lado * 0.35;
        articulacionBrazo.add(hombro);

        const brazo = new THREE.Mesh(
            new THREE.CylinderGeometry(0.13, 0.11, 0.72, 6),
            piel
        );
        brazo.position.set(lado * 0.19, -0.39, 0);
        brazo.rotation.z = lado * 0.3;
        articulacionBrazo.add(brazo);

        const guante = new THREE.Mesh(
            new THREE.BoxGeometry(0.36, 0.52, 0.36),
            guantes
        );
        guante.position.set(lado * 0.37, -0.83, 0.06);
        guante.rotation.z = lado * 0.3;
        articulacionBrazo.add(guante);

        if (lado === -1) {
            prota.userData.brazoIzquierdo = articulacionBrazo;
        } else {
            prota.userData.brazoDerecho = articulacionBrazo;
        }

    }

    for (let lado of [-1, 1]) {

        const articulacionPierna = new THREE.Group();
        articulacionPierna.position.set(lado * 0.27, 1.9, 0);
        prota.add(articulacionPierna);

        const muslo = new THREE.Mesh(
            new THREE.CylinderGeometry(0.31, 0.25, 0.85, 5),
            pantalon
        );
        muslo.position.set(0, -0.38, 0);
        muslo.rotation.z = -lado * 0.10;
        articulacionPierna.add(muslo);
        
        const pierna = new THREE.Mesh(
            new THREE.CylinderGeometry(0.24, 0.19, 0.70, 5),
            pantalon
        );
        pierna.position.set(lado * 0.04, -1.02, 0);
        articulacionPierna.add(pierna);

        const bota = new THREE.Mesh(
            new THREE.BoxGeometry(0.39, 0.46, 0.45),
            botas
        );
        bota.position.set(lado * 0.05, -1.52, 0.02);
        articulacionPierna.add(bota);

        const punta = new THREE.Mesh(
            new THREE.BoxGeometry(0.42, 0.20, 0.68),
            botas
        );
        punta.position.set(lado * 0.05, -1.73, 0.21);
        articulacionPierna.add(punta);

        if (lado === -1) {
            prota.userData.piernaIzquierda = articulacionPierna;
        } else {
            prota.userData.piernaDerecha = articulacionPierna;
    }

    }

    const espada = new THREE.Group();
    espada.position.set(0, 4, -0.5);
    prota.userData.brazoIzquierdo.add(espada);
    const largoMango = 0.7
    const grosorMango = 0.1
    const mango = new THREE.Mesh(
        new THREE.CylinderGeometry(grosorMango, grosorMango, largoMango),
        cuero
    );
    mango.position.set(0, 0, 0);
    espada.add(mango);
    
    const anchoHoja = 0.4;
    const grosorHoja = grosorMango/2
    const largoHoja = largoTorso * 3;
    const hoja = new THREE.Mesh(
        new THREE.BoxGeometry(anchoHoja, largoHoja, grosorHoja, 1),
        metal
    );
    hoja.position.set(0, largoMango/2 - 0.2 + largoHoja/2, 0);
    espada.add(hoja);
    
    const largoFilo = 0.3;
    let geometriaFilo = new THREE.BufferGeometry();
    const verticesFilo = new Float32Array([
        // delantero
        - anchoHoja/2, 0, grosorHoja/2, // 0
        anchoHoja / 2, 0, grosorHoja/2, // 1
        0, largoFilo, grosorHoja/2, // 2
        //trasero
        - anchoHoja/2, 0, -grosorHoja/2, // 0
        anchoHoja / 2, 0, -grosorHoja/2, // 1
        0, largoFilo, -grosorHoja/2 // 2


    ])
    geometriaFilo.setAttribute(
        'position',
        new THREE.BufferAttribute(verticesFilo, 3)
    );
    geometriaFilo.setIndex([
        0, 1, 2,  // delantera
        3, 5, 4,  // trasera

        0, 3, 4,  // Base
        0, 4, 1,

        0, 2, 5,  // Lat izquierdo
        0, 5, 3,

        1, 4, 5,  // Lat derecho
        1, 5, 2
    ]);
    geometriaFilo = geometriaFilo.toNonIndexed();
    geometriaFilo.computeVertexNormals();
    // para pdoer dibujar las dos caras
    const materialFilo = metal.clone();
    materialFilo.side = THREE.DoubleSide;
    const filo = new THREE.Mesh(geometriaFilo, materialFilo);
    filo.position.set(0, hoja.position.y + largoHoja / 2, 0);
    espada.add(filo);
    espada.position.set(-0.37, -0.83, 0.06);
    espada.rotation.x = Math.PI / 2;
    espada.rotation.y = Math.PI / 2;



    // que todo proyecte sombra
    prota.traverse(function(objeto) {
        if (objeto.isMesh) {
            objeto.castShadow = true;
            objeto.receiveShadow = true;
        }
    });
    // test
    prota.userData.piernaIzquierda.rotation.x = 0.5;
    return prota;
}