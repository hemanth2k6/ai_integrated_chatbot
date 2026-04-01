import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: openai('gpt-4o'),
      system: 'You are Kai, a highly intelligent and beautiful AI chat application built with Next.js.',
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
