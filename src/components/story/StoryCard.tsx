import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Link2, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StoryService } from '../../api/services';
import styles from './StoryCard.module.css';

interface StoryCardProps {
  id: string;
  title: string;
  characterCount: number;
  relationshipCount: number;
  viewMode?: 'grid' | 'list' | 'compact';
}

export const StoryCard: React.FC<StoryCardProps> = ({
  id,
  title,
  characterCount,
  relationshipCount,
  viewMode = 'grid'
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['dashboard', 'common']);

  const { data: nextDiscovery } = useQuery({
    queryKey: ['next-discovery', id],
    queryFn: () => StoryService.getNextDiscovery(id),
  });

  const progress = nextDiscovery?.progress || 0;
  const nextInsight = nextDiscovery?.next_discovery;

  if (viewMode === 'compact') {
    return (
      <Card className={`${styles.card} ${styles.compactCard}`}>
        <div className={styles.compactContent}>
          <div className={styles.compactInfoSection}>
            <h3 className={styles.compactTitle}>{title}</h3>
            <div className={styles.compactStats}>
              <div className={styles.stat}>
                <Users size={14} className={styles.statIcon} />
                <span className={styles.statNumber}>{characterCount}</span>
              </div>
              <div className={styles.stat}>
                <Link2 size={14} className={styles.statIcon} />
                <span className={styles.statNumber}>{relationshipCount}</span>
              </div>
            </div>
          </div>
          <div className={styles.compactAction}>
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/stories/${id}`)}
              icon={<ArrowRight size={18} />}
              title={t('labels.continue')}
            />
          </div>
        </div>
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <Card className={`${styles.card} ${styles.listCard}`}>
        <div className={styles.listContent}>
          <div className={styles.listInfoSection}>
            <h3 className={styles.title}>{title}</h3>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <Users size={16} className={styles.statIcon} />
                <span className={styles.statNumber}>{characterCount}</span>
                <span className={styles.statLabel}>{t('labels.characters')}</span>
              </div>
              <div className={styles.stat}>
                <Link2 size={16} className={styles.statIcon} />
                <span className={styles.statNumber}>{relationshipCount}</span>
                <span className={styles.statLabel}>{t('labels.relationships')}</span>
              </div>
            </div>
          </div>
          
          {nextInsight && (
            <div className={styles.listInsightSection}>
              <span className={styles.insightLabel}>NEXT DISCOVERY</span>
              <p className={styles.insightText}>{nextInsight}</p>
            </div>
          )}

          <div className={styles.listProgressSection}>
            <div className={styles.progressCircleSmall}>
              <span className={styles.progressTextSmall}>{progress}%</span>
            </div>
          </div>

          <div className={styles.listActionSection}>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/stories/${id}`)}
              icon={<ArrowRight size={18} />}
              title={t('labels.continue')}
            />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${styles.card} ${styles.gridCard}`}>
      <div className={styles.header}>
        <div className={styles.infoSection}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <Users size={16} className={styles.statIcon} />
              <span className={styles.statNumber}>{characterCount}</span>
              <span className={styles.statLabel}>{t('labels.characters')}</span>
            </div>
            <div className={styles.stat}>
              <Link2 size={16} className={styles.statIcon} />
              <span className={styles.statNumber}>{relationshipCount}</span>
              <span className={styles.statLabel}>{t('labels.relationships')}</span>
            </div>
          </div>
        </div>
        <div className={styles.progressSection}>
          <div className={styles.progressCircle}>
            <span className={styles.progressText}>{progress}%</span>
          </div>
        </div>
      </div>
      <div className={styles.insightSection}>
        {nextInsight && (
          <div className={styles.insight}>
            <span className={styles.insightLabel}>NEXT DISCOVERY</span>
            <p className={styles.insightText} style={{ fontStyle: 'normal' }}>
              {nextInsight}
            </p>
          </div>
        )}
      </div>

      <div className={styles.actionSection}>
        <Button 
          variant="outline" 
          onClick={() => navigate(`/stories/${id}`)}
          className={styles.actionButton}
        >
          {t('labels.continue')} <ArrowRight size={16} style={{marginLeft: '8px'}} />
        </Button>
      </div>
    </Card>
  );
};
