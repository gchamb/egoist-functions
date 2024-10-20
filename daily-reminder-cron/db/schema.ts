import { mysqlTable, mysqlSchema, AnyMySqlColumn, foreignKey, primaryKey, unique, varchar, float, date, index, timestamp, bigint, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const progressEntry = mysqlTable("progress_entry", {
	id: varchar("id", { length: 36 }).notNull(),
	blobKey: varchar("blob_key", { length: 255 }).notNull(),
	currentWeight: float("current_weight").notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	createdAt: date("created_at", { mode: 'string' }).default(sql`(curdate())`),
},
(table) => {
	return {
		progressEntryId: primaryKey({ columns: [table.id], name: "progress_entry_id"}),
		blobKey: unique("blob_key").on(table.blobKey),
		userId: unique("user_id").on(table.userId, table.createdAt),
	}
});

export const progressReport = mysqlTable("progress_report", {
	id: varchar("id", { length: 36 }).notNull(),
	currentWeight: float("current_weight").notNull(),
	lastWeekWeight: float("last_week_weight").notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		userId: index("user_id").on(table.userId),
		progressReportId: primaryKey({ columns: [table.id], name: "progress_report_id"}),
	}
});

export const progressVideo = mysqlTable("progress_video", {
	id: varchar("id", { length: 36 }).notNull(),
	blobKey: varchar("blob_key", { length: 255 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	frequency: varchar("frequency", { length: 10 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	createdAt: date("created_at", { mode: 'string' }).default(sql`(curdate())`),
},
(table) => {
	return {
		userId: index("user_id").on(table.userId),
		progressVideoId: primaryKey({ columns: [table.id], name: "progress_video_id"}),
	}
});

export const revenueCatSubscriber = mysqlTable("revenue_cat_subscriber", {
	id: varchar("id", { length: 255 }).notNull(),
	transactionId: varchar("transaction_id", { length: 255 }),
	productId: varchar("product_id", { length: 30 }).notNull(),
	purchasedAtMs: bigint("purchased_at_ms", { mode: "number" }).notNull(),
	expirationAtMs: bigint("expiration_at_ms", { mode: "number" }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		userId: index("user_id").on(table.userId),
		revenueCatSubscriberId: primaryKey({ columns: [table.id], name: "revenue_cat_subscriber_id"}),
		transactionId: unique("transaction_id").on(table.transactionId),
	}
});

export const schemaMigrations = mysqlTable("schema_migrations", {
	version: bigint("version", { mode: "number" }).notNull(),
	dirty: tinyint("dirty").notNull(),
},
(table) => {
	return {
		schemaMigrationsVersion: primaryKey({ columns: [table.version], name: "schema_migrations_version"}),
	}
});

export const user = mysqlTable("user", {
	id: varchar("id", { length: 36 }).notNull(),
	appleId: varchar("apple_id", { length: 100 }),
	email: varchar("email", { length: 100 }),
	password: varchar("password", { length: 255 }),
	currentWeight: float("current_weight"),
	goalWeight: float("goal_weight"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	expoToken: varchar("expo_token", { length: 255 }),
},
(table) => {
	return {
		userId: primaryKey({ columns: [table.id], name: "user_id"}),
		appleId: unique("apple_id").on(table.appleId),
		email: unique("email").on(table.email),
	}
});