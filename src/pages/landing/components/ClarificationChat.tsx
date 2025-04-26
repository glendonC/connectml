import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, AlertCircle, Sparkles } from 'lucide-react';
import { Domain } from '../../../App';
import { ClarificationQuestion } from '../hooks/useClarification';

interface ClarificationChatProps {
  show: boolean;
  currentQuestion: ClarificationQuestion | null;
  isTyping: boolean;
  selectedDomain: Domain | null;
  currentQuestionIndex: number;
  clarificationAnswers: Record<string, string>;
  onAnswerSubmit: (questionId: string, answer: string) => void;
  onNextQuestion: () => void;
  context: string;
  totalQuestions: number;
  error: string | null;
}

function LoadingQuestions() {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="mt-4 bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block bg-blue-50 rounded-2xl rounded-tl-none px-4 py-2"
            >
              <p className="text-gray-900">Generating clarifying questions...</p>
            </motion.div>
            
            {/* Placeholder Question Blocks */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="h-12 bg-gray-100 rounded-xl animate-pulse"
                  style={{ width: `${85 - (i * 15)}%` }}
                />
              ))}
            </div>

            {/* Animated Dots */}
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-2 h-2 bg-blue-400 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ClarificationChat({
  show,
  currentQuestion,
  isTyping,
  selectedDomain,
  currentQuestionIndex,
  clarificationAnswers,
  onAnswerSubmit,
  onNextQuestion,
  context,
  totalQuestions,
  error
}: ClarificationChatProps) {
  if (!show || !selectedDomain) return null;

  // Show loading animation when there are no questions yet and no error
  if (!currentQuestion && !error && isTyping) {
    return <LoadingQuestions />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-4 bg-red-50 rounded-2xl shadow-lg border border-red-200 p-4"
      >
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="mt-4 bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
    >
      <div className="p-4">
        {/* Context Message */}
        {context && (
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block bg-purple-50 rounded-2xl rounded-tl-none px-4 py-2"
              >
                <p className="text-gray-900">{context}</p>
              </motion.div>
            </div>
          </div>
        )}

        {/* Assistant Message */}
        {currentQuestion && (
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block bg-blue-50 rounded-2xl rounded-tl-none px-4 py-2"
              >
                <p className="text-gray-900">{currentQuestion.question}</p>
              </motion.div>
              {isTyping && <TypingIndicator />}
            </div>
          </div>
        )}

        {/* User Input Area */}
        {currentQuestion && (
          <div className="pl-12">
            {currentQuestion.type === 'select' && currentQuestion.options && (
              <SelectOptions
                options={currentQuestion.options}
                selectedAnswer={clarificationAnswers[currentQuestion.id]}
                onSelect={(answer) => {
                  onAnswerSubmit(currentQuestion.id, answer);
                  onNextQuestion();
                }}
              />
            )}

            {(currentQuestion.type === 'text' || currentQuestion.type === 'number') && (
              <TextInput
                type={currentQuestion.type}
                placeholder={currentQuestion.placeholder}
                value={clarificationAnswers[currentQuestion.id] || ''}
                onChange={(value) => onAnswerSubmit(currentQuestion.id, value)}
                onSubmit={onNextQuestion}
              />
            )}
          </div>
        )}
      </div>

      <ProgressIndicator
        currentIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
      />
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="mt-2 flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
          className="w-2 h-2 bg-blue-400 rounded-full"
        />
      ))}
    </div>
  );
}

function SelectOptions({ options, selectedAnswer, onSelect }: {
  options: string[];
  selectedAnswer: string;
  onSelect: (answer: string) => void;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 gap-2"
    >
      {options.map((option) => (
        <motion.button
          key={option}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(option)}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedAnswer === option
              ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
              : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {option}
        </motion.button>
      ))}
    </motion.div>
  );
}

function TextInput({ type, placeholder, value, onChange, onSubmit }: {
  type: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 pr-12 rounded-xl border border-gray-200 bg-white focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors"
      />
      <button
        onClick={onSubmit}
        disabled={!value}
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
          value ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-300'
        }`}
      >
        <Send className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

function ProgressIndicator({ currentIndex, totalQuestions }: {
  currentIndex: number;
  totalQuestions: number;
}) {
  return (
    <div className="px-4 py-2 bg-white border-t border-gray-100">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Question {currentIndex + 1} of {totalQuestions}</span>
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i <= currentIndex ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const clarificationQuestions: Record<Domain, ClarificationQuestion[]> = {
  fintech: [
    {
      id: 'dataFormat',
      question: 'What format are your financial documents in?',
      options: ['PDF', 'CSV', 'JSON', 'XML'],
      type: 'select'
    },
    {
      id: 'timeRange',
      question: 'What time range should we analyze?',
      type: 'text',
      placeholder: 'e.g., Last 6 months, 2 years, etc.'
    }
  ],
  healthcare: [
    {
      id: 'imageType',
      question: 'What type of medical images are you working with?',
      options: ['X-Ray', 'MRI', 'CT Scan', 'Ultrasound'],
      type: 'select'
    },
    {
      id: 'resolution',
      question: 'What is the typical resolution of your images?',
      type: 'text',
      placeholder: 'e.g., 512x512, 1024x1024'
    }
  ],
  sustainability: [
    {
      id: 'sensorCount',
      question: 'How many energy sensors are you collecting data from?',
      type: 'number',
      placeholder: 'Enter number of sensors'
    },
    {
      id: 'frequency',
      question: 'What is your data collection frequency?',
      type: 'text',
      placeholder: 'e.g., Every minute, hourly, daily'
    }
  ]
};