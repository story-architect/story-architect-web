import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Feather } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { SelectInput } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { RelationshipService, StoryService } from '../api/services';
import type { RelationshipCreate, RelationshipTypeEnum } from '../types';
import styles from './CreateCharacter.module.css'; // Reusing character styles for layout

const RELATIONSHIP_TYPES = [
  { label: 'Select a dynamic...', value: '' },
  { label: 'Romance', value: 'ROMANCE' },
  { label: 'Friendship', value: 'FRIENDSHIP' },
  { label: 'Family', value: 'FAMILY' },
  { label: 'Rivalry', value: 'RIVALRY' },
  { label: 'Mentor', value: 'MENTOR' },
  { label: 'Other', value: 'OTHER' },
];

const CreateRelationship: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();

  
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
    { label: 'Select a character...', value: '' },
    ...(characters?.map(c => ({ label: c.name, value: c.id })) || [])
  ];

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Define a Connection.</h1>
          <p className={styles.subtitle}>Conflict and connection drive every great story.</p>
        </div>

        <div className={styles.formContainer}>
          <Card className={styles.card}>
            <div className={styles.cardOrnament}>
              <Feather size={24} className={styles.ornamentIcon} />
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <SelectInput
                label="First Character"
                options={charOptions}
                value={formData.character_a_id}
                onChange={(e) => setFormData({ ...formData, character_a_id: e.target.value })}
                required
              />

              <SelectInput
                label="Second Character"
                options={charOptions}
                value={formData.character_b_id}
                onChange={(e) => setFormData({ ...formData, character_b_id: e.target.value })}
                required
              />

              <SelectInput
                label="Relationship Dynamic"
                options={RELATIONSHIP_TYPES}
                value={formData.relationship_type}
                onChange={(e) => setFormData({ ...formData, relationship_type: e.target.value as RelationshipTypeEnum })}
                required
              />

              <div className={styles.footerSection}>
                <p className={styles.footerText}>
                  Explore what draws them together,<br/>
                  and what tears them apart.
                </p>
                <div className={styles.footerOrnament}></div>
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={mutation.isPending || !formData.character_a_id || !formData.character_b_id || !formData.relationship_type}
                  icon={<Feather size={18} />}
                  className={styles.submitButton}
                >
                  {mutation.isPending ? 'Starting...' : 'Start Relationship Discovery'}
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
