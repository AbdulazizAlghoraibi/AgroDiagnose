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
                isLoading={isAnalyzing}
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
          
          {/* Server API Info Section */}
          <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-100 dark:border-green-900">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cpu className="h-5 w-5 mr-2 text-green-500" />
                {language === 'ar' 
                  ? 'تحليل متقدم للأمراض النباتية'
                  : 'Advanced Plant Disease Analysis'
                }
              </CardTitle>
              <CardDescription>
                {language === 'ar'
                  ? 'نستخدم نماذج تعلم آلي متقدمة على الخادم لتوفير تشخيصات دقيقة'
                  : 'We use advanced machine learning models running on our server to provide accurate diagnoses'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {language === 'ar'
                  ? 'يستخدم نظامنا نماذج التعلم العميق المدربة على آلاف الصور لتحديد أمراض النبات بدقة وتقديم توصيات مفيدة للمزارعين.'
                  : 'Our system uses deep learning models trained on thousands of images to accurately identify plant diseases and provide useful recommendations for farmers.'
                }
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
