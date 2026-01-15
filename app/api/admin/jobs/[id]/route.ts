import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import { cookies } from "next/headers";

async function checkAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

  if (error || !user) {
    return { error: "Unauthorized", status: 401 };
  }

  return { user };
}

// PATCH update job
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkAuth();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await req.json();

    const updateResult = await supabaseAdmin
      .from("jobs")
      .update(body)
      .eq("id", id)
      .select();

    if (updateResult.error) {
      return NextResponse.json(
        { error: updateResult.error.message || "Failed to update job" },
        { status: 500 }
      );
    }

    if (!updateResult.data || updateResult.data.length === 0) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    if (updateResult.data.length > 1) {
      return NextResponse.json(
        { error: "Multiple jobs found with the same ID" },
        { status: 500 }
      );
    }

    return NextResponse.json(updateResult.data[0], { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE job
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkAuth();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("jobs")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

