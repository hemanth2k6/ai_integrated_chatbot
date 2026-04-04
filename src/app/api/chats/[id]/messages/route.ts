import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const maxDuration = 30;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const userId = (session.user as any).id;
    const chatId = resolvedParams.id;

    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (chat.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(chat);
  } catch (error: any) {
    console.error("Fetch Messages API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const userId = (session.user as any).id;
    const chatId = resolvedParams.id;
    const body = await req.json();
    const { messages, audioUrl } = body;
    // We expect messages to look like: [{role: "user", content: "...", fileUrl: "..."}]
    const userMessage = messages[messages.length - 1];
    const fileUrl = userMessage.fileUrl || null;

    let chat = await prisma.chat.findUnique({ where: { id: chatId } });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          id: chatId,
          title: messages.length > 0 ? (
            audioUrl ? "🎤 Voice message" : (fileUrl ? "📎 File attachment" : messages[0].content.substring(0, 30) + (messages[0].content.length > 30 ? '...' : ''))
          ) : "New Conversation",
          userId: userId,
        }
      });
    } else {
      if (chat.userId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if ((chat.title === "New Conversation" || chat.title === "New Chat") && messages.length === 1) {
          const newTitle = audioUrl ? "🎤 Voice message" : (fileUrl ? "📎 File attachment" : messages[0].content.substring(0, 30) + (messages[0].content.length > 30 ? '...' : ''));
          await prisma.chat.update({
              where: { id: chatId },
              data: { title: newTitle }
          });
      }
    }

    await prisma.message.create({
      data: {
        chatId: chatId,
        role: userMessage.role,
        content: userMessage.content,
        audioUrl: audioUrl || null,
        fileUrl: fileUrl || null
      }
    });

    const aiMessages = messages.map((m: any) => {
      if (m.fileUrl && m.role === 'user') {
        return {
          role: m.role,
          content: [
            { type: 'text', text: m.content || "Attached file" },
            { type: 'image', image: m.fileUrl }
          ]
        };
      }
      return { role: m.role, content: m.content };
    });

    const result = streamText({
      model: google('gemini-flash-latest'),
      messages: aiMessages,
      async onFinish({ text }) {
        try {
          await prisma.message.create({
            data: {
              chatId: chatId,
              role: 'assistant',
              content: text,
            }
          });
          await prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() }
          });
        } catch (dbError) {
          console.error("Failed to save assistant message:", dbError);
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
