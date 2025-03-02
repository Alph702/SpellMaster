import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  word: text("word").notNull(),
  definition: text("definition"),
  timesCorrect: integer("times_correct").default(0),
  timesIncorrect: integer("times_incorrect").default(0),
  mastered: boolean("mastered").default(false),
});

export const practiceHistory = pgTable("practice_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  wordId: integer("word_id").notNull(),
  correct: boolean("correct").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWordSchema = createInsertSchema(words).pick({
  word: true,
  definition: true,
});

export const insertPracticeHistorySchema = createInsertSchema(practiceHistory).pick({
  wordId: true,
  correct: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertWord = z.infer<typeof insertWordSchema>;
export type InsertPracticeHistory = z.infer<typeof insertPracticeHistorySchema>;
export type User = typeof users.$inferSelect;
export type Word = typeof words.$inferSelect;
export type PracticeHistory = typeof practiceHistory.$inferSelect;
