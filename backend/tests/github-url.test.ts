import { describe, expect, it } from "vitest";
import {
  normalizeGithubUrl,
  toCanonicalGithubUrl,
} from "../src/modules/submissions/github-url.js";

describe("toCanonicalGithubUrl", () => {
  it.each([
    ["https://github.com/Rahim/Portfolio", "https://github.com/Rahim/Portfolio"],
    ["  https://github.com/rahim/portfolio/  ", "https://github.com/rahim/portfolio"],
    ["https://github.com/rahim/portfolio.git", "https://github.com/rahim/portfolio"],
    ["https://www.github.com/rahim/portfolio", "https://github.com/rahim/portfolio"],
    ["https://GitHub.com/rahim/portfolio?tab=readme#top", "https://github.com/rahim/portfolio"],
    ["https://github.com/my-org/my_repo.v2", "https://github.com/my-org/my_repo.v2"],
  ])("accepts %s", (input, expected) => {
    expect(toCanonicalGithubUrl(input)).toBe(expected);
  });

  it.each([
    "http://github.com/rahim/portfolio",
    "javascript:alert(1)",
    "https://gitlab.com/rahim/portfolio",
    "https://github.com.evil.com/rahim/portfolio",
    "https://user:pass@github.com/rahim/portfolio",
    "https://github.com:8443/rahim/portfolio",
    "https://github.com/rahim",
    "https://github.com/rahim/portfolio/tree/main",
    "https://github.com/-rahim/portfolio",
    "https://github.com/rahim/.git",
    "github.com/rahim/portfolio",
    "not a url",
  ])("rejects %s", (input) => {
    expect(toCanonicalGithubUrl(input)).toBeNull();
  });
});

describe("normalizeGithubUrl", () => {
  it("lowercases owner and repository so case variants collide", () => {
    expect(normalizeGithubUrl("https://github.com/Rahim/Portfolio")).toBe(
      "https://github.com/rahim/portfolio",
    );
  });
});
