import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uuid,
  varchar,
  integer,
  jsonb,
  unique,
  uniqueIndex,
  check,
  foreignKey,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameConfirmed: boolean("name_confirmed").notNull().default(false),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);
export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);
export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const problem = pgTable(
  "problem",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 100 }).notNull(),
    description: text("description"),
    status: text("status").notNull().default("draft"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    chosenAt: timestamp("chosen_at", { withTimezone: true }),
  },
  (table) => [
    unique("problem_id_user_id_unique").on(table.id, table.userId),
    index("problem_user_created_idx").on(table.userId, table.createdAt),
    check("problem_title_not_blank", sql`length(trim(${table.title})) > 0`),
    check(
      "problem_status_valid",
      sql`${table.status} in ('draft', 'chosen', 'archived')`,
    ),
    check(
      "problem_metadata_object",
      sql`jsonb_typeof(${table.metadata}) = 'object'`,
    ),
  ],
);

export const problemOption = pgTable(
  "problem_option",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    problemId: uuid("problem_id").notNull(),
    userId: text("user_id").notNull(),
    label: varchar("label", { length: 120 }).notNull(),
    sortOrder: integer("sort_order").notNull(),
    isSelected: boolean("is_selected").notNull().default(false),
    selectedOrder: integer("selected_order"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      name: "problem_option_owner_fk",
      columns: [table.problemId, table.userId],
      foreignColumns: [problem.id, problem.userId],
    }).onDelete("cascade"),
    unique("problem_option_order_unique").on(table.problemId, table.sortOrder),
    uniqueIndex("problem_option_selected_order_unique")
      .on(table.problemId, table.selectedOrder)
      .where(sql`${table.selectedOrder} IS NOT NULL`),
    index("problem_option_user_idx").on(table.userId),
    check(
      "problem_option_selection_valid",
      sql`(${table.isSelected} = true AND ${table.selectedOrder} IS NOT NULL AND ${table.selectedOrder} between 1 and 10) OR (${table.isSelected} = false AND ${table.selectedOrder} IS NULL)`,
    ),
    check(
      "problem_option_order_valid",
      sql`${table.sortOrder} between 1 and 10`,
    ),
    check(
      "problem_option_label_not_blank",
      sql`length(trim(${table.label})) > 0`,
    ),
    check(
      "problem_option_metadata_object",
      sql`jsonb_typeof(${table.metadata}) = 'object'`,
    ),
  ],
);
