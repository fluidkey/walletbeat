<script lang="ts">
	// Types/constants
	import {
		type AttributeGroup,
		type EvaluatedGroup,
		type ValueSet,
		Rating,
		ratingToIcon,
		ratingToColor,
		evaluatedAttributesEntries,
	} from '@/schema/attributes'
	import { type RatedWallet } from '@/schema/wallet'
	import { isNonEmptyArray, nonEmptyMap } from '@/types/utils/non-empty'
	import Pie from '../atoms/Pie.svelte'
	import { type WalletTableState } from '../organisms/WalletTable.svelte'
	import WalletRating from './WalletRating.svelte'
	import { betaSiteRoot } from '@/constants'
	import { variantUrlQuery } from '../../variants'
	import { slugifyCamelCase } from '@/types/utils/text'

	// Extend AttributeGroup type with color
	type GroupSlice = {
		id: string
		icon: string
		displayName: string
		color: string
		score: any
		evalGroup: any
	}

	// Props
	let { data } = $props<{
		data: {
			wallet: RatedWallet
			attributeGroups: AttributeGroup<any>[]
			tableState: WalletTableState | null
			rowId: string | null
		}
	}>()

	// Derived props for convenience
	let wallet = $derived(data.wallet)
	let attributeGroups = $derived(data.attributeGroups)
	let tableState = $derived(data.tableState)
	let rowId = $derived(data.rowId)

	// State
	let highlightedSlice = $state<{
		groupId: string
		attributeId?: string
		sticky: boolean
	} | null>(null)

	// Animation state
	let isTransitioning = $state(false)

	// Computed properties
	let groupSlicesData = $derived(
		attributeGroups.map(group => {
			const groupScore = group.score(wallet.overall[group.id])
			const evalGroup = wallet.overall[group.id]

			// Get color based on score
			let scoreColor = '#666'
			if (groupScore && !groupScore.hasUnratedComponent) {
				// Map score (0 to 1) to a color from red to green
				const hue = Math.round(groupScore.score * 120) // 0 = red, 120 = green
				scoreColor = `hsl(${hue}, 80%, 45%)`
			}

			// Get all evaluation attributes for this group
			const evalEntries = evalGroup ? 
				evaluatedAttributesEntries(evalGroup).filter(
					([_, evalAttr]) => evalAttr?.evaluation?.value?.rating !== Rating.EXEMPT,
				) : []

			// Calculate sub-slices for this group's attributes as children
			const children = !isNonEmptyArray(evalEntries)
				? []
				: evalEntries.map(([evalAttrId, evalAttr]) => {
						return {
							id: `${group.id}:${evalAttrId}`,
							parentId: group.id,
							color: ratingToColor(evalAttr.evaluation.value.rating),
							weight: 1,
							arcLabel: evalAttr.evaluation.value.icon ?? evalAttr.attribute.icon,
							tooltip: `${evalAttr.attribute.displayName}`,
							tooltipValue: ratingToIcon(evalAttr.evaluation.value.rating),
						}
					})

			return {
				id: group.id,
				icon: group.icon,
				displayName: group.displayName,
				color: scoreColor,
				score: groupScore,
				evalGroup: evalGroup,
				weight: 1, // All main groups have equal weight
				children, // Add children for hierarchical rendering
				arcLabel: group.icon,
				tooltip: group.displayName,
				tooltipValue: groupScore
					? groupScore.hasUnratedComponent
						? 'Unrated'
						: (groupScore.score * 100).toFixed(0) + '%'
					: 'N/A',
			}
		}),
	)

	let hierarchicalSlices = $derived(groupSlicesData)

	let highlightedGroup = $derived(
		!highlightedSlice
			? null
			: groupSlicesData.find(g => g.id === highlightedSlice?.groupId) || null,
	)

	let highlightedAttribute = $derived(
		!highlightedSlice || !highlightedSlice.attributeId || !highlightedGroup
			? null
			: highlightedGroup.evalGroup && highlightedGroup.evalGroup[highlightedSlice.attributeId] || null,
	)

	// Track changes to display mode for transitions
	$effect(() => {
		if (tableState?.displayMode) {
			isTransitioning = true
			setTimeout(() => {
				isTransitioning = false
			}, 300)
		}
	})

	// Event handlers
	function onSliceClick(sliceId: string) {
		const [groupId, attrId] = sliceId.split(':')

		if (!highlightedSlice) {
			// First click on any slice
			highlightedSlice = {
				groupId,
				attributeId: attrId,
				sticky: true,
			}
		} else if (highlightedSlice.groupId !== groupId || highlightedSlice.attributeId !== attrId) {
			// Clicking on a different slice
			highlightedSlice = {
				groupId,
				attributeId: attrId,
				sticky: true,
			}
		} else {
			// Clicking on the same slice, toggle sticky
			highlightedSlice = {
				groupId,
				attributeId: attrId,
				sticky: !highlightedSlice.sticky,
			}
		}

		// Expand the row
		if (tableState?.expandedRowIds && rowId) {
			tableState.expandedRowIds.add(rowId)
		}
	}

	function onSliceMouseEnter(sliceId: string) {
		const [groupId, attrId] = sliceId.split(':')

		if (!highlightedSlice || !highlightedSlice.sticky) {
			highlightedSlice = {
				groupId,
				attributeId: attrId,
				sticky: false,
			}
		}
	}

	function onSliceMouseLeave(sliceId: string) {
		const [groupId, attrId] = sliceId.split(':')

		if (
			highlightedSlice &&
			!highlightedSlice.sticky &&
			highlightedSlice.groupId === groupId &&
			highlightedSlice.attributeId === attrId
		) {
			highlightedSlice = null
		}
	}

	// Helper to get pie slices
	function getAttributeSlices(groupId: string, evalGroup: any) {
		if (!evalGroup) return []
		
		const evalEntries = evaluatedAttributesEntries(evalGroup).filter(
			([_, evalAttr]) => evalAttr?.evaluation?.value?.rating !== Rating.EXEMPT,
		)

		if (!isNonEmptyArray(evalEntries)) return []

		return nonEmptyMap(evalEntries, ([evalAttrId, evalAttr]) => {
			const icon = evalAttr.evaluation.value.icon ?? evalAttr.attribute.icon
			return {
				id: `${groupId}:${evalAttrId}`,
				color: ratingToColor(evalAttr.evaluation.value.rating),
				weight: 1,
				arcLabel: icon,
				tooltip: `${icon} ${evalAttr.evaluation.value.displayName}`,
				tooltipValue: ratingToIcon(evalAttr.evaluation.value.rating),
			}
		})
	}
