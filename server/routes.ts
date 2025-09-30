import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSummitResourceSchema,
  insertIdeaSchema,
  insertFormFieldSchema, 
  insertFormFieldOptionSchema, 
  insertIdeaDynamicFieldSchema,
  insertHeaderSettingsSchema,
  insertKanbanCategorySchema,
  insertViewSettingsSchema,
  insertLandingPageSettingsSchema,
  insertSummitHomeContentSchema,
  insertVoteSchema,
  insertVotingSettingsSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Ideas API routes
  
  // GET /api/ideas - Get all ideas with dynamic fields
  app.get("/api/ideas", async (req, res) => {
    try {
      const ideas = await storage.getIdeasWithFields();
      res.json(ideas);
    } catch (error) {
      console.error("Error fetching ideas:", error);
      res.status(500).json({ error: "Failed to fetch ideas" });
    }
  });

  // POST /api/ideas - Create new idea
  app.post("/api/ideas", async (req, res) => {
    try {
      const validatedData = insertIdeaSchema.parse(req.body);
      const idea = await storage.createIdea(validatedData);
      res.status(201).json(idea);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error creating idea:", error);
        res.status(500).json({ error: "Failed to create idea" });
      }
    }
  });

  // GET /api/ideas/:id - Get specific idea
  app.get("/api/ideas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const idea = await storage.getIdea(id);
      
      if (!idea) {
        return res.status(404).json({ error: "Idea not found" });
      }
      
      res.json(idea);
    } catch (error) {
      console.error("Error fetching idea:", error);
      res.status(500).json({ error: "Failed to fetch idea" });
    }
  });

  // PUT /api/ideas/:id - Update idea
  app.put("/api/ideas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertIdeaSchema.partial().parse(req.body);
      const idea = await storage.updateIdea(id, validatedData);
      
      if (!idea) {
        return res.status(404).json({ error: "Idea not found" });
      }
      
      res.json(idea);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error updating idea:", error);
        res.status(500).json({ error: "Failed to update idea" });
      }
    }
  });

  // DELETE /api/ideas/:id - Delete idea
  app.delete("/api/ideas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteIdea(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Idea not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting idea:", error);
      res.status(500).json({ error: "Failed to delete idea" });
    }
  });

  // DELETE /api/ideas - Delete all ideas (admin only)
  app.delete("/api/ideas", async (req, res) => {
    try {
      const deletedCount = await storage.deleteAllIdeas();
      res.json({ deletedCount, message: `Successfully deleted ${deletedCount} ideas` });
    } catch (error) {
      console.error("Error deleting all ideas:", error);
      res.status(500).json({ error: "Failed to delete all ideas" });
    }
  });

  // PATCH /api/ideas/:id/category - Update idea category (for drag and drop)
  app.patch("/api/ideas/:id/category", async (req, res) => {
    try {
      const { id } = req.params;
      const { type } = req.body;
      
      if (!type || typeof type !== 'string') {
        return res.status(400).json({ error: 'Category type is required' });
      }
      
      // Validate that the target category exists and is active
      const categories = await storage.getKanbanCategories();
      const activeCategories = categories.filter(cat => cat.isActive === 'true');
      const validCategoryKeys = activeCategories.map(cat => cat.key);
      
      if (!validCategoryKeys.includes(type)) {
        return res.status(400).json({ 
          error: `Invalid category type '${type}'. Must be one of: ${validCategoryKeys.join(', ')}` 
        });
      }
      
      const updatedIdea = await storage.updateIdeaCategory(id, type);
      if (!updatedIdea) {
        return res.status(404).json({ error: 'Idea not found' });
      }
      
      res.json(updatedIdea);
    } catch (error) {
      console.error('Error updating idea category:', error);
      res.status(500).json({ error: 'Failed to update idea category' });
    }
  });

  // Summit Resources API routes
  
  // GET /api/summit-resources - Get all summit resources
  app.get("/api/summit-resources", async (req, res) => {
    try {
      const resources = await storage.getSummitResources();
      res.json(resources);
    } catch (error) {
      console.error("Error fetching summit resources:", error);
      res.status(500).json({ error: "Failed to fetch summit resources" });
    }
  });

  // POST /api/summit-resources - Create new summit resource
  app.post("/api/summit-resources", async (req, res) => {
    try {
      const validatedData = insertSummitResourceSchema.parse(req.body);
      const resource = await storage.createSummitResource(validatedData);
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error creating summit resource:", error);
        res.status(500).json({ error: "Failed to create summit resource" });
      }
    }
  });

  // PUT /api/summit-resources/:id - Update summit resource
  app.put("/api/summit-resources/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertSummitResourceSchema.partial().parse(req.body);
      const resource = await storage.updateSummitResource(id, validatedData);
      
      if (!resource) {
        return res.status(404).json({ error: "Summit resource not found" });
      }
      
      res.json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error updating summit resource:", error);
        res.status(500).json({ error: "Failed to update summit resource" });
      }
    }
  });

  // DELETE /api/summit-resources/:id - Delete summit resource
  app.delete("/api/summit-resources/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSummitResource(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Summit resource not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting summit resource:", error);
      res.status(500).json({ error: "Failed to delete summit resource" });
    }
  });

  // Form Fields API routes
  
  // GET /api/form-fields - Get all form fields
  app.get("/api/form-fields", async (req, res) => {
    try {
      const fields = await storage.getFormFields();
      res.json(fields);
    } catch (error) {
      console.error("Error fetching form fields:", error);
      res.status(500).json({ error: "Failed to fetch form fields" });
    }
  });

  // POST /api/form-fields - Create new form field
  app.post("/api/form-fields", async (req, res) => {
    try {
      const validatedData = insertFormFieldSchema.parse(req.body);
      const field = await storage.createFormField(validatedData);
      res.status(201).json(field);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error creating form field:", error);
        res.status(500).json({ error: "Failed to create form field" });
      }
    }
  });

  // PUT /api/form-fields/:id - Update form field
  app.put("/api/form-fields/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertFormFieldSchema.partial().parse(req.body);
      const field = await storage.updateFormField(id, validatedData);
      
      if (!field) {
        return res.status(404).json({ error: "Form field not found" });
      }
      
      res.json(field);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error updating form field:", error);
        res.status(500).json({ error: "Failed to update form field" });
      }
    }
  });

  // DELETE /api/form-fields/:id - Delete form field
  app.delete("/api/form-fields/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteFormField(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Form field not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting form field:", error);
      res.status(500).json({ error: "Failed to delete form field" });
    }
  });

  // Form Field Options API routes
  
  // GET /api/form-field-options - Get all options (optionally filtered by fieldId)
  app.get("/api/form-field-options", async (req, res) => {
    try {
      const { fieldId } = req.query;
      const options = await storage.getFormFieldOptions(fieldId as string);
      res.json(options);
    } catch (error) {
      console.error("Error fetching form field options:", error);
      res.status(500).json({ error: "Failed to fetch form field options" });
    }
  });

  // POST /api/form-field-options - Create new form field option
  app.post("/api/form-field-options", async (req, res) => {
    try {
      const validatedData = insertFormFieldOptionSchema.parse(req.body);
      const option = await storage.createFormFieldOption(validatedData);
      res.status(201).json(option);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error creating form field option:", error);
        res.status(500).json({ error: "Failed to create form field option" });
      }
    }
  });

  // PUT /api/form-field-options/:id - Update form field option
  app.put("/api/form-field-options/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertFormFieldOptionSchema.partial().parse(req.body);
      const option = await storage.updateFormFieldOption(id, validatedData);
      
      if (!option) {
        return res.status(404).json({ error: "Form field option not found" });
      }
      
      res.json(option);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error updating form field option:", error);
        res.status(500).json({ error: "Failed to update form field option" });
      }
    }
  });

  // DELETE /api/form-field-options/:id - Delete form field option
  app.delete("/api/form-field-options/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteFormFieldOption(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Form field option not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting form field option:", error);
      res.status(500).json({ error: "Failed to delete form field option" });
    }
  });

  // Idea Dynamic Fields API routes
  
  // GET /api/idea-dynamic-fields - Get dynamic field values (optionally filtered by ideaId)
  app.get("/api/idea-dynamic-fields", async (req, res) => {
    try {
      const { ideaId } = req.query;
      const fields = await storage.getIdeaDynamicFields(ideaId as string);
      res.json(fields);
    } catch (error) {
      console.error("Error fetching idea dynamic fields:", error);
      res.status(500).json({ error: "Failed to fetch idea dynamic fields" });
    }
  });

  // POST /api/idea-dynamic-fields - Create new dynamic field value
  app.post("/api/idea-dynamic-fields", async (req, res) => {
    try {
      const validatedData = insertIdeaDynamicFieldSchema.parse(req.body);
      const field = await storage.createIdeaDynamicField(validatedData);
      res.status(201).json(field);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error creating idea dynamic field:", error);
        res.status(500).json({ error: "Failed to create idea dynamic field" });
      }
    }
  });

  // Header Settings API routes
  
  // GET /api/header-settings - Get header settings
  app.get("/api/header-settings", async (req, res) => {
    try {
      const settings = await storage.getHeaderSettings();
      if (!settings) {
        return res.status(404).json({ error: "Header settings not found" });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching header settings:", error);
      res.status(500).json({ error: "Failed to fetch header settings" });
    }
  });

  // POST /api/header-settings - Create header settings
  app.post("/api/header-settings", async (req, res) => {
    try {
      const validatedData = insertHeaderSettingsSchema.parse(req.body);
      const settings = await storage.createHeaderSettings(validatedData);
      res.status(201).json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error creating header settings:", error);
        res.status(500).json({ error: "Failed to create header settings" });
      }
    }
  });

  // PUT /api/header-settings/:id - Update header settings
  app.put("/api/header-settings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertHeaderSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateHeaderSettings(id, validatedData);
      
      if (!settings) {
        return res.status(404).json({ error: "Header settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error updating header settings:", error);
        res.status(500).json({ error: "Failed to update header settings" });
      }
    }
  });

  // Kanban Categories API routes
  
  // GET /api/kanban-categories - Get all kanban categories
  app.get("/api/kanban-categories", async (req, res) => {
    try {
      const categories = await storage.getKanbanCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching kanban categories:", error);
      res.status(500).json({ error: "Failed to fetch kanban categories" });
    }
  });

  // POST /api/kanban-categories - Create new kanban category
  app.post("/api/kanban-categories", async (req, res) => {
    try {
      const validatedData = insertKanbanCategorySchema.parse(req.body);
      const category = await storage.createKanbanCategory(validatedData);
      
      // Auto-sync: Create matching form field option for type field
      try {
        const typeField = await storage.getFormFieldByName('type');
        if (typeField) {
          // Get highest order number for the type field options
          const existingOptions = await storage.getFormFieldOptions(typeField.id);
          const nextOrder = Math.max(0, ...existingOptions.map(opt => parseInt(opt.order || '0'))) + 1;
          
          await storage.createFormFieldOption({
            fieldId: typeField.id,
            value: category.key, // Use kanban key as form option value
            label: category.title, // Use kanban title as form option label
            order: nextOrder.toString(),
            isActive: category.isActive
          });
        }
      } catch (syncError) {
        console.warn("Failed to sync kanban category to form field options:", syncError);
        // Don't fail the main operation if sync fails
      }
      
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error creating kanban category:", error);
        res.status(500).json({ error: "Failed to create kanban category" });
      }
    }
  });

  // GET /api/kanban-categories/:id - Get specific kanban category
  app.get("/api/kanban-categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.getKanbanCategory(id);
      
      if (!category) {
        return res.status(404).json({ error: "Kanban category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error fetching kanban category:", error);
      res.status(500).json({ error: "Failed to fetch kanban category" });
    }
  });

  // PUT /api/kanban-categories/:id - Update kanban category
  app.put("/api/kanban-categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertKanbanCategorySchema.partial().parse(req.body);
      const category = await storage.updateKanbanCategory(id, validatedData);
      
      if (!category) {
        return res.status(404).json({ error: "Kanban category not found" });
      }
      
      // Auto-sync: Update matching form field option for type field
      try {
        const typeField = await storage.getFormFieldByName('type');
        if (typeField) {
          const existingOptions = await storage.getFormFieldOptions(typeField.id);
          const matchingOption = existingOptions.find(opt => opt.value === category.key);
          
          if (matchingOption && (validatedData.title || validatedData.isActive !== undefined)) {
            await storage.updateFormFieldOption(matchingOption.id, {
              label: validatedData.title || matchingOption.label,
              isActive: validatedData.isActive !== undefined ? validatedData.isActive : matchingOption.isActive
            });
          }
        }
      } catch (syncError) {
        console.warn("Failed to sync kanban category update to form field options:", syncError);
        // Don't fail the main operation if sync fails
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error updating kanban category:", error);
        res.status(500).json({ error: "Failed to update kanban category" });
      }
    }
  });

  // DELETE /api/kanban-categories/:id - Delete kanban category
  app.delete("/api/kanban-categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get the category before deleting for sync purposes
      const categoryToDelete = await storage.getKanbanCategory(id);
      if (!categoryToDelete) {
        return res.status(404).json({ error: "Kanban category not found" });
      }
      
      const deleted = await storage.deleteKanbanCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Kanban category not found" });
      }
      
      // Auto-sync: Delete matching form field option for type field
      try {
        const typeField = await storage.getFormFieldByName('type');
        if (typeField) {
          const existingOptions = await storage.getFormFieldOptions(typeField.id);
          const matchingOption = existingOptions.find(opt => opt.value === categoryToDelete.key);
          
          if (matchingOption) {
            await storage.deleteFormFieldOption(matchingOption.id);
          }
        }
      } catch (syncError) {
        console.warn("Failed to sync kanban category deletion to form field options:", syncError);
        // Don't fail the main operation if sync fails
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting kanban category:", error);
      res.status(500).json({ error: "Failed to delete kanban category" });
    }
  });

  // View Settings API routes
  
  // GET /api/view-settings - Get view settings
  app.get("/api/view-settings", async (req, res) => {
    try {
      const settings = await storage.getViewSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching view settings:", error);
      res.status(500).json({ error: "Failed to fetch view settings" });
    }
  });

  // POST /api/view-settings - Create view settings
  app.post("/api/view-settings", async (req, res) => {
    try {
      const validatedData = insertViewSettingsSchema.parse(req.body);
      const settings = await storage.createViewSettings(validatedData);
      res.status(201).json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error creating view settings:", error);
        res.status(500).json({ error: "Failed to create view settings" });
      }
    }
  });

  // PUT /api/view-settings/:id - Update view settings
  app.put("/api/view-settings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertViewSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateViewSettings(id, validatedData);
      
      if (!settings) {
        return res.status(404).json({ error: "View settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error updating view settings:", error);
        res.status(500).json({ error: "Failed to update view settings" });
      }
    }
  });

  // Landing Page Settings API routes
  
  // GET /api/landing-page-settings - Get landing page settings
  app.get("/api/landing-page-settings", async (req, res) => {
    try {
      const settings = await storage.getLandingPageSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching landing page settings:", error);
      res.status(500).json({ error: "Failed to fetch landing page settings" });
    }
  });

  // POST /api/landing-page-settings - Create landing page settings
  app.post("/api/landing-page-settings", async (req, res) => {
    try {
      const validatedData = insertLandingPageSettingsSchema.parse(req.body);
      const settings = await storage.createLandingPageSettings(validatedData);
      res.status(201).json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error creating landing page settings:", error);
        res.status(500).json({ error: "Failed to create landing page settings" });
      }
    }
  });

  // PUT /api/landing-page-settings/:id - Update landing page settings
  app.put("/api/landing-page-settings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertLandingPageSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateLandingPageSettings(id, validatedData);
      
      if (!settings) {
        return res.status(404).json({ error: "Landing page settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error updating landing page settings:", error);
        res.status(500).json({ error: "Failed to update landing page settings" });
      }
    }
  });

  // Data Migration API routes
  
  // POST /api/admin/migrate-categories - Run category data migration
  app.post("/api/admin/migrate-categories", async (req, res) => {
    try {
      // Import migration functions
      const { migrateIdeaCategories, validateFormFieldSync } = await import("./data-migration");
      
      const { fix = false, defaultCategory } = req.body;
      
      // Run migration analysis/fix
      const migrationResult = await migrateIdeaCategories(fix, defaultCategory);
      
      // Run sync validation
      const syncValidation = await validateFormFieldSync();
      
      res.json({
        migration: migrationResult,
        validation: syncValidation,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error running category migration:", error);
      res.status(500).json({ error: "Failed to run category migration" });
    }
  });

  // Summit Home Content API routes

  // GET /api/home-content - Get published home content (for end users)
  app.get("/api/home-content", async (req, res) => {
    try {
      const content = await storage.getSummitHomeContent();
      
      if (!content || content.isPublished !== 'true') {
        return res.status(404).json({ error: "Home content not found or not published" });
      }
      
      res.json(content);
    } catch (error) {
      console.error("Error fetching home content:", error);
      res.status(500).json({ error: "Failed to fetch home content" });
    }
  });

  // GET /api/admin/home-content - Get home content for admin (includes drafts)
  app.get("/api/admin/home-content", async (req, res) => {
    try {
      const content = await storage.getSummitHomeContent();
      
      if (!content) {
        // Return default content structure if none exists
        return res.json({
          id: null,
          title: "Welcome to AI Summit",
          slug: "home",
          content: "",
          isPublished: "false",
          createdAt: null,
          updatedAt: null
        });
      }
      
      res.json(content);
    } catch (error) {
      console.error("Error fetching admin home content:", error);
      res.status(500).json({ error: "Failed to fetch home content" });
    }
  });

  // POST /api/admin/home-content - Create home content
  app.post("/api/admin/home-content", async (req, res) => {
    try {
      const validatedData = insertSummitHomeContentSchema.parse(req.body);
      const content = await storage.createSummitHomeContent(validatedData);
      res.status(201).json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error creating home content:", error);
        res.status(500).json({ error: "Failed to create home content" });
      }
    }
  });

  // PUT /api/admin/home-content/:id - Update home content
  app.put("/api/admin/home-content/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertSummitHomeContentSchema.partial().parse(req.body);
      const content = await storage.updateSummitHomeContent(id, validatedData);
      
      if (!content) {
        return res.status(404).json({ error: "Home content not found" });
      }
      
      res.json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error updating home content:", error);
        res.status(500).json({ error: "Failed to update home content" });
      }
    }
  });

  // Statistics API routes

  // GET /api/statistics - Get all statistics
  app.get("/api/statistics", async (req, res) => {
    try {
      const state = await storage.getStatisticsState();
      const stats = await storage.getStatistics(state.lastResetAt);
      
      res.json({
        ...stats,
        lastResetAt: state.lastResetAt
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // POST /api/statistics/reset - Reset statistics
  app.post("/api/statistics/reset", async (req, res) => {
    try {
      const state = await storage.resetStatistics();
      res.json({ 
        message: "Statistics reset successfully",
        lastResetAt: state.lastResetAt
      });
    } catch (error) {
      console.error("Error resetting statistics:", error);
      res.status(500).json({ error: "Failed to reset statistics" });
    }
  });

  // Voting Settings API routes

  // GET /api/voting-settings - Get voting settings (auto-creates if none exist)
  app.get("/api/voting-settings", async (req, res) => {
    try {
      let settings = await storage.getVotingSettings();
      
      // Auto-create default settings if none exist
      if (!settings) {
        settings = await storage.createVotingSettings({
          isOpen: "false",
          maxVotesPerParticipant: 5,
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching voting settings:", error);
      res.status(500).json({ error: "Failed to fetch voting settings" });
    }
  });

  // PATCH /api/voting-settings/:id - Update voting settings (admin only)
  app.patch("/api/voting-settings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertVotingSettingsSchema.partial().parse(req.body);
      
      // If isOpen is being set to true, record startedAt
      if (validatedData.isOpen === "true") {
        validatedData.startedAt = new Date();
      }
      // If isOpen is being set to false, record closedAt
      if (validatedData.isOpen === "false") {
        validatedData.closedAt = new Date();
      }
      
      const settings = await storage.updateVotingSettings(id, validatedData);
      
      if (!settings) {
        return res.status(404).json({ error: "Voting settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error updating voting settings:", error);
        res.status(500).json({ error: "Failed to update voting settings" });
      }
    }
  });

  // Votes API routes

  // GET /api/votes - Get votes for current session
  app.get("/api/votes", async (req, res) => {
    try {
      const { sessionId } = req.query;
      
      if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({ error: "sessionId query parameter is required" });
      }
      
      const votes = await storage.getVotes(sessionId);
      res.json(votes);
    } catch (error) {
      console.error("Error fetching votes:", error);
      res.status(500).json({ error: "Failed to fetch votes" });
    }
  });

  // GET /api/ideas/:ideaId/votes - Get total votes for a specific idea
  app.get("/api/ideas/:ideaId/votes", async (req, res) => {
    try {
      const { ideaId } = req.params;
      const ideaVotes = await storage.getVotesByIdea(ideaId);
      const totalVotes = ideaVotes.reduce((sum, vote) => sum + vote.voteCount, 0);
      
      res.json({ 
        ideaId,
        totalVotes,
        votes: ideaVotes
      });
    } catch (error) {
      console.error("Error fetching idea votes:", error);
      res.status(500).json({ error: "Failed to fetch idea votes" });
    }
  });

  // POST /api/votes - Cast or update vote
  app.post("/api/votes", async (req, res) => {
    try {
      const validatedData = insertVoteSchema.parse(req.body);
      
      // Validate voting is open
      const settings = await storage.getVotingSettings();
      if (!settings || settings.isOpen !== "true") {
        return res.status(403).json({ error: "Voting is currently closed" });
      }
      
      // Validate vote count is positive (default to 1 if not provided)
      const voteCount = validatedData.voteCount ?? 1;
      if (voteCount <= 0) {
        return res.status(400).json({ error: "Vote count must be positive" });
      }
      
      // Check if user has exceeded max votes
      const userVotes = await storage.getVotes(validatedData.sessionId);
      const currentVoteOnIdea = userVotes.find(v => v.ideaId === validatedData.ideaId);
      const totalUsed = userVotes.reduce((sum, v) => sum + v.voteCount, 0);
      const currentOnIdea = currentVoteOnIdea ? currentVoteOnIdea.voteCount : 0;
      const newTotal = totalUsed - currentOnIdea + voteCount;
      
      if (newTotal > settings.maxVotesPerParticipant) {
        return res.status(400).json({ 
          error: "Exceeds maximum votes allowed",
          maxVotes: settings.maxVotesPerParticipant,
          currentUsed: totalUsed,
          remaining: settings.maxVotesPerParticipant - totalUsed
        });
      }
      
      const vote = await storage.upsertVote({ ...validatedData, voteCount });
      res.status(200).json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error casting vote:", error);
        res.status(500).json({ error: "Failed to cast vote" });
      }
    }
  });

  // DELETE /api/votes/:ideaId - Remove vote from specific idea
  app.delete("/api/votes/:ideaId", async (req, res) => {
    try {
      const { ideaId } = req.params;
      const { sessionId } = req.query;
      
      if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({ error: "sessionId query parameter is required" });
      }
      
      // Validate voting is open
      const settings = await storage.getVotingSettings();
      if (!settings || settings.isOpen !== "true") {
        return res.status(403).json({ error: "Voting is currently closed" });
      }
      
      const deleted = await storage.deleteVote(ideaId, sessionId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Vote not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vote:", error);
      res.status(500).json({ error: "Failed to delete vote" });
    }
  });

  // DELETE /api/votes - Reset all votes (admin only)
  app.delete("/api/votes", async (req, res) => {
    try {
      const deletedCount = await storage.deleteAllVotes();
      res.json({ 
        deletedCount,
        message: `Successfully deleted ${deletedCount} votes`
      });
    } catch (error) {
      console.error("Error deleting all votes:", error);
      res.status(500).json({ error: "Failed to delete all votes" });
    }
  });

  // GET /api/vote-analytics - Get voting analytics (admin only)
  app.get("/api/vote-analytics", async (req, res) => {
    try {
      const analytics = await storage.getVoteAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching vote analytics:", error);
      res.status(500).json({ error: "Failed to fetch vote analytics" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
