import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import type { CharacterArchitectureReportResponse } from '../../types';
import styles from './DramaticArchitectureFlow.module.css';
import { Edit2, ArrowDown, AlertCircle } from 'lucide-react';
import { ReviseInterpretationModal } from './ReviseInterpretationModal';

interface DramaticArchitectureFlowProps {
  report: CharacterArchitectureReportResponse;
}

export const DramaticArchitectureFlow: React.FC<DramaticArchitectureFlowProps> = ({ report }) => {
  const { t } = useTranslation(['common', 'insights']);
  const [editingField, setEditingField] = useState<{
    key: 'narrative_consequence_custom' | 'conflict_created_custom' | 'pressure_point_custom' | 'transformation_path_custom';
    label: string;
    generatedValue: string;
    customValue?: string | null;
  } | null>(null);

  const translateInsight = (val?: string | null): string => {
    if (!val) return '';
    if (val.startsWith('insights.')) {
      return t(val.replace('insights.', ''), { ns: 'insights' });
    }
    return val;
  };

  const nodes = [
    {
      label: t('reports.labels.BEHAVIOR', 'BEHAVIOR'),
      generated: report.behavior !== 'Not discovered yet.' ? translateInsight(report.behavior) : t('common:discovery.not_discovered_yet', 'Not discovered yet.'),
      custom: null,
      customKey: null,
      isOutdated: false,
    },
    {
      label: t('reports.labels.NARRATIVE_CONSEQUENCE', 'NARRATIVE CONSEQUENCE'),
      generated: translateInsight(report.narrative_consequence),
      custom: report.narrative_consequence_custom,
      customKey: 'narrative_consequence_custom',
      isOutdated: report.custom_outdated_fields?.narrative_consequence_custom === true,
    },
    {
      label: t('reports.labels.CONFLICT_CREATED', 'CONFLICT CREATED'),
      generated: translateInsight(report.conflict_created),
      custom: report.conflict_created_custom,
      customKey: 'conflict_created_custom',
      isOutdated: report.custom_outdated_fields?.conflict_created_custom === true,
    },
    {
      label: t('reports.labels.PRESSURE_POINT', 'PRESSURE POINT'),
      generated: translateInsight(report.pressure_point),
      custom: report.pressure_point_custom,
      customKey: 'pressure_point_custom',
      isOutdated: report.custom_outdated_fields?.pressure_point_custom === true,
    },
    {
      label: t('reports.labels.TRANSFORMATION_PATH', 'TRANSFORMATION PATH'),
      generated: translateInsight(report.transformation_path),
      custom: report.transformation_path_custom,
      customKey: 'transformation_path_custom',
      isOutdated: report.custom_outdated_fields?.transformation_path_custom === true,
    }
  ];

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>
        {t('reports.dramatic_architecture_title', 'Character-Driven Dramatic Architecture')}
      </h3>
      <p className={styles.sectionDescription}>
        {t('reports.dramatic_architecture_desc', 'What story naturally emerges from who this character is?')}
      </p>

      <div className={styles.flow}>
        {nodes.map((node, index) => {
          const displayValue = node.custom || node.generated;
          
          return (
            <React.Fragment key={index}>
              <Card className={styles.nodeCard}>
                <div className={styles.nodeHeader}>
                  <span className={styles.nodeLabel}>{node.label}</span>
                  {node.customKey && (
                    <button 
                      className={styles.editButton}
                      onClick={() => setEditingField({
                        key: node.customKey as 'narrative_consequence_custom' | 'conflict_created_custom' | 'pressure_point_custom' | 'transformation_path_custom',
                        label: node.label,
                        generatedValue: node.generated,
                        customValue: node.custom
                      })}
                      title={t('reports.edit_interpretation', 'Edit Interpretation')}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>

                <p className={styles.nodeValue}>"{displayValue}"</p>

                {node.isOutdated && (
                  <div className={styles.outdatedWarning}>
                    <AlertCircle size={14} />
                    <span>{t('reports.outdated_interpretation', 'This interpretation was written before your latest revisions.')}</span>
                    <button 
                      className={styles.resolveButton}
                      onClick={() => setEditingField({
                        key: node.customKey as 'narrative_consequence_custom' | 'conflict_created_custom' | 'pressure_point_custom' | 'transformation_path_custom',
                        label: node.label,
                        generatedValue: node.generated,
                        customValue: node.custom
                      })}
                    >
                      {t('reports.resolve', 'Resolve')}
                    </button>
                  </div>
                )}
              </Card>

              {index < nodes.length - 1 && (
                <div className={styles.arrowContainer}>
                  <ArrowDown size={20} className={styles.arrow} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {editingField && (
        <ReviseInterpretationModal
          key={editingField.key}
          isOpen={true}
          onClose={() => setEditingField(null)}
          reportId={report.id}
          characterId={report.character_id}
          fieldKey={editingField.key}
          label={editingField.label}
          generatedValue={editingField.generatedValue}
          customValue={editingField.customValue}
          isOutdated={report.custom_outdated_fields?.[editingField.key] === true}
        />
      )}
    </div>
  );
};
