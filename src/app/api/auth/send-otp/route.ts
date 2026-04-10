import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body?.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const email = body.email;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("Sending OTP to:", email);

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: "Verification Code",
      html: `
        <div>
          <h2>Verify your account</h2>
          <p>Your OTP:</p>
          <h1>${otp}</h1>
          <p>Expires in 10 minutes</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      otp,
    });

  } catch (error) {
    console.error("Error sending email:", error);

    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}