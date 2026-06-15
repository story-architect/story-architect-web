import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Scale, HeartCrack } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ArchitectureChain } from '../components/story/ArchitectureChain';
import { InsightCard } from '../components/story/InsightCard';
import { ReportService, RelationshipService } from '../api/services';
import styles from './RelationshipReport.module.css';

const RelationshipReport: React.FC = () => {
  const { relationshipId } = useParams<{ relationshipId: string }>();
  const navigate = useNavigate();

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

  if (isLoading || !report) {
    return <div className={styles.loading}>Generating Consequence Report...</div>;
  }

  const chainNodes = [
    { label: 'CURRENT RESULT', value: report.current_result },
    { label: 'EMOTIONAL EFFECT', value: report.emotional_effect },
    { label: 'STORY CONSEQUENCE', value: report.story_consequence },
    { label: 'CURRENT RELATIONSHIP RISK', value: report.current_relationship_risk, isGlowing: true },
    { label: 'TURNING POINT', value: report.turning_point }
  ];

  return (
    <div className={styles.pageLayout}>
      <div className={styles.scrollContent}>
        
        <div className={styles.header}>
          <span className={styles.pretitle}>DISCOVERY COMPLETE</span>
          <h1 className={styles.title}>Relationship Consequence</h1>
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
            <p className={styles.characterRole}>The Catalyst</p>
            
            <div className={styles.sideCardContainer}>
              <InsightCard 
                label="RELATIONSHIP LAW" 
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
              <p>Every relationship has a hidden architecture.<br/><em>Understanding it changes everything.</em></p>
              <div className={styles.ornamentSmall}>✦</div>
            </div>
            
            <div className={styles.nextStep}>
              <Button 
                size="lg" 
                onClick={() => navigate(`/stories/${relationship?.story_id}`)}
                icon={<ArrowRight size={20} />}
              >
                Return to Story Overview
              </Button>
            </div>
          </div>

          {/* Character B Side */}
          <div className={styles.characterSideRight}>
            <div className={styles.portraitBox}>
              <div className={styles.portraitPlaceholder}>
                <UserSilhouette />
              </div>
            </div>
            <h2 className={styles.characterName}>{relationship?.character_b_name || 'Character B'}</h2>
            <p className={styles.characterRole}>The Counterpart</p>
            
            <div className={styles.sideCardContainer}>
              <InsightCard 
                label="RELATIONSHIP RISK" 
                icon={<HeartCrack size={20} />}
                className={styles.riskCard}
              >
                {report.current_relationship_risk}
              </InsightCard>
            </div>
          </div>

        </div>

      </div>
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
