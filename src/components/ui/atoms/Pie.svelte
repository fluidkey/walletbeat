<script module lang="ts">
	// Types/constants
	export type PieSlice = {
		id: string
		color: string
		weight: number
		arcLabel: string
		tooltip: string
		tooltipValue: string
		// For hierarchical slicing
		parentId?: string
		children?: PieSlice[]
	}

	export const Layout = {
		TopHalf: 'TopHalf',
		Full: 'Full',
		// New layout for custom angles
		Custom: 'Custom',
	}

	// Common utility type for slice data
	export type SliceData = {
		slice: PieSlice
		path: string
		midAngle: number
		outerRadius: number
		innerRadius: number
		labelRadius: number
		sliceGap: number
		labelFontSize: number
		opacity: number
		level: number // Use level instead of isNested (0 = parent, 1+ = nested)
		childSlices?: SliceData[]
	}
</script>

<script lang="ts">
	// Props
	let {
		// Content
		slices = [],
		centerLabel,

		// View options
		layout = Layout.TopHalf,
		padding = 0,
		radius = 47,
		gap = 8,
		angleGap = 0,
		outerRadiusFraction = 0.6,
		innerRadiusFraction = 0.5,
		// For custom layouts
		customStartAngle,
		customEndAngle,
		// Nested slice options
		nestedAngleGap = 0,
		nestedOuterRadiusFraction = 1.1, // Outer radius for nested slices (as fraction of radius)
		nestedInnerRadiusFraction = 1.0, // Inner radius for nested slices (as fraction of radius)
		nestedGap = 4, // Pixel gap for nested slices
		// Enable nested rendering
		hierarchical = false,

		// State
		highlightedSliceId = $bindable(null),

		// Events
		onSliceClick,
		onSliceMouseEnter,
		onSliceMouseLeave,
	}: {
		// Content
		slices: PieSlice[]
		centerLabel?: string

		// View options
		layout?: (typeof Layout)[keyof typeof Layout]
		radius?: number
		padding?: number
		gap?: number
		angleGap?: number
		outerRadiusFraction?: number
		innerRadiusFraction?: number
		// For custom layouts
		customStartAngle?: number
		customEndAngle?: number
		// Nested slice options
		nestedAngleGap?: number
		nestedOuterRadiusFraction?: number
		nestedInnerRadiusFraction?: number
		nestedGap?: number
		// Enable nested rendering
		hierarchical?: boolean

		// State
		highlightedSliceId?: string | null

		// Events
		onSliceClick?: (id: string) => void
		onSliceMouseEnter?: (id: string) => void
		onSliceMouseLeave?: (id: string) => void
	} = $props()

	// Functions
	const polarToCartesian = (
		centerX: number,
		centerY: number,
		radius: number,
		angleInDegrees: number,
	) => {
		const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
		return {
			x: centerX + radius * Math.cos(angleInRadians),
			y: centerY + radius * Math.sin(angleInRadians),
		}
	}

	const getSlicePath = ({
		cx = 0,
		cy = 0,
		outerRadius,
		innerRadius,
		startAngle,
		endAngle,
	}: {
		cx: number
		cy: number
		outerRadius: number
		innerRadius: number
		startAngle: number
		endAngle: number
	}) => {
		const start = polarToCartesian(cx, cy, outerRadius, endAngle)
		const end = polarToCartesian(cx, cy, outerRadius, startAngle)
		const innerStart = polarToCartesian(cx, cy, innerRadius, endAngle)
		const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle)
		const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0

		return [
			`M ${start.x} ${start.y}`,
			`A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
			`L ${innerEnd.x} ${innerEnd.y}`,
			`A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
			`L ${start.x} ${start.y}`,
		].join(' ')
	}

	// Calculate slice angles and paths for any array of slices (parent or nested)
	function calculateSliceData(
		sliceArray: PieSlice[],
		startAngle: number,
		endAngle: number,
		gapAngle: number,
		sliceOuterRadius: number,
		sliceInnerRadius: number,
		level = 0, // Use level instead of isNested
		cy = 0
	): SliceData[] {
		if (!sliceArray || sliceArray.length === 0) return []

		const totalWeight = sliceArray.reduce((acc, slice) => acc + slice.weight, 0)
		const totalAngle = endAngle - startAngle
		const totalGapAngle = Math.min(gapAngle * (sliceArray.length - 1), totalAngle * 0.3)
		const effectiveAngle = totalAngle - totalGapAngle
		
		let currentAngle = startAngle
		const results: SliceData[] = []
		
		// Determine slice-specific properties based on level
		const isChild = level > 0
		const sliceGap = isChild ? nestedGap : gap
		const labelFontSize = isChild ? 8 : 10
		const labelRadius = isChild 
			? radius * (nestedInnerRadiusFraction + nestedOuterRadiusFraction) / 2 + nestedGap
			: radius * (innerRadiusFraction + outerRadiusFraction) / 2 + gap
		const opacity = isChild ? 0.9 : 1
		
		// Calculate angle for each slice
		sliceArray.forEach((slice, i) => {
			const sliceAngle = effectiveAngle * (slice.weight / totalWeight)
			const sliceStartAngle = currentAngle
			const sliceEndAngle = currentAngle + sliceAngle
			const midAngle = sliceStartAngle + sliceAngle / 2
			
			// Create a standardized "upright" path that will be rotated via CSS
			const path = getSlicePath({
				cx: 0,
				cy,
				outerRadius: sliceOuterRadius, 
				innerRadius: sliceInnerRadius,
				startAngle: -sliceAngle / 2,
				endAngle: sliceAngle / 2
			})
			
			results.push({
				slice,
				path,
				midAngle,
				outerRadius: sliceOuterRadius,
				innerRadius: sliceInnerRadius,
				level,
				labelRadius,
				sliceGap,
				labelFontSize,
				opacity
			})
			
			currentAngle = sliceEndAngle + (i < sliceArray.length - 1 ? gapAngle : 0)
		})
		
		return results
	}

	// State
	let sliceParams = $derived.by(() => {
		// Determine start and end angles based on layout
		const startAngle =
			layout === Layout.Custom
				? customStartAngle || -90
				: layout === Layout.Full
					? -90 + angleGap / 2
					: -90

		const endAngle =
			layout === Layout.Custom ? customEndAngle || 90 : layout === Layout.Full ? 270 - angleGap / 2 : 90

		const outerRadius = radius * outerRadiusFraction
		const innerRadius = radius * innerRadiusFraction
		const cy = layout === Layout.Full || layout === Layout.Custom ? 0 : radius * (1 - outerRadiusFraction)

		return {
			outerRadius,
			innerRadius,
			startAngle,
			endAngle,
			getCy: () => cy
		}
	})

	// Calculate all slice data (parent and nested)
	let allSliceData = $derived.by(() => {
		// Calculate parent slices
		const parentSlices = calculateSliceData(
			slices,
			sliceParams.startAngle,
			sliceParams.endAngle,
			angleGap,
			sliceParams.outerRadius,
			sliceParams.innerRadius,
			0, // Level 0 = parent
			sliceParams.getCy()
		)
		
		// If not in hierarchical mode, return only parent slices
		if (!hierarchical) return parentSlices
		
		// Calculate nested slices recursively for each parent
		parentSlices.forEach(parentData => {
			if (!parentData.slice.children || parentData.slice.children.length === 0) return
			
			// Use the EXACT same angle range as the parent slice
			const parentSliceIndex = parentSlices.findIndex(s => s.slice.id === parentData.slice.id)
			const sliceAngles = calculateAngleRanges(parentSlices.length, sliceParams.startAngle, sliceParams.endAngle, angleGap)
			const parentAngleInfo = sliceAngles[parentSliceIndex]
			
			// Calculate nested slices data for this parent
			parentData.childSlices = calculateSliceData(
				parentData.slice.children,
				parentAngleInfo.startAngle,
				parentAngleInfo.endAngle,
				nestedAngleGap,
				radius * nestedOuterRadiusFraction,
				radius * nestedInnerRadiusFraction,
				1, // Level 1 = child
				sliceParams.getCy()
			)
		})
		
		return parentSlices
	})

	// No need for separate nested slices array now
	let parentSlices = $derived(allSliceData)

	// Calculate max radius across all slices
	let maxRadiusMultiplier = $derived(
		hierarchical 
			? Math.max(outerRadiusFraction, nestedOuterRadiusFraction)
			: outerRadiusFraction
	)

	// Calculate max gap across all slices
	let maxGap = $derived(
		hierarchical
			? Math.max(gap, nestedGap)
			: gap
	)

	// Helper function to calculate angle ranges for slices (used for parent-child alignment)
	function calculateAngleRanges(numSlices: number, startAngle: number, endAngle: number, gapAngle: number) {
		const totalAngle = endAngle - startAngle
		const totalGapAngle = Math.min(gapAngle * (numSlices - 1), totalAngle * 0.3)
		const sliceAngle = (totalAngle - totalGapAngle) / numSlices
		const actualGap = numSlices > 1 ? totalGapAngle / (numSlices - 1) : 0
		
		const results = []
		let currentAngle = startAngle
		
		for (let i = 0; i < numSlices; i++) {
			const sliceStartAngle = currentAngle
			const sliceEndAngle = currentAngle + sliceAngle
			const midAngle = sliceStartAngle + sliceAngle / 2
			
			results.push({
				startAngle: sliceStartAngle,
				endAngle: sliceEndAngle,
				midAngle
			})
			
			currentAngle = sliceEndAngle + (i < numSlices - 1 ? actualGap : 0)
		}
		
		return results
	}

	// Group SVG attribute calculations in a single derived statement
	let svgAttributes = $derived.by(() => {
		const maxRadius = radius * maxRadiusMultiplier + maxGap
		const width = padding * 2 + maxRadius * 2
		const height = padding * 2 + maxRadius * (layout === Layout.TopHalf ? 1 : 2)
		const viewBoxX = -(padding + maxRadius)
		const viewBoxY = -(padding + maxRadius)
		
		return {
			width,
			height,
			viewBox: `${viewBoxX} ${viewBoxY} ${width} ${height}`
		}
	})
