import { NextRequest, NextResponse } from "next/server";
import { addTag } from "@/lib/data";

function hasStringProp<T extends string>(
  obj: unknown,
  prop: T
): obj is { [K in T]: string } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Record<string, unknown>)[prop] === "string"
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!hasStringProp(body, "tag") || !body.tag.trim()) {
    return NextResponse.json(
      { error: "Field 'tag' is required" },
      { status: 400 }
    );
  }

  const updated = addTag(Number(id), body.tag.trim());
  if (!updated) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
