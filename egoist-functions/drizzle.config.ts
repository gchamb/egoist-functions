import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "mysql",
  out: "./src/db",
  dbCredentials: {
    url: process.env.MYSQL_CONNECTION_STRING,
  },
});
