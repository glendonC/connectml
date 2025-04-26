import { useState } from 'react';
import { RefactorOption } from '../types';

export function useRefactor() {
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [selectedRefactorOption, setSelectedRefactorOption] = useState<RefactorOption | null>(null);

  const handleRefactor = async (option: RefactorOption, code: string, customPrompt?: string) => {
    setIsRefactoring(true);
    setSelectedRefactorOption(option);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let newCode = code;
    if (option === 'custom') {
      newCode = code.replace(/\n/g, '\n// ' + customPrompt + '\n');
    } else {
      const mockChanges = {
        simplify: code.replace(/\n\n+/g, '\n\n'),
        addComments: code.replace(
          /(class|def)\s+(\w+)/g, 
          '\n# Description for $2\n$1 $2'
        ),
        optimize: code.replace(/(\s{2,})/g, '  ')
      };
      
      newCode = mockChanges[option];
    }
    
    setIsRefactoring(false);
    setSelectedRefactorOption(null);
    
    return newCode;
  };

  return {
    isRefactoring,
    selectedRefactorOption,
    handleRefactor,
  };
}