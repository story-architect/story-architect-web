import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Feather } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import styles from './PatternEmerging.module.css';

interface PatternEmergingData {
  title: string;
  pattern_name: string;
  insight: string;
  supporting_text: string;
  next_discovery_hint: string;
}

const PatternEmerging: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PatternEmergingData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation(['insights', 'common']);

  const translateKey = (key?: string): string => {
    if (!key) return '';
    if (key.startsWith('insights.')) {
      return t(key.replace('insights.', ''), { ns: 'insights' });
    }
    if (key === 'A Pattern Is Emerging') {
      return t('common:discovery.labels.pattern_emerging', 'Pattern Emerging');
    }
    return key;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/characters/${characterId}/pattern-emerging`);
        if (!response.ok) throw new Error('Failed to fetch pattern emerging data');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching pattern data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [characterId]);

  if (loading || !data) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>{t('common:discovery.labels.sensing', 'Sensing...')}</div>
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
          
          <h1 className={styles.title}>{translateKey(data.title)}</h1>
          <div className={styles.patternName}>{translateKey(data.pattern_name)}</div>
          
          <div className={styles.divider}></div>
          
          <p className={styles.text}>{translateKey(data.insight)}</p>
          <p className={styles.supportingText}>{translateKey(data.supporting_text)}</p>
          <p className={styles.nextHint}>{translateKey(data.next_discovery_hint)}</p>
          
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
