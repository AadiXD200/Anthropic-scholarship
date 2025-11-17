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
    const { scholarship_description } = await req.json();
    
    console.log('Analyze-essay request received:', {
      hasDescription: !!scholarship_description,
      descriptionLength: scholarship_description?.length || 0
    });

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    if (!scholarship_description) {
      throw new Error('scholarship_description is required');
    }

    // Build the analysis prompt
    const systemPrompt = `You are an expert scholarship essay strategist and analyst. Your task is to analyze a scholarship description and provide strategic insights about how to approach writing the essay.

Provide a thoughtful analysis that includes:
1. Key themes and values the scholarship is looking for
2. The type of narrative or story that would resonate
3. Common essay structures that work well for this type of prompt
4. Specific elements or details to include
5. Tone and voice recommendations
6. Any potential pitfalls to avoid

Be conversational and encouraging. Start with something like "I've analyzed your scholarship prompt, and here's what I found..." Make it feel like you're thinking through the strategy with the student.`;

    const userPrompt = `Here's the scholarship description I need to write about:

${scholarship_description}

Please analyze this and give me strategic insights on how to approach this essay.`;

    console.log('Calling OpenAI for essay analysis');

    // Call OpenAI API with streaming
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
        max_tokens: 1000,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', response.status, error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    // Stream the response back to the client
    const stream = response.body;
    
    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in analyze-essay function:', error);
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
