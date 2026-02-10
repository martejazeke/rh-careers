import { supabaseAdmin } from "@/app/lib/supabase-admin";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { appConfig } from "@/app/lib/config";
import { logError, errorResponse } from "@/app/lib/api-utils";
import { isValidApplication } from "@/app/lib/validation";
import { EMAIL_CONFIG, ERROR_MESSAGES } from "@/app/lib/constants";

/**
 * Creates email transporter for sending notifications
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: EMAIL_CONFIG.HOST,
    port: EMAIL_CONFIG.PORT,
    secure: EMAIL_CONFIG.SECURE,
    auth: {
      user: appConfig.email.user,
      pass: appConfig.email.pass,
    },
  });
};

/**
 * POST /api/apply
 * Submits a new job application and sends confirmation emails
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { job_id, full_name, email, resume_url, message } = body;

    if (!isValidApplication({ job_id, full_name, email, resume_url })) {
      return errorResponse(ERROR_MESSAGES.MISSING_FIELDS, 400);
    }

    const { data: application, error: dbError } = await supabaseAdmin
      .from("applications")
      .insert([{ job_id, full_name, email, resume_url, message, status: "Applied" }])
      .select();

    if (dbError) {
      logError("Failed to create application", dbError);
      return errorResponse(ERROR_MESSAGES.CREATE_FAILED, 500);
    }

    const { data: jobData } = await supabaseAdmin
      .from("jobs")
      .select("title")
      .eq("id", job_id)
      .single();

    try {
      const transporter = createTransporter();
      const jobTitle = jobData?.title || "Open Role";

      await transporter.sendMail({
        from: `"${EMAIL_CONFIG.FROM_NAME}" <${EMAIL_CONFIG.FROM_EMAIL}>`,
        to: process.env.ADMIN_EMAIL || "careers@rebus.ae",
        subject: `New Application: ${full_name} for ${jobTitle}`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px;">
            <h2 style="color: #1e293b;">New Application Received</h2>
            <hr />
            <p><strong>Candidate:</strong> ${full_name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Role:</strong> ${jobTitle} (ID: ${job_id})</p>
            <p><strong>Message:</strong> ${message || "N/A"}</p>
            <div style="margin-top: 30px;">
              <a href="${resume_url}" style="background: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                View Resume
              </a>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      logError("Failed to send application notification email", emailError);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    logError("POST /api/apply", error);
    return errorResponse(ERROR_MESSAGES.INTERNAL_ERROR, 500);
  }
}