import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 400 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: "Account is already verified" },
        { status: 400 }
      );
    }

    const verificationRecord = await prisma.verification.findFirst({
      where: {
        userId: user.id,
        type: "EMAIL_VERIFICATION",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: "No verification code requested." },
        { status: 400 }
      );
    }

    if (verificationRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Verification code expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (verificationRecord.otp !== otp) {
      return NextResponse.json(
        { error: "Incorrect verification code." },
        { status: 400 }
      );
    }

    // Success! Verify the user
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    // Cleanup verifications
    await prisma.verification.deleteMany({
      where: { userId: user.id, type: "EMAIL_VERIFICATION" },
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });

  } catch (error) {
    console.error("Verification failed:", error);
    return NextResponse.json(
      { error: "Failed to verify account" },
      { status: 500 }
    );
  }
}