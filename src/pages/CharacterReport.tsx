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
  const { t } = useTranslation('common');

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
    { label: 'Emotional Wound', isComplete: true },
    { label: 'Deepest Fear', isComplete: true },
    { label: 'Protective Lie', isComplete: true },
    { label: 'Relationship Pattern', isComplete: true },
    { label: 'Narrative Consequence', isComplete: true, isGlowing: true },
  ];

  const engineNodes = [
    { label: 'EMOTIONAL WOUND', value: report.emotional_wound, icon: <Heart size={20} /> },
    { label: 'FEAR', value: report.deepest_fear, icon: <Info size={20} /> },
    { label: 'PROTECTIVE LIE', value: report.protective_lie, icon: <Shield size={20} /> },
    { label: 'RELATIONSHIP PATTERN', value: report.behavior, icon: <Users size={20} /> },
    { label: 'STORY CONFLICT', value: report.conflict_created, icon: <Flame size={20} /> },
    { label: 'TRANSFORMATION', value: report.transformation, icon: <Sparkles size={20} /> }
  ];

  const consequenceNodes = [
    { label: 'PROTECTIVE LIE', value: report.protective_lie },
    { label: 'BEHAVIOR', value: report.behavior },
    { label: 'STORY CONSEQUENCE', value: report.narrative_consequence, isGlowing: true },
    { label: 'CONFLICT CREATED', value: report.conflict_created }
  ];

  // Dynamic sentence generation
  const name = character?.name || 'The character';
  const firstName = name.split(' ')[0];
    
  return (
    <div className={styles.pageLayout}>
      <DiscoverySidebar 
        name={name}
        role={character?.archetype || (character?.role === 'MAIN_CHARACTER' ? 'The Protagonist' : 'Supporting Character')}
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
              <span className={styles.pretitle}>DISCOVERY COMPLETE</span>
              <h1 className={styles.title}>Your Story Engine Is <em>Emerging</em></h1>
              <div className={styles.ornament}>❧</div>
            </div>
            
            <ArchitectureChain nodes={engineNodes} />
            
            <div className={styles.quoteBlock}>
              <div className={styles.quoteMark}>"</div>
              <p>This is not a character trait.<br/><em>This is a story waiting to happen.</em></p>
              <div className={styles.ornamentSmall}>✦</div>
            </div>
          </section>

          {/* SCREEN 2: Why This Creates Drama */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.ornamentSmall}>✦</div>
              <h1 className={styles.title}>Why This Matters</h1>
              <div className={styles.ornament}>❧</div>
            </div>

            <InsightCard 
              className={styles.wideCard}
              title={
                <span>This belief doesn't just shape who your character is.<br/><em>It shapes what happens to them.</em></span>
              }
            >
              <div className={styles.threeColumn}>
                <div className={styles.column}>
                  <div className={styles.columnIcon}><Users size={24} /></div>
                  <h4 className={styles.columnTitle}>RELATIONSHIPS</h4>
                  <div className={styles.ornamentMicro}>❧</div>
                  <p className={styles.columnText}>People struggle to get close to them.</p>
                </div>
                <div className={styles.column}>
                  <div className={styles.columnIcon}><Map size={24} /></div>
                  <h4 className={styles.columnTitle}>CHOICES</h4>
                  <div className={styles.ornamentMicro}>❧</div>
                  <p className={styles.columnText}>Important opportunities are rejected.</p>
                </div>
                <div className={styles.column}>
                  <div className={styles.columnIcon}><Flame size={24} /></div>
                  <h4 className={styles.columnTitle}>CONFLICT</h4>
                  <div className={styles.ornamentMicro}>❧</div>
                  <p className={styles.columnText}>They create the very outcome they fear.</p>
                </div>
              </div>

              <div className={styles.dramaticPotential}>
                <div className={styles.dpHeader}>
                  <span>✦</span> DRAMATIC POTENTIAL <span>✦</span>
                </div>
                <p className={styles.dpText}>
                  Because {firstName} fears their wound, they protect themselves. <br/>
                  <em>The more someone cares about them, the more likely they push them away.</em>
                </p>
                <div className={styles.ornamentMicro}>❧</div>
                <p className={styles.dpFooter}>This creates the central emotional conflict of their story.</p>
              </div>
            </InsightCard>
          </section>

          {/* SCREEN 3: Narrative Consequence Revealed */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.pretitle}>NARRATIVE CONSEQUENCE REVEALED</span>
              <h1 className={styles.dynamicSentence}>
                Because {firstName} believes "{report.protective_lie.replace('.', '')}",<br/>
                <em>they push away the people most capable of helping them.</em>
              </h1>
            </div>

            <ArchitectureChain nodes={consequenceNodes} />
          </section>

          {/* SCREEN 4: Where The Story Begins */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.pretitle}>DISCOVERY COMPLETE</span>
              <h1 className={styles.title}>Where The Story Begins</h1>
              <div className={styles.ornament}>❧</div>
              <p className={styles.subtitle}>Your character's foundation has been revealed.</p>
            </div>

            <InsightCard 
              isGlowing 
              className={styles.keyInsightCard}
              label="KEY INSIGHT"
              icon={<Sparkles size={24} />}
            >
              <p className={styles.kiText}>
                Because {firstName} fears their wound,<br/>
                <em>they protect themselves through their lie.</em>
              </p>
              <div className={styles.ornamentMicro}>❧</div>
              <p className={styles.kiSubtext}>
                This causes them to reject support, misread affection,<br/>
                and isolate themselves when they need people most.
              </p>
            </InsightCard>

            <div className={styles.threeColumnGrid}>
              <InsightCard label="THE INCITING RELATIONSHIP" icon={<Users size={20} />}>
                Someone enters their life who refuses to leave.
              </InsightCard>
              <InsightCard label="THE CENTRAL CONFLICT" icon={<Flame size={20} />}>
                They must choose between safety and connection.
              </InsightCard>
              <InsightCard label="THE TRANSFORMATION" icon={<Sparkles size={20} />}>
                They must learn that vulnerability is not weakness.
              </InsightCard>
            </div>

            <InsightCard className={styles.finaleCard}>
              <div className={styles.finaleContent}>
                <div className={styles.finaleIcon}><Sparkles size={32} /></div>
                <div className={styles.finaleText}>
                  We now understand not only who this character is.<br/>
                  <em>We understand why their story exists.</em>
                </div>
              </div>
            </InsightCard>

            <div className={styles.nextStep}>
              <Button 
                size="lg" 
                onClick={() => navigate(`/stories/${character?.story_id}`)}
                icon={<ArrowRight size={20} />}
              >
                Return to Story Overview
              </Button>
            </div>
          </section>

          {/* SCREEN 5: Discovery Answers */}
          <section className={styles.section} style={{ marginTop: '4rem' }}>
            <div className={styles.sectionHeader}>
              <span className={styles.pretitle}>REVISION</span>
              <h1 className={styles.title}>Discovery Answers</h1>
              <div className={styles.ornament}>❧</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {answers?.map(ans => {
                const question = questions?.find(q => q.id === ans.question_id);
                return (
                  <InsightCard key={ans.id} label={question?.question_text || 'Question'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {ans.custom_answer || ans.selected_answer || 'No answer provided'}
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
            label="Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          <TextInput
            type="number"
            label="Age"
            value={editForm.age}
            onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) || 0 })}
            required
          />
          <SelectInput
            label="Role"
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value as T.RoleEnum })}
            options={[
              { label: 'Protagonist', value: 'MAIN_CHARACTER' },
              { label: 'Supporting Character', value: 'SUPPORTING_CHARACTER' }
            ]}
          />
          <TextInput
            label="Archetype (Optional)"
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
        title={t('buttons.revise_answer', 'Revise Answer')}
      >
        <form onSubmit={handleReviseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ marginBottom: '1rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            "{reviseModalState.question?.question_text}"
          </div>
          <TextArea
            label="Your Answer"
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
              {t('buttons.save_changes', 'Save Changes')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CharacterReport;
