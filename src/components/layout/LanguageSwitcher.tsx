import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import styles from './LanguageSwitcher.module.css';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button className={styles.switcher} onClick={toggleLanguage} title="Switch Language">
      <Globe size={16} />
      <span className={styles.langText}>{i18n.language.toUpperCase()}</span>
    </button>
  );
};
