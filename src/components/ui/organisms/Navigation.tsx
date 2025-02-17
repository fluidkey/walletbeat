import { type NonEmptyArray, nonEmptyMap } from '@/types/utils/non-empty';
import {
  Box,
  Typography,
  List,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Divider,
  ListItem,
} from '@mui/material';
import React, { memo } from 'react';
import {
  navigationListFontSizePrimary,
  navigationListFontSizeSecondary,
  navigationListIconSize,
  navigationListItemRadius,
} from '../../constants';

/**
 * Size of the navigation menu, in pixels.
 */
const drawerWidth = 280;

/**
 * A navigation item in the navigation menu.
 */
interface NavigationItemBase {
  /**
   * Unique string identifying the item.
   */
  id: string;

  /**
   * Item icon shown next to the item name in the navigation menu.
   */
  icon: React.ReactNode;

  /**
   * Item name in the navigation menu.
   */
  title: string;

  /**
   * Set of children navigation items.
   * Only one level of nesting is supported.
   */
  children?: NavigationItem[];
}

/**
 * A navigation item in the navigation menu that also corresponds to a
 * content section in the main body of the page.
 */
export interface NavigationContentItem extends NavigationItemBase {
  /**
   * The DOM `id` of the content block that the navigation item represents.
   * Also used as URL anchor for that content section.
   */
  contentId: string;
}

export interface NavigationLinkItem extends NavigationItemBase {
  /**
   * URL to navigate to when clicked.
   */
  href: string;
}

export type NavigationItem = NavigationContentItem | NavigationLinkItem;

/**
 * Type predicate for `NavigationContentItem`.
 */
export function isNavigationContentItem(item: NavigationItem): item is NavigationContentItem {
  return Object.hasOwn(item, 'contentId');
}

/**
 * Type predicate for `NavigationLinkItem`.
 */
export function isNavigationLinkItem(item: NavigationItem): item is NavigationLinkItem {
  return Object.hasOwn(item, 'href');
}

/**
 * Set of logically-grouped navigation items.
 */
export interface NavigationGroup {
  /**
   * Unique name for the group of items.
   */
  id: string;

  /**
   * Set of navigation items in the group.
   * This contains top-level navigation items only.
   * Each item within may contain sub-items (with only one
   * level of nesting).
   */
  items: NonEmptyArray<NavigationItem>;
  /**
   * If true, allow this navigation group to scroll on the Y axis if it
   * overflows, and expand this group to take as much height as possible.
   * This should be true on at most one group in a set of navigation groups.
   */
  overflow: boolean;
}

/**
 * Icon shown next to navigation list items.
 */
function SingleListItemIcon({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <ListItemIcon
      key="listItemIcon"
      sx={{
        minWidth: `${navigationListIconSize}px`,
        width: `${navigationListIconSize}px`,
        height: `${navigationListIconSize}px`,
        display: 'inline-block',
        textAlign: 'center',
        marginRight: '4px',
      }}
    >
      {children}
    </ListItemIcon>
  );
}

interface NavigationItemProps {
  item: NavigationItem;
  active: boolean;
  depth: 'primary' | 'secondary';
  sx?: React.ComponentProps<typeof ListItem>['sx'];
  onContentItemClick?: (item: NavigationContentItem) => void;
}

/**
 * A single navigation list item.
 */
const NavigationItem = memo(
  function NavigationItem({ item, active, depth, sx }: NavigationItemProps): React.JSX.Element {
    const ButtonComponent = ({
      children,
    }: {
      children: React.ComponentProps<typeof ListItemButton>['children'];
    }): React.JSX.Element => {
      if (isNavigationContentItem(item)) {
        return (
          <ListItemButton
            component="a"
            href={`#${item.contentId}`}
            disableRipple={true}
            selected={active}
            sx={{ borderRadius: `${navigationListItemRadius}px` }}
          >
            {children}
          </ListItemButton>
        );
      }
      if (isNavigationLinkItem(item)) {
        return (
          <ListItemButton
            component="a"
            href={item.href}
            target={item.href.startsWith('https://') ? '_blank' : undefined}
            disableRipple={true}
            selected={active}
            sx={{ borderRadius: `${navigationListItemRadius}px` }}
          >
            {children}
          </ListItemButton>
        );
      }
      throw new Error('Invalid navigation item');
    };
    return (
      <ListItem
        key={`listItem-${item.id}`}
        id={`listItem-${item.id}`}
        disablePadding={true}
        sx={{
          ...sx,
          width: 'auto',
          marginLeft: depth === 'secondary' ? `${navigationListIconSize * 0.75}px` : undefined,
        }}
      >
        <ButtonComponent key="buttonComponent">
          <SingleListItemIcon key="icon">{item.icon}</SingleListItemIcon>
          <ListItemText
            key="listItemText"
            primary={
              <Typography
                sx={{
                  fontSize:
                    depth === 'primary'
                      ? navigationListFontSizePrimary
                      : navigationListFontSizeSecondary,
                }}
              >
                {item.title}
              </Typography>
            }
            sx={{ whiteSpace: 'nowrap' }}
          />
        </ButtonComponent>
      </ListItem>
    );
  },
  (prevProps: Readonly<NavigationItemProps>, nextProps: Readonly<NavigationItemProps>): boolean =>
    prevProps.item.id === nextProps.item.id &&
    prevProps.depth === nextProps.depth &&
    prevProps.active === nextProps.active
);

