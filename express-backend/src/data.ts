import fs from "fs";
import path from "path";

export type Post = {
  id: number;
  text: string;
  platform: string;
  status: string;
  tags: string[];
  createdAt: string;
};

let allPosts: Post[] = [];

export function loadPosts() {
  const filePath = path.join(__dirname, "../../src/mock-posts.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const rawPosts = JSON.parse(raw);
  allPosts = rawPosts.map((p: any) => ({
    ...p,
    createdAt: p.created_at,
  }));
}

export function getPosts(): Post[] {
  return allPosts;
}

export function updatePostStatus(id: number, status: string): Post | null {
  const post = allPosts.find((p) => p.id === id);
  if (!post) return null;
  post.status = status;
  return post;
}

export function addTag(id: number, tag: string): Post | null {
  const post = allPosts.find((p) => p.id === id);
  if (!post || post.tags.includes(tag)) return null;
  post.tags.push(tag);
  return post;
}

export function removeTag(id: number, tag: string): Post | null {
  const post = allPosts.find((p) => p.id === id);
  if (!post) return null;
  post.tags = post.tags.filter((t) => t !== tag);
  return post;
}

// Load posts on server start
loadPosts();
