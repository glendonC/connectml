import { useState } from 'react';
import { Domain } from '../../../App';
import { clarificationQuestions } from '../components/ClarificationChat';

export function useClarification() {
  const [showClarification, setShowClarification] = useState(false);
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const simulateTyping = async () => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsTyping(false);
  };

  const handleClarificationAnswer = (questionId: string, answer: string) => {
    setClarificationAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = async (selectedDomain: Domain, onComplete: () => void) => {
    const questions = clarificationQuestions[selectedDomain];
    if (currentQuestionIndex < questions.length - 1) {
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTyping(false);
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowClarification(false);
      onComplete();
    }
  };

  const resetClarification = () => {
    setShowClarification(false);
    setClarificationAnswers({});
    setCurrentQuestionIndex(0);
  };

  return {
    showClarification,
    setShowClarification,
    clarificationAnswers,
    currentQuestionIndex,
    isTyping,
    simulateTyping,
    handleClarificationAnswer,
    handleNextQuestion,
    resetClarification
  };
}