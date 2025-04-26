import { useState } from 'react';
import { Domain } from '../../../App';

export interface ClarificationQuestion {
  id: string;
  question: string;
  type: 'select' | 'text' | 'number';
  options?: string[];
  placeholder?: string;
}

interface ClarificationResponse {
  questions: ClarificationQuestion[];
  context: string;
}

export function useClarification() {
  const [showClarification, setShowClarification] = useState(false);
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [questions, setQuestions] = useState<ClarificationQuestion[]>([]);
  const [context, setContext] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchClarificationQuestions = async (prompt: string, domain: string) => {
    try {
      setError(null);
      setIsTyping(true);
      setShowClarification(true);
      
      // Start both the API call and the minimum delay timer
      const [data] = await Promise.all([
        fetch('http://localhost:8000/generate-clarification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, domain })
        }).then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch clarification questions');
          }
          return response.json();
        }),
        // Minimum delay of 1.5 seconds to show loading animation
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);

      setQuestions(data.questions);
      setContext(data.context);
      setCurrentQuestionIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching clarification questions:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClarificationAnswer = (questionId: string, answer: string) => {
    setClarificationAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = async (selectedDomain: Domain, onComplete: () => void) => {
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
    setQuestions([]);
    setContext('');
    setError(null);
  };

  return {
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
  };
}