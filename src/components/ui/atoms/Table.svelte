<script
	lang="ts"
	generics="
		Datum extends any,
		CellValue extends any,
	"
>
	// Types
	import { DataTable, type ColumnDef } from '@careswitch/svelte-data-table'
	import type { Snippet } from 'svelte'


	// Inputs
	let {
		rows,
		getId,
		columns,
		cellSnippet,
	}: {
		rows: Datum[]
		getId?: (row: Datum, index: number) => any
		columns: ColumnDef<Datum, CellValue>[]
		cellSnippet: Snippet<[
			{
				row: Datum
				column: ColumnDef<Datum, CellValue>
				value: CellValue
			}
		]>
	} = $props()


	// State
	const table = new DataTable<Datum>({
		data: rows,
		columns,
	})
</script>


{#snippet columnCellSnippet(column: ColumnDef<Datum, CellValue>)}
	{column.name}
{/snippet}


<div>
	<table>
		<thead>
			<tr>
				{#each table.columns as column (column.id)}
					<th>
						{@render columnCellSnippet(column)}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each table.rows as row, index (getId?.(row, index))}
				<tr tabIndex={0}>
					{#each table.columns as column (column.id)}
						<td>
							{@render cellSnippet({
								row,
								column,
								value: column.getValue?.(row),
							})}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>


<style>
	div {
		--table-backgroundColor: #22242b;
		--table-outerBorderColor: rgba(20, 21, 25, 1);
		--table-innerBorderColor: rgba(20, 21, 25, 1);
		--table-borderWidth: 1px;
		--table-cornerRadius: 1rem;
		--table-cell-padding: 0.5em 1em;

		scroll-padding: var(--table-borderWidth);

		background-color: var(--table-backgroundColor);
		box-shadow: 0 0 0 var(--table-borderWidth) var(--table-outerBorderColor) inset;
		border-radius: var(--table-cornerRadius);

		clip-path: inset(
			calc(-1 * var(--table-borderWidth))
			calc(-1 * var(--table-borderWidth))
			calc(-1 * var(--table-borderWidth))
			calc(-1 * var(--table-borderWidth))
			round var(--table-cornerRadius)
		);
	}

	table {
		min-width: 100%;
		width: max-content;
		margin-inline: calc(-1 * var(--table-borderWidth));

		border-collapse: separate;
		border-spacing: var(--table-borderWidth);

		thead {
			font-size: 0.85em;
			text-wrap: nowrap;

			tr {
				background-color: var(--table-backgroundColor);
				box-shadow: 0 0 0 var(--table-borderWidth) var(--table-innerBorderColor);
				position: sticky;
				top: 0;
				z-index: 1;
			}
		}

		tbody {
			tr {
				--table-row-backgroundColor: light-dark(rgba(0, 0, 0, 0.03), rgba(255, 255, 255, 0.03));

				box-shadow:
					0 var(--table-borderWidth) var(--table-outerBorderColor),
					0 calc(-1 * var(--table-borderWidth)) var(--table-outerBorderColor);

				&:nth-of-type(odd) {
					background-color: var(--table-row-backgroundColor);

					> td {
						box-shadow: var(--table-borderWidth) 0 var(--table-row-backgroundColor);
					}
				}

				&[tabIndex='0'] {
					cursor: pointer;

					transition: var(--active-transitionOutDuration) var(--transition-easeOutExpo);

					&:hover {
						--table-row-backgroundColor: light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05));
					}

					&:active:not(:has([tabindex='0']:active)) {
						transition-duration: var(--active-transitionInDuration);
						opacity: var(--active-opacity);
						scale: var(--active-scale);

						&:active {
							--borderColor: transparent;
						}

						box-shadow: none;
					}
				}
			}
		}

		th,
		td {
			padding: var(--table-cell-padding);
		}
	}
</style>
