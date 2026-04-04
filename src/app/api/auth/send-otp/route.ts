import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendOTP } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // This route is for logged-in but unverified users
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.isVerified) {
      return NextResponse.json({ error: "User not found or already verified" }, { status: 400 });
    }

    if (!user.email) {
      return NextResponse.json({ error: "No email associated with account" }, { status: 400 });
    }

    // Rate limiting: max 3 attempts per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAttempts = await prisma.verification.count({
      where: {
        userId,
        type: "EMAIL_VERIFICATION",
        createdAt: { gte: oneHourAgo }
      }
    });

    if (recentAttempts >= 3) {
      return NextResponse.json({ error: "Too many requests. Please try again in an hour." }, { status: 429 });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const verification = await prisma.verification.create({
      data: {
        userId,
        otp,
        type: "EMAIL_VERIFICATION",
        expiresAt
      }
    });

    const emailSent = await sendOTP(user.email, otp, "Verify your Kai AI Account");

    if (!emailSent) {
      // Cleanup if email fails
      await prisma.verification.delete({ where: { id: verification.id } });
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
    }

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
