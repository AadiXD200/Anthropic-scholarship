import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';

interface DescriptionInputProps {
  onStart: (description: string) => void;
}

export const DescriptionInput = ({ onStart }: DescriptionInputProps) => {
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (description.trim()) {
      onStart(description);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Scholarship Essay Co-Writer
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Let's craft a compelling essay together. Start by pasting the scholarship description below.
          </p>
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder="Paste the scholarship description here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[200px] text-base resize-none bg-card border-border focus:ring-2 focus:ring-primary/20 transition-all"
          />
          
          <Button
            onClick={handleSubmit}
            disabled={!description.trim()}
            className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            Start Writing
          </Button>
        </div>

        <p className="text-sm text-center text-muted-foreground">
          Your essay will be created through an interactive conversation
        </p>
      </div>
    </div>
  );
};