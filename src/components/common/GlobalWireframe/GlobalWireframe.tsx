import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as Three from 'three'
import { BufferGeometry, BufferAttribute } from 'three'

const CANVAS_STYLE = { height: '100%', width: '100%', background: 'transparent' as const }
const LIGHT_CONFIG = {
  ambient: { intensity: 0.5 },
  point: { position: [10, 10, 10] as [number, number, number], intensity: 0.8 }
}
const ROTATION_SPEED = 0.002
const ICOSAHEDRON_CONFIG = {
  outer: { radius: 1.9, detail: 2 },
  inner: { radius: 0.7, detail: 5 }
}
const SPHERE_CONFIG = { radius: 0.04, widthSegments: 12, heightSegments: 12 }
const COLORS = {
  primary: '#8B5CF6',
  secondary: '#A78BFA'
}
const MATERIAL_CONFIG = {
  wireframe: {
    emissiveIntensity: 0.3,
    opacity: 0.25
  },
  sphere: {
    emissiveIntensity: 0.15
  },
  line: {
    opacity: 0.3
  }
}

const baseIcosahedron = new Three.IcosahedronGeometry(
  ICOSAHEDRON_CONFIG.outer.radius,
  ICOSAHEDRON_CONFIG.outer.detail
)
const baseVertices = baseIcosahedron.attributes.position.array
const baseVertexCount = baseVertices.length / 3

const baseConnections = Array.from({ length: baseVertexCount }, (_, i) => ({
  start: i,
  end: (i + 2) % baseVertexCount
}))

export default function GlobalWireframe() {
  return (
    <div style={CANVAS_STYLE}>
      <Canvas>
        <ambientLight intensity={LIGHT_CONFIG.ambient.intensity} />
        <pointLight position={LIGHT_CONFIG.point.position as [number, number, number]} intensity={LIGHT_CONFIG.point.intensity} />
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
      groupRef.current.rotation.y += ROTATION_SPEED
    }
  })

  const vertexPositions = useMemo(() => {
    return Array.from({ length: baseVertexCount }, (_, i) => [
      baseVertices[i * 3],
      baseVertices[i * 3 + 1],
      baseVertices[i * 3 + 2]
    ] as [number, number, number])
  }, [])

  const lineGeometries = useMemo(() => {
    return baseConnections.map((conn) => {
      const geometry = new BufferGeometry()
      const positions = new Float32Array([
        baseVertices[conn.start * 3],
        baseVertices[conn.start * 3 + 1],
        baseVertices[conn.start * 3 + 2],
        baseVertices[conn.end * 3],
        baseVertices[conn.end * 3 + 1],
        baseVertices[conn.end * 3 + 2]
      ])
      geometry.setAttribute('position', new BufferAttribute(positions, 3))
      return geometry
    })
  }, [])

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry 
          args={[ICOSAHEDRON_CONFIG.inner.radius, ICOSAHEDRON_CONFIG.inner.detail]} 
        />
        <meshStandardMaterial 
          color={COLORS.primary} 
          wireframe={true} 
          emissive={COLORS.primary}
          emissiveIntensity={MATERIAL_CONFIG.wireframe.emissiveIntensity}
          transparent={true}
          opacity={MATERIAL_CONFIG.wireframe.opacity}
        />
      </mesh>

      {vertexPositions.map((position, i) => (
        <mesh key={`vertex-${i}-${position[0]}-${position[1]}-${position[2]}`} position={position}>
          <sphereGeometry 
            args={[
              SPHERE_CONFIG.radius, 
              SPHERE_CONFIG.widthSegments, 
              SPHERE_CONFIG.heightSegments
            ]} 
          />
          <meshStandardMaterial 
            color={COLORS.secondary}
            emissive={COLORS.secondary}
            emissiveIntensity={MATERIAL_CONFIG.sphere.emissiveIntensity}
          />
        </mesh>
      ))}

      {lineGeometries.map((geometry, idx) => {
        const lineObject = new Three.Line(geometry, new Three.LineBasicMaterial({ 
          color: COLORS.primary, 
          transparent: true, 
          opacity: MATERIAL_CONFIG.line.opacity 
        }))
        const geometryKey = geometry.uuid || `line-${idx}`;
        return (
          <primitive key={`conn-${geometryKey}`} object={lineObject} />
        )
      })}
    </group>
  )
}
