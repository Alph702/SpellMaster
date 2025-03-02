import { IStorage } from "./types";
import { User, Word, PracticeHistory, InsertUser, InsertWord, InsertPracticeHistory } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private words: Map<number, Word>;
  private practiceHistory: Map<number, PracticeHistory>;
  sessionStore: session.Store;
  currentId: { users: number; words: number; history: number };

  constructor() {
    this.users = new Map();
    this.words = new Map();
    this.practiceHistory = new Map();
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    this.currentId = { users: 1, words: 1, history: 1 };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getWordsForUser(userId: number): Promise<Word[]> {
    return Array.from(this.words.values()).filter(
      (word) => word.userId === userId,
    );
  }

  async createWord(userId: number, insertWord: InsertWord): Promise<Word> {
    const id = this.currentId.words++;
    const word: Word = {
      ...insertWord,
      id,
      userId,
      timesCorrect: 0,
      timesIncorrect: 0,
      mastered: false,
    };
    this.words.set(id, word);
    return word;
  }

  async updateWordProgress(wordId: number, correct: boolean): Promise<Word> {
    const word = this.words.get(wordId);
    if (!word) throw new Error("Word not found");

    const updatedWord: Word = {
      ...word,
      timesCorrect: word.timesCorrect + (correct ? 1 : 0),
      timesIncorrect: word.timesIncorrect + (correct ? 0 : 1),
      mastered: correct && word.timesCorrect >= 4,
    };
    this.words.set(wordId, updatedWord);
    return updatedWord;
  }

  async addPracticeHistory(
    userId: number,
    insertHistory: InsertPracticeHistory,
  ): Promise<PracticeHistory> {
    const id = this.currentId.history++;
    const history: PracticeHistory = {
      ...insertHistory,
      id,
      userId,
      timestamp: new Date(),
    };
    this.practiceHistory.set(id, history);
    return history;
  }

  async getUserProgress(userId: number): Promise<{
    totalWords: number;
    masteredWords: number;
    practiceCount: number;
  }> {
    const userWords = await this.getWordsForUser(userId);
    const userHistory = Array.from(this.practiceHistory.values()).filter(
      (h) => h.userId === userId,
    );

    return {
      totalWords: userWords.length,
      masteredWords: userWords.filter((w) => w.mastered).length,
      practiceCount: userHistory.length,
    };
  }
}

export const storage = new MemStorage();
