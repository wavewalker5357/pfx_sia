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
  type StatisticsState,
  type InsertStatisticsState,
  type Vote,
  type InsertVote,
  type VotingSettings,
  type InsertVotingSettings,
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
  summitHomeContent,
  statisticsState,
  votes,
  votingSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, gte, sql, and, desc } from "drizzle-orm";

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
  deleteAllIdeas(): Promise<number>;
  
  // Summit Resources CRUD
  getSummitResources(): Promise<SummitResource[]>;
  getSummitResource(id: string): Promise<SummitResource | undefined>;
  createSummitResource(resource: InsertSummitResource): Promise<SummitResource>;
  updateSummitResource(id: string, updates: Partial<InsertSummitResource>): Promise<SummitResource | undefined>;
  deleteSummitResource(id: string): Promise<boolean>;

  // Form Fields CRUD
  getFormFields(): Promise<FormField[]>;
  getFormField(id: string): Promise<FormField | undefined>;
  getFormFieldByName(name: string): Promise<FormField | undefined>;
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

  // Statistics State CRUD
  getStatisticsState(): Promise<StatisticsState>;
  resetStatistics(): Promise<StatisticsState>;
  getStatistics(lastResetAt: Date): Promise<{
    totalIdeas: number;
    todaySubmissions: number;
    activeContributors: number;
    hourlySubmissions: Array<{ hour: string; count: number }>;
    submissionTypes: Array<{ type: string; count: number }>;
    componentCounts: Array<{ component: string; count: number }>;
    topContributors: Array<{ name: string; count: number }>;
    trendingTags: Array<{ tag: string; count: number }>;
  }>;

  // Additional methods needed by routes
  getIdeasWithFields(): Promise<(Idea & { dynamicFields?: IdeaDynamicField[] })[]>;

  // Voting Settings CRUD
  getVotingSettings(): Promise<VotingSettings | undefined>;
  createVotingSettings(settings: InsertVotingSettings): Promise<VotingSettings>;
  updateVotingSettings(id: string, updates: Partial<InsertVotingSettings>): Promise<VotingSettings | undefined>;
  
  // Votes CRUD
  getVotes(sessionId?: string): Promise<Vote[]>;
  getVotesByIdea(ideaId: string): Promise<Vote[]>;
  getVote(ideaId: string, sessionId: string): Promise<Vote | undefined>;
  upsertVote(vote: InsertVote): Promise<Vote>;
  deleteVote(ideaId: string, sessionId: string): Promise<boolean>;
  deleteAllVotes(): Promise<number>;
  
  // Vote analytics
  getVoteAnalytics(): Promise<{
    totalVotesCast: number;
    totalParticipants: number;
    topVotedIdeas: Array<{ ideaId: string; title: string; voteCount: number }>;
  }>;
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

  async deleteAllIdeas(): Promise<number> {
    // First delete all dynamic fields associated with ideas
    await db.delete(ideaDynamicFields);
    // Then delete all ideas
    const result = await db.delete(ideas);
    return result.rowCount || 0;
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

  async getFormFieldByName(name: string): Promise<FormField | undefined> {
    const [field] = await db.select().from(formFields).where(eq(formFields.name, name));
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

  // Statistics State CRUD
  async getStatisticsState(): Promise<StatisticsState> {
    const [state] = await db.select().from(statisticsState).limit(1);
    
    if (!state) {
      const [newState] = await db
        .insert(statisticsState)
        .values({ lastResetAt: new Date() })
        .returning();
      return newState;
    }
    
    return state;
  }

  async resetStatistics(): Promise<StatisticsState> {
    const currentState = await this.getStatisticsState();
    const [updated] = await db
      .update(statisticsState)
      .set({ lastResetAt: new Date() })
      .where(eq(statisticsState.id, currentState.id))
      .returning();
    return updated;
  }

  async getStatistics(lastResetAt: Date): Promise<{
    totalIdeas: number;
    todaySubmissions: number;
    activeContributors: number;
    hourlySubmissions: Array<{ hour: string; count: number }>;
    submissionTypes: Array<{ type: string; count: number }>;
    componentCounts: Array<{ component: string; count: number }>;
    topContributors: Array<{ name: string; count: number }>;
    trendingTags: Array<{ tag: string; count: number }>;
  }> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const totalIdeasResult = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(ideas)
      .where(gte(ideas.createdAt, lastResetAt));
    const totalIdeas = totalIdeasResult[0]?.count || 0;

    const todaySubmissionsResult = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(ideas)
      .where(
        and(
          gte(ideas.createdAt, lastResetAt),
          gte(ideas.createdAt, startOfToday)
        )
      );
    const todaySubmissions = todaySubmissionsResult[0]?.count || 0;

    const activeContributorsResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${ideas.name})::int` })
      .from(ideas)
      .where(gte(ideas.createdAt, lastResetAt));
    const activeContributors = activeContributorsResult[0]?.count || 0;

    const hourlySubmissionsResult = await db
      .select({
        hour: sql<string>`date_trunc('hour', ${ideas.createdAt})::text`,
        count: sql<number>`COUNT(*)::int`
      })
      .from(ideas)
      .where(
        and(
          gte(ideas.createdAt, lastResetAt),
          gte(ideas.createdAt, twentyFourHoursAgo)
        )
      )
      .groupBy(sql`date_trunc('hour', ${ideas.createdAt})`)
      .orderBy(sql`date_trunc('hour', ${ideas.createdAt})`);
    const hourlySubmissions = hourlySubmissionsResult;

    const submissionTypesResult = await db
      .select({
        type: ideas.type,
        count: sql<number>`COUNT(*)::int`
      })
      .from(ideas)
      .where(gte(ideas.createdAt, lastResetAt))
      .groupBy(ideas.type)
      .orderBy(desc(sql<number>`COUNT(*)::int`));
    const submissionTypes = submissionTypesResult;

    // Get all ideas to split comma-separated component values
    const allIdeasForComponents = await db
      .select({ component: ideas.component })
      .from(ideas)
      .where(gte(ideas.createdAt, lastResetAt));
    
    // Split comma-separated components and count individually
    const componentCountMap = new Map<string, number>();
    allIdeasForComponents.forEach(idea => {
      if (idea.component) {
        // Split by comma and trim whitespace
        const components = idea.component.split(',').map(c => c.trim()).filter(c => c);
        components.forEach(component => {
          componentCountMap.set(component, (componentCountMap.get(component) || 0) + 1);
        });
      }
    });
    
    const componentCounts = Array.from(componentCountMap.entries())
      .map(([component, count]) => ({ component, count }))
      .sort((a, b) => b.count - a.count);

    const topContributorsResult = await db
      .select({
        name: ideas.name,
        count: sql<number>`COUNT(*)::int`
      })
      .from(ideas)
      .where(gte(ideas.createdAt, lastResetAt))
      .groupBy(ideas.name)
      .orderBy(desc(sql<number>`COUNT(*)::int`))
      .limit(5);
    const topContributors = topContributorsResult;

    // Get all ideas to split comma-separated tag values
    const allIdeasForTags = await db
      .select({ tag: ideas.tag })
      .from(ideas)
      .where(gte(ideas.createdAt, lastResetAt));
    
    // Split comma-separated tags and count individually
    const tagCountMap = new Map<string, number>();
    allIdeasForTags.forEach(idea => {
      if (idea.tag) {
        // Split by comma and trim whitespace
        const tags = idea.tag.split(',').map(t => t.trim()).filter(t => t);
        tags.forEach(tag => {
          tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
        });
      }
    });
    
    const trendingTags = Array.from(tagCountMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 trending tags

    return {
      totalIdeas,
      todaySubmissions,
      activeContributors,
      hourlySubmissions,
      submissionTypes,
      componentCounts,
      topContributors,
      trendingTags
    };
  }

  // Additional method needed by routes
  async getIdeasWithFields(): Promise<(Idea & { dynamicFields?: any[] })[]> {
    const allIdeas = await this.getIdeas();
    
    // Fetch dynamic fields with their form field labels
    const dynamicFieldsWithLabels = await db
      .select({
        id: ideaDynamicFields.id,
        ideaId: ideaDynamicFields.ideaId,
        fieldId: ideaDynamicFields.fieldId,
        value: ideaDynamicFields.value,
        createdAt: ideaDynamicFields.createdAt,
        fieldName: formFields.name,
        fieldLabel: formFields.label,
        allowMultiSelect: formFields.allowMultiSelect,
      })
      .from(ideaDynamicFields)
      .leftJoin(formFields, eq(ideaDynamicFields.fieldId, formFields.id));
    
    return allIdeas.map(idea => {
      const ideaFields = dynamicFieldsWithLabels.filter(field => field.ideaId === idea.id);
      
      // Group multi-select fields into arrays
      const groupedFields = new Map<string, any>();
      
      ideaFields.forEach(field => {
        const key = field.fieldId;
        
        if (!groupedFields.has(key)) {
          groupedFields.set(key, {
            id: field.id,
            ideaId: field.ideaId,
            fieldId: field.fieldId,
            fieldName: field.fieldName,
            fieldLabel: field.fieldLabel,
            value: field.allowMultiSelect === 'true' ? [field.value] : field.value,
            createdAt: field.createdAt,
          });
        } else {
          // Add to array for multi-select
          const existing = groupedFields.get(key);
          if (Array.isArray(existing.value)) {
            existing.value.push(field.value);
          }
        }
      });
      
      return {
        ...idea,
        dynamicFields: Array.from(groupedFields.values())
      };
    });
  }

  // Voting Settings CRUD
  async getVotingSettings(): Promise<VotingSettings | undefined> {
    const [settings] = await db.select().from(votingSettings).limit(1);
    return settings || undefined;
  }

  async createVotingSettings(settings: InsertVotingSettings): Promise<VotingSettings> {
    const [created] = await db
      .insert(votingSettings)
      .values(settings)
      .returning();
    return created;
  }

  async updateVotingSettings(id: string, updates: Partial<InsertVotingSettings>): Promise<VotingSettings | undefined> {
    const [updated] = await db
      .update(votingSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(votingSettings.id, id))
      .returning();
    return updated || undefined;
  }

  // Votes CRUD
  async getVotes(sessionId?: string): Promise<Vote[]> {
    if (sessionId) {
      return await db.select().from(votes).where(eq(votes.sessionId, sessionId));
    }
    return await db.select().from(votes);
  }

  async getVotesByIdea(ideaId: string): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.ideaId, ideaId));
  }

  async getVote(ideaId: string, sessionId: string): Promise<Vote | undefined> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.ideaId, ideaId), eq(votes.sessionId, sessionId)));
    return vote || undefined;
  }

  async upsertVote(insertVote: InsertVote): Promise<Vote> {
    // Check if vote already exists
    const existingVote = await this.getVote(insertVote.ideaId, insertVote.sessionId);
    
    if (existingVote) {
      // Update existing vote
      const [updated] = await db
        .update(votes)
        .set({ voteCount: insertVote.voteCount, updatedAt: new Date() })
        .where(and(eq(votes.ideaId, insertVote.ideaId), eq(votes.sessionId, insertVote.sessionId)))
        .returning();
      
      // Update idea totalVotes
      await this.recalculateIdeaVotes(insertVote.ideaId);
      
      return updated;
    } else {
      // Insert new vote
      const [newVote] = await db
        .insert(votes)
        .values(insertVote)
        .returning();
      
      // Update idea totalVotes
      await this.recalculateIdeaVotes(insertVote.ideaId);
      
      return newVote;
    }
  }

  async deleteVote(ideaId: string, sessionId: string): Promise<boolean> {
    const result = await db
      .delete(votes)
      .where(and(eq(votes.ideaId, ideaId), eq(votes.sessionId, sessionId)));
    
    // Update idea totalVotes
    await this.recalculateIdeaVotes(ideaId);
    
    return result.rowCount !== null && result.rowCount > 0;
  }

  async deleteAllVotes(): Promise<number> {
    const result = await db.delete(votes);
    
    // Reset all ideas' totalVotes to 0
    await db.update(ideas).set({ totalVotes: 0 });
    
    return result.rowCount || 0;
  }

  // Helper method to recalculate totalVotes for an idea
  private async recalculateIdeaVotes(ideaId: string): Promise<void> {
    const ideaVotes = await this.getVotesByIdea(ideaId);
    const totalVotes = ideaVotes.reduce((sum, vote) => sum + vote.voteCount, 0);
    
    await db
      .update(ideas)
      .set({ totalVotes })
      .where(eq(ideas.id, ideaId));
  }

  // Vote analytics
  async getVoteAnalytics(): Promise<{
    totalVotesCast: number;
    totalParticipants: number;
    topVotedIdeas: Array<{ ideaId: string; title: string; voteCount: number }>;
  }> {
    // Get total votes cast
    const totalVotesResult = await db
      .select({ total: sql<number>`SUM(${votes.voteCount})::int` })
      .from(votes);
    const totalVotesCast = totalVotesResult[0]?.total || 0;

    // Get total unique participants
    const participantsResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${votes.sessionId})::int` })
      .from(votes);
    const totalParticipants = participantsResult[0]?.count || 0;

    // Get top voted ideas
    const topVotedResult = await db
      .select({
        ideaId: ideas.id,
        title: ideas.title,
        voteCount: ideas.totalVotes
      })
      .from(ideas)
      .orderBy(desc(ideas.totalVotes))
      .limit(10);
    
    return {
      totalVotesCast,
      totalParticipants,
      topVotedIdeas: topVotedResult
    };
  }
}

export const storage = new DatabaseStorage();