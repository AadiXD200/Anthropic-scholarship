import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';

interface InputPromptProps {
  question: string;
  isLoading: boolean;
  onSubmit: (answer: string) => void;
}

export const InputPrompt = ({ question, isLoading, onSubmit }: InputPromptProps) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() && !isLoading) {
      onSubmit(answer);
      setAnswer('');
    }
  };

  return (
    <div className="space-y-4">
      {question && (
        <div className="bg-question-bg rounded-lg p-6 border border-primary/20">
          <p className="text-base text-foreground font-medium flex items-start gap-3">
            <span className="text-primary flex-shrink-0 mt-1">❓</span>
            <span>{question}</span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          type="text"
          placeholder={isLoading ? "AI is writing..." : "Type your answer here..."}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isLoading}
          className="flex-1 h-12 text-base bg-card border-border focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
        />
        <Button
          type="submit"
          disabled={!answer.trim() || isLoading}
          className="h-12 px-6 bg-primary hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </form>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-loading-pulse rounded-full animate-pulse-gentle" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-loading-pulse rounded-full animate-pulse-gentle" style={{ animationDelay: '200ms' }} />
            <span className="w-2 h-2 bg-loading-pulse rounded-full animate-pulse-gentle" style={{ animationDelay: '400ms' }} />
          </div>
          <span>Crafting your essay...</span>
        </div>
      )}
    </div>
  );
};