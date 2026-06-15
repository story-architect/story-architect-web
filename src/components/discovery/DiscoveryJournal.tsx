import React, { useMemo } from 'react';
import { Book, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StoryService } from '../../api/services';
import type { DiscoveryEventResponse } from '../../types';
import styles from './DiscoveryJournal.module.css';

interface DiscoveryJournalProps {
  storyId: string | null;
  className?: string;
}

export const DiscoveryJournal: React.FC<DiscoveryJournalProps> = ({ storyId, className }) => {
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

    events.forEach(event => {
      const eventDate = new Date(event.created_at);
      let label = eventDate.toLocaleDateString();
      if (eventDate.toDateString() === todayStr) label = 'Today';
      else if (eventDate.toDateString() === yesterdayStr) label = 'Yesterday';

      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(event);
    });

    return Object.entries(grouped).map(([label, items]) => ({
      label,
      entries: items
    }));
  }, [events]);

  return (
    <div className={`${styles.journalContainer} ${className || ''}`}>
      <h3 className={styles.title}>
        <Book size={18} />
        Discovery Journal
      </h3>
      
      {isLoading ? (
        <div className={styles.loading}>Loading journal...</div>
      ) : journalDays.length === 0 ? (
        <div className={styles.empty}>Your discovery journey awaits.</div>
      ) : (
        <div className={styles.journalContent}>
          {journalDays.map((day) => (
            <div key={day.label} className={styles.daySection}>
              <span className={styles.dayLabel}>{day.label}</span>
              <div className={styles.entriesList}>
                {day.entries.map((entry) => (
                  <div key={entry.id} className={styles.entryItem}>
                    <Check size={16} className={styles.checkIcon} />
                    <p className={styles.entryText}>{entry.title}: {entry.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
