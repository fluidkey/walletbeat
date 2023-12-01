'use client';

import React, { useState } from 'react';
import { DataGrid, GridColDef, GridColumnGroupingModel } from '@mui/x-data-grid';
import { wallets } from '@/data/mockData';
import { Box } from '@mui/material';

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
    'deviceCompatibility', 'accountType', 'chainCompatibility', 'ensCompatibility', 'backupOptions', 'securityFeatures', 'availableTestnets'
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
  
  const createColumnDef = (field: string): GridColDef => ({
    field,
    headerName: fieldToHeaderName[field],
    width: 150,
    type: 'boolean',
    headerAlign: 'center',
    renderCell: (params) => {
      const values = Object.values(params.value as Record<string, boolean>);
      const trueCount = values.filter(Boolean).length;
      const totalCount = values.length;
    
      return (
        <div style={{width: "100%"}}>
          <div style={{ width: `${(trueCount / totalCount) * 100}%`, backgroundColor: 'blue', height: '20px' }} />
          {expandedRows[params.id.toString()] && (
            <ul>
              {Object.entries(params.value as Record<string, boolean>).map(([key, value]) => (
                <li key={key}>{`${key}: ${value ? 'Yes' : 'No'}`}</li>
              ))}
            </ul>
          )}
        </div>
      );
    },
  });
  
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Wallet', width: 150, type: 'string', renderCell: (params) => <Box onClick={() => handleShowMore(params.id.toString())}>{params.value}</Box> },
    ...fields.map(field => createColumnDef(field)),
  ];

  const columnGroupingModel: GridColumnGroupingModel = [
    {
      groupId: 'deviceCompatibility',
      description: '',
      children: [{ field: 'mobile' }, { field: 'desktop' }],
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        experimentalFeatures={{ columnGrouping: true }}
        columnGroupingModel={columnGroupingModel}
        getRowHeight={(row) => expandedRows[row.id.toString()] ? 200 : 50}
      />
    </div>
  );
}
