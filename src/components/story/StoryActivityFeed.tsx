import React from 'react';
import { Clock, UserPlus, Link2, Sparkles, BrainCircuit, FileText, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { StoryService } from '../../api/services';
import type { EventTypeEnum } from '../../types';
import { RelativeTime } from '../ui/RelativeTime';
import styles from './StoryActivityFeed.module.css';

interface StoryActivityFeedProps {
  storyId: string | null;
  className?: string;
  maxItems?: number;
}

export const StoryActivityFeed: React.FC<StoryActivityFeedProps> = ({ storyId, className, maxItems }) => {
  const { t } = useTranslation(['events', 'dashboard', 'common', 'insights']);

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activity-feed', storyId],
    queryFn: () => StoryService.getActivityFeed(storyId!),
    select: (data) => data.filter(a => Date.now() - new Date(a.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000),
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

  return (
    <div className={`${styles.feedContainer} ${className || ''}`}>
      <h3 className={styles.feedTitle}>
        <Clock size={18} />
        {t('dashboard:titles.recent_activity', 'Recent Activity')}
      </h3>

      {isLoading ? (
        <div className={styles.loading}>{t('dashboard:loading_stories')}</div>
      ) : !activities || activities.length === 0 ? (
        <div className={styles.empty}>{t('dashboard:labels.empty_journal')}</div>
      ) : (
        <div className={styles.feedList}>
          {(maxItems ? activities.slice(0, maxItems) : activities)
            .map((activity, idx) => {
            const metadata = { ...activity.event_metadata };
            if (metadata.pattern_key) {
              metadata.pattern_key = t((metadata.pattern_key as string).replace('insights.', ''), { ns: 'insights' });
            }
            if (metadata.insight_key) {
              metadata.insight_key = t((metadata.insight_key as string).replace('insights.', ''), { ns: 'insights' });
            }
            if (metadata.report_type) {
              const key = (metadata.report_type as string).toLowerCase();
              metadata.report_type = t(`common:nav.${key}s`) || metadata.report_type;
            }
            const translatedTitle = t(`events:${activity.event_type}`, metadata);
            const translatedDesc = t(`events:descriptions.${activity.event_type}`, metadata);

            return (
              <div key={idx} className={styles.feedItem}>
                <div className={styles.iconContainer}>
                  {getIcon(activity.event_type)}
                </div>
                <div className={styles.content}>
                  <div className={styles.itemHeader}>
                    <h4 className={styles.itemTitle}>{translatedTitle as string}</h4>
                    <span className={styles.itemTime}><RelativeTime timestamp={activity.timestamp} /></span>
                  </div>
                  <p className={styles.itemDesc}>{translatedDesc as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
