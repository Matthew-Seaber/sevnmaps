import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  image: text("image"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  name: text("name"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  password: text("password"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  idToken: text("id_token"),
  scope: text("scope"),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  username: text("username").unique(),
  role: text("role").default("user").notNull(),
  countriesVisited: integer("countries_visited").default(0).notNull(),
  location: text("location"),
});

export const subscriptions = pgTable("subscriptions", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  planType: text("plan_type").notNull().default("free"),
  paidPlanStatus: text("status").notNull().default("inactive"),
  usedFreeTrial: boolean("used_free_trial").notNull().default(false),
  period: text("period"),
  start: timestamp("start").notNull().defaultNow(),
  end: timestamp("end"),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message"),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  link: text("link"),
  read: boolean("read").notNull().default(false),
});

export const places = pgTable("places", {
  id: text("id").primaryKey(),
  placeName: text("place_name").notNull(),
  description: text("description"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  country: text("country").notNull(),
  state: text("state"),
  zipCode: text("zip_code"),
  city: text("city"),
  mainAddress: text("main_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const place_images = pgTable("place_images", {
  id: text("id").primaryKey(),
  placeId: text("place_id")
    .notNull()
    .references(() => places.id),
  imageURL: text("image_url").notNull(),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => user.id),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  underReview: boolean("under_review").notNull().default(true),
  primaryImage: boolean("primary_image").notNull().default(false),
});
