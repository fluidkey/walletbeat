<script module lang="ts">
	// Types/constants
	export type Slice = {
		id: string
		color: string
		weight: number
		arcLabel: string
		tooltip: string
		tooltipValue: string
		children?: Slice[]
	}

	export const Layout = {
		TopHalf: 'TopHalf',
		Full: 'Full',
	}

	export type LevelConfig = {
		outerRadiusFraction: number
		innerRadiusFraction: number
		gap: number
		angleGap: number
	}

	export type ComputedSlice = Slice & {
		computed: {
			path: string
			midAngle: number
			outerRadius: number
			innerRadius: number
			labelRadius: number
			sliceGap: number
			level: number
		}
		children?: ComputedSlice[]
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
		levels = [
			{
				outerRadiusFraction: 0.6,
				innerRadiusFraction: 0.5,
				gap: 8,
				angleGap: 0,
			},
			{
				outerRadiusFraction: 1.1,
				innerRadiusFraction: 1.0,
				gap: 4,
				angleGap: 0,
			},
		],

		// State
		highlightedSliceId = $bindable(null),

		// Events
		onSliceClick,
		onSliceMouseEnter,
		onSliceMouseLeave,
	}: {
		// Content
		slices: Slice[]
		centerLabel?: string

		// View options
		layout?: (typeof Layout)[keyof typeof Layout]
		radius?: number
		padding?: number
		levels?: LevelConfig[]

		// State
		highlightedSliceId?: string | null

		// Events
		onSliceClick?: (id: string) => void
		onSliceMouseEnter?: (id: string) => void
		onSliceMouseLeave?: (id: string) => void
	} = $props()

	// Functions
	const getLevelConfig = (level: number): LevelConfig => levels[Math.min(level, levels.length - 1)]

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

	/**
	 * Recursively computes slice data with all necessary information for rendering
	 */
	const computeSliceData = (
		sliceArray: Slice[],
		startAngle: number,
		endAngle: number,
		level = 0,
		cy = 0,
	): ComputedSlice[] => {
		if (!sliceArray?.length) return []

		const config = getLevelConfig(level)
		const gapAngle = config.angleGap

		// Calculate slices at this level
		const totalWeight = sliceArray.reduce((acc, slice) => acc + slice.weight, 0)
		const totalAngle = endAngle - startAngle
		const totalGapAngle = Math.min(gapAngle * (sliceArray.length - 1), totalAngle * 0.3)
		const effectiveAngle = totalAngle - totalGapAngle

		const sliceOuterRadius = radius * config.outerRadiusFraction
		const sliceInnerRadius = radius * config.innerRadiusFraction
		const sliceGap = config.gap
		const labelRadius = (sliceOuterRadius + sliceInnerRadius) / 2 + sliceGap

		// Calculate angle ranges for each slice at this level
		let currentAngle = startAngle
		const angleRanges = sliceArray.map((slice, i) => {
			const sliceAngle = effectiveAngle * (slice.weight / totalWeight)
			const sliceStartAngle = currentAngle
			const sliceEndAngle = currentAngle + sliceAngle
			const midAngle = sliceStartAngle + sliceAngle / 2

			const result = {
				startAngle: sliceStartAngle,
				endAngle: sliceEndAngle,
				midAngle
			}

			currentAngle = sliceEndAngle + (i < sliceArray.length - 1 ? gapAngle : 0)
			return result
		})

		// Create ComputedSlice objects with recursive processing of children
		return sliceArray.map((slice, i) => {
			const { startAngle: sliceStartAngle, endAngle: sliceEndAngle, midAngle } = angleRanges[i]
			const sliceAngle = sliceEndAngle - sliceStartAngle

			const path = getSlicePath({
				cx: 0,
				cy,
				outerRadius: sliceOuterRadius,
				innerRadius: sliceInnerRadius,
				startAngle: -sliceAngle / 2,
				endAngle: sliceAngle / 2,
			})

			// Destructure slice to separate children from other properties
			const { children, ...sliceProps } = slice

			// Create the ComputedSlice for this item
			const result: ComputedSlice = {
				...sliceProps,
				children: undefined,
				computed: {
					path,
					midAngle,
					outerRadius: sliceOuterRadius,
					innerRadius: sliceInnerRadius,
					level,
					labelRadius,
					sliceGap,
				}
			}

			// Recursively process children if they exist
			if (children?.length) {
				result.children = computeSliceData(
					children,
					sliceStartAngle,
					sliceEndAngle,
					level + 1,
					cy,
				)
			}

			return result
		})
	}

	// State
	let sliceParams = $derived.by(() => {
		const startAngle = layout === Layout.Full ? -90 + getLevelConfig(0).angleGap / 2 : -90

		const endAngle = layout === Layout.Full ? 270 - getLevelConfig(0).angleGap / 2 : 90

		const rootConfig = getLevelConfig(0)
		const outerRadius = radius * rootConfig.outerRadiusFraction
		const innerRadius = radius * rootConfig.innerRadiusFraction
		const cy = layout === Layout.Full ? 0 : radius * (1 - rootConfig.outerRadiusFraction)

		return {
			outerRadius,
			innerRadius,
			startAngle,
			endAngle,
			getCy: () => cy,
		}
	})

	let allSliceData = $derived.by(() =>
		computeSliceData(
			slices,
			sliceParams.startAngle,
			sliceParams.endAngle,
			0,
			sliceParams.getCy(),
		),
	)

	let parentSlices = $derived(allSliceData)

	let maxRadiusMultiplier = $derived(Math.max(...levels.map(level => level.outerRadiusFraction)))

	let maxGap = $derived(Math.max(...levels.map(level => level.gap)))

	let svgAttributes = $derived.by(() => {
		const maxRadius = radius * maxRadiusMultiplier + maxGap
		const width = padding * 2 + maxRadius * 2
		const height = padding * 2 + maxRadius * (layout === Layout.TopHalf ? 1 : 2)
		const viewBoxX = -(padding + maxRadius)
		const viewBoxY = -(padding + maxRadius)

		return {
			width,
			height,
			viewBox: `${viewBoxX} ${viewBoxY} ${width} ${height}`,
		}
	})
