import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email?.trim();
    const name = body?.name?.trim();
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && user.isVerified) {
      return NextResponse.json(
        { error: "Email is already registered and verified." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (user && !user.isVerified) {
      // Update existing unverified user
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name, password: hashedPassword },
      });
    } else {
      // Create new unverified user
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          isVerified: false,
        },
      });
    }

    // Generate a 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Verification table
    // First remove old ones to keep it clean
    await prisma.verification.deleteMany({
      where: { userId: user.id, type: "EMAIL_VERIFICATION" }
    });

    await prisma.verification.create({
      data: {
        userId: user.id,
        otp: otpCode,
        type: "EMAIL_VERIFICATION",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins expiry
      }
    });

    // Send email via SendGrid
    console.log("=========================================");
    console.log(`🔐 OTP Generated for ${email}: ${otpCode}`);
    console.log("=========================================");

    await sgMail.send({
      from: process.env.EMAIL_FROM || "kalapatihemanth2006@gmail.com", // Make sure this matches your verified SendGrid sender
      to: email,
      subject: "Your Kai Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Kai!</h2>
          <p>Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f4f4f4; padding: 12px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; border-radius: 8px;">
            ${otpCode}
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">This code will expire in 15 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      // intentionally omitted `otp` so it doesn't leak!
    });

  } catch (error) {
    console.error("OTP generation error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}