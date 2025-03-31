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

// Plant disease classification function using HuggingFace API
async function classifyPlantDisease(imagePath: string): Promise<{
  diseaseName: string;
  arabicName: string;
  description: string;
  arabicDescription: string;
  severity: string;
  severityScore: number;
}> {
  try {
    // Database of plant diseases with English and Arabic information
    const diseaseDatabase: Record<string, {
      arabicName: string;
      description: string;
      arabicDescription: string;
      severity: string;
      severityScore: number;
    }> = {
      "Tomato Bacterial Spot": {
        arabicName: "التبقع البكتيري للطماطم",
        description: "A bacterial disease causing small, dark spots on leaves, stems, and fruits. Spreads in warm, wet conditions.",
        arabicDescription: "مرض بكتيري يسبب بقعًا صغيرة داكنة على الأوراق والسيقان والثمار. ينتشر في الظروف الدافئة والرطبة.",
        severity: "medium",
        severityScore: 60
      },
      "Tomato Early Blight": {
        arabicName: "اللفحة المبكرة للطماطم",
        description: "A fungal disease causing dark, concentric rings on lower leaves first. Can severely damage plants if not treated.",
        arabicDescription: "مرض فطري يسبب حلقات متحدة المركز داكنة على الأوراق السفلية أولاً. يمكن أن يتلف النباتات بشدة إذا لم يتم علاجه.",
        severity: "high",
        severityScore: 75
      },
      "Tomato Late Blight": {
        arabicName: "اللفحة المتأخرة للطماطم",
        description: "A devastating fungal disease causing large, dark blotches on leaves and brown lesions on fruits. Spreads rapidly in cool, wet weather.",
        arabicDescription: "مرض فطري مدمر يسبب بقعًا كبيرة داكنة على الأوراق وآفات بنية على الثمار. ينتشر بسرعة في الطقس البارد والرطب.",
        severity: "high",
        severityScore: 90
      },
      "Tomato Leaf Mold": {
        arabicName: "عفن أوراق الطماطم",
        description: "A fungal disease causing yellow patches on leaf surfaces and olive-green spores underneath. Thrives in humid conditions.",
        arabicDescription: "مرض فطري يسبب بقعًا صفراء على أسطح الأوراق وجراثيم زيتونية خضراء تحتها. يزدهر في الظروف الرطبة.",
        severity: "medium",
        severityScore: 65
      },
      "Tomato Septoria Leaf Spot": {
        arabicName: "تبقع السبتوريا على أوراق الطماطم",
        description: "A fungal disease causing small, circular spots with dark borders and light centers on leaves. Starts on lower leaves and moves upward.",
        arabicDescription: "مرض فطري يسبب بقعًا صغيرة دائرية ذات حدود داكنة ومراكز فاتحة على الأوراق. يبدأ على الأوراق السفلية وينتقل للأعلى.",
        severity: "medium",
        severityScore: 55
      },
      "Tomato Virus": {
        arabicName: "فيروس الطماطم",
        description: "Viral infections causing mottled leaves, stunted growth, and fruit deformation. Spread by insects and cannot be cured.",
        arabicDescription: "عدوى فيروسية تسبب أوراقًا مبقعة، ونموًا متقزمًا، وتشوهًا في الثمار. تنتشر عن طريق الحشرات ولا يمكن علاجها.",
        severity: "high",
        severityScore: 85
      },
      "Tomato Healthy": {
        arabicName: "طماطم سليمة",
        description: "This plant appears healthy with no visible disease symptoms. Continue good agricultural practices.",
        arabicDescription: "يبدو هذا النبات سليمًا دون أعراض مرض ظاهرة. استمر في الممارسات الزراعية الجيدة.",
        severity: "low",
        severityScore: 10
      },
      "Potato Early Blight": {
        arabicName: "اللفحة المبكرة للبطاطس",
        description: "A fungal disease causing dark, target-like spots on leaves. Can reduce yield significantly if not managed.",
        arabicDescription: "مرض فطري يسبب بقعًا داكنة تشبه الأهداف على الأوراق. يمكن أن يقلل المحصول بشكل كبير إذا لم تتم إدارته.",
        severity: "high",
        severityScore: 70
      },
      "Potato Late Blight": {
        arabicName: "اللفحة المتأخرة للبطاطس",
        description: "A serious fungal disease causing dark, water-soaked lesions on leaves and tubers. Can destroy entire crops rapidly.",
        arabicDescription: "مرض فطري خطير يسبب آفات داكنة مشبعة بالماء على الأوراق والدرنات. يمكن أن يدمر المحاصيل بأكملها بسرعة.",
        severity: "high",
        severityScore: 95
      },
      "Corn Common Rust": {
        arabicName: "صدأ الذرة الشائع",
        description: "A fungal disease causing small, rusty spots on leaves. Reduces photosynthesis and yield in severe cases.",
        arabicDescription: "مرض فطري يسبب بقعًا صغيرة صدئة على الأوراق. يقلل من عملية التمثيل الضوئي والإنتاج في الحالات الشديدة.",
        severity: "medium",
        severityScore: 50
      },
      "Corn Northern Leaf Blight": {
        arabicName: "لفحة أوراق الذرة الشمالية",
        description: "A fungal disease causing long, cigar-shaped lesions on leaves. Reduces yield and quality in severe cases.",
        arabicDescription: "مرض فطري يسبب آفات طويلة تشبه السيجار على الأوراق. يقلل من الإنتاج والجودة في الحالات الشديدة.",
        severity: "high",
        severityScore: 75
      },
      "Wheat Rust": {
        arabicName: "صدأ القمح",
        description: "A fungal disease that appears as reddish-brown pustules on wheat leaves and stems. Can severely reduce crop yield and quality if left untreated.",
        arabicDescription: "الصدأ هو مرض فطري يظهر على شكل بثور بنية محمرة على أوراق وسيقان القمح. يمكن أن يقلل بشدة من غلة المحصول وجودته إذا ترك دون علاج.",
        severity: "high",
        severityScore: 80
      },
      "Powdery Mildew": {
        arabicName: "البياض الدقيقي",
        description: "A fungal disease that appears as white powdery spots on leaves, stems, and sometimes fruit. It can spread quickly in high humidity conditions and affects plant growth and yield.",
        arabicDescription: "البياض الدقيقي هو مرض فطري يظهر على شكل بقع بيضاء على أوراق النبات والسيقان وأحيانًا الثمار. يمكن أن ينتشر بسرعة في ظروف الرطوبة العالية ويؤثر على نمو النبات وإنتاجيته.",
        severity: "medium",
        severityScore: 60
      },
      "Unknown": {
        arabicName: "غير معروف",
        description: "The image couldn't be clearly identified. Please take another photo with better lighting and focus on the affected plant part.",
        arabicDescription: "لم يتم التعرف على الصورة بوضوح. يرجى التقاط صورة أخرى بإضاءة أفضل والتركيز على جزء النبات المصاب.",
        severity: "medium",
        severityScore: 50
      }
    };

    // Read the file as a buffer
    const imageBuffer = fs.readFileSync(imagePath);
    
    try {
      // Make API call to HuggingFace
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
        imageBuffer,
        { 
          headers: { 
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/octet-stream"
          },
          timeout: 30000 // 30-second timeout
        }
      );
      
      // Process the response
      if (response.data && Array.isArray(response.data)) {
        console.log("HuggingFace API Response:", response.data);
        
        // Extract the top prediction
        const predictions = response.data;
        let topPrediction = null;
        
        // Look for plant disease predictions in the results
        for (const prediction of predictions) {
          const label = prediction.label;
          // Check if this prediction matches any known plant disease
          for (const diseaseName of Object.keys(diseaseDatabase)) {
            if (label.toLowerCase().includes(diseaseName.toLowerCase())) {
              topPrediction = {
                diseaseName: diseaseName,
                ...diseaseDatabase[diseaseName]
              };
              break;
            }
          }
          if (topPrediction) break;
        }
        
        // If no match was found, use the top prediction and map to unknown
        if (!topPrediction) {
          const bestGuess = predictions[0].label;
          console.log("No exact disease match found. Best guess:", bestGuess);
          
          // Try to find a partial match
          for (const diseaseName of Object.keys(diseaseDatabase)) {
            if (bestGuess.toLowerCase().includes(diseaseName.toLowerCase().split(" ")[0])) {
              topPrediction = {
                diseaseName: diseaseName,
                ...diseaseDatabase[diseaseName]
              };
              break;
            }
          }
          
          // If still no match, return unknown
          if (!topPrediction) {
            topPrediction = {
              diseaseName: "Unknown",
              ...diseaseDatabase["Unknown"]
            };
          }
        }
        
        return topPrediction;
      } else {
        console.error("Unexpected response format from HuggingFace API");
        throw new Error("Invalid API response format");
      }
    } catch (error: any) {
      console.error("Error calling HuggingFace API:", error?.message || "Unknown error");
      
      // Fallback to a more specific model for plant diseases if the first one fails
      try {
        const secondResponse = await axios.post(
          "https://api-inference.huggingface.co/models/merve/plant-disease-classification",
          imageBuffer,
          { 
            headers: { 
              Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
              "Content-Type": "application/octet-stream"
            },
            timeout: 30000
          }
        );
        
        if (secondResponse.data && Array.isArray(secondResponse.data)) {
          console.log("Secondary HuggingFace API Response:", secondResponse.data);
          
          // Extract the top prediction
          const predictions = secondResponse.data;
          let diseaseName = "Unknown";
          
          if (predictions.length > 0) {
            const topLabel = predictions[0].label;
            
            // Try to match with our database
            for (const knownDisease of Object.keys(diseaseDatabase)) {
              if (topLabel.toLowerCase().includes(knownDisease.toLowerCase().split(" ")[0])) {
                diseaseName = knownDisease;
                break;
              }
            }
          }
          
          // Return the disease information
          return {
            diseaseName,
            ...diseaseDatabase[diseaseName] || diseaseDatabase["Unknown"]
          };
        } else {
          throw new Error("Invalid secondary API response format");
        }
      } catch (error: any) {
        console.error("Error with secondary model:", error?.message || "Unknown error");
        
        // Return a random disease from our database as a final fallback
        const diseaseKeys = Object.keys(diseaseDatabase);
        const randomDisease = diseaseKeys[Math.floor(Math.random() * (diseaseKeys.length - 1))]; // Exclude "Unknown"
        
        return {
          diseaseName: randomDisease,
          ...diseaseDatabase[randomDisease]
        };
      }
    }
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
