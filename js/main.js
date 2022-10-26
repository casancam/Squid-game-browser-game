const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.setClearColor(0xb7c3f3, 1); //background color

const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
directionalLight.castShadow = true
scene.add( directionalLight )
directionalLight.position.set( 0, 1, 1 )


camera.position.z = 5; //how far is the camera

// Instantiate a loader
const loader = new THREE.GLTFLoader();
let doll

//global variables
const start_position = 6
const end_position = -start_position
const text = document.querySelector(".text")

//musics
const bgMusic = new Audio('../music/bg.mp3')
bgMusic.loop = true
const winMusic = new Audio('../music/win.mp3')
const loseMusic = new Audio('../music/lose.mp3')

const TIME_LIMIT = 15
let gameStat = 'loading'
let isLookingBackward = true


function createCube(size, positionX, rotY=0, color=0xfbc851) {
    const geometry = new THREE.BoxGeometry( size.w, size.h, size.d );
    const material = new THREE.MeshBasicMaterial( { color: color } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = positionX;
    cube.rotation.y = rotY
    scene.add( cube );
    return cube
}

function delays(ms){
    return new Promise(resolve=> setTimeout(resolve, ms));
}

class Doll{
    constructor(){
        loader.load("../models/scene.gltf", (gltf)=> {
        scene.add(gltf.scene);   
        gltf.scene.scale.set(.4,.4,.4);
        gltf.scene.position.set(0, -1, 0);
        this.doll = gltf.scene;
        })
    } 

    lookBackward(){
        gsap.to(this.doll.rotation, {y:-3.15, duration: 0.45});
        setTimeout(() => isLookingBackward = true, 150)
    }
    
    
    lookForward(){
        gsap.to(this.doll.rotation, {y:0, duration:0.45});
        setTimeout(() => isLookingBackward = false, 450)
    }

    async start(){
        this.lookBackward()
        await delays((Math.random()*1000)+1000)
        this.lookForward()
        await delays((Math.random()*750)+750)
        this.start()
    }
}


function createTrack() {
    createCube({w:start_position*2+.2, h:1.5, d:1}, 0, 0, 0xe5a716).position.z = -1;
    createCube({w:.2, h:1.5, d:1}, start_position, -.35);
    createCube({w:.2, h:1.5, d:1}, end_position, .35);
}
    
createTrack()

class Player{
    constructor(){
        const geometry = new THREE.SphereGeometry( .3, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.z = 1
        sphere.position.x = start_position
        scene.add( sphere );
        this.player = sphere
        this.playerInfo = {
            positionX : start_position,
            velocity: 0
        }
    }

    run() {
        this.playerInfo.velocity = .03
    }

    stop(){
        gsap.to(this.playerInfo, {velocity:0, duration: .1})
    }

    check() {
        if(this.playerInfo.velocity >0 && !isLookingBackward){
            text.innerText = "You lose!"
            gameStat='over'
        }

        if(this.playerInfo.positionX < end_position +.4){
            text.innerText= "You win!"
            gameStat='over'
        }
    }
    
    update(){
        this.check()
        this.playerInfo.positionX -= this.playerInfo.velocity
        this.player.position.x = this.playerInfo.positionX
    }

    
}

const player = new Player()

async function init(){
    await delays(500)
    text.innerText = "Starting in 3"
    await delays(500)
    text.innerText = "Starting in 2"
    await delays(500)
    text.innerText = "Starting in 1"
    await delays(500)
    text.innerText = "Gooo!!!"
    bgMusic.play()
    startGame()
}

function startGame(){
    gameStat = 'started'
    const progressBar = createCube({w: 8, h: .1, d: 1}, 0, 0, 0xebaa12)
    progressBar.position.y = 3.35
    gsap.to(progressBar.scale, {x:0, duration:TIME_LIMIT, ease:"none"})
    setTimeout(() => {
        if(gameStat!= "over"){
            text.innerText= "Time out!"
            loseMusic.play()
            gameStat = 'over'
        }
    }, TIME_LIMIT *1000);

    doll.start()
}

init()

doll = new Doll()

function animate() {
    if(gameStat=='over') return 
    player.update()
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
}
animate();


//let's make the window responsive so it ajusts the size
window.addEventListener('resize', onWindowResize, false);

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight);
}

window.addEventListener('keydown', (e) =>{
    if(gameStat != 'started') return
    if(e.key == 'ArrowUp'){
        player.run()
    }
})

window.addEventListener('keyup', (e) =>{
    if(e.key == 'ArrowUp'){
        player.stop()
    }
})