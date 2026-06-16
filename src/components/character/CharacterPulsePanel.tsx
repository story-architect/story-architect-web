import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CharacterService, ReportService } from '../../api/services';
import styles from './CharacterPulsePanel.module.css';

interface CharacterPulsePanelProps {
  characterId: string;
  className?: string;
}

export const CharacterPulsePanel: React.FC<CharacterPulsePanelProps> = ({ characterId, className }) => {
  const { t } = useTranslation(['common', 'insights', 'reports']);
  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: () => CharacterService.getById(characterId),
  });

  const { data: report, isLoading } = useQuery({
    queryKey: ['characterReport', characterId],
    queryFn: () => ReportService.getCharacterReport(characterId),
    retry: false, // Might not exist yet
  });

  // Calculate rough progress based on report existence/fields
  const getProgress = () => {
    if (!report) return 15; // Just created
    let score = 30; // Report initiated
    if (report.emotional_wound) score += 15;
    if (report.deepest_fear) score += 15;
    if (report.protective_lie) score += 20;
    if (report.conflict_created) score += 20;
    return Math.min(score, 100);
  };

  return (
    <div className={`${styles.panelContainer} ${className || ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>{character?.name || 'Character'}</h2>
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${getProgress()}%` }} 
            />
          </div>
          <span className={styles.progressText}>{getProgress()}%</span>
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionTitle}>
          <Activity size={16} />
          {t('common:labels.current_understanding', 'Current Understanding')}
        </span>

        {isLoading ? (
          <div className={styles.loading}>{t('common:labels.loading', 'Sensing character pulse...')}</div>
        ) : (
          <>
            <div className={styles.traitItem}>
              <span className={styles.traitLabel}>{t('reports.emotional_wound', 'Wound')}</span>
              {report?.emotional_wound ? (
                <p className={styles.traitValue}>{report.emotional_wound}</p>
              ) : (
                <p className={styles.traitEmpty}>{t('common:labels.undiscovered', 'Undiscovered')}</p>
              )}
            </div>

            <div className={styles.traitItem}>
              <span className={styles.traitLabel}>{t('reports.fear', 'Fear')}</span>
              {report?.deepest_fear ? (
                <p className={styles.traitValue}>{report.deepest_fear}</p>
              ) : (
                <p className={styles.traitEmpty}>{t('common:labels.undiscovered', 'Undiscovered')}</p>
              )}
            </div>

            <div className={styles.traitItem}>
              <span className={styles.traitLabel}>{t('reports.protective_lie', 'Lie')}</span>
              {report?.protective_lie ? (
                <p className={styles.traitValue}>"{report.protective_lie}"</p>
              ) : (
                <p className={styles.traitEmpty}>{t('common:labels.undiscovered', 'Undiscovered')}</p>
              )}
            </div>

            <div className={styles.traitItem}>
              <span className={styles.traitLabel}>{t('common:labels.most_likely_conflict', 'Most Likely Conflict')}</span>
              {report?.conflict_created ? (
                <p className={styles.traitValue}>
                  {report.conflict_created?.startsWith('insights.') 
                    ? t(report.conflict_created.replace('insights.', ''), { ns: 'insights' }) 
                    : report.conflict_created}
                </p>
              ) : (
                <p className={styles.traitEmpty}>{t('common:labels.undiscovered', 'Undiscovered')}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
