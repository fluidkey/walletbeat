import {
	type References,
	type FullyQualifiedReference,
	mergeRefs,
	toFullyQualified,
} from '@/schema/reference'
import React from 'react'
import { JoinedList } from './JoinedList'
import { nonEmptyMap } from '@/types/utils/non-empty'
import { Link } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import LooksOneIcon from '@mui/icons-material/LooksOne'
import LooksTwoIcon from '@mui/icons-material/LooksTwo'
import Looks3Icon from '@mui/icons-material/Looks3'
import Looks4Icon from '@mui/icons-material/Looks4'
import Looks5Icon from '@mui/icons-material/Looks5'
import Looks6Icon from '@mui/icons-material/Looks6'
import { ReferenceTooltip } from './ReferenceLink'

const numberedIcons = [LooksOneIcon, LooksTwoIcon, Looks3Icon, Looks4Icon, Looks5Icon, Looks6Icon]

export function ReferenceLinks({
	key,
	ref,
	ifEmpty = undefined,
	nonEmptyPrefix = undefined,
	showExplanation = true,
}: {
	key?: string
	ref?: null | References | FullyQualifiedReference | FullyQualifiedReference[]
	ifEmpty?: React.JSX.Element
	nonEmptyPrefix?: React.ReactNode
	showExplanation?: boolean
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
	const numUrls = refs.reduce((prev, cur) => prev + cur.urls.length, 0)
	const numberedMode = numUrls > 1 && numUrls <= numberedIcons.length
	return (
		<React.Fragment key={key}>
			{nonEmptyPrefix !== undefined && nonEmptyPrefix !== '' && <>{nonEmptyPrefix} </>}
			<JoinedList
				data={
					refs.reduce<{
						items: Array<React.ComponentProps<typeof JoinedList>['data'][0]>
						urlIndex: number
					}>(
						(prev, ref) => ({
							items: prev.items.concat(
								nonEmptyMap(ref.urls, (url, innerIndex) => {
									const IconComponent = numberedMode
										? numberedIcons[prev.urlIndex + innerIndex]
										: InfoIcon
									return {
										key: url.url,
										value: (
											<ReferenceTooltip showExplanation={showExplanation} ref={ref} url={url}>
												<Link href={url.url} target="_blank" rel="noopener noreferrer nofollow">
													<IconComponent color="inherit" fontSize="inherit" />
												</Link>
											</ReferenceTooltip>
										),
									}
								}),
							),
							urlIndex: prev.urlIndex + ref.urls.length,
						}),
						{ items: [], urlIndex: 0 },
					).items
				}
				separator=" "
				lastSeparator=" "
			/>
		</React.Fragment>
	)
}
