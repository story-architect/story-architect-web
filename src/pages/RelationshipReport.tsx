import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Scale, HeartCrack, Edit, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TextArea, SelectInput } from '../components/ui/Input';
import { ArchitectureChain } from '../components/story/ArchitectureChain';
import { InsightCard } from '../components/story/InsightCard';
import { ReportService, RelationshipService, DiscoveryService } from '../api/services';
import * as T from '../types';
import styles from './RelationshipReport.module.css';

const RelationshipReport: React.FC = () => {
  const { relationshipId } = useParams<{ relationshipId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');

  const { data: relationship } = useQuery({
    queryKey: ['relationship', relationshipId],
    queryFn: () => RelationshipService.getById(relationshipId!),
    enabled: !!relationshipId,
  });

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', 'relationship', relationshipId],
    queryFn: () => ReportService.getRelationshipReport(relationshipId!),
    enabled: !!relationshipId,
  });

  const { data: answers } = useQuery({
    queryKey: ['relationship-answers', relationshipId],
    queryFn: () => DiscoveryService.getRelationshipAnswers(relationshipId!),
    enabled: !!relationshipId,
  });

  const { data: questions } = useQuery({
    queryKey: ['questions', 'RELATIONSHIP_DISCOVERY'],
    queryFn: () => DiscoveryService.getQuestions('RELATIONSHIP_DISCOVERY'),
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ relationship_type: 'FRIENDSHIP' as T.RelationshipTypeEnum });

  const [reviseModalState, setReviseModalState] = useState<{ isOpen: boolean; answer: T.DiscoveryAnswerResponse | null; question: T.DiscoveryQuestionResponse | null }>({
    isOpen: false,
    answer: null,
    question: null,
  });
  const [reviseForm, setReviseForm] = useState({ custom_answer: '' });


  const updateRelationshipMutation = useMutation({
    mutationFn: (data: T.RelationshipUpdate) => RelationshipService.update(relationshipId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationship', relationshipId] });
      setIsEditModalOpen(false);
    },
  });

  const updateAnswerMutation = useMutation({
    mutationFn: (data: { id: string, payload: T.DiscoveryAnswerUpdate }) => DiscoveryService.updateAnswer(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationship-answers', relationshipId] });
      queryClient.invalidateQueries({ queryKey: ['report', 'relationship', relationshipId] });
      setReviseModalState({ isOpen: false, answer: null, question: null });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: () => ReportService.getRelationshipReport(relationshipId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', 'relationship', relationshipId] });
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRelationshipMutation.mutate(editForm);
  };

  const handleReviseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviseModalState.answer) {
      updateAnswerMutation.mutate({
        id: reviseModalState.answer.id,
        payload: { custom_answer: reviseForm.custom_answer }
      });
    }
  };

  const openReviseModal = (ans: T.DiscoveryAnswerResponse, q: T.DiscoveryQuestionResponse | undefined) => {
    if (q) {
      setReviseForm({ custom_answer: ans.custom_answer || ans.selected_answer || '' });
      setReviseModalState({ isOpen: true, answer: ans, question: q });
    }
  };

  if (isLoading || !report) {
    return <div className={styles.loading}>{t('reports.generating_report', 'Generating Consequence Report...')}</div>;
  }

  const translateInsight = (val?: string | null): string => {
    if (!val) return '';
    if (val.startsWith('insights.')) {
      return t(val.replace('insights.', ''), { ns: 'insights' });
    }
    return val;
  };

  const chainNodes = [
    { label: t('reports.labels.CURRENT RESULT', 'CURRENT RESULT'), value: translateInsight(report.current_result) },
    { label: t('reports.labels.EMOTIONAL EFFECT', 'EMOTIONAL EFFECT'), value: translateInsight(report.emotional_effect) },
    { label: t('reports.labels.STORY CONSEQUENCE', 'STORY CONSEQUENCE'), value: translateInsight(report.story_consequence) },
    { label: t('reports.labels.CURRENT RELATIONSHIP RISK', 'CURRENT RELATIONSHIP RISK'), value: translateInsight(report.current_relationship_risk), isGlowing: true },
    { label: t('reports.labels.TURNING POINT', 'TURNING POINT'), value: translateInsight(report.turning_point) }
  ];

  return (
    <div className={styles.pageLayout}>
      <div className={styles.scrollContent}>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '1rem' }}>
          <Button variant="outline" icon={<Edit size={18} />} onClick={() => {
            if (relationship) setEditForm({ relationship_type: relationship.relationship_type });
            setIsEditModalOpen(true);
          }}>
            {t('buttons.edit_relationship', 'Edit Relationship')}
          </Button>
        </div>

        {report.is_stale && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t('banners.stale_architecture', 'Your recent revisions may have changed this architecture.')}</span>
            <Button onClick={() => regenerateMutation.mutate()} isLoading={regenerateMutation.isPending} icon={<RefreshCw size={18} />}>
              {t('buttons.refresh_architecture', 'Refresh Architecture')}
            </Button>
          </div>
        )}

        <div className={styles.header}>
          <span className={styles.pretitle}>{t('reports.discovery_complete', 'DISCOVERY COMPLETE')}</span>
          <h1 className={styles.title}>{t('reports.relationship_consequence', 'Relationship Consequence')}</h1>
          <div className={styles.ornament}>❧</div>
        </div>

        <div className={styles.dualPortraitContainer}>
          
          {/* Character A Side */}
          <div className={styles.characterSideLeft}>
            <div className={styles.portraitBox}>
              <div className={styles.portraitPlaceholder}>
                <UserSilhouette />
              </div>
            </div>
            <h2 className={styles.characterName}>{relationship?.character_a_name || 'Character A'}</h2>
            <p className={styles.characterRole}>{t('reports.the_catalyst', 'The Catalyst')}</p>
            
            <div className={styles.sideCardContainer}>
              <InsightCard 
                label={t('reports.labels.RELATIONSHIP LAW', 'RELATIONSHIP LAW')} 
                icon={<Scale size={20} />}
                className={styles.lawCard}
              >
                {report.relationship_law}
              </InsightCard>
            </div>
          </div>

          {/* Central Architecture Chain */}
          <div className={styles.centerFlow}>
            {/* Visual SVG connectors could go in a background div here, or just let CSS pseudo-elements handle it */}
            <div className={styles.svgBackground}>
              <svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="none">
                <path d="M 0 50 C 100 50, 100 150, 200 150" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1" opacity="0.3" />
                <path d="M 400 50 C 300 50, 300 150, 200 150" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1" opacity="0.3" />
                <path d="M 0 50 C 100 50, 150 400, 200 400" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1" opacity="0.1" />
                <path d="M 400 50 C 300 50, 250 400, 200 400" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1" opacity="0.1" />
              </svg>
            </div>

            <ArchitectureChain nodes={chainNodes} />
            
            <div className={styles.quoteBlock}>
              <div className={styles.quoteMark}>"</div>
              <p>{t('reports.every_relationship', 'Every relationship has a hidden architecture.')}<br/><em>{t('reports.understanding_it', 'Understanding it changes everything.')}</em></p>
              <div className={styles.ornamentSmall}>✦</div>
            </div>
            
            <div className={styles.nextStep} style={{ marginBottom: '4rem' }}>
              <Button 
                size="lg" 
                onClick={() => navigate(`/stories/${relationship?.story_id}`)}
                icon={<ArrowRight size={20} />}
              >
                {t('reports.return_to_overview', 'Return to Story Overview')}
              </Button>
            </div>
            
            <section className={styles.answersSection}>
              <div className={styles.header}>
                <span className={styles.pretitle}>{t('reports.revision', 'REVISION')}</span>
                <h2 className={styles.title} style={{ fontSize: '1.5rem' }}>{t('reports.discovery_answers', 'Discovery Answers')}</h2>
                <div className={styles.ornamentSmall}>❧</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', width: '100%', textAlign: 'left' }}>
                {answers?.map(ans => {
                  const question = questions?.find(q => q.id === ans.question_id);
                  return (
                    <InsightCard key={ans.id} label={question?.question_text || 'Question'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          {ans.custom_answer || ans.selected_answer || t('reports.no_answer_provided', 'No answer provided')}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openReviseModal(ans, question)} icon={<Edit size={16} />}>
                          {t('buttons.revise_answer', 'Revise Answer')}
                        </Button>
                      </div>
                    </InsightCard>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Character B Side */}
          <div className={styles.characterSideRight}>
            <div className={styles.portraitBox}>
              <div className={styles.portraitPlaceholder}>
                <UserSilhouette />
              </div>
            </div>
            <h2 className={styles.characterName}>{relationship?.character_b_name || 'Character B'}</h2>
            <p className={styles.characterRole}>{t('reports.the_counterpart', 'The Counterpart')}</p>
            
            <div className={styles.sideCardContainer}>
              <InsightCard 
                label={t('reports.labels.RELATIONSHIP RISK', 'RELATIONSHIP RISK')} 
                icon={<HeartCrack size={20} />}
                className={styles.riskCard}
              >
                {report.current_relationship_risk}
              </InsightCard>
            </div>
          </div>

        </div>

      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('buttons.edit_relationship', 'Edit Relationship')}
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SelectInput
            label={t('reports.relationship_type', 'Relationship Type')}
            value={editForm.relationship_type}
            onChange={(e) => setEditForm({ ...editForm, relationship_type: e.target.value as T.RelationshipTypeEnum })}
            options={[
              { label: t('options.romance', 'Romance'), value: 'ROMANCE' },
              { label: t('options.friendship', 'Friendship'), value: 'FRIENDSHIP' },
              { label: t('options.family', 'Family'), value: 'FAMILY' },
              { label: t('options.rivalry', 'Rivalry'), value: 'RIVALRY' },
              { label: t('options.mentor', 'Mentor'), value: 'MENTOR' },
              { label: t('options.other', 'Other'), value: 'OTHER' }
            ]}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {t('buttons.cancel', 'Cancel')}
            </Button>
            <Button type="submit" isLoading={updateRelationshipMutation.isPending}>
              {t('buttons.save_changes', 'Save Changes')}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={reviseModalState.isOpen}
        onClose={() => setReviseModalState({ isOpen: false, answer: null, question: null })}
        title={t('buttons.revise_discovery_answer', 'Revise Discovery Answer')}
      >
        <form onSubmit={handleReviseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('reports.question', 'Question')}</div>
            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{reviseModalState.question?.question_text}</div>
          </div>
          <TextArea
            label={t('reports.your_custom_answer', 'Your Custom Answer')}
            value={reviseForm.custom_answer}
            onChange={(e) => setReviseForm({ ...reviseForm, custom_answer: e.target.value })}
            required
            rows={4}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button type="button" variant="outline" onClick={() => setReviseModalState({ isOpen: false, answer: null, question: null })}>
              {t('buttons.cancel', 'Cancel')}
            </Button>
            <Button type="submit" isLoading={updateAnswerMutation.isPending}>
              {t('buttons.save_revision', 'Save Revision')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const UserSilhouette = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--color-border)', opacity: 0.5}}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default RelationshipReport;
