import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import { VRControls } from 'three/examples/jsm/controls/VRControls.js';
// import { VRDisplay } from 'three/examples/jsm/vr/VRDisplay.js';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
 

    const renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; 
    document.body.appendChild(renderer.domElement);
    renderer.render(scene, camera);
   
    // Add VR button
    document.body.appendChild( VRButton.createButton( renderer ) );

    const controls = new OrbitControls(camera, renderer.domElement);

    camera.position.x = 0;
    camera.position.y = 6;
    camera.position.z = 16;

    camera.rotation.x = 6.1;
    // Load the GLTF rocketship model
    let rocketship;
    const loader = new GLTFLoader();
    loader.load(
    "assets/models/rocket/scene.gltf",
    (gltf) => {
        rocketship = gltf.scene;
        rocketship.position.y = 1;

        rocketship = gltf.scene;
        rocketship.position.set(0, 30, -60);
        rocketship.rotation.set(.4, 0, .1);

        scene.add(rocketship);
        animateRocketship(); // Start animating the rocketship after it is loaded

    },
    undefined,
    (error) => console.error(error)
    );


    const loader2 = new GLTFLoader();
    let ground;
    loader2.load(
    "assets/models/ground/scene.gltf",
    (gltf) => {
        ground = gltf.scene;
        ground.position.y = -1;
        ground = gltf.scene;
        ground.scale.set(10, 10, 10);
        scene.add(ground);

    },
    undefined,
    (error) => console.error(error)
    );

    function animateRocketship() {
        const startPosition = new THREE.Vector3(0, 30, -60);
        const endPosition = new THREE.Vector3(0, 0, 0);
        const startRotation = new THREE.Vector3(0.4, 0, 0.1);
        const endRotation = new THREE.Vector3(0, 0, 0);
        const oscillationRotation1 = new THREE.Vector3(0.4, 0, 0.1);
        const oscillationRotation2 = new THREE.Vector3(0.4, 0, -0.1);
        const animationDuration = 5000; // Animation duration in milliseconds
        const startTime = performance.now();
        const slowdownFactor = 2; // Higher values cause the rocket to slow down more towards the end

        function easeOutQuint(t) {
            return 1 - Math.pow(1 - t, slowdownFactor);
        }

        function updateRocketshipPosition() {
            const currentTime = performance.now();
            const elapsedTime = currentTime - startTime;

            if (elapsedTime >= animationDuration) {
            rocketship.position.copy(endPosition);
            rocketship.rotation.setFromVector3(endRotation);
            } else {
            const progress = elapsedTime / animationDuration;
            const easedProgress = easeOutQuint(progress);
            rocketship.position.lerpVectors(startPosition, endPosition, easedProgress);

            // Oscillate the rotation between oscillationRotation1 and oscillationRotation2
            const oscillationProgress = Math.sin(progress * Math.PI * 2);
            const currentRotation = new THREE.Vector3().lerpVectors(
                oscillationRotation1,
                oscillationRotation2,
                (oscillationProgress + 1) / 2
            );

            // Interpolate between the current rotation and the end rotation
            rocketship.rotation.setFromVector3(
                currentRotation.lerp(endRotation, easedProgress)
            );

            requestAnimationFrame(updateRocketshipPosition);
            }
        }

        updateRocketshipPosition();
        }
    // Add a directional light
    const light = new THREE.DirectionalLight(0xffffff, 1.8);
    light.position.set(1, 2, 4);
    scene.add(light);




    function createPathStrings(filename) {
            const basePath = "assets/skybox/";
            const baseFilename = basePath + filename;
            const fileType = ".jpg";
            const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
            const pathStings = sides.map(side => {
                return baseFilename + "_" + side + fileType;
            });
            
            return pathStings;
        }
        
        let skyboxImage = "skybox";
        
        function createMaterialArray(filename) {
            const skyboxImagepaths = createPathStrings(filename);
            const materialArray = skyboxImagepaths.map(image => {
                let texture = new THREE.TextureLoader().load(image);
            
                return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
            });
            return materialArray;
        }
        
        const materialArray = createMaterialArray(skyboxImage);
        const skyboxGeo =  new THREE.BoxGeometry(600, 600, 600);
        const skybox = new THREE.Mesh(skyboxGeo, materialArray);

        scene.add(skybox);



        function animate() {
            requestAnimationFrame(animate);

            renderer.render(scene, camera);
        }

        animate();


