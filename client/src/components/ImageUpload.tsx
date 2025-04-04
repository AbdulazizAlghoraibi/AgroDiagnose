import { useRef, useState, DragEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { t } from "@/lib/translations";
import { Language } from "@/lib/translations";

interface ImageUploadProps {
  selectedImage: File | null;
  imagePreview: string | null;
  onImageSelect: (file: File) => void;
  onRemoveImage: () => void;
  onAnalyzeImage: () => void;
  language: Language;
  isLoading?: boolean;
}

export default function ImageUpload({
  selectedImage,
  imagePreview,
  onImageSelect,
  onRemoveImage,
  onAnalyzeImage,
  language,
  isLoading = false
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    validateAndProcessFile(file);
  };

  const validateAndProcessFile = (file: File) => {
    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: language === "ar" ? "نوع ملف غير صالح" : "Invalid file type",
        description: language === "ar" 
          ? "الرجاء تحميل صورة بتنسيق JPG أو PNG فقط."
          : "Please upload only JPG or PNG images.",
      });
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: language === "ar" ? "الملف كبير جدًا" : "File too large",
        description: language === "ar"
          ? "حجم الملف يجب أن يكون أقل من 5 ميجابايت."
          : "File size must be less than 5MB.",
      });
      return;
    }

    onImageSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-md h-full">
      <CardContent className="p-6">
        <h2 className="text-lg font-bold text-primary-dark mb-4">{t("home.upload.title", language)}</h2>
        <p className="text-gray-600 mb-4">{t("home.subtitle", language)}</p>
        
        {!imagePreview ? (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
              isDragging ? "bg-neutral-light border-primary" : "border-neutral-dark hover:bg-neutral-light"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={handleFileSelect}
            />
            <ImagePlus className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="font-medium text-gray-500">{t("home.upload.button", language)}</p>
            <p className="text-sm text-gray-400 mt-2">{t("home.upload.subtitle", language)}</p>
          </div>
        ) : (
          <div className="mt-4">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Plant preview"
                className="w-full rounded-lg object-cover max-h-64"
              />
              <button
                onClick={onRemoveImage}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
              >
                <X className="h-5 w-5 text-status-error" />
              </button>
            </div>
            <Button
              onClick={onAnalyzeImage}
              disabled={isLoading}
              className="mt-4 w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg flex items-center justify-center transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("analyzing", language)}
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  {t("analyzeImage", language)}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
