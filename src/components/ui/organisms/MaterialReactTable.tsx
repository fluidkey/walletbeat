'use client';

import { useMemo } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { wallets } from '@/data/data';
import { type Info } from '@/types/Info';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import LanguageIcon from '@mui/icons-material/Language';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { subcategoryMapping } from '@/data/mapping';

type ExtendedInfo = Info & {
  minTrueCount: number;
  totalCount: number;
  mobileTrueCount: number;
  browserTrueCount: number;
  desktopTrueCount: number;
  checkValues: Array<[string, string | undefined]>;
};

function numberedCriteriaAccessorFn(row: ExtendedInfo, criterion: string): any {
  const mobile = (row as any)?.mobile?.[criterion];
  const browser = (row as any)?.browser?.[criterion];
  const desktop = (row as any)?.desktop?.[criterion];
  const issues = (row as any)?.issues?.[criterion];

  console.log(mobile, browser, desktop, issues);
  const mobileValues = Object.values(mobile ?? {});
  const browserValues = Object.values(browser ?? {});
  const desktopValues = Object.values(desktop ?? {});
  const totalCount = Math.max(mobileValues.length, browserValues.length, desktopValues.length);

  console.log('VALUES', mobileValues, browserValues, desktopValues);
  const mobileTrueCount = mobileValues.filter(Boolean).length;
  const browserTrueCount = browserValues.filter(Boolean).length;
  const desktopTrueCount = desktopValues.filter(Boolean).length;

  console.log('COUNT', mobileTrueCount, browserTrueCount, desktopTrueCount);

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

  console.log(
    minTrueCount,
    totalCount,
    mobileTrueCount,
    browserTrueCount,
    desktopTrueCount,
    checkValues
  );

  return {
    ...row,
    minTrueCount,
    totalCount,
    mobileTrueCount,
    browserTrueCount,
    desktopTrueCount,
    checkValues: Object.entries(checkValues),
  };
}

function numberedCriteriaCellRenderer({ cell, row }: any): JSX.Element {
  const minTrueCount = row.totalCount;
  const totalCount = row.totalCount;
  const mobileTrueCount = row.mobileTrueCount;
  const browserTrueCount = row.browserTrueCount;
  const desktopTrueCount = row.desktopTrueCount;
  const checkValues = row.checkValues;

  console.log(
    'HERE',
    minTrueCount,
    totalCount,
    mobileTrueCount,
    browserTrueCount,
    desktopTrueCount
  );

  return (
    <>
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
                  : index < mobileTrueCount || index < browserTrueCount || index < desktopTrueCount
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
      {row.getIsExpanded() === true && (
        <>
          <ul style={{ textAlign: 'left', width: '100%', padding: 0, listStyleType: 'none' }}>
            {checkValues.map(([key, value]: [string, string]) => (
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
                  {subcategoryMapping[key] ?? key}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

export default function Table(): JSX.Element {
  const columns = useMemo<Array<MRT_ColumnDef<ExtendedInfo>>>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        muiTableHeadCellProps: { style: { color: 'green' } },
        enableHiding: false,
      },
      {
        accessorFn: row => numberedCriteriaAccessorFn(row, 'chainCompatibility').totalCount,
        id: 'chainsSum',
        header: 'Chains Sum',
        Cell: ({ cell, row }) => {
          return numberedCriteriaCellRenderer({
            cell,
            row,
          });
        },
      },
      {
        accessorFn: row => numberedCriteriaAccessorFn(row, 'ensCompatibility'),
        id: 'ensSum',
        header: 'ENS Sum',
        Cell: ({ cell, row }) => {
          return numberedCriteriaCellRenderer({ cell, row });
        },
      },
      {
        accessorFn: row => numberedCriteriaAccessorFn(row, 'backupOptions'),
        id: 'backupSum',
        header: 'Backup Sum',
        Cell: ({ cell, row }) => {
          return numberedCriteriaCellRenderer({ cell, row });
        },
      },
      {
        accessorFn: row => numberedCriteriaAccessorFn(row, 'securityFeatures'),
        id: 'securitySum',
        header: 'Security Sum',
        Cell: ({ cell, row }) => {
          return numberedCriteriaCellRenderer({ cell, row });
        },
      },
      {
        accessorFn: row => numberedCriteriaAccessorFn(row, 'connectionMethods'),
        id: 'connectionSum',
        header: 'Connection Sum',
        Cell: ({ cell, row }) => {
          return numberedCriteriaCellRenderer({ cell, row });
        },
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns: columns as unknown as Array<MRT_ColumnDef<Info, any>>,
    data: wallets,
    manualPagination: true,
    rowCount: wallets.length,
    enableColumnOrdering: true,
    enableGlobalFilter: false,
    enableExpanding: true,
    renderDetailPanel: ({ row }) => <div />,
    muiDetailPanelProps: { style: { display: 'none' } },
  });

  return <MaterialReactTable table={table} />;
}
