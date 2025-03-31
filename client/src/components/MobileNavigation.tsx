import { Link } from "wouter";
import { UploadCloud, History } from "lucide-react";

interface MobileNavigationProps {
  currentPath: string;
}

export default function MobileNavigation({ currentPath }: MobileNavigationProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-up border-t border-neutral-dark">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center py-3 px-5 ${currentPath === "/" ? "text-primary" : "text-gray-500"}`}>
            <UploadCloud className="h-5 w-5" />
            <span className="text-xs mt-1">تحميل</span>
          </a>
        </Link>
        <Link href="/history">
          <a className={`flex flex-col items-center py-3 px-5 ${currentPath === "/history" ? "text-primary" : "text-gray-500"}`}>
            <History className="h-5 w-5" />
            <span className="text-xs mt-1">السجل</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
