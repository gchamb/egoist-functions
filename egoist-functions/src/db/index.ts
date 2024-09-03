import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";

const poolConnection = createPool(process.env.MYSQL_CONNECTION_STRING);

export const db = drizzle(poolConnection);
