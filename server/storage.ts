import { type User, type InsertUser, type SummitResource, type InsertSummitResource } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Summit Resources CRUD
  getSummitResources(): Promise<SummitResource[]>;
  getSummitResource(id: string): Promise<SummitResource | undefined>;
  createSummitResource(resource: InsertSummitResource): Promise<SummitResource>;
  updateSummitResource(id: string, updates: Partial<InsertSummitResource>): Promise<SummitResource | undefined>;
  deleteSummitResource(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private summitResources: Map<string, SummitResource>;

  constructor() {
    this.users = new Map();
    this.summitResources = new Map();
    
    // Initialize with default summit resources
    this.initializeDefaultResources();
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
}

export const storage = new MemStorage();
