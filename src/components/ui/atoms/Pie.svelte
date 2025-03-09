<script lang="ts">
	// Types/constants
	type PieSlice = {
		id: string
		color: string
		weight: number
		arcLabel: string
		tooltip: string
		tooltipValue: string
	}

	const ARC_TOP_HALF = 'TOP_HALF' as const
	const ARC_FULL = 'FULL' as const
	type ArcType = typeof ARC_TOP_HALF | typeof ARC_FULL


	// Inputs
	let {
		slices = [],
		width = 70,
		height = 36,
		arc = ARC_TOP_HALF,
		paddingAngle = 6,
		innerRadiusFraction = 0.5,
		outerRadiusFraction = 0.95,
		highlightedSliceId = null,
		centerLabel = '',
		onSliceClick = (id: string) => {},
		onSliceMouseEnter = (id: string) => {},
		onSliceMouseLeave = (id: string) => {},
	} = $props<{
		slices: PieSlice[]
		width?: number
		height?: number
		arc?: ArcType
		paddingAngle?: number
		innerRadiusFraction?: number
		outerRadiusFraction?: number
		highlightedSliceId?: string | null
		centerLabel?: string
		onSliceClick?: (id: string) => void
		onSliceMouseEnter?: (id: string) => void
		onSliceMouseLeave?: (id: string) => void
	}>()


	// State
	let svgParams = $derived.by(() => {
		const maxRadius = height
		
		let startAngle = -90
		let endAngle = 90
		let cx = width / 2
		let cy = height
		
		if (arc === ARC_FULL) {
			startAngle = -90
			endAngle = 270
			cx = width / 2
			cy = height / 2
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


	// Functions
	const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
		const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
		return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		}
	}


	// Actions
	const handleSliceClick = (id: string) => {
		onSliceClick(id)
	}

	const handleSliceMouseEnter = (id: string) => {
		onSliceMouseEnter(id)
	}

	const handleSliceMouseLeave = (id: string) => {
		onSliceMouseLeave(id)
	}

	const handleKeyDown = (e: KeyboardEvent, id: string) => {
		if(e.key === 'Enter')
			onSliceClick(id)
	}
</script>


<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
	{#each slices as slice, i}
		{@const totalAngle = svgParams.endAngle - svgParams.startAngle}
		{@const totalPadding = Math.min(svgParams.paddingAngle * (slices.length - 1), totalAngle * 0.3)}
		{@const sliceAngle = (totalAngle - totalPadding) / slices.length}
		{@const actualPadAngle = slices.length > 1 ? totalPadding / (slices.length - 1) : 0}
		{@const sliceStartAngle = svgParams.startAngle + (i * (sliceAngle + actualPadAngle))}
		{@const sliceEndAngle = sliceStartAngle + sliceAngle}
		{@const start = polarToCartesian(svgParams.cx, svgParams.cy, svgParams.outerRadius, sliceEndAngle)}
		{@const end = polarToCartesian(svgParams.cx, svgParams.cy, svgParams.outerRadius, sliceStartAngle)}
		{@const innerStart = polarToCartesian(svgParams.cx, svgParams.cy, svgParams.innerRadius, sliceEndAngle)}
		{@const innerEnd = polarToCartesian(svgParams.cx, svgParams.cy, svgParams.innerRadius, sliceStartAngle)}
		{@const largeArcFlag = sliceAngle > 180 ? 1 : 0}
		{@const path = [
			`M ${start.x} ${start.y}`,
			`A ${svgParams.outerRadius} ${svgParams.outerRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
			`L ${innerEnd.x} ${innerEnd.y}`,
			`A ${svgParams.innerRadius} ${svgParams.innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
			`L ${start.x} ${start.y}`
		].join(' ')}
		{@const labelAngle = sliceStartAngle + (sliceAngle / 2)}
		{@const labelRadius = (svgParams.innerRadius + svgParams.outerRadius) / 2}
		{@const labelPos = polarToCartesian(svgParams.cx, svgParams.cy, labelRadius, labelAngle)}

		<path 
			role="button"
			tabindex="0"
			d={path} 
			fill={slice.color}
			class={highlightedSliceId === slice.id ? 'highlighted' : ''}
			style="--transform-origin-x: {svgParams.cx}px; --transform-origin-y: {svgParams.cy}px;"
			onmouseenter={() => handleSliceMouseEnter(slice.id)}
			onmouseleave={() => handleSliceMouseLeave(slice.id)}
			onclick={() => handleSliceClick(slice.id)}
			onkeydown={e => handleKeyDown(e, slice.id)}
		>
			<title>{slice.tooltip}</title>
		</path>
		<text 
			x={labelPos.x} 
			y={labelPos.y} 
			class="slice-label"
		>
			{slice.arcLabel}
		</text>
	{/each}
	
	{#if centerLabel}
		<text 
			x={svgParams.cx} 
			y={svgParams.cy - 10} 
			class="center-label"
		>
			{centerLabel}
		</text>
	{/if}
</svg>


<style>
	.highlighted {
		stroke-width: 2;
		transform: scale(1.05);
		transform-origin: var(--transform-origin-x, center) var(--transform-origin-y, center);
		transition: transform 0.2s ease;
	}

	path {
		cursor: pointer;
		transition: transform 0.2s ease;
	}

	path:hover {
		transform: scale(1.05);
		transform-origin: var(--transform-origin-x, center) var(--transform-origin-y, center);
	}
	
	.slice-label {
		text-anchor: middle;
		dominant-baseline: central;
		fill: currentColor;
		font-size: 10px;
		pointer-events: none;
	}
	
	.center-label {
		text-anchor: middle;
		dominant-baseline: central;
		font-size: 14px;
		fill: currentColor;
	}
</style> 
