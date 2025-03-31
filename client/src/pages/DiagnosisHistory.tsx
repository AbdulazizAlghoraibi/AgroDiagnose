import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, History, ImagePlus } from "lucide-react";
import HistoryItem from "@/components/HistoryItem";
import { Button } from "@/components/ui/button";
import { Diagnosis } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/lib/translations";
import { Language } from "@/lib/translations";

interface DiagnosisHistoryProps {
  language: Language;
}

export default function DiagnosisHistory({ language }: DiagnosisHistoryProps) {
  // Fetch diagnosis history
  const { data: diagnoses, isLoading } = useQuery<Diagnosis[]>({
    queryKey: ["/api/diagnoses"],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t("history.title", language)}</h1>
      
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="mb-6 border-b border-neutral-dark w-full flex rounded-none bg-transparent h-auto p-0">
          <TabsTrigger 
            value="upload"
            asChild
            className="px-4 py-2 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary-dark data-[state=active]:text-primary-dark text-gray-500 rounded-none bg-transparent"
          >
            <Link href="/">
              <UploadCloud className="h-4 w-4 mr-2" />
              {t("nav.home", language)}
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="px-4 py-2 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary-dark data-[state=active]:text-primary-dark text-gray-500 rounded-none bg-transparent"
          >
            <History className="h-4 w-4 mr-2" />
            {t("nav.history", language)}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="mt-0">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 mb-4">
                <div className="flex items-start">
                  <Skeleton className="w-20 h-20 rounded-lg" />
                  <div className="flex-grow mr-3">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                    <div className="mt-2">
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : diagnoses && diagnoses.length > 0 ? (
            // Diagnosis history list
            diagnoses.map((diagnosis) => (
              <HistoryItem key={diagnosis.id} diagnosis={diagnosis} language={language} />
            ))
          ) : (
            // Empty state
            <div className="text-center py-12">
              <History className="mx-auto text-4xl text-gray-300" />
              <p className="mt-2 text-gray-500">{t("history.empty", language)}</p>
              <Button 
                asChild
                className="mt-4 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg inline-flex items-center transition"
              >
                <Link href="/">
                  <ImagePlus className="mr-2 h-4 w-4" />
                  {t("history.start", language)}
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
