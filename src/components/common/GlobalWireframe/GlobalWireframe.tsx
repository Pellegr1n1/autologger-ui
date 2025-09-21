import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import * as Three from 'three'

export default function GlobalWireframe() {
  return (
    <div style={{ height: '100vh', background: 'transparent' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <RotatingBlockchainNetwork />
        <OrbitControls 
          enableZoom={false}
          enableRotate={true}
          mouseButtons={{
            LEFT: Three.MOUSE.ROTATE,
            MIDDLE: Three.MOUSE.DOLLY,
          }}
        />
      </Canvas>
    </div>
  )
}

const RotatingBlockchainNetwork = () => {
  const groupRef = useRef<Three.Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002
    }
  })

  const icosahedron = new Three.IcosahedronGeometry(1.9, 2)
  const vertices = icosahedron.attributes.position.array
  const vertexCount = vertices.length / 3

  const connections = []
  for (let i = 0; i < vertexCount; i++) {
    connections.push({
      start: i,
      end: (i + 2) % vertexCount
    })
  }

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[0.7, 5]} />
        <meshStandardMaterial 
          color="#8B5CF6" 
          wireframe={true} 
          emissive="#8B5CF6"
          emissiveIntensity={0.3}
          transparent={true}
          opacity={0.25}
        />
      </mesh>

      {Array.from({ length: vertexCount }).map((_, i) => (
        <mesh key={i} position={[
          vertices[i * 3],
          vertices[i * 3 + 1],
          vertices[i * 3 + 2]
        ]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial 
            color="#A78BFA"
            emissive="#A78BFA"
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}

      {connections.map((conn, idx) => (
        <line key={`conn-${idx}`}>
          <bufferGeometry attach="geometry" 
            attributes={{
              position: new Three.BufferAttribute(new Float32Array([
                vertices[conn.start * 3], vertices[conn.start * 3 + 1], vertices[conn.start * 3 + 2],
                vertices[conn.end * 3], vertices[conn.end * 3 + 1], vertices[conn.end * 3 + 2]
              ]), 3)
            }}
          />
          <lineBasicMaterial color="#8B5CF6" transparent opacity={0.3} />
        </line>
      ))}
    </group>
  )
}
