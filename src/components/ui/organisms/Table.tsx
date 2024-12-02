'use client';

import { wallets } from '@/data/data';
import { fieldToHeaderName, subcategoryMapping } from '@/data/mapping';
import type { AccountType, License } from '@/types/Features';
import { OpenInNewRounded } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LanguageIcon from '@mui/icons-material/Language';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { Box, Link, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';

const shortRowHeight = 50;
const expandedRowHeight = 230;

export default function ComparisonTable(): React.JSX.Element {
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
  type WalletRow = (typeof rows)[0];
  interface PerPlatform<T> {
    mobile?: T;
    browser?: T;
    desktop?: T;
    issues?: { [k in keyof T]?: string[] };
  }

  const handleShowMore = (id: string): void => {
    setExpandedRows(prevState => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const deviceCompatColumn: GridColDef<WalletRow, PerPlatform<boolean>> = {
    field: 'deviceCompatibility',
    headerName: fieldToHeaderName.deviceCompatibility,
    headerAlign: 'center',
    hideSortIcons: true,
    disableColumnMenu: true,
    renderCell: params => {
      const compatibility = params.value;
      const colors = {
        mobile: (compatibility?.mobile ?? false) ? '#FAFDFF' : '#3f4350',
        browser: (compatibility?.browser ?? false) ? '#FAFDFF' : '#3f4350',
        desktop: (compatibility?.desktop ?? false) ? '#FAFDFF' : '#3f4350',
      };
      return (
        <Box
          display="flex"
          gap={0.5}
          alignItems="flex-start"
          justifyContent="center"
          height="100%"
          py={1.5}
        >
          <Typography color={colors.mobile}>
            <PhoneAndroidIcon />
          </Typography>
          <Typography color={colors.browser}>
            <LanguageIcon />
          </Typography>
          <Typography color={colors.desktop}>
            <DesktopWindowsIcon />
          </Typography>
        </Box>
      );
    },
  };

  const accountTypeColumn: GridColDef<WalletRow, PerPlatform<AccountType>> = {
    field: 'accountType',
    headerName: fieldToHeaderName.accountType,
    headerAlign: 'center',
    hideSortIcons: true,
    disableColumnMenu: true,
    renderCell: params => {
      const firstNonUndefinedValue = [
        params.value?.mobile,
        params.value?.browser,
        params.value?.desktop,
      ].find(value => value !== undefined);
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
        </Box>
      );
    },
  };

  const licenseColumn: GridColDef<WalletRow, PerPlatform<License>> = {
    field: 'license',
    headerName: fieldToHeaderName.license,
    headerAlign: 'center',
    hideSortIcons: true,
    disableColumnMenu: true,
    renderCell: params => {
      const firstNonUndefinedValue = [
        params.value?.mobile,
        params.value?.browser,
        params.value?.desktop,
      ].find(value => value !== undefined);
      const license = {
        undefined: 'Unknown',
        OPEN_SOURCE: 'Open Source',
        SOURCE_AVAILABLE: 'Source Visible',
        PROPRIETARY: 'Proprietary',
      }[firstNonUndefinedValue ?? 'undefined'];
      let licenseTag = (
        <Typography style={{ fontSize: '11px' }} pt={0.5} color={'#FAFDFF'}>
          {license}
        </Typography>
      );
      if (params.row.repoUrl != null) {
        licenseTag = (
          <Link href={params.row.repoUrl} target="_blank">
            {licenseTag}
          </Link>
        );
      }
      return (
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent="center"
          height="100%"
          width="100%"
          py={1.5}
        >
          {licenseTag}
        </Box>
      );
    },
  };

  const createColumnDef = <T extends object>(
    field: string,
    getField: (row: WalletRow) => PerPlatform<T>
  ): GridColDef<WalletRow, number, PerPlatform<T>> => ({
    field,
    headerName: fieldToHeaderName[field],
    headerAlign: field === 'availableTestnets' || field === 'modularity' ? 'center' : 'left',
    hideSortIcons: true,
    disableColumnMenu: true,
    valueGetter: (value: PerPlatform<T>) => {
      const mobileValues = Object.values(value.mobile ?? {});
      const browserValues = Object.values(value.browser ?? {});
      const desktopValues = Object.values(value.desktop ?? {});
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
      const value = getField(params.row);
      const mobile = value.mobile;
      const browser = value.browser;
      const desktop = value.desktop;

      const mobileValues = Object.values(mobile ?? {});
      const browserValues = Object.values(browser ?? {});
      const desktopValues = Object.values(desktop ?? {});
      const totalCount = Math.max(mobileValues.length, browserValues.length, desktopValues.length);

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
            {mobileValues[0] === true || browserValues[0] === true || desktopValues[0] === true ? (
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
      type checkResult = 'true' | 'false' | 'mobile' | 'browser' | 'desktop';
      interface checkValue {
        result: checkResult;
        issueLink: string | null;
      }
      const checkValues: Partial<{ [k in keyof T]: checkValue }> = {};
      if (inputs.length > 0) {
        for (const key in inputs[0]) {
          const values = inputs.map(input => input[key]);
          let result: checkResult = 'true';
          if (!values.every(value => value !== false)) {
            result =
              (['mobile', 'browser', 'desktop'] as const).find(
                (inputKey, index) => values[index] === true
              ) ?? 'false';
          }
          let issueLink: string | null = null;
          if (value.issues?.[key] != null && value.issues[key].length > 0) {
            issueLink = value.issues[key][0];
          }
          checkValues[key] = { result, issueLink };
        }
      }

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
              {Array.from({ length: totalCount }, (_, index) => (
                <div
                  key={index}
                  style={{
                    width: `${100 / totalCount}%`, // eslint-disable-line @typescript-eslint/no-magic-numbers -- 100 for percentage
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
                      index === 0 ? '5px 0 0 5px' : index === totalCount - 1 ? '0 5px 5px 0' : '0',
                    minHeight: '6px',
                  }}
                />
              ))}
            </div>
            {expandedRows[params.id.toString()] && (
              <ul style={{ textAlign: 'left', width: '100%', padding: 0, listStyleType: 'none' }}>
                {(() => {
                  const expandedList = [];
                  for (const key in checkValues) {
                    const checkValue = checkValues[key];
                    if (typeof checkValue === 'undefined') {
                      continue;
                    }
                    expandedList.push(
                      <li
                        key={key}
                        style={{
                          lineHeight: '1em',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '10px',
                            gap: '4px',
                          }}
                        >
                          {checkValue.result === 'true' ? (
                            <CheckIcon fontSize="inherit" color="success" />
                          ) : checkValue.result === 'mobile' ? (
                            <PhoneAndroidIcon fontSize="inherit" color="inherit" />
                          ) : checkValue.result === 'browser' ? (
                            <LanguageIcon fontSize="inherit" color="inherit" />
                          ) : checkValue.result === 'desktop' ? (
                            <DesktopWindowsIcon fontSize="inherit" color="inherit" />
                          ) : (
                            <CloseIcon fontSize="inherit" />
                          )}
                          {checkValue.issueLink !== null ? (
                            <Link href={checkValue.issueLink} target="_blank">
                              {subcategoryMapping[key]}
                            </Link>
                          ) : (
                            subcategoryMapping[key]
                          )}
                        </div>
                      </li>
                    );
                  }
                  return expandedList;
                })()}
              </ul>
            )}
          </Box>
        </Box>
      );
    },
  });

  const walletNameColumn: GridColDef<WalletRow, number> = {
    field: 'name',
    headerName: 'Wallet',
    width: 160,
    type: 'string',
    valueGetter: (_: never, row: WalletRow) => {
      let totalMinTrueCount = 0;
      for (const subfeature of [
        row.chainCompatibility,
        row.ensCompatibility,
        row.backupOptions,
        row.securityFeatures,
        row.connectionMethods,
      ]) {
        const mobileValues = Object.values(subfeature.mobile ?? {});
        const browserValues = Object.values(subfeature.browser ?? {});
        const desktopValues = Object.values(subfeature.desktop ?? {});
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
          <Box
            display="flex"
            alignItems="center"
            sx={{
              fontSize: '0.8rem !important',
            }}
          >
            <Typography
              fontSize="0.85rem !important"
              fontWeight={700}
              style={{ display: 'flex', alignItems: 'center' }}
            >
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
            <Link href={`https://searchcaster.xyz/search?text=${params.row.name}`} target="_blank">
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
  };

  const columns: GridColDef[] = [
    walletNameColumn,
    createColumnDef('chainCompatibility', row => row.chainCompatibility),
    createColumnDef('ensCompatibility', row => row.ensCompatibility),
    createColumnDef('backupOptions', row => row.backupOptions),
    createColumnDef('securityFeatures', row => row.securityFeatures),
    createColumnDef('connectionMethods', row => row.connectionMethods),
    deviceCompatColumn,
    accountTypeColumn,
    createColumnDef('modularity', row => row.modularity),
    createColumnDef('availableTestnets', row => row.availableTestnets),
    licenseColumn,
  ];

  return (
    <Box maxWidth="100%" height="70vh" width="fit-content" overflow="auto">
      <DataGrid
        rows={rows}
        columns={columns}
        getRowHeight={row => (expandedRows[row.id.toString()] ? expandedRowHeight : shortRowHeight)}
        density="compact"
        disableRowSelectionOnClick
        initialState={{
          sorting: {
            sortModel: [{ field: 'name', sort: 'desc' }],
          },
        }}
        disableVirtualization={true}
        sx={{
          '& .MuiDataGrid-cell:first-child': {
            position: 'sticky',
            left: 0,
            zIndex: 1,
            backgroundColor: 'background.default',
            borderRight: '1px solid #141519',
          },
        }}
      />
    </Box>
  );
}
