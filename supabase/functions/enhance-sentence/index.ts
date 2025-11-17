import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sentence, context } = await req.json();
    
    console.log('Enhance-sentence request received:', {
      sentenceLength: sentence?.length || 0,
      contextLength: context?.length || 0
    });

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    if (!sentence) {
      throw new Error('sentence is required');
    }

    // Build the enhancement prompt
    const systemPrompt = `You are an expert essay writing coach. Your task is to improve and enhance sentences for scholarship essays. 

When enhancing a sentence:
1. Maintain the original meaning and intent
2. Make it more vivid, engaging, and impactful
3. Improve clarity and flow
4. Use more sophisticated vocabulary where appropriate
5. Ensure it fits the essay's tone and context

Respond with ONLY the enhanced sentence, nothing else. No explanations, no quotes, just the improved sentence.`;

    const userPrompt = `Here's the sentence I want to enhance:
"${sentence}"

${context ? `Here's the context from my essay:\n${context}` : ''}

Please enhance this sentence to make it more impactful and engaging.`;

    console.log('Calling OpenAI to enhance sentence');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', response.status, error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedSentence = data.choices?.[0]?.message?.content?.trim() || sentence;

    console.log('Successfully enhanced sentence');

    return new Response(
      JSON.stringify({ enhanced_sentence: enhancedSentence }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in enhance-sentence function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
