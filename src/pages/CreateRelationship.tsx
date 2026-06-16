import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Feather } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { SelectInput } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { RelationshipService, StoryService } from '../api/services';
import type { RelationshipCreate, RelationshipTypeEnum } from '../types';
import { useTranslation } from 'react-i18next';
import styles from './CreateCharacter.module.css'; // Reusing character styles for layout

const getRelationshipTypes = (t: ReturnType<typeof useTranslation>['t']) => [
  { label: t('dashboard:create_relationship_page.dynamic_select', 'Select a dynamic...'), value: '' },
  { label: t('dashboard:create_relationship_page.types.romance', 'Romance'), value: 'ROMANCE' },
  { label: t('dashboard:create_relationship_page.types.friendship', 'Friendship'), value: 'FRIENDSHIP' },
  { label: t('dashboard:create_relationship_page.types.family', 'Family'), value: 'FAMILY' },
  { label: t('dashboard:create_relationship_page.types.rivalry', 'Rivalry'), value: 'RIVALRY' },
  { label: t('dashboard:create_relationship_page.types.mentor', 'Mentor'), value: 'MENTOR' },
  { label: t('dashboard:create_relationship_page.types.other', 'Other'), value: 'OTHER' },
];

const CreateRelationship: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['dashboard']);

  
  const { data: characters } = useQuery({
    queryKey: ['story', storyId, 'characters'],
    queryFn: () => StoryService.getCharacters(storyId!),
    enabled: !!storyId,
  });

  const [formData, setFormData] = useState<Omit<RelationshipCreate, 'story_id'>>({
    character_a_id: '',
    character_b_id: '',
    relationship_type: '' as RelationshipTypeEnum,
  });

  const mutation = useMutation({
    mutationFn: RelationshipService.create,
    onSuccess: (data) => {
      navigate(`/relationships/${data.id}/discovery`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.character_a_id || !formData.character_b_id || !formData.relationship_type || !storyId) return;
    mutation.mutate({ ...formData, story_id: storyId });
  };

  const charOptions = [
    { label: t('dashboard:create_relationship_page.character_select', 'Select a character...'), value: '' },
    ...(characters?.map(c => ({ label: c.name, value: c.id })) || [])
  ];

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('dashboard:create_relationship_page.title', 'Define a Connection.')}</h1>
          <p className={styles.subtitle}>{t('dashboard:create_relationship_page.subtitle', 'Conflict and connection drive every great story.')}</p>
        </div>

        <div className={styles.formContainer}>
          <Card className={styles.card}>
            <div className={styles.cardOrnament}>
              <Feather size={24} className={styles.ornamentIcon} />
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <SelectInput
                label={t('dashboard:create_relationship_page.first_character', 'First Character')}
                options={charOptions}
                value={formData.character_a_id}
                onChange={(e) => setFormData({ ...formData, character_a_id: e.target.value })}
                required
              />

              <SelectInput
                label={t('dashboard:create_relationship_page.second_character', 'Second Character')}
                options={charOptions}
                value={formData.character_b_id}
                onChange={(e) => setFormData({ ...formData, character_b_id: e.target.value })}
                required
              />

              <SelectInput
                label={t('dashboard:create_relationship_page.relationship_dynamic', 'Relationship Dynamic')}
                options={getRelationshipTypes(t)}
                value={formData.relationship_type}
                onChange={(e) => setFormData({ ...formData, relationship_type: e.target.value as RelationshipTypeEnum })}
                required
              />

              <div className={styles.footerSection}>
                <p className={styles.footerText}>
                  {t('dashboard:create_relationship_page.footer_text_1', 'Explore what draws them together,')}<br/>
                  {t('dashboard:create_relationship_page.footer_text_2', 'and what tears them apart.')}
                </p>
                <div className={styles.footerOrnament}></div>
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={mutation.isPending || !formData.character_a_id || !formData.character_b_id || !formData.relationship_type}
                  icon={<Feather size={18} />}
                  className={styles.submitButton}
                >
                  {mutation.isPending 
                    ? t('dashboard:create_relationship_page.starting', 'Starting...') 
                    : t('dashboard:create_relationship_page.start_discovery', 'Start Relationship Discovery')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateRelationship;
