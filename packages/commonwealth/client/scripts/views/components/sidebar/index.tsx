import clsx from 'clsx';
import 'components/sidebar/index.scss';
import React, { useEffect, useMemo } from 'react';
import app from 'state';
import useSidebarStore from 'state/ui/sidebar';
import { CreateContentSidebar } from '../../menus/create_content_menu';
import { SidebarHeader } from '../component_kit/CWSidebarHeader';
import { CommunitySection } from './CommunitySection';
import { ExploreCommunitiesSidebar } from './explore_sidebar';
import { SidebarQuickSwitcher } from './sidebar_quick_switcher';

export type SidebarMenuName =
  | 'default'
  | 'createContent'
  | 'exploreCommunities';

export const Sidebar = ({
  isInsideCommunity,
}: {
  isInsideCommunity: boolean;
}) => {
  const {
    menuName,
    menuVisible,
    setRecentlyUpdatedVisibility,
    recentlyUpdatedVisibility,
  } = useSidebarStore();

  useEffect(() => {
    setRecentlyUpdatedVisibility(false);
  }, [setRecentlyUpdatedVisibility]);

  const sidebarClass = useMemo(() => {
    return clsx('Sidebar', {
      onadd: menuVisible && recentlyUpdatedVisibility,
      onremove: !menuVisible,
    });
  }, [menuVisible, recentlyUpdatedVisibility]);

  return (
    <div className={sidebarClass}>
      {isInsideCommunity && (
        <div className="sidebar-header-wrapper">
          <SidebarHeader />
        </div>
      )}
      <div className="sidebar-default-menu">
        <SidebarQuickSwitcher isInsideCommunity={isInsideCommunity} />
        {isInsideCommunity && (
          <CommunitySection showSkeleton={!app.activeChainId()} />
        )}
        {menuName === 'createContent' && (
          <CreateContentSidebar isInsideCommunity={isInsideCommunity} />
        )}
        {menuName === 'exploreCommunities' && (
          <ExploreCommunitiesSidebar isInsideCommunity={isInsideCommunity} />
        )}
      </div>
    </div>
  );
};
