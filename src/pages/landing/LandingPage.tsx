import React, { useEffect, useState } from 'react';
import { Domain } from '../../App';
import { Header } from '../../components/Header';
import { RobotAssistant } from '../../components/RobotAssistant';
import { Footer } from '../../components/Footer';
import { SearchBar } from './components/SearchBar';
import { DomainPills, domains } from './components/DomainPills';
import { ClarificationChat, clarificationQuestions } from './components/ClarificationChat';
import { useClarification } from './hooks/useClarification';

interface LandingPageProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  mode: 'fast' | 'precise';
  setMode: (mode: 'fast' | 'precise') => void;
  onGenerate: () => void;
}

export function LandingPage({ prompt, setPrompt, mode, setMode, onGenerate }: LandingPageProps) {
  const [showReadyMessage, setShowReadyMessage] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  
  const {
    showClarification,
    setShowClarification,
    clarificationAnswers,
    currentQuestionIndex,
    isTyping,
    simulateTyping,
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

  const handleSubmit = () => {
    if (!prompt.trim()) return;

    if (mode === 'precise' && selectedDomain) {
      setShowClarification(true);
      simulateTyping();
    } else {
      onGenerate();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && prompt.trim()) {
      handleSubmit();
    }
  };

  const currentQuestion = selectedDomain && clarificationQuestions[selectedDomain][currentQuestionIndex];

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
              />
            </div>

            <DomainPills
              selectedDomain={selectedDomain}
              onDomainClick={handleDomainClick}
            />
          </div>
        </div>
      </main>

      <RobotAssistant show={showReadyMessage} />
      <Footer />
    </>
  );
}