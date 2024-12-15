'use client';

import { ratedWallets } from '@/data/wallets';
import type { AttributeGroup, ValueSet, EvaluatedGroup } from '@/schema/attributes';
import type { RatedWallet } from '@/schema/wallet';
import { Box } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import type React from 'react';
import { WalletRatingCell, walletRatingColumnProps } from '../molecules/WalletRatingCell';
import {
  type EvaluationTree,
  PrivacyAttributeGroup,
  transparencyAttributeGroup,
} from '@/schema/attribute-groups';
import { WalletNameCell } from '../molecules/WalletNameCell';

/** Non-expanded row height. */
const shortRowHeight = 56;

/** Class handling rendering and scoring a single wallet row. */
class WalletRow {
  readonly wallet: RatedWallet;

  /** Data table ID; required by DataGrid. */
  readonly id: string;

  constructor(wallet: RatedWallet) {
    this.wallet = wallet;
    this.id = wallet.metadata.id;
  }

  /** Render the "Name" cell. */
  renderName(): React.JSX.Element {
    return <WalletNameCell wallet={this.wallet}></WalletNameCell>;
  }

  /** Compute numerical score for an attribute group. */
  score<Vs extends ValueSet>(
    attrGroup: AttributeGroup<Vs>,
    evalGroupFn: (tree: EvaluationTree) => EvaluatedGroup<Vs>
  ): number {
    return attrGroup.score(evalGroupFn(this.wallet.overall));
  }

  /** Render a cell for a rating column. */
  render<Vs extends ValueSet>(
    attrGroup: AttributeGroup<Vs>,
    evalGroupFn: (tree: EvaluationTree) => EvaluatedGroup<Vs>
  ): React.JSX.Element {
    return (
      <WalletRatingCell<Vs> wallet={this.wallet} attrGroup={attrGroup} evalGroupFn={evalGroupFn} />
    );
  }
}

/** Column definition for wallet rating columns. */
function walletTableColumn<Vs extends ValueSet>(
  group: AttributeGroup<Vs>,
  evalGroupFn: (tree: EvaluationTree) => EvaluatedGroup<Vs>
): GridColDef<WalletRow, number> {
  return {
    ...walletRatingColumnProps,
    field: group.id,
    headerName: `${group.icon} ${group.displayName}`,
    type: 'number',
    width: 128,
    valueGetter: (_: never, row: WalletRow): number => row.score(group, evalGroupFn),
    renderCell: params => params.row.render(group, evalGroupFn),
  };
}

/** Main wallet comparison table. */
export default function WalletTable(): React.JSX.Element {
  const rows = Object.values(ratedWallets).map(wallet => new WalletRow(wallet));
  const walletNameColumn: GridColDef<WalletRow, string> = {
    field: 'displayName',
    headerName: 'Wallet',
    type: 'string',
    width: 320,
    valueGetter: (_: never, row: WalletRow): string => row.wallet.metadata.displayName,
    renderCell: params => params.row.renderName(),
  };
  const columns: GridColDef[] = [
    walletNameColumn,
    walletTableColumn(PrivacyAttributeGroup, tree => tree.privacy),
    walletTableColumn(transparencyAttributeGroup, tree => tree.transparency),
  ];
  return (
    <Box maxWidth="100%" height="90vh" width="fit-content" overflow="auto">
      <DataGrid
        rows={rows}
        columns={columns}
        getRowHeight={row => shortRowHeight}
        density="standard"
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
