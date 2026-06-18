import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Feather, Home, Users, Link2, Plus, ChevronLeft, ChevronRight, Compass, FileText } from 'lucide-react';
import { StoryService } from '../../api/services';
import styles from './Sidebar.module.css';

interface SidebarProps {
  storyId: string | null;
  isFirstStoryExperience?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ storyId, isFirstStoryExperience = false }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('common');



  const { data: characters } = useQuery({
    queryKey: ['characters', storyId],
    queryFn: () => StoryService.getCharacters(storyId!),
    enabled: !!storyId,
  });

  const { data: relationships } = useQuery({
    queryKey: ['relationships', storyId],
    queryFn: () => StoryService.getRelationships(storyId!),
    enabled: !!storyId,
  });

  const formatName = (name: string | undefined, defaultName: string) => {
    if (!name) return defaultName;
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0];
    return words.map(w => w[0].toUpperCase()).join('');
  };

  const getNavClass = ({ isActive }: { isActive: boolean }) => 
    `${styles.navItem} ${isActive ? styles.active : ''}`;

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <div className={styles.brand} onClick={() => navigate('/')}>
          <Feather className={styles.brandIcon} size={24} />
          {!collapsed && <span className={styles.brandText}>STORY ARCHITECT</span>}
        </div>
        <button 
          className={styles.collapseBtn} 
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className={styles.scrollArea}>
        <div className={styles.section}>
          <NavLink to="/" className={getNavClass} end>
            <Home size={18} />
            {!collapsed && (
              <span>
                {isFirstStoryExperience
                  ? t('nav.story_architect', 'Story Architect')
                  : t('nav.dashboard', 'Dashboard')}
              </span>
            )}
          </NavLink>
        </div>

        {storyId && (
          <>
            <div className={styles.divider} />
            
            <div className={styles.section}>
              {!collapsed && <span className={styles.sectionTitle}>{t('nav.current_story', 'CURRENT STORY')}</span>}
              <NavLink to={`/stories/${storyId}`} className={getNavClass} end>
                <Compass size={18} />
                {!collapsed && <span className={styles.truncate}>{t('nav.overview', 'Overview')}</span>}
              </NavLink>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                {!collapsed && <span className={styles.sectionTitle}>{t('nav.characters', 'CHARACTERS').toUpperCase()}</span>}
                {!collapsed && (
                  <button className={styles.addBtn} onClick={() => navigate(`/stories/${storyId}/characters/new`)}>
                    <Plus size={14} />
                  </button>
                )}
              </div>
              <div className={styles.list}>
                {characters?.map(char => (
                  <NavLink key={char.id} to={`/characters/${char.id}/discovery`} className={getNavClass}>
                    <Users size={18} className={styles.listIcon} />
                    {!collapsed && <span className={styles.truncate}>{char.name}</span>}
                  </NavLink>
                ))}
                {(!characters || characters.length === 0) && !collapsed && (
                  <div className={styles.emptyState}>{t('nav.no_characters', 'No characters yet')}</div>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                {!collapsed && <span className={styles.sectionTitle}>{t('nav.relationships', 'RELATIONSHIPS').toUpperCase()}</span>}
                {!collapsed && (
                  <button className={styles.addBtn} onClick={() => navigate(`/stories/${storyId}/relationships/new`)}>
                    <Plus size={14} />
                  </button>
                )}
              </div>
              <div className={styles.list}>
                {relationships?.map(rel => {
                  const charA = formatName(characters?.find(c => c.id === rel.character_a_id)?.name, 'Char A');
                  const charB = formatName(characters?.find(c => c.id === rel.character_b_id)?.name, 'Char B');
                  
                  return (
                    <NavLink key={rel.id} to={`/relationships/${rel.id}/discovery`} className={getNavClass}>
                      <Link2 size={18} className={styles.listIcon} />
                      {!collapsed && (
                        <span className={styles.truncate}>
                          {charA} ↔ {charB}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
                {(!relationships || relationships.length === 0) && !collapsed && (
                  <div className={styles.emptyState}>{t('nav.no_relationships', 'No relationships yet')}</div>
                )}
              </div>
            </div>
            
            <div className={styles.divider} />
            
            <div className={styles.section}>
              {!collapsed && <span className={styles.sectionTitle}>{t('nav.reports', 'REPORTS').toUpperCase()}</span>}
              <div className={styles.list}>
                {characters?.map(char => (
                  <NavLink key={`report-${char.id}`} to={`/characters/${char.id}/report`} className={getNavClass}>
                    <FileText size={18} className={styles.listIcon} />
                    {!collapsed && <span className={styles.truncate}>{char.name} {t('nav.report', 'Report')}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
