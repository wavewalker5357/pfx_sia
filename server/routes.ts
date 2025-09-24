import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSummitResourceSchema,
  insertIdeaSchema,
  insertFormFieldSchema, 
  insertFormFieldOptionSchema, 
  insertIdeaDynamicFieldSchema 
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

  const httpServer = createServer(app);

  return httpServer;
}
