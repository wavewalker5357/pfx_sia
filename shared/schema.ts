import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Idea submission schema
export const ideas = pgTable("ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  component: text("component").notNull(),
  tag: text("tag").notNull(),
  type: text("type").notNull(), // AI Story, AI Idea, AI Solution
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIdeaSchema = createInsertSchema(ideas).omit({
  id: true,
  createdAt: true,
});

export type InsertIdea = z.infer<typeof insertIdeaSchema>;
export type Idea = typeof ideas.$inferSelect;

// User schema for admin authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Summit resources schema for admin-manageable links
export const summitResources = pgTable("summit_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  order: varchar("order").notNull().default("0"),
  isActive: varchar("is_active").notNull().default("true"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSummitResourceSchema = createInsertSchema(summitResources).omit({
  id: true,
  createdAt: true,
});

export type InsertSummitResource = z.infer<typeof insertSummitResourceSchema>;
export type SummitResource = typeof summitResources.$inferSelect;
