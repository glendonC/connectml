export type Language = 'python' | 'json';
export type Framework = 'pytorch' | 'tensorflow' | 'sklearn';
export type RefactorOption = 'simplify' | 'addComments' | 'optimize' | 'custom';

export interface RefactorConfig {
  id: RefactorOption;
  label: string;
  description: string;
  icon?: React.ReactNode;
}

export interface HardwareRecommendation {
  type: 'cpu' | 'gpu';
  name: string;
  description: string;
  cost: string;
  provider: string;
  icon: string;
}

export interface PlatformRecommendation {
  name: string;
  description: string;
  url: string;
  icon: string;
  features: string[];
}