import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const chats = await prisma.chat.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(chats);
  } catch (error: any) {
    console.error("Fetch Chats API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { id, title } = body;

    const chat = await prisma.chat.create({
      data: {
        id: id || undefined, // use provided ID or generate a CUID
        title: title || "New Conversation",
        userId: userId,
      },
    });

    return NextResponse.json(chat);
  } catch (error: any) {
    console.error("Create Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to create chat: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
