import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const supabase = createAdminClient();
    let query = supabase
      .from("posts")
      .select(`
        *,
        author:profiles(*)
      `)
      .order("created_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, content, author_id, image_url, record_distance, record_duration, record_pace } = body;

    if (!title || !content || !author_id) {
      return NextResponse.json({ error: "필수 항목(제목, 내용, 작성자)이 누락되었습니다." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify author's approval status
    const { data: profile } = await supabase
      .from("profiles")
      .select("status, role")
      .eq("id", author_id)
      .single();

    if (!profile || profile.status !== "approved") {
      return NextResponse.json(
        { error: "관리자 승인이 완료된 크루원만 글을 작성할 수 있습니다." },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        title,
        category: category || "review",
        content,
        author_id,
        image_url: image_url || null,
        record_distance: record_distance ? parseFloat(record_distance) : null,
        record_duration: record_duration || null,
        record_pace: record_pace || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ post: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "게시글이 삭제되었습니다." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
