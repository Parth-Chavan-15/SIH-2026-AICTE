import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  FileText,
  Clock,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  Award,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Eye,
  Info,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

// ============================================================================
// 1. DATA MODEL: STAGES, SCENARIOS & COMPLIANCE NODES
// ============================================================================

export interface WorkflowStageData {
  id: string;
  name: string;
  shortCode: string;
  category: 'workflow' | 'compliance';
  position: [number, number, number];
  aphClause: string;
  responsibleRole: string;
  responsibleOffice: string;
  description: string;
  isConditional?: boolean;
}

export const WORKFLOW_STAGES: WorkflowStageData[] = [
  {
    id: 'stage_submitted',
    name: 'Application Submitted',
    shortCode: 'INTAKE',
    category: 'workflow',
    position: [-3.2, 0.9, 0],
    aphClause: 'APH 2026-27 Ch. II Sec 1.2',
    responsibleRole: 'Institution Authorized Signatory',
    responsibleOffice: 'Institution Portal Intake',
    description: 'Initial regulatory filing with institutional affidavits, lease deeds, and fee deposit confirmation.',
  },
  {
    id: 'stage_scrutiny',
    name: 'Initial Desk Scrutiny',
    shortCode: 'SCRUTINY',
    category: 'workflow',
    position: [-1.8, 0.4, 0.3],
    aphClause: 'APH 2026-27 Ch. II Sec 3.1',
    responsibleRole: 'Regional Scrutiny Officer (WRO)',
    responsibleOffice: 'Western Regional Office, Mumbai',
    description: 'Automated policy rule verification against land norms, faculty-cadre matrix, and municipal NOCs.',
  },
  {
    id: 'stage_rescrutiny',
    name: 'Re-Scrutiny / Clarification',
    shortCode: 'DEFICIENCY',
    category: 'workflow',
    position: [-0.6, 1.4, -0.4],
    aphClause: 'APH 2026-27 Ch. II Sec 3.2',
    responsibleRole: 'Regional Officer & Institution Head',
    responsibleOffice: 'WRO Deficiency Redressal Cell',
    description: 'Statutory 10-day rectification window for flagged documentary deficiencies before EVC referral.',
    isConditional: true,
  },
  {
    id: 'stage_evc',
    name: 'Expert Visit Committee (EVC)',
    shortCode: 'EVC',
    category: 'workflow',
    position: [0.6, 0.5, 0.3],
    aphClause: 'APH 2026-27 Ch. II Sec 4.1',
    responsibleRole: 'EVC Inspection Committee Panel',
    responsibleOffice: 'Council Nominated Inspection Board',
    description: 'On-site or virtual infrastructure inspection for laboratories, carpet area, and digital faculty verification.',
    isConditional: true,
  },
  {
    id: 'stage_committee',
    name: 'SAC / SHC Committee Review',
    shortCode: 'COMMITTEE',
    category: 'workflow',
    position: [1.8, 0.1, -0.2],
    aphClause: 'APH 2026-27 Ch. II Sec 5.3',
    responsibleRole: 'Standing Appellate / Hearing Committee',
    responsibleOffice: 'AICTE Headquarters, New Delhi',
    description: 'Executive committee hearing and appeal resolution for contested recommendations.',
    isConditional: true,
  },
  {
    id: 'stage_decision',
    name: 'Authorised Approval Order',
    shortCode: 'APPROVAL',
    category: 'workflow',
    position: [3.0, -0.5, 0.1],
    aphClause: 'APH 2026-27 Ch. II Sec 6.4',
    responsibleRole: 'Approval Bureau / Member Secretary',
    responsibleOffice: 'e-Governance Regulatory Cell, HQ',
    description: 'Final issuance of digital Extension of Approval (EoA) order with cryptographic digital seal.',
  },
  // Compliance side branch
  {
    id: 'comp_undertakings',
    name: 'Institutional Undertakings',
    shortCode: 'UNDERTAKING',
    category: 'compliance',
    position: [2.2, -1.6, 0.5],
    aphClause: 'APH 2026-27 Ch. III Sec 2.1',
    responsibleRole: 'Principal / Management Trustee',
    responsibleOffice: 'Compliance Monitoring Cell',
    description: 'Time-bound compliance commitments (e.g. faculty recruitment, equipment calibration, anti-ragging cell).',
  },
  {
    id: 'comp_lease',
    name: 'Lease & Document Expiry',
    shortCode: 'LEASE_EXPIRY',
    category: 'compliance',
    position: [3.4, -1.8, -0.4],
    aphClause: 'APH 2026-27 Ch. III Sec 3.4',
    responsibleRole: 'Registrar & Regional Office',
    responsibleOffice: 'Land & Building Registry Division',
    description: 'Automated 90-day alert tracking for campus land lease renewals and municipal stability certificates.',
  },
  {
    id: 'comp_evidence',
    name: 'Compliance Evidence Verification',
    shortCode: 'EVIDENCE',
    category: 'compliance',
    position: [4.4, -1.2, 0.4],
    aphClause: 'APH 2026-27 Ch. III Sec 4.2',
    responsibleRole: 'Bureau Compliance Inspector',
    responsibleOffice: 'Approval Bureau HQ',
    description: 'Scrutiny of geo-tagged proof and audited expenditure accounts fulfilling pre-approval conditions.',
  },
];

