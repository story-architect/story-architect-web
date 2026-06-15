import React from 'react';
import { Card } from '../ui/Card';
import styles from './ArchitectureChain.module.css';

export interface ChainNode {
  label: string;
  value: string;
  icon?: React.ReactNode;
  isGlowing?: boolean;
}

interface ArchitectureChainProps {
  nodes: ChainNode[];
}

export const ArchitectureChain: React.FC<ArchitectureChainProps> = ({ nodes }) => {
  return (
    <div className={styles.chainContainer}>
      {nodes.map((node, index) => (
        <React.Fragment key={index}>
          <Card className={`${styles.nodeCard} ${node.isGlowing ? styles.glowing : ''}`}>
            {node.icon && <div className={styles.iconContainer}>{node.icon}</div>}
            <div className={styles.nodeContent}>
              <span className={styles.nodeLabel}>{node.label}</span>
              <span className={styles.nodeValue}>"{node.value}"</span>
            </div>
          </Card>
          
          {index < nodes.length - 1 && (
            <div className={styles.connector}>
              <div className={styles.line}></div>
              <div className={styles.diamond}>✦</div>
              <div className={styles.line}></div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
