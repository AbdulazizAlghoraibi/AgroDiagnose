interface FooterProps {
  language: "ar" | "en";
}

export default function Footer({ language }: FooterProps) {
  return (
    <footer className="bg-primary-dark text-white p-4 text-center text-sm">
      <p>
        {language === "ar" 
          ? "© 2023 - نظام الكشف عن أمراض النباتات للمزارعين التجاريين في المملكة العربية السعودية"
          : "© 2023 - Plant Disease Detection System for Commercial Farmers in Saudi Arabia"}
      </p>
    </footer>
  );
}
