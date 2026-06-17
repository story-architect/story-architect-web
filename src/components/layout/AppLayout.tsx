import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CharacterService, RelationshipService } from '../../api/services';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import styles from './AppLayout.module.css';

export const AppLayout: React.FC = () => {
  const location = useLocation();

  // Extract IDs from URL manually since useParams in a wrapper might not reliably catch deep nested params without nested routes
  const path = location.pathname;
  const storyMatch = path.match(/\/stories\/([^/]+)/);
  const charMatch = path.match(/\/characters\/([^/]+)/);
  const relMatch = path.match(/\/relationships\/([^/]+)/);

  const urlStoryId = storyMatch && storyMatch[1] !== 'new' ? storyMatch[1] : null;
  const urlCharId = charMatch ? charMatch[1] : null;
  const urlRelId = relMatch ? relMatch[1] : null;

  const { data: charData } = useQuery({
    queryKey: ['character', urlCharId],
    queryFn: () => CharacterService.getById(urlCharId!),
    enabled: !!urlCharId && !urlStoryId,
  });

  const { data: relData } = useQuery({
    queryKey: ['relationship', urlRelId],
    queryFn: () => RelationshipService.getById(urlRelId!),
    enabled: !!urlRelId && !urlStoryId && !urlCharId,
  });

  const resolvedStoryId = urlStoryId || charData?.story_id || relData?.story_id || null;

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
