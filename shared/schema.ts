import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define the severity levels for plant diseases
export enum DiseaseSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high"
}

// Define the diagnosis schema
export const diagnoses = pgTable("diagnoses", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(), // URL/path to the stored image
  diseaseName: text("disease_name").notNull(), // Name of the disease in both Arabic and English
  description: text("description").notNull(), // Description of the disease
  severity: text("severity").notNull(), // Severity level of the disease
  severityScore: integer("severity_score").notNull(), // Numeric score for severity (0-100)
  timestamp: timestamp("timestamp").notNull().defaultNow(), // When the diagnosis was made
});

// Schema for inserting a new diagnosis
export const insertDiagnosisSchema = createInsertSchema(diagnoses).omit({
  id: true,
  timestamp: true,
});

export type InsertDiagnosis = z.infer<typeof insertDiagnosisSchema>;
export type Diagnosis = typeof diagnoses.$inferSelect;
