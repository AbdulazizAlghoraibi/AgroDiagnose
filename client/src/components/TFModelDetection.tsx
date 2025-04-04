import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ImagePlus, X, AlertTriangle } from 'lucide-react';
import { t, Language } from '../lib/translations';

interface TFModelDetectionProps {
  language: Language;
}

export default function TFModelDetection({ language }: TFModelDetectionProps) {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [classLabels, setClassLabels] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modelLoadingError, setModelLoadingError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{ label: string, confidence: number } | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load the TensorFlow.js model and class labels
  useEffect(() => {
    async function loadModelAndClasses() {
      try {
        setIsLoading(true);
        setModelLoadingError(null);

        // Load class indices
        const classIndicesResponse = await fetch('/plant-model/class_indices.json');
        if (!classIndicesResponse.ok) {
          throw new Error('Failed to load class indices');
        }
        const classIndices = await classIndicesResponse.json();
        setClassLabels(classIndices);

        // Load the model
        console.log('Loading TensorFlow.js model...');
        const loadedModel = await tf.loadLayersModel('/plant-model/model.json');
        console.log('Model loaded successfully');
        
        // Warm up the model with a dummy prediction
        const dummyInput = tf.zeros([1, 224, 224, 3]);
        loadedModel.predict(dummyInput);
        dummyInput.dispose();
        
        setModel(loadedModel);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading model:', error);
        setModelLoadingError(
          error instanceof Error 
            ? error.message 
            : 'Failed to load the plant disease detection model'
        );
        setIsLoading(false);
      }
    }

    loadModelAndClasses();

    // Cleanup function
    return () => {
      if (model) {
        model.dispose();
      }
    };
  }, []);

  // Image selection handler
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);
      
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      
      // Reset previous prediction
      setPrediction(null);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setPrediction(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process image and make prediction
  const handleAnalyzeImage = async () => {
    if (!model || !selectedImage || !imagePreview) {
      return;
    }

    try {
      setIsPredicting(true);
      
      // Load and preprocess the image
      const image = new Image();
      image.src = imagePreview;
      
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      // Create a canvas to resize the image
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Draw and resize image to 224x224
      ctx.drawImage(image, 0, 0, 224, 224);
      
      // Get image data and normalize to 0-1
      const imageData = ctx.getImageData(0, 0, 224, 224);
      
      // Convert image data to tensor and normalize to 0-1
      const tensor = tf.browser.fromPixels(imageData)
        .toFloat()
        .div(tf.scalar(255)) // Normalize to 0-1
        .expandDims(0); // Add batch dimension
      
      // Make prediction
      const predictions = model.predict(tensor) as tf.Tensor;
      const probabilities = await predictions.data();
      
      // Get the index with highest probability
      const maxProbIndex = Array.from(probabilities).indexOf(Math.max(...Array.from(probabilities)));
      const predictedClass = classLabels[maxProbIndex.toString()];
      const confidence = probabilities[maxProbIndex] * 100;
      
      // Set prediction result
      setPrediction({
        label: predictedClass,
        confidence
      });
      
      // Clean up tensors
      tensor.dispose();
      predictions.dispose();
      
    } catch (error) {
      console.error('Error during prediction:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  // Format the predicted label for display
  const formatLabel = (label: string) => {
    return label.replace(/___/g, ' - ').replace(/_/g, ' ');
  };

  // Determine severity level based on prediction
  const getSeverityLevel = (label: string): 'low' | 'medium' | 'high' => {
    if (label.includes('healthy')) return 'low';
    
    // High severity diseases
    const highSeverityKeywords = ['blight', 'virus', 'rot', 'measles', 'greening'];
    for (const keyword of highSeverityKeywords) {
      if (label.toLowerCase().includes(keyword)) return 'high';
    }
    
    // Medium severity for everything else
    return 'medium';
  };

  // Get color for severity level
  const getSeverityColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-orange-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>{t('tfModelTitle', language)}</CardTitle>
        <CardDescription>
          {t('tfModelDescription', language)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Progress value={45} className="my-2" />
            <p className="text-sm text-center text-muted-foreground">
              {t('loadingModel', language)}
            </p>
          </div>
        ) : modelLoadingError ? (
          <div className="p-4 rounded-md bg-red-50 text-red-800">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <h3 className="font-medium">{t('modelLoadError', language)}</h3>
            </div>
            <p className="mt-2 text-sm">{modelLoadingError}</p>
            <p className="mt-2 text-sm">
              {t('checkModelFiles', language)}
            </p>
          </div>
        ) : (
          <>
            <div 
              className={`border-2 border-dashed rounded-lg p-4 text-center 
                ${selectedImage ? 'border-primary' : 'border-gray-300 hover:border-primary'} 
                transition-colors duration-200`}
            >
              {!selectedImage ? (
                <div 
                  className="cursor-pointer flex flex-col items-center justify-center py-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-10 w-10 mb-2 text-gray-400" />
                  <p className="text-sm font-medium">{t('dropImageHere', language)}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('orClickToUpload', language)}</p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG {t('formatsAccepted', language)}</p>
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={imagePreview!}
                    alt="Selected plant"
                    className="max-h-64 max-w-full mx-auto rounded-md"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 rounded-full bg-red-500 text-white p-1 shadow-md hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <input 
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleImageSelect}
                ref={fileInputRef}
              />
            </div>

            {selectedImage && (
              <Button 
                className="w-full" 
                onClick={handleAnalyzeImage}
                disabled={isPredicting}
              >
                {isPredicting ? t('analyzing', language) : t('analyzeImage', language)}
              </Button>
            )}

            {prediction && (
              <div className="mt-4 p-4 border rounded-md">
                <h3 className="font-medium text-lg mb-2">{t('diagnosisResult', language)}</h3>
                
                <div className="flex items-center my-2">
                  <span className="font-medium mr-2">{t('detected', language)}:</span>
                  <span className="font-bold">{formatLabel(prediction.label)}</span>
                </div>
                
                <div className="flex items-center my-2">
                  <span className="font-medium mr-2">{t('confidence', language)}:</span>
                  <span className="font-bold">{prediction.confidence.toFixed(1)}%</span>
                </div>

                <Separator className="my-3" />
                
                <div className="flex items-center my-2">
                  <span className="font-medium mr-2">{t('severity', language)}:</span>
                  <Badge 
                    className={`${getSeverityColor(getSeverityLevel(prediction.label))} text-white`}
                  >
                    {t(getSeverityLevel(prediction.label), language)}
                  </Badge>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-start text-xs text-muted-foreground">
        <p>{t('tfPrivacyNote', language)}</p>
      </CardFooter>
    </Card>
  );
}