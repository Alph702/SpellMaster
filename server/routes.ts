import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertWordSchema, insertPracticeHistorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/words", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const words = await storage.getWordsForUser(req.user.id);
    res.json(words);
  });

  app.post("/api/words", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parseResult = insertWordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }
    const word = await storage.createWord(req.user.id, parseResult.data);
    res.status(201).json(word);
  });

  app.post("/api/practice", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parseResult = insertPracticeHistorySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }

    const [word, history] = await Promise.all([
      storage.updateWordProgress(parseResult.data.wordId, parseResult.data.correct),
      storage.addPracticeHistory(req.user.id, parseResult.data),
    ]);

    res.status(201).json({ word, history });
  });

  app.get("/api/progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const progress = await storage.getUserProgress(req.user.id);
    res.json(progress);
  });

  const httpServer = createServer(app);
  return httpServer;
}
