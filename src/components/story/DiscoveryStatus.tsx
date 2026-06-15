import React from 'react';
import { CheckCircle2, Circle, CircleDashed } from 'lucide-react';
import styles from './DiscoveryStatus.module.css';

export type StatusState = 'found' | 'emerging' | 'forming' | 'hidden';

export interface StatusItem {
  id: string;
  label: string;
  state: StatusState;
}

interface DiscoveryStatusProps {
  items: StatusItem[];
}

export const DiscoveryStatus: React.FC<DiscoveryStatusProps> = ({ items }) => {
  return (
    <div className={styles.container}>
      <div className={styles.line}></div>
      {items.map((item) => (
        <div key={item.id} className={`${styles.item} ${styles[item.state]}`}>
          <div className={styles.iconContainer}>
            {item.state === 'found' && <CheckCircle2 size={24} className={styles.iconFound} />}
            {item.state === 'emerging' && <CheckCircle2 size={24} className={styles.iconEmerging} />}
            {item.state === 'forming' && <Circle size={24} className={styles.iconForming} />}
            {item.state === 'hidden' && <CircleDashed size={24} className={styles.iconHidden} />}
          </div>
          <span className={styles.label}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};
