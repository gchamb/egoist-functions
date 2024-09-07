import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import "dotenv/config";

const poolConnection = createPool(
  process.env.MYSQL_CONNECTION_STRING as string
);

export const db = drizzle(poolConnection);
