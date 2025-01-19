'use client';

import { ratedWallets, type WalletName } from '@/beta/data/wallets';
import { mapAttributeGroups, mapGroupAttributes } from '@/beta/schema/attribute-groups';
import { isNonEmptyArray, type NonEmptyArray, nonEmptyMap } from '@/beta/types/utils/non-empty';
import { Box, Typography, Paper, styled, Divider } from '@mui/material';
import React from 'react';
import { WalletIcon } from '../atoms/WalletIcon';
import { AnchorHeader } from '../atoms/AnchorHeader';
import { WalletAttribute } from '../organisms/WalletAttribute';
import { blend, ThemeProvider } from '@mui/system';
import theme, { subsectionTheme } from '@/beta/components/ThemeRegistry/theme';
import { ratingToColor } from '@/beta/schema/attributes';
import {
  navigationListIconSize,
  sectionIconWidth,
  subsectionBorderRadius,
  subsectionIconWidth,
} from '../../constants';
import type { NavigationItem } from '../organisms/Navigation';
import {
  navigationFaq,
  navigationFarcasterChannel,
  navigationHome,
  navigationRepository,
  scrollPastHeaderPixels,
} from '../../navigation';
import { NavigationPageLayout } from './NavigationPageLayout';
import { slugifyCamelCase } from '@/beta/types/text';

const headerHeight = 80;
const headerBottomMargin = 24;

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
  header: string;
  subHeader: string | null;
}

interface RichSection extends Section {
  icon: React.ReactNode;
  title: string;
  caption: React.ReactNode | null;
  body: React.ReactNode | null;
  sx?: React.ComponentProps<typeof Paper>['sx'];
  subsections?: RichSection[]; // Only one level of nesting is supported.
}

function sectionHeaderId(section: Section): string {
  if (section.subHeader !== null) {
    return slugifyCamelCase(section.subHeader);
  }
  return slugifyCamelCase(section.header);
}

export function WalletPage({ walletName }: { walletName: WalletName }): React.JSX.Element {
  const wallet = ratedWallets[walletName];
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
  const scrollMarginTop = `${headerHeight + headerBottomMargin + scrollPastHeaderPixels}px`;

  const navigationRef = React.useRef<{
    scrollToItemId: (itemId: string) => void;
  }>(null);
  const scrollToSection = (section: Section): void => {
    if (navigationRef.current !== null) {
      navigationRef.current.scrollToItemId(sectionHeaderId(section));
    }
  };

  return (
    <NavigationPageLayout
      groups={[
        {
          id: 'home',
          items: [navigationHome],
          overflow: false,
        },
        {
          id: 'wallet-sections',
          items: [
            {
              id: sections[0].header,
              icon: (
                <WalletIcon
                  walletMetadata={wallet.metadata}
                  iconSize={navigationListIconSize * 0.75}
                />
              ),
              title: wallet.metadata.displayName,
              contentId: sectionHeaderId(sections[0]),
            },
            ...sections.slice(1).map(
              (section): NavigationItem => ({
                id: sectionHeaderId(section),
                icon: section.icon,
                title: section.title,
                contentId: sectionHeaderId(section),
                children:
                  section.subsections !== undefined && isNonEmptyArray(section.subsections)
                    ? nonEmptyMap(section.subsections, subsection => ({
                        id: sectionHeaderId(subsection),
                        icon: subsection.icon,
                        title: subsection.title,
                        contentId: sectionHeaderId(subsection),
                      }))
                    : undefined,
              })
            ),
          ],
          overflow: true,
        },
        {
          id: 'rest-of-nav',
          items: [navigationFaq, navigationRepository, navigationFarcasterChannel],
          overflow: false,
        },
      ]}
      stickyHeaderId="walletHeader"
      stickyHeaderMargin={headerBottomMargin}
      contentDependencies={[wallet]}
      ref={navigationRef}
    >
      <StyledHeader key="walletHeader" id="walletHeader">
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
            iconSize={navigationListIconSize * 2}
          />
          {wallet.metadata.displayName}
        </Typography>
      </StyledHeader>
      <Box key="walletPageBody" display="flex" flexDirection="row">
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
                  id={sectionHeaderId(section)}
                  sx={{ scrollMarginTop }}
                  variant="h4"
                  component="h2"
                  marginBottom="0"
                  paddingLeft={theme.spacing(2)}
                  paddingRight={theme.spacing(2)}
                  onClick={e => {
                    if (e.button === 0) {
                      scrollToSection(section);
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
                        id={sectionHeaderId(subsection)}
                        sx={{ scrollMarginTop }}
                        variant="h3"
                        marginBottom="0rem"
                        onClick={e => {
                          if (e.button === 0) {
                            scrollToSection(subsection);
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
    </NavigationPageLayout>
  );
}
