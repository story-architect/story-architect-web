import React, { useEffect, useState } from 'react';
import { BrainCircuit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import styles from './TransitionScreen.module.css';

interface PatternEmergingScreenProps {
  title: string;
  description: string;
  onContinue: () => void;
}

export const PatternEmergingScreen: React.FC<PatternEmergingScreenProps> = ({ title, description, onContinue }) => {
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation(['common']);
  const displayTitle = title
    .replace(/^Pattern:\s*/, '')
    .replace(/^Emerging Understanding:\s*/, '')
    .replace(/^Compréhension émergente\s*:\s*/, '')
    .replace(/^Mod\u00e8le\s*:\s*/, '')
    .replace(/^Sch\u00e9ma\s*:\s*/, '');

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <div className={`${styles.transitionContainer} ${mounted ? styles.visible : ''}`}>
      <div className={styles.contentWrapper}>
        <div className={styles.iconWrapperPattern}>
          <BrainCircuit className={styles.icon} size={48} />
        </div>

        <div className={styles.headerPattern}>{t('common:discovery.labels.pattern_emerging', 'Pattern Emerging')}</div>

        <h2 className={styles.title}>{displayTitle}</h2>
        <p className={styles.description}>{description}</p>

        <div className={styles.actionWrapper}>
          <Button size="lg" onClick={onContinue}>
            {t('common:discovery.labels.continue_discovery', 'Continue Discovery')}
          </Button>
        </div>
      </div>
    </div>
  );
};
