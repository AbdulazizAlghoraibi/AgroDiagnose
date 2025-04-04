import { useState } from "react";
import { Link } from "wouter";
import ImageUpload from "@/components/ImageUpload";
import DiagnosisResult from "@/components/DiagnosisResult";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Diagnosis } from "@shared/schema";
import { UploadCloud, History, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/translations";
import { Language } from "@/lib/translations";

interface HomeProps {
  language: Language;
}

export default function Home({ language }: HomeProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<Diagnosis | null>(null);

  // Handle file selection and create a preview URL
  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setDiagnosisResult(null); // Reset any previous diagnosis
  };

  // Clear the selected image and its preview
  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    setDiagnosisResult(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t("home.title", language)}</h1>
      <p className="text-gray-600 mb-6">{t("home.subtitle", language)}</p>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="mb-6 border-b border-neutral-dark w-full flex rounded-none bg-transparent h-auto p-0">
          <TabsTrigger 
            value="upload" 
            className="px-4 py-2 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary-dark data-[state=active]:text-primary-dark text-gray-500 rounded-none bg-transparent"
          >
            <UploadCloud className="h-4 w-4 mr-2" />
            {t("nav.home", language)}
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            asChild
            className="px-4 py-2 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary-dark data-[state=active]:text-primary-dark text-gray-500 rounded-none bg-transparent"
          >
            <Link href="/history">
              <History className="h-4 w-4 mr-2" />
              {t("nav.history", language)}
            </Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="mt-0">
          <div className="md:flex md:space-x-6 md:space-x-reverse">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <ImageUpload 
                selectedImage={selectedImage}
                imagePreview={imagePreview}
                onImageSelect={handleImageSelect}
                onRemoveImage={handleRemoveImage}
                onAnalyzeImage={() => {
                  if (selectedImage) {
                    setIsAnalyzing(true);
                  }
                }}
                language={language}
              />
            </div>

            {(isAnalyzing || diagnosisResult) && (
              <div className="md:w-1/2">
                <DiagnosisResult 
                  isLoading={isAnalyzing} 
                  diagnosis={diagnosisResult}
                  selectedImage={selectedImage}
                  onDiagnosisComplete={(diagnosis) => {
                    setDiagnosisResult(diagnosis);
                    setIsAnalyzing(false);
                  }}
                  language={language}
                />
              </div>
            )}
          </div>
          
          {/* TensorFlow Local Model Section */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cpu className="h-5 w-5 mr-2 text-blue-500" />
                {language === 'ar' 
                  ? 'التحليل المحلي بدون إنترنت'
                  : 'Offline Local Analysis'
                }
              </CardTitle>
              <CardDescription>
                {language === 'ar'
                  ? 'استخدم نموذج TensorFlow.js المحلي لتحليل الصور بدون إنترنت'
                  : 'Use TensorFlow.js local model to analyze images offline'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {language === 'ar'
                  ? 'يمكنك تحليل صور أوراق النباتات محليًا على متصفحك بدون الحاجة إلى اتصال إنترنت بعد تحميل النموذج. هذا النموذج يدعم أكثر من 38 نوعًا من أمراض النباتات.'
                  : 'Analyze plant leaf images locally in your browser without needing an internet connection after the model is loaded. This model supports over 38 plant disease types.'
                }
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="border-blue-300 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900">
                <Link href="/local-model">
                  <Cpu className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'تجربة التحليل المحلي' : 'Try Local Analysis'}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