</script>

{#snippet renderSlice(sliceData: ComputedSlice)}
	{@const lineY2 = -sliceData.computed.innerRadius - sliceData.computed.sliceGap}

	<g
		class="slice"
		style:--slice-color={sliceData.color}
		style:--mid-angle={sliceData.computed.midAngle}
		style:--slice-gap={sliceData.computed.sliceGap}
		style:--slice-inner-radius={sliceData.computed.innerRadius}
		style:--slice-outer-radius={sliceData.computed.outerRadius}
		style:--slice-label-y={sliceData.computed.labelRadius * -1}
		style:--slice-level={sliceData.computed.level}
		class:highlighted={highlightedSliceId === sliceData.id}
		data-slice-id={sliceData.id}
		data-level={sliceData.computed.level}
		role="button"
		tabindex="0"
		onmouseenter={() => onSliceMouseEnter?.(sliceData.id)}
		onmouseleave={() => onSliceMouseLeave?.(sliceData.id)}
		onclick={() => onSliceClick?.(sliceData.id)}
		onkeydown={e => e.key === 'Enter' && onSliceClick?.(sliceData.id)}
	>
		<path d={sliceData.computed.path} class="slice-path">
			<title>{sliceData.tooltip}: {sliceData.tooltipValue}</title>
		</path>

		<line class="label-line" x1="0" y1="0" x2="0" y2={lineY2} />
		<text class="slice-label" aria-hidden="true">
			{sliceData.arcLabel}
		</text>

		{#if sliceData.children?.length}
			<g class="child-slices-container">
				{#each sliceData.children as childSlice}
					{@render renderSlice(childSlice)}
				{/each}
			</g>
		{/if}
	</g>
{/snippet}

<div class="container" data-arc-type={layout} style:--radius={radius}>
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
		--highlight-color: rgba(255, 255, 255, 1);
		--highlight-stroke-width: 2;
		--hover-brightness: 1.1;
		--hover-scale: 1.05;

		&[data-arc-type='TopHalf'] {
			--center-label-baseline: text-after-edge;
		}

		&[data-arc-type='Full'] {
			--center-label-baseline: central;
		}

		transform: translateZ(0);
		will-change: transform;
		backface-visibility: hidden;

		.slices {
			will-change: transform;

			.slice {
				--slice-scale: 1;
				transform-origin: 0 0;
				cursor: pointer;
				will-change: transform;

				transform: rotate(calc(var(--mid-angle) * 1deg)) scale(var(--slice-scale))
					translate(0, calc(var(--slice-gap) * -1px));
				transition: transform 0.2s ease-out;

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
					font-size: 10px;
					pointer-events: none;
					translate: 0 calc(var(--slice-label-y) * 1px);
					rotate: calc(var(--mid-angle) * -1deg);
				}

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
