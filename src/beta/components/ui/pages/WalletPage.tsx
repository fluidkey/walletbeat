'use client';

import { ratedWallets, type WalletName } from '@/beta/data/wallets';
import { mapAttributeGroups, mapGroupAttributes } from '@/beta/schema/attribute-groups';
import { type NonEmptyArray, nonEmptyMap } from '@/beta/types/utils/non-empty';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemText,
  ListItemButton,
  styled,
  ListItemIcon,
  Divider,
  ListItem,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { WalletIcon } from '../atoms/WalletIcon';
import { AnchorHeader } from '../atoms/AnchorHeader';
import { WalletAttribute } from '../organisms/WalletAttribute';
import { blend, ThemeProvider } from '@mui/system';
import HomeIcon from '@mui/icons-material/Home';
import theme, { subsectionTheme } from '@/beta/components/ThemeRegistry/theme';
import { ratingToColor } from '@/beta/schema/attributes';
import {
  listFontSizePrimary,
  listFontSizeSecondary,
  listIconSize,
  listItemRadius,
  sectionIconWidth,
  subsectionBorderRadius,
  subsectionIconWidth,
} from '../../constants';

const drawerWidth = 280;
const headerHeight = 80;
const headerBottomMargin = 12;
const scrollPastHeaderThreshold = 16;
const scrollNavigationMargin = 8;

const StyledHeader = styled(Paper)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 1100,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  height: headerHeight,
  marginBottom: `${headerBottomMargin}px`,
  borderRadius: '24px',
}));

const StyledSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
}));

const StyledSubsection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  borderRadius: `${subsectionBorderRadius}px`,
  marginTop: '1rem',
  marginBottom: '1rem',
}));

interface Section {
  header: string | null;
  subHeader: string | null;
}

interface TargetSection {
  target: Section;
  untilTimestamp: number;
}

interface RichSection extends Section {
  icon: React.ReactNode;
  title: string;
  caption: React.ReactNode | null;
  body: React.ReactNode | null;
  sx?: React.ComponentProps<typeof Paper>['sx'];
  subsections?: RichSection[]; // Only one level of nesting is supported.
}

function richSectionToSection(richSection: RichSection): Section {
  return { header: richSection.header, subHeader: richSection.subHeader };
}

function sectionHeaderId(section: Section): string | null {
  if (section.subHeader !== null) {
    return section.subHeader
      .replaceAll('_', '-')
      .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  }
  if (section.header !== null) {
    return section.header
      .replaceAll('_', '-')
      .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  }
  return 'top';
}

function SingleListItemIcon({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <ListItemIcon
      key="listItemIcon"
      sx={{
        minWidth: `${listIconSize}px`,
        width: `${listIconSize}px`,
        height: `${listIconSize}px`,
        display: 'inline-block',
        textAlign: 'center',
        marginRight: '4px',
      }}
    >
      {children}
    </ListItemIcon>
  );
}

function SectionListItem({
  section,
  activeSection,
  depth,
  onClick,
  sx,
}: {
  section: RichSection;
  activeSection: Section;
  depth: 'primary' | 'secondary';
  onClick?: React.ComponentProps<typeof ListItemButton>['onClick'];
  sx?: React.ComponentProps<typeof ListItem>['sx'];
}): React.JSX.Element {
  return (
    <ListItem
      key={`listItem-${sectionHeaderId(section)}`}
      id={`listItem-${sectionHeaderId(section)}`}
      disablePadding={true}
      sx={{ ...sx, width: 'auto' }}
    >
      <ListItemButton
        disableRipple={true}
        key="listItemButton"
        selected={
          activeSection.header === section.header && activeSection.subHeader === section.subHeader
        }
        onClick={onClick}
        sx={{ borderRadius: `${listItemRadius}px` }}
      >
        <SingleListItemIcon>{section.icon}</SingleListItemIcon>
        <ListItemText
          key="listItemText"
          primary={
            <Typography
              sx={{
                fontSize: depth === 'primary' ? listFontSizePrimary : listFontSizeSecondary,
              }}
            >
              {section.title}
            </Typography>
          }
          sx={{ whiteSpace: 'nowrap' }}
        />
      </ListItemButton>
    </ListItem>
  );
}

