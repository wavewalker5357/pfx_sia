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
  type InsertViewSettings
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private ideas: Map<string, Idea>;
  private summitResources: Map<string, SummitResource>;
  private formFields: Map<string, FormField>;
  private formFieldOptions: Map<string, FormFieldOption>;
  private ideaDynamicFields: Map<string, IdeaDynamicField>;
  private headerSettings: HeaderSettings | undefined;
  private kanbanCategories: Map<string, KanbanCategory>;
  private viewSettings: ViewSettings | undefined;

  constructor() {
    this.users = new Map();
    this.ideas = new Map();
    this.summitResources = new Map();
    this.formFields = new Map();
    this.formFieldOptions = new Map();
    this.ideaDynamicFields = new Map();
    this.headerSettings = undefined;
    this.kanbanCategories = new Map();
    this.viewSettings = undefined;
    
    // Initialize with default data
    this.initializeDefaultIdeas();
    this.initializeDefaultResources();
    this.initializeDefaultFormFields();
    this.initializeDefaultHeaderSettings();
    this.initializeDefaultKanbanCategories();
    this.initializeDefaultViewSettings();
  }

  private initializeDefaultIdeas() {
    // Initialize with sample ideas using the old static schema for now
    const defaultIdeas: Idea[] = [
      {
        id: 'idea_1',
        name: 'Sarah Chen',
        title: 'AI-Powered Code Review Assistant', 
        description: 'An intelligent system that automatically reviews code changes, suggests improvements, and identifies potential security vulnerabilities using machine learning models.',
        component: 'AI/ML',
        tag: 'automation',
        type: 'ai_solution', // Updated to match kanban category key
        createdAt: new Date('2025-01-15T10:30:00Z')
      },
      {
        id: 'idea_2',
        name: 'Alex Rodriguez',
        title: 'Smart Meeting Summarizer',
        description: 'A tool that joins virtual meetings, transcribes conversations, and generates actionable summaries with key decisions and follow-up tasks.',
        component: 'Product',
        tag: 'productivity',
        type: 'ai_idea', // Updated to match kanban category key
        createdAt: new Date('2025-01-15T11:15:00Z')
      },
      {
        id: 'idea_3',
        name: 'Morgan Taylor',
        title: 'Automated Testing Story Generator',
        description: 'Generate comprehensive test scenarios and user stories automatically based on feature requirements and user personas.',
        component: 'AI/ML',
        tag: 'automation',
        type: 'ai_story', // Updated to match kanban category key
        createdAt: new Date('2025-01-15T14:20:00Z')
      },
      {
        id: 'idea_4',
        name: 'Jordan Kim',
        title: 'Intelligent Resource Allocation',
        description: 'Optimize compute resource allocation across environments using predictive analytics and historical usage patterns.',
        component: 'Infrastructure',
        tag: 'optimization',
        type: 'ai_solution', // Updated to match kanban category key
        createdAt: new Date('2025-01-15T16:45:00Z')
      },
      {
        id: 'idea_5',
        name: 'Taylor Swift',
        title: 'Developer Mood Analysis',
        description: 'Use sentiment analysis on commit messages and code reviews to gauge team morale and identify potential burnout.',
        component: 'Platform',
        tag: 'collaboration',
        type: 'ai_idea', // Updated to match kanban category key
        createdAt: new Date('2025-01-15T18:00:00Z')
      }
    ];
    
    defaultIdeas.forEach(idea => {
      this.ideas.set(idea.id, idea);
    });
  }

  private initializeDefaultResources() {
    const defaultResources: SummitResource[] = [
      { id: '1', title: 'Summit Agenda', url: 'https://example.com/agenda', description: 'Daily schedule and sessions', order: '1', isActive: 'true', createdAt: new Date() },
      { id: '2', title: 'Meeting Rooms', url: 'https://example.com/rooms', description: 'Reserve conference rooms', order: '2', isActive: 'true', createdAt: new Date() },
      { id: '3', title: 'Lunch Menu', url: 'https://example.com/lunch', description: 'Today\'s meal options', order: '3', isActive: 'true', createdAt: new Date() },
      { id: '4', title: 'Evening Activities', url: 'https://example.com/activities', description: 'After-hours events', order: '4', isActive: 'true', createdAt: new Date() },
      { id: '5', title: 'Hotels & Travel', url: 'https://example.com/hotels', description: 'Accommodation information', order: '5', isActive: 'true', createdAt: new Date() },
    ];
    
    defaultResources.forEach(resource => {
      this.summitResources.set(resource.id, resource);
    });
  }

  private initializeDefaultFormFields() {
    // Create default form fields to replace the original fixed fields
    const defaultFields: FormField[] = [
      {
        id: 'field_1',
        name: 'submitter_name',
        label: 'Your Name',
        type: 'text',
        required: 'true',
        placeholder: 'Enter your full name',
        helpText: 'This will be displayed with your idea',
        order: '1',
        isActive: 'true',
        allowUserAdditions: 'false',
        createdAt: new Date()
      },
      {
        id: 'field_2',
        name: 'idea_title',
        label: 'Idea Title',
        type: 'text',
        required: 'true',
        placeholder: 'Brief, descriptive title for your idea',
        helpText: 'Keep it concise and compelling',
        order: '2',
        isActive: 'true',
        allowUserAdditions: 'false',
        createdAt: new Date()
      },
      {
        id: 'field_3',
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: 'true',
        placeholder: 'Detailed description of your idea...',
        helpText: 'Explain your idea, its benefits, and implementation approach',
        order: '3',
        isActive: 'true',
        allowUserAdditions: 'false',
        createdAt: new Date()
      },
      {
        id: 'field_4',
        name: 'component',
        label: 'Component',
        type: 'list',
        required: 'true',
        placeholder: null,
        helpText: 'Which product component does this relate to?',
        order: '4',
        isActive: 'true',
        allowUserAdditions: 'false',
        createdAt: new Date()
      },
      {
        id: 'field_5',
        name: 'tag',
        label: 'Tag',
        type: 'list',
        required: 'true',
        placeholder: null,
        helpText: 'Select or add tags that describe your idea',
        order: '5',
        isActive: 'true',
        allowUserAdditions: 'true', // Allow users to add new tags
        createdAt: new Date()
      },
      {
        id: 'field_6',
        name: 'type',
        label: 'Type',
        type: 'list',
        required: 'true',
        placeholder: null,
        helpText: 'What type of AI contribution is this?',
        order: '6',
        isActive: 'true',
        allowUserAdditions: 'false',
        createdAt: new Date()
      }
    ];

    defaultFields.forEach(field => {
      this.formFields.set(field.id, field);
    });

    // Create default options for list fields
    const defaultOptions: FormFieldOption[] = [
      // Component options
      { id: 'opt_1', fieldId: 'field_4', value: 'Platform', label: 'Platform', order: '1', isActive: 'true', createdAt: new Date() },
      { id: 'opt_2', fieldId: 'field_4', value: 'Product', label: 'Product', order: '2', isActive: 'true', createdAt: new Date() },
      { id: 'opt_3', fieldId: 'field_4', value: 'Security', label: 'Security', order: '3', isActive: 'true', createdAt: new Date() },
      { id: 'opt_4', fieldId: 'field_4', value: 'Infrastructure', label: 'Infrastructure', order: '4', isActive: 'true', createdAt: new Date() },
      
      // Tag options (allow user additions)
      { id: 'opt_5', fieldId: 'field_5', value: 'innovation', label: 'Innovation', order: '1', isActive: 'true', createdAt: new Date() },
      { id: 'opt_6', fieldId: 'field_5', value: 'automation', label: 'Automation', order: '2', isActive: 'true', createdAt: new Date() },
      { id: 'opt_7', fieldId: 'field_5', value: 'collaboration', label: 'Collaboration', order: '3', isActive: 'true', createdAt: new Date() },
      { id: 'opt_8', fieldId: 'field_5', value: 'efficiency', label: 'Efficiency', order: '4', isActive: 'true', createdAt: new Date() },
      
      // Type options
      { id: 'opt_9', fieldId: 'field_6', value: 'AI Idea', label: 'AI Idea', order: '1', isActive: 'true', createdAt: new Date() },
      { id: 'opt_10', fieldId: 'field_6', value: 'AI Solution', label: 'AI Solution', order: '2', isActive: 'true', createdAt: new Date() },
      { id: 'opt_11', fieldId: 'field_6', value: 'AI Story', label: 'AI Story', order: '3', isActive: 'true', createdAt: new Date() },
    ];

    defaultOptions.forEach(option => {
      this.formFieldOptions.set(option.id, option);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Ideas CRUD implementation
  async getIdeas(): Promise<Idea[]> {
    return Array.from(this.ideas.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Get ideas with dynamic fields for enhanced browse view
  async getIdeasWithFields(): Promise<(Idea & { dynamicFields: IdeaDynamicField[] })[]> {
    const ideas = await this.getIdeas();
    const ideasWithFields = await Promise.all(
      ideas.map(async (idea) => {
        const dynamicFields = await this.getIdeaDynamicFields(idea.id);
        return { ...idea, dynamicFields };
      })
    );
    return ideasWithFields;
  }

  async getIdea(id: string): Promise<Idea | undefined> {
    return this.ideas.get(id);
  }

  async createIdea(insertIdea: InsertIdea): Promise<Idea> {
    // Validate that the idea type matches an active kanban category
    const categories = await this.getKanbanCategories();
    const activeCategories = categories.filter(cat => cat.isActive === 'true');
    const validCategoryKeys = activeCategories.map(cat => cat.key);
    
    if (!validCategoryKeys.includes(insertIdea.type)) {
      throw new Error(`Invalid category type '${insertIdea.type}'. Must be one of: ${validCategoryKeys.join(', ')}`);
    }

    const id = randomUUID();
    const idea: Idea = {
      ...insertIdea,
      id,
      createdAt: new Date(),
    };
    this.ideas.set(id, idea);
    return idea;
  }

  async updateIdea(id: string, updates: Partial<InsertIdea>): Promise<Idea | undefined> {
    const existing = this.ideas.get(id);
    if (!existing) return undefined;
    
    // Validate category type if it's being updated
    if (updates.type) {
      const categories = await this.getKanbanCategories();
      const activeCategories = categories.filter(cat => cat.isActive === 'true');
      const validCategoryKeys = activeCategories.map(cat => cat.key);
      
      if (!validCategoryKeys.includes(updates.type)) {
        throw new Error(`Invalid category type '${updates.type}'. Must be one of: ${validCategoryKeys.join(', ')}`);
      }
    }
    
    const updated: Idea = { ...existing, ...updates };
    this.ideas.set(id, updated);
    return updated;
  }

  async deleteIdea(id: string): Promise<boolean> {
    return this.ideas.delete(id);
  }

  async updateIdeaCategory(id: string, type: string): Promise<Idea | undefined> {
    return this.updateIdea(id, { type });
  }

  // Summit Resources methods
  async getSummitResources(): Promise<SummitResource[]> {
    return Array.from(this.summitResources.values()).sort((a, b) => 
      parseInt(a.order) - parseInt(b.order)
    );
  }

  async getSummitResource(id: string): Promise<SummitResource | undefined> {
    return this.summitResources.get(id);
  }

  async createSummitResource(insertResource: InsertSummitResource): Promise<SummitResource> {
    const id = randomUUID();
    const resource: SummitResource = { 
      ...insertResource,
      id, 
      description: insertResource.description || null,
      order: insertResource.order || "0",
      isActive: insertResource.isActive || "true",
      createdAt: new Date() 
    };
    this.summitResources.set(id, resource);
    return resource;
  }

  async updateSummitResource(id: string, updates: Partial<InsertSummitResource>): Promise<SummitResource | undefined> {
    const existing = this.summitResources.get(id);
    if (!existing) return undefined;
    
    const updated: SummitResource = { ...existing, ...updates };
    this.summitResources.set(id, updated);
    return updated;
  }

  async deleteSummitResource(id: string): Promise<boolean> {
    return this.summitResources.delete(id);
  }

  // Form Fields methods
  async getFormFields(): Promise<FormField[]> {
    return Array.from(this.formFields.values()).sort((a, b) => 
      parseInt(a.order) - parseInt(b.order)
    );
  }

  async getFormField(id: string): Promise<FormField | undefined> {
    return this.formFields.get(id);
  }

  async createFormField(insertField: InsertFormField): Promise<FormField> {
    const id = randomUUID();
    const field: FormField = { 
      ...insertField,
      id, 
      placeholder: insertField.placeholder || null,
      helpText: insertField.helpText || null,
      order: insertField.order || "0",
      isActive: insertField.isActive || "true",
      required: insertField.required || "false",
      allowUserAdditions: insertField.allowUserAdditions || "false",
      createdAt: new Date() 
    };
    this.formFields.set(id, field);
    return field;
  }

  async updateFormField(id: string, updates: Partial<InsertFormField>): Promise<FormField | undefined> {
    const existing = this.formFields.get(id);
    if (!existing) return undefined;
    
    const updated: FormField = { ...existing, ...updates };
    this.formFields.set(id, updated);
    return updated;
  }

  async deleteFormField(id: string): Promise<boolean> {
    // Also delete related options
    const options = Array.from(this.formFieldOptions.values()).filter(opt => opt.fieldId === id);
    options.forEach(opt => this.formFieldOptions.delete(opt.id));
    
    return this.formFields.delete(id);
  }

  // Form Field Options methods
  async getFormFieldOptions(fieldId?: string): Promise<FormFieldOption[]> {
    const options = Array.from(this.formFieldOptions.values());
    const filtered = fieldId ? options.filter(opt => opt.fieldId === fieldId) : options;
    return filtered.sort((a, b) => parseInt(a.order) - parseInt(b.order));
  }

  async getFormFieldOption(id: string): Promise<FormFieldOption | undefined> {
    return this.formFieldOptions.get(id);
  }

  async createFormFieldOption(insertOption: InsertFormFieldOption): Promise<FormFieldOption> {
    const id = randomUUID();
    const option: FormFieldOption = { 
      ...insertOption,
      id, 
      order: insertOption.order || "0",
      isActive: insertOption.isActive || "true",
      createdAt: new Date() 
    };
    this.formFieldOptions.set(id, option);
    return option;
  }

  async updateFormFieldOption(id: string, updates: Partial<InsertFormFieldOption>): Promise<FormFieldOption | undefined> {
    const existing = this.formFieldOptions.get(id);
    if (!existing) return undefined;
    
    const updated: FormFieldOption = { ...existing, ...updates };
    this.formFieldOptions.set(id, updated);
    return updated;
  }

  async deleteFormFieldOption(id: string): Promise<boolean> {
    return this.formFieldOptions.delete(id);
  }

  // Idea Dynamic Fields methods
  async getIdeaDynamicFields(ideaId?: string): Promise<IdeaDynamicField[]> {
    const fields = Array.from(this.ideaDynamicFields.values());
    return ideaId ? fields.filter(field => field.ideaId === ideaId) : fields;
  }

  async createIdeaDynamicField(insertField: InsertIdeaDynamicField): Promise<IdeaDynamicField> {
    const id = randomUUID();
    const field: IdeaDynamicField = { 
      ...insertField,
      id, 
      createdAt: new Date() 
    };
    this.ideaDynamicFields.set(id, field);
    return field;
  }

  async updateIdeaDynamicField(id: string, updates: Partial<InsertIdeaDynamicField>): Promise<IdeaDynamicField | undefined> {
    const existing = this.ideaDynamicFields.get(id);
    if (!existing) return undefined;
    
    const updated: IdeaDynamicField = { ...existing, ...updates };
    this.ideaDynamicFields.set(id, updated);
    return updated;
  }

  async deleteIdeaDynamicField(id: string): Promise<boolean> {
    return this.ideaDynamicFields.delete(id);
  }

  private initializeDefaultHeaderSettings() {
    const defaultSettings: HeaderSettings = {
      id: 'header_1',
      attendeeTitle: 'AI Summit Ideas',
      attendeeSubtitle: 'Product & Engineering Summit 2025',
      adminTitle: 'AI Summit Admin',
      adminSubtitle: 'Platform Management Dashboard',
      summitResourcesLabel: 'Summit Resources',
      exitButtonLabel: 'Exit',
      logoutButtonLabel: 'Logout',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      titleColor: '#000000',
      subtitleColor: '#666666',
      borderColor: '#e5e7eb',
      backgroundImage: null,
      backgroundImageOpacity: '0.1',
      backgroundImagePosition: 'center',
      backgroundImageSize: 'cover',
      headerHeight: 'auto',
      paddingX: '1rem',
      paddingY: '1rem',
      mobileBreakpoint: '768px',
      mobileTitleSize: '1.5rem',
      desktopTitleSize: '2rem',
      isActive: 'true',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.headerSettings = defaultSettings;
  }

  private initializeDefaultKanbanCategories() {
    const defaultCategories: KanbanCategory[] = [
      {
        id: 'category_1',
        key: 'ai_story',
        title: 'AI Story',
        color: '#10b981', // Green
        order: '0',
        isActive: 'true',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'category_2',
        key: 'ai_idea',
        title: 'AI Idea',
        color: '#3b82f6', // Blue
        order: '1',
        isActive: 'true',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'category_3',
        key: 'ai_solution',
        title: 'AI Solution',
        color: '#8b5cf6', // Purple
        order: '2',
        isActive: 'true',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    
    defaultCategories.forEach(category => {
      this.kanbanCategories.set(category.id, category);
    });
  }

  private initializeDefaultViewSettings() {
    const defaultSettings: ViewSettings = {
      id: 'view_1',
      defaultView: 'list',
      showBoardByDefault: 'false',
      updatedAt: new Date(),
    };
    
    this.viewSettings = defaultSettings;
  }

  // Header Settings methods
  async getHeaderSettings(): Promise<HeaderSettings | undefined> {
    return this.headerSettings;
  }

  async createHeaderSettings(insertSettings: InsertHeaderSettings): Promise<HeaderSettings> {
    const id = randomUUID();
    const now = new Date();
    
    // Build settings by merging defaults with provided values
    const defaults = {
      attendeeTitle: 'AI Summit Ideas',
      attendeeSubtitle: 'Product & Engineering Summit 2025',
      adminTitle: 'AI Summit Admin',
      adminSubtitle: 'Platform Management Dashboard',
      summitResourcesLabel: 'Summit Resources',
      exitButtonLabel: 'Exit',
      logoutButtonLabel: 'Logout',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      titleColor: '#000000',
      subtitleColor: '#666666',
      borderColor: '#e5e7eb',
      backgroundImage: null,
      backgroundImageOpacity: '0.1',
      backgroundImagePosition: 'center',
      backgroundImageSize: 'cover',
      headerHeight: 'auto',
      paddingX: '1rem',
      paddingY: '1rem',
      mobileBreakpoint: '768px',
      mobileTitleSize: '1.5rem',
      desktopTitleSize: '2rem',
      isActive: 'true',
    };
    
    const settings: HeaderSettings = {
      ...defaults,
      ...insertSettings, // Merge in provided values
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.headerSettings = settings;
    return settings;
  }

  async updateHeaderSettings(id: string, updates: Partial<InsertHeaderSettings>): Promise<HeaderSettings | undefined> {
    if (!this.headerSettings || this.headerSettings.id !== id) return undefined;
    
    const now = new Date();
    const updated: HeaderSettings = { 
      ...this.headerSettings, 
      ...updates,
      id, // Preserve the original id
      createdAt: this.headerSettings.createdAt, // Preserve original creation time
      updatedAt: now // Update the timestamp
    };
    
    this.headerSettings = updated;
    return updated;
  }

  // Kanban Categories methods
  async getKanbanCategories(): Promise<KanbanCategory[]> {
    return Array.from(this.kanbanCategories.values()).sort((a, b) => 
      parseInt(a.order) - parseInt(b.order)
    );
  }

  async getKanbanCategory(id: string): Promise<KanbanCategory | undefined> {
    return this.kanbanCategories.get(id);
  }

  async createKanbanCategory(insertCategory: InsertKanbanCategory): Promise<KanbanCategory> {
    const id = randomUUID();
    const now = new Date();
    const category: KanbanCategory = { 
      ...insertCategory,
      id, 
      color: insertCategory.color || "#3b82f6", // Default blue color
      order: insertCategory.order || "0",
      isActive: insertCategory.isActive || "true",
      createdAt: now,
      updatedAt: now
    };
    this.kanbanCategories.set(id, category);
    return category;
  }

  async updateKanbanCategory(id: string, updates: Partial<InsertKanbanCategory>): Promise<KanbanCategory | undefined> {
    const existing = this.kanbanCategories.get(id);
    if (!existing) return undefined;
    
    const now = new Date();
    const updated: KanbanCategory = { 
      ...existing, 
      ...updates,
      id, // Preserve the original id
      createdAt: existing.createdAt, // Preserve original creation time
      updatedAt: now // Update the timestamp
    };
    
    // Update the category first
    this.kanbanCategories.set(id, updated);
    
    // If the key is being updated, cascade the change to all ideas using the old key
    if (updates.key && updates.key !== existing.key) {
      const ideas = await this.getIdeas();
      const ideasUsingCategory = ideas.filter(idea => idea.type === existing.key);
      
      if (ideasUsingCategory.length > 0) {
        // Update all ideas to use the new key
        // We do this directly to bypass validation since we know the new key is valid
        for (const idea of ideasUsingCategory) {
          const updatedIdea: Idea = { ...idea, type: updates.key };
          this.ideas.set(idea.id, updatedIdea);
        }
      }
    }
    
    return updated;
  }

  async deleteKanbanCategory(id: string): Promise<boolean> {
    const category = this.kanbanCategories.get(id);
    if (!category) return false;
    
    // Check if any ideas are using this category
    const ideas = await this.getIdeas();
    const ideasUsingCategory = ideas.filter(idea => idea.type === category.key);
    
    if (ideasUsingCategory.length > 0) {
      throw new Error(`Cannot delete category '${category.title}' because ${ideasUsingCategory.length} ideas are using it. Please move those ideas to another category first.`);
    }
    
    return this.kanbanCategories.delete(id);
  }

  // View Settings methods
  async getViewSettings(): Promise<ViewSettings | undefined> {
    return this.viewSettings;
  }

  async createViewSettings(insertSettings: InsertViewSettings): Promise<ViewSettings> {
    const id = randomUUID();
    const now = new Date();
    
    const settings: ViewSettings = {
      ...insertSettings,
      id,
      defaultView: insertSettings.defaultView || "list",
      showBoardByDefault: insertSettings.showBoardByDefault || "false",
      updatedAt: now,
    };
    
    this.viewSettings = settings;
    return settings;
  }

  async updateViewSettings(id: string, updates: Partial<InsertViewSettings>): Promise<ViewSettings | undefined> {
    if (!this.viewSettings || this.viewSettings.id !== id) return undefined;
    
    const now = new Date();
    const updated: ViewSettings = { 
      ...this.viewSettings, 
      ...updates,
      id, // Preserve the original id
      updatedAt: now // Update the timestamp
    };
    
    this.viewSettings = updated;
    return updated;
  }
}

export const storage = new MemStorage();
