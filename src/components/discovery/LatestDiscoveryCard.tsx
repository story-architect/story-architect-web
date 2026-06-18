import React from 'react';
import { Sparkles, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { StoryService } from '../../api/services';
import { RelativeTime } from '../ui/RelativeTime';
import { buildDiscoveryEventCopy, buildEventMetadata } from '../../utils/insightText';
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

  const metadata = buildEventMetadata(t, discovery.event_metadata);

  if (metadata.report_type) {
    // Basic translation for 'Character' or 'Relationship'
    const key = (metadata.report_type as string).toLowerCase();
    metadata.report_type = t(`common:nav.${key}s`) || metadata.report_type;
  }

  const translatedTitle = t(`events:${discovery.event_type}`, metadata);
  const translatedSummary = t(`events:descriptions.${discovery.event_type}`, metadata);
  const eventCopy = buildDiscoveryEventCopy(t, discovery.event_type, discovery.event_metadata);



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
        <p className={styles.quoteText}>{eventCopy.description || translatedSummary as string}</p>
      </div>
      
      <div className={styles.footer}>
        <div className={styles.source}>
          {t('dashboard:labels.source')}: <span>{eventCopy.title || translatedTitle as string}</span>
        </div>
        <div className={styles.timestamp}>
          <Clock size={12} />
          <RelativeTime timestamp={discovery.created_at} />
        </div>
      </div>
    </div>
  );
};
