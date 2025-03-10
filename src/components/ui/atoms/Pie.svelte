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
			gap: number
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

		return (
			[
				`M ${start.x} ${start.y}`,
				`A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
				`L ${innerEnd.x} ${innerEnd.y}`,
				`A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
				`L ${start.x} ${start.y}`,
			]
				.join(' ')
		)
	}

	const computeSlices = (
		{
			slices,
			startAngle,
			endAngle,
		}: {
			slices: Slice[]
			startAngle: number
			endAngle: number
		},
		cy = 0,
		level = 0,
	): ComputedSlice[] => {
		const config = getLevelConfig(level)
		const angleGap = config.angleGap

		const totalWeight = slices.reduce((acc, slice) => acc + slice.weight, 0)
		const totalAngle = endAngle - startAngle
		const totalGapAngle = Math.min(angleGap * (slices.length - 1), totalAngle * 0.3)
		const effectiveAngle = totalAngle - totalGapAngle

		const sliceOuterRadius = radius * config.outerRadiusFraction
		const sliceInnerRadius = radius * config.innerRadiusFraction
		const gap = config.gap
		const labelRadius = (sliceOuterRadius + sliceInnerRadius) / 2

		let currentAngle = startAngle

		return slices.map(({ children, ...slice }, i) => {
			const angle = effectiveAngle * (slice.weight / totalWeight)
			const startAngle = currentAngle
			const endAngle = currentAngle + angle
			const midAngle = startAngle + angle / 2

			currentAngle = endAngle + (i < slices.length - 1 ? angleGap : 0)

			return {
				...slice,
				computed: {
					path: getSlicePath({
						cx: 0,
						cy,
						outerRadius: sliceOuterRadius,
						innerRadius: sliceInnerRadius,
						startAngle: -angle / 2,
						endAngle: angle / 2,
					}),
					midAngle,
					outerRadius: sliceOuterRadius,
					innerRadius: sliceInnerRadius,
					level,
					labelRadius,
					gap,
				},
				...children && {
					children: (
						computeSlices(
							{
								slices: children,
								startAngle,
								endAngle,
							},
							cy,
							level + 1,
						)
					),
				},
			} as ComputedSlice
		})
	}

	// State
	let computedSlices = $derived(
		computeSlices(
			{
				slices,
				startAngle: layout === Layout.Full ? -90 + getLevelConfig(0).angleGap / 2 : -90,
				endAngle: layout === Layout.Full ? 270 - getLevelConfig(0).angleGap / 2 : 90,
			},
		),
	)

	let svgAttributes = $derived.by(() => {
		const maxRadiusMultiplier = Math.max(...levels.map(level => level.outerRadiusFraction))
		const maxGap = Math.max(...levels.map(level => level.gap))
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


{#snippet sliceSnippet(
	slice: ComputedSlice,
)}
	<g
		class="slice"
		style:--slice-midAngle={slice.computed.midAngle}
		style:--slice-gap={slice.computed.gap}
		style:--slice-labelRadius={slice.computed.labelRadius}
		style:--slice-path={`path("${slice.computed.path}")`}
		style:--slice-fill={slice.color}
		class:highlighted={highlightedSliceId === slice.id}
		data-slice-id={slice.id}
		role="button"
		tabindex="0"
		onmouseenter={() => { onSliceMouseEnter?.(slice.id) }}
		onmouseleave={() => { onSliceMouseLeave?.(slice.id) }}
		onclick={() => { onSliceClick?.(slice.id) }}
		onkeydown={e => {
			if (e.key === 'Enter') {
				onSliceClick?.(slice.id)
			}
		}}
	>
		<line class="label-line" x1="0" y1={slice.computed.gap} x2="0" y2={-slice.computed.innerRadius} />

		<path class="slice-path">
			<title>{slice.tooltip}: {slice.tooltipValue}</title>
		</path>

		<text class="label" aria-hidden="true">
			{slice.arcLabel}
		</text>

		{#if slice.children?.length}
			<g class="child-slices">
				{#each slice.children as childSlice}
					{@render sliceSnippet(childSlice)}
				{/each}
			</g>
		{/if}
	</g>
{/snippet}

<div
	class="container"
	data-arc-type={layout}
>
	<svg {...svgAttributes}>
		<g class="slices">
			{#each computedSlices as slice}
				{@render sliceSnippet(slice)}
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

		&[data-arc-type="TopHalf"] {
			--center-label-baseline: text-after-edge;
		}
		&[data-arc-type="Full"] {
			--center-label-baseline: central;
		}

		transform: translateZ(0);
		will-change: transform;
		backface-visibility: hidden;

		svg {
			display: grid;

			.slice {
				--slice-scale: 1;
				transform-origin: 0 0;
				cursor: pointer;
				will-change: transform;

				transform: rotate(calc(var(--slice-midAngle) * 1deg)) scale(var(--slice-scale))
					translate(0, calc(var(--slice-gap) * -1px));
				transition: transform 0.2s ease-out;

				.slice-path {
					d: var(--slice-path);
					fill: var(--slice-fill);
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
					opacity: 0;
					stroke: currentColor;
					stroke-width: 1;
					stroke-dasharray: 1 2;
					pointer-events: none;
				}

				.label {
					text-anchor: middle;
					dominant-baseline: central;
					fill: currentColor;
					font-size: 10px;
					pointer-events: none;
					translate: 0 calc(var(--slice-labelRadius) * -1px);
					rotate: calc(var(--slice-midAngle) * -1deg);
				}

				.child-slices {
					transform: rotate(calc(var(--slice-midAngle) * -1deg));
					transform-origin: 0 0;
					will-change: transform;
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
	}
</style>
