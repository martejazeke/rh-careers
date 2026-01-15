import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import { cookies } from "next/headers";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function checkAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  if (!accessToken) return { error: "Unauthorized", status: 401 };

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !user) return { error: "Invalid session", status: 401 };

  return { user };
}

export async function POST(req: Request) {
  try {
    const auth = await checkAuth();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();
    const { applicationId, status, candidateName, candidateEmail, jobTitle } = body;

    // Validation
    if (!applicationId || !status || !candidateEmail || !candidateName || !jobTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let subject = "";
    let htmlContent = "";

    // Define Templates based on Status
    switch (status) {
      case "Accepted":
        subject = `Congratulations! Your application for ${jobTitle} has been accepted`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0;">
            <h2 style="color: #059669;">Congratulations, ${candidateName}!</h2>
            <p>We are pleased to inform you that your application for <strong>${jobTitle}</strong> has been accepted!</p>
            <p>Our team will contact you shortly for next steps.</p>
            <p style="margin-top: 30px; color: #666;">Best regards,<br>HR Team | Rebus Holdings</p>
          </div>`;
        break;

      case "Shortlisted":
        subject = `Update on your application for ${jobTitle}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0;">
            <h2 style="color: #10b981;">Application Update</h2>
            <p>Dear ${candidateName},</p>
            <p>Your application for <strong>${jobTitle}</strong> has been shortlisted! We will contact you soon regarding the next steps.</p>
            <p style="margin-top: 30px; color: #666;">Best regards,<br>HR Team | Rebus Holdings</p>
          </div>`;
        break;

      case "Rejected":
        subject = `Update on your application for ${jobTitle}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0;">
            <h2 style="color: #dc2626;">Application Update</h2>
            <p>Dear ${candidateName},</p>
            <p>After careful consideration, we have decided to move forward with other candidates for the <strong>${jobTitle}</strong> position.</p>
            <p>We encourage you to apply for future roles at Rebus Holdings.</p>
            <p style="margin-top: 30px; color: #666;">Best regards,<br>HR Team | Rebus Holdings</p>
          </div>`;
        break;

      default:
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Send the Email
    try {
      await transporter.sendMail({
        from: `"Rebus Holdings" <${process.env.EMAIL_USER}>`,
        to: candidateEmail,
        subject: subject,
        html: htmlContent,
      });

      console.log(`✅ Email sent to candidate: ${candidateEmail}`);
      return NextResponse.json({ success: true });
    } catch (emailError: any) {
      console.error("❌ Nodemailer failed:", emailError.message);
      return NextResponse.json({ error: "Email service failed" }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}