</script>

<div
	class="combined-wallet-rating"
	class:transitioning={isTransitioning}
	role="button"
	tabindex="0"
>
	<!-- Combined Pie Chart with hierarchical slices -->
	<div class="pie-container">
		<Pie
			slices={hierarchicalSlices}
			layout="Full"
			radius={75}
			levels={[
				{
					outerRadiusFraction: 0.7,
					innerRadiusFraction: 0.3,
					gap: 8,
					angleGap: 0,
					labelFontSize: 10,
					opacity: 1
				},
				{
					outerRadiusFraction: 1,
					innerRadiusFraction: 0.75,
					gap: 16,
					angleGap: 0,
					labelFontSize: 8,
					opacity: 0.9
				}
			]}
			hierarchical={true}
			highlightedSliceId={highlightedSlice?.attributeId
				? `${highlightedSlice.groupId}:${highlightedSlice.attributeId}`
				: highlightedSlice?.groupId}
			centerLabel={wallet.metadata.displayName.substring(0, 1)}
			{onSliceClick}
			{onSliceMouseEnter}
			{onSliceMouseLeave}
		/>
	</div>

	<!-- Expanded Details -->
	{#if tableState?.expandedRowIds?.has(rowId ?? '') && highlightedGroup}
		<div class="expanded-details">
			{#if !highlightedAttribute}
				<!-- Group Information -->
				<h3 class="group-title">{highlightedGroup.icon} {highlightedGroup.displayName}</h3>

				<!-- Show attribute slices for this group -->
				<div class="attribute-pie-container">
					<Pie
						layout="TopHalf"
						radius={45}
						slices={getAttributeSlices(highlightedGroup.id, highlightedGroup.evalGroup)}
						highlightedSliceId={highlightedSlice?.attributeId
							? `${highlightedGroup.id}:${highlightedSlice.attributeId}`
							: null}
						{onSliceClick}
						{onSliceMouseEnter}
						{onSliceMouseLeave}
					/>
				</div>

				<p class="group-description">
					{#if typeof highlightedGroup.evalGroup.perWalletQuestion?.render === 'function'}
						{highlightedGroup.evalGroup.perWalletQuestion.render(wallet.metadata)}
					{:else}
						{highlightedGroup.evalGroup.perWalletQuestion}
					{/if}
				</p>
			{:else}
				<!-- Attribute Information -->
				<h4 class="attribute-title">
					{highlightedAttribute.evaluation.value.icon ?? highlightedAttribute.attribute.icon}
					{highlightedAttribute.attribute.displayName}
				</h4>
				<p class="attribute-description">
					{#if typeof highlightedAttribute.evaluation.value.shortExplanation.render === 'function'}
						{@const explanation = highlightedAttribute.evaluation.value.shortExplanation.render(
							wallet.metadata,
						)}
						{ratingToIcon(highlightedAttribute.evaluation.value.rating)}
						{explanation}
					{:else}
						{ratingToIcon(highlightedAttribute.evaluation.value.rating)}
						{highlightedAttribute.evaluation.value.shortExplanation}
					{/if}
				</p>

				<!-- Learn More Link -->
				<div class="learn-more-container">
					<a
						href="{betaSiteRoot}/{wallet.metadata.id}/{variantUrlQuery(
							wallet.variants,
							tableState?.variantSelected ?? null,
						)}#{slugifyCamelCase(highlightedAttribute.attribute.id)}"
						class="learn-more-link"
					>
						<svg viewBox="0 0 24 24" width="16" height="16">
							<path
								fill="currentColor"
								d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
							/>
						</svg>
						Learn more
					</a>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.combined-wallet-rating {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		gap: 4px;
		transition:
			opacity 0.3s ease,
			transform 0.3s ease;
	}

	.pie-container {
		position: relative;
		width: 150px;
		height: 150px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.transitioning {
		opacity: 0.5;
		transform: scale(0.95);
	}

	.expanded-details {
		height: calc(var(--expanded-row-height, 200px) - 40px);
		display: flex;
		flex-direction: column;
		line-height: 1;
		gap: 4px;
		white-space: normal;
	}

	.attribute-pie-container {
		display: flex;
		justify-content: center;
		margin: 8px 0;
	}

	.group-title,
	.attribute-title {
		white-space: nowrap;
		margin: 0;
	}

	.group-title {
		font-size: 1.2rem;
	}

	.attribute-title {
		font-size: 1.1rem;
	}

	.group-description,
	.attribute-description {
		margin: 0;
		font-size: 0.9rem;
	}

	.learn-more-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}

	.learn-more-link {
		display: flex;
		align-items: center;
		gap: 4px;
		text-decoration: none;
		color: inherit;
	}
</style>
