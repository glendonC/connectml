export type Language = 'python' | 'json';
export type Framework = 'pytorch' | 'tensorflow' | 'sklearn';
export type RefactorOption = 'simplify' | 'addComments' | 'optimize' | 'custom';

export interface UseCodeGenerationProps {
  pipeline: any;
  useAIGeneration: boolean;
}

export interface UseCodeGenerationReturn {
  code: string;
  language: Language;
  framework: Framework;
  isLoading: boolean;
  error: string | null;
  setLanguage: (lang: Language) => void;
  setFramework: (framework: Framework) => void;
  setCode: (code: string) => void;
}

export interface RecommendationsPanelProps {
  code: string;
  isLoading: boolean;
  onRefactor: (option: RefactorOption, customPrompt?: string) => void;
}

export interface EditorHeaderProps {
  code: string;
  language: Language;
  framework: Framework;
  theme: 'vs-dark' | 'light';
  setTheme: (theme: 'vs-dark' | 'light') => void;
  onLanguageChange: (language: Language) => void;
  onFrameworkChange: (framework: Framework) => void;
  showRecommendations: boolean;
  setShowRecommendations: (show: boolean) => void;
  onRefactor: (option: RefactorOption, customPrompt?: string) => void;
  onClose: () => void;
  useAIGeneration: boolean;
  setUseAIGeneration: (use: boolean) => void;
}

export interface CodePaneProps {
  code: string;
  language: Language;
  theme: 'vs-dark' | 'light';
  error: string | null;
  isLoading: boolean;
}

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