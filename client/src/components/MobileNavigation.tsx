import { Link } from "wouter";
import { UploadCloud, History, Cpu } from "lucide-react";
import { t } from "@/lib/translations";
import { Language } from "@/lib/translations";

interface MobileNavigationProps {
  currentPath: string;
  language: Language;
}

export default function MobileNavigation({ currentPath, language }: MobileNavigationProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-up border-t border-neutral-dark">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center py-3 px-3 ${currentPath === "/" ? "text-primary" : "text-gray-500"}`}>
            <UploadCloud className="h-5 w-5" />
            <span className="text-xs mt-1">{t("nav.home", language)}</span>
          </a>
        </Link>
        <Link href="/history">
          <a className={`flex flex-col items-center py-3 px-3 ${currentPath === "/history" ? "text-primary" : "text-gray-500"}`}>
            <History className="h-5 w-5" />
            <span className="text-xs mt-1">{t("nav.history", language)}</span>
          </a>
        </Link>
        <Link href="/local-model">
          <a className={`flex flex-col items-center py-3 px-3 ${currentPath === "/local-model" ? "text-primary" : "text-gray-500"}`}>
            <Cpu className="h-5 w-5" />
            <span className="text-xs mt-1">{t("nav.local", language)}</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
