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
  type InsertIdeaDynamicField
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private ideas: Map<string, Idea>;
  private summitResources: Map<string, SummitResource>;
  private formFields: Map<string, FormField>;
  private formFieldOptions: Map<string, FormFieldOption>;
  private ideaDynamicFields: Map<string, IdeaDynamicField>;

  constructor() {
    this.users = new Map();
    this.ideas = new Map();
    this.summitResources = new Map();
    this.formFields = new Map();
    this.formFieldOptions = new Map();
    this.ideaDynamicFields = new Map();
    
    // Initialize with default data
    this.initializeDefaultIdeas();
    this.initializeDefaultResources();
    this.initializeDefaultFormFields();
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
        type: 'AI Solution',
        createdAt: new Date('2025-01-15T10:30:00Z')
      },
      {
        id: 'idea_2',
        name: 'Alex Rodriguez',
        title: 'Smart Meeting Summarizer',
        description: 'A tool that joins virtual meetings, transcribes conversations, and generates actionable summaries with key decisions and follow-up tasks.',
        component: 'Product',
        tag: 'productivity',
        type: 'AI Idea',
        createdAt: new Date('2025-01-15T11:15:00Z')
      },
      {
        id: 'idea_3',
        name: 'Morgan Taylor',
        title: 'Automated Testing Story Generator',
        description: 'Generate comprehensive test scenarios and user stories automatically based on feature requirements and user personas.',
        component: 'AI/ML',
        tag: 'automation',
        type: 'AI Story',
        createdAt: new Date('2025-01-15T14:20:00Z')
      },
      {
        id: 'idea_4',
        name: 'Jordan Kim',
        title: 'Intelligent Resource Allocation',
        description: 'Optimize compute resource allocation across environments using predictive analytics and historical usage patterns.',
        component: 'Infrastructure',
        tag: 'optimization',
        type: 'AI Solution',
        createdAt: new Date('2025-01-15T16:45:00Z')
      },
      {
        id: 'idea_5',
        name: 'Taylor Swift',
        title: 'Developer Mood Analysis',
        description: 'Use sentiment analysis on commit messages and code reviews to gauge team morale and identify potential burnout.',
        component: 'Platform',
        tag: 'collaboration',
        type: 'AI Idea',
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
    
    const updated: Idea = { ...existing, ...updates };
    this.ideas.set(id, updated);
    return updated;
  }

  async deleteIdea(id: string): Promise<boolean> {
    return this.ideas.delete(id);
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
}

export const storage = new MemStorage();
