import { diagnoses, type Diagnosis, type InsertDiagnosis } from "@shared/schema";

// Storage interface for diagnosis operations
export interface IStorage {
  getDiagnoses(): Promise<Diagnosis[]>;
  getDiagnosis(id: number): Promise<Diagnosis | undefined>;
  createDiagnosis(diagnosis: InsertDiagnosis): Promise<Diagnosis>;
}

export class MemStorage implements IStorage {
  private diagnoses: Map<number, Diagnosis>;
  private currentId: number;

  constructor() {
    this.diagnoses = new Map();
    this.currentId = 1;
  }

  async getDiagnoses(): Promise<Diagnosis[]> {
    // Sort by timestamp desc to show most recent first
    return Array.from(this.diagnoses.values()).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  async getDiagnosis(id: number): Promise<Diagnosis | undefined> {
    return this.diagnoses.get(id);
  }

  async createDiagnosis(insertDiagnosis: InsertDiagnosis): Promise<Diagnosis> {
    const id = this.currentId++;
    const timestamp = new Date();
    const diagnosis: Diagnosis = { ...insertDiagnosis, id, timestamp };
    this.diagnoses.set(id, diagnosis);
    return diagnosis;
  }
}

export const storage = new MemStorage();
