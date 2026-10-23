const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/** Tests truncate tables, so refuse to run against anything but a local database. */
export function assertLocalTestDatabase(url = process.env.DATABASE_URL) {
  if (!url) throw new Error("DATABASE_URL is not set for tests.");
  const { hostname } = new URL(url);
  if (!LOCAL_HOSTS.has(hostname)) {
    throw new Error(`Refusing to run tests against non-local database host "${hostname}".`);
  }
}
