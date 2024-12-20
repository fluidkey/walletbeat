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
import React, { useEffect, useState } from 'react';
import { WalletIcon } from '../atoms/WalletIcon';
import { AnchorHeader } from '../atoms/AnchorHeader';

const drawerWidth = 280;
const headerHeight = 80;
const headerBottomMargin = 12;
const scrollPastHeaderThreshold = 16;
const listIconSize = 24;

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
  borderRadius: `${listIconSize}px`,
}));

const StyledSection = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  borderRadius: '12px',
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
  body: React.ReactNode | null;
  subsections?: RichSection[]; // Only one level of nesting is supported.
}

function richSectionToSection(richSection: RichSection): Section {
  return { header: richSection.header, subHeader: richSection.subHeader };
}

function sectionHeaderId(section: Section): string | null {
  if (section.header === null) {
    return null;
  }
  if (section.subHeader === null) {
    return section.header;
  }
  return `${section.header}.${section.subHeader}`;
}

function SingleListItem({
  section,
  activeSection,
  onClick,
  sx,
}: {
  section: RichSection;
  activeSection: Section;
  onClick?: React.ComponentProps<typeof ListItemButton>['onClick'];
  sx?: React.ComponentProps<typeof ListItem>['sx'];
}): React.JSX.Element {
  return (
    <ListItem
      key={`listItem-${section.header ?? 'null'}-${section.subHeader ?? 'null'}`}
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
        sx={{ borderRadius: `${listIconSize}px` }}
      >
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
          {section.icon}
        </ListItemIcon>
        <ListItemText key="listItemText" primary={section.title} sx={{ whiteSpace: 'nowrap' }} />
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
      body: attrGroup.perWalletQuestion.render(wallet.metadata),
      subsections: mapGroupAttributes(evalGroup, evalAttr => ({
        header: attrGroup.id,
        subHeader: evalAttr.attribute.id,
        title: evalAttr.attribute.displayName,
        icon: evalAttr.evaluation.value.icon ?? evalAttr.attribute.icon,
        body: `
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
          cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
          non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        `,
      })),
    });
  });
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
      untilTimestamp: Date.now() + 2000,
    });
    setActiveSection(section);
    header.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect((): (() => void) => {
    const handleScroll = (): void => {
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
    };

    window.addEventListener('scroll', handleScroll);
    return (): void => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [wallet, lastTargetedSection]);

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
            sx={{
              width: drawerWidth,
              position: 'sticky',
              top: `${headerHeight + headerBottomMargin}px`,
              height: `calc(100vh - ${headerHeight + headerBottomMargin}px)`,
              bottom: '0px',
            }}
          >
            <List key="navigationList">
              {nonEmptyMap(sections, section => (
                <React.Fragment key={sectionHeaderId(section)}>
                  <SingleListItem
                    section={section}
                    activeSection={activeSection}
                    onClick={() => {
                      scrollToSection(richSectionToSection(section));
                    }}
                  />
                  {(section.subsections?.length ?? 0) > 0 ? (
                    <List component="div" disablePadding>
                      {section.subsections?.map(subsection => (
                        <SingleListItem
                          key={sectionHeaderId(subsection)}
                          section={subsection}
                          activeSection={activeSection}
                          onClick={() => {
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
                      marginTop: '2rem',
                      marginBottom: '2rem',
                    }}
                  />
                ) : null}
                <StyledSection key="sectionContainer">
                  <AnchorHeader
                    key="sectionHeader"
                    id={sectionHeaderId(section) ?? undefined}
                    sx={{ scrollMarginTop }}
                    variant="h4"
                    component="h2"
                    marginTop="1rem"
                    marginBottom="0.75rem"
                  >
                    {section.icon} {section.title}
                  </AnchorHeader>
                  <Box key="sectionBody" marginBottom="1.25rem">
                    {section.body}
                  </Box>
                  {section.subsections?.map(subsection => (
                    <Box key={sectionHeaderId(subsection)}>
                      <AnchorHeader
                        key="subsectionHeader"
                        id={sectionHeaderId(subsection) ?? undefined}
                        sx={{ scrollMarginTop }}
                        variant="h5"
                        component="h3"
                        marginTop="1rem"
                        marginBottom="0.75rem"
                      >
                        {subsection.icon} {subsection.title}
                      </AnchorHeader>
                      <Box key="subsectionBody" marginBottom="1.25rem">
                        {subsection.body}
                      </Box>
                    </Box>
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
