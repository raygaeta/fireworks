import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import gsap from 'gsap'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })
gui.domElement.style.position = 'absolute'
gui.domElement.style.left = '50%'
gui.domElement.style.transform = 'translateX(-50%)'
gui.hide()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

const textures = [
    textureLoader.load('./particles/1.png'),
    textureLoader.load('./particles/2.png'),
    textureLoader.load('./particles/3.png'),
    textureLoader.load('./particles/4.png'),
    textureLoader.load('./particles/5.png'),
    textureLoader.load('./particles/6.png'),
    textureLoader.load('./particles/7.png'),
    textureLoader.load('./particles/8.png'),
]

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}
sizes.resolution = new THREE.Vector2(sizes.width, sizes.height)

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.resolution.set(sizes.width, sizes.height)
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1.5, 0, 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enableZoom = false // Disable zoom

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Fireworks
 */
const createFirework = (count, position, size, texture, radius ) => 
{
    const positions = new Float32Array(count * 3)
    const sizesArray = new Float32Array(count)
    const timeMultiplierArray = new Float32Array(count)

    for(let i = 0; i < count; i++)
    {
        const i3 = i * 3

        const spherical = new THREE.Spherical(radius * (0.75 + Math.random() * 0.25), Math.random() * Math.PI, Math.random() * Math.PI * 2)
        const position = new THREE.Vector3()
        position.setFromSpherical(spherical)

        sizesArray[i] = Math.random()
        timeMultiplierArray[i] = 1 + Math.random()

        positions[i3] = position.x
        positions[i3 + 1] = position.y
        positions[i3 + 2] = position.z
    }

    const particlesGeometry = new THREE.BufferGeometry()
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1))
    particlesGeometry.setAttribute('aTimeMultiplier', new THREE.BufferAttribute(timeMultiplierArray, 1))
    texture.flipY = false
    const particlesMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        depthWrite: false,
        transparent: true,
        blending: THREE.AdditiveBlending,
        uniforms: {
            uSize: new THREE.Uniform(size),
            uResolution: new THREE.Uniform(sizes.resolution),
            uTexture: new THREE.Uniform(texture),
            uProgress: new THREE.Uniform(0)
        },
    })

    const destroy = () => {
        scene.remove(firework)
        particlesMaterial.dispose()
        particlesGeometry.dispose()
    }

    // Animate
    gsap.to(particlesMaterial.uniforms.uProgress, {
        value: 1,
        duration: 3,
        // separation of concern and consistent timing 
        ease: 'linear',
        onComplete: destroy
    })

    const firework = new THREE.Points(particlesGeometry, particlesMaterial)
    firework.position.copy(position)
    scene.add(firework)
}

const createRandomFireworks = () =>
{
    const count = Math.round(400 + Math.random() * 1000)
    const position = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random(),
        (Math.random() - 0.5) * 2
    )
    const size = 0.1 + Math.random() * 0.1
    const texture = textures[Math.floor(Math.random() * textures.length)]
    const radius = 0.5 + Math.random()

    createFirework(count, position, size, texture, radius)

}

createRandomFireworks()
window.addEventListener('click', createRandomFireworks)
window.addEventListener('touchstart', createRandomFireworks)

const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()