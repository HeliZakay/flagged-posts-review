import { NextResponse } from "next/server";
import { getPosts } from "@/lib/data";

function clampLimit(v: number): number {
  if (Number.isNaN(v)) return 20;
  return Math.min(100, Math.max(1, v));
}
function parseOffset(v: number): number {
  if (Number.isNaN(v) || v < 0) return 0;
  return v;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");

  const limit = clampLimit(Number(searchParams.get("limit") ?? 20));
  const offset = parseOffset(Number(searchParams.get("offset") ?? 0));

  let posts = getPosts();

  // filters
  if (status) {
    const s = status.toUpperCase();
    posts = posts.filter((p) => p.status.toUpperCase() === s);
  }
  if (platform) {
    const pf = platform.toLowerCase();
    posts = posts.filter((p) => p.platform.toLowerCase() === pf);
  }
  if (tag) {
    const tg = tag.toLowerCase();
    posts = posts.filter((p) =>
      p.tags.map((t) => t.toLowerCase()).includes(tg)
    );
  }
  if (search) {
    const q = search.toLowerCase();
    posts = posts.filter((p) => p.text.toLowerCase().includes(q));
  }

  // stable sort: newest first, tie-break by id desc
  posts = posts
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
        b.id - a.id
    );

  const total = posts.length;
  const data = posts.slice(offset, offset + limit);
  const hasMore = offset + limit < total;
  const nextOffset = hasMore ? offset + limit : null;

  return NextResponse.json({ total, limit, offset, hasMore, nextOffset, data });
}
