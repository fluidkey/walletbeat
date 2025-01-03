import { type FullyQualifiedReference, mergeRefs } from '@/beta/schema/reference';
import React from 'react';
import { JoinedList } from './JoinedList';
import { nonEmptyMap } from '@/beta/types/utils/non-empty';
import { Link, Tooltip } from '@mui/material';
import { Info } from '@mui/icons-material';

export function ReferenceLinks({
  key,
  ref,
  ifEmpty = undefined,
  nonEmptyPrefix = undefined,
}: {
  key?: string;
  ref: FullyQualifiedReference | FullyQualifiedReference[];
  ifEmpty?: React.JSX.Element;
  nonEmptyPrefix?: React.ReactNode;
}): React.JSX.Element | undefined {
  let refs = ref;
  if (!Array.isArray(refs)) {
    refs = [refs];
  }
  if (refs.length === 0) {
    return ifEmpty;
  }
  refs = mergeRefs(...refs);
  return (
    <React.Fragment key={key}>
      {nonEmptyPrefix}
      <JoinedList
        data={refs.flatMap(ref =>
          nonEmptyMap(ref.urls, url => ({
            key: url.url,
            value: (
              <Tooltip title={ref.explanation ?? url.label} arrow={true}>
                <Link href={url.url} target="_blank" rel="noopener noreferrer nofollow">
                  <Info color="inherit" fontSize="inherit" />
                </Link>
              </Tooltip>
            ),
          }))
        )}
        separator=" "
        lastSeparator=" "
      />
    </React.Fragment>
  );
}
