import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Attempt to identify the User (Optional)
    const session = await getServerSession(authOptions);
    let dbUser = null;
    
    if (session?.user?.email) {
      dbUser = await prisma.user.upsert({
        where: { email: session.user.email },
        update: { name: session.user.name },
        create: { email: session.user.email, name: session.user.name },
      });
    }

    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      async onFinish({ text }) {
        try {
          // Extract the latest message from the user
          const userMessage = messages[messages.length - 1].content;

          // Scaffold a new Chat Session in SQLite
          const newChat = await prisma.chat.create({
            data: {
              title: userMessage.substring(0, 40) + "...",
              userId: dbUser?.id, // Falls back to null if anonymous
            }
          });

          // Save the User's input
          await prisma.message.create({
            data: {
              chatId: newChat.id,
              content: userMessage,
              role: "user",
            }
          });

          // Save Kai's streaming response after it fully completes
          await prisma.message.create({
            data: {
              chatId: newChat.id,
              content: text,
              role: "assistant",
            }
          });
          
          console.log(`✅ Chat saved to SQLite! ID: ${newChat.id}`);
        } catch (dbError) {
          console.error("Failed to save to database:", dbError);
        }
      }
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error with OpenAI API:", error as any);
    return new Response("Internal Server Error", { status: 500 });
  }
}
