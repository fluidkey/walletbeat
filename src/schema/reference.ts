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
import { getUrlLabel, isLabeledUrl, isUrl, labeledUrl, type LabeledUrl, type Url } from './url';

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
  lastRetrieved?: string;
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
  lastRetrieved?: string;
}

type Reference = Url | LooseReference | FullyQualifiedReference;

/** Type predicate for FullyQualifiedReference. */
function isFullyQualified(reference: Reference): reference is FullyQualifiedReference {
  return typeof reference === 'object' && Object.hasOwn(reference, 'urls');
}

type References = Reference | NonEmptyArray<Reference>;

/** An object that can be annotated with References. */
export type WithRef<T> = T & { ref?: References };

/** Fully qualify a `Reference`. */
function toFullyQualified(reference: Reference): FullyQualifiedReference[] {
  if (isUrl(reference)) {
    reference = labeledUrl(reference);
  }
  if (isLabeledUrl(reference)) {
    return [{ urls: [reference] }];
  }
  if (isFullyQualified(reference)) {
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
  if (withRef.ref === undefined) {
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
  return qualifiedRefs;
}
