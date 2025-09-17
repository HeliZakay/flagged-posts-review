import { NextRequest, NextResponse } from "next/server";
import { removeTag } from "@/lib/data";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; tag: string }> }
) {
  const { id, tag } = await params;

  if (!tag) {
    return NextResponse.json({ error: "Tag is required" }, { status: 400 });
  }

  const updated = removeTag(Number(id), decodeURIComponent(tag));
  if (!updated) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
