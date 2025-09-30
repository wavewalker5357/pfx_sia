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

// Enhanced idea type with dynamic fields for browse view
export type IdeaWithFields = Idea & {
  dynamicFields: IdeaDynamicField[];
};

// Header customization schema for admin-configurable header settings
export const headerSettings = pgTable("header_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Text content
  attendeeTitle: text("attendee_title").notNull().default("AI Summit Ideas"),
  attendeeSubtitle: text("attendee_subtitle").notNull().default("Product & Engineering Summit 2025"),
  adminTitle: text("admin_title").notNull().default("AI Summit Admin"),
  adminSubtitle: text("admin_subtitle").notNull().default("Platform Management Dashboard"),
  summitResourcesLabel: text("summit_resources_label").notNull().default("Summit Resources"),
  exitButtonLabel: text("exit_button_label").notNull().default("Exit"),
  logoutButtonLabel: text("logout_button_label").notNull().default("Logout"),
  
  // Visual styling
  backgroundColor: text("background_color").default("#ffffff"),
  textColor: text("text_color").default("#000000"),
  titleColor: text("title_color").default("#000000"),
  subtitleColor: text("subtitle_color").default("#666666"),
  borderColor: text("border_color").default("#e5e7eb"),
  
  // Background image
  backgroundImage: text("background_image"),
  backgroundImageOpacity: varchar("background_image_opacity").notNull().default("0.1"),
  backgroundImagePosition: text("background_image_position").notNull().default("center"),
  backgroundImageSize: text("background_image_size").notNull().default("cover"),
  
  // Layout settings
  headerHeight: text("header_height").notNull().default("auto"),
  paddingX: text("padding_x").notNull().default("1rem"),
  paddingY: text("padding_y").notNull().default("1rem"),
  
  // Responsive settings
  mobileBreakpoint: text("mobile_breakpoint").notNull().default("768px"),
  mobileTitleSize: text("mobile_title_size").notNull().default("1.5rem"),
  desktopTitleSize: text("desktop_title_size").notNull().default("2rem"),
  
  // State
  isActive: varchar("is_active").notNull().default("true"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertHeaderSettingsSchema = createInsertSchema(headerSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertHeaderSettings = z.infer<typeof insertHeaderSettingsSchema>;
export type HeaderSettings = typeof headerSettings.$inferSelect;

// Kanban categories schema for board view organization
export const kanbanCategories = pgTable("kanban_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(), // Unique identifier for category (e.g., "ai_story", "ai_idea")
  title: text("title").notNull(), // Display title (e.g., "AI Story", "AI Idea")
  color: text("color").notNull().default("#3b82f6"), // Hex color for category
  order: varchar("order").notNull().default("0"), // Display order in kanban board
  isActive: varchar("is_active").notNull().default("true"), // Whether category is enabled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertKanbanCategorySchema = createInsertSchema(kanbanCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertKanbanCategory = z.infer<typeof insertKanbanCategorySchema>;
export type KanbanCategory = typeof kanbanCategories.$inferSelect;

// View settings schema for default view preferences
export const viewSettings = pgTable("view_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  defaultView: text("default_view").notNull().default("list"), // "list" or "board"
  showBoardByDefault: varchar("show_board_by_default").notNull().default("false"), // For end users
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertViewSettingsSchema = createInsertSchema(viewSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertViewSettings = z.infer<typeof insertViewSettingsSchema>;
export type ViewSettings = typeof viewSettings.$inferSelect;

// Landing page mode settings schema for controlling page state
export const landingPageSettings = pgTable("landing_page_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mode: text("mode").notNull().default("summit"), // "maintenance", "countdown", "summit"
  
  // Maintenance mode settings
  maintenanceMessage: text("maintenance_message").notNull().default("The AI Summit platform is currently under construction. Please check back soon!"),
  
  // Countdown mode settings  
  countdownMessage: text("countdown_message").default("Time to start of the Pricefx Product & Engineering Summit"),
  summitStartDate: timestamp("summit_start_date").default(sql`NOW() + INTERVAL '30 days'`),
  
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLandingPageSettingsSchema = createInsertSchema(landingPageSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertLandingPageSettings = z.infer<typeof insertLandingPageSettingsSchema>;
export type LandingPageSettings = typeof landingPageSettings.$inferSelect;

// Summit home page content schema for admin-manageable rich content
export const summitHomeContent = pgTable("summit_home_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull().default("Welcome to AI Summit"),
  slug: text("slug").notNull().unique().default("home"),
  content: text("content").notNull().default(""),
  isPublished: varchar("is_published").notNull().default("true"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSummitHomeContentSchema = createInsertSchema(summitHomeContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSummitHomeContent = z.infer<typeof insertSummitHomeContentSchema>;
export type SummitHomeContent = typeof summitHomeContent.$inferSelect;

// Statistics state schema for tracking when statistics were last reset
export const statisticsState = pgTable("statistics_state", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lastResetAt: timestamp("last_reset_at").defaultNow().notNull(),
});

export const insertStatisticsStateSchema = createInsertSchema(statisticsState).omit({
  id: true,
});

export type InsertStatisticsState = z.infer<typeof insertStatisticsStateSchema>;
export type StatisticsState = typeof statisticsState.$inferSelect;
