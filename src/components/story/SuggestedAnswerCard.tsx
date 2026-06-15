import React from 'react';
import { Card } from '../ui/Card';
import styles from './SuggestedAnswerCard.module.css';

interface SuggestedAnswerCardProps {
  text: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

export const SuggestedAnswerCard: React.FC<SuggestedAnswerCardProps> = ({
  text,
  icon,
  selected,
  onClick,
}) => {
  return (
    <Card 
      hoverable 
      onClick={onClick}
      className={`${styles.card} ${selected ? styles.selected : ''}`}
    >
      {icon && <div className={styles.icon}>{icon}</div>}
      <p className={styles.text}>{text}</p>
    </Card>
  );
};
