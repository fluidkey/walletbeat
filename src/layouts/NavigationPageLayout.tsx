import theme from '@/components/ThemeRegistry/theme';
import { Box, ThemeProvider } from '@mui/material';
import type React from 'react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import {
  Navigation,
  type NavigationGroup,
  type NavigationContentItem,
  isNavigationContentItem,
  type NavigationItem,
} from '@/components/ui/organisms/Navigation';
import type { NonEmptyArray } from '@/types/utils/non-empty';

const scrollNavigationMargin = 8;

export const NavigationPageLayout = forwardRef(function NavigationPageLayout(
  {
    groups,
    children,
    contentDependencies = [],
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
  const [activeItemId, setActiveItemId] = useState<string>();

  const scrollNavigationTo = (itemId: string): void => {
    const listItem = document.getElementById(`listItem-${itemId}`);
    if (listItem === null) {
      return;
    }
    const itemGroup: NavigationGroup | undefined = groups.find(
      (group: NavigationGroup): boolean =>
        group.items.some((navItem: NavigationItem): boolean => navItem.id === itemId)
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

  useEffect(
    () => {
      if(activeItemId)
        scrollNavigationTo(activeItemId)
    },
    [activeItemId]
  );

  const isPageSmoothScrolling = useRef(false);

  const onHashChange = useCallback(
    (e: HashChangeEvent) => {
      const newUrl = new URL(e.newURL)
      if(newUrl.hash)
        setActiveItemId(newUrl.hash.slice(1))

      isPageSmoothScrolling.current = true

      document.addEventListener(
        'scrollend',
        e => {
          isPageSmoothScrolling.current = false
        },
        { once: true }
      );

      setTimeout(() => {
        isPageSmoothScrolling.current = false
      }, 1250)
    },
    []
  );

  useEffect(
    () => {
      window.addEventListener('hashchange', onHashChange, { passive: true });
      return () => {
        window.removeEventListener('hashchange', onHashChange);
      };
    },
    [groups, onHashChange]
  );

  const onScroll = useCallback(
    (e: Event) => {
      if(isPageSmoothScrolling.current)
        return

      const stickyHeaderElement = stickyHeaderId ? document.getElementById(stickyHeaderId) : undefined;

      const topBound = (
        (stickyHeaderElement?.getBoundingClientRect().bottom ?? 0)
        + (stickyHeaderMargin ?? 0)
      );

      const items = (
        groups
          .flatMap(group => (
            group.items
              .flatMap(topLevelItem => [topLevelItem, ...topLevelItem.children ?? []])
          ))
          .filter(isNavigationContentItem)
      );

      const activeItem = items.find((item, i, { length }) => {
        if(i === length - 1) return true

        const headingElement = document.getElementById(item.contentId);
        return headingElement && headingElement.getBoundingClientRect().bottom > topBound;
      })!

      setActiveItemId(activeItem.id);
    },
    [groups]
  );

  useEffect(
    () => {
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', onScroll);
      };
    },
    [groups, onScroll, ...contentDependencies]
  );

  return (
    <ThemeProvider theme={theme}>
      <Box key="pageViewport" display="flex" flexDirection="row" width="100%">
        <Navigation
          key="navigation"
          flex="0"
          groups={groups}
          activeItemId={activeItemId}
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
    </ThemeProvider>
  );
});