export interface DemoScenario {
  id: string;
  title: string;
  badge: string;
  institutionName: string;
  applicationNumber: string;
  applicationType: string;
  program: string;
  intake: number;
  currentStageId: string;
  slaStatus: 'within_sla' | 'approaching_deadline' | 'overdue';
  daysRemaining: number;
  lastAction: string;
  nextAction: string;
  activePath: string[]; // sequence of stage ids
  complianceStatus: {
    undertakingsDue: number;
    leaseExpiryDays: number;
    evidencePending: boolean;
  };
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scenario_normal',
    title: 'Scenario 1: Normal EoA Progress',
    badge: 'Standard Workflow (Within SLA)',
    institutionName: 'ABC Engineering College (Fictional Demo)',
    applicationNumber: 'DEMO-2026-001',
    applicationType: 'Extension of Approval (EoA)',
    program: 'Engineering & Technology',
    intake: 600,
    currentStageId: 'stage_scrutiny',
    slaStatus: 'within_sla',
    daysRemaining: 4,
    lastAction: 'Application submitted with 14 prescribed documents and affidavits.',
    nextAction: 'Regional Scrutiny Officer cross-checking Land Title Deed against APH Sec 3.1.',
    activePath: ['stage_submitted', 'stage_scrutiny', 'stage_evc', 'stage_decision'],
    complianceStatus: {
      undertakingsDue: 0,
      leaseExpiryDays: 320,
      evidencePending: false,
    },
  },
  {
    id: 'scenario_delayed',
    title: 'Scenario 2: Deficiency & SLA Overdue',
    badge: 'Delayed / Escalated (Overdue)',
    institutionName: 'College of Engineering Pune (COEP Tech Demo)',
    applicationNumber: 'DEMO-2026-002',
    applicationType: 'Increase in Intake / Additional Course',
    program: 'Computer Engineering & AI',
    intake: 840,
    currentStageId: 'stage_rescrutiny',
    slaStatus: 'overdue',
    daysRemaining: -2,
    lastAction: 'Deficiency communicated regarding fire safety NOC validity renewal.',
    nextAction: 'Awaiting amended municipal fire certificate from institution (Urgent Escalation).',
    activePath: ['stage_submitted', 'stage_scrutiny', 'stage_rescrutiny', 'stage_evc', 'stage_committee', 'stage_decision'],
    complianceStatus: {
      undertakingsDue: 2,
      leaseExpiryDays: 45,
      evidencePending: true,
    },
  },
  {
    id: 'scenario_compliance',
    title: 'Scenario 3: Post-Approval Lease Monitoring',
    badge: 'Active Compliance Obligation',
    institutionName: 'Anna Institute of Technology (Fictional Demo)',
    applicationNumber: 'DEMO-2026-003',
    applicationType: 'Extension of Approval (EoA)',
    program: 'Electronics & Communication',
    intake: 480,
    currentStageId: 'stage_decision',
    slaStatus: 'approaching_deadline',
    daysRemaining: 12,
    lastAction: 'EoA Order digitally signed; ongoing compliance monitoring activated.',
    nextAction: 'Campus land lease renewal agreement due within 28 days under APH Ch. III.',
    activePath: ['stage_submitted', 'stage_scrutiny', 'stage_decision', 'comp_undertakings', 'comp_lease', 'comp_evidence'],
    complianceStatus: {
      undertakingsDue: 1,
      leaseExpiryDays: 28,
      evidencePending: true,
    },
  },
];

