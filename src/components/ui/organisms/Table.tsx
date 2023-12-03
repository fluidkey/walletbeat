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
import { OpenInNewRounded } from '@mui/icons-material';

export default function ComparisonTable(): JSX.Element {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const rows = Object.entries(wallets).map(([name, features], index) => {
    const row = {
      id: index,
      name,
      total: 0,
      max: 0,
      url: features.url,
      deviceCompatibility: features.deviceCompatibility,
      accountType: features.accountType,
      chainCompatibility: features.chainCompatibility,
      ensCompatibility: features.ensCompatibility,
      backupOptions: features.backupOptions,
      securityFeatures: features.securityFeatures,
      availableTestnets: features.availableTestnets,
    };

    return row;
  });

  const fields = [
    'chainCompatibility',
    'ensCompatibility',
    'backupOptions',
    'securityFeatures',
    'deviceCompatibility',
    'accountType',
    'availableTestnets',
  ];

  const fieldToHeaderName: Record<string, string> = {
    accountType: 'Type',
    deviceCompatibility: 'Devices',
    chainCompatibility: 'Chains',
    ensCompatibility: 'ENS',
    backupOptions: 'Backup',
    securityFeatures: 'Security',
    availableTestnets: 'Testnets',
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

    if (field === 'accountType') {
      return {
        field,
        headerName: fieldToHeaderName[field],
        headerAlign: 'left',
        hideSortIcons: true,
        disableColumnMenu: true,
        renderCell: params => {
          const accountType = params.value as Record<string, boolean>;
          return (
            <Box
              display="flex"
              alignItems="flex-start"
              justifyContent="left"
              height="100%"
              width="100%"
              py={1.5}
            >
              {accountType.eoa && <Typography color={'#FAFDFF'}>EOA</Typography>}
              {accountType.erc4337 && <Typography color={'#FAFDFF'}>ERC4337</Typography>}
              {accountType.safe && <Typography color={'#FAFDFF'}>Safe</Typography>}
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
        const values = Object.values(params.row[field] as Record<string, boolean>);
        const trueCount = values.filter(Boolean).length;
        const totalCount = values.length;
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
              {values[0] ? <CheckIcon /> : <CloseIcon />}
            </Box>
          );
        }
        return (
          <Box
            display="flex"
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
                {`${trueCount}/${totalCount}`}
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
                {values
                  .sort((a, b) => (b === a ? 0 : b ? 1 : -1)) // Sort so that true values come first
                  .map((value, index, array) => (
                    <div
                      key={index}
                      style={{
                        width: `${100 / totalCount}%`,
                        backgroundColor: value ? '#80ffa2' : '#3f4350',
                        marginRight: index !== array.length - 1 ? '2px' : undefined,
                        borderRadius:
                          index === 0
                            ? '5px 0 0 5px'
                            : index === array.length - 1
                              ? '0 5px 5px 0'
                              : '0',
                        minHeight: '6px',
                      }}
                    />
                  ))}
              </div>
              {expandedRows[params.id.toString()] && (
                <ul style={{ textAlign: 'left', width: '100%', padding: 0, listStyleType: 'none' }}>
                  {Object.entries(params.row[field] as Record<string, boolean>).map(
                    ([key, value]) => (
                      <li key={key}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '10px',
                            gap: '4px',
                          }}
                        >
                          {value ? (
                            <CheckIcon fontSize="inherit" color="success" />
                          ) : (
                            <CloseIcon fontSize="inherit" />
                          )}
                          <span>{subcategoryMapping[key] ?? key}</span>
                        </div>
                      </li>
                    )
                  )}
                </ul>
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
              <Typography variant="body2" fontSize="10px" pt={1}>
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
    <Box maxWidth="95%" height="100%" width="fit-content" overflow="auto" my={2}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowHeight={row => (expandedRows[row.id.toString()] ? 200 : 50)}
        density="compact"
        disableRowSelectionOnClick
      />
    </Box>
  );
}
