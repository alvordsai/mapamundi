
import { crearSkybox, 
  crearOceano, 
  updateOcean, 
  crearTerrenoDeHeightmap, 
  colocarAleatoriamente,
  crearArboles, 
  crearModeloHierba,
  crearModeloFlor,
  crearModeloGema,
  crearModeloHielo,
  crearNube,
  updateClouds} from './mundo.js';
import { crearProta } from './prota.js';

const tamanyoMundo = 1000;



//movimiento prota

const teclas = {
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
};

window.addEventListener('keydown', function(event) {
    const tecla = event.key.toLowerCase();

    if (tecla in teclas) {
        teclas[tecla] = true;
    }
});

window.addEventListener('keyup', function(event) {
    const tecla = event.key.toLowerCase();

    if (tecla in teclas) {
        teclas[tecla] = false;
    }
});











(async function () {
  const contenedor = document.querySelector('#escena');

  try {
    const escena = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.SoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    contenedor.appendChild(renderer.domElement);

    renderer.domElement.setAttribute(
      'aria-label',
      'Mapamundi'
    );




    //LUCES
    const luzAmbiental = new THREE.AmbientLight(0xF97316, 0.4)
    escena.add(luzAmbiental);

    const luzMinimapa = new THREE.DirectionalLight(0xffffff, 1)
    luzMinimapa.y = tamanyoMundo-10;
    escena.add(luzMinimapa);

    const sol = new THREE.DirectionalLight(0xf97316, 2);
    sol.position.set(-tamanyoMundo, tamanyoMundo/4.5, 0);
    sol.target.position.set(0, 0, 0);
    escena.add(sol);
    sol.castShadow = true;
    
    sol.shadow.mapSize.width = 1024;
    sol.shadow.mapSize.height = 1024;
    
    sol.shadow.camera.left = -tamanyoMundo/2;
    sol.shadow.camera.right = tamanyoMundo/2;
    sol.shadow.camera.top = tamanyoMundo/2;
    sol.shadow.camera.bottom = -tamanyoMundo/2;

    sol.shadow.camera.near = 1;
    sol.shadow.camera.far = 2000;
    sol.shadow.bias = -0.0001;
    sol.shadow.normalBias = 0.5;


    //CAMARAS

    const camara = new THREE.PerspectiveCamera(30, 1, 0.1, tamanyoMundo*2);
    // Controles de cam
    const controlesCam = new THREE.OrbitControls(camara, renderer.domElement);
    controlesCam.enableDamping = true;
    controlesCam.minDistance = 10;
    controlesCam.maxDistance = tamanyoMundo*0.75;
    controlesCam.maxPolarAngle = Math.PI / 2 - 0.02;
    controlesCam.maxPolarAngle = Math.PI / 2;
    controlesCam.update();


    const camaraCenital = new THREE.OrthographicCamera(
      -tamanyoMundo/2, tamanyoMundo/2,
      tamanyoMundo/2, -tamanyoMundo/2,
      1, 2000
    );

    let anchoVista, altoVista, ladoMiniatura;

    camaraCenital.position.set(0, 1000, 0);
    camaraCenital.up.set(0, 0, -1);
    camaraCenital.lookAt(0, 0, 0);

    



    //ACCIÓN
    const oceano = crearOceano(tamanyoMundo);
    escena.add(oceano);

    //Esto se usa para inclinarlo con las montañas sin que se bugee
    const prota = new THREE.Group();
    const modeloProta = crearProta();

    prota.add(modeloProta);
    escena.add(prota);
    prota.position.set(50, 0, 70)
    prota.rotation.y = - Math.PI / 2




    // Triangulo minimapa
    const geometriaTriangulo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        0, 0, 24,     // Punta
        14, 0, -14,   // Derecha
        -14, 0, -14   // Izquierda
    ]);
    geometriaTriangulo.setAttribute(
        'position',
        new THREE.BufferAttribute(vertices, 3)
    );
    const materialTriangulo = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false
    });
    const triangulo = new THREE.Mesh(geometriaTriangulo, materialTriangulo);
    triangulo.position.y = 900;
    triangulo.renderOrder = 1;
    triangulo.visible = false;
    triangulo.scale.set(3, 3, 3);
    prota.add(triangulo);




    let tiempoCaminar = 0;
    const reloj = new THREE.Clock();
    let intensidadCaminar = 0;
    const posicionAnteriorProta = prota.position.clone();
    //Empezamos mirando al prota
    controlesCam.target.set(
        prota.position.x,
        prota.position.y + 2,
        prota.position.z
    );
    camara.position.set(
        prota.position.x - 80,
        prota.position.y + 10,
        prota.position.z + 20,
    );
    camara.rotation.y = - Math.PI / 2
    controlesCam.update();

    const rangoluzProta = 50;
    const luzProtagonista = new THREE.SpotLight(
      0xffffff,
      2,
      rangoluzProta,
    );

    // ojo que son relativas al prota tras añadirlo
    luzProtagonista.position.set(0, 5, 0.1);
    luzProtagonista.target.position.set(0, 5, 50);


    luzProtagonista.castShadow = true;
    luzProtagonista.shadow.mapSize.width = 1024;
    luzProtagonista.shadow.mapSize.height = 1024;
    luzProtagonista.shadow.camera.left = -tamanyoMundo/2;
    luzProtagonista.shadow.camera.right = tamanyoMundo/2;
    luzProtagonista.shadow.camera.top = tamanyoMundo/2;
    luzProtagonista.shadow.camera.bottom = -tamanyoMundo/2;
    luzProtagonista.shadow.camera.near = 1;
    luzProtagonista.shadow.camera.far = tamanyoMundo;
    prota.add(luzProtagonista);
    prota.add(luzProtagonista.target);

    const skybox = await crearSkybox(tamanyoMundo);
    skybox.rotation.y = Math.PI
    escena.add(skybox);

    const imagenesSky = skybox.material.map(material => material.map.image);
    const envMapSky = new THREE.CubeTexture(imagenesSky);
    envMapSky.needsUpdate = true;
    envMapSky.encoding = THREE.sRGBEncoding;

    oceano.material.envMap = envMapSky;
    oceano.material.combine = THREE.MixOperation;
    oceano.material.reflectivity = 0.3;
    oceano.material.needsUpdate = true;
    

    modeloProta.userData.materialOro.envMap = envMapSky;
    modeloProta.userData.materialOro.reflectivity = 0.9;
    modeloProta.userData.materialMetal.envMap = envMapSky;
    modeloProta.userData.materialMetal.reflectivity = 0.7;
    modeloProta.userData.materialCristal.envMap = envMapSky;
    modeloProta.userData.materialCristal.reflectivity = 1;

    const terreno = await crearTerrenoDeHeightmap(tamanyoMundo);
    escena.add(terreno);

    const arboles = crearArboles(terreno, 500, "images/leafs.png", "images/leafs.png", 2);
    escena.add(arboles);

    const arbolesNevados = crearArboles(terreno, 50, "images/leafs_snow.png", "images/leafs_snow.png", 5);
    escena.add(arbolesNevados);

    const modeloHierba = crearModeloHierba();
    const hierbas_cesped = colocarAleatoriamente(
      terreno,
      modeloHierba,
      1,
      300,
      true
    );
    escena.add(hierbas_cesped);
    const hierbas_bosque = colocarAleatoriamente(
      terreno,
      modeloHierba,
      2,
      500,
      true
    );
    escena.add(hierbas_bosque);

    const modeloFlorCesped = crearModeloFlor("images/flowers_pink.png");
    const flores_cesped = colocarAleatoriamente(
      terreno,
      modeloFlorCesped,
      1,
      500
    );
    escena.add(flores_cesped);

    const modeloFlorBosque = crearModeloFlor("images/flowers_blue.png");
    const flores_bosque = colocarAleatoriamente(
      terreno,
      modeloFlorBosque,
      2,
      500
    );
    escena.add(flores_bosque);

    const modeloHierro = crearModeloGema("images/iron.png");
    modeloHierro.material.envMap = envMapSky;
    modeloHierro.material.combine = THREE.MixOperation;
    modeloHierro.material.reflectivity = 0.7;
    modeloHierro.material.needsUpdate = true;
    const hierro = colocarAleatoriamente(
      terreno,
      modeloHierro,
      3,
      100,
      true
    );
    escena.add(hierro);

    const modeloOro = crearModeloGema("images/gold.png");
    modeloOro.material.envMap = envMapSky;
    modeloOro.material.combine = THREE.MixOperation;
    modeloOro.material.reflectivity = 0.8;
    modeloOro.material.needsUpdate = true;
    const oro = colocarAleatoriamente(
      terreno,
      modeloOro,
      4,
      20,
      true
    );
    escena.add(oro);

    const modeloDiamante = crearModeloGema("images/diamond.png");
    modeloDiamante.material.envMap = envMapSky;
    modeloDiamante.material.combine = THREE.MixOperation;
    modeloDiamante.material.reflectivity = 0.7;
    modeloDiamante.material.needsUpdate = true;
    const diamond = colocarAleatoriamente(
      terreno,
      modeloDiamante,
      4,
      20,
      true
    );
    escena.add(diamond);

    const modeloHielo = crearModeloHielo("images/ice.png");
    modeloHielo.scale.set(2,2,2)
    modeloHielo.material.envMap = envMapSky;
    modeloHielo.material.combine = THREE.MixOperation;
    modeloHielo.material.reflectivity = 0.7;
    modeloHielo.material.needsUpdate = true;
    const iglu = colocarAleatoriamente(
      terreno,
      modeloHielo,
      5,
      5,
      true
    );
    escena.add(iglu);

    const nubes = crearNube(tamanyoMundo*2, 200)
    escena.add(nubes);






    // PROTAGONISTA A LA ALTURA ;P
    const raycastAltura = new THREE.Raycaster();
    const direccionRaycastAltura = new THREE.Vector3(0, -1, 0);
    // Y girado
    const normalTerreno = new THREE.Vector3();
    const arriba = new THREE.Vector3(0, 1, 0);
    const inclinacionObjetivo = new THREE.Quaternion();


    // Lugares
    const lugares = [];
    let lugaresEncontrados = 0;

    const contador = document.querySelector('#contador-lugares'); 
    function crearMarcadoresLugar(nombre, x, z) {
      const grupo = new THREE.Group();
      const rayo = new THREE.Raycaster(
          new THREE.Vector3(x, 300, z),
          new THREE.Vector3(0, -1, 0)
      );
      const impactos = rayo.intersectObject(terreno);
      if (impactos.length === 0) return;
      // Para colocar el rombo siempre un pcoo por encima d ela zona
      grupo.position.set(x, impactos[0].point.y + 20, z);
      const geometria = new THREE.PlaneGeometry(5, 5);
      const material = new THREE.MeshPhongMaterial({
          color: "purple",
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide
      });
      const rombo = new THREE.Mesh(geometria, material);
      rombo.rotation.z = Math.PI / 4;
      grupo.add(rombo);
      escena.add(grupo);
      lugares.push({
        grupo: grupo,
        rombo: rombo,
        texto: nombre,
        encontrado: false
    });
  }
  crearMarcadoresLugar("1", 100, 120);
  crearMarcadoresLugar("2", -150, -200);
  crearMarcadoresLugar("3", 200, -100);
  crearMarcadoresLugar("4", -50, 120);
  crearMarcadoresLugar("5", -0, -315);
  crearMarcadoresLugar("6", 0, 0);

  contador.textContent =
    "Lugares encontrados: 0 de " + lugares.length;

    function ajustar() {
      

      anchoVista = Math.max(1, contenedor.clientWidth);
      altoVista = Math.max(1, contenedor.clientHeight);

      renderer.setSize(anchoVista, altoVista);

      camara.aspect = anchoVista / altoVista;
      camara.updateProjectionMatrix();

      ladoMiniatura = Math.min(anchoVista, altoVista) / 4;
    }

    const direccionCamara = new THREE.Vector3();
    const derechaCamara = new THREE.Vector3();
    const movimiento = new THREE.Vector3();


    function rotarProta(prota, movimiento, suavidad = 0.3) {      const anguloObjetivo = Math.atan2(movimiento.x, movimiento.z);

      const diferencia = Math.atan2(
          Math.sin(anguloObjetivo - prota.rotation.y),
          Math.cos(anguloObjetivo - prota.rotation.y)
      );

      prota.rotation.y += diferencia * suavidad;
    }


    function dibujar() {
      //tiempo desde la anterior llamada a dibujar
      const delta = reloj.getDelta();

      // Movimiento

      let velocidad = 1;
      // direccion al a que mira la camara
      camara.getWorldDirection(direccionCamara);

      direccionCamara.y = 0;
      /// para que mida 1 maximo
      direccionCamara.normalize();
      derechaCamara.set(
        -direccionCamara.z,
        0,
        direccionCamara.x
      );

      movimiento.set(0, 0, 0);

      if (teclas.w) movimiento.add(direccionCamara);
      if (teclas.s) movimiento.sub(direccionCamara);
      if (teclas.d) movimiento.add(derechaCamara);
      if (teclas.a) movimiento.sub(derechaCamara);
      if (teclas.shift) velocidad = 2;

      if (movimiento.lengthSq() > 0) {
          /// para que mida 1 maximo
          movimiento.normalize();
          prota.position.addScaledVector(movimiento, velocidad);
          // x,z por que es el plano del suelo
          rotarProta(prota, movimiento);
      }
      const caminando = movimiento.lengthSq() > 0;
      const intensidadObjetivo = caminando ? 1 : 0;
      //He necesitado ayuda en esto. Basicamente es una forma de ir avanzando suavemente
      intensidadCaminar +=
        (intensidadObjetivo - intensidadCaminar) *
        Math.min(1, delta * 8);

      if (caminando) {
          tiempoCaminar += delta * 8;
      }
      const angulo = Math.sin(tiempoCaminar) * 0.5 * intensidadCaminar;
      modeloProta.userData.piernaIzquierda.rotation.x = angulo;
      modeloProta.userData.piernaDerecha.rotation.x = -angulo;
      modeloProta.userData.brazoIzquierdo.rotation.x = -angulo * 0.7;
      modeloProta.userData.brazoDerecho.rotation.x = angulo * 0.7;                

      // Prota a la altura
      raycastAltura.set(new THREE.Vector3(prota.position.x,300, prota.position.z), direccionRaycastAltura);
      const inters = raycastAltura.intersectObject(terreno);  
      if (inters.length > 0) {
        prota.position.y = inters[0].point.y;
        normalTerreno.copy(inters[0].face.normal);
        normalTerreno.transformDirection(terreno.matrixWorld);
        normalTerreno.applyAxisAngle(arriba, -prota.rotation.y);
        inclinacionObjetivo.setFromUnitVectors(arriba, normalTerreno);
        modeloProta.quaternion.slerp(inclinacionObjetivo, 0.1);

      }

      const desplazamientoProtaAnteriorFrame = prota.position.clone().sub(posicionAnteriorProta);
      camara.position.add(desplazamientoProtaAnteriorFrame);
      controlesCam.target.add(desplazamientoProtaAnteriorFrame);
      posicionAnteriorProta.copy(prota.position);


      controlesCam.update();

      // hacemos lo mismo con la camara para qu eno esté por debajo del terreno

      raycastAltura.set(
        new THREE.Vector3(camara.position.x, 300, camara.position.z),
        direccionRaycastAltura
      );

      const intersCamara = raycastAltura.intersectObject(terreno);

      if (intersCamara.length > 0) {
          const alturaMinima = intersCamara[0].point.y + 2;

          if (camara.position.y < alturaMinima) {
              camara.position.y = alturaMinima;
          }
      }

      for (const lugar of lugares) {
        // cOPIA orientación actual de la camara.
          lugar.grupo.quaternion.copy(camara.quaternion);
          const dx = prota.position.x - lugar.grupo.position.x;
          const dz = prota.position.z - lugar.grupo.position.z;

          const distanciaAProta = Math.sqrt(dx * dx + dz * dz);

          if (distanciaAProta < 25 && !lugar.encontrado) {

            lugar.encontrado = true;

            lugaresEncontrados++;

            contador.textContent =
              "Lugares encontrados: " + lugaresEncontrados
              + " de " + lugares.length;
            // Cambiar a verde una vez descubierto
            lugar.rombo.material.color.set(0x00ff00);

            lugar.rombo.scale.set(2, 2, 2)
        }


      }

      // principal
      renderer.setViewport(0, 0, anchoVista, altoVista);
      renderer.setScissorTest(false);
      renderer.clear();
      renderer.render(escena, camara);

      // Cenital
      const x = anchoVista - ladoMiniatura;
      const y = 0;

      renderer.setViewport(x, y, ladoMiniatura, ladoMiniatura);
      renderer.setScissor(x, y, ladoMiniatura, ladoMiniatura);
      renderer.setScissorTest(true);

      renderer.clear();
      triangulo.visible = true;
      luzMinimapa.visible = true;
      sol.visible= false;
      nubes.visible = false;
      luzProtagonista.visible = false;
      for (const lugar of lugares) {
          lugar.grupo.quaternion.copy(camaraCenital.quaternion);
          lugar.grupo.scale.set(8, 8, 8);
          lugar.rombo.material.opacity = 1;
      }
      renderer.render(escena, camaraCenital);
      triangulo.visible = false;
      luzMinimapa.visible = false;
      sol.visible= true;
      nubes.visible=true;
      luzProtagonista.visible = true;
      for (const lugar of lugares) {
          lugar.grupo.quaternion.copy(camara.quaternion);
          lugar.grupo.scale.set(1, 1, 1);
          lugar.rombo.material.opacity = 0.5;
      }

      renderer.setScissorTest(false);

      updateOcean();
      updateClouds();

      
    }

    window.addEventListener('resize', ajustar);

    ajustar();
    renderer.setAnimationLoop(dibujar);

  } catch (e) {
    console.error(e);
  }

})();
