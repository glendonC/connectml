import { Database, Sparkles, Code, GitBranch, ArrowLeftRight, Activity, LineChart } from 'lucide-react';
import * as THREE from 'three';

export type ComponentType = 'preprocessing' | 'model' | 'postprocessing' | 'feature' | 'transformation' | 'monitoring' | 'explainability';

interface ComponentConfig {
  // Tailwind classes
  bgColor: string;
  textColor: string;
  bgColorLight: string;
  // Hex colors for 3D
  color: string;
  emissive: string;
  // Icon
  icon: typeof Database | typeof Sparkles | typeof Code | typeof GitBranch | typeof ArrowLeftRight | typeof Activity | typeof LineChart;
  // 3D geometry
  geometry: THREE.BufferGeometry;
}

export const COMPONENT_CONFIG: Record<ComponentType, ComponentConfig> = {
  preprocessing: {
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgColorLight: 'bg-blue-100',
    color: '#3b82f6',
    emissive: '#2563eb',
    icon: Database,
    geometry: new THREE.OctahedronGeometry(0.8, 2)
  },
  model: {
    bgColor: 'bg-purple-500',
    textColor: 'text-purple-600',
    bgColorLight: 'bg-purple-100',
    color: '#8b5cf6',
    emissive: '#7c3aed',
    icon: Sparkles,
    geometry: new THREE.TorusKnotGeometry(0.5, 0.2, 128, 32)
  },
  postprocessing: {
    bgColor: 'bg-green-500',
    textColor: 'text-green-600',
    bgColorLight: 'bg-green-100',
    color: '#22c55e',
    emissive: '#16a34a',
    icon: Code,
    geometry: new THREE.IcosahedronGeometry(0.7, 2)
  },
  feature: {
    bgColor: 'bg-orange-500',
    textColor: 'text-orange-600',
    bgColorLight: 'bg-orange-100',
    color: '#f97316',
    emissive: '#ea580c',
    icon: GitBranch,
    geometry: new THREE.TetrahedronGeometry(0.8, 2)
  },
  transformation: {
    bgColor: 'bg-rose-500',
    textColor: 'text-rose-600',
    bgColorLight: 'bg-rose-100',
    color: '#f43f5e',
    emissive: '#e11d48',
    icon: ArrowLeftRight,
    geometry: new THREE.DodecahedronGeometry(0.7, 1)
  },
  monitoring: {
    bgColor: 'bg-cyan-500',
    textColor: 'text-cyan-600',
    bgColorLight: 'bg-cyan-100',
    color: '#06b6d4',
    emissive: '#0891b2',
    icon: Activity,
    geometry: new THREE.CapsuleGeometry(0.5, 0.5, 4, 16)
  },
  explainability: {
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    bgColorLight: 'bg-yellow-100',
    color: '#facc15',
    emissive: '#ca8a04',
    icon: LineChart,
    geometry: new THREE.SphereGeometry(0.7, 32, 32)
  }
}; 