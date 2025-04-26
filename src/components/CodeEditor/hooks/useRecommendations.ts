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
      },
      {
        type: 'gpu',
        name: 'NVIDIA A100',
        description: 'High-performance GPU for large model training',
        cost: '$2.95/hour',
        provider: 'AWS',
        icon: '/icons/aws.svg'
      }
    ],
    platforms: [
      {
        name: 'Google Colab Pro',
        description: 'Cloud-based Jupyter notebooks with free GPU access',
        url: 'https://colab.research.google.com',
        icon: '/icons/colab.svg',
        features: ['Free GPUs', 'Collaborative', 'Easy Setup']
      },
      {
        name: 'Kaggle Notebooks',
        description: 'Free Jupyter notebooks with GPU support',
        url: 'https://www.kaggle.com/code',
        icon: '/icons/kaggle.svg',
        features: ['Free GPUs', 'Datasets', 'Competitions']
      }
    ]
  });

  useEffect(() => {
    // Analyze code and update recommendations
    const hasTraining = code.toLowerCase().includes('train') || 
                       code.toLowerCase().includes('fit') ||
                       code.toLowerCase().includes('epoch') ||
                       code.toLowerCase().includes('model.fit');
    
    const hasLargeModels = code.toLowerCase().includes('transformer') || 
                          code.toLowerCase().includes('bert') ||
                          code.toLowerCase().includes('gpt') ||
                          code.toLowerCase().includes('llm');
    
    const hasComputerVision = code.toLowerCase().includes('cv2') || 
                             code.toLowerCase().includes('opencv') ||
                             code.toLowerCase().includes('image') ||
                             code.toLowerCase().includes('cnn');
    
    // Update hardware recommendations based on code analysis
    let hardware = [...recommendations.hardware];
    
    if (hasLargeModels) {
      hardware = [
        {
          type: 'gpu',
          name: 'NVIDIA A100',
          description: 'High-performance GPU for large model training',
          cost: '$2.95/hour',
          provider: 'AWS',
          icon: '/icons/aws.svg'
        },
        ...hardware.filter(h => h.name !== 'NVIDIA A100')
      ];
    }
    
    if (hasComputerVision) {
      hardware = [
        {
          type: 'gpu',
          name: 'NVIDIA T4',
          description: 'Good balance of performance and cost for computer vision tasks',
          cost: '$0.35/hour',
          provider: 'Google Cloud',
          icon: '/icons/gcp.svg'
        },
        ...hardware.filter(h => h.name !== 'NVIDIA T4')
      ];
    }
    
    setRecommendations(prev => ({
      ...prev,
      requiresTraining: hasTraining,
      hardware
    }));
  }, [code]);

  return recommendations;
}