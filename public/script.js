var bufferSize = 1024;
var bufferWidth = bufferSize;
var bufferHeight = bufferSize;

var showTexture = false;
var speed = 0.5;
var saturation = 3.0;
var lightness = 1.5;
var isPaused = false;
var textureZoom = 2.2;
var isDragging = false;
var useEnvMap = true;
var reflectivity = 0.7;
var envMapSelect = 1;


var scene = new THREE.Scene();

var bufferCamera = new THREE.PerspectiveCamera(75, bufferWidth / bufferHeight, 0.1, 1000);
bufferCamera.position.z = textureZoom;

var camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 1000);
camera.position.z = 5;
camera.zoom = 1.5;
camera.updateProjectionMatrix();

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new THREE.TrackballControls(bufferCamera, renderer.domElement);
controls.noZoom = true;
controls.dynamicDampingFactor = 0.5;
controls.rotateSpeed = 1;

var controls2 = new THREE.OrbitControls(camera, renderer.domElement);
controls2.enableZoom = true;
controls2.enableRotate = false;
controls2.zoomSpeed = 0.3;
controls2.minZoom = 0.2;
controls2.maxZoom = 2;
controls2.enablePan = false;




var bufferScene = new THREE.Scene();
var bufferTexture = new THREE.WebGLRenderTarget(bufferWidth, bufferHeight, { minFilter: THREE.LinearMipMapLinearFilter, magFilter: THREE.LinearFilter, antialias: true });


var urls = [
    'images/cubeMaps/1/pos-x.png',
    'images/cubeMaps/1/neg-x.png',
    'images/cubeMaps/1/pos-y.png',
    'images/cubeMaps/1/neg-y.png',
    'images/cubeMaps/1/pos-z.png',
    'images/cubeMaps/1/neg-z.png'
];

var cubemap = THREE.ImageUtils.loadTextureCube(urls);
cubemap.format = THREE.RGBFormat;

/// buffer scene objects

var numAxes = 12;
var allShapes = [];
var numShapes = 10;
var complexity = 5;

function createShapes() {
    for (var i = 0; i < numShapes; i++) {
        var shape = new TorusKnotShape();
        shape.update();
        bufferScene.add(shape.mesh);
        allShapes[i] = shape;

        if (i < complexity) {
            shape.mesh.visible = true;
        } else {
            shape.mesh.visible = false;
        }
    }
}
createShapes();


var ambientLight = new THREE.AmbientLight(0x808080);
bufferScene.add(ambientLight);

var pointLight = new THREE.PointLight(0xaaaaaa);
pointLight.position.set(0, 50, 200);
bufferScene.add(pointLight);

var pointLight = new THREE.PointLight(0x404040);
pointLight.position.set(0, 50, -200);
bufferScene.add(pointLight);



// Kaleidoscope Grid


var grid = new KaleidoscopeGrid(bufferTexture);

function updateGridGeometry() {
    scene.remove(grid.mesh);
    grid.createGeometry();
    scene.add(grid.mesh);
}
updateGridGeometry();


// texture plane
var planeMat = new THREE.MeshBasicMaterial({ map: bufferTexture, side: THREE.DoubleSide });
var planeGeo = new THREE.PlaneGeometry(bufferWidth / 2, bufferHeight / 2);
var planeObj = new THREE.Mesh(planeGeo, planeMat);
scene.add(planeObj);
planeObj.visible = false;


// GUI

var gui = new dat.GUI();
gui.add(this, "speed", 0, 2);
var gridZoomControl = gui.add(camera, "zoom", 0.2, 2).listen();
var textureControl = gui.add(this, "showTexture");
var complexityControl = gui.add(this, "complexity", 1, 10).step(1);
var textureZoomControl = gui.add(this, "textureZoom", 1, 3);
var saturationControl = gui.add(this, "saturation", 0, 3);
var lightnessControl = gui.add(this, "lightness", 0, 3);
var useEnvMapControl = gui.add(this, "useEnvMap");
var reflectivityControl = gui.add(this, "reflectivity", 0, 1);
var envMapSelectControl = gui.add(this, "envMapSelect", [1, 2, 3, 4, 5, 6]);
gui.add(this, "randomize");
gui.add(this, "randomizeColor");
var numAxesControl = gui.add(this, "numAxes", [4, 6, 8, 12, 16, 18, 20, 24, 28, 30, 32, 36]);
gui.add(this, "isPaused").listen();



gui.close();

envMapSelectControl.onChange(function(value) {

    var urls = [
        'images/cubeMaps/' + envMapSelect + '/pos-x.png',
        'images/cubeMaps/' + envMapSelect + '/neg-x.png',
        'images/cubeMaps/' + envMapSelect + '/pos-y.png',
        'images/cubeMaps/' + envMapSelect + '/neg-y.png',
        'images/cubeMaps/' + envMapSelect + '/pos-z.png',
        'images/cubeMaps/' + envMapSelect + '/neg-z.png'
    ];

    cubemap = THREE.ImageUtils.loadTextureCube(urls);
    cubemap.format = THREE.RGBFormat;

    document.dispatchEvent(new Event("updateMaterial"));
});

reflectivityControl.onChange(function(value) {
    document.dispatchEvent(new Event("updateMaterial"));
});

useEnvMapControl.onChange(function(value) {
    document.dispatchEvent(new Event("updateMaterial"));
});

gridZoomControl.onChange(function(value) {
    camera.updateProjectionMatrix();
});

textureZoomControl.onChange(function(value) {
    bufferCamera.position.z = textureZoom;
});

numAxesControl.onChange(function(value) {
    updateGridGeometry();
});

textureControl.onChange(function(value) {
    planeObj.visible = showTexture;
    scene.add(planeObj);
});

complexityControl.onChange(function(value) {
    for (var i = 0; i < numShapes; i++) {
        if (i < complexity) {
            allShapes[i].mesh.visible = true;
        } else {
            allShapes[i].mesh.visible = false;
        }
    }
});

saturationControl.onChange(function(value) {
    for (var i = 0; i < numShapes; i++) {
        allShapes[i].updateColor();
    }
});

lightnessControl.onChange(function(value) {
    for (var i = 0; i < numShapes; i++) {
        allShapes[i].updateColor();
    }
});

function randomize() {
    for (var i = 0; i < numShapes; i++) {
        allShapes[i].update();
        bufferScene.remove(allShapes[i].mesh);
    }
    createShapes();
}

function randomizeColor() {
    for (var i = 0; i < numShapes; i++) {
        allShapes[i].randomizeColor();
    }
}


function render() {
    update();

    renderer.render(bufferScene, bufferCamera, bufferTexture);
    renderer.render(scene, camera);

    requestAnimationFrame(render);
}
render();

function update() {
    controls.update();

    if (!isPaused && !isDragging) {
        for (var i = 0; i < complexity; i++) {
            allShapes[i].update();
        }
    }
}

window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);

    camera.left = window.innerWidth / -2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / -2;
    camera.updateProjectionMatrix();
});

window.addEventListener('keydown', function(e) {
    e = e || window.event;

    if (e.keyCode == '32') {
        isPaused = !isPaused;
    }
});

renderer.domElement.addEventListener('mousedown', function() {
    isDragging = true;
});

renderer.domElement.addEventListener('mouseup', function() {
    isDragging = false;
});

renderer.domElement.addEventListener('touchstart', function() {
    isDragging = true;
});

renderer.domElement.addEventListener('touchend', function() {
    isDragging = false;
});

var socket = io('http://localhost', {
    transports: ['websocket', 'polling']
});

socket.on('sensor_reading', function(data) {
    console.log(data);

    update();
});