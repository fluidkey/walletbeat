<script lang="ts" generics="
	_ValueSet extends ValueSet = ValueSet
">
	// Types/constants
	import type { EvaluationTree } from '@/schema/attribute-groups'
	import {
		type AttributeGroup,
		type EvaluatedGroup,
		type ValueSet,
		type EvaluatedAttribute,
		Rating,
		type Value,
		evaluatedAttributesEntries,
		ratingToIcon,
		ratingToColor,
	} from '@/schema/attributes'
	import { attributeVariantSpecificity, VariantSpecificity } from '@/schema/wallet'
	import { isNonEmptyArray, type NonEmptyArray, nonEmptyMap } from '@/types/utils/non-empty'
	import { slugifyCamelCase } from '@/types/utils/text'
	import { betaSiteRoot } from '@/constants'
	import { variantToName, variantUrlQuery } from '../../variants'

	type PieSlice = {
		id: string
		color: string
		weight: number
		arcLabel: string
		tooltip: string
		tooltipValue: string
	}

	// Use string literals instead of enum for better compatibility
	const ARC_TOP_HALF = 'TOP_HALF'
	const ARC_FULL = 'FULL'
	type ArcType = typeof ARC_TOP_HALF | typeof ARC_FULL

	const ratingPieMargin = 2
	const ratingPieHeight = 40 - ratingPieMargin * 2 // shortRowHeight - ratingPieMargin * 2
	const ratingPieWidth = ratingPieHeight * 2
	const expandedRowHeight = 200 // Estimated from the original component


	// Inputs
	let {
		wallet,
		attrGroup,
		evalGroup
	}: {
		wallet: {
			evalTree: EvaluationTree
			wallet: any
			table: any
			expanded: boolean
			setExpanded: (expanded: boolean) => void
			rowWideStyle?: any
		}
		attrGroup: AttributeGroup<_ValueSet>
		evalGroup: EvaluatedGroup<_ValueSet>
	} = $props()


	// State
	let highlightedSlice = $state<
		{
			evalAttrId: string,
			sticky: boolean
		} | null
	>(null)

	let evalEntries = $derived(
		evaluatedAttributesEntries(evalGroup)
			.filter(([_, evalAttr]) => (
				evalAttr.evaluation.value.rating !== Rating.EXEMPT
			))
	)
	let groupScore = $derived(
		attrGroup.score(evalGroup)
	)

	let slices = $derived(
		!isNonEmptyArray(evalEntries) ?
			[]
		
		: nonEmptyMap(
			evalEntries,
			([evalAttrId, evalAttr]): PieSlice => {
				const icon = evalAttr.evaluation.value.icon ?? evalAttr.attribute.icon
				const tooltipSuffix: string = (() => {
					if (
						wallet.table.variantSelected === null ||
						wallet.wallet.variants[wallet.table.variantSelected] === undefined
					) {
						return ''
					}
					switch (
						attributeVariantSpecificity(wallet.wallet, wallet.table.variantSelected, evalAttr.attribute)
					) {
						case VariantSpecificity.ONLY_ASSESSED_FOR_THIS_VARIANT:
							return ''
						case VariantSpecificity.ALL_SAME:
							return ''
						case VariantSpecificity.EXEMPT_FOR_THIS_VARIANT:
							return ''
						case VariantSpecificity.UNIQUE_TO_VARIANT:
							return ` (${variantToName(wallet.table.variantSelected, false)} only)`
						case VariantSpecificity.NOT_UNIVERSAL:
							return ` (${variantToName(wallet.table.variantSelected, false)} specific)`
					}
				})()
				
				return {
					id: evalAttrId.toString(),
					color: ratingToColor(evalAttr.evaluation.value.rating),
					weight: 1,
					arcLabel: icon,
					tooltip: `${icon} ${evalAttr.evaluation.value.displayName}${tooltipSuffix}`,
					tooltipValue: ratingToIcon(evalAttr.evaluation.value.rating)
				}
			}
		)
	)

	let centerLabel = $derived.by(() => {
		if (groupScore === null || !isNonEmptyArray(evalEntries)) {
			return 'N/A'
		}
		
		const { score, hasUnratedComponent } = groupScore
		
		if (hasUnratedComponent) {
			return ratingToIcon(Rating.UNRATED)
		} else if (score <= 0.0) {
			return '\u{1f480}' /* Skull */
		} else if (score >= 1.0) {
			return '\u{1f4af}' /* 100 */
		} else {
			return Math.round(score * 100).toString()
		}
	})

	let svgParams = $derived.by(() => {
		const arc = ARC_TOP_HALF
		const maxRadius = ratingPieHeight
		const innerRadiusFraction = 0.5
		const outerRadiusFraction = 0.95
		const paddingAngle = 6 // degrees
		
		let startAngle = -90
		let endAngle = 90
		let cx = ratingPieWidth / 2
		let cy = ratingPieHeight
		
		if (arc === ARC_FULL) {
			startAngle = -90
			endAngle = 270
			cx = ratingPieWidth / 2
			cy = ratingPieHeight / 2
		}
		
		const innerRadius = maxRadius * innerRadiusFraction
		const outerRadius = maxRadius * outerRadiusFraction
		
		return {
			startAngle,
			endAngle,
			cx,
			cy,
			innerRadius,
			outerRadius,
			paddingAngle
		}
	})

	let highlightedEvalAttr = $derived(
		highlightedSlice !== null ?
			evalGroup[highlightedSlice.evalAttrId]
		:
			null 
	)


	// Functions
	const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
		const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
		return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		}
	}

	const describeArc = (
		sliceIndex: number, 
		totalSlices: number, 
		centerX: number, 
		centerY: number, 
		innerRadius: number, 
		outerRadius: number, 
		startAngle: number, 
		endAngle: number, 
		padAngle: number,
	) => {
		// Calculate angles for this slice
		const totalAngle = endAngle - startAngle
		const sliceAngle = (totalAngle - (padAngle * totalSlices)) / totalSlices
		const sliceStartAngle = startAngle + (sliceIndex * (sliceAngle + padAngle))
		const sliceEndAngle = sliceStartAngle + sliceAngle
		
		// Calculate points
		const start = polarToCartesian(centerX, centerY, outerRadius, sliceEndAngle)
		const end = polarToCartesian(centerX, centerY, outerRadius, sliceStartAngle)
		const innerStart = polarToCartesian(centerX, centerY, innerRadius, sliceEndAngle)
		const innerEnd = polarToCartesian(centerX, centerY, innerRadius, sliceStartAngle)
		
		// Create arc path
		const largeArcFlag = sliceAngle > 180 ? 1 : 0
		
		// Build the path
		const path = [
			`M ${start.x} ${start.y}`,
			`A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
			`L ${innerEnd.x} ${innerEnd.y}`,
			`A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
			`L ${start.x} ${start.y}`
		].join(' ')
		
		// Calculate label position (middle of arc)
		const labelAngle = sliceStartAngle + (sliceAngle / 2)
		const labelRadius = (innerRadius + outerRadius) / 2
		const label = polarToCartesian(centerX, centerY, labelRadius, labelAngle)
		
		return { path, labelX: label.x, labelY: label.y }
	}


	// Actions
	const onSliceClick = (evalAttrId: string) => {
		if (highlightedSlice === null) {
			// First click on any slice, create a new highlight
			highlightedSlice = {
				evalAttrId,
				sticky: true
			}
		} else if (highlightedSlice.evalAttrId !== evalAttrId) {
			// Clicking on a different slice, update the highlight
			highlightedSlice = {
				evalAttrId,
				sticky: true
			}
		} else {
			// Clicking on the same slice, toggle sticky state
			highlightedSlice = {
				evalAttrId,
				sticky: !highlightedSlice.sticky
			}
		}
		// In either case, expand the row
		wallet.setExpanded(true)
	}

	const onSliceMouseEnter = (evalAttrId: string) => {
		if (highlightedSlice === null) {
			// First to be focused
			highlightedSlice = {
				evalAttrId,
				sticky: false
			}
		}
	}

	const onSliceMouseLeave = () => {
		if (highlightedSlice !== null && !highlightedSlice.sticky) {
			highlightedSlice = null
		}
	}
