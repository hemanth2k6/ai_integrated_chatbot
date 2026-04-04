import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // User must be logged in to verify their session email
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { otp } = body;

    if (!otp) {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }

    // Find the latest valid OTP for this user
    const verification = await prisma.verification.findFirst({
      where: {
        userId,
        type: "EMAIL_VERIFICATION",
        otp,
        expiresAt: { gt: new Date() } // Must not be expired
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!verification) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Success! Update the user as verified and delete used OTP
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { isVerified: true }
      }),
      prisma.verification.delete({
        where: { id: verification.id }
      }) // Alternatively, you could deleteMANY for this user to scrub all old unused ones
    ]);

    return NextResponse.json({ message: "Verification successful" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
