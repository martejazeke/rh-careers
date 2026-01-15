import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import { cookies } from "next/headers";

// Configure SMTP explicitly to avoid ::1 (localhost) redirect errors
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

  if (!accessToken) {
    return { error: "Unauthorized: Please log in", status: 401 };
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

  if (error || !user) {
    return { error: "Unauthorized: Invalid session", status: 401 };
  }

  return { user };
}

// GET all applications
export async function GET(req: Request) {
  try {
    const auth = await checkAuth();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const jobId = searchParams.get("jobId");

    let query = supabaseAdmin
      .from("applications")
      .select(`*, jobs (id, title, department)`)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (jobId) query = query.eq("job_id", jobId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const transformedData = data?.map((app: any) => ({
      id: app.id,
      name: app.full_name,
      jobPosition: app.jobs?.title || "Unknown",
      dateApplied: app.created_at,
      status: app.status || "Pending",
      email: app.email,
      resumeUrl: app.resume_url,
      message: app.message,
      note: app.admin_note || app.note || "",
    }));

    return NextResponse.json(transformedData || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH update application status & send email
export async function PATCH(req: Request) {
  try {
    const auth = await checkAuth();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();
    const { id, status, note } = body;

    if (!id) return NextResponse.json({ error: "Application ID required" }, { status: 400 });

    // 1. Get current application and job details
    const { data: application, error: fetchError } = await supabaseAdmin
      .from("applications")
      .select(`*, jobs ( title )`)
      .eq("id", id)
      .single();

    if (fetchError || !application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // 2. Update Database
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (note !== undefined) updateData.admin_note = note;

    const { error: updateError } = await supabaseAdmin
      .from("applications")
      .update(updateData)
      .eq("id", id);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    // 3. Handle Email Notification if status changed
    if (["Accepted", "Shortlisted", "Rejected"].includes(status)) {
      const jobTitle = application.jobs?.title || "the position";
      let subject = "";
      let htmlContent = "";

      // Logic for email templates
      if (status === "Accepted") {
        subject = `Congratulations! Application Accepted for ${jobTitle}`;
        htmlContent = `<div style="font-family: sans-serif;"><h2>Great news, ${application.full_name}!</h2><p>Your application for <b>${jobTitle}</b> has been accepted. We will contact you soon for next steps.</p></div>`;
      } else if (status === "Shortlisted") {
        subject = `Update: You've been shortlisted for ${jobTitle}`;
        htmlContent = `<div style="font-family: sans-serif;"><h2>Hi ${application.full_name},</h2><p>You have been shortlisted for <b>${jobTitle}</b>. Our team is reviewing final details.</p></div>`;
      } else if (status === "Rejected") {
        subject = `Update on your application for ${jobTitle}`;
        htmlContent = `<div style="font-family: sans-serif;"><h2>Dear ${application.full_name},</h2><p>We appreciate your interest in <b>${jobTitle}</b>, but we have decided to move forward with other candidates at this time.</p></div>`;
      }

      try {
        await transporter.sendMail({
          from: `"Rebus HR" <${process.env.EMAIL_USER}>`,
          to: application.email,
          subject,
          html: htmlContent,
        });
        console.log("✅ Update email sent to:", application.email);
      } catch (err) {
        console.error("❌ Email failed but DB updated:", err);
      }
    }

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE application
export async function DELETE(req: Request) {
  try {
    const auth = await checkAuth();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabaseAdmin.from("applications").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}