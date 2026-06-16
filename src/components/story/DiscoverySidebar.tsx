import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './DiscoverySidebar.module.css';

interface DiscoveryStep {
  label: string;
  isComplete: boolean;
  isGlowing?: boolean;
}

interface DiscoverySidebarProps {
  name: string;
  role: string;
  quote?: string;
  steps: DiscoveryStep[];
}

export const DiscoverySidebar: React.FC<DiscoverySidebarProps> = ({
  name,
  role,
  quote,
  steps
}) => {
  const { t } = useTranslation(['common']);
  return (
    <div className={styles.sidebar}>
      <div className={styles.portraitContainer}>
        <div className={styles.portraitPlaceholder}>
          <UserSilhouette />
        </div>
        <div className={styles.portraitDecoration}>✦</div>
      </div>
      
      <div className={styles.identity}>
        <h2 className={styles.name}>{name}</h2>
        <div className={styles.ornament}>❧</div>
        <p className={styles.role}>{role}</p>
      </div>

      <div className={styles.summaryContainer}>
        <h3 className={styles.summaryTitle}>{t('reports.discovery_summary', 'DISCOVERY SUMMARY')}</h3>
        <div className={styles.steps}>
          {steps.map((step, index) => (
            <div key={index} className={`${styles.step} ${step.isGlowing ? styles.stepGlowing : ''}`}>
              <div className={`${styles.stepIcon} ${step.isComplete ? styles.stepComplete : ''}`}>
                {step.isGlowing ? <span className={styles.glowingStar}>✦</span> : <Check size={14} />}
              </div>
              <div className={styles.stepText}>
                <span className={styles.stepLabel}>{step.label}</span>
                <span className={styles.stepStatus}>{step.isComplete ? t('reports.revealed', 'Revealed') : t('reports.pending', 'Pending')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {quote && (
        <div className={styles.quoteContainer}>
          <div className={styles.quoteMark}>"</div>
          <p className={styles.quote}>{quote}</p>
          <div className={styles.quoteDecoration}>✦</div>
        </div>
      )}
    </div>
  );
};

const UserSilhouette = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--color-border)', opacity: 0.5}}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
