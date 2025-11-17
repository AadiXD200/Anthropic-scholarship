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
    const { scholarship_description, conversation_history, essay_text } = await req.json();
    
    console.log('Co-writer request received:', {
      hasDescription: !!scholarship_description,
      conversationLength: conversation_history?.length || 0,
      essayLength: essay_text?.length || 0
    });

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Mock framework analysis (hardcoded for MVP)
    const framework = `Framework: Use the "Overcoming Adversity" narrative structure:
1. Set the scene with vivid details
2. Describe the challenge authentically
3. Show your growth and learning
4. Connect to your future goals
5. Demonstrate impact and reflection`;

    // Build the master prompt
    const systemPrompt = `You are an expert scholarship essay co-writer helping a student craft a compelling essay. 

The scholarship description is: ${scholarship_description}

The winning framework to follow is:
${framework}

Current essay draft:
${essay_text || '[Essay is just starting]'}

Your task is to continue writing the essay. Write ONE to THREE sentences that advance the narrative naturally. Then stop and ask ONE specific, targeted question to gather the next piece of information you need.

You must respond with ONLY a valid JSON object in this exact format:
{
  "text_to_write": "The actual sentences to add to the essay",
  "question_to_ask": "A specific question to ask the student"
}

Guidelines:
- Write in a natural, authentic voice
- Be specific and vivid in descriptions
- Ask questions that will reveal meaningful details
- Keep the writing flow smooth and engaging
- Don't repeat information already in the essay`;

    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history if it exists
    if (conversation_history && conversation_history.length > 0) {
      messages.push(...conversation_history);
    }

    console.log('Calling OpenAI with', messages.length, 'messages');

    // Call OpenAI API with streaming
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 500,
        temperature: 0.8,
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
    console.error('Error in co-writer function:', error);
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