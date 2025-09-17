import { Router, Request, Response } from "express";
import {
  getPosts,
  updatePostStatus,
  addTag,
  removeTag,
  loadPosts,
  Post,
} from "../data";
import { z } from "zod";

const StatusEnum = z.enum(["FLAGGED", "UNDER_REVIEW", "DISMISSED"]);
const TagSchema = z.string().min(1).max(32);
const IdSchema = z.number().int().positive();

const router = Router();

// GET /posts?status=&platform=&tag=&search=&limit=&offset=
router.get("/", (req: Request, res: Response) => {
  const { status, platform, tag, search } = req.query;
  const limit = Number(req.query.limit ?? 10);
  const offset = Number(req.query.offset ?? 0);
  let posts = getPosts();

  // Validate status if present
  if (status && !StatusEnum.safeParse(status).success) {
    return res.status(400).json({ error: "Invalid status value" });
  }
  // Validate tag if present
  if (tag && !TagSchema.safeParse(tag).success) {
    return res.status(400).json({ error: "Invalid tag value" });
  }
  // Validate limit/offset
  if (limit < 1 || limit > 100 || offset < 0) {
    return res.status(400).json({ error: "Invalid limit or offset" });
  }

  if (status) posts = posts.filter((p: Post) => p.status === status);
  if (platform) posts = posts.filter((p: Post) => p.platform === platform);
  if (tag) posts = posts.filter((p: Post) => p.tags.includes(String(tag)));
  if (search)
    posts = posts.filter((p: Post) =>
      p.text.toLowerCase().includes(String(search).toLowerCase())
    );

  const total = posts.length;
  const paginated = posts.slice(offset, offset + limit);
  const hasMore = offset + limit < total;
  const nextOffset = hasMore ? offset + limit : null;
  res.json({
    data: paginated,
    total,
    limit,
    offset,
    hasMore,
    nextOffset,
  });
});

// PATCH /posts/:id/status
router.patch("/:id/status", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  // Validate id and status
  if (!IdSchema.safeParse(id).success) {
    return res.status(400).json({ error: "Invalid post id" });
  }
  if (!StatusEnum.safeParse(status).success) {
    return res.status(400).json({ error: "Invalid status value" });
  }
  const post = updatePostStatus(id, status);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

// POST /posts/:id/tags
router.post("/:id/tags", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { tag } = req.body;
  // Validate id and tag
  if (!IdSchema.safeParse(id).success) {
    return res.status(400).json({ error: "Invalid post id" });
  }
  if (!TagSchema.safeParse(tag).success) {
    return res.status(400).json({ error: "Invalid tag value" });
  }
  const post = addTag(id, tag);
  if (!post)
    return res
      .status(409)
      .json({ error: "Tag already exists or post not found" });
  res.json(post);
});

// DELETE /posts/:id/tags/:tag
router.delete("/:id/tags/:tag", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const tag = req.params.tag;
  // Validate id and tag
  if (!IdSchema.safeParse(id).success) {
    return res.status(400).json({ error: "Invalid post id" });
  }
  if (!TagSchema.safeParse(tag).success) {
    return res.status(400).json({ error: "Invalid tag value" });
  }
  const post = removeTag(id, tag);
  if (!post) return res.status(404).json({ error: "Tag or post not found" });
  res.json(post);
});

export default router;
