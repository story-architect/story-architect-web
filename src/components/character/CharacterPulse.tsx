import React from 'react';
import { Activity, ShieldAlert, HeartCrack, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CharacterService } from '../../api/services';
import { translateInsightText } from '../../utils/insightText';
import styles from './CharacterPulse.module.css';

interface CharacterPulseProps {
  characterId: string;
  characterName: string;
  className?: string;
}

export const CharacterPulse: React.FC<CharacterPulseProps> = ({ characterId, characterName, className }) => {
  const { t } = useTranslation(['common', 'events', 'insights', 'reports']);
  const { data: pulse, isLoading } = useQuery({
    queryKey: ['character-pulse', characterId],
    queryFn: () => CharacterService.getPulse(characterId),
  });

  if (isLoading) {
    return (
      <div className={`${styles.pulseContainer} ${className || ''}`}>
        <div className={styles.loading}>{t('common:labels.loading', 'Checking pulse...')}</div>
      </div>
    );
  }

  if (!pulse) return null;

  const latestDiscoveryText = (() => {
    switch (pulse.latest_discovery) {
      case 'INSIGHT_UNLOCKED':
        return t('common:discovery.labels.insight_unlocked', 'Insight Unlocked');
      case 'PATTERN_EMERGING':
        return t('common:discovery.labels.pattern_emerging', 'Pattern Emerging');
      case 'QUESTION_ANSWERED':
        return t('events:QUESTION_ANSWERED', 'Discovery Answered');
      case 'CHARACTER_CREATED':
        return t('events:CHARACTER_CREATED', 'Character Discovered');
      case 'REPORT_GENERATED':
        return t('events:REPORT_GENERATED', {
          defaultValue: 'Character Report Generated',
          report_type: t('common:nav.characters', 'Character'),
        });
      default:
        return pulse.latest_discovery;
    }
  })();

  return (
    <div className={`${styles.pulseContainer} ${className || ''}`}>
      <div className={styles.header}>
        <Activity className={styles.pulseIcon} size={20} />
        <h3 className={styles.title}>{characterName} {t('common:labels.pulse', 'Pulse')}</h3>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          <span>{t('common:labels.discovery_progress', 'Discovery Progress')}</span>
          <span>{pulse.progress}%</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${pulse.progress}%` }}
          />
        </div>
      </div>

      <div className={styles.latestDiscovery}>
        <span className={styles.latestLabel}>{t('common:labels.latest', 'LATEST')}</span>
        <p className={styles.latestText}>{latestDiscoveryText}</p>
      </div>

      <div className={styles.understandingSection}>
        <h4 className={styles.understandingTitle}>{t('common:labels.current_understanding', 'Current Understanding')}</h4>
        
        <div className={styles.traitItem}>
          <HeartCrack size={16} className={styles.traitIcon} />
          <div className={styles.traitContent}>
            <span className={styles.traitLabel}>{t('reports.emotional_wound', 'Wound')}</span>
            <span className={styles.traitValue}>{pulse.wound}</span>
          </div>
        </div>

        <div className={styles.traitItem}>
          <ShieldAlert size={16} className={styles.traitIcon} />
          <div className={styles.traitContent}>
            <span className={styles.traitLabel}>{t('reports.fear', 'Fear')}</span>
            <span className={styles.traitValue}>{pulse.fear}</span>
          </div>
        </div>

        <div className={styles.traitItem}>
          <div className={styles.maskIcon}>🎭</div>
          <div className={styles.traitContent}>
            <span className={styles.traitLabel}>{t('reports.protective_lie', 'Lie')}</span>
            <span className={styles.traitValue}>{pulse.lie}</span>
          </div>
        </div>

        <div className={styles.traitItem}>
          <Flame size={16} className={styles.traitIcon} />
          <div className={styles.traitContent}>
            <span className={styles.traitLabel}>{t('common:labels.most_likely_conflict', 'Most Likely Conflict')}</span>
            <span className={styles.traitValue}>
              {pulse.most_likely_conflict?.startsWith('insights.') 
                ? translateInsightText(t, pulse.most_likely_conflict)
                : pulse.most_likely_conflict}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
