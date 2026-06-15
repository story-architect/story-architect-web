import React from 'react';
import { Link } from 'react-router-dom';
import { Feather } from 'lucide-react';
import styles from './PageShell.module.css';

interface PageShellProps {
  children: React.ReactNode;
  contextElement?: React.ReactNode;
}

export const PageShell: React.FC<PageShellProps> = ({ children, contextElement }) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <Feather className={styles.brandIcon} size={20} />
          <span className={styles.brandText}>STORY ARCHITECT</span>
        </Link>
        {contextElement && (
          <div className={styles.contextArea}>
            {contextElement}
          </div>
        )}
      </header>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};
