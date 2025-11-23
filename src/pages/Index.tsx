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

  // Helper function to analyze scholarship description and find relevant examples
  const analyzeScholarship = async (description: string) => {
    // Extract key terms from the scholarship description
    const keyTerms = description
      .split(/\s+/)
      .filter(term => term.length > 4) // Filter out short words
      .slice(0, 10); // Take first 10 terms

    // This is where you would integrate with a search API
    // For now, we'll use a placeholder that simulates finding common themes
    const commonThemes = [
      'leadership', 'community service', 'overcoming challenges', 
      'academic achievement', 'career goals', 'personal growth'
    ];

    // Simulate finding example essays (in a real app, these would come from search results)
    const exampleEssays = [
      { theme: 'leadership', content: 'Demonstrated leadership in school clubs...' },
      { theme: 'community service', content: 'Volunteered at local food bank...' }
    ];

    return {
      keyTerms,
      commonThemes,
      exampleEssays: exampleEssays.filter(e => 
        description.toLowerCase().includes(e.theme)
      )
    };
  };

  const generateEssayResponse = async (userAnswer: string, essayLength: number, userMessageCount: number): Promise<{ text_to_write: string; question_to_ask: string }> => {
    try {
      // Format conversation history for context
      const conversationContext = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'Student' : 'Advisor'}: ${msg.content}`)
        .join('\n');

      // Let the AI generate a completely dynamic response
      const prompt = `Based on the scholarship description and our conversation, continue helping the student craft their essay. 
      
Scholarship: ${scholarshipDescription}

Conversation so far:
${conversationContext}

Student's latest response:
${userAnswer}

If you need more information to continue the essay, ask one clear question. If you have enough to write a paragraph, do so.

Format your response as:
[ESSAY] Your essay content here
[QUESTION] Your question here`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are helping a student write a scholarship essay. Be direct and natural. Either continue the essay or ask a relevant question. No analysis or explanations needed.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      const responseText = data.choices[0].message.content;
      
      // Parse the response to extract essay content and question
      const essayMatch = /\[ESSAY\]([\s\S]*?)(?=\[QUESTION\]|$)/.exec(responseText);
      const questionMatch = /\[QUESTION\]([\s\S]*?)(?=\[ESSAY\]|$)/.exec(responseText);

      return {
        text_to_write: essayMatch ? essayMatch[1].trim() : '',
        question_to_ask: questionMatch ? questionMatch[1].trim() : 'Could you tell me more about that?'
      };

    } catch (error) {
      console.error('Error generating response:', error);
      
      // Fallback to a more generic but still helpful response
      return {
        text_to_write: '',
        question_to_ask: 'That\'s interesting! Could you tell me more about how this experience connects to your academic or career goals?',
        _error: error.message
      };
    }
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

      // Generate AI response based on scholarship analysis and user input
      const userMessageCount = updatedHistory.filter(msg => msg.role === 'user').length;
      const aiResponse = await generateEssayResponse(userAnswer, essayContent.length, userMessageCount);
      const { text_to_write, question_to_ask } = aiResponse;

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <DescriptionInput onStart={handleStart} />
      </div>
    );
  }

  if (sessionStarted && !analysisComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <EssayAnalysis 
          scholarshipDescription={scholarshipDescription} 
          onAnalysisComplete={handleAnalysisComplete} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        {!sessionStarted ? (
          <DescriptionInput onStart={handleStart} />
        ) : !analysisComplete ? (
          <EssayAnalysis 
            description={scholarshipDescription} 
            onAnalysisComplete={handleAnalysisComplete} 
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Essay Editor (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <span className="text-2xl">✍️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Your Essay</h2>
                </div>
                <Editor 
                  content={essayContent} 
                  onContentChange={setEssayContent} 
                  onContinue={handleContinueWriting}
                  isLoading={isLoading}
                />
                {essayContent && (
                  <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                    Word count: <span className="font-medium text-slate-700 dark:text-slate-300">
                      {essayContent.split(/\s+/).filter(w => w).length}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column - Question/Answer Section (1/3 width) */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Essay Prompt</h2>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {scholarshipDescription}
                </p>
              </div>
              
              {currentQuestion && (
                <div className="sticky top-6">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <span className="text-2xl">💬</span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white">Continue Writing</h2>
                    </div>
                    <InputPrompt
                      question={currentQuestion}
                      isLoading={isLoading}
                      onSubmit={handleContinueWriting}
                    />
                  </div>
                </div>
              )}
              
              {conversationHistory.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <span className="text-2xl">📝</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Your Progress</h2>
                  </div>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {conversationHistory.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-lg ${
                          msg.role === 'assistant' 
                            ? 'bg-blue-50 dark:bg-blue-900/20' 
                            : 'bg-green-50 dark:bg-green-900/20'
                        }`}
                      >
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {msg.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="mt-4 text-xs text-center text-slate-500 dark:text-slate-400">
          💡 Tip: Select any text and click "Improve with AI" to enhance sentences
        </div>
      </div>
    </div>
  );
};

export default Index;