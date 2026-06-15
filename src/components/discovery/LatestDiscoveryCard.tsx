import React from 'react';
import { Sparkles, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StoryService } from '../../api/services';
import styles from './LatestDiscoveryCard.module.css';

interface LatestDiscoveryCardProps {
  storyId: string | null;
  className?: string;
}

export const LatestDiscoveryCard: React.FC<LatestDiscoveryCardProps> = ({ storyId, className }) => {
  const { data: discovery, isLoading } = useQuery({
    queryKey: ['latest-discovery', storyId],
    queryFn: () => StoryService.getLatestDiscovery(storyId!),
    enabled: !!storyId,
  });

  if (isLoading) {
    return (
      <div className={`${styles.cardContainer} ${className || ''}`}>
        <div className={styles.loading}>Uncovering latest insight...</div>
      </div>
    );
  }

  if (!discovery) {
    return null; // Don't show the card if there's no discovery yet
  }

  // Format relative time (e.g., "15 mins ago")
  const getRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <div className={`${styles.cardContainer} ${className || ''}`}>
      <div className={styles.header}>
        <span className={styles.badge}>
          <Sparkles size={14} />
          Latest Discovery
        </span>
      </div>
      
      <div className={styles.quoteContainer}>
        <span className={styles.quoteMark}>"</span>
        <p className={styles.quoteText}>{discovery.summary}</p>
      </div>
      
      <div className={styles.footer}>
        <div className={styles.source}>
          Source: <span>{discovery.title}</span>
        </div>
        <div className={styles.timestamp}>
          <Clock size={12} />
          {getRelativeTime(discovery.created_at)}
        </div>
      </div>
    </div>
  );
};
