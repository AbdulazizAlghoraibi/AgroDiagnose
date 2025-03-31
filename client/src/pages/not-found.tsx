import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { t } from "@/lib/translations";
import { Language } from "@/lib/translations";

interface NotFoundProps {
  language: Language;
}

export default function NotFound({ language }: NotFoundProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              404 - {t("notfound.title", language)}
            </h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            {t("notfound.description", language)}
          </p>
          
          <div className="mt-6">
            <Link href="/">
              <Button className="w-full">
                {t("notfound.back", language)}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
