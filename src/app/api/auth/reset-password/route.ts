import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Email, OTP, and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Find the latest valid OTP for this user
    const verification = await prisma.verification.findFirst({
      where: {
        userId: user.id,
        type: "PASSWORD_RESET",
        otp,
        expiresAt: { gt: new Date() } // Must not be expired
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!verification) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password, delete the OTP, AND verify the user if they were unverified (since they proved email ownership)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword,
          isVerified: true 
        }
      }),
      prisma.verification.deleteMany({
        where: { userId: user.id, type: "PASSWORD_RESET" }
      })
    ]);

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
