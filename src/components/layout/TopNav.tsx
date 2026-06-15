import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronRight, User } from 'lucide-react';
import { StoryService, CharacterService, RelationshipService } from '../../api/services';
import styles from './TopNav.module.css';

interface TopNavProps {
  storyId: string | null;
  charId: string | null;
  relId: string | null;
}

export const TopNav: React.FC<TopNavProps> = ({ storyId, charId, relId }) => {
  const { data: story } = useQuery({
    queryKey: ['story', storyId],
    queryFn: () => StoryService.getById(storyId!),
    enabled: !!storyId,
  });

  const { data: char } = useQuery({
    queryKey: ['character', charId],
    queryFn: () => CharacterService.getById(charId!),
    enabled: !!charId,
  });

  const { data: rel } = useQuery({
    queryKey: ['relationship', relId],
    queryFn: () => RelationshipService.getById(relId!),
    enabled: !!relId,
  });

  return (
    <header className={styles.topnav}>
      <div className={styles.breadcrumbs}>
        <Link to="/" className={styles.crumb}>Dashboard</Link>
        
        {story && (
          <>
            <ChevronRight size={14} className={styles.separator} />
            <Link to={`/stories/${story.id}`} className={styles.crumb}>{story.title}</Link>
          </>
        )}
        
        {char && (
          <>
            <ChevronRight size={14} className={styles.separator} />
            <span className={styles.crumbActive}>{char.name}</span>
          </>
        )}
        
        {rel && (
          <>
            <ChevronRight size={14} className={styles.separator} />
            <span className={styles.crumbActive}>
              {rel.character_a_name?.split(' ')[0]} ↔ {rel.character_b_name?.split(' ')[0]}
            </span>
          </>
        )}
      </div>

      <div className={styles.actions}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input type="text" placeholder="Search..." className={styles.searchInput} disabled />
        </div>
        
        <div className={styles.profile}>
          <div className={styles.avatar}>
            <User size={16} />
          </div>
          <span className={styles.userName}>Writer</span>
        </div>
      </div>
    </header>
  );
};
