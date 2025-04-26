import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, MeshTransmissionMaterial, Edges, Trail } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Database, Sparkles, Code, Package } from 'lucide-react';

const MODEL_TYPES = {
  preprocessing: {
    geometry: new THREE.OctahedronGeometry(0.8, 2),
    color: '#60a5fa',
    icon: Database,
    emissive: '#3b82f6'
  },
  model: {
    geometry: new THREE.TorusKnotGeometry(0.5, 0.2, 128, 32),
    color: '#a855f7',
    icon: Sparkles,
    emissive: '#7c3aed'
  },
  postprocessing: {
    geometry: new THREE.IcosahedronGeometry(0.7, 2),
    color: '#4ade80',
    icon: Code,
    emissive: '#22c55e'
  }
};

function ParticleCloud({ color, count = 20, size = 0.05, spread = 1 }) {
  const particles = React.useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread
        ],
        scale: Math.random() * 0.5 + 0.5
      });
    }
    return temp;
  }, [count, spread]);

  return (
    <group>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position} scale={particle.scale}>
          <sphereGeometry args={[size, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function GlowingRing({ radius = 1, thickness = 0.1, color }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, thickness, 32, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
}

interface ModelNodeProps {
  type: string;
  position: [number, number, number];
  isActive: boolean;
  data: any;
  hideLabels?: boolean;
}

export function ModelNode({ type, position, isActive, data, hideLabels = false }: ModelNodeProps) {
  const modelConfig = MODEL_TYPES[type];
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
      meshRef.current.rotation.y = Math.cos(state.clock.getElapsedTime() * 0.5) * 0.1;
      
      if (isActive) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05);
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        geometry={modelConfig.geometry}
        onPointerOver={() => {
          setHovered(true);
          setShowDetails(true);
        }}
        onPointerOut={() => {
          setHovered(false);
          setShowDetails(false);
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={0.2}
          chromaticAberration={0.5}
          anisotropy={0.3}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          color={modelConfig.color}
          emissive={modelConfig.emissive}
          emissiveIntensity={isActive ? 2 : 0.5}
          transmission={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.1}
          roughness={0.2}
        />
        <Edges color={modelConfig.color} scale={1.1} threshold={15} />
      </mesh>

      {/* Particle Effects */}
      {(isActive || hovered) && (
        <ParticleCloud color={modelConfig.color} count={30} spread={1.5} />
      )}

      {/* Glowing Rings */}
      <group>
        <GlowingRing radius={1.2} color={modelConfig.color} />
        {(isActive || hovered) && (
          <>
            <GlowingRing radius={1.4} color={modelConfig.color} />
            <GlowingRing radius={1.6} color={modelConfig.color} />
          </>
        )}
      </group>

      {/* Component Details */}
      {!hideLabels && (
        <Html position={[0, -2, 0]} center transform>
          <div className={`px-4 py-2 rounded-xl ${
            showDetails || isExpanded ? 'bg-white shadow-xl scale-105' : 'bg-white/80'
          } transition-all duration-200`}>
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                type === 'preprocessing' ? 'bg-blue-100 text-blue-600' :
                type === 'model' ? 'bg-purple-100 text-purple-600' :
                'bg-green-100 text-green-600'
              }`}>
                <modelConfig.icon className="w-5 h-5" />
              </div>
              <span className="font-['Google_Sans'] text-gray-900">
                {data.name}
              </span>
            </div>

            {/* Expanded Content */}
            {(showDetails || isExpanded) && (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-600">{data.description}</p>

                {/* Dependencies */}
                {data.requirements?.dependencies && (
                  <div className="flex flex-wrap gap-1">
                    {data.requirements.dependencies.map((dep: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                        <Package className="w-3 h-3" />
                        {dep.split('>=')[0]}
                      </span>
                    ))}
                  </div>
                )}

                {/* Environments */}
                {data.requirements?.environments && (
                  <div className="flex flex-wrap gap-1">
                    {data.requirements.environments.map((env: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                        {env}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Html>
      )}

      {/* Post-processing Effects */}
      <EffectComposer>
        <Bloom
          intensity={1}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          height={300}
        />
      </EffectComposer>
    </group>
  );
}