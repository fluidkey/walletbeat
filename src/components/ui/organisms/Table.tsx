'use client';

import React, { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { wallets } from '@/data/mockData';
import { Box, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import LanguageIcon from '@mui/icons-material/Language';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';

export default function ComparisonTable(): JSX.Element {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const rows = Object.entries(wallets).map(([name, features], index) => {
    const row = {
      id: index,
      name,
      total: 0,
      max: 0,
      deviceCompatibility: features.deviceCompatibility,
      deviceCompatibilityTotal: Object.values(features.deviceCompatibility).filter(Boolean).length,
      deviceCompatibilityMax: Object.values(features.deviceCompatibility).length,
      accountType: features.accountType,
      accountTypeTotal: Object.values(features.accountType).filter(Boolean).length,
      accountTypeMax: Object.values(features.accountType).length,
      chainCompatibility: features.chainCompatibility,
      chainCompatibilityTotal: Object.values(features.chainCompatibility).filter(Boolean).length,
      chainCompatibilityMax: Object.values(features.chainCompatibility).length,
      ensCompatibility: features.ensCompatibility,
      ensCompatibilityTotal: Object.values(features.ensCompatibility).filter(Boolean).length,
      ensCompatibilityMax: Object.values(features.ensCompatibility).length,
      backupOptions: features.backupOptions,
      backupOptionsTotal: Object.values(features.backupOptions).filter(Boolean).length,
      backupOptionsMax: Object.values(features.backupOptions).length,
      securityFeatures: features.securityFeatures,
      securityFeaturesTotal: Object.values(features.securityFeatures).filter(Boolean).length,
      securityFeaturesMax: Object.values(features.securityFeatures).length,
      availableTestnets: features.availableTestnets,
      availableTestnetsTotal: Object.values(features.availableTestnets).filter(Boolean).length,
      availableTestnetsMax: Object.values(features.availableTestnets).length,
    };

    // Calculate the total number of true values
    row.total = Object.values(row).filter(Boolean).length;
    // Calculate the maximum number of true values
    row.max = Object.values(row).length;

    console.log(row);
    return row;
  });

  const fields = [
    'deviceCompatibility',
    'accountType',
    'chainCompatibility',
    'ensCompatibility',
    'backupOptions',
    'securityFeatures',
    'availableTestnets',
  ];

  const fieldToHeaderName: { [key: string]: string } = {
    accountType: 'Account Type',
    deviceCompatibility: 'Device Compatibility',
    chainCompatibility: 'Chain Compatibility',
    ensCompatibility: 'ENS Compatibility',
    backupOptions: 'Backup Options',
    securityFeatures: 'Security Features',
    availableTestnets: 'Available Testnets',
  };

  const handleShowMore = (id: string) => {
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
        renderCell: (params) => {
          const compatibility = params.value as Record<string, boolean>;
          return (
            <Box display="flex" gap={1}>
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

    return {
      field,
      headerName: fieldToHeaderName[field],
      width: 150,
      type: 'boolean',
      headerAlign: 'center',
      cellClassName: 'align-top',
      valueGetter: (params) => {
        const values = Object.values(params.value as Record<string, boolean>);
        const trueCount = values.filter(Boolean).length;
        return trueCount;
      },
      renderCell: params => {
        const values = Object.values(params.row[field] as Record<string, boolean>);
        const trueCount = values.filter(Boolean).length;
        const totalCount = values.length;
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start',  justifyContent: 'flex-start', height: '100%' }}>
            <Typography variant="body2" style={{ marginRight: '10px' }}>
              {`${trueCount}/${totalCount}`}
            </Typography>
            <div style={{ display: 'flex', height: '15px', width: '100%' }}>
              {values
                .sort((a, b) => (b === a ? 0 : b ? 1 : -1)) // Sort so that true values come first
                .map((value, index, array) => (
                  <div
                    key={index}
                    style={{
                      width: `${100 / totalCount}%`,
                      backgroundColor: value ? '#80ffa2' : '#3f4350',
                      marginRight: index !== array.length - 1 ? '2px' : undefined,
                      borderRadius: index === 0 ? '5px 0 0 5px' : index === array.length - 1 ? '0 5px 5px 0' : '0',
                    }}
                  />
                ))}
            </div>
            {expandedRows[params.id.toString()] && (
              <ul style={{ textAlign: 'left', width: '100%', padding: 0, listStyleType: 'none' }}>
                {Object.entries(params.row[field] as Record<string, boolean>).map(([key, value]) => (
                  <li key={key}>{`${key}: ${value ? 'Yes' : 'No'}`}</li>
                ))}
              </ul>
            )}
          </div>
        );
      }
    };
  }
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Wallet',
      width: 150,
      type: 'string',
      renderCell: params => (
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" height="100%">
          <>{params.value}</>
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation(); // Prevent the row click event
              handleShowMore(params.id.toString());
            }}
          >
            {expandedRows[params.id.toString()] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      ),
    },
    ...fields.map(field => createColumnDef(field)),
  ];


  return (
    <div style={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowHeight={row => (expandedRows[row.id.toString()] ? 250 : 50)}
      />
    </div>
  );
}
