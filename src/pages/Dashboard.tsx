import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, LayoutGrid, List, AlignJustify } from 'lucide-react';
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
  const [viewMode, setViewMode] = React.useState<'grid' | 'list' | 'compact'>('grid');
  const [page, setPage] = React.useState(1);
  const limit = 6;
  
  const queryClient = useQueryClient();

  const { data: storyList, isLoading } = useQuery({
    queryKey: ['stories', page, limit],
    queryFn: () => StoryService.getAll((page - 1) * limit, limit),
  });

  const deleteStoryMutation = useMutation({
    mutationFn: (id: string) => StoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  const handleDeleteStory = (id: string) => {
    if (window.confirm(t('common:actions.confirm_delete', 'Are you sure you want to delete this story?'))) {
      deleteStoryMutation.mutate(id);
    }
  };

  const handleEditStory = (id: string) => {
    // Navigate to story detail or an edit form (currently story detail acts as the main view)
    navigate(`/stories/${id}`);
  };

  const sortedStories = React.useMemo(() => {
    if (!storyList?.items) return [];
    return [...storyList.items].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [storyList]);

  const totalPages = storyList ? Math.max(1, Math.ceil(storyList.total / limit)) : 1;

  // Use the most recently updated story for the dashboard widgets if available
  const mostRecentStoryId = sortedStories.length > 0 ? sortedStories[0].id : null;
  const hasNoStories = !isLoading && storyList?.total === 0;

  if (hasNoStories) {
    return (
      <main className={styles.firstStoryContainer}>
        <section className={styles.firstStoryHero} aria-labelledby="first-story-title">
          <span className={styles.firstStoryKicker}>{t('first_story.kicker')}</span>
          <h1 id="first-story-title" className={styles.firstStoryTitle}>
            {t('first_story.title')}
          </h1>
          <p className={styles.firstStoryIntro}>{t('first_story.intro')}</p>
          <Button
            size="lg"
            onClick={() => navigate('/stories/new')}
            icon={<Plus size={20} />}
            className={styles.firstStoryCta}
          >
            {t('create_story')}
          </Button>
        </section>

        <p className={styles.futureDiscoveries}>{t('first_story.future_discoveries')}</p>
      </main>
    );
  }

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
        <DiscoveryJournal storyId={mostRecentStoryId} maxItems={5} />
      </div>

      <div className={styles.storiesSection}>
        <div className={styles.sectionDivider}>
          <span className={styles.sectionTitle}>{t('recently_updated')}</span>
          <div className={styles.line}></div>
          <div className={styles.viewToggles}>
            <button 
              className={`${styles.viewToggle} ${viewMode === 'grid' ? styles.active : ''}`} 
              onClick={() => setViewMode('grid')}
              title={t('common:view.grid', 'Grid View')}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              className={`${styles.viewToggle} ${viewMode === 'list' ? styles.active : ''}`} 
              onClick={() => setViewMode('list')}
              title={t('common:view.list', 'List View')}
            >
              <List size={18} />
            </button>
            <button 
              className={`${styles.viewToggle} ${viewMode === 'compact' ? styles.active : ''}`} 
              onClick={() => setViewMode('compact')}
              title={t('common:view.compact', 'Compact View')}
            >
              <AlignJustify size={18} />
            </button>
          </div>
        </div>

        <div className={`${styles.storyList} ${styles[viewMode]}`}>
          {isLoading ? (
            <div className={styles.loading}>{t('loading_stories')}</div>
          ) : sortedStories.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{t('no_stories')}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={styles.emptyStateCta}
                onClick={() => navigate('/stories/new')}
              >
                {t('create_first_story')}
              </Button>
            </div>
          ) : (
            sortedStories.map((story) => (
              <StoryCard
                key={story.id}
                id={story.id}
                title={story.title}
                characterCount={story.character_count || 0}
                relationshipCount={story.relationship_count || 0}
                updatedAt={story.updated_at}
                viewMode={viewMode}
                onEdit={handleEditStory}
                onDelete={handleDeleteStory}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <Button 
              variant="outline" 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
            >
              {t('common:pagination.previous', 'Previous')}
            </Button>
            <span className={styles.pageInfo}>
              {t('common:pagination.page_of', 'Page {{page}} of {{totalPages}}', { page, totalPages })}
            </span>
            <Button 
              variant="outline" 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
            >
              {t('common:pagination.next', 'Next')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
