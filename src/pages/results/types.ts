import { Brain, Network, Cuboid as Cube } from 'lucide-react';
import { DivideIcon as LucideIcon } from 'lucide-react';

export type ViewType = 'agent' | 'flow' | '3d';

export interface ViewTab {
  id: ViewType;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const tabs: ViewTab[] = [
  { 
    id: 'agent', 
    label: "Agent's Reasoning", 
    icon: Brain,
    description: 'Understand the reasoning behind each component'
  },
  { 
    id: 'flow', 
    label: 'Flow View', 
    icon: Network,
    description: 'Interactive visualization of the pipeline'
  },
  { 
    id: '3d', 
    label: '3D View', 
    icon: Cube,
    description: 'Explore the pipeline in 3D space'
  }
];