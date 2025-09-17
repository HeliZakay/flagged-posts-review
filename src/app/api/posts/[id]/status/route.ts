import { NextRequest, NextResponse } from "next/server";
import { updatePostStatus } from "@/lib/data";

type Status = "FLAGGED" | "UNDER_REVIEW" | "DISMISSED";
const ALLOWED: ReadonlySet<Status> = new Set([
  "FLAGGED",
  "UNDER_REVIEW",
  "DISMISSED",
]);

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

export async function PATCH(
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

  if (!hasStringProp(body, "status")) {
    return NextResponse.json(
      { error: "Field 'status' is required" },
      { status: 400 }
    );
  }

  const status = body.status.toUpperCase() as Status;
  if (!ALLOWED.has(status)) {
    return NextResponse.json(
      { error: `Invalid status. Allowed: ${Array.from(ALLOWED).join(", ")}` },
      { status: 400 }
    );
  }

  const updated = updatePostStatus(Number(id), status);
  if (!updated) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
