import React from 'react';
import { motion } from 'framer-motion';
import { Domain } from '../../../App';
import { LineChart, Stethoscope, Leaf } from 'lucide-react';

interface DomainPillsProps {
  selectedDomain: Domain | null;
  onDomainClick: (domain: Domain) => void;
}

export const domains: { id: Domain; icon: React.ReactNode; example: string }[] = [
  { 
    id: 'fintech', 
    icon: <LineChart className="w-4 h-4" />,
    example: 'Analyze financial documents and extract key risk factors' 
  },
  { 
    id: 'healthcare', 
    icon: <Stethoscope className="w-4 h-4" />,
    example: 'Classify medical images for early disease detection' 
  },
  { 
    id: 'sustainability', 
    icon: <Leaf className="w-4 h-4" />,
    example: 'Predict energy consumption patterns from sensor data' 
  }
];

export function DomainPills({ selectedDomain, onDomainClick }: DomainPillsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-8">
      {domains.map(({ id, icon }) => (
        <motion.button
          key={id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDomainClick(id)}
          className={`px-4 py-1.5 rounded-full text-sm transition-all inline-flex items-center gap-2 ${
            selectedDomain === id
              ? 'bg-blue-100 text-blue-700 shadow-sm'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          {icon}
          {id}
        </motion.button>
      ))}
    </div>
  );
}