import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 4 Regulatory Approval Lifecycle Stages per AICTE PS 26262
const WORKFLOW_NODES = [
  { name: '1. Scrutiny Stage', code: 'SCRUTINY', desc: 'Document Verification & Rule Check', color: '#38BDF8', angle: 0 },
  { name: '2. EVC Inspection', code: 'EVC', desc: 'Infrastructure & Faculty Verification', color: '#60A5FA', angle: Math.PI / 2 },
  { name: '3. SAC / SHC Review', code: 'COMMITTEE', desc: 'Standing Appellate Committee', color: '#818CF8', angle: Math.PI },
  { name: '4. Approval Issuance', code: 'APPROVAL', desc: 'Digital Order & Compliance Seal', color: '#34D399', angle: (3 * Math.PI) / 2 },
];

function WorkflowPipeline3D() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  // Smooth continuous rotation & floating motion
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.28;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.0006) * 0.15;
    }
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.45;
      coreRef.current.rotation.y += delta * 0.35;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.z += delta * 0.2;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z -= delta * 0.15;
    }
  });

  // Calculate orbital connection path connecting the 4 workflow stages
  const pipelineLoop = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 64;
    const radius = 1.6;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  // Beams from central regulatory engine to each stage node
  const beamLines = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const radius = 1.6;
    WORKFLOW_NODES.forEach((node) => {
      points.push(new THREE.Vector3(0, 0, 0));
      points.push(new THREE.Vector3(Math.cos(node.angle) * radius, 0, Math.sin(node.angle) * radius));
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <group ref={groupRef}>
      {/* Central Regulatory Core Engine - Rotating 3D Holographic Octahedron */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <octahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial
          color="#1E40AF"
          emissive="#0284C7"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
          wireframe={false}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Core Wireframe Overlay */}
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[0.72, 1]} />
        <meshBasicMaterial color="#38BDF8" wireframe transparent opacity={0.35} />
      </mesh>

      {/* Inner Energy Sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color="#67E8F9" transparent opacity={0.7} />
      </mesh>

      {/* Main Workflow Stage Orbit Ring */}
      <lineLoop geometry={pipelineLoop}>
        <lineBasicMaterial color="#38BDF8" transparent opacity={0.5} />
      </lineLoop>

      {/* Outer Technical Stage Ring 1 */}
      <mesh ref={ringRef1} rotation={[Math.PI / 6, 0, 0]}>
        <ringGeometry args={[1.75, 1.78, 48]} />
        <meshBasicMaterial color="#60A5FA" side={THREE.DoubleSide} transparent opacity={0.25} />
      </mesh>

      {/* Outer Technical Stage Ring 2 */}
      <mesh ref={ringRef2} rotation={[-Math.PI / 4, 0, 0]}>
        <ringGeometry args={[1.9, 1.93, 48]} />
        <meshBasicMaterial color="#818CF8" side={THREE.DoubleSide} transparent opacity={0.18} />
      </mesh>

      {/* Data Beams connecting core to each stage */}
      <lineSegments geometry={beamLines}>
        <lineBasicMaterial color="#38BDF8" transparent opacity={0.3} />
      </lineSegments>

      {/* 4 Interactive Workflow Stage Satellite Nodes */}
      {WORKFLOW_NODES.map((node, i) => {
        const radius = 1.6;
        const x = Math.cos(node.angle) * radius;
        const z = Math.sin(node.angle) * radius;
        const isHovered = hoveredStage === node.name;

        return (
          <group key={i} position={[x, 0, z]}>
            {/* Outer Stage Pulse Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.22, 0.25, 24]} />
              <meshBasicMaterial color={node.color} side={THREE.DoubleSide} transparent opacity={isHovered ? 0.9 : 0.4} />
            </mesh>

            {/* Stage Satellite Node Sphere */}
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredStage(node.name);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredStage(null);
              }}
            >
              <sphereGeometry args={[isHovered ? 0.22 : 0.16, 20, 20]} />
              <meshStandardMaterial
                color={node.color}
                emissive={node.color}
                emissiveIntensity={isHovered ? 1.0 : 0.5}
                roughness={0.2}
                metalness={0.6}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Fallback in case of WebGL initialization failure
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
          <div className="w-20 h-20 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center">
            <span className="text-blue-300 text-xs font-mono">AICTE FLOW</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-medium">Workflow Automation Active</span>
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
          camera={{ position: [0, 1.4, 3.4], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={1.1} />
          <directionalLight position={[4, 6, 4]} intensity={1.5} />
          <pointLight position={[-4, -3, -3]} color="#38BDF8" intensity={0.9} />
          <pointLight position={[0, 0, 0]} color="#34D399" intensity={0.8} />
          <WorkflowPipeline3D />
        </Canvas>
      </ErrorBoundary3D>
    </div>
  );
};
