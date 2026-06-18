import React, { useMemo } from 'react';
import { Book, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { StoryService } from '../../api/services';
import type { DiscoveryEventResponse } from '../../types';
import { buildDiscoveryEventCopy, buildEventMetadata } from '../../utils/insightText';
import styles from './DiscoveryJournal.module.css';

interface DiscoveryJournalProps {
  storyId: string | null;
  className?: string;
  maxItems?: number;
}

export const DiscoveryJournal: React.FC<DiscoveryJournalProps> = ({ storyId, className, maxItems }) => {
  const { t } = useTranslation(['dashboard', 'events', 'insights', 'common']);

  const { data: events, isLoading } = useQuery({
    queryKey: ['discovery-journal', storyId],
    queryFn: () => StoryService.getDiscoveryJournal(storyId!),
    enabled: !!storyId,
  });

  const journalDays = useMemo(() => {
    if (!events) return [];
    
    const grouped: { [key: string]: DiscoveryEventResponse[] } = {};
    const todayStr = new Date().toDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();

    const eventsToProcess = maxItems ? events.slice(0, maxItems) : events;

    eventsToProcess.forEach(event => {
      const eventDate = new Date(event.created_at);
      let label = eventDate.toLocaleDateString();
      if (eventDate.toDateString() === todayStr) label = t('dashboard:labels.today');
      else if (eventDate.toDateString() === yesterdayStr) label = t('dashboard:labels.yesterday');

      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(event);
    });

    return Object.entries(grouped).map(([label, items]) => ({
      label,
      entries: items
    }));
  }, [events, t, maxItems]);

  return (
    <div className={`${styles.journalContainer} ${className || ''}`}>
      <h3 className={styles.title}>
        <Book size={18} />
        {t('dashboard:titles.discovery_journal')}
      </h3>
      
      {isLoading ? (
        <div className={styles.loading}>{t('dashboard:labels.loading_journal')}</div>
      ) : journalDays.length === 0 ? (
        <div className={styles.empty}>{t('dashboard:labels.empty_journal')}</div>
      ) : (
        <div className={styles.journalContent}>
          {journalDays.map((day) => (
            <div key={day.label} className={styles.daySection}>
              <span className={styles.dayLabel}>{day.label}</span>
              <div className={styles.entriesList}>
                {day.entries.map((entry) => {
                  const metadata = buildEventMetadata(t, entry.event_metadata);
                
                  if (metadata.report_type) {
                    const key = (metadata.report_type as string).toLowerCase();
                    metadata.report_type = t(`common:nav.${key}s`) || metadata.report_type;
                  }
                
                  const translatedTitle = t(`events:${entry.event_type}`, metadata);
                  const translatedDesc = t(`events:descriptions.${entry.event_type}`, metadata);
                  const eventCopy = buildDiscoveryEventCopy(t, entry.event_type, entry.event_metadata);

                  return (
                    <div key={entry.id} className={styles.entryItem}>
                      <Check size={16} className={styles.checkIcon} />
                      <p className={styles.entryText}>{eventCopy.title || translatedTitle as string}: {eventCopy.description || translatedDesc as string}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
