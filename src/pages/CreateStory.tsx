import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Feather } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { TextInput, TextArea, SelectInput } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { StoryService } from '../api/services';
import type { StoryCreate } from '../types';
import styles from './CreateStory.module.css';

const GENRE_OPTIONS = [
  { label: 'Select a genre...', value: '' },
  { label: 'Literary Fiction', value: 'literary_fiction' },
  { label: 'Science Fiction', value: 'science_fiction' },
  { label: 'Fantasy', value: 'fantasy' },
  { label: 'Mystery / Thriller', value: 'mystery_thriller' },
  { label: 'Romance', value: 'romance' },
  { label: 'Historical Fiction', value: 'historical_fiction' },
  { label: 'Young Adult', value: 'young_adult' },
  { label: 'Other', value: 'other' },
];

const CreateStory: React.FC = () => {
  const navigate = useNavigate();
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
          <h1 className={styles.title}>A new story is waiting.</h1>
          <p className={styles.subtitle}>Where will your imagination take you?</p>
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
                label="Story Title"
                placeholder="e.g. The Last Summer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <SelectInput
                label="Genre"
                options={GENRE_OPTIONS}
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                required
              />

              <div className={styles.divider}></div>

              <TextArea
                label="One Sentence Premise"
                placeholder="What is your story about in one sentence?"
                value={formData.one_sentence_premise}
                onChange={(e) => setFormData({ ...formData, one_sentence_premise: e.target.value })}
                required
              />

              <div className={styles.footerSection}>
                <div className={styles.footerOrnament}></div>
                <p className={styles.footerText}>
                  You don't need to know everything yet.<br/>
                  Just the spark is enough. 🤎
                </p>
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={mutation.isPending || !formData.title || !formData.genre}
                  icon={<Feather size={18} />}
                  className={styles.submitButton}
                >
                  {mutation.isPending ? 'Creating...' : 'Begin Discovery'}
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
