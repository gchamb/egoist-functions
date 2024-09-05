import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";

const poolConnection = createPool(process.env.MySqlConnectionString);

export const db = drizzle(poolConnection);
