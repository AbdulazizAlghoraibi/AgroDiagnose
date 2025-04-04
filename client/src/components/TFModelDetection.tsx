import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { t, Language } from '../lib/translations';

interface TFModelDetectionProps {
  language: Language;
}

export default function TFModelDetection({ language }: TFModelDetectionProps) {
  const [, navigate] = useLocation();

  // Redirect to main diagnosis page
  const redirectToMainDiagnosis = () => {
    navigate('/');
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
        <div className="p-4 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <h3 className="font-medium">
              {language === 'ar' 
                ? 'التحليل المحلي غير متوفر حاليًا'
                : 'Local Analysis Not Available'}
            </h3>
          </div>
          <p className="mt-2 text-sm">
            {language === 'ar' 
              ? 'لقد تم تحديث النظام لاستخدام واجهة برمجة التطبيقات على الخادم للحصول على نتائج أكثر دقة.'
              : 'The system has been updated to use server-side API for more accurate results.'}
          </p>
          <Button 
            onClick={redirectToMainDiagnosis}
            className="mt-4"
            variant="secondary"
          >
            {language === 'ar' 
              ? 'العودة إلى الصفحة الرئيسية'
              : 'Return to Main Diagnosis'}
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start text-xs text-muted-foreground">
        <p>
          {language === 'ar'
            ? 'تم تحديث تطبيقنا لاستخدام نماذج تعلم آلي أكثر تقدمًا على الخادم، مما يوفر تشخيصات أكثر دقة ويحافظ على سرية بياناتك.'
            : 'Our app has been updated to use more advanced ML models on the server, providing more accurate diagnoses while maintaining your data privacy.'}
        </p>
      </CardFooter>
    </Card>
  );
}
