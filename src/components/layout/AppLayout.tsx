import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CharacterService, RelationshipService } from '../../api/services';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import styles from './AppLayout.module.css';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const [resolvedStoryId, setResolvedStoryId] = useState<string | null>(null);

  // Extract IDs from URL manually since useParams in a wrapper might not reliably catch deep nested params without nested routes
  const path = location.pathname;
  const storyMatch = path.match(/\/stories\/([^\/]+)/);
  const charMatch = path.match(/\/characters\/([^\/]+)/);
  const relMatch = path.match(/\/relationships\/([^\/]+)/);

  const urlStoryId = storyMatch && storyMatch[1] !== 'new' ? storyMatch[1] : null;
  const urlCharId = charMatch ? charMatch[1] : null;
  const urlRelId = relMatch ? relMatch[1] : null;

  // We need to resolve the story ID if we are on a character or relationship page
  useEffect(() => {
    if (urlStoryId) {
      setResolvedStoryId(urlStoryId);
    } else if (urlCharId) {
      CharacterService.getById(urlCharId).then(c => setResolvedStoryId(c.story_id)).catch(() => {});
    } else if (urlRelId) {
      RelationshipService.getById(urlRelId).then(r => setResolvedStoryId(r.story_id)).catch(() => {});
    } else {
      setResolvedStoryId(null);
    }
  }, [urlStoryId, urlCharId, urlRelId]);

  return (
    <div className={styles.layout}>
      <Sidebar storyId={resolvedStoryId} />
      <div className={styles.mainContent}>
        <TopNav storyId={resolvedStoryId} charId={urlCharId} relId={urlRelId} />
        <main className={styles.pageArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
