import { Diagnosis } from "@shared/schema";
import { t, formatDate } from "@/lib/translations";
import { Language } from "@/lib/translations";

interface HistoryItemProps {
  diagnosis: Diagnosis;
  language: Language;
}

export default function HistoryItem({ diagnosis, language }: HistoryItemProps) {
  // Get CSS classes for severity badge
  const getSeverityBadgeClasses = (severity: string) => {
    let baseClasses = "inline-block px-2 py-1 text-xs rounded-full ";
    
    switch (severity) {
      case "low":
        return baseClasses + "bg-status-success/20 text-status-success";
      case "medium":
        return baseClasses + "bg-status-warning/20 text-status-warning";
      case "high":
        return baseClasses + "bg-status-error/20 text-status-error";
      default:
        return baseClasses + "bg-gray-200 text-gray-700";
    }
  };

  // Get severity text based on language
  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "low":
        return t("diagnosis.severity.low", language);
      case "medium":
        return t("diagnosis.severity.medium", language);
      case "high":
        return t("diagnosis.severity.high", language);
      default:
        return severity;
    }
  };

  // Get appropriate description based on language
  const getDescription = () => {
    const descriptions = diagnosis.description.split('\n');
    if (language === "ar" && descriptions.length > 0) {
      return descriptions[0]; // Arabic description first
    } else if (language === "en" && descriptions.length > 1) {
      return descriptions[1]; // English description second
    }
    return diagnosis.description; // Fallback to whatever is available
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-start">
        <img 
          src={diagnosis.imageUrl} 
          alt="Plant thumbnail" 
          className="w-20 h-20 object-cover rounded-lg"
        />
        <div className="flex-grow mr-3">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-primary-dark">{diagnosis.diseaseName}</h3>
            <span className="text-xs text-gray-500">
              {t("history.date", language)} {diagnosis && diagnosis.timestamp ? formatDate(diagnosis.timestamp, language) : formatDate(new Date(), language)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {getDescription()}
          </p>
          <div className="flex mt-2">
            <span className={getSeverityBadgeClasses(diagnosis.severity)}>
              {t("diagnosis.severity", language)} {getSeverityText(diagnosis.severity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
