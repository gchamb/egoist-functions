import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  dialect: "mysql",
  out: "./db",
  dbCredentials: {
    url: process.env.MYSQL_CONNECTION_STRING as string,
  },
});
