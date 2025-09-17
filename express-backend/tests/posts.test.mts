const request = require("supertest");
const app = require("../src/server");

describe("Posts API", () => {
  it("GET /api/posts should return posts", async () => {
    const res = await request(app).get("/api/posts");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("PATCH /api/posts/:id/status should update status", async () => {
    const res = await request(app)
      .patch("/api/posts/1/status")
      .send({ status: "DISMISSED" });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("DISMISSED");
  });

  it("POST /api/posts/:id/tags should add a tag", async () => {
    const res = await request(app)
      .post("/api/posts/1/tags")
      .send({ tag: "reviewed" });
    expect(res.statusCode).toBe(200);
    expect(res.body.tags).toContain("reviewed");
  });

  it("DELETE /api/posts/:id/tags/:tag should remove a tag", async () => {
    await request(app).post("/api/posts/1/tags").send({ tag: "temp" });
    const res = await request(app).delete("/api/posts/1/tags/temp");
    expect(res.statusCode).toBe(200);
    expect(res.body.tags).not.toContain("temp");
  });
});
