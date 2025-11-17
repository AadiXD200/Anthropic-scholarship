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
        <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/30 dark:to-blue-950/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-base text-foreground font-medium flex items-start gap-3">
            <span className="text-2xl flex-shrink-0 mt-0.5">❓</span>
            <span className="leading-relaxed">{question}</span>
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
          className="flex-1 h-12 text-base bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 shadow-sm"
        />
        <Button
          type="submit"
          disabled={!answer.trim() || isLoading}
          className="h-12 px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold rounded-lg transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </form>

      {isLoading && (
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-lg py-3 px-4 border border-slate-200 dark:border-slate-800">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle" style={{ animationDelay: '200ms' }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle" style={{ animationDelay: '400ms' }} />
          </div>
          <span className="font-medium">Crafting your essay...</span>
        </div>
      )}
    </div>
  );
};