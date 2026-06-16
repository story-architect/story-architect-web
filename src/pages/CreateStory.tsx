import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Feather } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { TextInput, TextArea, SelectInput } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { StoryService } from '../api/services';
import type { StoryCreate } from '../types';
import { useTranslation } from 'react-i18next';
import styles from './CreateStory.module.css';

const getGenreOptions = (t: any) => [
  { label: t('dashboard:create_story_page.genre_select', 'Select a genre...'), value: '' },
  { label: t('dashboard:create_story_page.genres.literary_fiction', 'Literary Fiction'), value: 'literary_fiction' },
  { label: t('dashboard:create_story_page.genres.science_fiction', 'Science Fiction'), value: 'science_fiction' },
  { label: t('dashboard:create_story_page.genres.fantasy', 'Fantasy'), value: 'fantasy' },
  { label: t('dashboard:create_story_page.genres.mystery_thriller', 'Mystery / Thriller'), value: 'mystery_thriller' },
  { label: t('dashboard:create_story_page.genres.romance', 'Romance'), value: 'romance' },
  { label: t('dashboard:create_story_page.genres.historical_fiction', 'Historical Fiction'), value: 'historical_fiction' },
  { label: t('dashboard:create_story_page.genres.young_adult', 'Young Adult'), value: 'young_adult' },
  { label: t('dashboard:create_story_page.genres.other', 'Other'), value: 'other' },
];

const CreateStory: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['dashboard']);
  const [formData, setFormData] = useState<StoryCreate>({
    title: '',
    genre: '',
    one_sentence_premise: '',
  });

  const mutation = useMutation({
    mutationFn: StoryService.create,
    onSuccess: (data) => {
      navigate(`/stories/${data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.genre) return;
    mutation.mutate(formData);
  };

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('dashboard:create_story_page.title', 'A new story is waiting.')}</h1>
          <p className={styles.subtitle}>{t('dashboard:create_story_page.subtitle', 'Where will your imagination take you?')}</p>
          <div className={styles.ornament}>
            <Feather size={24} className={styles.ornamentIcon} />
          </div>
        </div>

        <div className={styles.formContainer}>
          <Card className={styles.card}>
            <div className={styles.cardOrnament}>
              <Feather size={24} className={styles.ornamentIcon} />
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <TextInput
                label={t('dashboard:create_story_page.story_title', 'Story Title')}
                placeholder={t('dashboard:create_story_page.story_title_placeholder', 'e.g. The Last Summer')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <SelectInput
                label={t('dashboard:create_story_page.genre', 'Genre')}
                options={getGenreOptions(t)}
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                required
              />

              <div className={styles.divider}></div>

              <TextArea
                label={t('dashboard:create_story_page.one_sentence_premise', 'One Sentence Premise')}
                placeholder={t('dashboard:create_story_page.one_sentence_premise_placeholder', 'What is your story about in one sentence?')}
                value={formData.one_sentence_premise}
                onChange={(e) => setFormData({ ...formData, one_sentence_premise: e.target.value })}
                required
              />

              <div className={styles.footerSection}>
                <div className={styles.footerOrnament}></div>
                <p className={styles.footerText}>
                  {t('dashboard:create_story_page.footer_text_1', "You don't need to know everything yet.")}<br/>
                  {t('dashboard:create_story_page.footer_text_2', "Just the spark is enough. 🤎")}
                </p>
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={mutation.isPending || !formData.title || !formData.genre}
                  icon={<Feather size={18} />}
                  className={styles.submitButton}
                >
                  {mutation.isPending 
                    ? t('dashboard:create_story_page.creating', 'Creating...') 
                    : t('dashboard:create_story_page.begin_discovery', 'Begin Discovery')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateStory;
