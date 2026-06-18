import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Feather } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { CharacterService } from '../api/services';
import {
  translatePatternLabel,
  translatePatternNextHint,
  translatePatternSupportingText,
  translatePatternText,
} from '../utils/insightText';
import styles from './PatternEmerging.module.css';

const PatternEmerging: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['insights', 'common']);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['pattern-emerging', characterId],
    queryFn: () => CharacterService.getPatternEmerging(characterId!),
    enabled: !!characterId,
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>{t('common:discovery.labels.sensing', 'Sensing...')}</div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>{t('common:errors.load_failed', 'Something went wrong. Please try again.')}</div>
          <Button size="lg" onClick={() => navigate(`/characters/${characterId}/discovery`)} className={styles.button}>
            {t('common:discovery.labels.continue_discovery', 'Continue Discovery')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.ornament}>
            <Feather size={32} />
          </div>
          
          <h1 className={styles.title}>{t('common:discovery.labels.pattern_emerging', 'Pattern Emerging')}</h1>
          <div className={styles.patternName}>{translatePatternLabel(t, data.pattern_name)}</div>
          
          <div className={styles.divider}></div>
          
          <p className={styles.text}>{translatePatternText(t, data.insight)}</p>
          <p className={styles.supportingText}>{translatePatternSupportingText(t, data.supporting_text)}</p>
          <p className={styles.nextHint}>{translatePatternNextHint(t, data.next_discovery_hint)}</p>
          
          <Button 
            size="lg" 
            onClick={() => navigate(`/characters/${characterId}/report`)}
            className={styles.button}
          >
            {t('common:discovery.labels.continue_discovery', 'Continue Discovery')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatternEmerging;
