import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createRateLimiter } from "../src/middlewares/rate-limit.js";

describe("createRateLimiter", () => {
  it("returns a JSON 429 once the limit is exceeded", async () => {
    const app = express();
    app.use(createRateLimiter({ windowMs: 60_000, limit: 2, message: "Slow down." }));
    app.get("/", (_req, res) => {
      res.json({ success: true });
    });

    await request(app).get("/").expect(200);
    await request(app).get("/").expect(200);
    const res = await request(app).get("/");

    expect(res.status).toBe(429);
    expect(res.body).toEqual({ success: false, code: "RATE_LIMITED", message: "Slow down." });
    expect(res.headers).toHaveProperty("ratelimit");
  });
});
