import nodemailer from "nodemailer";

// Fallback to ethereal if you don't have SMTP configured in your .env.local
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // generated ethereal user or your email
    pass: process.env.SMTP_PASS, // generated ethereal password or your app password
  },
});

export const sendOTP = async (to: string, otp: string, subject: string = "Security Code") => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Kai Bot" <no-reply@kai.bot>',
    to,
    subject,
    text: `Your security code is: ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Security Verification</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">Please use the following code to complete your verification process. This code will expire in 10 minutes.</p>
          
          <div style="background-color: #f3f4f6; border-radius: 6px; padding: 15px; margin: 25px 0; text-align: center;">
            <h2 style="font-size: 32px; letter-spacing: 5px; color: #1e40af; margin: 0;">${otp}</h2>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    
    // In dev environment with ethereal email, this will print a preview URL to your console
    if (process.env.SMTP_HOST === "smtp.ethereal.email" || !process.env.SMTP_HOST) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
