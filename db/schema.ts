import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  primaryKey,
  boolean,
  unique,
} from "drizzle-orm/pg-core";

import { randomUUID } from "crypto";

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

export const countries = pgTable("countries", {
  id: text("id").primaryKey(),
  countryName: text("country_name").notNull().unique(),
  countryCode: text("country_code").notNull().unique(),
  continent: text("continent").notNull(),
  flag: text("flag").notNull(),
});

export const visited_countries = pgTable(
  "visited_countries",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    countryId: text("country_id")
      .notNull()
      .references(() => countries.id, { onDelete: "cascade" }),
    visitedAt: timestamp("visited_at"),
  },
  (table) => [primaryKey({ columns: [table.userId, table.countryId] })],
);

export const places = pgTable("places", {
  id: text("id").primaryKey(),
  placeName: text("place_name").notNull(),
  description: text("description"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  countryId: text("country_id").references(() => countries.id),
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

export const tags = pgTable("tags", {
  id: text("id").primaryKey(),
  tagName: text("tag_name").notNull().unique(),
});

export const place_tag_link = pgTable("place_tag_link", {
  placeId: text("place_id")
    .notNull()
    .references(() => places.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

export const place_user_link = pgTable(
  "place_user_link",
  {
    placeId: text("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    favorite: boolean("favorite").notNull().default(false),
    favoritedAt: timestamp("favorited_at"),
    visited: boolean("visited").notNull().default(false),
    visitedAt: timestamp("visited_at"),
    privateNote: text("private_note"),
  },
  (table) => [unique().on(table.placeId, table.userId)],
);

export const lists = pgTable("lists", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  visibility: text("visibility").notNull().default("private"),
  listName: text("list_name").notNull(),
  listColor: text("list_color").notNull().default("1273F6"),
  listIcon: text("list_icon"),
});

export const list_members = pgTable("list_members", {
  listId: text("list_id")
    .notNull()
    .references(() => lists.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("viewer"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const list_place_link = pgTable("list_place_link", {
  listId: text("list_id")
    .notNull()
    .references(() => lists.id, { onDelete: "cascade" }),
  placeId: text("place_id")
    .notNull()
    .references(() => places.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  placeId: text("place_id")
    .notNull()
    .references(() => places.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  stars: integer("stars").notNull(),
  comment: text("comment"),
});

export const review_image_link = pgTable("review_image_link", {
  reviewId: text("review_id")
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
  imageId: text("image_id")
    .notNull()
    .references(() => place_images.id, { onDelete: "cascade" }),
});
