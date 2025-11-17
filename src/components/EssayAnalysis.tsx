import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EssayAnalysisProps {
  scholarshipDescription: string;
  onAnalysisComplete: (analysis: string) => void;
}

export const EssayAnalysis = ({ scholarshipDescription, onAnalysisComplete }: EssayAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState('');
  const [displayedAnalysis, setDisplayedAnalysis] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    analyzeEssay();
  }, []);

  const analyzeEssay = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis with a realistic response
      const analysisText = `I've analyzed your scholarship prompt, and here's what I found:

**Key Themes & Values:**
This scholarship is looking for students who demonstrate resilience, personal growth, and a clear sense of purpose. The prompt emphasizes overcoming challenges and showing how those experiences have shaped your character and future goals.

**Narrative Structure That Works Best:**
The most compelling essays for this type of prompt follow a classic "challenge → action → growth" arc:
1. Start with a specific, vivid moment that sets the scene
2. Describe the challenge authentically (avoid being overly dramatic)
3. Focus on what YOU did to overcome it
4. Show concrete evidence of growth or learning
5. Connect it to your future aspirations

**What Resonates:**
- Specific, concrete details rather than generalizations
- Honest vulnerability about struggles
- Evidence of reflection and self-awareness
- Clear connection between the challenge and your values
- A forward-looking perspective

**Tone & Voice:**
Write in your authentic voice - conversational but thoughtful. Avoid clichés like "this experience changed my life." Instead, show the change through specific examples and insights.

**Potential Pitfalls to Avoid:**
- Making the challenge seem too small or insignificant
- Focusing more on the problem than your response
- Being overly dramatic or exaggerating
- Losing focus on how this relates to your future

Let's craft an essay that truly represents who you are!`;

      // Simulate streaming by adding text character by character
      let currentText = '';
      for (let i = 0; i < analysisText.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 15)); // 15ms per character for smooth streaming
        currentText += analysisText[i];
        setDisplayedAnalysis(currentText);
      }

      setAnalysis(analysisText);
    } catch (error) {
      console.error('Error analyzing essay:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze essay. Proceeding to writing anyway.',
        variant: 'destructive',
      });
      setAnalysis('Unable to complete analysis. Let\'s start writing your essay!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-3xl">
            <Lightbulb className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            Analyzing Your Essay
          </h2>
          <p className="text-lg text-muted-foreground">
            Let me understand the scholarship requirements and develop a strategy...
          </p>
        </div>

        {/* Analysis Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border-2 border-slate-200 dark:border-slate-700 space-y-6">
          {/* Analysis Text */}
          <div className="space-y-4">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed text-base">
                {displayedAnalysis || (
                  <span className="text-muted-foreground italic">
                    Analyzing scholarship requirements...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {isAnalyzing && (
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground bg-slate-50 dark:bg-slate-950/50 rounded-lg py-4 px-4 border border-slate-200 dark:border-slate-800">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-gentle" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-gentle" style={{ animationDelay: '200ms' }} />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-gentle" style={{ animationDelay: '400ms' }} />
              </div>
              <span className="font-medium">Thinking through your essay strategy...</span>
            </div>
          )}

          {/* Completion State */}
          {!isAnalyzing && (
            <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 rounded-lg py-4 px-4 border border-green-200 dark:border-green-800/50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Analysis complete! Ready to start writing.
                </span>
              </div>
              <Button
                onClick={() => onAnalysisComplete(analysis)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                Start Writing
              </Button>
            </div>
          )}
        </div>

        {/* Info */}
        <p className="text-sm text-center text-muted-foreground">
          This analysis helps me understand the best approach for your essay
        </p>
      </div>
    </div>
  );
};