</script>

<div 
	class="wallet-rating-cell" 
	role="button"
	tabindex="0"
	style="display: flex; flex-direction: column; align-items: center; gap: 4px;"
	onmouseleave={onSliceMouseLeave}
>
	<!-- Rating Pie Chart -->
	{#if groupScore === null || !isNonEmptyArray(evalEntries)}
		<div>N/A</div>
	{:else}
		<svg width={ratingPieWidth} height={ratingPieHeight} viewBox={`0 0 ${ratingPieWidth} ${ratingPieHeight}`}>
			<!-- Pie Slices -->
			{#each slices as slice, i}
				{#if slices.length > 0}
					{@const arcData = describeArc(
						i, 
						slices.length, 
						svgParams.cx, 
						svgParams.cy, 
						svgParams.innerRadius, 
						svgParams.outerRadius, 
						svgParams.startAngle, 
						svgParams.endAngle, 
						svgParams.paddingAngle
					)}
					<path 
						role="button"
						tabindex="0"
						d={arcData.path} 
						fill={slice.color}
						stroke="white" 
						stroke-width="1"
						class={highlightedSlice?.evalAttrId === slice.id ? 'highlighted' : ''}
						onmouseenter={() => onSliceMouseEnter(slice.id)}
						onclick={() => onSliceClick(slice.id)}
						onkeydown={e => {
							if(e.key === 'Enter')
								onSliceClick(slice.id)
						}}
					>
						<title>{slice.tooltip}</title>
					</path>
					<text 
						x={arcData.labelX} 
						y={arcData.labelY} 
						text-anchor="middle" 
						dominant-baseline="central" 
						fill="white" 
						font-size="10"
						pointer-events="none"
					>
						{slice.arcLabel}
					</text>
				{/if}
			{/each}
			
			<!-- Center Label -->
			<text 
				x={svgParams.cx} 
				y={svgParams.cy - 10} 
				text-anchor="middle" 
				dominant-baseline="central" 
				font-size="14"
				fill="black"
			>
				{centerLabel}
			</text>
		</svg>
	{/if}
	
	<!-- Expanded Details -->
	{#if wallet.expanded}
		<div 
			style="height: {expandedRowHeight - 40}px; display: flex; flex-direction: column; line-height: 1; gap: 4px; white-space: normal;"
		>
			{#if highlightedEvalAttr === null}
				<!-- Group Information -->
				<h3 style="white-space: nowrap; margin: 0; font-size: 1.2rem;">{attrGroup.icon} {attrGroup.displayName}</h3>
				<p style="margin: 0; font-size: 0.9rem;">
					{#if typeof attrGroup.perWalletQuestion.render === 'function'}
						{attrGroup.perWalletQuestion.render(wallet.wallet.metadata)}
					{:else}
						{attrGroup.perWalletQuestion}
					{/if}
				</p>
			{:else}
				<!-- Attribute Information -->
				<h4 style="white-space: nowrap; margin: 0; font-size: 1.1rem;">
					{highlightedEvalAttr.evaluation.value.icon ?? highlightedEvalAttr.attribute.icon} {highlightedEvalAttr.attribute.displayName}
				</h4>
				<p style="margin: 0; font-size: 0.9rem;">
					{#if typeof highlightedEvalAttr.evaluation.value.shortExplanation.render === 'function'}
						{@const explanation = highlightedEvalAttr.evaluation.value.shortExplanation.render(wallet.wallet.metadata)}
						{@const suffix = (() => {
							if (
								wallet.table.variantSelected === null ||
								wallet.wallet.variants[wallet.table.variantSelected] === undefined
							) {
								return ''
							}
							switch (
								attributeVariantSpecificity(wallet.wallet, wallet.table.variantSelected, highlightedEvalAttr.attribute)
							) {
								case VariantSpecificity.ALL_SAME:
								case VariantSpecificity.ONLY_ASSESSED_FOR_THIS_VARIANT:
								case VariantSpecificity.EXEMPT_FOR_THIS_VARIANT:
									return ''
								case VariantSpecificity.NOT_UNIVERSAL:
									return ` This is the case on the ${variantToName(wallet.table.variantSelected, false)} version.`
								case VariantSpecificity.UNIQUE_TO_VARIANT:
									return ` This is only the case on the ${variantToName(wallet.table.variantSelected, false)} version.`
							}
						})()}
						{ratingToIcon(highlightedEvalAttr.evaluation.value.rating)} {explanation}{suffix}
					{:else}
						{ratingToIcon(highlightedEvalAttr.evaluation.value.rating)} {highlightedEvalAttr.evaluation.value.shortExplanation}
					{/if}
				</p>
				
				<!-- Learn More Link -->
				<div style="display: flex; flex-direction: row; justify-content: center;">
					<a 
						href="{betaSiteRoot}/{wallet.wallet.metadata.id}/{variantUrlQuery(wallet.wallet.variants, wallet.table.variantSelected)}#{slugifyCamelCase(highlightedEvalAttr.attribute.id)}"
						style="display: flex; align-items: center; gap: 4px; text-decoration: none; color: inherit;"
					>
						<svg viewBox="0 0 24 24" width="16" height="16">
							<path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
						</svg>
						Learn more
					</a>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.wallet-rating-cell {
		width: 100%;
		height: 100%;
	}

	.highlighted {
		stroke-width: 2;
		transform: scale(1.05);
		transform-origin: center;
		transition: transform 0.2s ease;
	}

	path {
		cursor: pointer;
		transition: transform 0.2s ease;
	}

	path:hover {
		transform: scale(1.05);
		transform-origin: center;
	}
</style>
