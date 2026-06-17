import React from 'react';
import { Sparkles, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { StoryService } from '../../api/services';
import { RelativeTime } from '../ui/RelativeTime';
import styles from './LatestDiscoveryCard.module.css';

interface LatestDiscoveryCardProps {
  storyId: string | null;
  className?: string;
}

export const LatestDiscoveryCard: React.FC<LatestDiscoveryCardProps> = ({ storyId, className }) => {
  const { t } = useTranslation(['dashboard', 'events', 'insights', 'common']);

  const { data: discovery, isLoading } = useQuery({
    queryKey: ['latest-discovery', storyId],
    queryFn: () => StoryService.getLatestDiscovery(storyId!),
    enabled: !!storyId,
  });

  if (isLoading) {
    return (
      <div className={`${styles.cardContainer} ${className || ''}`}>
        <div className={styles.loading}>{t('dashboard:loading_stories')}</div>
      </div>
    );
  }

  if (!discovery) {
    return null; // Don't show the card if there's no discovery yet
  }

  const metadata = { ...discovery.event_metadata };
  
  if (metadata.pattern_key) {
    metadata.pattern_key = t((metadata.pattern_key as string).replace('insights.', ''), { ns: 'insights' });
  }

  if (metadata.insight_key) {
    metadata.insight_key = t((metadata.insight_key as string).replace('insights.', ''), { ns: 'insights' });
  }

  if (metadata.report_type) {
    // Basic translation for 'Character' or 'Relationship'
    const key = (metadata.report_type as string).toLowerCase();
    metadata.report_type = t(`common:nav.${key}s`) || metadata.report_type;
  }

  const translatedTitle = t(`events:${discovery.event_type}`, metadata);
  const translatedSummary = t(`events:descriptions.${discovery.event_type}`, metadata);



  return (
    <div className={`${styles.cardContainer} ${className || ''}`}>
      <div className={styles.header}>
        <span className={styles.badge}>
          <Sparkles size={14} />
          {t('dashboard:titles.latest_discovery')}
        </span>
      </div>
      
      <div className={styles.quoteContainer}>
        <span className={styles.quoteMark}>"</span>
        <p className={styles.quoteText}>{translatedSummary as string}</p>
      </div>
      
      <div className={styles.footer}>
        <div className={styles.source}>
          {t('dashboard:labels.source')}: <span>{translatedTitle as string}</span>
        </div>
        <div className={styles.timestamp}>
          <Clock size={12} />
          <RelativeTime timestamp={discovery.created_at} />
        </div>
      </div>
    </div>
  );
};
