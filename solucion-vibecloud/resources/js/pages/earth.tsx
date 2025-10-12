import React from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars, PerspectiveCamera, Html } from '@react-three/drei'


import EarthColorMap from "../../assests/8k_earth_nightmap.jpg"
import EarthSpecularMap from '../../assests/8k_earth_specular_map.jpg'
import EarthCloudsMap from '../../assests/8k_earth_clouds.jpg'


import * as THREE from 'three'

type MarkerDescriptor = {
    name?: string,
    city?: string,
    delay?: number,
    lat?: number,
    lon?: number,
    height?: number,
    markerSize?: number,
    position: { x: number, y: number, z: number },
    quaternion: [number, number, number, number]
}

type EarthProps = {
    datasetUrl?: string,
    markers?: MarkerDescriptor[]
}

function Marker({ d }: { d: MarkerDescriptor }) {
    // Render a small box oriented based on descriptor quaternion and positioned relative to Earth's mesh
    const q = React.useMemo(() => new THREE.Quaternion(d.quaternion[0], d.quaternion[1], d.quaternion[2], d.quaternion[3]), [d.quaternion]);
    // Descriptor positions are already relative to the globe center (origin),
    // and the Earth mesh is translated to [0,0,3]. When rendered as children of the
    // Earth mesh we should use the descriptor position directly so Three applies the parent's transform.
    const pos = React.useMemo(() => [d.position.x, d.position.y, d.position.z] as [number, number, number], [d.position]);
    const size = d.markerSize ?? 0.02
    const [hovered, setHovered] = React.useState(false)

    return (
        <mesh
            position={pos}
            quaternion={q}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(false) }}
        >
            <boxGeometry args={[size, size, d.height ?? 0.1]} />
            <meshStandardMaterial color={hovered ? 0xffff66 : 0xff3333} emissive={0x220000} />
            {hovered && (
                <Html center distanceFactor={3} style={{ pointerEvents: 'none' }}>
                    <div style={{
                        background: 'rgba(0,0,0,0.9)',
                        color: 'white',
                        padding: '8px 14px',
                        borderRadius: 8,
                        fontSize: 10,
                        whiteSpace: 'nowrap',
                        lineHeight: '20px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.7)',
                        fontWeight: '500'
                    }}>
                        <div style={{ marginBottom: '4px', fontWeight: '700', textTransform: 'capitalize', fontSize: 16 }}>
                            {d.city || d.name || 'N/A'}
                        </div>
                        <div style={{ fontSize: 13, color: '#fbbf24' }}>
                            Traffic Delay: {d.delay !== undefined ? `${d.delay.toFixed(2)} mins` : 'N/A'}
                        </div>
                    </div>
                </Html>
            )}
        </mesh>
    )
}

function Earth({ datasetUrl, markers = [] }: EarthProps) {

    const [colorMap, specularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
        EarthColorMap,
        EarthSpecularMap,
        EarthCloudsMap
    ])

    const earthRef = React.useRef<THREE.Mesh>(null!)
    const cloudsRef = React.useRef<THREE.Mesh>(null!)
    const controlsRef = React.useRef<any>(null)
    const [isUserInteracting, setIsUserInteracting] = React.useState(false)

    // Simple automatic rotation using elapsed time (paused while user interacts)
    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime()
        if (!isUserInteracting) {
            if (earthRef.current) earthRef.current.rotation.y = elapsedTime / 16
            if (cloudsRef.current) cloudsRef.current.rotation.y = elapsedTime / 16
        }
    })

    return (
        <>
            <ambientLight intensity={3} />
            <Stars
                radius={300}
                depth={60}
                count={10000}
                factor={7}
                saturation={0}
                fade={true}
            />

            <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={50} />

            {/* OrbitControls permite rotar/zoom/pan con el ratón. */}
            <OrbitControls
                ref={controlsRef}
                enableRotate={true}
                enableZoom={true}
                enablePan={true}
                zoomSpeed={0.6}
                panSpeed={0.5}
                rotateSpeed={0.4}
                // Pausar la rotación automática mientras el usuario arrastra
                onStart={() => setIsUserInteracting(true)}
                onEnd={() => setIsUserInteracting(false)}
                target={[0, 0, 3]}
                minDistance={2}
                maxDistance={15}
            />

            <mesh ref={cloudsRef} position={[0, 0, 3]} rotation={[0, 0, 0]} >
                <sphereGeometry args={[1.005, 64, 64]} />
                <meshPhongMaterial
                    map={cloudsMap}
                    opacity={0.2}
                    depthWrite={true}
                    transparent={true}
                />
            </mesh>

            <mesh ref={earthRef} position={[0, 0, 3]} rotation={[0, 0, 0]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshPhongMaterial
                    specularMap={specularMap}
                />
                <meshStandardMaterial
                    map={colorMap}
                    metalness={0.4}
                    roughness={0.7}
                />
                {/* Los marcadores los renderiza como children para que roten con la Tierra */}
                {markers.map((m, i) => (
                    <Marker key={i} d={m} />
                ))}
            </mesh>
        </>
    )
}

export default Earth
