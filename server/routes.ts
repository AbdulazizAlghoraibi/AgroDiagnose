import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { z } from "zod";
import { insertDiagnosisSchema } from "@shared/schema";
import axios from "axios";

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "../uploads");
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg and .jpeg formats are allowed"));
    }
  },
});

// Simplified plant disease classification function
// In a real app, this would call a machine learning model API
async function classifyPlantDisease(imagePath: string): Promise<{
  diseaseName: string;
  arabicName: string;
  description: string;
  arabicDescription: string;
  severity: string;
  severityScore: number;
}> {
  try {
    // This is a placeholder for real ML model API call
    // For a real implementation, you would integrate with a model like HuggingFace
    
    // Simulate API call to HuggingFace or similar
    // In a real app, you would use:
    // const response = await axios.post(
    //   "https://api-inference.huggingface.co/models/plantdoc/plant-disease-classification",
    //   formData,
    //   { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
    // );
    
    // For demo purposes, simulate a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a random disease from common plant diseases
    const diseases = [
      {
        diseaseName: "Powdery Mildew",
        arabicName: "البياض الدقيقي",
        description: "A fungal disease that appears as white powdery spots on leaves, stems, and sometimes fruit. It can spread quickly in high humidity conditions and affects plant growth and yield.",
        arabicDescription: "البياض الدقيقي هو مرض فطري يظهر على شكل بقع بيضاء على أوراق النبات والسيقان وأحيانًا الثمار. يمكن أن ينتشر بسرعة في ظروف الرطوبة العالية ويؤثر على نمو النبات وإنتاجيته.",
        severity: "medium",
        severityScore: 65
      },
      {
        diseaseName: "Tomato Leaf Blight",
        arabicName: "لفحة أوراق الطماطم",
        description: "A fungal disease that causes brown spots on tomato leaves, which can expand and cause the leaves to wither and die. It can significantly reduce crop yield if not treated.",
        arabicDescription: "لفحة الأوراق هي مرض فطري يسبب ظهور بقع بنية على أوراق الطماطم، والتي يمكن أن تتوسع وتتسبب في ذبول الأوراق وموتها. يمكن أن يقلل بشكل كبير من محصول المحاصيل إذا لم يتم علاجه.",
        severity: "high",
        severityScore: 85
      },
      {
        diseaseName: "Wheat Rust",
        arabicName: "صدأ القمح",
        description: "A fungal disease that appears as reddish-brown pustules on wheat leaves and stems. It can severely reduce crop yield and quality if left untreated.",
        arabicDescription: "الصدأ هو مرض فطري يظهر على شكل بثور بنية محمرة على أوراق وسيقان القمح. يمكن أن يقلل بشدة من غلة المحصول وجودته إذا ترك دون علاج.",
        severity: "low",
        severityScore: 30
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * diseases.length);
    return diseases[randomIndex];
  } catch (error) {
    console.error("Error classifying plant disease:", error);
    throw new Error("Failed to classify plant disease");
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded images
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  // Get all diagnoses
  app.get("/api/diagnoses", async (req: Request, res: Response) => {
    try {
      const diagnoses = await storage.getDiagnoses();
      res.json(diagnoses);
    } catch (error) {
      console.error("Error fetching diagnoses:", error);
      res.status(500).json({ error: "Failed to fetch diagnoses" });
    }
  });

  // Get a single diagnosis by ID
  app.get("/api/diagnoses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid diagnosis ID" });
      }

      const diagnosis = await storage.getDiagnosis(id);
      if (!diagnosis) {
        return res.status(404).json({ error: "Diagnosis not found" });
      }

      res.json(diagnosis);
    } catch (error) {
      console.error("Error fetching diagnosis:", error);
      res.status(500).json({ error: "Failed to fetch diagnosis" });
    }
  });

  // Upload and analyze plant image
  app.post("/api/diagnose", upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const imagePath = req.file.path;
      const imageUrl = `/uploads/${path.basename(imagePath)}`;

      // Classify the plant disease
      const result = await classifyPlantDisease(imagePath);

      // Combine Arabic and English names for display
      const combinedName = `${result.arabicName} (${result.diseaseName})`;
      const combinedDescription = `${result.arabicDescription}\n\n${result.description}`;

      // Create diagnosis record
      const diagnosisData = {
        imageUrl,
        diseaseName: combinedName,
        description: combinedDescription,
        severity: result.severity,
        severityScore: result.severityScore
      };

      // Validate diagnosis data
      const validatedData = insertDiagnosisSchema.parse(diagnosisData);
      
      // Store diagnosis in database
      const diagnosis = await storage.createDiagnosis(validatedData);
      
      res.status(201).json(diagnosis);
    } catch (error) {
      console.error("Error processing diagnosis:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid diagnosis data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to process diagnosis" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
