// src/lib/data.ts
import posts from "../mock-posts.json";

// matches the shape in mock-posts.json (snake_case)
type RawPost = {
  id: number;
  text: string;
  platform: string;
  status: string;
  tags: string[];
  created_at: string;
};

// the clean shape we’ll use in our app (camelCase)
export type Post = {
  id: number;
  text: string;
  platform: string;
  status: string;
  tags: string[];
  createdAt: string;
};

// Keep the dataset in memory
const allPosts: Post[] = (posts as RawPost[]).map((p) => {
  const { created_at, ...rest } = p; // pull out created_at
  return { ...rest, createdAt: created_at }; // rebuild without it
});

/**
 * Get all posts (later we’ll add filtering, pagination, etc.)
 */
export function getPosts(): Post[] {
  return allPosts;
}

/**
 * Update status of a post
 */
export function updatePostStatus(id: number, status: string): Post | null {
  const post = allPosts.find((p) => p.id === id);
  if (!post) return null;
  post.status = status;
  return post;
}

/**
 * Add a tag to a post
 */
export function addTag(id: number, tag: string): Post | null {
  const post = allPosts.find((p) => p.id === id);
  if (!post) return null;
  if (!post.tags.includes(tag)) {
    post.tags.push(tag);
  }
  return post;
}

/**
 * Remove a tag from a post
 */
export function removeTag(id: number, tag: string): Post | null {
  const post = allPosts.find((p) => p.id === id);
  if (!post) return null;
  post.tags = post.tags.filter((t) => t !== tag);
  return post;
}
