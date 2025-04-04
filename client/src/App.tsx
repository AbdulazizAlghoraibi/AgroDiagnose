import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import DiagnosisHistory from "@/pages/DiagnosisHistory";
import LocalModelDetection from "@/pages/LocalModelDetection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNavigation from "@/components/MobileNavigation";
import { useEffect, useState, createContext } from "react";
import { Language } from "@/lib/translations";

// Create a context for language so all components can access it
export const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
}>({
  language: "ar",
  setLanguage: () => {},
});

function Router() {
  const [location] = useLocation();
  const [language, setLanguage] = useState<Language>("ar");

  useEffect(() => {
    // Update the document's language and direction based on the selected language
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <div className="flex flex-col min-h-screen">
        <Header language={language} setLanguage={setLanguage} />
        <main className="flex-grow container mx-auto p-4 md:p-6">
          <Switch>
            <Route path="/">
              <Home language={language} />
            </Route>
            <Route path="/history">
              <DiagnosisHistory language={language} />
            </Route>
            <Route path="/local-model">
              <LocalModelDetection language={language} setLanguage={setLanguage} />
            </Route>
            <Route>
              <NotFound language={language} />
            </Route>
          </Switch>
        </main>
        <Footer language={language} />
        <MobileNavigation currentPath={location} language={language} />
      </div>
    </LanguageContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
