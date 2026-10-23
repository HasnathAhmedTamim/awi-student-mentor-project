import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("app foundation", () => {
  it("responds to the health check", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { status: "ok" } });
  });

  it("returns a JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/api/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, code: "ROUTE_NOT_FOUND" });
  });

  it("rejects malformed JSON bodies", async () => {
    const res = await request(app)
      .post("/api/health")
      .set("Content-Type", "application/json")
      .send("{ not json");

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, code: "INVALID_JSON" });
  });

  it("rejects bodies larger than the limit", async () => {
    const res = await request(app)
      .post("/api/health")
      .send({ text: "a".repeat(150 * 1024) });

    expect(res.status).toBe(413);
    expect(res.body).toMatchObject({ success: false, code: "PAYLOAD_TOO_LARGE" });
  });
});
