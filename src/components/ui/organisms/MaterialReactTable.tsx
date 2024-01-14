'use client';

import { useMemo } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { wallets } from '@/data/data';
import { type Info } from '@/types/Info';

function numberedCriteriaAccessorFn(row: Info, criterion: string): number[] {
  const categories = ['mobile', 'desktop', 'browser'];
  const sumsAndCounts = categories.map(category => {
    const deviceCriterion = (row as any)[category]?.[criterion];
    if (deviceCriterion == null) {
      return null;
    }
    const values = Object.values(deviceCriterion);
    const sum = values.reduce((total: number, value) => total + ((value as boolean) ? 1 : 0), 0);
    const count = values.length;
    return { sum, count };
  });

  const nonNullSumsAndCounts = sumsAndCounts.filter(sumAndCount => sumAndCount !== null) as Array<{
    sum: number;
    count: number;
  }>;

  const minSum = Math.min(...nonNullSumsAndCounts.map(sumAndCount => sumAndCount.sum));
  const maxSum = Math.max(...nonNullSumsAndCounts.map(sumAndCount => sumAndCount.sum));
  const count = nonNullSumsAndCounts[0]?.count ?? 0;

  return [minSum, maxSum, count];
}

export default function Table(): JSX.Element {
  const columns = useMemo<Array<MRT_ColumnDef<Info>>>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        muiTableHeadCellProps: { style: { color: 'green' } },
        enableHiding: false,
      },
      {
        accessorFn: row => numberedCriteriaAccessorFn(row, 'chainCompatibility'),
        id: 'chainsSum',
        header: 'Chains Sum',
        Cell: ({ cell, row }) => {
          const value = cell.getValue() as number[];
          const totalCount = value[2];
          const minTrueCount = value[0];
          const maxTrueCount = value[1];
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
                {[...Array(value[2])].map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: `${100 / totalCount}%`,
                      backgroundColor:
                        index < minTrueCount
                          ? '#80ffa2'
                          : index < maxTrueCount
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
              // when row is expanded, chec
              {row.getIsExpanded() && <i>EXPAN</i>}
            </>
          );
        },
      },
      {
        accessorFn: row => numberedCriteriaAccessorFn(row, 'ensCompatibility'),
        id: 'ensSum',
        header: 'ENS Sum',
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: wallets,
    enableColumnOrdering: true,
    enableGlobalFilter: false,
    enableExpanding: true,
    renderDetailPanel: ({ row }) => <div />,
    muiDetailPanelProps: { style: { display: 'none' } },
  });

  return <MaterialReactTable table={table} />;
}
