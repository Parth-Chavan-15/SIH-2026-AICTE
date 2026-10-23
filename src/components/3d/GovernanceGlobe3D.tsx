import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 8 Regional Bureaus of AICTE with spherical coordinates
const REGIONAL_NODES = [
  { name: 'Western (Mumbai)', pos: [1.2, 0.4, 0.9], code: 'WRO' },
  { name: 'Northern (Kanpur)', pos: [0.8, 1.2, 0.6], code: 'NRO' },
  { name: 'Southern (Chennai)', pos: [0.9, -0.8, 1.1], code: 'SRO' },
  { name: 'Eastern (Kolkata)', pos: [1.4, 0.6, -0.4], code: 'ERO' },
  { name: 'Central (Bhopal)', pos: [0.6, 0.2, 1.4], code: 'CRO' },
  { name: 'South-West (Bengaluru)', pos: [0.4, -1.1, 0.9], code: 'SWRO' },
  { name: 'North-West (Chandigarh)', pos: [0.5, 1.5, 0.2], code: 'NWRO' },
  { name: 'HQ (New Delhi)', pos: [0.3, 1.0, 1.1], code: 'HQ-DELHI', isHQ: true },
];

function InteractiveGlobe() {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Smooth continuous rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.22;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.0004) * 0.12;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.z += delta * 0.15;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.x += delta * 0.18;
    }
  });

  // Calculate connection lines between regional nodes and AICTE HQ
  const connectionLines = useMemo(() => {
    const hq = REGIONAL_NODES.find((n) => n.isHQ)!;
    const points: THREE.Vector3[] = [];
    REGIONAL_NODES.forEach((node) => {
      if (!node.isHQ) {
        points.push(new THREE.Vector3(...(hq.pos as [number, number, number])));
        points.push(new THREE.Vector3(...(node.pos as [number, number, number])));
      }
    });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Central Core Sphere - Official Sovereign Blue Glass */}
      <mesh>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshStandardMaterial
          color="#0B2545"
          emissive="#061828"
          roughness={0.4}
          metalness={0.7}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Wireframe Mesh Outer Shell */}
      <mesh>
        <sphereGeometry args={[1.42, 20, 20]} />
        <meshBasicMaterial
          color="#38BDF8"
          wireframe
          transparent
          opacity={0.22}
        />
      </mesh>

      {/* Orbital Technical Rings */}
      <mesh ref={ringRef1} rotation={[Math.PI / 4, 0, 0]}>
        <ringGeometry args={[1.85, 1.88, 64]} />
        <meshBasicMaterial color="#60A5FA" side={THREE.DoubleSide} transparent opacity={0.35} />
      </mesh>

      <mesh ref={ringRef2} rotation={[-Math.PI / 5, Math.PI / 3, 0]}>
        <ringGeometry args={[2.05, 2.08, 64]} />
        <meshBasicMaterial color="#38BDF8" side={THREE.DoubleSide} transparent opacity={0.25} />
      </mesh>

      {/* Connection Lines from HQ to Regional Bureaus */}
      <lineSegments geometry={connectionLines}>
        <lineBasicMaterial color="#38BDF8" transparent opacity={0.45} />
      </lineSegments>

      {/* 8 Regional Bureau Nodes */}
      {REGIONAL_NODES.map((node, i) => (
        <group key={i} position={node.pos as [number, number, number]}>
          <mesh
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredNode(node.name);
            }}
            onPointerOut={() => setHoveredNode(null)}
          >
            <sphereGeometry args={[node.isHQ ? 0.12 : 0.08, 16, 16]} />
            <meshStandardMaterial
              color={node.isHQ ? '#F59E0B' : '#60A5FA'}
              emissive={node.isHQ ? '#D97706' : '#2563EB'}
              emissiveIntensity={hoveredNode === node.name ? 1.5 : 0.8}
            />
          </mesh>

          {/* Node Halo Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.13, 0.16, 16]} />
            <meshBasicMaterial
              color={node.isHQ ? '#F59E0B' : '#93C5FD'}
              side={THREE.DoubleSide}
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Fallback view in case of WebGL initialization failure
class ErrorBoundary3D extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
          <div className="w-24 h-24 rounded-lg bg-blue-950/80 border border-blue-500/30 flex items-center justify-center">
            <span className="text-blue-300 text-xs font-mono">AICTE GRID</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-medium">8 Regional Bureaus Connected</span>
        </div>
      );
    }
    return this.props.children;
  }
}

export const GovernanceGlobe3D: React.FC<{ className?: string }> = ({ className = 'w-full h-48 sm:h-56' }) => {
  return (
    <div className={`relative ${className} select-none`}>
      <ErrorBoundary3D>
        <Canvas
          camera={{ position: [0, 0, 3.8], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[-5, -5, -3]} color="#38BDF8" intensity={0.8} />
          <InteractiveGlobe />
        </Canvas>
      </ErrorBoundary3D>

      {/* Floating Status Pill (Administrative style) */}
      <div className="absolute bottom-2 right-2 bg-[#061828]/90 backdrop-blur-xs border border-slate-700/80 rounded-md px-2.5 py-1 text-[10px] text-slate-300 flex items-center gap-1.5 shadow-md pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-mono font-medium tracking-wide">8 AICTE REGIONAL BUREAUS LIVE</span>
      </div>
    </div>
  );
};
