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

// Dynamic form field schema for admin-configurable forms
export const formFields = pgTable("form_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // Internal field name (e.g., "product_type")
  label: text("label").notNull(), // Display label (e.g., "Product Type")
  type: text("type").notNull(), // text, number, email, list, textarea, etc.
  required: varchar("required").notNull().default("false"),
  placeholder: text("placeholder"),
  helpText: text("help_text"),
  order: varchar("order").notNull().default("0"),
  isActive: varchar("is_active").notNull().default("true"),
  allowUserAdditions: varchar("allow_user_additions").notNull().default("false"), // For list types
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFormFieldSchema = createInsertSchema(formFields).omit({
  id: true,
  createdAt: true,
});

export type InsertFormField = z.infer<typeof insertFormFieldSchema>;
export type FormField = typeof formFields.$inferSelect;

// Form field options schema for list-type fields
export const formFieldOptions = pgTable("form_field_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fieldId: varchar("field_id").notNull(),
  value: text("value").notNull(),
  label: text("label").notNull(),
  order: varchar("order").notNull().default("0"),
  isActive: varchar("is_active").notNull().default("true"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFormFieldOptionSchema = createInsertSchema(formFieldOptions).omit({
  id: true,
  createdAt: true,
});

export type InsertFormFieldOption = z.infer<typeof insertFormFieldOptionSchema>;
export type FormFieldOption = typeof formFieldOptions.$inferSelect;

// Updated ideas schema to store dynamic field values
export const ideaDynamicFields = pgTable("idea_dynamic_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").notNull(),
  fieldId: varchar("field_id").notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIdeaDynamicFieldSchema = createInsertSchema(ideaDynamicFields).omit({
  id: true,
  createdAt: true,
});

export type InsertIdeaDynamicField = z.infer<typeof insertIdeaDynamicFieldSchema>;
export type IdeaDynamicField = typeof ideaDynamicFields.$inferSelect;
