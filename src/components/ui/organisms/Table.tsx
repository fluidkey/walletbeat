'use client';

import React, { useState } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { wallets } from '@/data/data';
import { Box, Typography, Link } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import LanguageIcon from '@mui/icons-material/Language';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { DataUsageRounded, OpenInNewRounded } from '@mui/icons-material';

export default function ComparisonTable(): JSX.Element {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const rows = Object.entries(wallets).map(([name, features], index) => {
    const row = {
      id: index,
      name,
      url: features.url,
      deviceCompatibility: {
        mobile: Boolean(features.mobile),
        browser: Boolean(features.browser),
        desktop: Boolean(features.desktop),
      },
      chainCompatibility: {
        mobile: features.mobile?.chainCompatibility,
        browser: features.browser?.chainCompatibility,
        desktop: features.desktop?.chainCompatibility,
      },
      ensCompatibility: {
        mobile: features.mobile?.ensCompatibility,
        browser: features.browser?.ensCompatibility,
        desktop: features.desktop?.ensCompatibility,
      },
      backupOptions: {
        mobile: features.mobile?.backupOptions,
        browser: features.browser?.backupOptions,
        desktop: features.desktop?.backupOptions,
      },
      securityFeatures: {
        mobile: features.mobile?.securityFeatures,
        browser: features.browser?.securityFeatures,
        desktop: features.desktop?.securityFeatures,
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
      },
      modularity: {
        mobile: features.mobile?.modularity,
        browser: features.browser?.modularity,
        desktop: features.desktop?.modularity,
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

  const fieldToHeaderName: Record<string, string> = {
    deviceCompatibility: 'Devices',
    accountType: 'Type',
    chainCompatibility: 'Chains',
    ensCompatibility: 'ENS',
    backupOptions: 'Backup',
    securityFeatures: 'Security',
    availableTestnets: 'Testnets',
    license: 'License',
    connectionMethods: 'Connection',
    modularity: 'Modularity',
  };

  const subcategoryMapping: Record<string, string> = {
    socialRecovery: 'Social Recovery',
    cloud: 'Cloud Backup',
    local: 'Manual Backup',
    multisig: 'Multisig',
    MPC: 'MPC',
    keyRotation: 'Key Rotation',
    transactionScanning: 'Scanning',
    limitsAndTimelocks: 'Limits',
    hardwareWalletSupport: 'Hardware',
    mainnet: 'Mainnet',
    subDomains: 'Subdomains',
    offchain: 'Offchain',
    L2s: 'L2s',
    customDomains: 'Custom',
    freeUsernames: 'Usernames',
    ethereum: 'Ethereum',
    optimism: 'Optimism',
    arbitrum: 'Arbitrum',
    base: 'Base',
    polygon: 'Polygon',
    gnosis: 'Gnosis',
    bnbSmartChain: 'Binance Chain',
    configurable: 'Configurable',
    autoswitch: 'Autoswitch',
    walletConnect: 'WalletConnect',
    injected: 'Injected',
    embedded: 'Embedded',
    inappBrowser: 'In-App Browser',
  };

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
        headerAlign: 'left',
        hideSortIcons: true,
        disableColumnMenu: true,
        renderCell: params => {
          const compatibility = params.value as Record<string, boolean>;
          return (
            <Box
              display="flex"
              gap={0.5}
              alignItems="flex-start"
              justifyContent="space-between"
              height="100%"
              py={1.5}
              ml={-0.5}
            >
              <Typography color={compatibility.mobile ? '#E6C2FF' : '#3f4350'}>
                <PhoneAndroidIcon />
              </Typography>
              <Typography color={compatibility.browser ? '#C3C7FF' : '#3f4350'}>
                <LanguageIcon />
              </Typography>
              <Typography color={compatibility.desktop ? '#C2D9FF' : '#3f4350'}>
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
        headerAlign: 'left',
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
              justifyContent="left"
              height="100%"
              width="100%"
              py={1.5}
            >
              {firstNonUndefinedValue === 'EOA' && <Typography color={'#FAFDFF'}>EOA</Typography>}
              {firstNonUndefinedValue === '4337' && <Typography color={'#FAFDFF'}>4337</Typography>}
              {firstNonUndefinedValue === 'SAFE' && <Typography color={'#FAFDFF'}>Safe</Typography>}
              {firstNonUndefinedValue === 'OPEN_SOURCE' && (
                <Typography style={{ fontSize: '11px' }} pt={0.5} color={'#FAFDFF'}>
                  Open Source
                </Typography>
              )}
              {firstNonUndefinedValue === 'SOURCE_AVAILABLE' && (
                <Typography style={{ fontSize: '11px' }} pt={0.5} color={'#FAFDFF'}>
                  Source Available
                </Typography>
              )}
              {firstNonUndefinedValue === 'PROPRIETARY' && (
                <Typography style={{ fontSize: '11px' }} pt={0.5} color={'#FAFDFF'}>
                  Proprietary
                </Typography>
              )}
            </Box>
          );
        },
      };
    }

    return {
      field,
      headerName: fieldToHeaderName[field],
      headerAlign: 'left',
      type: 'boolean',
      hideSortIcons: true,
      disableColumnMenu: true,
      valueGetter: params => {
        const values = Object.values(params.value as Record<string, boolean>);
        const trueCount = values.filter(Boolean).length;
        return trueCount;
      },
      renderCell: params => {
        const mobile = params.row[field]?.mobile;
        const browser = params.row[field]?.browser;
        const desktop = params.row[field]?.desktop;

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
              justifyContent="left"
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
                    result = 'some';
                  } else {
                    result = 'false';
                  }
                  return [key, result];
                })
              )
            : {};

        const renderSubBar = (
          deviceValues: any[],
          deviceTrueCount: number,
          color: string
        ): React.ReactElement | null => {
          return deviceValues.length > 0 ? (
            <div
              style={{
                display: 'flex',
                maxHeight: '3px',
                width: '100%',
                paddingBottom: '5px',
              }}
            >
              {[...Array(totalCount)].map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: `${100 / totalCount}%`,
                    backgroundColor: index < deviceTrueCount ? color : '#3f4350',
                    marginRight: index !== totalCount - 1 ? '2px' : undefined,
                    borderRadius:
                      index === 0 ? '5px 0 0 5px' : index === totalCount - 1 ? '0 5px 5px 0' : '0',
                    minHeight: '2px',
                  }}
                />
              ))}
            </div>
          ) : null;
        };

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
                      backgroundColor: index < minTrueCount ? '#80ffa2' : '#3f4350',
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
                  {renderSubBar(mobileValues, mobileTrueCount, '#E6C2FF')}
                  {renderSubBar(browserValues, browserTrueCount, '#C3C7FF')}
                  {renderSubBar(desktopValues, desktopTrueCount, '#C2D9FF')}
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
                          ) : value === 'some' ? (
                            <DataUsageRounded fontSize="inherit" color="inherit" />
                          ) : (
                            <CloseIcon fontSize="inherit" />
                          )}
                          <span>{subcategoryMapping[key] ?? key}</span>
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
                {params.value}
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
                event.stopPropagation(); // Prevent the row click event
                handleShowMore(params.id.toString());
              }}
            >
              {expandedRows[params.id.toString()] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          {expandedRows[params.id.toString()] && (
            <Link
              href={`https://searchcaster.xyz/search?text=${params.value}`}
              target="_blank"
              rel="noopener noreferrer"
              color="text.primary"
            >
              <Typography variant="body2" fontSize="10px">
                what people are saying
              </Typography>
            </Link>
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
      />
    </Box>
  );
}
