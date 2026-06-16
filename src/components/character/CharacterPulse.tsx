import React from 'react';
import { Activity, ShieldAlert, HeartCrack, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CharacterService } from '../../api/services';
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
        <p className={styles.latestText}>
          {pulse.latest_discovery && pulse.latest_discovery.toUpperCase() === pulse.latest_discovery 
            ? t(`events:${pulse.latest_discovery}`, { 
                defaultValue: pulse.latest_discovery,
                report_type: t('common:nav.characters', 'Character'),
                pattern_key: '',
                insight_key: ''
              }) 
            : pulse.latest_discovery}
        </p>
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
                ? t(pulse.most_likely_conflict.replace('insights.', ''), { ns: 'insights' }) 
                : pulse.most_likely_conflict}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
