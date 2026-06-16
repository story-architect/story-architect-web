import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Feather, Shield, Heart, Lock, Sparkles } from 'lucide-react';
import { DiscoveryStatus, type StatusItem, type StatusState } from '../components/story/DiscoveryStatus';
import { SuggestedAnswerCard } from '../components/story/SuggestedAnswerCard';
import { TextArea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CharacterService, DiscoveryService } from '../api/services';
import { CharacterPulse } from '../components/character/CharacterPulse';
import { InsightUnlocked } from '../components/discovery/InsightUnlocked';
import { PatternEmergingScreen } from '../components/discovery/PatternEmergingScreen';
import type { DiscoveryEventResponse } from '../types';
import styles from './CharacterDiscovery.module.css';

const ICONS = [Heart, Shield, Lock, Sparkles];

const CharacterDiscovery: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['events', 'insights', 'common']);

  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: () => CharacterService.getById(characterId!),
    enabled: !!characterId,
  });

  const { data: questions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['questions', 'CHARACTER_DISCOVERY'],
    queryFn: () => DiscoveryService.getQuestions('CHARACTER_DISCOVERY'),
  });

  const { data: answers, isLoading: isLoadingAnswers } = useQuery({
    queryKey: ['answers', 'character', characterId],
    queryFn: () => DiscoveryService.getCharacterAnswers(characterId!),
    enabled: !!characterId,
  });

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [customAnswer, setCustomAnswer] = useState<string>('');
  
  // Overlay states
  const [showInsight, setShowInsight] = useState(false);
  const [showPattern, setShowPattern] = useState(false);

  const [unlockedEvent, setUnlockedEvent] = useState<DiscoveryEventResponse | null>(null);

  const submitMutation = useMutation({
    mutationFn: DiscoveryService.submitAnswer,
    onSuccess: (data) => {
      setSelectedAnswer(null);
      setCustomAnswer('');
      queryClient.invalidateQueries({ queryKey: ['answers', 'character', characterId] });
      queryClient.invalidateQueries({ queryKey: ['character-pulse', characterId] });
      
      const events = data.unlocked_events || [];
      if (events.length > 0) {
        // Find the most significant event to show (Insight first, then Pattern)
        const insightEvent = events.find(e => e.event_type === 'INSIGHT_UNLOCKED');
        const patternEvent = events.find(e => e.event_type === 'PATTERN_EMERGING');
        
        if (insightEvent) {
          setUnlockedEvent(insightEvent);
          setShowInsight(true);
        } else if (patternEvent) {
          setUnlockedEvent(patternEvent);
          setShowPattern(true);
        }
      }
    },
  });

  const currentQuestionIndex = useMemo(() => {
    if (!questions || !answers) return 0;
    const index = questions.findIndex(q => !answers.some(a => a.question_id === q.id));
    return index === -1 ? questions.length : index;
  }, [questions, answers]);

  // If all questions are answered and no overlays are showing, redirect
  useEffect(() => {
    if (questions && answers && currentQuestionIndex === questions.length && questions.length > 0 && !showInsight && !showPattern) {
      navigate(`/characters/${characterId}/pattern-emerging`);
    }
  }, [currentQuestionIndex, questions, answers, navigate, characterId, showInsight, showPattern]);

  if (isLoadingQuestions || isLoadingAnswers || !questions || currentQuestionIndex >= questions.length) {
    return <div><div className={styles.loading}>Loading discovery journey...</div></div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  const statusItems: StatusItem[] = questions.slice(0, 4).map((q, idx) => {
    let state: StatusState = 'hidden';
    if (idx < currentQuestionIndex) state = 'found';
    else if (idx === currentQuestionIndex) state = 'emerging';
    else if (idx === currentQuestionIndex + 1) state = 'forming';

    const labels = [
      t('common:discovery.labels.wound_emerging', 'Wound Emerging'),
      t('common:discovery.labels.fear_emerging', 'Fear Emerging'),
      t('common:discovery.labels.lie_forming', 'Lie Forming'),
      t('common:discovery.labels.transformation_unknown', 'Transformation Unknown')
    ];
    return {
      id: q.id,
      label: labels[idx] || q.question_key,
      state
    };
  });

  const handleSubmit = () => {
    if ((!selectedAnswer && !customAnswer.trim()) || !character) return;
    
    submitMutation.mutate({
      story_id: character.story_id,
      character_id: character.id,
      question_id: currentQuestion.id,
      selected_answer: selectedAnswer,
      custom_answer: customAnswer.trim() ? customAnswer : null,
    });
  };

  return (
    <div className={styles.pageLayout}>
      
      {showInsight && unlockedEvent && (
        <InsightUnlocked 
          title={t(`events:${unlockedEvent.event_type}`, { ...unlockedEvent.event_metadata, insight_key: t((unlockedEvent.event_metadata.insight_key as string)?.replace('insights.', '') || '', { ns: 'insights' }) }) as string}
          description={t(`events:descriptions.${unlockedEvent.event_type}`, { ...unlockedEvent.event_metadata, insight_key: t((unlockedEvent.event_metadata.insight_key as string)?.replace('insights.', '') || '', { ns: 'insights' }) }) as string}
          onContinue={() => setShowInsight(false)}
        />
      )}

      {showPattern && unlockedEvent && (
        <PatternEmergingScreen 
          title={t(`events:${unlockedEvent.event_type}`, { ...unlockedEvent.event_metadata, pattern_key: t((unlockedEvent.event_metadata.pattern_key as string)?.replace('insights.', '') || '', { ns: 'insights' }) }) as string}
          description={t(`events:descriptions.${unlockedEvent.event_type}`, { ...unlockedEvent.event_metadata, insight_key: t((unlockedEvent.event_metadata.insight_key as string)?.replace('insights.', '') || '', { ns: 'insights' }) }) as string}
          onContinue={() => setShowPattern(false)}
        />
      )}

      <div className={styles.mainContent}>
        <div className={styles.container}>
          <DiscoveryStatus items={statusItems} />

          <div className={styles.questionSection}>
            <div className={styles.ornament}>
              <Feather size={16} />
            </div>
            <h1 className={styles.questionText}>
              {t(`common:discovery.questions.${currentQuestion.question_key}`, currentQuestion.question_text)}
            </h1>
            <div className={styles.ornament}>
              <Feather size={16} />
            </div>
            
            <p className={styles.reflectionText}>
              {t('common:discovery.labels.reflection_text', 'The answers we seek are often hidden in the choices we avoid.')}
            </p>
          </div>

          <div className={styles.answersGrid}>
            {currentQuestion.suggested_answers?.map((ans, idx) => {
              const Icon = ICONS[idx % ICONS.length];
              return (
                <SuggestedAnswerCard
                  key={idx}
                  text={t(`common:discovery.answers.${ans}`, ans)}
                  icon={<Icon size={24} />}
                  selected={selectedAnswer === ans && !customAnswer}
                  onClick={() => {
                    setSelectedAnswer(ans);
                    setCustomAnswer('');
                  }}
                />
              );
            })}
          </div>

          <div className={styles.divider}>
            <span>{t('common:discovery.labels.or', 'or')}</span>
          </div>

          <div className={styles.customAnswerSection}>
            <TextArea
              placeholder={t('common:discovery.labels.write_your_own', 'Write your own answer...')}
              value={customAnswer}
              onChange={(e) => {
                setCustomAnswer(e.target.value);
                if (e.target.value) setSelectedAnswer(null);
              }}
              className={styles.customTextarea}
            />
            <Feather className={styles.textareaIcon} size={20} />
          </div>

          <div className={styles.footerSection}>
            <Button 
              size="lg"
              onClick={handleSubmit}
              disabled={(!selectedAnswer && !customAnswer.trim()) || submitMutation.isPending}
              icon={<Feather size={18} />}
              className={styles.submitButton}
            >
              {submitMutation.isPending 
                ? t('common:discovery.labels.sensing', 'Sensing...') 
                : t('common:discovery.labels.continue_discovery', 'Continue Discovery')}
            </Button>
            <p className={styles.footerHelp}>
              <Feather size={14} /> {t('common:discovery.labels.no_wrong_answers', 'There are no wrong answers here.')}
            </p>
          </div>
        </div>
      </div>
      
      <div className={styles.pulsePanel}>
        {characterId && <CharacterPulse characterId={characterId} characterName={character?.name || 'Character'} />}
      </div>
      
    </div>
  );
};

export default CharacterDiscovery;
