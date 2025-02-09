/**
 * Used for annotate reference information to wallet feature data.
 *
 * It is meant to be loose in the formats it accepts, but returns
 * a consistent type regardless.
 *
 * References can be any of these formats (these are all valid):
 *
 * ```
 * {some: "object", ref: "https://example.com"}
 * {some: "object", ref: {url: "https://example.com"}}
 * {some: "object", ref: {url: "https://example.com", label: "Source code"}}
 * {some: "object", ref: ["https://example.com", "https://example2.com"]}
 * {some: "object", ref: [{url: "https://example.com"}, {url: "https://example2.com"}]}
 * {some: "object", ref: [{url: "https://example.com"}, "https://example2.com"]}
 * ```
 */

import { nonEmptyGet, type NonEmptyArray } from '@/types/utils/non-empty';
import {
  getUrlLabel,
  isLabeledUrl,
  isUrl,
  labeledUrl,
  mergeLabeledUrls,
  type LabeledUrl,
  type Url,
} from './url';
import type { CalendarDate } from '@/types/date';

/**
 * A loose reference which can be converted to a FullyQualifiedReference.
 */
export interface LooseReference {
  /** The URL(s) the reference is about. */
  url: NonEmptyArray<Url> | Url;

  /** The text of the link that goes to `url`; defaults to the domain name of `url`. */
  label?: string;

  /** A human-readable string that explains what the reference is about. */
  explanation?: string;

  /** The date the reference was last retrieved. */
  lastRetrieved?: CalendarDate;
}

/**
 * A fully-qualified reference.
 */
export interface FullyQualifiedReference {
  /** The URLs and labels the reference is about. */
  urls: NonEmptyArray<LabeledUrl>;

  /** A human-readable string that explains what the reference is about. */
  explanation?: string;

  /** The date the reference was last retrieved. */
  lastRetrieved?: CalendarDate;
}

type Reference = Url | LooseReference | FullyQualifiedReference;

/** Type predicate for FullyQualifiedReference. */
export function isFullyQualifiedReference(
  reference: Reference
): reference is FullyQualifiedReference {
  return typeof reference === 'object' && Object.hasOwn(reference, 'urls');
}

type References = Reference | NonEmptyArray<Reference>;

/** An object that *must* be annotated with References. */
export type MustRef<T> = T & { ref: References };

/** An object that *may or may not* be annotated with References. */
export type WithRef<T> = MustRef<T> | (T & { ref?: null });

/** Fully qualify a `Reference`. */
export function toFullyQualified(reference: References): FullyQualifiedReference[] {
  if (Array.isArray(reference)) {
    const qualified: FullyQualifiedReference[] = [];
    for (const ref of reference) {
      qualified.push(...toFullyQualified(ref));
    }
    return mergeRefs(...qualified);
  }
  if (isUrl(reference)) {
    reference = labeledUrl(reference);
  }
  if (isLabeledUrl(reference)) {
    return [{ urls: [reference] }];
  }
  if (isFullyQualifiedReference(reference)) {
    return [reference];
  }
  if (isUrl(reference.url)) {
    return [
      {
        urls: [labeledUrl(reference.url, reference.label)],
        explanation: reference.explanation,
        lastRetrieved: reference.lastRetrieved,
      },
    ];
  }
  if (reference.url.length === 1) {
    const url = nonEmptyGet(reference.url);
    return [
      {
        urls: [labeledUrl(url, reference.label)],
        explanation: reference.explanation,
        lastRetrieved: reference.lastRetrieved,
      },
    ];
  }
  const labelCounter = new Map<string, number>();
  return reference.url.map(url => {
    if (isLabeledUrl(url)) {
      return {
        urls: [url],
        explanation: reference.explanation,
        lastRetrieved: reference.lastRetrieved,
      };
    }
    const label = getUrlLabel(url);
    const count = labelCounter.get(label) ?? 0;
    labelCounter.set(label, count + 1);
    return {
      urls: [
        {
          url,
          label: `${label} ${count + 1}`,
        },
      ],
      explanation: reference.explanation,
      lastRetrieved: reference.lastRetrieved,
    };
  });
}

/** Extract references out of `withRef`. */
export function refs<T>(withRef: WithRef<T>): FullyQualifiedReference[] {
  if (withRef.ref === undefined || withRef.ref === null) {
    return [];
  }
  let refs = withRef.ref;
  if (!Array.isArray(refs)) {
    refs = [refs];
  }
  const qualifiedRefs: FullyQualifiedReference[] = [];
  for (const reference of refs) {
    for (const qualRef of toFullyQualified(reference)) {
      qualifiedRefs.push(qualRef);
    }
  }
  return mergeRefs(...qualifiedRefs);
}

/** Extract references out of `withRef` and return an object without them. */
export function popRefs<T>(withRef: WithRef<T>): {
  withoutRefs: T;
  refs: FullyQualifiedReference[];
} {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe because we are reconstructing the object with its prior set of entries.
  const withoutRefs = Object.fromEntries(
    Object.entries(withRef).filter(([key]) => key !== 'ref')
  ) as T;
  return { withoutRefs, refs: refs(withRef) };
}

/** Deduplicate and merge references in `refs`. */
export function mergeRefs(...refs: FullyQualifiedReference[]): FullyQualifiedReference[] {
  const byExplanation = new Map<string, FullyQualifiedReference>();
  for (const ref of refs) {
    const explanation = ref.explanation ?? '';
    const existing = byExplanation.get(explanation);
    if (existing === undefined) {
      byExplanation.set(explanation, ref);
      continue;
    }
    let newUrls = existing.urls;
    for (const url of ref.urls) {
      newUrls = mergeLabeledUrls(newUrls, url);
    }
    byExplanation.set(explanation, {
      urls: newUrls,
      explanation: existing.explanation ?? ref.explanation,
      lastRetrieved: existing.lastRetrieved ?? ref.lastRetrieved,
    });
  }
  const mergedRefs: FullyQualifiedReference[] = [];
  byExplanation.forEach(ref => {
    mergedRefs.push(ref);
  });
  return mergedRefs;
}
