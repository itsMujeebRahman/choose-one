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
  isAnonymous: boolean("is_anonymous").default(false),
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

export const choiceList = pgTable(
  "choice_list",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 100 }).notNull(),
    pickCount: integer("pick_count").notNull().default(0),
    optionCount: integer("option_count").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("choice_list_owner_idx").on(t.userId, t.createdAt),
    check(
      "choice_list_counts_valid",
      sql`${t.optionCount} between 3 and 20 AND ${t.pickCount} between 0 and ${t.optionCount}`,
    ),
    check("choice_list_title_valid", sql`length(trim(${t.title})) > 0`),
  ],
);
export const choiceListOption = pgTable(
  "choice_list_option",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listId: uuid("list_id")
      .notNull()
      .references(() => choiceList.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 120 }).notNull(),
    sortOrder: integer("sort_order").notNull(),
    selectedOrder: integer("selected_order"),
    selectedAt: timestamp("selected_at", { withTimezone: true }),
    pickRequestId: uuid("pick_request_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("choice_list_option_sort_unique").on(t.listId, t.sortOrder),
    unique("choice_list_option_pick_unique").on(t.listId, t.selectedOrder),
    unique("choice_list_option_request_unique").on(t.listId, t.pickRequestId),
    check(
      "choice_list_option_order_valid",
      sql`${t.sortOrder} between 1 and 20`,
    ),
    check("choice_list_option_label_valid", sql`length(trim(${t.label})) > 0`),
    check(
      "choice_list_option_selection_valid",
      sql`(${t.selectedOrder} IS NULL AND ${t.selectedAt} IS NULL AND ${t.pickRequestId} IS NULL) OR (${t.selectedOrder} IS NOT NULL AND ${t.selectedOrder} between 1 and 20 AND ${t.selectedAt} IS NOT NULL AND ${t.pickRequestId} IS NOT NULL)`,
    ),
  ],
);
