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
		outerRadiusFraction = 0.95,
		innerRadiusFraction = 0.5,
		// For custom layouts
		customStartAngle,
		customEndAngle,
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

	// Calculate slice angles
	const calculateSliceAngles = (
		slices: PieSlice[],
		startAngle: number,
		endAngle: number,
		gapAngle: number,
	) => {
		const totalWeight = slices.reduce((acc, slice) => acc + slice.weight, 0)
		const totalAngle = endAngle - startAngle
		const totalGapAngle = Math.min(gapAngle * (slices.length - 1), totalAngle * 0.3)
		const effectiveAngle = totalAngle - totalGapAngle

		let currentAngle = startAngle
		const sliceAngles: { id: string; startAngle: number; endAngle: number; midAngle: number }[] = []

		slices.forEach((slice, i) => {
			const sliceAngle = effectiveAngle * (slice.weight / totalWeight)
			const sliceStartAngle = currentAngle
			const sliceEndAngle = currentAngle + sliceAngle
			const midAngle = sliceStartAngle + sliceAngle / 2

			sliceAngles.push({
				id: slice.id,
				startAngle: sliceStartAngle,
				endAngle: sliceEndAngle,
				midAngle,
			})

			currentAngle = sliceEndAngle + (i < slices.length - 1 ? gapAngle : 0)
		})

		return sliceAngles
	}

	// State
	let sliceParams = $derived.by(() => {
		// Determine start and end angles based on layout
		const startAngle =
			layout === Layout.Custom
				? customStartAngle
				: layout === Layout.Full
					? -90 + angleGap / 2
					: -90

		const endAngle =
			layout === Layout.Custom ? customEndAngle : layout === Layout.Full ? 270 - angleGap / 2 : 90

		const outerRadius = radius * outerRadiusFraction
		const innerRadius = radius * innerRadiusFraction

		// Calculate slice angles
		const sliceAngles = calculateSliceAngles(slices, startAngle, endAngle, angleGap)

		// Basic path for a slice at origin (to be rotated)
		const basePath = getSlicePath({
			cx: 0,
			cy:
				layout === Layout.Full || layout === Layout.Custom ? 0 : radius * (1 - outerRadiusFraction),
			outerRadius,
			innerRadius,
			startAngle: -angleGap / 2,
			endAngle: angleGap / 2,
		})

		return {
			outerRadius,
			innerRadius,
			sliceAngles,
			basePath,
			getCx: () => 0,
			getCy: () =>
				layout === Layout.Full || layout === Layout.Custom ? 0 : radius * (1 - outerRadiusFraction),
		}
	})

	// Calculate paths for each slice directly
	let slicePaths = $derived(
		sliceParams.sliceAngles.map(angleInfo => {
			const sliceWidth = angleInfo.endAngle - angleInfo.startAngle
			return getSlicePath({
				cx: sliceParams.getCx(),
				cy: sliceParams.getCy(),
				outerRadius: sliceParams.outerRadius,
				innerRadius: sliceParams.innerRadius,
				startAngle: angleInfo.startAngle,
				endAngle: angleInfo.endAngle,
			})
		}),
	)

	let width = $derived(padding * 2 + (radius + gap) * 2)
	let height = $derived(padding * 2 + (radius + gap) * (layout === Layout.TopHalf ? 1 : 2))

	let viewBoxParams = $derived(
		[-(padding + radius + gap), -(padding + radius + gap), width, height].join(' '),
	)

	// Render nested slices
	function renderNestedSlices(
		parentSlice: PieSlice,
		parentAngleInfo: { startAngle: number; endAngle: number },
		level: number,
	) {
		if (!parentSlice.children || parentSlice.children.length === 0) return null

		// Calculate radius for this level
		const levelOuterRadius = radius * (outerRadiusFraction - level * 0.1)
		const levelInnerRadius = radius * (innerRadiusFraction + level * 0.1)

		// Calculate nested slice angles
		const nestedSliceAngles = calculateSliceAngles(
			parentSlice.children,
			parentAngleInfo.startAngle,
			parentAngleInfo.endAngle,
			angleGap / 2,
		)

		return nestedSliceAngles.map((nestedAngleInfo, i) => {
			const child = parentSlice.children[i]
			const path = getSlicePath({
				cx: sliceParams.getCx(),
				cy: sliceParams.getCy(),
				outerRadius: levelOuterRadius,
				innerRadius: levelInnerRadius,
				startAngle: nestedAngleInfo.startAngle,
				endAngle: nestedAngleInfo.endAngle,
			})

			return {
				slice: child,
				path,
				angleInfo: nestedAngleInfo,
			}
		})
	}

	// If hierarchical, prepare nested slices data
	let nestedSlicesData = $derived(
		hierarchical && slices.some(s => s.children?.length)
			? sliceParams.sliceAngles
					.map((angleInfo, i) => {
						const parentSlice = slices[i]
						return renderNestedSlices(parentSlice, angleInfo, 1)
					})
					.filter(Boolean)
					.flat()
			: [],
	)
