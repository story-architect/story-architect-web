import React, { useEffect, useState } from 'react';
import { BrainCircuit } from 'lucide-react';
import { Button } from '../ui/Button';
import styles from './TransitionScreen.module.css';

interface PatternEmergingScreenProps {
  title: string;
  description: string;
  onContinue: () => void;
}

export const PatternEmergingScreen: React.FC<PatternEmergingScreenProps> = ({ title, description, onContinue }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`${styles.transitionContainer} ${mounted ? styles.visible : ''}`}>
      <div className={styles.contentWrapper}>
        <div className={styles.iconWrapperPattern}>
          <BrainCircuit className={styles.icon} size={48} />
        </div>
        
        <div className={styles.headerPattern}>Pattern Emerging</div>
        
        <h2 className={styles.title}>{title.replace('Pattern: ', '')}</h2>
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
