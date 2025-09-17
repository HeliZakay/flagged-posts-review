import { NextRequest, NextResponse } from "next/server";
import { updatePostStatus } from "@/lib/data";

const ALLOWED = new Set(["FLAGGED", "UNDER_REVIEW", "DISMISSED"]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // 👈 await the promise

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const status = (body as any)?.status;
  if (typeof status !== "string" || !ALLOWED.has(status.toUpperCase())) {
    return NextResponse.json(
      { error: `Invalid status. Allowed: ${Array.from(ALLOWED).join(", ")}` },
      { status: 400 }
    );
  }

  const updated = updatePostStatus(Number(id), status.toUpperCase());
  if (!updated) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
