import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, id } = await req.json();

    const chatId = id;
    
    if (chatId) {
      let chat = await prisma.chat.findUnique({ where: { id: chatId } });
      
      if (!chat) {
        chat = await prisma.chat.create({
          data: {
            id: chatId,
            title: messages.length > 0 ? messages[0].content.substring(0, 40) + '...' : "New Conversation",
          }
        });
      }

      const userMessage = messages[messages.length - 1];
      
      await prisma.message.create({
        data: {
          chatId: chatId,
          role: userMessage.role,
          content: userMessage.content,
        }
      });
    }

    const result = streamText({
      model: google('gemini-flash-latest'),
      messages,
      async onFinish({ text }) {
        if (chatId) {
          try {
            await prisma.message.create({
              data: {
                chatId: chatId,
                role: 'assistant',
                content: text,
              }
            });
          } catch (dbError) {
            console.error("Failed to save assistant message:", dbError);
          }
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}