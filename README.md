# Scholarship Essay Co-Writer 🎓✨

An AI-powered interactive writing assistant that helps students craft compelling scholarship essays through a guided conversation.

## Features

- **Interactive Co-Writing**: The AI writes a few sentences, then asks targeted questions to gather information
- **Streaming Responses**: Watch your essay come to life with smooth, word-by-word animations
- **No Authentication Required**: Simple, focused MVP - just paste your scholarship description and start writing
- **Beautiful UI**: Clean, distraction-free writing interface inspired by Notion

## How It Works

1. **Paste the scholarship description** - Provide the requirements and criteria
2. **Answer questions** - The AI asks specific questions about your experiences
3. **Watch your essay grow** - Each answer adds beautifully crafted sentences to your essay
4. **Continue the conversation** - Keep answering until your essay is complete

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Lovable Cloud (Supabase Edge Functions)
- **AI**: OpenAI GPT-4o with streaming responses
- **Hosting**: Deployed on Lovable

## Architecture

The application uses a client-side state management approach where:
- Essay content is stored in React state
- Conversation history builds up through the session
- All data resets on page refresh (perfect for MVP)

The AI follows a narrative framework ("Overcoming Adversity") to guide students through crafting a compelling story.

## Development

This is a Lovable project. To make changes:
1. Use the Lovable editor to modify components
2. Edge functions deploy automatically
3. Changes appear instantly in the preview

## Environment Variables

Required secrets (configured in Lovable Cloud):
- `OPENAI_API_KEY` - Your OpenAI API key

## Credits

Built with ❤️ using Lovable - the AI-powered web app builder