</script>

{#snippet renderSlice(sliceData: SliceData)}
	{@const lineY2 = -sliceData.innerRadius - sliceData.sliceGap}
	
	<g
		class="slice"
		style:--slice-color={sliceData.slice.color}
		style:--mid-angle={sliceData.midAngle}
		style:--slice-gap={sliceData.sliceGap}
		style:--slice-inner-radius={sliceData.innerRadius}
		style:--slice-outer-radius={sliceData.outerRadius}
		style:--slice-label-y={sliceData.labelRadius * -1}
		style:--label-font-size={sliceData.labelFontSize}
		style:--slice-opacity={sliceData.opacity}
		style:--slice-level={sliceData.level}
		class:highlighted={highlightedSliceId === sliceData.slice.id}
		data-slice-id={sliceData.slice.id}
		data-parent-id={sliceData.slice.parentId}
		data-level={sliceData.level}
		role="button"
		tabindex="0"
		onmouseenter={() => onSliceMouseEnter?.(sliceData.slice.id)}
		onmouseleave={() => onSliceMouseLeave?.(sliceData.slice.id)}
		onclick={() => onSliceClick?.(sliceData.slice.id)}
		onkeydown={e => e.key === 'Enter' && onSliceClick?.(sliceData.slice.id)}
	>
		<path d={sliceData.path} class="slice-path">
			<title>{sliceData.slice.tooltip}: {sliceData.slice.tooltipValue}</title>
		</path>

		<line 
			class="label-line" 
			x1="0" 
			y1="0"
			x2="0" 
			y2={lineY2}
		/>
		<text 
			class="slice-label" 
			aria-hidden="true"
		>
			{sliceData.slice.arcLabel}
		</text>
		
		{#if sliceData.level === 0 && sliceData.childSlices?.length}
			<!-- Child slices container sits at same origin but doesn't rotate -->
			<g class="child-slices-container">
				{#each sliceData.childSlices as childSlice}
					{@render renderSlice(childSlice)}
				{/each}
			</g>
		{/if}
	</g>
{/snippet}

<div
	class="container"
	data-arc-type={layout}
	style:--radius={radius}
	style:--outer-radius={outerRadiusFraction}
	style:--inner-radius={innerRadiusFraction}
	style:--nested-outer-radius={nestedOuterRadiusFraction}
	style:--nested-inner-radius={nestedInnerRadiusFraction}
	style:--gap={gap}
	style:--nested-gap={nestedGap}
>
	<svg width={svgAttributes.width} height={svgAttributes.height} viewBox={svgAttributes.viewBox}>
		<g class="slices">
			<!-- Parent slices with their child slices nested inside them -->
			{#each parentSlices as sliceData}
				{@render renderSlice(sliceData)}
			{/each}
		</g>

		{#if centerLabel}
			<text class="center-label">
				{centerLabel}
			</text>
		{/if}
	</svg>
</div>

<style>
	.container {
		/* Constants */
		--highlight-color: rgba(255, 255, 255, 1);
		--highlight-stroke-width: 2;
		--hover-brightness: 1.1;
		--hover-scale: 1.05;
		
		&[data-arc-type='TopHalf'] {
			--center-label-baseline: text-after-edge;
		}

		&[data-arc-type='Full'],
		&[data-arc-type='Custom'] {
			--center-label-baseline: central;
		}

		transform: translateZ(0);
		will-change: transform;
		backface-visibility: hidden;

		.slices {
			will-change: transform;

			.slice {
				--slice-scale: 1;
				
				/* Main slice transform properties */
				transform-origin: 0 0;
				cursor: pointer;
				will-change: transform;
				opacity: var(--slice-opacity);
				
				/* Unified transform that works for both parent and nested slices */
				transform: 
					rotate(calc(var(--mid-angle) * 1deg)) 
					scale(var(--slice-scale)) 
					translate(0, calc(var(--slice-gap) * -1px));
				transition: transform 0.2s ease-out;
				
				/* Path just needs fill */
				.slice-path {
					fill: var(--slice-color);
				}

				&:hover,
				&:focus {
					filter: brightness(var(--hover-brightness));
					--slice-scale: var(--hover-scale);
				}

				&:focus {
					stroke: var(--highlight-color);
					stroke-width: calc(var(--highlight-stroke-width) * 1px);
					z-index: 2;
					outline: none;
				}

				&.highlighted {
					stroke: var(--highlight-color);
					stroke-width: calc(var(--highlight-stroke-width) * 1px);
					z-index: 2;
				}

				.label-line {
					stroke: currentColor;
					opacity: 0.3;
					pointer-events: none;
					stroke-width: 1;
				}

				.slice-label {
					text-anchor: middle;
					dominant-baseline: central;
					fill: currentColor;
					font-size: var(--label-font-size);
					pointer-events: none;
					
					/* Label positioning - calculated once in CSS */
					translate: 0 calc(var(--slice-label-y) * 1px);
					rotate: calc(var(--mid-angle) * -1deg);
				}
				
				/* Child slices container - counter-rotate to neutralize parent rotation */
				.child-slices-container {
					transform: rotate(calc(var(--mid-angle) * -1deg));
					transform-origin: 0 0;
					will-change: transform;
				}
			}
		}

		.center-label {
			text-anchor: middle;
			dominant-baseline: var(--center-label-baseline);
			font-size: 14px;
			fill: currentColor;
			pointer-events: none;
		}
	}
</style>