const navigationBoxStyle = {
  width: drawerWidth,
  minWidth: drawerWidth,
  position: 'sticky',
  top: '0px',
  height: '100vh',
  bottom: '0px',
};

interface NavigationGroupProps {
  group: NavigationGroup;
  groupIndex: number;
  activeItemId?: string;
  onContentItemClick?: (item: NavigationContentItem) => void;
}

export const NavigationGroup = memo(
  function NavigationGroup({
    group,
    groupIndex,
    activeItemId,
    onContentItemClick,
  }: NavigationGroupProps): React.JSX.Element {
    return (
      <React.Fragment key={`navigationFragment-${group.id}`}>
        {groupIndex === 0 ? null : (
          <Divider
            key={`navigationGroupDivider-${group.id}`}
            orientation="horizontal"
            variant="middle"
            flexItem={true}
          />
        )}
        <List
          key={`navigationGroupBox-${group.id}`}
          id={`navigationGroup-${group.id}`}
          sx={group.overflow ? { overflowY: 'auto', flex: '1' } : { flex: '0' }}
        >
          {nonEmptyMap(group.items, item => (
            <React.Fragment key={`fragment-${item.id}`}>
              <NavigationItem
                key={`item-${item.id}`}
                item={item}
                active={activeItemId === item.id}
                depth="primary"
                onContentItemClick={onContentItemClick}
              />
              {(item.children?.length ?? 0) > 0 ? (
                <List key={`subitems-${item.id}`} component="div" disablePadding>
                  {item.children?.map(subitem => (
                    <NavigationItem
                      key={`subitem-${subitem.id}`}
                      item={subitem}
                      depth="secondary"
                      active={activeItemId === subitem.id}
                      onContentItemClick={onContentItemClick}
                    />
                  ))}
                </List>
              ) : null}
            </React.Fragment>
          ))}
        </List>
      </React.Fragment>
    );
  },
  (
    prevProps: Readonly<NavigationGroupProps>,
    nextProps: Readonly<NavigationGroupProps>
  ): boolean => {
    if (prevProps.group !== nextProps.group) {
      return false;
    }
    if (prevProps.groupIndex !== nextProps.groupIndex) {
      return false;
    }
    if (prevProps.onContentItemClick !== nextProps.onContentItemClick) {
      return false;
    }
    if (prevProps.activeItemId === nextProps.activeItemId) {
      return true;
    }
    // Check if active item ID is one of the sub-items of this group.
    for (const props of [prevProps, nextProps]) {
      for (const item of props.group.items) {
        if (item.id === props.activeItemId) {
          return false;
        }
        for (const subItem of item.children ?? []) {
          if (subItem.id === props.activeItemId) {
            return false;
          }
        }
      }
    }
    return true;
  }
);

/**
 * The navigation bar on a page.
 */
export function Navigation({
  groups,
  activeItemId,
  flex,
  onContentItemClick = undefined,
}: {
  groups: NonEmptyArray<NavigationGroup>;
  activeItemId?: string;
  flex?: React.ComponentProps<typeof Box>['flex'];
  onContentItemClick?: (item: NavigationContentItem) => void;
}): React.JSX.Element {
  return (
    <Box
      key="navigationBox"
      flex={flex}
      display="flex"
      flexDirection="column"
      gap="0px"
      sx={navigationBoxStyle}
    >
      {nonEmptyMap(groups, (group, groupIndex) => (
        <NavigationGroup
          key={`navigationGroup-${group.id}`}
          group={group}
          groupIndex={groupIndex}
          onContentItemClick={onContentItemClick}
          activeItemId={activeItemId}
        />
      ))}
    </Box>
  );
}
