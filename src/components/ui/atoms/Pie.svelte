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

	// Level configuration type
	export type LevelConfig = {
		outerRadiusFraction: number
		innerRadiusFraction: number
		gap: number
		angleGap: number
		labelFontSize: number
		opacity: number
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
		level: number
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
		
		// Level configurations (replaces individual level-specific props)
		levels = [
			// Level 0 (root slices)
			{
				outerRadiusFraction: 0.6,
				innerRadiusFraction: 0.5,
				gap: 8,
				angleGap: 0,
				labelFontSize: 10,
				opacity: 1
			},
			// Level 1 (first nested level)
			{
				outerRadiusFraction: 1.1,
				innerRadiusFraction: 1.0,
				gap: 4,
				angleGap: 0,
				labelFontSize: 8,
				opacity: 0.9
			}
			// Additional levels can be added as needed
		],
		
		// For custom layouts
		customStartAngle,
		customEndAngle,
		
		// Enable hierarchical rendering
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
		
		// Level configurations
		levels?: LevelConfig[]
		
		// For custom layouts
		customStartAngle?: number
		customEndAngle?: number
		
		// Enable hierarchical rendering
		hierarchical?: boolean

		// State
		highlightedSliceId?: string | null

		// Events
		onSliceClick?: (id: string) => void
		onSliceMouseEnter?: (id: string) => void
		onSliceMouseLeave?: (id: string) => void
	} = $props()

	// Get config for a specific level (with fallback to last defined level)
	const getLevelConfig = (level: number): LevelConfig => 
		levels[Math.min(level, levels.length - 1)]

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

	// Calculate slice angles and paths for any array of slices
	function calculateSliceData(
		sliceArray: PieSlice[],
		startAngle: number,
		endAngle: number,
		level = 0,
		cy = 0
	): SliceData[] {
		if (!sliceArray || sliceArray.length === 0) return []
		
		// Get level-specific configuration
		const config = getLevelConfig(level)
		const gapAngle = config.angleGap
		
		const totalWeight = sliceArray.reduce((acc, slice) => acc + slice.weight, 0)
		const totalAngle = endAngle - startAngle
		const totalGapAngle = Math.min(gapAngle * (sliceArray.length - 1), totalAngle * 0.3)
		const effectiveAngle = totalAngle - totalGapAngle
		
		// Calculate radii based on level configuration
		const sliceOuterRadius = radius * config.outerRadiusFraction
		const sliceInnerRadius = radius * config.innerRadiusFraction
		const sliceGap = config.gap
		const labelRadius = (sliceOuterRadius + sliceInnerRadius) / 2 + sliceGap
		
		let currentAngle = startAngle
		const results: SliceData[] = []
		
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
				labelFontSize: config.labelFontSize,
				opacity: config.opacity
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
					? -90 + getLevelConfig(0).angleGap / 2
					: -90

		const endAngle =
			layout === Layout.Custom 
				? customEndAngle || 90 
				: layout === Layout.Full 
					? 270 - getLevelConfig(0).angleGap / 2 
					: 90

		const rootConfig = getLevelConfig(0)
		const outerRadius = radius * rootConfig.outerRadiusFraction
		const innerRadius = radius * rootConfig.innerRadiusFraction
		const cy = layout === Layout.Full || layout === Layout.Custom ? 0 : radius * (1 - rootConfig.outerRadiusFraction)

		return {
			outerRadius,
			innerRadius,
			startAngle,
			endAngle,
			getCy: () => cy
		}
	})

	// Recursive function to calculate slice data for a tree of slices
	function calculateSliceTree(
		sliceArray: PieSlice[],
		startAngle: number,
		endAngle: number,
		level = 0,
		cy = 0
	): SliceData[] {
		// Base case: empty array
		if (!sliceArray?.length) return []
		
		// Calculate slice data for this level
		const sliceData = calculateSliceData(sliceArray, startAngle, endAngle, level, cy)
		
		// If hierarchical mode is enabled, recursively process children
		if (hierarchical) {
			// Calculate angle ranges for current level slices
			const sliceAngles = calculateAngleRanges(
				sliceData.length, 
				startAngle, 
				endAngle, 
				getLevelConfig(level).angleGap
			)
			
			// Process each slice to add its children if any
			sliceData.forEach((parentData, index) => {
				if (!parentData.slice.children?.length) return
				
				// Use the same angle range as the parent slice
				const parentAngleInfo = sliceAngles[index]
				
				// Recursively calculate child slices data
				parentData.childSlices = calculateSliceTree(
					parentData.slice.children,
					parentAngleInfo.startAngle,
					parentAngleInfo.endAngle,
					level + 1,
					cy
				)
			})
		}
		
		return sliceData
	}

	// Calculate all slice data (parent and nested at any level)
	let allSliceData = $derived.by(() => 
		calculateSliceTree(
			slices, 
			sliceParams.startAngle, 
			sliceParams.endAngle, 
			0, 
			sliceParams.getCy()
		)
	)

	// No need for separate nested slices array now
	let parentSlices = $derived(allSliceData)

	// Calculate max radius across all levels
	let maxRadiusMultiplier = $derived(
		hierarchical 
			? Math.max(...levels.map(level => level.outerRadiusFraction))
			: getLevelConfig(0).outerRadiusFraction
	)

	// Calculate max gap across all levels
	let maxGap = $derived(
		hierarchical 
			? Math.max(...levels.map(level => level.gap))
			: getLevelConfig(0).gap
	)

	// Helper function to calculate angle ranges for slices (used for parent-child alignment)
	function calculateAngleRanges(numSlices: number, startAngle: number, endAngle: number, gapAngle: number) {
		if (numSlices <= 0) return []
		
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
		
		{#if sliceData.childSlices?.length}
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
>
	<svg width={svgAttributes.width} height={svgAttributes.height} viewBox={svgAttributes.viewBox}>
		<g class="slices">
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