export function WalletPage({ walletName }: { walletName: WalletName }): React.JSX.Element {
  const wallet = ratedWallets[walletName];
  const [lastTargetedSection, setLastTargetedSection] = useState<TargetSection>({
    target: { header: null, subHeader: null },
    untilTimestamp: Date.now(),
  });
  const [activeSection, setActiveSection] = useState<Section>({
    header: null,
    subHeader: null,
  });
  const sections: NonEmptyArray<RichSection> = [
    {
      header: 'details',
      subHeader: null,
      title: 'Details',
      caption: null,
      icon: '\u{1f4c7}', // Card index
      body: wallet.metadata.blurb.render({}),
    },
  ];
  mapAttributeGroups(wallet.overall, (attrGroup, evalGroup) => {
    sections.push({
      header: attrGroup.id,
      subHeader: null,
      title: attrGroup.displayName,
      icon: attrGroup.icon,
      caption: attrGroup.perWalletQuestion.render({
        typography: {
          variant: 'caption',
          fontStyle: 'italic',
        },
        ...wallet.metadata,
      }),
      body: null,
      subsections: mapGroupAttributes(evalGroup, evalAttr => ({
        header: attrGroup.id,
        subHeader: evalAttr.attribute.id,
        title: evalAttr.attribute.displayName,
        icon: evalAttr.evaluation.value.icon ?? evalAttr.attribute.icon,
        sx: {
          backgroundColor: blend(
            theme.palette.background.paper,
            ratingToColor(evalAttr.evaluation.value.rating),
            0.2,
            1
          ),
        },
        caption: evalAttr.attribute.question.render({
          typography: {
            variant: 'caption',
            fontStyle: 'italic',
          },
          ...wallet.metadata,
        }),
        body: (
          <WalletAttribute
            wallet={wallet}
            attrGroup={attrGroup}
            evalGroup={evalGroup}
            evalAttr={evalAttr}
          />
        ),
      })),
    });
  });
  const scrollNavigationTo = (section: Section): void => {
    const headerId = sectionHeaderId(section);
    if (headerId === null) {
      return;
    }
    const navigation = document.getElementById('navigationListBox');
    const listItem = document.getElementById(`listItem-${headerId}`);
    if (navigation === null || listItem === null) {
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
  const scrollToSection = (section: Section): void => {
    const headerId = sectionHeaderId(section);
    if (headerId === null) {
      return;
    }
    const header = document.getElementById(headerId);
    if (header === null) {
      return;
    }
    setLastTargetedSection({
      target: section,
      untilTimestamp: Date.now() + 1250,
    });
    header.scrollIntoView({ behavior: 'smooth' });
    scrollNavigationTo(section);
  };
  const handleScroll = useMemo(
    (): (() => void) => () => {
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.body.offsetHeight - scrollPastHeaderThreshold;
      const targetedSection =
        lastTargetedSection.untilTimestamp >= Date.now() ? lastTargetedSection.target : null;
      let bestSection: Section = { header: null, subHeader: null };
      let bestSectionDistance: number | null = null;
      for (const topSection of sections) {
        for (const section of [topSection].concat(topSection.subsections ?? [])) {
          const headerId = sectionHeaderId(section);
          if (headerId === null) {
            continue;
          }
          const header = document.getElementById(headerId);
          if (header === null) {
            continue;
          }
          const rect = header.getBoundingClientRect();
          const isTarget =
            targetedSection !== null &&
            section.header === targetedSection.header &&
            section.subHeader === targetedSection.subHeader;
          if (isTarget && rect.top >= 0 && rect.bottom <= document.body.offsetHeight) {
            bestSection = richSectionToSection(section);
            bestSectionDistance = -document.body.offsetHeight * 4;
            break;
          }
          const distance = atBottom
            ? -rect.bottom
            : Math.abs(rect.top - headerHeight - headerBottomMargin);
          if (bestSectionDistance === null || distance <= bestSectionDistance) {
            bestSection = richSectionToSection(section);
            bestSectionDistance = distance;
          }
        }
      }
      setActiveSection(bestSection);
      scrollNavigationTo(bestSection);
    },
    [wallet, lastTargetedSection]
  );
  useEffect((): (() => void) => {
    window.addEventListener('scroll', handleScroll);
    return (): void => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [wallet, lastTargetedSection, handleScroll]);
  useEffect(handleScroll, [wallet, lastTargetedSection, handleScroll]);

  const scrollMarginTop = `${headerHeight + headerBottomMargin + scrollPastHeaderThreshold}px`;

  return (
    <Box
      key="walletPageViewport"
      display="flex"
      flexDirection="row"
      maxWidth="100vw"
      justifyContent="center"
    >
      <Box key="walletPageContainer" display="flex" flex="1" flexDirection="column" maxWidth="80vw">
        <StyledHeader key="walletHeader">
          <Typography
            variant="h4"
            component="h1"
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap="12px"
          >
            <WalletIcon
              key="walletIcon"
              walletMetadata={wallet.metadata}
              iconSize={listIconSize * 2}
            />
            {wallet.metadata.displayName}
          </Typography>
        </StyledHeader>
        <Box key="walletPageBody" display="flex" flexDirection="row">
          <Box
            key="navigationBox"
            display="flex"
            flexDirection="column"
            gap="0px"
            sx={{
              width: drawerWidth,
              position: 'sticky',
              top: `${headerHeight + headerBottomMargin}px`,
              height: `calc(100vh - ${headerHeight + headerBottomMargin}px)`,
              bottom: '0px',
            }}
          >
            <Box
              key="navigationListBox"
              id="navigationListBox"
              flex="1"
              sx={{ overflowY: 'scroll' }}
            >
              <List key="navigationListTop">
                {nonEmptyMap(sections, section => (
                  <React.Fragment key={sectionHeaderId(section)}>
                    <SectionListItem
                      section={section}
                      activeSection={activeSection}
                      depth="primary"
                      onClick={() => {
                        history.replaceState(null, '', `#${sectionHeaderId(section)}`);
                        scrollToSection(richSectionToSection(section));
                      }}
                    />
                    {(section.subsections?.length ?? 0) > 0 ? (
                      <List component="div" disablePadding>
                        {section.subsections?.map(subsection => (
                          <SectionListItem
                            key={sectionHeaderId(subsection)}
                            section={subsection}
                            depth="secondary"
                            activeSection={activeSection}
                            onClick={() => {
                              history.replaceState(null, '', `#${sectionHeaderId(subsection)}`);
                              scrollToSection(richSectionToSection(subsection));
                            }}
                            sx={{ marginLeft: `${listIconSize * 0.75}px` }}
                          />
                        ))}
                      </List>
                    ) : null}
                  </React.Fragment>
                ))}
              </List>
            </Box>
            <Box key="navigationListFooter" flex="0">
              <Divider
                key="footerDivider"
                orientation="horizontal"
                variant="middle"
                flexItem={true}
              />
              <List key="navigationListBottom">
                <ListItem key="listItemHome" disablePadding={true}>
                  <ListItemButton
                    component="a"
                    href="/beta"
                    disableRipple={true}
                    key="listItemButtonHome"
                    sx={{ borderRadius: `${listItemRadius}px` }}
                  >
                    <SingleListItemIcon>
                      <HomeIcon />
                    </SingleListItemIcon>
                    <ListItemText
                      key="listItemTextHome"
                      primary={<Typography sx={{ fontSize: listFontSizePrimary }}>Home</Typography>}
                      sx={{ whiteSpace: 'nowrap' }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
          </Box>
          <Box key="walletPageContent" component="main" flex="1">
            <Box key="topSpacer" height={headerBottomMargin}></Box>
            {nonEmptyMap(sections, (section, index) => (
              <React.Fragment key={sectionHeaderId(section)}>
                {index > 0 ? (
                  <Divider
                    key="sectionDivider"
                    orientation="horizontal"
                    variant="middle"
                    flexItem={true}
                    sx={{
                      width: '80%',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      marginTop: '1.5rem',
                      marginBottom: '1.5rem',
                    }}
                  />
                ) : null}
                <StyledSection key="sectionContainer" sx={section.sx}>
                  <AnchorHeader
                    key="sectionHeader"
                    id={sectionHeaderId(section) ?? undefined}
                    sx={{ scrollMarginTop }}
                    variant="h4"
                    component="h2"
                    marginBottom="0"
                    paddingLeft={theme.spacing(2)}
                    paddingRight={theme.spacing(2)}
                    onClick={e => {
                      if (e.button === 0) {
                        scrollToSection(richSectionToSection(section));
                        e.preventDefault();
                      }
                    }}
                  >
                    {section.icon} {section.title}
                  </AnchorHeader>
                  {section.caption === null ? null : (
                    <Box
                      key="sectionCaption"
                      marginLeft={sectionIconWidth}
                      marginBottom="1rem"
                      paddingLeft={theme.spacing(2)}
                      paddingRight={theme.spacing(2)}
                      sx={{ opacity: 0.8 }}
                    >
                      {section.caption}
                    </Box>
                  )}
                  {section.body === null ? null : (
                    <Box
                      key="sectionBody"
                      paddingTop={theme.spacing(2)}
                      paddingLeft={theme.spacing(2)}
                      paddingRight={theme.spacing(2)}
                    >
                      {section.body}
                    </Box>
                  )}
                  {section.subsections?.map(subsection => (
                    <StyledSubsection key={sectionHeaderId(subsection)} sx={subsection.sx}>
                      <ThemeProvider theme={subsectionTheme}>
                        <AnchorHeader
                          key="subsectionHeader"
                          id={sectionHeaderId(subsection) ?? undefined}
                          sx={{ scrollMarginTop }}
                          variant="h3"
                          marginBottom="0rem"
                          onClick={e => {
                            if (e.button === 0) {
                              scrollToSection(richSectionToSection(subsection));
                              e.preventDefault();
                            }
                          }}
                        >
                          {subsection.icon} {subsection.title}
                        </AnchorHeader>
                        {subsection.caption === null ? null : (
                          <Box
                            key="subsectionCaption"
                            marginLeft={subsectionIconWidth}
                            marginBottom="1rem"
                            sx={{ opacity: 0.8 }}
                          >
                            {subsection.caption}
                          </Box>
                        )}
                        {subsection.body === null ? null : (
                          <Box key="subsectionBody">{subsection.body}</Box>
                        )}
                      </ThemeProvider>
                    </StyledSubsection>
                  ))}
                </StyledSection>
              </React.Fragment>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
