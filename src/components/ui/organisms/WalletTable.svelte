<script lang="ts">
	// Types/constants
	import type { Variant } from '@/schema/variants'
	import {
		ecosystemAttributeGroup,
		privacyAttributeGroup,
		securityAttributeGroup,
		selfSovereigntyAttributeGroup,
		transparencyAttributeGroup,
	} from '@/schema/attribute-groups'
	import { ratedWallets } from '@/data/wallets'

	const attributeGroups = {
		[securityAttributeGroup.id]: securityAttributeGroup,
		[privacyAttributeGroup.id]: privacyAttributeGroup,
		[selfSovereigntyAttributeGroup.id]: selfSovereigntyAttributeGroup,
		[transparencyAttributeGroup.id]: transparencyAttributeGroup,
		[ecosystemAttributeGroup.id]: ecosystemAttributeGroup,
	}


	// State
	let tableState: {
		selectedVariant: Variant | undefined
	} = $state({
		selectedVariant: undefined,
	})


	// Components
	import WalletRatingCell from '@/components/ui/molecules/WalletRatingCell.svelte'
	import Table from '@/components/ui/atoms/Table.svelte'
</script>


<Table
	rows={
		Object.entries(ratedWallets)
			.map(([id, wallet]) => ({ id, wallet }))
	}
	getId={({ id }) => id}
	columns={[
		{
			id: 'displayName',
			key: 'displayName',
			name: 'Wallet',
			getValue: ({ wallet }) => wallet.metadata.displayName,
		},
		...(
			Object.values(attributeGroups)
				.map(attrGroup => ({
					id: attrGroup.id,
					key: attrGroup.id,
					name: `${attrGroup.icon} ${attrGroup.displayName}`,
					getValue: ({ wallet }) => attrGroup.score(wallet.overall[attrGroup.id]),
				}))
		),
	]}
	class="wallet-table"
>
	{#snippet cellSnippet({
		row: { wallet },
		column,
		value,
	})}
		{#if column.key === 'displayName'}
			{@const displayName = value}

			<img
				alt={displayName}
				src={`/images/wallets/${wallet.metadata.id}.${wallet.metadata.iconExtension}`}
				width="16"
				height="16"
			/>
			{displayName}
		{:else}
			{@const attrGroup = attributeGroups[column.id]}
			{@const evalGroup = value}
			{@const { score, unratedComponent } = evalGroup}

			{score ? (score * 100).toFixed(0) : '❓'}
			<!-- <WalletRatingCell
				{wallet}
				{attrGroup}
				{evalGroup}
			/> -->
		{/if}
	{/snippet}
</Table>


<style>
	:global(.wallet-table) {
		font-size: 1.1em;
	}

	img {
		filter: drop-shadow(rgba(255, 255, 255, 0.1) 0px 0px 4.66667px);
		width: auto;
		height: 1.66rem;
		vertical-align: middle;
	}
</style>
