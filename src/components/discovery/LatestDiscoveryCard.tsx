import React from 'react';
import { Sparkles, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { StoryService } from '../../api/services';
import { useBackendTranslation } from '../../hooks/useBackendTranslation';
import styles from './LatestDiscoveryCard.module.css';

interface LatestDiscoveryCardProps {
  storyId: string | null;
  className?: string;
}

export const LatestDiscoveryCard: React.FC<LatestDiscoveryCardProps> = ({ storyId, className }) => {
  const { t } = useTranslation();
  const { translateEvent } = useBackendTranslation();

  const { data: discovery, isLoading } = useQuery({
    queryKey: ['latest-discovery', storyId],
    queryFn: () => StoryService.getLatestDiscovery(storyId!),
    enabled: !!storyId,
  });

  if (isLoading) {
    return (
      <div className={`${styles.cardContainer} ${className || ''}`}>
        <div className={styles.loading}>{t('dashboard.loading_stories')}</div>
      </div>
    );
  }

  if (!discovery) {
    return null; // Don't show the card if there's no discovery yet
  }

  const { title: translatedTitle, description: translatedSummary } = translateEvent(discovery.title, discovery.summary);

  // Format relative time (e.g., "15 mins ago")
  const getRelativeTime = (isoString: string) => {
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return t('dashboard.mins_ago', { count: Math.max(1, minutes) });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('dashboard.hours_ago', { count: hours });
    return t('dashboard.days_ago', { count: Math.floor(hours / 24) });
  };

  return (
    <div className={`${styles.cardContainer} ${className || ''}`}>
      <div className={styles.header}>
        <span className={styles.badge}>
          <Sparkles size={14} />
          {t('dashboard.latest_discovery')}
        </span>
      </div>
      
      <div className={styles.quoteContainer}>
        <span className={styles.quoteMark}>"</span>
        <p className={styles.quoteText}>{translatedSummary}</p>
      </div>
      
      <div className={styles.footer}>
        <div className={styles.source}>
          {t('dashboard.source')}: <span>{translatedTitle}</span>
        </div>
        <div className={styles.timestamp}>
          <Clock size={12} />
          {getRelativeTime(discovery.created_at)}
        </div>
      </div>
    </div>
  );
};
