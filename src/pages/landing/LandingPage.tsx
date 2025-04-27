import React, { useEffect, useState } from 'react';
import { Domain } from '../../App';
import { Header } from '../../components/Header';
import { RobotAssistant } from '../../components/RobotAssistant';
import { Footer } from '../../components/Footer';
import { SearchBar, AIMode } from './components/SearchBar';
import { DomainPills, domains } from './components/DomainPills';
import { ClarificationChat } from './components/ClarificationChat';
import { useClarification } from './hooks/useClarification';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, FileText, X, AlertCircle } from 'lucide-react';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

interface LandingPageProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  mode: 'fast' | 'precise';
  setMode: (mode: 'fast' | 'precise') => void;
  onGenerate: () => void;
  aiMode: AIMode;
  setAIMode: (mode: AIMode) => void;
}

export function LandingPage({ prompt, setPrompt, mode, setMode, onGenerate, aiMode, setAIMode }: LandingPageProps) {
  const [showReadyMessage, setShowReadyMessage] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  const {
    showClarification,
    setShowClarification,
    clarificationAnswers,
    currentQuestionIndex,
    isTyping,
    questions,
    context,
    error,
    fetchClarificationQuestions,
    handleClarificationAnswer,
    handleNextQuestion,
    resetClarification
  } = useClarification();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowReadyMessage(!!prompt.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [prompt]);

  const handleDomainClick = (domain: Domain) => {
    const example = domains.find(d => d.id === domain)?.example || '';
    setPrompt(example);
    setSelectedDomain(domain);
    resetClarification();
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    if (aiMode === 'quick') {
      // For quick mode, use the existing clarification flow
      if (mode === 'precise' && selectedDomain) {
        await fetchClarificationQuestions(prompt, selectedDomain);
      } else {
        onGenerate();
      }
    } else {
      // For Agentic mode, we'll implement this later
      // For now, just show a console message
      console.log('Agentic mode selected - to be implemented');
      onGenerate();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && prompt.trim()) {
      handleSubmit();
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      // Add file to uploadedFiles with initial status
      const newFile: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0
      };
      
      setUploadedFiles(prev => [...prev, newFile]);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Update file status to success
          setUploadedFiles(prev => 
            prev.map(f => 
              f.name === file.name 
                ? { ...f, status: 'success', progress: 100 }
                : f
            )
          );
        } else {
          // Update progress
          setUploadedFiles(prev => 
            prev.map(f => 
              f.name === file.name 
                ? { ...f, progress: Math.round(progress) }
                : f
            )
          );
        }
      }, 500);
    });
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(files => files.filter(f => f.name !== fileName));
  };

  return (
    <>
      <Header mode={mode} setMode={setMode} />

      <main className="max-w-3xl mx-auto px-4 pt-28 pb-16">
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-[54px] font-['Google_Sans'] tracking-tight mb-5">
              Connect<span className="text-blue-500">ML</span>
            </h1>
            <p className="text-gray-600">Transform natural language into ML pipelines with Agentic AI</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <SearchBar
                prompt={prompt}
                setPrompt={setPrompt}
                onKeyPress={handleKeyPress}
                mode={mode}
                aiMode={aiMode}
                setAIMode={setAIMode}
                onFileUpload={handleFileUpload}
              />

              <ClarificationChat
                show={showClarification}
                currentQuestion={currentQuestion}
                isTyping={isTyping}
                selectedDomain={selectedDomain}
                currentQuestionIndex={currentQuestionIndex}
                clarificationAnswers={clarificationAnswers}
                onAnswerSubmit={handleClarificationAnswer}
                onNextQuestion={() => handleNextQuestion(selectedDomain!, onGenerate)}
                context={context}
                totalQuestions={questions.length}
                error={error}
              />
            </div>

            <DomainPills
              selectedDomain={selectedDomain}
              onDomainClick={handleDomainClick}
            />

            {/* File Upload Status */}
            <AnimatePresence>
              {uploadedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
                    {uploadedFiles.map((file) => (
                      <motion.div
                        key={file.name}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="p-4 flex items-center gap-4"
                      >
                        <div className={`p-2 rounded-lg ${
                          file.status === 'success' ? 'bg-green-50' :
                          file.status === 'error' ? 'bg-red-50' :
                          'bg-blue-50'
                        }`}>
                          <FileText className={`w-5 h-5 ${
                            file.status === 'success' ? 'text-green-600' :
                            file.status === 'error' ? 'text-red-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <button
                              onClick={() => removeFile(file.name)}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                          
                          <div className="mt-1 flex items-center gap-2">
                            {file.status === 'uploading' && (
                              <>
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                    style={{ width: `${file.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">
                                  {file.progress}%
                                </span>
                              </>
                            )}
                            {file.status === 'success' && (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                Upload complete
                              </span>
                            )}
                            {file.status === 'error' && (
                              <span className="text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {file.error || 'Upload failed'}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <RobotAssistant show={showReadyMessage} />
      <Footer />
    </>
  );
}