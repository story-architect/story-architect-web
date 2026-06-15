import React from 'react';
import { Card } from '../ui/Card';
import styles from './InsightCard.module.css';

interface InsightCardProps {
  label?: string;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  isGlowing?: boolean;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  label,
  title,
  children,
  icon,
  className = '',
  isGlowing = false,
}) => {
  return (
    <Card className={`${styles.insightCard} ${isGlowing ? styles.glowing : ''} ${className}`}>
      {icon && <div className={styles.iconContainer}>{icon}</div>}
      {label && <div className={styles.label}>{label}</div>}
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.content}>{children}</div>
    </Card>
  );
};
