import express from "express";
import postsRouter from "./routes/posts";
import cors from "cors";
import { loadPosts } from "./data";

const app = express();
app.use(cors());
app.use(express.json());

// Load posts on server start
loadPosts();

app.use("/api/posts", postsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
