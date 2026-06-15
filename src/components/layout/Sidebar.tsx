import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Feather, Home, Users, Link2, Plus, ChevronLeft, ChevronRight, Compass, FileText } from 'lucide-react';
import { StoryService } from '../../api/services';
import styles from './Sidebar.module.css';

interface SidebarProps {
  storyId: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ storyId }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();



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
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
        </div>

        {storyId && (
          <>
            <div className={styles.divider} />
            
            <div className={styles.section}>
              {!collapsed && <span className={styles.sectionTitle}>CURRENT STORY</span>}
              <NavLink to={`/stories/${storyId}`} className={getNavClass} end>
                <Compass size={18} />
                {!collapsed && <span className={styles.truncate}>Overview</span>}
              </NavLink>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                {!collapsed && <span className={styles.sectionTitle}>CHARACTERS</span>}
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
                  <div className={styles.emptyState}>No characters yet</div>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                {!collapsed && <span className={styles.sectionTitle}>RELATIONSHIPS</span>}
                {!collapsed && (
                  <button className={styles.addBtn} onClick={() => navigate(`/stories/${storyId}/relationships/new`)}>
                    <Plus size={14} />
                  </button>
                )}
              </div>
              <div className={styles.list}>
                {relationships?.map(rel => (
                  <NavLink key={rel.id} to={`/relationships/${rel.id}/discovery`} className={getNavClass}>
                    <Link2 size={18} className={styles.listIcon} />
                    {!collapsed && (
                      <span className={styles.truncate}>
                        {rel.character_a_name?.split(' ')[0]} ↔ {rel.character_b_name?.split(' ')[0]}
                      </span>
                    )}
                  </NavLink>
                ))}
                {(!relationships || relationships.length === 0) && !collapsed && (
                  <div className={styles.emptyState}>No relationships yet</div>
                )}
              </div>
            </div>
            
            <div className={styles.divider} />
            
            <div className={styles.section}>
              {!collapsed && <span className={styles.sectionTitle}>REPORTS</span>}
              <div className={styles.list}>
                {characters?.map(char => (
                  <NavLink key={`report-${char.id}`} to={`/characters/${char.id}/report`} className={getNavClass}>
                    <FileText size={18} className={styles.listIcon} />
                    {!collapsed && <span className={styles.truncate}>{char.name} Report</span>}
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
