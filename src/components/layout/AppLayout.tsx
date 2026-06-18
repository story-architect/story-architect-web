import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CharacterService, RelationshipService, StoryService } from '../../api/services';
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
  const urlCharId = charMatch && charMatch[1] !== 'new' ? charMatch[1] : null;
  const urlRelId = relMatch && relMatch[1] !== 'new' ? relMatch[1] : null;

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

  const { data: firstPageStories } = useQuery({
    queryKey: ['stories', 'first-story-shell'],
    queryFn: () => StoryService.getAll(0, 1),
    enabled: path === '/',
  });

  const resolvedStoryId = urlStoryId || charData?.story_id || relData?.story_id || null;
  const isFirstStoryExperience = path === '/' && firstPageStories?.total === 0;

  return (
    <div className={styles.layout}>
      <Sidebar storyId={resolvedStoryId} isFirstStoryExperience={isFirstStoryExperience} />
      <div className={styles.mainContent}>
        {!isFirstStoryExperience && <TopNav storyId={resolvedStoryId} charId={urlCharId} relId={urlRelId} />}
        <main className={styles.pageArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
