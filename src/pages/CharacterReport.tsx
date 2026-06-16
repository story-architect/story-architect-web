import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Shield, Flame, Map, Users, Info, ArrowRight, Sparkles, Edit, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TextInput, TextArea, SelectInput } from '../components/ui/Input';
import { ArchitectureChain } from '../components/story/ArchitectureChain';
import { DiscoverySidebar } from '../components/story/DiscoverySidebar';
import { InsightCard } from '../components/story/InsightCard';
import { ReportService, CharacterService, DiscoveryService } from '../api/services';
import * as T from '../types';
import styles from './CharacterReport.module.css';

const CharacterReport: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['common', 'insights']);

  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: () => CharacterService.getById(characterId!),
    enabled: !!characterId,
  });

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', 'character', characterId],
    queryFn: () => ReportService.getCharacterReport(characterId!),
    enabled: !!characterId,
  });

  const { data: answers } = useQuery({
    queryKey: ['character-answers', characterId],
    queryFn: () => DiscoveryService.getCharacterAnswers(characterId!),
    enabled: !!characterId,
  });

  const { data: questions } = useQuery({
    queryKey: ['questions', 'CHARACTER_DISCOVERY'],
    queryFn: () => DiscoveryService.getQuestions('CHARACTER_DISCOVERY'),
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', age: 0, role: 'MAIN_CHARACTER' as T.RoleEnum, archetype: '' });

  const [reviseModalState, setReviseModalState] = useState<{ isOpen: boolean; answer: T.DiscoveryAnswerResponse | null; question: T.DiscoveryQuestionResponse | null }>({
    isOpen: false,
    answer: null,
    question: null,
  });
  const [reviseForm, setReviseForm] = useState({ custom_answer: '' });


  const updateCharacterMutation = useMutation({
    mutationFn: (data: T.CharacterUpdate) => CharacterService.update(characterId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character', characterId] });
      setIsEditModalOpen(false);
    },
  });

  const updateAnswerMutation = useMutation({
    mutationFn: (data: { id: string, payload: T.DiscoveryAnswerUpdate }) => DiscoveryService.updateAnswer(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character-answers', characterId] });
      queryClient.invalidateQueries({ queryKey: ['report', 'character', characterId] });
      setReviseModalState({ isOpen: false, answer: null, question: null });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: () => ReportService.getCharacterReport(characterId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', 'character', characterId] });
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCharacterMutation.mutate(editForm);
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
    return <div><div className={styles.loading}>Generating Architecture Report...</div></div>;
  }

  const sidebarSteps = [
    { label: t('reports.emotional_wound', 'Emotional Wound'), isComplete: true },
    { label: t('reports.fear', 'Deepest Fear'), isComplete: true },
    { label: t('reports.protective_lie', 'Protective Lie'), isComplete: true },
    { label: t('reports.relationship_pattern', 'Relationship Pattern'), isComplete: true },
    { label: t('reports.narrative_consequence', 'Narrative Consequence'), isComplete: true, isGlowing: true },
  ];

  const translateInsight = (val?: string | null): string => {
    if (!val) return '';
    if (val.startsWith('insights.')) {
      return t(val.replace('insights.', ''), { ns: 'insights' });
    }
    return val;
  };

  const engineNodes = [
    { label: t('reports.labels.EMOTIONAL WOUND', 'EMOTIONAL WOUND'), value: report.emotional_wound, icon: <Heart size={20} /> },
    { label: t('reports.labels.FEAR', 'FEAR'), value: report.deepest_fear, icon: <Info size={20} /> },
    { label: t('reports.labels.PROTECTIVE LIE', 'PROTECTIVE LIE'), value: report.protective_lie, icon: <Shield size={20} /> },
    { label: t('reports.labels.RELATIONSHIP PATTERN', 'RELATIONSHIP PATTERN'), value: translateInsight(report.behavior), icon: <Users size={20} /> },
    { label: t('reports.labels.STORY CONFLICT', 'STORY CONFLICT'), value: translateInsight(report.conflict_created), icon: <Flame size={20} /> },
    { label: t('reports.labels.TRANSFORMATION', 'TRANSFORMATION'), value: translateInsight(report.transformation), icon: <Sparkles size={20} /> }
  ];

  const consequenceNodes = [
    { label: t('reports.labels.PROTECTIVE LIE', 'PROTECTIVE LIE'), value: report.protective_lie },
    { label: t('reports.labels.BEHAVIOR', 'BEHAVIOR'), value: translateInsight(report.behavior) },
    { label: t('reports.labels.STORY CONSEQUENCE', 'STORY CONSEQUENCE'), value: translateInsight(report.narrative_consequence), isGlowing: true },
    { label: t('reports.labels.CONFLICT CREATED', 'CONFLICT CREATED'), value: translateInsight(report.conflict_created) }
  ];

  // Dynamic sentence generation
  const name = character?.name || 'The character';
  const firstName = name.split(' ')[0];
    
  return (
    <div className={styles.pageLayout}>
      <DiscoverySidebar 
        name={name}
        role={character?.archetype || (character?.role === 'MAIN_CHARACTER' ? t('reports.protagonist', 'The Protagonist') : t('reports.supporting_character', 'Supporting Character'))}
        quote={report.character_core}
        steps={sidebarSteps}
      />
      
      <div className={styles.scrollContent}>
        <div className={styles.contentMax}>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '1rem' }}>
            <Button variant="outline" icon={<Edit size={18} />} onClick={() => {
              if (character) setEditForm({ name: character.name, age: character.age, role: character.role, archetype: character.archetype || '' });
              setIsEditModalOpen(true);
            }}>
              {t('buttons.edit_character', 'Edit Character')}
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
          
          {/* SCREEN 1: Story Engine Emerging */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.pretitle}>{t('reports.discovery_complete', 'DISCOVERY COMPLETE')}</span>
              <h1 className={styles.title}>{t('reports.engine_emerging', 'Your Story Engine Is')} <em>{t('reports.engine_emerging_em', 'Emerging')}</em></h1>
              <div className={styles.ornament}>❧</div>
            </div>
            
            <ArchitectureChain nodes={engineNodes} />
            
            <div className={styles.quoteBlock}>
              <div className={styles.quoteMark}>"</div>
              <p>{t('reports.not_character_trait', 'This is not a character trait.')}<br/><em>{t('reports.story_waiting', 'This is a story waiting to happen.')}</em></p>
              <div className={styles.ornamentSmall}>✦</div>
            </div>
          </section>

          {/* SCREEN 2: Why This Creates Drama */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.ornamentSmall}>✦</div>
              <h1 className={styles.title}>{t('reports.why_matters', 'Why This Matters')}</h1>
              <div className={styles.ornament}>❧</div>
            </div>

            <InsightCard 
              className={styles.wideCard}
              title={
                <span>{t('reports.belief_shape_who', "This belief doesn't just shape who your character is.")}<br/><em>{t('reports.shapes_what_happens', 'It shapes what happens to them.')}</em></span>
              }
            >
              <div className={styles.statementText}>
                {translateInsight(report.conflict_created) || t('common:discovery.labels.sensing', 'Sensing...')}
              </div>
              <div className={styles.threeColumn}>
                <div className={styles.column}>
                  <div className={styles.columnIcon}><Users size={24} /></div>
                  <h4 className={styles.columnTitle}>{t('reports.labels.RELATIONSHIP PATTERN', 'RELATIONSHIPS').replace(' PATTERN', 'S')}</h4>
                  <div className={styles.ornamentMicro}>❧</div>
                  <p className={styles.columnText}>{t('reports.people_struggle', 'People struggle to get close to them.')}</p>
                </div>
                <div className={styles.column}>
                  <div className={styles.columnIcon}><Map size={24} /></div>
                  <h4 className={styles.columnTitle}>{t('reports.choices', 'CHOICES')}</h4>
                  <div className={styles.ornamentMicro}>❧</div>
                  <p className={styles.columnText}>{t('reports.opportunities_rejected', 'Important opportunities are rejected.')}</p>
                </div>
                <div className={styles.column}>
                  <div className={styles.columnIcon}><Flame size={24} /></div>
                  <h4 className={styles.columnTitle}>{t('reports.conflict', 'CONFLICT')}</h4>
                  <div className={styles.ornamentMicro}>❧</div>
                  <p className={styles.columnText}>{t('reports.create_outcome_fear', 'They create the very outcome they fear.')}</p>
                </div>
              </div>

              <div className={styles.dramaticPotential}>
                <div className={styles.dpHeader}>
                  <span>✦</span> {t('reports.dramatic_potential', 'DRAMATIC POTENTIAL')} <span>✦</span>
                </div>
                <p className={styles.dpText}>
                  {t('reports.because_fears_wound', 'Because {{firstName}} fears their wound, they protect themselves.', { firstName })} <br/>
                  <em>{t('reports.more_cares_push_away', 'The more someone cares about them, the more likely they push them away.')}</em>
                </p>
                <div className={styles.ornamentMicro}>❧</div>
                <p className={styles.dpFooter}>{t('reports.creates_central_conflict', 'This creates the central emotional conflict of their story.')}</p>
              </div>
            </InsightCard>
          </section>

          {/* SCREEN 3: Narrative Consequence Revealed */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.pretitle}>{t('reports.narrative_consequence_revealed', 'NARRATIVE CONSEQUENCE REVEALED')}</span>
              <h1 className={styles.dynamicSentence}>
                {t('reports.because_believes', 'Because {{firstName}} believes "{{lie}}",', { firstName, lie: report.protective_lie.replace('.', '') })}<br/>
                <em>{t('reports.push_away_capable', 'they push away the people most capable of helping them.')}</em>
              </h1>
            </div>

            <ArchitectureChain nodes={consequenceNodes} />
          </section>

          {/* SCREEN 4: Where The Story Begins */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.pretitle}>{t('reports.discovery_complete', 'DISCOVERY COMPLETE')}</span>
              <h1 className={styles.title}>{t('reports.where_story_begins', 'Where The Story Begins')}</h1>
              <div className={styles.ornament}>❧</div>
              <p className={styles.subtitle}>{t('reports.foundation_revealed', "Your character's foundation has been revealed.")}</p>
            </div>

            <div className={styles.sectionHeader}>
              <span className={styles.itemTitle}>{t('reports.the_central_conflict', 'THE CENTRAL CONFLICT')}</span>
              <p className={styles.itemText}>{translateInsight(report.conflict_created)}</p>
            </div>
            
            <div className={styles.foundationItem}>
              <span className={styles.itemTitle}>{t('reports.the_transformation', 'THE TRANSFORMATION')}</span>
              <p className={styles.itemText}>{translateInsight(report.transformation)}</p>
            </div>

            <InsightCard 
              isGlowing 
              className={styles.keyInsightCard}
              label={t('reports.key_insight', 'KEY INSIGHT')}
              icon={<Sparkles size={24} />}
            >
              <p className={styles.kiText}>
                {t('reports.because_fears_wound_short', 'Because {{firstName}} fears their wound,', { firstName })}<br/>
                <em>{t('reports.protect_through_lie', 'they protect themselves through their lie.')}</em>
              </p>
              <div className={styles.ornamentMicro}>❧</div>
              <p className={styles.kiSubtext}>
                {t('reports.reject_support', 'This causes them to reject support, misread affection,')}<br/>
                {t('reports.isolate_themselves', 'and isolate themselves when they need people most.')}
              </p>
            </InsightCard>

            <div className={styles.threeColumnGrid}>
              <InsightCard label={t('reports.the_inciting_relationship', 'THE INCITING RELATIONSHIP')} icon={<Users size={20} />}>
                {t('insights:character.default.inciting_relationship', 'Someone enters their life who refuses to leave.')}
              </InsightCard>
              <InsightCard label={t('reports.the_central_conflict', 'THE CENTRAL CONFLICT')} icon={<Flame size={20} />}>
                {t('insights:character.default.central_conflict', 'They must choose between safety and connection.')}
              </InsightCard>
              <InsightCard label={t('reports.the_transformation', 'THE TRANSFORMATION')} icon={<Sparkles size={20} />}>
                {report.transformation}
              </InsightCard>
            </div>

            <InsightCard className={styles.finaleCard}>
              <div className={styles.finaleContent}>
                <div className={styles.finaleIcon}><Sparkles size={32} /></div>
                <div className={styles.finaleText}>
                  {t('reports.understand_who', 'We now understand not only who this character is.')}<br/>
                  <em>{t('reports.understand_why', 'We understand why their story exists.')}</em>
                </div>
              </div>
            </InsightCard>

            <div className={styles.nextStep}>
              <Button 
                size="lg" 
                onClick={() => navigate(`/stories/${character?.story_id}`)}
                icon={<ArrowRight size={20} />}
              >
                {t('reports.return_to_overview', 'Return to Story Overview')}
              </Button>
            </div>
          </section>

          {/* SCREEN 5: Discovery Answers */}
          <section className={styles.section} style={{ marginTop: '4rem' }}>
            <div className={styles.sectionHeader}>
              <span className={styles.pretitle}>{t('reports.revision', 'REVISION')}</span>
              <h1 className={styles.title}>{t('reports.discovery_answers', 'Discovery Answers')}</h1>
              <div className={styles.ornament}>❧</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {answers?.map(ans => {
                const question = questions?.find(q => q.id === ans.question_id);
                return (
                  <InsightCard key={ans.id} label={question ? t(`common:discovery.questions.${question.question_key}`, question.question_text) : t('reports.question', 'Question')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {ans.custom_answer || ans.selected_answer || t('common:labels.no_answer_provided', 'No answer provided')}
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
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('buttons.edit_character', 'Edit Character')}
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TextInput
            label={t('dashboard:create_character_page.character_name', 'Name')}
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          <TextInput
            type="number"
            label={t('dashboard:create_character_page.age', 'Age')}
            value={editForm.age}
            onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) || 0 })}
            required
          />
          <SelectInput
            label={t('dashboard:create_character_page.role', 'Role')}
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value as T.RoleEnum })}
            options={[
              { label: t('reports.protagonist', 'Protagonist'), value: 'MAIN_CHARACTER' },
              { label: t('reports.supporting_character', 'Supporting Character'), value: 'SUPPORTING_CHARACTER' }
            ]}
          />
          <TextInput
            label={t('dashboard:create_character_page.archetype', 'Archetype (Optional)')}
            value={editForm.archetype}
            onChange={(e) => setEditForm({ ...editForm, archetype: e.target.value })}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {t('buttons.cancel', 'Cancel')}
            </Button>
            <Button type="submit" isLoading={updateCharacterMutation.isPending}>
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
            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{reviseModalState.question && t(`common:discovery.questions.${reviseModalState.question.question_key}`, reviseModalState.question.question_text)}</div>
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

export default CharacterReport;
