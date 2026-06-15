import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { StoryCard } from '../components/story/StoryCard';
import { StoryService } from '../api/services';
import { LatestDiscoveryCard } from '../components/discovery/LatestDiscoveryCard';
import { DiscoveryJournal } from '../components/discovery/DiscoveryJournal';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['dashboard', 'common']);
  
  const { data: stories, isLoading } = useQuery({
    queryKey: ['stories'],
    queryFn: StoryService.getAll,
  });

  const sortedStories = React.useMemo(() => {
    if (!stories) return [];
    return [...stories].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [stories]);

  // Use the most recently updated story for the dashboard widgets if available
  const mostRecentStoryId = sortedStories.length > 0 ? sortedStories[0].id : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{t('title_part1')}<br/>{t('title_part2')}</h1>
          <p className={styles.subtitle}>
            {t('subtitle')}
          </p>
        </div>
        <div className={styles.actionSection}>
          <Button 
            size="lg" 
            onClick={() => navigate('/stories/new')}
            icon={<Plus size={20} />}
          >
            {t('create_story')}
          </Button>
        </div>
      </div>

      <div className={styles.discoveryFeed}>
        <LatestDiscoveryCard storyId={mostRecentStoryId} />
        <DiscoveryJournal storyId={mostRecentStoryId} />
      </div>

      <div className={styles.storiesSection}>
        <div className={styles.sectionDivider}>
          <span className={styles.sectionTitle}>{t('recently_updated')}</span>
          <div className={styles.line}></div>
        </div>

        <div className={styles.storyList}>
          {isLoading ? (
            <div className={styles.loading}>{t('loading_stories')}</div>
          ) : sortedStories.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{t('no_stories')}</p>
            </div>
          ) : (
            sortedStories.map((story) => (
              <StoryCard
                key={story.id}
                id={story.id}
                title={story.title}
                characterCount={story.character_count || 0}
                relationshipCount={story.relationship_count || 0}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