</script>

<div
	class="container"
	data-arc-type={layout}
	style:--radius={radius}
	style:--outerRadiusFraction={outerRadiusFraction}
	style:--innerRadiusFraction={innerRadiusFraction}
	style:--gap={gap}
>
	<svg {width} {height} viewBox={viewBoxParams}>
		<g class="slices">
			{#each slices as slice, i}
				<g
					class="slice"
					style:--rotationAngle={sliceParams.sliceAngles[i].midAngle}
					class:highlighted={highlightedSliceId === slice.id}
					data-slice-id={slice.id}
					role="button"
					tabindex="0"
					onmouseenter={() => onSliceMouseEnter?.(slice.id)}
					onmouseleave={() => onSliceMouseLeave?.(slice.id)}
					onclick={() => onSliceClick?.(slice.id)}
					onkeydown={e => e.key === 'Enter' && onSliceClick?.(slice.id)}
				>
					<path d={slicePaths[i]} fill={slice.color}>
						<title>{slice.tooltip}: {slice.tooltipValue}</title>
					</path>

					<line x1="0" y1="0" x2="0" y2={-sliceParams.innerRadius} class="label-line" />
					<text
						class="slice-label"
						aria-hidden="true"
						transform={`rotate(${-sliceParams.sliceAngles[i].midAngle}) translate(0, ${-((sliceParams.outerRadius + sliceParams.innerRadius) / 2)})`}
					>
						{slice.arcLabel}
					</text>
				</g>
			{/each}

			{#if hierarchical && nestedSlicesData.length > 0}
				{#each nestedSlicesData as nestedData, i}
					<g
						class="slice nested-slice"
						class:highlighted={highlightedSliceId === nestedData.slice.id}
						data-slice-id={nestedData.slice.id}
						data-parent-id={nestedData.slice.parentId}
						role="button"
						tabindex="0"
						onmouseenter={() => onSliceMouseEnter?.(nestedData.slice.id)}
						onmouseleave={() => onSliceMouseLeave?.(nestedData.slice.id)}
						onclick={() => onSliceClick?.(nestedData.slice.id)}
						onkeydown={e => e.key === 'Enter' && onSliceClick?.(nestedData.slice.id)}
					>
						<path d={nestedData.path} fill={nestedData.slice.color}>
							<title>{nestedData.slice.tooltip}: {nestedData.slice.tooltipValue}</title>
						</path>

						<text
							class="nested-slice-label"
							aria-hidden="true"
							transform={`rotate(${nestedData.angleInfo.midAngle}) translate(0, ${-((sliceParams.outerRadius * 0.9 + sliceParams.innerRadius * 1.1) / 2)})`}
						>
							{nestedData.slice.arcLabel}
						</text>
					</g>
				{/each}
			{/if}
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
		--sliceLabel-radius: calc(
			var(--radius) * (var(--outerRadiusFraction) + var(--innerRadiusFraction)) / 2
		);

		&[data-arc-type='TopHalf'] {
			--centerLabel-dominantBaseline: text-after-edge;
		}

		&[data-arc-type='Full'],
		&[data-arc-type='Custom'] {
			--centerLabel-dominantBaseline: central;
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
				will-change: transform, scale;
				transition-property: transform, scale, filter;
				transition-duration: 0.2s;
				transition-timing-function: ease-out;

				&:hover,
				&:focus {
					filter: brightness(1.1);
					--slice-scale: 1.05;
				}

				&:focus {
					stroke: rgba(255, 255, 255, 0.8);
					stroke-width: 2px;
					z-index: 2;
					outline: none;
				}

				&.highlighted {
					stroke: rgba(255, 255, 255, 1);
					stroke-width: 2px;
					z-index: 2;
				}

				.label-line {
					stroke: none;
					pointer-events: none;
				}

				.slice-label,
				.nested-slice-label {
					text-anchor: middle;
					dominant-baseline: central;
					fill: currentColor;
					font-size: 10px;
					pointer-events: none;
					will-change: transform;
				}

				&.nested-slice {
					opacity: 0.9;

					.nested-slice-label {
						font-size: 8px;
					}
				}
			}
		}

		.center-label {
			text-anchor: middle;
			dominant-baseline: var(--centerLabel-dominantBaseline);
			font-size: 14px;
			fill: currentColor;
			pointer-events: none;
		}
	}
</style>
