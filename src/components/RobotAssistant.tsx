import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RobotAssistantProps {
  show: boolean;
}

export function RobotAssistant({ show }: RobotAssistantProps) {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed right-8 bottom-24 z-50 flex items-center gap-4"
      >
        {/* Message Bubble */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-md"
        >
          <h2 className="text-xl font-['Google_Sans'] text-gray-900 mb-2">
            Ready to Generate Pipeline!
          </h2>
          <p className="text-gray-600">
            I'll help you create an optimized ML pipeline based on your requirements.
            Just press Enter or click Generate to begin.
          </p>
          
          {/* Speech Bubble Triangle */}
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-r border-t border-gray-100 transform rotate-45" />
        </motion.div>

        {/* Robot Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative flex-shrink-0"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }}
            className="w-32 h-32"
          >
            <svg
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-xl"
            >
              {/* Robot Head */}
              <motion.g
                initial={{ y: 0 }}
                animate={{ y: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                {/* Head Base */}
                <rect
                  x="40"
                  y="40"
                  width="120"
                  height="120"
                  rx="60"
                  fill="#3B82F6"
                  className="filter drop-shadow-lg"
                />
                
                {/* Face Plate */}
                <rect
                  x="50"
                  y="60"
                  width="100"
                  height="80"
                  rx="40"
                  fill="#60A5FA"
                  className="filter drop-shadow-inner"
                />

                {/* Eyes */}
                <motion.g
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                >
                  <circle cx="80" cy="90" r="12" fill="#EFF6FF" />
                  <circle cx="120" cy="90" r="12" fill="#EFF6FF" />
                  <circle cx="80" cy="90" r="6" fill="#1D4ED8" />
                  <circle cx="120" cy="90" r="6" fill="#1D4ED8" />
                </motion.g>

                {/* Mouth */}
                <motion.path
                  d="M70 115 Q100 135 130 115"
                  stroke="#EFF6FF"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                  animate={{
                    d: [
                      "M70 115 Q100 135 130 115",
                      "M70 120 Q100 130 130 120",
                      "M70 115 Q100 135 130 115",
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut",
                  }}
                />

                {/* Antenna */}
                <motion.g
                  animate={{
                    rotate: [-5, 5, -5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                  style={{ transformOrigin: "100px 40px" }}
                >
                  <rect x="95" y="20" width="10" height="30" rx="5" fill="#2563EB" />
                  <circle cx="100" cy="15" r="8" fill="#60A5FA">
                    <animate
                      attributeName="opacity"
                      values="0.5;1;0.5"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </motion.g>

                {/* Side Accents */}
                <rect x="30" y="80" width="15" height="40" rx="7.5" fill="#2563EB" />
                <rect x="155" y="80" width="15" height="40" rx="7.5" fill="#2563EB" />
              </motion.g>
            </svg>
            
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl -z-10" />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}