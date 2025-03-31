import { t } from "@/lib/translations";

interface FooterProps {
  language: "ar" | "en";
}

export default function Footer({ language }: FooterProps) {
  // Get current year dynamically
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary-dark text-white p-4 text-center text-sm">
      <p>
        {`© ${currentYear} - ${t("app.footer", language)}`}
      </p>
    </footer>
  );
}
