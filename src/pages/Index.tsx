import { useState } from 'react';
import { DescriptionInput } from '@/components/DescriptionInput';
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
  const [scholarshipDescription, setScholarshipDescription] = useState('');
  const [essayContent, setEssayContent] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStart = async (description: string) => {
    setScholarshipDescription(description);
    setSessionStarted(true);
    
    // Start the first writing cycle
    await handleContinueWriting('');
  };

  const handleContinueWriting = async (userAnswer: string) => {
    setIsLoading(true);
    setCurrentQuestion('');

    try {
      // Add user's answer to conversation history if provided
      let updatedHistory = [...conversationHistory];
      if (userAnswer.trim()) {
        updatedHistory.push({ role: 'user', content: userAnswer });
      }

      // Call the edge function with streaming
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/co-writer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            scholarship_description: scholarshipDescription,
            conversation_history: updatedHistory,
            essay_text: essayContent,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse the streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              fullResponse += content;
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      // Parse the final JSON response
      try {
        const result = JSON.parse(fullResponse);
        const { text_to_write, question_to_ask } = result;

        // Update essay content with new text (word by word animation)
        const words = text_to_write.split(' ');
        let currentText = essayContent;
        
        for (let i = 0; i < words.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 50));
          currentText += (currentText && !currentText.endsWith('\n') ? ' ' : '') + words[i];
          setEssayContent(currentText);
        }

        // Add AI response to history
        updatedHistory.push({ role: 'assistant', content: text_to_write });
        setConversationHistory(updatedHistory);
        
        // Set the next question
        setCurrentQuestion(question_to_ask);
      } catch (e) {
        console.error('Error parsing final response:', e, 'Response:', fullResponse);
        toast({
          title: 'Error',
          description: 'Failed to parse AI response. Please try again.',
          variant: 'destructive',
        });
      }

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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Your Scholarship Essay
          </h1>
          <p className="text-muted-foreground">
            Answer the questions below to continue building your essay
          </p>
        </div>

        <Editor content={essayContent} />
        
        <InputPrompt
          question={currentQuestion}
          isLoading={isLoading}
          onSubmit={handleContinueWriting}
        />
      </div>
    </div>
  );
};

export default Index;