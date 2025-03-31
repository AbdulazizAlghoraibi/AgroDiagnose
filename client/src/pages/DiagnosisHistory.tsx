import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, History, ImagePlus } from "lucide-react";
import HistoryItem from "@/components/HistoryItem";
import { Button } from "@/components/ui/button";
import { Diagnosis } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function DiagnosisHistory() {
  // Fetch diagnosis history
  const { data: diagnoses, isLoading } = useQuery<Diagnosis[]>({
    queryKey: ["/api/diagnoses"],
  });

  return (
    <div>
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="mb-6 border-b border-neutral-dark w-full flex rounded-none bg-transparent h-auto p-0">
          <TabsTrigger 
            value="upload"
            asChild
            className="px-4 py-2 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary-dark data-[state=active]:text-primary-dark text-gray-500 rounded-none bg-transparent"
          >
            <Link href="/">
              <UploadCloud className="h-4 w-4 mr-2" />
              تحميل صورة
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="px-4 py-2 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary-dark data-[state=active]:text-primary-dark text-gray-500 rounded-none bg-transparent"
          >
            <History className="h-4 w-4 mr-2" />
            السجل السابق
          </TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="mt-0">
          <h2 className="text-xl font-bold text-primary-dark mb-4">سجل التشخيصات السابقة</h2>
          
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
              <HistoryItem key={diagnosis.id} diagnosis={diagnosis} />
            ))
          ) : (
            // Empty state
            <div className="text-center py-12">
              <History className="mx-auto text-4xl text-gray-300" />
              <p className="mt-2 text-gray-500">لا توجد تشخيصات سابقة</p>
              <Button 
                asChild
                className="mt-4 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg inline-flex items-center transition"
              >
                <Link href="/">
                  <ImagePlus className="mr-2 h-4 w-4" />
                  ابدأ التشخيص الأول
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
