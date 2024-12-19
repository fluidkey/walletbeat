import type { EvaluationTree } from '@/beta/schema/attribute-groups';
import type { Variant } from '@/beta/schema/variants';
import type { RatedWallet } from '@/beta/schema/wallet';
import type { SxProps } from '@mui/system';

export interface WalletTableState {
  readonly variantSelected: Variant | null;
}

export interface WalletTableStateHandle extends WalletTableState {
  variantClick: (clicked: Variant) => void;
}

export interface WalletRowState {
  readonly expanded: boolean;
}

export interface WalletRowStateHandle extends WalletRowState {
  readonly wallet: RatedWallet;
  readonly evalTree: EvaluationTree;
  readonly table: WalletTableStateHandle;
  readonly rowWideStyle: SxProps;
  toggleExpanded: () => void;
  setExpanded: (expanded: boolean) => void;
}
