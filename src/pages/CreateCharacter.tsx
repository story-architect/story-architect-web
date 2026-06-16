import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Feather } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { TextInput, SelectInput } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CharacterService } from '../api/services';
import type { CharacterCreate, RoleEnum } from '../types';
import { useTranslation } from 'react-i18next';
import styles from './CreateCharacter.module.css';

const getRoleOptions = (t: ReturnType<typeof useTranslation>['t']) => [
  { label: t('dashboard:create_character_page.roles.main', 'Main Character'), value: 'MAIN_CHARACTER' },
  { label: t('dashboard:create_character_page.roles.supporting', 'Supporting Character'), value: 'SUPPORTING_CHARACTER' },
];

const CreateCharacter: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['dashboard']);

  
  const [formData, setFormData] = useState<Omit<CharacterCreate, 'story_id'>>({
    name: '',
    age: 0,
    role: 'MAIN_CHARACTER' as RoleEnum,
    archetype: '',
  });

  const mutation = useMutation({
    mutationFn: CharacterService.create,
    onSuccess: (data) => {
      navigate(`/characters/${data.id}/discovery`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !storyId) return;
    mutation.mutate({ ...formData, story_id: storyId });
  };

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('dashboard:create_character_page.title', "Let's meet someone new.")}</h1>
          <p className={styles.subtitle}>{t('dashboard:create_character_page.subtitle', "Every unforgettable story begins with a character.")}</p>
        </div>

        <div className={styles.formContainer}>
          <Card className={styles.card}>
            <div className={styles.cardOrnament}>
              <Feather size={24} className={styles.ornamentIcon} />
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <TextInput
                label={t('dashboard:create_character_page.character_name', "Character Name")}
                placeholder={t('dashboard:create_character_page.character_name_placeholder', "e.g. Elara Vance")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <div className={styles.row}>
                <TextInput
                  label={t('dashboard:create_character_page.age', "Age")}
                  type="number"
                  placeholder={t('dashboard:create_character_page.age_placeholder', "e.g. 28")}
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  required
                />
                
                <SelectInput
                  label={t('dashboard:create_character_page.role', "Role")}
                  options={getRoleOptions(t)}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleEnum })}
                  required
                />
              </div>

              <TextInput
                label={t('dashboard:create_character_page.archetype', "Archetype (Optional)")}
                placeholder={t('dashboard:create_character_page.archetype_placeholder', "e.g. The Reluctant Leader")}
                value={formData.archetype || ''}
                onChange={(e) => setFormData({ ...formData, archetype: e.target.value })}
              />

              <div className={styles.footerSection}>
                <p className={styles.footerText}>
                  {t('dashboard:create_character_page.footer_text_1', "You don't need to know everything yet.")}<br/>
                  {t('dashboard:create_character_page.footer_text_2', "Discovery will reveal the rest.")}
                </p>
                <div className={styles.footerOrnament}></div>
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={mutation.isPending || !formData.name || !formData.age}
                  icon={<Feather size={18} />}
                  className={styles.submitButton}
                >
                  {mutation.isPending 
                    ? t('dashboard:create_character_page.starting', "Starting...") 
                    : t('dashboard:create_character_page.start_discovery', "Start Character Discovery")}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateCharacter;
