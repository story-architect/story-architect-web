import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Compass, Activity, Users, Link2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StoryService } from '../api/services';
import { LatestDiscoveryCard } from '../components/discovery/LatestDiscoveryCard';
import { DiscoveryJournal } from '../components/discovery/DiscoveryJournal';
import { StoryActivityFeed } from '../components/story/StoryActivityFeed';
import styles from './StoryDetail.module.css';

const StoryDetail: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();

  const { data: story, isLoading: isLoadingStory } = useQuery({
    queryKey: ['story', storyId],
    queryFn: () => StoryService.getById(storyId!),
    enabled: !!storyId,
  });
  const { data: nextDiscovery } = useQuery({
    queryKey: ['next-discovery', storyId],
    queryFn: () => StoryService.getNextDiscovery(storyId!),
    enabled: !!storyId,
  });

  const progress = nextDiscovery?.progress || 0;

  if (isLoadingStory) return <div className={styles.loading}>Loading story command center...</div>;
  if (!story) return <div className={styles.error}>Story not found</div>;

  return (
    <div className={styles.overviewContainer}>
      <header className={styles.overviewHeader}>
        <div className={styles.headerTitleArea}>
          <span className={styles.genreBadge}>{story.genre.replace('_', ' ')}</span>
          <h1 className={styles.storyTitle}>{story.title}</h1>
        </div>
        <div className={styles.quickActions}>
          <Button 
            onClick={() => {
              if (nextDiscovery?.next_discovery === 'Create your first Character') {
                navigate(`/stories/${story.id}/characters/new`);
              } else if (nextDiscovery?.next_discovery === 'Form a Relationship') {
                navigate(`/stories/${story.id}/relationships/new`);
              }
            }} 
            icon={<Compass size={18} />}
          >
            Continue Discovery
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(`/stories/${story.id}/characters/new`)} 
            icon={<Plus size={18} />}
          >
            Add Character
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(`/stories/${story.id}/relationships/new`)} 
            icon={<Plus size={18} />}
          >
            Add Relationship
          </Button>
        </div>
      </header>

      <div className={styles.premiseBox}>
        <p className={styles.premiseText}>"{story.one_sentence_premise}"</p>
      </div>

      <div className={styles.commandCenterGrid}>
        
        <div className={styles.mainColumn}>
          
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Activity size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{progress}%</span>
                <span className={styles.statLabel}>DISCOVERED</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Users size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{story.character_count || 0}</span>
                <span className={styles.statLabel}>CHARACTERS</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Link2 size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{story.relationship_count || 0}</span>
                <span className={styles.statLabel}>RELATIONSHIPS</span>
              </div>
            </div>
          </div>

          <div className={styles.discoverySection}>
            <LatestDiscoveryCard storyId={story.id} />
            <DiscoveryJournal storyId={story.id} />
          </div>
          
        </div>

        <div className={styles.sideColumn}>
          <StoryActivityFeed storyId={story.id} />
        </div>

      </div>
    </div>
  );
};

export default StoryDetail;
