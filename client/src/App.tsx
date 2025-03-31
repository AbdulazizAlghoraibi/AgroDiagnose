import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import DiagnosisHistory from "@/pages/DiagnosisHistory";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNavigation from "@/components/MobileNavigation";
import { useEffect, useState } from "react";

function Router() {
  const [location] = useLocation();
  const [language, setLanguage] = useState<"ar" | "en">("ar");

  useEffect(() => {
    // Update the document's language and direction based on the selected language
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header language={language} setLanguage={setLanguage} />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/history" component={DiagnosisHistory} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer language={language} />
      <MobileNavigation currentPath={location} />
    </div>
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
