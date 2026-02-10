import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import { cookies } from "next/headers";
import { appConfig } from "@/app/lib/config";
import { getEmailTemplate } from "@/app/lib/email-templates";
import { logError, errorResponse } from "@/app/lib/api-utils";
import { ERROR_MESSAGES } from "@/app/lib/constants";   

/**
 * Creates email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: appConfig.email.user,
      pass: appConfig.email.pass,
    },
  });
};

/**
 * Validates user authentication via session token
 */
async function validateAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;

  if (!accessToken) {
    return { valid: false, error: ERROR_MESSAGES.UNAUTHORIZED, status: 401 };
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

  if (error || !user) {
    return { valid: false, error: ERROR_MESSAGES.UNAUTHORIZED, status: 401 };
  }

  return { valid: true, user };
}

/**
 * GET /api/admin/applications
 * Retrieves applications with optional filtering by status and job
 */
export async function GET(req: Request) {
  try {
    const auth = await validateAuth();
    if (!auth.valid) return errorResponse(auth.error, auth.status);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const jobId = searchParams.get("jobId");

    let query = supabaseAdmin
      .from("applications")
      .select("*, jobs (id, title, department)")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (jobId) query = query.eq("job_id", jobId);

    const { data, error } = await query;
    if (error) {
      logError("Failed to fetch applications", error);
      return errorResponse(ERROR_MESSAGES.FETCH_FAILED, 500);
    }

    const transformedData = data?.map((app: any) => ({
      id: app.id,
      name: app.full_name,
      jobPosition: app.jobs?.title || "Unknown",
      dateApplied: app.created_at,
      status: app.status || "Applied",
      email: app.email,
      resumeUrl: app.resume_url,
      message: app.message,
      note: app.admin_note || "",
    }));

    return NextResponse.json(transformedData || []);
  } catch (error) {
    logError("GET /api/admin/applications", error);
    return errorResponse(ERROR_MESSAGES.INTERNAL_ERROR, 500);
  }
}

/**
 * PATCH /api/admin/applications
 * Updates application status, notes, or candidate details and sends email notifications
 */
export async function PATCH(req: Request) {
  try {
    const auth = await validateAuth();
    if (!auth.valid) return errorResponse(auth.error, auth.status);

    const body = await req.json();
    const { id, status, note, name, email } = body;

    if (!id) return errorResponse("Application ID required", 400);

    const { data: application, error: fetchError } = await supabaseAdmin
      .from("applications")
      .select("*, jobs ( title )")
      .eq("id", id)
      .single();

    if (fetchError || !application) {
      return errorResponse("Application not found", 404);
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (note !== undefined) updateData.admin_note = note;
    if (name !== undefined) updateData.full_name = name;
    if (email !== undefined) updateData.email = email;

    const { error: updateError } = await supabaseAdmin
      .from("applications")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      logError("Failed to update application", updateError);
      return errorResponse(ERROR_MESSAGES.UPDATE_FAILED, 500);
    }

    if (status && ["Accepted", "Shortlisted", "Rejected"].includes(status)) {
      const jobTitle = application.jobs?.title || "the position";
      const candidateName = name || application.full_name || "Candidate";
      const targetEmail = email || application.email;

      try {
        const emailTemplate = getEmailTemplate(status as any, candidateName, jobTitle);
        const transporter = createTransporter();

        await transporter.sendMail({
          from: `"Rebus HR" <careers@rebus.ae>`,
          to: targetEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.htmlContent,
        });
      } catch (err) {
        logError("Email notification failed but update succeeded", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("PATCH /api/admin/applications", error);
    return errorResponse(ERROR_MESSAGES.INTERNAL_ERROR, 500);
  }
}

/**
 * DELETE /api/admin/applications
 * Deletes an application
 */
export async function DELETE(req: Request) {
  try {
    const auth = await validateAuth();
    if (!auth.valid) return errorResponse(auth.error, auth.status);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return errorResponse("ID required", 400);

    const { error } = await supabaseAdmin.from("applications").delete().eq("id", id);
    if (error) {
      logError("Failed to delete application", error);
      return errorResponse(ERROR_MESSAGES.DELETE_FAILED, 500);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("DELETE /api/admin/applications", error);
    return errorResponse(ERROR_MESSAGES.INTERNAL_ERROR, 500);
  }
}