import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Language, t } from '../lib/translations';

interface LocalModelDetectionProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export default function LocalModelDetection({ language }: LocalModelDetectionProps) {
  const [, setLocation] = useLocation();

  // Automatically redirect to the home page
  useEffect(() => {
    // Set a small timeout to ensure the redirect happens after the component mounts
    const redirectTimer = setTimeout(() => {
      setLocation('/');
    }, 100);

    return () => clearTimeout(redirectTimer);
  }, [setLocation]);

  return null; // No UI needed as we're redirecting
}