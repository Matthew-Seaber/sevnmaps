import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  user_id: serial("id").primaryKey(),
  name: text("name"),
});
