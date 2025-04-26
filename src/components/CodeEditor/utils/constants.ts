export const companyIcons = {
  nvidia: 'https://www.nvidia.com/favicon.ico',
  aws: 'https://aws.amazon.com/favicon.ico',
  gcp: 'https://cloud.google.com/favicon.ico',
  azure: 'https://azure.microsoft.com/favicon.ico',
  brevdev: 'https://brev.dev/favicon.ico'
};

export const refactorOptions = [
  {
    id: 'simplify' as const,
    label: 'Simplify Code',
    description: 'Remove unnecessary complexity and improve code structure'
  },
  {
    id: 'addComments' as const,
    label: 'Add Comments',
    description: 'Add detailed comments explaining the code'
  },
  {
    id: 'optimize' as const,
    label: 'Optimize for Readability',
    description: 'Improve code formatting and naming'
  },
  {
    id: 'custom' as const,
    label: 'Custom Refactor',
    description: 'Write your own refactoring request'
  }
];