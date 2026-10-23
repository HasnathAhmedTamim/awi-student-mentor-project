import { execSync } from "node:child_process";
import { assertLocalTestDatabase } from "./helpers/assert-test-database.js";

export default function setup() {
  assertLocalTestDatabase();
  execSync("npx prisma migrate deploy", { stdio: "pipe", env: process.env });
}
