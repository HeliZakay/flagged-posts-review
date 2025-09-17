import { NextRequest, NextResponse } from "next/server";
import { addTag } from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // 👈 await

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const tag = (body as any)?.tag;
  if (typeof tag !== "string" || !tag.trim()) {
    return NextResponse.json(
      { error: "Field 'tag' is required" },
      { status: 400 }
    );
  }

  const updated = addTag(Number(id), tag.trim());
  if (!updated) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
