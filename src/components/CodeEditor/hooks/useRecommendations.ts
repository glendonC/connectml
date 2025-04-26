import { Pipeline } from '../../../App';
import { companyIcons } from '../utils/constants';
import { HardwareRecommendation, PlatformRecommendation } from '../types';

export function useRecommendations(pipeline: Pipeline) {
  const totalParams = pipeline.components
    .filter(c => c.type === 'model')
    .reduce((sum, c) => sum + (c.parameters || 0), 0);

  const isLargeModel = totalParams > 100000000; // 100M params
  const requiresGPU = isLargeModel || pipeline.estimatedLatency > 100;

  const hardware: HardwareRecommendation[] = requiresGPU ? [
    {
      type: 'gpu',
      name: 'NVIDIA A10G',
      description: 'Excellent for both training and inference',
      cost: '$0.60/hour',
      provider: 'Available on Brev.dev',
      icon: companyIcons.nvidia
    },
    {
      type: 'gpu',
      name: 'NVIDIA A100',
      description: 'Best for large-scale training and parallel workloads',
      cost: '$2.50/hour',
      provider: 'Available on Brev.dev',
      icon: companyIcons.nvidia
    }
  ] : [
    {
      type: 'cpu',
      name: 'High-Performance CPU',
      description: 'Sufficient for inference and small models',
      cost: '$0.10/hour',
      provider: 'Available on Brev.dev',
      icon: companyIcons.brevdev
    }
  ];

  const platforms: PlatformRecommendation[] = [
    {
      name: 'Brev.dev',
      description: 'One-click ML development environment with GPU access',
      url: 'https://brev.dev',
      icon: companyIcons.brevdev,
      features: ['Instant GPU access', 'Pre-configured ML environments', 'Collaborative features']
    },
    {
      name: 'Hugging Face',
      description: 'Model hub and deployment platform',
      url: 'https://huggingface.co',
      icon: 'https://huggingface.co/favicon.ico',
      features: [
        'Model repository',
        'Easy model sharing',
        'Inference APIs'
      ]
    }
  ];

  return { hardware, platforms, requiresTraining: isLargeModel };
}