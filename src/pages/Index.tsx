import { useState } from 'react';
import { DescriptionInput } from '@/components/DescriptionInput';
import { EssayAnalysis } from '@/components/EssayAnalysis';
import { Editor } from '@/components/Editor';
import { InputPrompt } from '@/components/InputPrompt';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Index = () => {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [scholarshipDescription, setScholarshipDescription] = useState('');
  const [essayContent, setEssayContent] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStart = async (description: string) => {
    setScholarshipDescription(description);
    setSessionStarted(true);
    // Analysis phase will be shown next
  };

  const handleAnalysisComplete = async (analysis: string) => {
    setAnalysisComplete(true);
    // Add the analysis to conversation history for context
    const updatedHistory: Message[] = [
      { role: 'assistant', content: analysis }
    ];
    setConversationHistory(updatedHistory);
    
    // Start the first writing cycle
    await handleContinueWriting('', updatedHistory);
  };

  const generateMockResponse = (userAnswer: string, essayLength: number, conversationCount: number): { text_to_write: string; question_to_ask: string } => {
    // Dynamic responses that build on user answers and avoid repetition
    const essayResponses: { [key: number]: { text: string; question: string; context: string }[] } = {
      0: [ // First response - opening
        {
          text: "There was a moment in my life that fundamentally changed how I see myself and the world around me. It wasn't a dramatic event, but rather a quiet realization that emerged from facing something I thought would break me. Looking back now, I understand that this challenge became the catalyst for discovering who I truly am.",
          question: "Can you describe the specific challenge or situation you faced? I want to understand the context so we can make your opening even more compelling.",
          context: "I'm asking this to establish the foundation of your essay. Scholarship committees want to see a clear, relatable challenge that shows vulnerability and authenticity. Your specific details will make your story memorable."
        }
      ],
      1: [ // Second response - the challenge
        {
          text: "The weight of this challenge pressed down on me in ways I hadn't anticipated. Every day felt like a battle between giving up and pushing forward. But somewhere deep inside, I found a voice that refused to accept defeat. I realized that this wasn't just about overcoming an obstacle—it was about discovering what I was truly capable of.",
          question: "What was your immediate reaction when you first faced this challenge? Did you feel fear, confusion, determination, or something else?",
          context: "This helps me understand your emotional journey. Scholarship essays that show genuine emotion and self-awareness stand out. I want to capture that authentic moment of realization in your writing."
        }
      ],
      2: [ // Third response - action taken
        {
          text: "I decided to take control of the situation rather than let it control me. I broke down the overwhelming challenge into smaller, manageable pieces. Each small victory—no matter how minor it seemed—became a stepping stone toward the larger goal. I sought help when I needed it, learned from my mistakes, and refused to let setbacks define my trajectory. This methodical approach transformed my perspective from despair to determination.",
          question: "What specific steps or actions did you take? Can you give me 2-3 concrete examples of how you tackled this challenge?",
          context: "Admissions officers want to see agency and problem-solving skills. They're looking for evidence that you don't just face challenges—you actively work to overcome them. Your specific actions demonstrate character and resilience."
        }
      ],
      3: [ // Fourth response - growth and learning
        {
          text: "Through this process, I learned something invaluable about myself. I discovered that I'm more resilient than I ever imagined, more creative in finding solutions, and more compassionate toward others facing similar struggles. This experience stripped away my illusions about who I thought I was and revealed my true character. I learned that growth isn't comfortable, but it's absolutely necessary. I also learned the importance of asking for help and recognizing that strength isn't about doing everything alone—it's about knowing when to lean on others.",
          question: "What's the most important lesson you learned from this experience? How has it changed your perspective on challenges in general?",
          context: "This is where we show your self-awareness and maturity. Scholarship committees want to see that you've reflected deeply on your experience and extracted meaningful lessons. This demonstrates wisdom beyond your years."
        }
      ],
      4: [ // Fifth response - future vision
        {
          text: "This experience has fundamentally shaped my vision for my future. I no longer see challenges as roadblocks but as opportunities for growth and contribution. I'm committed to using the education this scholarship provides to help others navigate their own struggles. Whether through mentorship, advocacy, or professional work, I want to create positive change in my community. I want to be someone who doesn't just overcome adversity—I want to help others do the same.",
          question: "How do you see this experience connecting to your future goals? What do you want to accomplish in college and beyond?",
          context: "This is crucial for showing the scholarship committee that you have vision and purpose. They want to invest in students who will make a difference. Your answer here shows how this challenge has shaped your ambitions and values."
        }
      ],
      5: [ // Sixth response - impact and conclusion
        {
          text: "I believe that my story is more than just about overcoming a single challenge—it's about transformation and purpose. Every obstacle I've faced has been a teacher, every setback a setup for a comeback. I'm entering this next chapter of my education with clarity, determination, and a deep commitment to making a meaningful impact. I'm ready to contribute to your community, to learn from diverse perspectives, and to grow into the person I'm meant to become. This scholarship isn't just financial support—it's an investment in someone who will use their education to lift others up.",
          question: "Is there anything else about your journey or your vision that you'd like to add? Any final thoughts that would make your essay more complete?",
          context: "We're wrapping up your essay now. This is your chance to leave a lasting impression. Think about what final message you want the scholarship committee to remember about you."
        }
      ]
    };

    // Get the appropriate response set based on conversation count
    const responseSet = essayResponses[Math.min(conversationCount, 5)] || essayResponses[5];
    const response = responseSet[0]; // Get the first (and usually only) response for this stage

    return {
      text_to_write: response.text,
      question_to_ask: `${response.question}\n\n💡 Why I'm asking: ${response.context}`
    };
  };

  const handleContinueWriting = async (userAnswer: string, initialHistory?: Message[]) => {
    setIsLoading(true);
    setCurrentQuestion('');

    try {
      // Add user's answer to conversation history if provided
      let updatedHistory = initialHistory ? [...initialHistory] : [...conversationHistory];
      if (userAnswer.trim()) {
        updatedHistory.push({ role: 'user', content: userAnswer });
      }

      // Generate mock response based on conversation count
      // Count user messages to determine which essay section we're on
      const userMessageCount = updatedHistory.filter(msg => msg.role === 'user').length;
      const mockResponse = generateMockResponse(userAnswer, essayContent.length, userMessageCount);
      const { text_to_write, question_to_ask } = mockResponse;

      // Simulate streaming by adding text word by word
      const words = text_to_write.split(' ');
      let currentText = essayContent;
      
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 60)); // 60ms per word for smooth animation
        currentText += (currentText && !currentText.endsWith('\n') ? ' ' : '') + words[i];
        setEssayContent(currentText);
      }

      // Add AI response to history
      updatedHistory.push({ role: 'assistant', content: text_to_write });
      setConversationHistory(updatedHistory);
      
      // Set the next question
      setCurrentQuestion(question_to_ask);

    } catch (error) {
      console.error('Error in co-writing:', error);
      toast({
        title: 'Error',
        description: 'Failed to continue writing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!sessionStarted) {
    return <DescriptionInput onStart={handleStart} />;
  }

  if (sessionStarted && !analysisComplete) {
    return <EssayAnalysis scholarshipDescription={scholarshipDescription} onAnalysisComplete={handleAnalysisComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-12 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Essay Architect
            </h1>
          </div>
          <p className="text-lg text-muted-foreground ml-0">
            Craft your scholarship essay with AI assistance
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Essay Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">📝</span>
              <h2 className="text-2xl font-semibold text-foreground">Your Essay</h2>
            </div>
            <Editor content={essayContent} onContentChange={setEssayContent} />
          </div>

          {/* Interaction Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">💬</span>
              <h2 className="text-2xl font-semibold text-foreground">Continue Writing</h2>
            </div>
            <InputPrompt
              question={currentQuestion}
              isLoading={isLoading}
              onSubmit={handleContinueWriting}
            />
          </div>
        </div>

        {/* Footer Info */}
        {essayContent && (
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground">
              <div>
                <p>Word count: <span className="font-semibold text-foreground">{essayContent.split(/\s+/).filter(w => w).length}</span></p>
              </div>
              <div className="text-xs">
                💡 Tip: Select any text and click "Improve with AI" to enhance sentences
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;