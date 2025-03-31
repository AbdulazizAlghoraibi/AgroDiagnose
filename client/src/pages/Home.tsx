import { useState } from "react";
import { Link } from "wouter";
import ImageUpload from "@/components/ImageUpload";
import DiagnosisResult from "@/components/DiagnosisResult";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Diagnosis } from "@shared/schema";
import { UploadCloud, History } from "lucide-react";

export default function Home() {
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
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="mb-6 border-b border-neutral-dark w-full flex rounded-none bg-transparent h-auto p-0">
          <TabsTrigger 
            value="upload" 
            className="px-4 py-2 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary-dark data-[state=active]:text-primary-dark text-gray-500 rounded-none bg-transparent"
          >
            <UploadCloud className="h-4 w-4 mr-2" />
            تحميل صورة
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            asChild
            className="px-4 py-2 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary-dark data-[state=active]:text-primary-dark text-gray-500 rounded-none bg-transparent"
          >
            <Link href="/history">
              <History className="h-4 w-4 mr-2" />
              السجل السابق
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
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
