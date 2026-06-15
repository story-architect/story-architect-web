import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import styles from './TransitionScreen.module.css';

interface InsightUnlockedProps {
  title: string;
  description: string;
  onContinue: () => void;
}

export const InsightUnlocked: React.FC<InsightUnlockedProps> = ({ title, description, onContinue }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`${styles.transitionContainer} ${mounted ? styles.visible : ''}`}>
      <div className={styles.contentWrapper}>
        <div className={styles.iconWrapper}>
          <Sparkles className={styles.icon} size={48} />
        </div>
        
        <div className={styles.header}>Insight Unlocked</div>
        
        <h2 className={styles.title}>{title.replace('Insight Unlocked: ', '')}</h2>
        <p className={styles.description}>{description}</p>
        
        <div className={styles.actionWrapper}>
          <Button size="lg" onClick={onContinue}>
            Continue Discovery
          </Button>
        </div>
      </div>
    </div>
  );
};
