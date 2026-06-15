import React from 'react';
import { Clock, UserPlus, Link2, Sparkles, BrainCircuit, FileText, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StoryService } from '../../api/services';
import type { EventTypeEnum } from '../../types';
import styles from './StoryActivityFeed.module.css';

interface StoryActivityFeedProps {
  storyId: string | null;
  className?: string;
}

export const StoryActivityFeed: React.FC<StoryActivityFeedProps> = ({ storyId, className }) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activity-feed', storyId],
    queryFn: () => StoryService.getActivityFeed(storyId!),
    enabled: !!storyId,
  });

  const getIcon = (type: EventTypeEnum | string) => {
    switch (type) {
      case 'CHARACTER_CREATED': return <UserPlus size={18} />;
      case 'RELATIONSHIP_CREATED': return <Link2 size={18} />;
      case 'DISCOVERY_COMPLETED': return <CheckCircle size={18} />;
      case 'PATTERN_EMERGING': return <BrainCircuit size={18} />;
      case 'INSIGHT_UNLOCKED': return <Sparkles size={18} />;
      case 'REPORT_GENERATED': return <FileText size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const getRelativeTime = (isoString: string) => {
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return minutes === 0 ? 'Just now' : `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className={`${styles.feedContainer} ${className || ''}`}>
      <h3 className={styles.feedTitle}>
        <Clock size={18} />
        Recent Activity
      </h3>

      {isLoading ? (
        <div className={styles.loading}>Loading activity...</div>
      ) : !activities || activities.length === 0 ? (
        <div className={styles.empty}>No activity yet. Start discovering!</div>
      ) : (
        <div className={styles.feedList}>
          {activities.map((activity, idx) => (
            <div key={idx} className={styles.feedItem}>
              <div className={styles.iconContainer}>
                {getIcon(activity.event_type)}
              </div>
              <div className={styles.content}>
                <div className={styles.itemHeader}>
                  <h4 className={styles.itemTitle}>{activity.title}</h4>
                  <span className={styles.itemTime}>{getRelativeTime(activity.timestamp)}</span>
                </div>
                <p className={styles.itemDesc}>{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
