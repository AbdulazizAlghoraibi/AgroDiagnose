import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck2, Stethoscope, User } from "lucide-react"; // Using available icons
import { Diagnosis } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DiagnosisResultProps {
  isLoading: boolean;
  diagnosis: Diagnosis | null;
  selectedImage: File | null;
  onDiagnosisComplete: (diagnosis: Diagnosis) => void;
}

export default function DiagnosisResult({
  isLoading,
  diagnosis,
  selectedImage,
  onDiagnosisComplete,
}: DiagnosisResultProps) {
  // Mutation for uploading and analyzing image
  const analyzeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/diagnose", formData);
      return await response.json();
    },
    onSuccess: (data: Diagnosis) => {
      onDiagnosisComplete(data);
      queryClient.invalidateQueries({ queryKey: ["/api/diagnoses"] });
    },
  });

  // Format the timestamp to a readable format
  const formatDate = (timestamp: Date) => {
    // For Arabic format
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Convert severity level to Arabic text
  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "low":
        return "منخفضة الخطورة";
      case "medium":
        return "متوسطة الخطورة";
      case "high":
        return "عالية الخطورة";
      default:
        return "غير معروفة";
    }
  };

  // When isLoading becomes true, upload and analyze the image
  useEffect(() => {
    if (isLoading && selectedImage && !analyzeMutation.isPending) {
      const formData = new FormData();
      formData.append("image", selectedImage);
      analyzeMutation.mutate(formData);
    }
  }, [isLoading, selectedImage, analyzeMutation]);

  return (
    <Card className="bg-white rounded-lg shadow-md h-full">
      <CardContent className="p-6">
        {analyzeMutation.isPending || isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500 font-medium">جاري تحليل الصورة...</p>
          </div>
        ) : diagnosis ? (
          <div>
            <div className="flex items-center mb-4">
              <FileCheck2 className="text-status-info mr-2 h-5 w-5" />
              <h2 className="text-lg font-bold text-primary-dark">نتيجة التحليل</h2>
            </div>
            
            <div className="mb-4 p-3 bg-status-info/10 rounded-lg border border-status-info/30">
              <h3 className="font-bold text-status-info text-lg">{diagnosis.diseaseName}</h3>
              <p className="text-sm text-gray-500">{formatDate(diagnosis.timestamp)}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-bold text-gray-700 mb-2">الوصف:</h4>
              <p className="text-gray-600">{diagnosis.description}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-bold text-gray-700 mb-2">درجة الخطورة:</h4>
              <div className="w-full bg-neutral-light rounded-full h-4">
                <div 
                  className={`h-4 rounded-full ${
                    diagnosis.severity === "high" 
                      ? "bg-status-error" 
                      : diagnosis.severity === "medium" 
                        ? "bg-status-warning" 
                        : "bg-status-success"
                  }`}
                  style={{ width: `${diagnosis.severityScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>منخفضة</span>
                <span>متوسطة</span>
                <span>عالية</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button className="bg-secondary text-white py-2 px-4 rounded-lg flex items-center justify-center hover:bg-secondary-dark transition">
                <Stethoscope className="mr-2 h-5 w-5" />
                الحصول على توصيات العلاج
              </Button>
              <Button variant="outline" className="border border-primary text-primary py-2 px-4 rounded-lg flex items-center justify-center hover:bg-neutral-light transition">
                <User className="mr-2 h-5 w-5" />
                التحدث مع خبير زراعي
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
