import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useQueryClient } from '@tanstack/react-query';
import styles from './ReviseInterpretationModal.module.css';
import { AlertCircle } from 'lucide-react';

interface ReviseInterpretationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  characterId: string;
  fieldKey: 'narrative_consequence_custom' | 'conflict_created_custom' | 'pressure_point_custom' | 'transformation_path_custom';
  label: string;
  generatedValue: string;
  customValue?: string | null;
  isOutdated?: boolean;
}

export const ReviseInterpretationModal: React.FC<ReviseInterpretationModalProps> = ({
  isOpen,
  onClose,
  reportId,
  characterId,
  fieldKey,
  label,
  generatedValue,
  customValue,
  isOutdated
}) => {
  const { t } = useTranslation(['common']);
  const queryClient = useQueryClient();
  const [value, setValue] = useState(customValue || generatedValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValue(customValue || generatedValue);
  }, [customValue, generatedValue, isOpen]);

  const handleSave = async (action: 'keep' | 'replace' | 'save') => {
    setIsSubmitting(true);
    try {
      const payload: any = {};
      
      if (action === 'replace') {
        // Clear the custom value and outdated flag
        payload[fieldKey] = null;
        payload.clear_outdated = [fieldKey];
      } else if (action === 'keep') {
        // Clear just the outdated flag
        payload.clear_outdated = [fieldKey];
      } else {
        // Save new value
        if (value.trim() !== generatedValue) {
          payload[fieldKey] = value.trim();
        } else {
          payload[fieldKey] = null; // Same as generated, so clear custom
          payload.clear_outdated = [fieldKey];
        }
      }

      const res = await fetch(`http://localhost:8000/api/v1/reports/characters/${reportId}/interpretations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['character-report', characterId] });
        queryClient.invalidateQueries({ queryKey: ['activity-feed'] });
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('reports.revise_interpretation', 'Revise Interpretation')}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
        </div>

        {isOutdated && (
          <div className={styles.outdatedBanner}>
            <AlertCircle size={16} />
            <div className={styles.bannerContent}>
              <p className={styles.bannerText}>
                {t('reports.outdated_long_desc', 'This interpretation was written before your latest revisions. The engine has generated a new suggestion based on your recent changes.')}
              </p>
              <div className={styles.bannerActions}>
                <Button variant="outline" size="sm" onClick={() => handleSave('keep')} isLoading={isSubmitting}>
                  {t('reports.keep_mine', 'Keep my interpretation')}
                </Button>
                <Button variant="primary" size="sm" onClick={() => handleSave('replace')} isLoading={isSubmitting}>
                  {t('reports.replace_suggested', 'Replace with refreshed suggestion')}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.fieldLabel}>{t('reports.generated_suggestion', 'Generated Suggestion')}</label>
          <div className={styles.generatedText}>"{generatedValue}"</div>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>{t('reports.your_interpretation', 'Your Interpretation')}</label>
          <textarea
            className={styles.textarea}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            placeholder={t('reports.interpretation_placeholder', 'Write your own interpretation...')}
          />
        </div>

        <div className={styles.footer}>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('common:cancel', 'Cancel')}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleSave('save')} 
            isLoading={isSubmitting}
            disabled={!value.trim()}
          >
            {t('common:save', 'Save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
