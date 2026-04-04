import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendOTP } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // For security reasons, we don't reveal if a user exists or not
    if (!user || !user.password || !user.email) {
      return NextResponse.json({ message: "If an account exists, a reset code has been sent." });
    }

    // Rate limiting: max 3 attempts per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAttempts = await prisma.verification.count({
      where: {
        userId: user.id,
        type: "PASSWORD_RESET",
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
        userId: user.id,
        otp,
        type: "PASSWORD_RESET",
        expiresAt
      }
    });

    const emailSent = await sendOTP(user.email, otp, "Password Reset Code");

    if (!emailSent) {
      await prisma.verification.delete({ where: { id: verification.id } });
      return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 });
    }

    return NextResponse.json({ message: "If an account exists, a reset code has been sent." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
