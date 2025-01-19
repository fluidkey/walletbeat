'use client';

import { Box } from '@mui/material';
import type React from 'react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import {
  Navigation,
  type NavigationGroup,
  type NavigationContentItem,
  isNavigationContentItem,
} from '../organisms/Navigation';
import type { NonEmptyArray } from '@/beta/types/utils/non-empty';
import { scrollPastHeaderPixels } from '../../navigation';

const scrollNavigationMargin = 8;

interface TargetContentItem {
  target: NavigationContentItem | null;
  untilTimestamp: number;
}

export const NavigationPageLayout = forwardRef(function NavigationPageLayout(
  {
    groups,
    children,
    contentDependencies = undefined,
    stickyHeaderId = undefined,
    stickyHeaderMargin = undefined,
  }: {
    /**
     * Set of navigation item groups.
     */
    groups: NonEmptyArray<NavigationGroup>;

    /**
     * Content of the page.
     */
    children: React.ReactNode;

    /**
     * If the content has a sticky header, the DOM ID of that header.
     */
    stickyHeaderId?: string;

    /**
     * If the content has a sticky header, the number of pixels below that
     * header which should be considered clear for the purpose of computing
     * content scroll offset.
     */
    stickyHeaderMargin?: number;

    /**
     * Set of dependencies that can change the content of the page, at least
     * in terms of the existence or disappearance of content items.
     * `groups` is already implicitly included in this.
     */
    contentDependencies?: React.DependencyList;
  },
  ref: React.ForwardedRef<{
    /**
     * Scroll to a content item by ID.
     */
    scrollToItemId: (itemId: string) => void;
  }>
) {
  const [lastTargetedItem, setLastTargetedItem] = useState<TargetContentItem>({
    target: null,
    untilTimestamp: Date.now(),
  });
  const [activeItem, setActiveItem] = useState<NavigationContentItem | null>(null);
  const scrollNavigationTo = (item: NavigationContentItem | null): void => {
    if (item === null) {
      return;
    }
    const listItem = document.getElementById(`listItem-${item.id}`);
    if (listItem === null) {
      return;
    }
    const itemGroup: NavigationGroup | undefined = groups.find(group =>
      group.items.find(navItem => navItem.id === item.id)
    );
    if (itemGroup === undefined) {
      return;
    }
    const navigation = document.getElementById(`navigationGroup-${itemGroup.id}`);
    if (navigation === null) {
      return;
    }
    const navigationRect = navigation.getBoundingClientRect();
    const listItemRect = listItem.getBoundingClientRect();
    if (listItemRect.top < navigationRect.top) {
      navigation.scrollBy({
        top: listItemRect.top - navigationRect.top - scrollNavigationMargin,
        behavior: 'smooth',
      });
    } else if (listItemRect.bottom > navigationRect.bottom) {
      navigation.scrollBy({
        top: listItemRect.bottom - navigationRect.bottom + scrollNavigationMargin,
        behavior: 'smooth',
      });
    }
  };
  const scrollToContent = (item: NavigationContentItem | null): void => {
    if (item === null) {
      return;
    }
    const content = document.getElementById(item.contentId);
    if (content === null) {
      return;
    }
    setLastTargetedItem({
      target: item,
      untilTimestamp: Date.now() + 1250,
    });
    history.replaceState(null, '', `#${item.contentId}`);
    content.scrollIntoView({ behavior: 'smooth' });
    scrollNavigationTo(item);
  };
  const handleScroll = useMemo(
    (): (() => void) => () => {
      const atBottom =
        window.scrollY + window.innerHeight >= document.body.offsetHeight - scrollPastHeaderPixels;
      const targetedItem =
        lastTargetedItem.untilTimestamp >= Date.now() ? lastTargetedItem.target : null;
      let bestItem: NavigationContentItem | null = null;
      let bestItemDistance: number | null = null;
      let headerHeight = 0;
      if (stickyHeaderId !== undefined) {
        const stickyHeader = document.getElementById(stickyHeaderId);
        if (stickyHeader !== null) {
          headerHeight = stickyHeader.getBoundingClientRect().bottom;
        }
      }
      headerHeight += stickyHeaderMargin ?? 0;
      for (const group of groups) {
        for (const topLevelItem of group.items) {
          for (const item of [topLevelItem].concat(topLevelItem.children ?? [])) {
            if (!isNavigationContentItem(item)) {
              continue;
            }
            const content = document.getElementById(item.contentId);
            if (content === null) {
              continue;
            }
            const rect = content.getBoundingClientRect();
            const isTarget = targetedItem !== null && item.id === targetedItem.id;
            if (isTarget && rect.top >= 0 && rect.bottom <= document.body.offsetHeight) {
              bestItem = item;
              bestItemDistance = -document.body.offsetHeight * 4;
              break;
            }
            const distance = atBottom ? -rect.bottom : Math.abs(rect.top - headerHeight);
            if (bestItemDistance === null || distance <= bestItemDistance) {
              bestItem = item;
              bestItemDistance = distance;
            }
          }
        }
      }
      setActiveItem(bestItem);
      scrollNavigationTo(bestItem);
    },
    ([groups, lastTargetedItem] as unknown[]).concat(contentDependencies ?? [])
  );
  useEffect(
    (): (() => void) => {
      window.addEventListener('scroll', handleScroll);
      return (): void => {
        window.removeEventListener('scroll', handleScroll);
      };
    },
    ([groups, lastTargetedItem, handleScroll] as unknown[]).concat(contentDependencies ?? [])
  );
  useEffect(
    handleScroll,
    ([groups, lastTargetedItem, handleScroll] as unknown[]).concat(contentDependencies ?? [])
  );
  useImperativeHandle(
    ref,
    () => ({
      scrollToItemId: (itemId: string) => {
        for (const group of groups) {
          for (const topLevelItem of group.items) {
            for (const item of [topLevelItem].concat(topLevelItem.children ?? [])) {
              if (item.id === itemId) {
                if (!isNavigationContentItem(item)) {
                  continue;
                }
                scrollToContent(item);
                return;
              }
            }
          }
        }
      },
    }),
    ([groups] as unknown[]).concat(contentDependencies ?? [])
  );
  return (
    <Box key="pageViewport" display="flex" flexDirection="row" width="100%">
      <Navigation
        key="navigation"
        flex="0"
        groups={groups}
        activeItemId={activeItem === null ? null : activeItem.id}
        onContentItemClick={scrollToContent}
      />
      <Box key="contentSpacerLeft" flex="1" />
      <Box
        key="contentContainer"
        display="flex"
        flex="0"
        flexDirection="column"
        minWidth="60vw"
        maxWidth="80vw"
      >
        {children}
      </Box>
      <Box key="contentSpacerRight" flex="1" />
    </Box>
  );
});
