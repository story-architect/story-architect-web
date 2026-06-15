import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Shield, Flame, Map, Users, Info, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ArchitectureChain } from '../components/story/ArchitectureChain';
import { DiscoverySidebar } from '../components/story/DiscoverySidebar';
import { InsightCard } from '../components/story/InsightCard';
import { ReportService, CharacterService } from '../api/services';
import styles from './CharacterReport.module.css';

const CharacterReport: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();

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

        </div>
      </div>
    </div>
  );
};

export default CharacterReport;
