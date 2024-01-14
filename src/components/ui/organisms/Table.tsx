'use client';

import React, { useState } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { wallets } from '@/data/data';
import { fieldToHeaderName, subcategoryMapping } from '@/data/mapping';
import { Box, Typography, Link } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import LanguageIcon from '@mui/icons-material/Language';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { OpenInNewRounded } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  sticky: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: 'white',
  },
});

export default function ComparisonTable(): JSX.Element {
  const classes = useStyles();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const rows = Object.entries(wallets).map(([name, features], index) => {
    const row = {
      id: index,
      name,
      url: features.url,
      submittedByName: features.submittedByName,
      submittedByUrl: features.submittedByUrl,
      updatedAt: features.updatedAt,
      updatedByName: features.updatedByName,
      updatedByUrl: features.updatedByUrl,
      repoUrl: features.repoUrl,
      deviceCompatibility: {
        mobile: Boolean(features.mobile),
        browser: Boolean(features.browser),
        desktop: Boolean(features.desktop),
      },
      chainCompatibility: {
        mobile: features.mobile?.chainCompatibility,
        browser: features.browser?.chainCompatibility,
        desktop: features.desktop?.chainCompatibility,
        issues: features.issues?.chainCompatibility,
      },
      ensCompatibility: {
        mobile: features.mobile?.ensCompatibility,
        browser: features.browser?.ensCompatibility,
        desktop: features.desktop?.ensCompatibility,
        issues: features.issues?.ensCompatibility,
      },
      backupOptions: {
        mobile: features.mobile?.backupOptions,
        browser: features.browser?.backupOptions,
        desktop: features.desktop?.backupOptions,
        issues: features.issues?.backupOptions,
      },
      securityFeatures: {
        mobile: features.mobile?.securityFeatures,
        browser: features.browser?.securityFeatures,
        desktop: features.desktop?.securityFeatures,
        issues: features.issues?.securityFeatures,
      },
      accountType: {
        mobile: features.mobile?.accountType,
        browser: features.browser?.accountType,
        desktop: features.desktop?.accountType,
      },
      availableTestnets: {
        mobile: features.mobile?.availableTestnets,
        browser: features.browser?.availableTestnets,
        desktop: features.desktop?.availableTestnets,
        issues: features.issues?.availableTestnets,
      },
      license: {
        mobile: features.mobile?.license,
        browser: features.browser?.license,
        desktop: features.desktop?.license,
      },
      connectionMethods: {
        mobile: features.mobile?.connectionMethods,
        browser: features.browser?.connectionMethods,
        desktop: features.desktop?.connectionMethods,
        issues: features.issues?.connectionMethods,
      },
      modularity: {
        mobile: features.mobile?.modularity,
        browser: features.browser?.modularity,
        desktop: features.desktop?.modularity,
        issues: features.issues?.modularity,
      },
    };

    return row;
  });

  const fields = [
    'chainCompatibility',
    'ensCompatibility',
    'backupOptions',
    'securityFeatures',
    'connectionMethods',
    'deviceCompatibility',
    'accountType',
    'modularity',
    'availableTestnets',
    'license',
  ];

  const handleShowMore = (id: string): void => {
    setExpandedRows(prevState => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const createColumnDef = (field: string): GridColDef => {
    if (field === 'deviceCompatibility') {
      return {
        field,
        headerName: fieldToHeaderName[field],
        headerAlign: 'center',
        hideSortIcons: true,
        disableColumnMenu: true,
        renderCell: params => {
          const compatibility = params.value as Record<string, boolean>;
          return (
            <Box
              display="flex"
              gap={0.5}
              alignItems="flex-start"
              justifyContent="center"
              height="100%"
              py={1.5}
            >
              <Typography color={compatibility.mobile ? '#FAFDFF' : '#3f4350'}>
                <PhoneAndroidIcon />
              </Typography>
              <Typography color={compatibility.browser ? '#FAFDFF' : '#3f4350'}>
                <LanguageIcon />
              </Typography>
              <Typography color={compatibility.desktop ? '#FAFDFF' : '#3f4350'}>
                <DesktopWindowsIcon />
              </Typography>
            </Box>
          );
        },
      };
    }

    if (field === 'accountType' || field === 'license') {
      return {
        field,
        headerName: fieldToHeaderName[field],
        headerAlign: 'center',
        hideSortIcons: true,
        disableColumnMenu: true,
        renderCell: params => {
          const firstNonUndefinedValue = Object.values(params.value).find(
            value => value !== undefined
          );
          return (
            <Box
              display="flex"
              alignItems="flex-start"
              justifyContent="center"
              height="100%"
              width="100%"
              py={1.5}
            >
              {firstNonUndefinedValue === 'EOA' && <Typography color={'#FAFDFF'}>EOA</Typography>}
              {firstNonUndefinedValue === '4337' && <Typography color={'#FAFDFF'}>4337</Typography>}
              {firstNonUndefinedValue === 'SAFE' && <Typography color={'#FAFDFF'}>Safe</Typography>}
              {params.row.repoUrl != null ? (
                <Link href={params.row.repoUrl} target="_blank">
                  {firstNonUndefinedValue === 'OPEN_SOURCE' && (
                    <Typography style={{ fontSize: '11px' }} pt={0.5} color={'#FAFDFF'}>
                      Open Source
                    </Typography>
                  )}
                  {firstNonUndefinedValue === 'SOURCE_AVAILABLE' && (
                    <Typography style={{ fontSize: '11px' }} pt={0.5} color={'#FAFDFF'}>
                      Source Visible
                    </Typography>
                  )}
                  {firstNonUndefinedValue === 'PROPRIETARY' && (
                    <Typography style={{ fontSize: '11px' }} pt={0.5} color={'#FAFDFF'}>
                      Proprietary
                    </Typography>
                  )}
                </Link>
              ) : (
                <>
                  {firstNonUndefinedValue === 'OPEN_SOURCE' && (
                    <Typography style={{ fontSize: '11px' }} pt={0.5} color={'#FAFDFF'}>
                      Open Source
                    </Typography>
                  )}
                  {firstNonUndefinedValue === 'SOURCE_AVAILABLE' && (
                    <Typography style={{ fontSize: '11px' }} pt={0.5} color={'#FAFDFF'}>
                      Source Visible
                    </Typography>
                  )}
                  {firstNonUndefinedValue === 'PROPRIETARY' && (
                    <Typography style={{ fontSize: '11px' }} pt={0.5} color={'#FAFDFF'}>
                      Proprietary
                    </Typography>
                  )}
                </>
              )}
            </Box>
          );
        },
      };
    }

    return {
      field,
      headerName: fieldToHeaderName[field],
      headerAlign: field === 'availableTestnets' || field === 'modularity' ? 'center' : 'left',
      type: 'boolean',
      hideSortIcons: true,
      disableColumnMenu: true,
      valueGetter: params => {
        const mobile = params.row[field]?.mobile;
        const browser = params.row[field]?.browser;
        const desktop = params.row[field]?.desktop;
        const mobileValues = Object.values(mobile ?? {});
        const browserValues = Object.values(browser ?? {});
        const desktopValues = Object.values(desktop ?? {});
        const mobileTrueCount = mobileValues.filter(Boolean).length;
        const browserTrueCount = browserValues.filter(Boolean).length;
        const desktopTrueCount = desktopValues.filter(Boolean).length;

        const trueCounts = [mobileTrueCount, browserTrueCount, desktopTrueCount].filter(
          count => count > 0
        );
        const minTrueCount = trueCounts.length > 0 ? Math.min(...trueCounts) : 0;
        return minTrueCount;
      },
      renderCell: params => {
        const mobile = params.row[field]?.mobile;
        const browser = params.row[field]?.browser;
        const desktop = params.row[field]?.desktop;
        const issues = params.row[field]?.issues;

        const mobileValues = Object.values(mobile ?? {});
        const browserValues = Object.values(browser ?? {});
        const desktopValues = Object.values(desktop ?? {});
        const totalCount = Math.max(
          mobileValues.length,
          browserValues.length,
          desktopValues.length
        );

        if (totalCount === 1) {
          return (
            <Box
              display="flex"
              alignItems="flex-start"
              height="100%"
              width="100%"
              justifyContent="center"
              py={1.5}
            >
              {mobileValues[0] === true ||
              browserValues[0] === true ||
              desktopValues[0] === true ? (
                <CheckIcon />
              ) : (
                <CloseIcon />
              )}
            </Box>
          );
        }

        const mobileTrueCount = mobileValues.filter(Boolean).length;
        const browserTrueCount = browserValues.filter(Boolean).length;
        const desktopTrueCount = desktopValues.filter(Boolean).length;

        const trueCounts = [mobileTrueCount, browserTrueCount, desktopTrueCount].filter(
          count => count > 0
        );
        const minTrueCount = trueCounts.length > 0 ? Math.min(...trueCounts) : 0;

        const inputs = [mobile, browser, desktop].filter(input => input != null);
        const checkValues =
          inputs.length > 0
            ? Object.fromEntries(
                Object.entries(inputs[0]).map(([key]) => {
                  const values = inputs.map(input => input[key]);
                  let result;
                  if (values.every(value => value !== false)) {
                    result = 'true';
                  } else if (values.some(value => value === true)) {
                    const trueKey = ['mobile', 'browser', 'desktop'].find(
                      (inputKey, index) => values[index] === true
                    );
                    result = trueKey;
                  } else {
                    result = 'false';
                  }
                  return [key, result];
                })
              )
            : {};

        return (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            height="100%"
            width="100%"
            justifyContent="center"
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="flex-start"
              height="100%"
              width="100%"
            >
              <Typography variant="body2" pt={1} style={{ marginRight: '10px' }}>
                {`${minTrueCount}/${totalCount}`}
              </Typography>
              <div
                style={{
                  display: 'flex',
                  minHeight: '12px',
                  width: '100%',
                  paddingTop: '2px',
                  paddingBottom: '8px',
                }}
              >
                {[...Array(totalCount)].map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: `${100 / totalCount}%`,
                      backgroundColor:
                        index < minTrueCount
                          ? '#80ffa2'
                          : index < mobileTrueCount ||
                              index < browserTrueCount ||
                              index < desktopTrueCount
                            ? '#A7ACB9'
                            : '#3f4350',
                      marginRight: index !== totalCount - 1 ? '2px' : undefined,
                      borderRadius:
                        index === 0
                          ? '5px 0 0 5px'
                          : index === totalCount - 1
                            ? '0 5px 5px 0'
                            : '0',
                      minHeight: '6px',
                    }}
                  />
                ))}
              </div>
              {expandedRows[params.id.toString()] && (
                <>
                  <ul
                    style={{ textAlign: 'left', width: '100%', padding: 0, listStyleType: 'none' }}
                  >
                    {Object.entries(checkValues as Record<string, string>).map(([key, value]) => (
                      <li key={key}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '10px',
                            gap: '4px',
                          }}
                        >
                          {value === 'true' ? (
                            <CheckIcon fontSize="inherit" color="success" />
                          ) : value === 'mobile' ? (
                            <PhoneAndroidIcon fontSize="inherit" color="inherit" />
                          ) : value === 'browser' ? (
                            <LanguageIcon fontSize="inherit" color="inherit" />
                          ) : value === 'desktop' ? (
                            <DesktopWindowsIcon fontSize="inherit" color="inherit" />
                          ) : (
                            <CloseIcon fontSize="inherit" />
                          )}
                          {issues?.[key] != null ? (
                            <Link href={issues?.[key]} target="_blank">
                              {subcategoryMapping[key] ?? key}
                            </Link>
                          ) : (
                            subcategoryMapping[key] ?? key
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Box>
          </Box>
        );
      },
    };
  };
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Wallet',
      width: 190,
      type: 'string',
      headerClassName: classes.sticky,
      cellClassName: classes.sticky,
      valueGetter: params => {
        const countFields = fields.slice(0, 5);
        let totalMinTrueCount = 0;
        for (const field of countFields) {
          const mobile = params.row[field]?.mobile;
          const browser = params.row[field]?.browser;
          const desktop = params.row[field]?.desktop;
          const mobileValues = Object.values(mobile ?? {});
          const browserValues = Object.values(browser ?? {});
          const desktopValues = Object.values(desktop ?? {});
          const mobileTrueCount = mobileValues.filter(Boolean).length;
          const browserTrueCount = browserValues.filter(Boolean).length;
          const desktopTrueCount = desktopValues.filter(Boolean).length;

          const trueCounts = [mobileTrueCount, browserTrueCount, desktopTrueCount].filter(
            count => count > 0
          );
          totalMinTrueCount += trueCounts.length > 0 ? Math.min(...trueCounts) : 0;
        }
        return totalMinTrueCount;
      },
      renderCell: params => (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="flex-start"
          height="100%"
        >
          <Box display="flex" alignItems="center" gap={1} justifyContent="flex-start" pt={1}>
            <Box display="flex" alignItems="center">
              <Typography fontSize="inherit" style={{ display: 'flex', alignItems: 'center' }}>
                {params.row.name}
              </Typography>
              <Link
                href={params.row.url}
                target="_blank"
                rel="noopener noreferrer"
                color="text.primary"
                style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}
              >
                <OpenInNewRounded color="inherit" fontSize="inherit" />
              </Link>
            </Box>
            <IconButton
              size="small"
              onClick={event => {
                event.stopPropagation();
                handleShowMore(params.id.toString());
              }}
            >
              {expandedRows[params.id.toString()] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          {expandedRows[params.id.toString()] && (
            <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%">
              <Link href={`https://searchcaster.xyz/search?text=${params.value}`} target="_blank">
                <Typography variant="body2" fontSize="10px">
                  what people are saying
                </Typography>
              </Link>
              <Box>
                <Typography variant="body2" fontSize="10px">
                  Submitted by{' '}
                  <Link href={params.row.submittedByUrl} target="_blank">
                    {params.row.submittedByName}
                  </Link>
                </Typography>
                <Typography variant="body2" fontSize="10px" pt={2}>
                  Updated on {params.row.updatedAt}
                </Typography>
                <Typography variant="body2" fontSize="10px" pb={6}>
                  by{' '}
                  <Link href={params.row.updatedByUrl} target="_blank">
                    {params.row.updatedByName}
                  </Link>
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      ),
    },
    ...fields.map(field => createColumnDef(field)),
  ];

  return (
    <Box maxWidth="100%" height="100%" width="fit-content" overflow="auto">
      <DataGrid
        rows={rows}
        columns={columns}
        getRowHeight={row => (expandedRows[row.id.toString()] ? 230 : 50)}
        density="compact"
        disableRowSelectionOnClick
        initialState={{
          sorting: {
            sortModel: [{ field: 'name', sort: 'desc' }],
          },
        }}
      />
    </Box>
  );
}
