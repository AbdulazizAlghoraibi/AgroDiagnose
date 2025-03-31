import { Diagnosis } from "@shared/schema";

interface HistoryItemProps {
  diagnosis: Diagnosis;
}

export default function HistoryItem({ diagnosis }: HistoryItemProps) {
  // Format the timestamp to a readable format
  const formatDate = (timestamp: Date) => {
    // For Arabic format
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

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

  // Convert severity level to Arabic text
  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "low":
        return "منخفضة الخطورة";
      case "medium":
        return "متوسطة الخطورة";
      case "high":
        return "عالية الخطورة";
      default:
        return "غير معروفة";
    }
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
            <span className="text-xs text-gray-500">{formatDate(diagnosis.timestamp)}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {diagnosis.description.split('\n')[0]} {/* Show only the Arabic description */}
          </p>
          <div className="flex mt-2">
            <span className={getSeverityBadgeClasses(diagnosis.severity)}>
              {getSeverityText(diagnosis.severity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
