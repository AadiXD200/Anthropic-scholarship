import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditorProps {
  content: string;
  onContentChange?: (content: string) => void;
}

export const Editor = ({ content, onContentChange }: EditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [selectedSentence, setSelectedSentence] = useState<{ text: string; start: number; end: number } | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedSuggestion, setEnhancedSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  // Update editedContent whenever content prop changes (from parent)
  useEffect(() => {
    if (!isEditing) {
      setEditedContent(content);
    }
  }, [content, isEditing]);

  const handleSave = () => {
    onContentChange?.(editedContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const selectedText = selection.toString();
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(range.commonAncestorContainer);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      const start = preCaretRange.toString().length - selectedText.length;
      const end = start + selectedText.length;

      setSelectedSentence({ text: selectedText, start, end });
      setShowSuggestion(false);
    }
  };

  const enhanceSentence = async () => {
    if (!selectedSentence) return;

    setIsEnhancing(true);
    try {
      // Simulate AI enhancement with improved version
      const enhancements: { [key: string]: string } = {
        'I was sad': 'A profound melancholy settled over me, reshaping my perspective.',
        'I was happy': 'An overwhelming sense of joy and possibility filled my heart.',
        'I learned a lot': 'This experience became a transformative catalyst for my personal growth.',
        'It was hard': 'The challenge tested my resilience and forced me to discover inner strength I didn\'t know I possessed.',
        'I tried my best': 'I committed myself fully to the endeavor, pushing beyond my perceived limitations.',
        'I changed': 'I underwent a profound transformation that fundamentally altered my worldview and aspirations.',
        'It was important': 'This moment became a pivotal turning point that shaped my character and future direction.',
      };

      // Find a matching enhancement or create a generic one
      let enhanced = selectedSentence.text;
      for (const [original, improvement] of Object.entries(enhancements)) {
        if (selectedSentence.text.toLowerCase().includes(original.toLowerCase())) {
          enhanced = selectedSentence.text.replace(
            new RegExp(original, 'gi'),
            improvement
          );
          break;
        }
      }

      // If no specific match, provide a generic enhancement
      if (enhanced === selectedSentence.text) {
        enhanced = `${selectedSentence.text.trim()} This experience profoundly shaped my understanding and growth.`;
      }

      // Simulate a small delay for realism
      await new Promise(resolve => setTimeout(resolve, 500));

      setEnhancedSuggestion(enhanced);
      setShowSuggestion(true);
    } catch (error) {
      console.error('Error enhancing sentence:', error);
      toast({
        title: 'Error',
        description: 'Failed to enhance sentence. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const applySuggestion = () => {
    if (!selectedSentence) return;
    const newContent = 
      editedContent.substring(0, selectedSentence.start) +
      enhancedSuggestion +
      editedContent.substring(selectedSentence.end);
    setEditedContent(newContent);
    onContentChange?.(newContent);
    setSelectedSentence(null);
    setShowSuggestion(false);
    toast({
      title: 'Success',
      description: 'Sentence updated successfully!',
    });
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[500px] text-base font-serif leading-relaxed resize-none focus:ring-2 focus:ring-primary/50"
            placeholder="Edit your essay here..."
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="px-6 bg-primary hover:bg-primary/90"
          >
            Save Changes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div 
        className="min-h-[500px] bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 rounded-xl p-8 shadow-lg border-2 border-slate-200 dark:border-slate-700 cursor-text transition-all hover:shadow-xl"
        onMouseUp={handleTextSelect}
      >
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div 
            className="whitespace-pre-wrap text-foreground leading-relaxed selection:bg-primary/20 selection:text-foreground"
            style={{ 
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              fontSize: '1.125rem',
              lineHeight: '1.8'
            }}
          >
            {editedContent || (
              <span className="text-muted-foreground italic">
                Your essay will appear here as we write together...
              </span>
            )}
          </div>
        </div>
      </div>

      {selectedSentence && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Selected text:</p>
            <p className="text-sm italic text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded border border-blue-200 dark:border-blue-800">
              "{selectedSentence.text}"
            </p>
          </div>
          
          {showSuggestion && (
            <div className="space-y-2 bg-green-50 dark:bg-green-950/30 p-3 rounded border border-green-200 dark:border-green-800">
              <p className="text-sm font-semibold text-green-700 dark:text-green-300">AI Suggestion:</p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {enhancedSuggestion}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={applySuggestion}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSuggestion(false)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {!showSuggestion && (
            <Button
              size="sm"
              onClick={enhanceSentence}
              disabled={isEnhancing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Improve with AI
                </>
              )}
            </Button>
          )}
        </div>
      )}

      <div className="flex gap-3 justify-between items-center">
        <Button
          onClick={() => setIsEditing(true)}
          variant="outline"
          className="px-6 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Edit Essay
        </Button>
        <Button
          onClick={() => copyToClipboard(editedContent, 0)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {copiedIndex === 0 ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
};