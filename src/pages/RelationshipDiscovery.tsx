import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather, Shield, Heart, Lock, Sparkles } from 'lucide-react';
import { DiscoveryStatus, type StatusItem, type StatusState } from '../components/story/DiscoveryStatus';
import { SuggestedAnswerCard } from '../components/story/SuggestedAnswerCard';
import { TextArea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { RelationshipService, DiscoveryService } from '../api/services';
import { InsightUnlocked } from '../components/discovery/InsightUnlocked';
import { PatternEmergingOverlay } from '../components/discovery/PatternEmergingOverlay';
import { useTranslation } from 'react-i18next';
import styles from './CharacterDiscovery.module.css'; // Reusing layout styles

const ICONS = [Heart, Shield, Lock, Sparkles];

const RelationshipDiscovery: React.FC = () => {
  const { relationshipId } = useParams<{ relationshipId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['events', 'dashboard', 'common']);

  const { data: relationship } = useQuery({
    queryKey: ['relationship', relationshipId],
    queryFn: () => RelationshipService.getById(relationshipId!),
    enabled: !!relationshipId,
  });

  const { data: questions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['questions', 'RELATIONSHIP_DISCOVERY'],
    queryFn: () => DiscoveryService.getQuestions('RELATIONSHIP_DISCOVERY'),
  });

  const { data: answers, isLoading: isLoadingAnswers } = useQuery({
    queryKey: ['answers', 'relationship', relationshipId],
    queryFn: () => DiscoveryService.getRelationshipAnswers(relationshipId!),
    enabled: !!relationshipId,
  });

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [customAnswer, setCustomAnswer] = useState<string>('');

  // Overlay states
  const [showInsight, setShowInsight] = useState(false);
  const [showPattern, setShowPattern] = useState(false);

  const submitMutation = useMutation({
    mutationFn: DiscoveryService.submitAnswer,
    onSuccess: () => {
      setSelectedAnswer(null);
      setCustomAnswer('');
      queryClient.invalidateQueries({ queryKey: ['answers', 'relationship', relationshipId] });
      
      // Determine if we should show an overlay after this answer
      if (currentQuestionIndex === 1) { // After 2nd question
        setShowInsight(true);
      } else if (currentQuestionIndex === 3) { // After 4th question
        setShowPattern(true);
      }
    },
  });

  let currentQuestionIndex = 0;
  if (questions && answers) {
    const index = questions.findIndex(q => !answers.some(a => a.question_id === q.id));
    currentQuestionIndex = index === -1 ? questions.length : index;
  }

  useEffect(() => {
    if (questions && answers && currentQuestionIndex === questions.length && questions.length > 0 && !showInsight && !showPattern) {
      navigate(`/relationships/${relationshipId}/report`);
    }
  }, [currentQuestionIndex, questions, answers, navigate, relationshipId, showInsight, showPattern]);

  if (isLoadingQuestions || isLoadingAnswers || !questions || currentQuestionIndex >= questions.length) {
    return <div><div className={styles.loading}>Loading relationship discovery...</div></div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  const statusItems: StatusItem[] = questions.slice(0, 5).map((q, idx) => {
    let state: StatusState = 'hidden';
    if (idx < currentQuestionIndex) state = 'found';
    else if (idx === currentQuestionIndex) state = 'emerging';
    else if (idx === currentQuestionIndex + 1) state = 'forming';

    const labels = [
      t('common:discovery.labels.connection', 'Connection'),
      t('common:discovery.labels.hidden_truth', 'Hidden Truth'),
      t('common:discovery.labels.protective_shield', 'Protective Shield'),
      t('common:discovery.labels.tension_emerging', 'Tension Emerging'),
      t('common:discovery.labels.misunderstanding', 'Misunderstanding')
    ];
    return {
      id: q.id,
      label: labels[idx] || q.question_key,
      state
    };
  });

  const handleSubmit = () => {
    if ((!selectedAnswer && !customAnswer.trim()) || !relationship) return;
    
    submitMutation.mutate({
      story_id: relationship.story_id,
      relationship_id: relationship.id,
      question_id: currentQuestion.id,
      selected_answer: selectedAnswer,
      custom_answer: customAnswer.trim() ? customAnswer : null,
    });
  };

  return (
    <div className={styles.pageLayout}>
      
      {showInsight && (
        <InsightUnlocked 
          title={t('common:discovery.labels.hidden_tension', 'Hidden Tension')}
          description={t('common:discovery.labels.underlying_friction', 'There is an underlying friction in this relationship that stems from misaligned values.')}
          onContinue={() => setShowInsight(false)}
        />
      )}

      {showPattern && (
        <PatternEmergingOverlay 
          message={t('common:discovery.labels.destructive_pattern', 'A destructive pattern is emerging. Their mutual attempts to help are actually causing more harm.')}
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
    </div>
  );
};

export default RelationshipDiscovery;
