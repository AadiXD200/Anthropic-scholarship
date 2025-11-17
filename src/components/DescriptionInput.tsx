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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Essay Architect
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Craft your scholarship essay with AI assistance. Paste the scholarship description and let's get started!
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border-2 border-slate-200 dark:border-slate-700 space-y-4">
            <label className="block text-sm font-semibold text-foreground">
              Scholarship Description
            </label>
            <Textarea
              placeholder="Paste the scholarship description or essay prompt here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[240px] text-base resize-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
            />
            
            <Button
              onClick={handleSubmit}
              disabled={!description.trim()}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white rounded-lg transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Writing
            </Button>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800/50">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">✨ AI-Powered</p>
              <p className="text-xs text-blue-700 dark:text-blue-400">Get intelligent suggestions to improve your writing</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800/50">
              <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-1">✏️ Fully Editable</p>
              <p className="text-xs text-green-700 dark:text-green-400">Edit any sentence and enhance with AI</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800/50">
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-1">📊 Track Progress</p>
              <p className="text-xs text-purple-700 dark:text-purple-400">Monitor word count and essay development</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-center text-muted-foreground">
          Your essay will be created through an interactive conversation with AI
        </p>
      </div>
    </div>
  );
};