import React, { useEffect, useState } from 'react';
import { BrainCircuit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './PatternEmergingOverlay.module.css';

interface PatternEmergingOverlayProps {
  message: string;
  onContinue: () => void;
}

export const PatternEmergingOverlay: React.FC<PatternEmergingOverlayProps> = ({ message, onContinue }) => {
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation(['common']);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  if (!mounted) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <BrainCircuit size={40} />
        </div>
        <span className={styles.badge}>{t('common:discovery.labels.pattern_emerging', 'Pattern Emerging')}</span>
        <p className={styles.description}>{message}</p>
        <button className={styles.actionButton} onClick={onContinue}>
          {t('common:discovery.labels.continue_discovery', 'Continue Discovery')}
        </button>
      </div>
    </div>
  );
};
