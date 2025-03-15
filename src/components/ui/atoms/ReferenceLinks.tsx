import {
	type References,
	type FullyQualifiedReference,
	mergeRefs,
	toFullyQualified,
} from '@/schema/reference'
import React from 'react'
import { JoinedList } from './JoinedList'
import { nonEmptyMap } from '@/types/utils/non-empty'
import { Link, Tooltip } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'

export function ReferenceLinks({
	key,
	ref,
	ifEmpty = undefined,
	nonEmptyPrefix = undefined,
}: {
	key?: string
	ref?: null | References | FullyQualifiedReference | FullyQualifiedReference[]
	ifEmpty?: React.JSX.Element
	nonEmptyPrefix?: React.ReactNode
}): React.JSX.Element | undefined {
	let refs = ref
	if (refs === undefined || refs === null) {
		return ifEmpty
	}
	if (!Array.isArray(refs)) {
		refs = [refs]
	}
	if (refs.length === 0) {
		return ifEmpty
	}
	refs = mergeRefs(...toFullyQualified(refs))
	return (
		<React.Fragment key={key}>
			{nonEmptyPrefix !== undefined && nonEmptyPrefix !== '' && <>{nonEmptyPrefix} </>}
			<JoinedList
				data={refs.flatMap(ref =>
					nonEmptyMap(ref.urls, url => ({
						key: url.url,
						value: (
							<Tooltip title={ref.explanation ?? url.label} arrow={true}>
								<Link href={url.url} target="_blank" rel="noopener noreferrer nofollow">
									<InfoIcon color="inherit" fontSize="inherit" />
								</Link>
							</Tooltip>
						),
					})),
				)}
				separator=" "
				lastSeparator=" "
			/>
		</React.Fragment>
	)
}
