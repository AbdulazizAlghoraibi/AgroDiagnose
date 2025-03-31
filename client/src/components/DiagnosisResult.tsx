import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck2, Stethoscope, User } from "lucide-react"; // Using available icons
import { Diagnosis } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { t, formatDate } from "@/lib/translations";
import { Language } from "@/lib/translations";

interface DiagnosisResultProps {
  isLoading: boolean;
  diagnosis: Diagnosis | null;
  selectedImage: File | null;
  onDiagnosisComplete: (diagnosis: Diagnosis) => void;
  language: Language;
}

export default function DiagnosisResult({
  isLoading,
  diagnosis,
  selectedImage,
  onDiagnosisComplete,
  language
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

  // Get appropriate description based on language
  const getDescription = () => {
    if (!diagnosis) return "";
    
    const descriptions = diagnosis.description.split('\n');
    if (language === "ar" && descriptions.length > 0) {
      return descriptions[0]; // Arabic description first
    } else if (language === "en" && descriptions.length > 1) {
      return descriptions[1]; // English description second
    }
    return diagnosis.description; // Fallback to whatever is available
  };

  // Get severity text based on language
  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "low":
        return t("diagnosis.severity.low", language);
      case "medium":
        return t("diagnosis.severity.medium", language);
      case "high":
        return t("diagnosis.severity.high", language);
      default:
        return severity;
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
            <p className="mt-4 text-gray-500 font-medium">{t("diagnosis.loading", language)}</p>
          </div>
        ) : diagnosis ? (
          <div>
            <div className="flex items-center mb-4">
              <FileCheck2 className="text-status-info mr-2 h-5 w-5" />
              <h2 className="text-lg font-bold text-primary-dark">{t("diagnosis.title", language)}</h2>
            </div>
            
            <div className="mb-4 p-3 bg-status-info/10 rounded-lg border border-status-info/30">
              <h3 className="font-bold text-status-info text-lg">{diagnosis.diseaseName}</h3>
              <p className="text-sm text-gray-500">{formatDate(diagnosis.timestamp, language)}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-bold text-gray-700 mb-2">{t("diagnosis.description", language)}</h4>
              <p className="text-gray-600">{getDescription()}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-bold text-gray-700 mb-2">{t("diagnosis.severity", language)}</h4>
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
              {/* Severity indicator labels with highlighted current level */}
              <div className="flex justify-between text-xs mt-2">
                <div className={`flex flex-col items-center ${diagnosis.severity === "low" ? "font-bold" : ""}`}>
                  <div className={`w-3 h-3 rounded-full mb-1 ${diagnosis.severity === "low" ? "bg-status-success ring-2 ring-status-success ring-opacity-50" : "bg-status-success opacity-70"}`}></div>
                  <span className={`${diagnosis.severity === "low" ? "text-status-success" : "text-gray-500"}`}>
                    {t("diagnosis.severity.low", language)}
                  </span>
                </div>
                <div className={`flex flex-col items-center ${diagnosis.severity === "medium" ? "font-bold" : ""}`}>
                  <div className={`w-3 h-3 rounded-full mb-1 ${diagnosis.severity === "medium" ? "bg-status-warning ring-2 ring-status-warning ring-opacity-50" : "bg-status-warning opacity-70"}`}></div>
                  <span className={`${diagnosis.severity === "medium" ? "text-status-warning" : "text-gray-500"}`}>
                    {t("diagnosis.severity.medium", language)}
                  </span>
                </div>
                <div className={`flex flex-col items-center ${diagnosis.severity === "high" ? "font-bold" : ""}`}>
                  <div className={`w-3 h-3 rounded-full mb-1 ${diagnosis.severity === "high" ? "bg-status-error ring-2 ring-status-error ring-opacity-50" : "bg-status-error opacity-70"}`}></div>
                  <span className={`${diagnosis.severity === "high" ? "text-status-error" : "text-gray-500"}`}>
                    {t("diagnosis.severity.high", language)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button className="bg-secondary text-white py-2 px-4 rounded-lg flex items-center justify-center hover:bg-secondary-dark transition">
                <Stethoscope className="mr-2 h-5 w-5" />
                {t("diagnosis.recommendations", language)}
              </Button>
              <Button variant="outline" className="border border-primary text-primary py-2 px-4 rounded-lg flex items-center justify-center hover:bg-neutral-light transition">
                <User className="mr-2 h-5 w-5" />
                {t("diagnosis.expert", language)}
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
