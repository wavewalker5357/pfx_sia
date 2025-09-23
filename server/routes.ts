import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSummitResourceSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);

  return httpServer;
}