// ============================================================================
// 2. THREE.JS 3D SCENE IMPLEMENTATION
// ============================================================================

interface SceneProps {
  currentScenario: DemoScenario;
  selectedStageId: string;
  onSelectStage: (stageId: string) => void;
  hoveredStageId: string | null;
  setHoveredStageId: (stageId: string | null) => void;
  isPaused: boolean;
  complianceView: boolean;
  journeyProgress: number; // 0 to 1
  isAnimatingJourney: boolean;
  reducedMotion: boolean;
}

function SceneCanvas({
  currentScenario,
  selectedStageId,
  onSelectStage,
  hoveredStageId,
  setHoveredStageId,
  isPaused,
  complianceView,
  journeyProgress,
  isAnimatingJourney,
  reducedMotion,
}: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cardRef = useRef<THREE.Group>(null);
  const particleRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  // Pointer drag rotation state
  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });
  const rotationEuler = useRef(new THREE.Euler(0.12, 0, 0));

  // Build the 3D curves for active workflow paths
  const { mainCurve, complianceCurve, allPathLines } = useMemo(() => {
    // Collect active workflow points
    const activeWorkflowPoints = currentScenario.activePath
      .filter((id) => !id.startsWith('comp_'))
      .map((id) => {
        const s = WORKFLOW_STAGES.find((st) => st.id === id);
        return s ? new THREE.Vector3(...s.position) : new THREE.Vector3(0, 0, 0);
      });

    const mCurve =
      activeWorkflowPoints.length >= 2
        ? new THREE.CatmullRomCurve3(activeWorkflowPoints, false, 'catmullrom', 0.25)
        : null;

    // Compliance branch curve connecting decision to compliance nodes
    const decisionStage = WORKFLOW_STAGES.find((s) => s.id === 'stage_decision')!;
    const comp1 = WORKFLOW_STAGES.find((s) => s.id === 'comp_undertakings')!;
    const comp2 = WORKFLOW_STAGES.find((s) => s.id === 'comp_lease')!;
    const comp3 = WORKFLOW_STAGES.find((s) => s.id === 'comp_evidence')!;

    const compPoints = [
      new THREE.Vector3(...decisionStage.position),
      new THREE.Vector3(...comp1.position),
      new THREE.Vector3(...comp2.position),
      new THREE.Vector3(...comp3.position),
    ];
    const cCurve = new THREE.CatmullRomCurve3(compPoints, false, 'catmullrom', 0.3);

    // Full wireframe connections between adjacent stages
    const connectionPoints: THREE.Vector3[] = [];
    const mainChain = ['stage_submitted', 'stage_scrutiny', 'stage_evc', 'stage_committee', 'stage_decision'];
    for (let i = 0; i < mainChain.length - 1; i++) {
      const p1 = WORKFLOW_STAGES.find((s) => s.id === mainChain[i])!.position;
      const p2 = WORKFLOW_STAGES.find((s) => s.id === mainChain[i + 1])!.position;
      connectionPoints.push(new THREE.Vector3(...p1));
      connectionPoints.push(new THREE.Vector3(...p2));
    }
    // Conditional branches
    const scr = WORKFLOW_STAGES.find((s) => s.id === 'stage_scrutiny')!.position;
    const resc = WORKFLOW_STAGES.find((s) => s.id === 'stage_rescrutiny')!.position;
    const evc = WORKFLOW_STAGES.find((s) => s.id === 'stage_evc')!.position;
    connectionPoints.push(new THREE.Vector3(...scr), new THREE.Vector3(...resc));
    connectionPoints.push(new THREE.Vector3(...resc), new THREE.Vector3(...evc));

    const lineGeom = new THREE.BufferGeometry().setFromPoints(connectionPoints);

    return {
      mainCurve: mCurve,
      complianceCurve: cCurve,
      allPathLines: lineGeom,
    };
  }, [currentScenario]);

  // Main animation frame loop
  useFrame((state, delta) => {
    // Gentle auto-rotation when not dragging and not reduced-motion
    if (groupRef.current && !isPaused && !reducedMotion) {
      if (!isDragging.current) {
        rotationEuler.current.y += delta * 0.12;
      }
      groupRef.current.rotation.copy(rotationEuler.current);
    }

    // Floating animation on central application dossier card
    if (cardRef.current && !reducedMotion) {
      cardRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.08;
      cardRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.04;
    }

    // Traveling light particle indicating application progression
    if (particleRef.current && mainCurve && !reducedMotion) {
      let t = 0;
      if (isAnimatingJourney) {
        t = journeyProgress;
      } else if (!isPaused) {
        t = (state.clock.getElapsedTime() * 0.25) % 1;
      }
      const pt = mainCurve.getPointAt(t);
      particleRef.current.position.copy(pt);
    }
  });

  // Pointer drag controls on the 3D canvas
  const handlePointerDown = (e: any) => {
    isDragging.current = true;
    prevPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging.current || reducedMotion) return;
    const deltaX = (e.clientX - prevPointer.current.x) * 0.005;
    const deltaY = (e.clientY - prevPointer.current.y) * 0.005;

    rotationEuler.current.y += deltaX;
    rotationEuler.current.x = Math.max(-0.4, Math.min(0.6, rotationEuler.current.x + deltaY));
    prevPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Subtle Ground Grid in Deep Technical Navy */}
      <gridHelper
        args={[10, 20, '#1e3a8a', '#0f172a']}
        position={[0, -2.4, 0]}
        rotation={[0, 0, 0]}
      />

      {/* Background ambient workflow connection lines */}
      <lineSegments geometry={allPathLines}>
        <lineBasicMaterial color="#1e3a8a" transparent opacity={0.35} />
      </lineSegments>

      {/* Luminous Active Workflow Tube / Path */}
      {mainCurve && (
        <mesh>
          <tubeGeometry args={[mainCurve, 48, 0.035, 8, false]} />
          <meshBasicMaterial
            color={currentScenario.slaStatus === 'overdue' ? '#F43F5E' : '#38BDF8'}
            transparent
            opacity={0.75}
          />
        </mesh>
      )}

      {/* Compliance Branch Tube (Illuminated brightly in Compliance View) */}
      {complianceCurve && (
        <mesh>
          <tubeGeometry args={[complianceCurve, 32, 0.028, 8, false]} />
          <meshBasicMaterial
            color="#F59E0B"
            transparent
            opacity={complianceView ? 0.9 : 0.35}
          />
        </mesh>
      )}

      {/* Traveling Light Particle */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* ================================================================= */}
      {/* CENTRAL ELEMENT: FLOATING TRANSLUCENT 3D APPLICATION CASE DOSSIER */}
      {/* ================================================================= */}
      <group ref={cardRef} position={[0, 0, -0.3]}>
        {/* Glass Dossier Body */}
        <mesh>
          <boxGeometry args={[1.5, 2.0, 0.08]} />
          <meshStandardMaterial
            color="#0A2540"
            emissive="#061828"
            emissiveIntensity={0.6}
            roughness={0.25}
            metalness={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Luminous Dossier Edge Halo */}
        <mesh>
          <boxGeometry args={[1.52, 2.02, 0.06]} />
          <meshBasicMaterial
            color={currentScenario.slaStatus === 'overdue' ? '#F43F5E' : '#38BDF8'}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* Embossed Regulatory Emblem Seal in Center */}
        <mesh position={[0, 0.35, 0.05]}>
          <cylinderGeometry args={[0.26, 0.26, 0.02, 32]} />
          <meshStandardMaterial
            color="#F59E0B"
            emissive="#D97706"
            emissiveIntensity={0.5}
            roughness={0.3}
            metalness={0.9}
          />
        </mesh>

        {/* Case ID Plaque Bar */}
        <mesh position={[0, -0.4, 0.05]}>
          <boxGeometry args={[1.1, 0.2, 0.02]} />
          <meshBasicMaterial color="#1E293B" />
        </mesh>

        {/* Floating Ring around Dossier */}
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[1.25, 1.28, 48]} />
          <meshBasicMaterial color="#38BDF8" side={THREE.DoubleSide} transparent opacity={0.2} />
        </mesh>
      </group>

      {/* ================================================================= */}
      {/* WORKFLOW & COMPLIANCE NODES IN 3D SPACE                           */}
      {/* ================================================================= */}
      {WORKFLOW_STAGES.map((stage) => {
        const isSelected = selectedStageId === stage.id;
        const isHovered = hoveredStageId === stage.id;
        const isCurrentActive = currentScenario.currentStageId === stage.id;
        const isCompleted =
          currentScenario.activePath.indexOf(stage.id) !== -1 &&
          currentScenario.activePath.indexOf(stage.id) <
            currentScenario.activePath.indexOf(currentScenario.currentStageId);

        // Status color determination
        let nodeColor = '#64748B'; // default / future
        if (isCompleted) {
          nodeColor = '#10B981'; // Green: Completed
        } else if (isCurrentActive) {
          nodeColor =
            currentScenario.slaStatus === 'overdue'
              ? '#EF4444' // Red: Overdue
              : currentScenario.slaStatus === 'approaching_deadline'
              ? '#F59E0B' // Amber: Warning
              : '#38BDF8'; // Cyan: In-Progress
        } else if (stage.category === 'compliance') {
          nodeColor = '#F59E0B'; // Amber: Compliance
        }

        const scaleMultiplier = isSelected ? 1.4 : isHovered ? 1.2 : 1.0;

        return (
          <group
            key={stage.id}
            position={stage.position}
            onClick={(e) => {
              e.stopPropagation();
              onSelectStage(stage.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredStageId(stage.id);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredStageId(null);
            }}
          >
            {/* Outer Halo Ring for Active or Selected Stage */}
            {(isCurrentActive || isSelected) && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.34 * scaleMultiplier, 0.38 * scaleMultiplier, 32]} />
                <meshBasicMaterial
                  color={nodeColor}
                  side={THREE.DoubleSide}
                  transparent
                  opacity={isSelected ? 0.95 : 0.6}
                />
              </mesh>
            )}

            {/* Glass Node Body: Cylinder / Glass Puck */}
            <mesh scale={[scaleMultiplier, scaleMultiplier, scaleMultiplier]}>
              <cylinderGeometry args={[0.22, 0.22, 0.14, 24]} />
              <meshStandardMaterial
                color="#0A2540"
                emissive={nodeColor}
                emissiveIntensity={isCurrentActive || isSelected ? 0.7 : 0.3}
                roughness={0.2}
                metalness={0.7}
                transparent
                opacity={stage.isConditional ? 0.75 : 0.9}
              />
            </mesh>

            {/* Glowing Core Dot */}
            <mesh position={[0, 0.08 * scaleMultiplier, 0]}>
              <sphereGeometry args={[0.09 * scaleMultiplier, 16, 16]} />
              <meshBasicMaterial color={nodeColor} />
            </mesh>

            {/* Conditional stage indicator ring */}
            {stage.isConditional && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.24 * scaleMultiplier, 0.27 * scaleMultiplier, 20]} />
                <meshBasicMaterial color="#94A3B8" side={THREE.DoubleSide} transparent opacity={0.3} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// Fallback in case WebGL is unavailable
function WebGLFallback({
  currentScenario,
  selectedStageId,
  onSelectStage,
}: {
  currentScenario: DemoScenario;
  selectedStageId: string;
  onSelectStage: (id: string) => void;
}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-xs text-slate-300">
      <div className="p-4 rounded-2xl bg-blue-950/70 border border-blue-500/30 max-w-md w-full space-y-3">
        <div className="flex items-center justify-center gap-2 text-blue-300 font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Interactive AICTE Regulatory Workflow Engine</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          WebGL acceleration unavailable. Showing active workflow progression pipeline:
        </p>
        <div className="grid grid-cols-2 gap-2 text-left pt-2">
          {WORKFLOW_STAGES.slice(0, 6).map((st) => (
            <button
              key={st.id}
              onClick={() => onSelectStage(st.id)}
              className={`p-2 rounded-lg border text-[11px] transition-colors ${
                selectedStageId === st.id
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold">{st.name}</div>
              <div className="text-[10px] text-slate-400">{st.shortCode}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. MAIN WRAPPER COMPONENT: COMPLETE 3D WORKFLOW CONTROL CENTER
// ============================================================================

export const AICTEWorkflow3D: React.FC = () => {
  const [scenarioId, setScenarioId] = useState<string>('scenario_normal');
  const [selectedStageId, setSelectedStageId] = useState<string>('stage_scrutiny');
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [complianceView, setComplianceView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isAnimatingJourney, setIsAnimatingJourney] = useState(false);
  const [journeyProgress, setJourneyProgress] = useState(0);

  const currentScenario = useMemo(
    () => DEMO_SCENARIOS.find((s) => s.id === scenarioId) || DEMO_SCENARIOS[0],
    [scenarioId]
  );

  const selectedStage = useMemo(
    () => WORKFLOW_STAGES.find((s) => s.id === selectedStageId) || WORKFLOW_STAGES[1],
    [selectedStageId]
  );

  // Sync selected stage with scenario changes
  useEffect(() => {
    setSelectedStageId(currentScenario.currentStageId);
  }, [scenarioId, currentScenario.currentStageId]);

  // "Show Application Journey" animation sequence
  const handleTriggerJourney = () => {
    if (reducedMotion) return;
    setIsAnimatingJourney(true);
    setJourneyProgress(0);
    const startTime = performance.now();
    const duration = 3200; // 3.2 seconds

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      setJourneyProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimatingJourney(false);
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="bg-[#061828] text-white rounded-2xl border border-slate-700/70 shadow-2xl overflow-hidden space-y-0 select-none">
      
      {/* ------------------------------------------------------------- */}
      {/* TOP BAR: SCENARIO SELECTOR & OPERATIONAL BADGE                */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#04101D] px-4 sm:px-6 py-3 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                AICTE Approval Workflow Engine
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50">
                PS 26262
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Interactive 3D Lifecycle Architecture &bull; Click any node to inspect regulatory compliance
            </p>
          </div>
        </div>

        {/* Selectable Demonstration Scenarios */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 hidden md:inline">
            Scenario:
          </span>
          {DEMO_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setScenarioId(sc.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                scenarioId === sc.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {sc.title.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SCENARIO HEADER SUMMARY                                       */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-900/50 px-4 sm:px-6 py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs font-bold text-blue-300 bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800/40">
            {currentScenario.applicationNumber}
          </span>
          <span className="font-bold text-slate-200">
            {currentScenario.institutionName}
          </span>
          <span className="text-slate-400 text-[11px] hidden lg:inline">
            {currentScenario.program} &bull; {currentScenario.intake} Seats &bull; {currentScenario.applicationType}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border flex items-center gap-1.5 ${
              currentScenario.slaStatus === 'overdue'
                ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                : currentScenario.slaStatus === 'approaching_deadline'
                ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
            }`}
          >
            {currentScenario.slaStatus === 'overdue' ? (
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            ) : currentScenario.slaStatus === 'approaching_deadline' ? (
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{currentScenario.badge}</span>
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN SECTION: 3D CANVAS + RIGHT-SIDE STAGE INSPECTION PANEL   */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row h-[420px] sm:h-[460px] relative">
        
        {/* 3D WebGL Canvas */}
        <div className="flex-1 h-full relative overflow-hidden bg-gradient-to-b from-[#061828] via-[#0A2540] to-[#04101D]">
          
          <Canvas
            camera={{ position: [0, 1.2, 5.2], fov: 46 }}
            gl={{ antialias: true, alpha: true }}
            style={{ width: '100%', height: '100%', cursor: 'grab' }}
          >
            <ambientLight intensity={1.1} />
            <directionalLight position={[5, 8, 5]} intensity={1.6} />
            <directionalLight position={[-5, -4, -3]} color="#38BDF8" intensity={0.9} />
            <pointLight position={[0, 0, 0]} color="#67E8F9" intensity={1.2} />
            
            <SceneCanvas
              currentScenario={currentScenario}
              selectedStageId={selectedStageId}
              onSelectStage={(id) => setSelectedStageId(id)}
              hoveredStageId={hoveredStageId}
              setHoveredStageId={setHoveredStageId}
              isPaused={isPaused}
              complianceView={complianceView}
              journeyProgress={journeyProgress}
              isAnimatingJourney={isAnimatingJourney}
              reducedMotion={reducedMotion}
            />
          </Canvas>

          {/* Canvas Floating Action Controls (Top-Left) */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
            <button
              onClick={() => setComplianceView(!complianceView)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 backdrop-blur-md shadow-md ${
                complianceView
                  ? 'bg-amber-600 text-white border-amber-400 shadow-amber-900/30'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Highlight post-approval institutional undertakings, lease expiries and evidence tracking"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{complianceView ? 'Compliance Orbit Active' : 'Toggle Compliance View'}</span>
            </button>

            <button
              onClick={handleTriggerJourney}
              disabled={isAnimatingJourney}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/90 hover:bg-blue-600 text-white border border-blue-400/40 backdrop-blur-md flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              title="Animate light particle showing real-time application progression"
            >
              <Play className="w-3 h-3" />
              <span>{isAnimatingJourney ? 'Simulating Journey...' : 'Show Journey'}</span>
            </button>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 backdrop-blur-md transition-colors"
              title={isPaused ? 'Resume 3D Rotation' : 'Pause 3D Rotation'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-mono border backdrop-blur-md transition-colors ${
                reducedMotion
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-slate-900/80 text-slate-400 border-slate-700'
              }`}
              title="Reduced motion toggle for accessibility"
            >
              {reducedMotion ? 'Motion: OFF' : 'Motion: ON'}
            </button>
          </div>

          {/* Quick Helper Tip (Bottom-Left) */}
          <div className="absolute bottom-3 left-3 hidden sm:flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950/70 px-2.5 py-1 rounded-md border border-slate-800 backdrop-blur-xs">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Click any node to inspect &bull; Drag to rotate 360°</span>
          </div>
        </div>

        {/* Right-Side Stage Inspector Panel (Desktop) / Collapsible (Mobile) */}
        <div className="w-full lg:w-80 xl:w-96 bg-[#04101D] border-t lg:border-t-0 lg:border-l border-slate-800 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto text-xs space-y-4">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                Stage Detail Inspector
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {selectedStage.shortCode}
              </span>
            </div>

            <div>
              <h4 className="font-extrabold text-base text-white tracking-tight leading-tight">
                {selectedStage.name}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {selectedStage.aphClause}
              </p>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              {selectedStage.description}
            </p>

            {/* Regulatory Authority Metadata */}
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Responsible Authority:</span>
                <p className="font-medium text-slate-200 mt-0.5">{selectedStage.responsibleRole}</p>
                <p className="text-[11px] text-slate-400">{selectedStage.responsibleOffice}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Recent Stage Activity:</span>
                <p className="text-[11px] text-slate-300 mt-0.5">{currentScenario.lastAction}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Next Action Required:</span>
                <p className="text-[11px] font-semibold text-blue-300 mt-0.5">{currentScenario.nextAction}</p>
              </div>
            </div>
          </div>

          {/* Stage SLA & Compliance Action Footprint */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">SLA Timeline Status:</span>
              <span
                className={`font-bold ${
                  currentScenario.slaStatus === 'overdue'
                    ? 'text-rose-400'
                    : currentScenario.slaStatus === 'approaching_deadline'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {currentScenario.daysRemaining < 0
                  ? `Overdue (${Math.abs(currentScenario.daysRemaining)} Days)`
                  : `${currentScenario.daysRemaining} Days Remaining`}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Lease Expiry Tracking:</span>
              <span className="font-mono font-bold text-amber-300">
                {currentScenario.complianceStatus.leaseExpiryDays} Days
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM SECTION: STATUS LEGEND & COMPLIANCE METRICS            */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#030B14] px-4 sm:px-6 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-slate-400">
          <span className="font-bold text-slate-300 uppercase text-[10px]">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Completed Stage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
            <span>Active / In-Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Approaching SLA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>SLA Overdue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-slate-400"></span>
            <span>Conditional Branch</span>
          </div>
        </div>

        {/* Live Undertakings & Compliance Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden sm:inline">Active Undertakings:</span>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/40">
            {currentScenario.complianceStatus.undertakingsDue} Mandatory Due
          </span>
        </div>
      </div>

    </div>
  );
};
