# Supabase Edge Functions Setup

This guide explains how to deploy the edge functions for Essay Architect.

## Functions Created

1. **analyze-essay** - Analyzes scholarship descriptions and provides essay strategy
2. **enhance-sentence** - Improves individual sentences in the essay
3. **co-writer** - Generates essay content based on conversation (already exists)

## Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- OpenAI API key configured in Supabase

## Deployment Steps

### 1. Set up Supabase CLI

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-id pnsixdzniisqiwozvoqj
```

### 2. Configure OpenAI API Key

In your Supabase dashboard:
1. Go to Settings → Edge Functions
2. Add a new secret: `OPENAI_API_KEY` with your OpenAI API key

Or via CLI:
```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Deploy Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific functions
supabase functions deploy analyze-essay
supabase functions deploy enhance-sentence
supabase functions deploy co-writer
```

### 4. Verify Deployment

Check your Supabase dashboard under Edge Functions to confirm all three functions are deployed.

## Testing

You can test the functions using the Supabase dashboard or by making requests from your app.

### Test analyze-essay:
```bash
curl -X POST https://pnsixdzniisqiwozvoqj.supabase.co/functions/v1/analyze-essay \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"scholarship_description": "Write about your greatest achievement"}'
```

## Troubleshooting

- **"OPENAI_API_KEY is not configured"**: Make sure you've set the secret in Supabase
- **Function not found**: Verify the function is deployed in the dashboard
- **CORS errors**: The functions have CORS headers configured, but check your domain is allowed

## Function Details

### analyze-essay
- **Input**: `scholarship_description` (string)
- **Output**: Streaming text with essay strategy analysis
- **Uses**: GPT-4o with streaming

### enhance-sentence
- **Input**: `sentence` (string), `context` (optional string)
- **Output**: JSON with `enhanced_sentence` field
- **Uses**: GPT-4o

### co-writer
- **Input**: `scholarship_description`, `conversation_history`, `essay_text`
- **Output**: Streaming JSON with `text_to_write` and `question_to_ask`
- **Uses**: GPT-4o with streaming
