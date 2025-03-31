import { Globe } from "lucide-react";
import { t } from "@/lib/translations";

interface HeaderProps {
  language: "ar" | "en";
  setLanguage: (lang: "ar" | "en") => void;
}

export default function Header({ language, setLanguage }: HeaderProps) {
  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  return (
    <header className="bg-primary p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <span className="material-icons text-white mr-2">eco</span>
          <h1 className="text-xl font-bold text-white">
            {t("app.title", language)}
          </h1>
        </div>
        <button 
          onClick={toggleLanguage}
          className="px-3 py-1 rounded-full bg-white/20 text-white text-sm flex items-center"
        >
          <Globe className="h-4 w-4 mr-1" />
          {t("nav.language", language)}
        </button>
      </div>
    </header>
  );
}
