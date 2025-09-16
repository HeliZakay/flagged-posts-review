import { NextResponse } from "next/server";
import { getPosts } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");

  let posts = getPosts();

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

  return NextResponse.json(posts);
}
