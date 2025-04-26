export interface ClarificationQuestion {
  id: string;
  question: string;
  options?: string[];
  type: 'text' | 'select' | 'number';
  placeholder?: string;
}