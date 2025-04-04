import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Language, t } from '../lib/translations';
import { useIsMobile } from '../hooks/use-mobile';
import TFModelDetection from '../components/TFModelDetection';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface LocalModelDetectionProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export default function LocalModelDetection({ language, setLanguage }: LocalModelDetectionProps) {
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();

  // Set document title when language changes
  useEffect(() => {
    document.title = `${t('tfModelTitle', language)} | ${t('app.title', language)}`;
  }, [language]);

  return (
    <div className={`min-h-screen flex flex-col ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button 
            variant="outline"
            onClick={() => setLocation('/')}
            className="mb-4"
          >
            ← {t('nav.home', language)}
          </Button>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">{t('tfModelTitle', language)}</CardTitle>
              <CardDescription>
                {t('tfModelDescription', language)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                {language === 'ar' 
                  ? 'هذا النموذج يستخدم TensorFlow.js المحلي ويعمل بالكامل في المتصفح. يمكنك تحميل صورة ورقة نبات والحصول على تحليل سريع دون الحاجة إلى اتصال بالإنترنت بعد تحميل النموذج.'
                  : 'This model uses local TensorFlow.js and runs entirely in your browser. You can upload a plant leaf image and get a quick analysis without needing an internet connection after the model is loaded.'
                }
              </p>
            </CardContent>
          </Card>
          
          <TFModelDetection language={language} />
          
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'يمكنك العودة إلى الصفحة الرئيسية لاستخدام النموذج المتصل بالإنترنت للحصول على نتائج أكثر دقة.'
                    : 'You can return to the home page to use the online model for more accurate results.'
                  }
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/')}
                  className="w-full sm:w-auto"
                >
                  {t('nav.home', language)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer language={language} />
    </div>
  );
}