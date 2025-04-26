import { useState, useEffect } from 'react';
import { HardwareRecommendation, PlatformRecommendation } from '../types';

interface Recommendations {
  requiresTraining: boolean;
  hardware: HardwareRecommendation[];
  platforms: PlatformRecommendation[];
}

export function useRecommendations(code: string): Recommendations {
  const [recommendations, setRecommendations] = useState<Recommendations>({
    requiresTraining: false,
    hardware: [
      {
        type: 'gpu',
        name: 'NVIDIA T4',
        description: 'Good balance of performance and cost for training and inference',
        cost: '$0.35/hour',
        provider: 'Google Cloud',
        icon: '/icons/gcp.svg'
      }
    ],
    platforms: [
      {
        name: 'Google Colab Pro',
        description: 'Cloud-based Jupyter notebooks with free GPU access',
        url: 'https://colab.research.google.com',
        icon: '/icons/colab.svg',
        features: ['Free GPUs', 'Collaborative', 'Easy Setup']
      }
    ]
  });

  useEffect(() => {
    // TODO: Analyze code and update recommendations
    // For now, just check if the code includes training-related keywords
    const hasTraining = code.toLowerCase().includes('train') || 
                       code.toLowerCase().includes('fit') ||
                       code.toLowerCase().includes('epoch');
    
    setRecommendations(prev => ({
      ...prev,
      requiresTraining: hasTraining
    }));
  }, [code]);

  return recommendations;
}