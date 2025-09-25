import { 
  type User, 
  type InsertUser, 
  type Idea,
  type InsertIdea,
  type SummitResource, 
  type InsertSummitResource,
  type FormField,
  type InsertFormField,
  type FormFieldOption,
  type InsertFormFieldOption,
  type IdeaDynamicField,
  type InsertIdeaDynamicField,
  type HeaderSettings,
  type InsertHeaderSettings,
  type KanbanCategory,
  type InsertKanbanCategory,
  type ViewSettings,
  type InsertViewSettings,
  type LandingPageSettings,
  type InsertLandingPageSettings,
  type SummitHomeContent,
  type InsertSummitHomeContent,
  users,
  ideas,
  summitResources,
  formFields,
  formFieldOptions,
  ideaDynamicFields,
  headerSettings,
  kanbanCategories,
  viewSettings,
  landingPageSettings,
  summitHomeContent
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface definition
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Ideas CRUD
  getIdeas(): Promise<Idea[]>;
  getIdea(id: string): Promise<Idea | undefined>;
  createIdea(idea: InsertIdea): Promise<Idea>;
  updateIdea(id: string, updates: Partial<InsertIdea>): Promise<Idea | undefined>;
  updateIdeaCategory(id: string, type: string): Promise<Idea | undefined>;
  deleteIdea(id: string): Promise<boolean>;
  
  // Summit Resources CRUD
  getSummitResources(): Promise<SummitResource[]>;
  getSummitResource(id: string): Promise<SummitResource | undefined>;
  createSummitResource(resource: InsertSummitResource): Promise<SummitResource>;
  updateSummitResource(id: string, updates: Partial<InsertSummitResource>): Promise<SummitResource | undefined>;
  deleteSummitResource(id: string): Promise<boolean>;

  // Form Fields CRUD
  getFormFields(): Promise<FormField[]>;
  getFormField(id: string): Promise<FormField | undefined>;
  createFormField(field: InsertFormField): Promise<FormField>;
  updateFormField(id: string, updates: Partial<InsertFormField>): Promise<FormField | undefined>;
  deleteFormField(id: string): Promise<boolean>;

  // Form Field Options CRUD
  getFormFieldOptions(fieldId?: string): Promise<FormFieldOption[]>;
  getFormFieldOption(id: string): Promise<FormFieldOption | undefined>;
  createFormFieldOption(option: InsertFormFieldOption): Promise<FormFieldOption>;
  updateFormFieldOption(id: string, updates: Partial<InsertFormFieldOption>): Promise<FormFieldOption | undefined>;
  deleteFormFieldOption(id: string): Promise<boolean>;

  // Idea Dynamic Fields CRUD
  getIdeaDynamicFields(ideaId?: string): Promise<IdeaDynamicField[]>;
  createIdeaDynamicField(field: InsertIdeaDynamicField): Promise<IdeaDynamicField>;
  updateIdeaDynamicField(id: string, updates: Partial<InsertIdeaDynamicField>): Promise<IdeaDynamicField | undefined>;
  deleteIdeaDynamicField(id: string): Promise<boolean>;

  // Header Settings CRUD
  getHeaderSettings(): Promise<HeaderSettings | undefined>;
  createHeaderSettings(settings: InsertHeaderSettings): Promise<HeaderSettings>;
  updateHeaderSettings(id: string, updates: Partial<InsertHeaderSettings>): Promise<HeaderSettings | undefined>;

  // Kanban Categories CRUD
  getKanbanCategories(): Promise<KanbanCategory[]>;
  getKanbanCategory(id: string): Promise<KanbanCategory | undefined>;
  createKanbanCategory(category: InsertKanbanCategory): Promise<KanbanCategory>;
  updateKanbanCategory(id: string, updates: Partial<InsertKanbanCategory>): Promise<KanbanCategory | undefined>;
  deleteKanbanCategory(id: string): Promise<boolean>;

  // View Settings CRUD
  getViewSettings(): Promise<ViewSettings | undefined>;
  createViewSettings(settings: InsertViewSettings): Promise<ViewSettings>;
  updateViewSettings(id: string, updates: Partial<InsertViewSettings>): Promise<ViewSettings | undefined>;

  // Landing Page Settings CRUD
  getLandingPageSettings(): Promise<LandingPageSettings | undefined>;
  createLandingPageSettings(settings: InsertLandingPageSettings): Promise<LandingPageSettings>;
  updateLandingPageSettings(id: string, updates: Partial<InsertLandingPageSettings>): Promise<LandingPageSettings | undefined>;

  // Summit Home Content CRUD
  getSummitHomeContent(): Promise<SummitHomeContent | undefined>;
  createSummitHomeContent(content: InsertSummitHomeContent): Promise<SummitHomeContent>;
  updateSummitHomeContent(id: string, updates: Partial<InsertSummitHomeContent>): Promise<SummitHomeContent | undefined>;

  // Additional methods needed by routes
  getIdeasWithFields(): Promise<(Idea & { dynamicFields?: IdeaDynamicField[] })[]>;
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Ideas CRUD
  async getIdeas(): Promise<Idea[]> {
    return await db.select().from(ideas);
  }

  async getIdea(id: string): Promise<Idea | undefined> {
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
    return idea || undefined;
  }

  async createIdea(insertIdea: InsertIdea): Promise<Idea> {
    const [idea] = await db
      .insert(ideas)
      .values(insertIdea)
      .returning();
    return idea;
  }

  async updateIdea(id: string, updates: Partial<InsertIdea>): Promise<Idea | undefined> {
    const [updated] = await db
      .update(ideas)
      .set(updates)
      .where(eq(ideas.id, id))
      .returning();
    return updated || undefined;
  }

  async updateIdeaCategory(id: string, type: string): Promise<Idea | undefined> {
    // Validate that the target category exists and is active
    const categories = await this.getKanbanCategories();
    const activeCategories = categories.filter(cat => cat.isActive === 'true');
    const validCategoryKeys = activeCategories.map(cat => cat.key);
    
    if (!validCategoryKeys.includes(type)) {
      throw new Error(`Invalid category type '${type}'. Must be one of: ${validCategoryKeys.join(', ')}`);
    }
    
    return this.updateIdea(id, { type });
  }

  async deleteIdea(id: string): Promise<boolean> {
    const result = await db.delete(ideas).where(eq(ideas.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Summit Resources CRUD
  async getSummitResources(): Promise<SummitResource[]> {
    return await db.select().from(summitResources);
  }

  async getSummitResource(id: string): Promise<SummitResource | undefined> {
    const [resource] = await db.select().from(summitResources).where(eq(summitResources.id, id));
    return resource || undefined;
  }

  async createSummitResource(insertResource: InsertSummitResource): Promise<SummitResource> {
    const [resource] = await db
      .insert(summitResources)
      .values(insertResource)
      .returning();
    return resource;
  }

  async updateSummitResource(id: string, updates: Partial<InsertSummitResource>): Promise<SummitResource | undefined> {
    const [updated] = await db
      .update(summitResources)
      .set(updates)
      .where(eq(summitResources.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSummitResource(id: string): Promise<boolean> {
    const result = await db.delete(summitResources).where(eq(summitResources.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Form Fields CRUD
  async getFormFields(): Promise<FormField[]> {
    return await db.select().from(formFields);
  }

  async getFormField(id: string): Promise<FormField | undefined> {
    const [field] = await db.select().from(formFields).where(eq(formFields.id, id));
    return field || undefined;
  }

  async createFormField(insertField: InsertFormField): Promise<FormField> {
    const [field] = await db
      .insert(formFields)
      .values(insertField)
      .returning();
    return field;
  }

  async updateFormField(id: string, updates: Partial<InsertFormField>): Promise<FormField | undefined> {
    const [updated] = await db
      .update(formFields)
      .set(updates)
      .where(eq(formFields.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteFormField(id: string): Promise<boolean> {
    const result = await db.delete(formFields).where(eq(formFields.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Form Field Options CRUD
  async getFormFieldOptions(fieldId?: string): Promise<FormFieldOption[]> {
    if (fieldId) {
      return await db.select().from(formFieldOptions).where(eq(formFieldOptions.fieldId, fieldId));
    }
    return await db.select().from(formFieldOptions);
  }

  async getFormFieldOption(id: string): Promise<FormFieldOption | undefined> {
    const [option] = await db.select().from(formFieldOptions).where(eq(formFieldOptions.id, id));
    return option || undefined;
  }

  async createFormFieldOption(insertOption: InsertFormFieldOption): Promise<FormFieldOption> {
    const [option] = await db
      .insert(formFieldOptions)
      .values(insertOption)
      .returning();
    return option;
  }

  async updateFormFieldOption(id: string, updates: Partial<InsertFormFieldOption>): Promise<FormFieldOption | undefined> {
    const [updated] = await db
      .update(formFieldOptions)
      .set(updates)
      .where(eq(formFieldOptions.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteFormFieldOption(id: string): Promise<boolean> {
    const result = await db.delete(formFieldOptions).where(eq(formFieldOptions.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Idea Dynamic Fields CRUD
  async getIdeaDynamicFields(ideaId?: string): Promise<IdeaDynamicField[]> {
    if (ideaId) {
      return await db.select().from(ideaDynamicFields).where(eq(ideaDynamicFields.ideaId, ideaId));
    }
    return await db.select().from(ideaDynamicFields);
  }

  async createIdeaDynamicField(insertField: InsertIdeaDynamicField): Promise<IdeaDynamicField> {
    const [field] = await db
      .insert(ideaDynamicFields)
      .values(insertField)
      .returning();
    return field;
  }

  async updateIdeaDynamicField(id: string, updates: Partial<InsertIdeaDynamicField>): Promise<IdeaDynamicField | undefined> {
    const [updated] = await db
      .update(ideaDynamicFields)
      .set(updates)
      .where(eq(ideaDynamicFields.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteIdeaDynamicField(id: string): Promise<boolean> {
    const result = await db.delete(ideaDynamicFields).where(eq(ideaDynamicFields.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Header Settings CRUD
  async getHeaderSettings(): Promise<HeaderSettings | undefined> {
    const [settings] = await db.select().from(headerSettings).limit(1);
    return settings || undefined;
  }

  async createHeaderSettings(insertSettings: InsertHeaderSettings): Promise<HeaderSettings> {
    const [settings] = await db
      .insert(headerSettings)
      .values(insertSettings)
      .returning();
    return settings;
  }

  async updateHeaderSettings(id: string, updates: Partial<InsertHeaderSettings>): Promise<HeaderSettings | undefined> {
    const [updated] = await db
      .update(headerSettings)
      .set(updates)
      .where(eq(headerSettings.id, id))
      .returning();
    return updated || undefined;
  }

  // Kanban Categories CRUD
  async getKanbanCategories(): Promise<KanbanCategory[]> {
    return await db.select().from(kanbanCategories);
  }

  async getKanbanCategory(id: string): Promise<KanbanCategory | undefined> {
    const [category] = await db.select().from(kanbanCategories).where(eq(kanbanCategories.id, id));
    return category || undefined;
  }

  async createKanbanCategory(insertCategory: InsertKanbanCategory): Promise<KanbanCategory> {
    const [category] = await db
      .insert(kanbanCategories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateKanbanCategory(id: string, updates: Partial<InsertKanbanCategory>): Promise<KanbanCategory | undefined> {
    const [updated] = await db
      .update(kanbanCategories)
      .set(updates)
      .where(eq(kanbanCategories.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteKanbanCategory(id: string): Promise<boolean> {
    const result = await db.delete(kanbanCategories).where(eq(kanbanCategories.id, id));
    return (result.rowCount || 0) > 0;
  }

  // View Settings CRUD
  async getViewSettings(): Promise<ViewSettings | undefined> {
    const [settings] = await db.select().from(viewSettings).limit(1);
    return settings || undefined;
  }

  async createViewSettings(insertSettings: InsertViewSettings): Promise<ViewSettings> {
    const [settings] = await db
      .insert(viewSettings)
      .values(insertSettings)
      .returning();
    return settings;
  }

  async updateViewSettings(id: string, updates: Partial<InsertViewSettings>): Promise<ViewSettings | undefined> {
    const [updated] = await db
      .update(viewSettings)
      .set(updates)
      .where(eq(viewSettings.id, id))
      .returning();
    return updated || undefined;
  }

  // Landing Page Settings CRUD
  async getLandingPageSettings(): Promise<LandingPageSettings | undefined> {
    const [settings] = await db.select().from(landingPageSettings).limit(1);
    return settings || undefined;
  }

  async createLandingPageSettings(insertSettings: InsertLandingPageSettings): Promise<LandingPageSettings> {
    const [settings] = await db
      .insert(landingPageSettings)
      .values(insertSettings)
      .returning();
    return settings;
  }

  async updateLandingPageSettings(id: string, updates: Partial<InsertLandingPageSettings>): Promise<LandingPageSettings | undefined> {
    const [updated] = await db
      .update(landingPageSettings)
      .set(updates)
      .where(eq(landingPageSettings.id, id))
      .returning();
    return updated || undefined;
  }

  // Summit Home Content CRUD
  async getSummitHomeContent(): Promise<SummitHomeContent | undefined> {
    const [content] = await db.select().from(summitHomeContent).limit(1);
    return content || undefined;
  }

  async createSummitHomeContent(insertContent: InsertSummitHomeContent): Promise<SummitHomeContent> {
    const [content] = await db
      .insert(summitHomeContent)
      .values(insertContent)
      .returning();
    return content;
  }

  async updateSummitHomeContent(id: string, updates: Partial<InsertSummitHomeContent>): Promise<SummitHomeContent | undefined> {
    const [updated] = await db
      .update(summitHomeContent)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(summitHomeContent.id, id))
      .returning();
    return updated || undefined;
  }

  // Additional method needed by routes
  async getIdeasWithFields(): Promise<(Idea & { dynamicFields?: IdeaDynamicField[] })[]> {
    const allIdeas = await this.getIdeas();
    const allDynamicFields = await this.getIdeaDynamicFields();
    
    return allIdeas.map(idea => ({
      ...idea,
      dynamicFields: allDynamicFields.filter(field => field.ideaId === idea.id)
    }));
  }
}

export const storage = new DatabaseStorage();