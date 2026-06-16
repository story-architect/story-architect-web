import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Compass, Activity, Users, Link2, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TextInput, TextArea } from '../components/ui/Input';
import { StoryService } from '../api/services';
import { LatestDiscoveryCard } from '../components/discovery/LatestDiscoveryCard';
import { DiscoveryJournal } from '../components/discovery/DiscoveryJournal';
import { StoryActivityFeed } from '../components/story/StoryActivityFeed';
import * as T from '../types';
import styles from './StoryDetail.module.css';

const StoryDetail: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['common', 'dashboard']);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', genre: '', one_sentence_premise: '' });

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



  const updateStoryMutation = useMutation({
    mutationFn: (data: T.StoryUpdate) => StoryService.update(storyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story', storyId] });
      setIsEditModalOpen(false);
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoryMutation.mutate(editForm);
  };

  if (isLoadingStory) return <div className={styles.loading}>{t('dashboard:labels.loading_story', 'Loading story command center...')}</div>;
  if (!story) return <div className={styles.error}>{t('dashboard:labels.story_not_found', 'Story not found')}</div>;

  return (
    <div className={styles.overviewContainer}>
      <header className={styles.overviewHeader}>
        <div className={styles.headerTitleArea}>
          <span className={styles.genreBadge}>{t(`dashboard:create_story_page.genres.${story.genre}`, story.genre.replace('_', ' '))}</span>
          <h1 className={styles.storyTitle}>{story.title}</h1>
        </div>
        <div className={styles.quickActions}>
          <Button 
            variant="outline"
            onClick={() => {
              if (story) setEditForm({ title: story.title, genre: story.genre, one_sentence_premise: story.one_sentence_premise });
              setIsEditModalOpen(true);
            }} 
            icon={<Edit size={18} />}
          >
            {t('buttons.edit_story', 'Edit Story')}
          </Button>
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
            {t('buttons.continue_discovery', 'Continue Discovery')}
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(`/stories/${story.id}/characters/new`)} 
            icon={<Plus size={18} />}
          >
            {t('buttons.add_character', 'Add Character')}
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(`/stories/${story.id}/relationships/new`)} 
            icon={<Plus size={18} />}
          >
            {t('buttons.add_relationship', 'Add Relationship')}
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
                <span className={styles.statLabel}>{t('dashboard:labels.discovered', 'DISCOVERED')}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Users size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{story.character_count || 0}</span>
                <span className={styles.statLabel}>{t('dashboard:labels.characters', 'CHARACTERS')}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Link2 size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{story.relationship_count || 0}</span>
                <span className={styles.statLabel}>{t('dashboard:labels.relationships', 'RELATIONSHIPS')}</span>
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

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('buttons.edit_story', 'Edit Story')}
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TextInput
            label={t('dashboard:create_story_page.story_title', 'Title')}
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            required
          />
          <TextInput
            label={t('dashboard:create_story_page.genre', 'Genre')}
            value={editForm.genre}
            onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
            required
          />
          <TextArea
            label={t('dashboard:create_story_page.one_sentence_premise', 'One Sentence Premise')}
            value={editForm.one_sentence_premise}
            onChange={(e) => setEditForm({ ...editForm, one_sentence_premise: e.target.value })}
            required
            rows={3}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {t('buttons.cancel', 'Cancel')}
            </Button>
            <Button type="submit" isLoading={updateStoryMutation.isPending}>
              {t('buttons.save_changes', 'Save Changes')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StoryDetail;
