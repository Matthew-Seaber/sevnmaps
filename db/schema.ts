import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  image: text("image"),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  name: text("name"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  userID: text("user_id")
    .notNull()
    .references(() => user.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userID: text("user_id")
    .notNull()
    .references(() => user.id),
  accountID: text("account_id").notNull(),
  providerID: text("provider_id").notNull(),
  password: text("password"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessExpiresAt: integer("access_expires_at"),
  refreshExpiresAt: integer("refresh_expires_at"),
  scope: text("scope"),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const profiles = pgTable("profiles", {
  userID: text("user_id")
    .primaryKey()
    .references(() => user.id),
  username: text("username").unique(),
  role: text("role").default("user").notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  userID: text("user_id")
    .primaryKey()
    .references(() => user.id),
  planType: text("plan_type").notNull().default("free"),
  paidPlanStatus: text("status").notNull().default("inactive"),
  usedFreeTrial: boolean("used_free_trial").notNull().default(false),
  period: text("period"),
  start: timestamp("start").notNull().defaultNow(),
  end: timestamp("end"),
});
