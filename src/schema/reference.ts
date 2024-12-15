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

/** A URL and a label. Can be converted to a FullyQualifiedReference. */
export interface LabeledURL {
  url: string;
  label: string;
}

/**
 * A loose reference which can be converted to a FullyQualifiedReference.
 */
export interface LooseReference {
  /** The URL(s) the reference is about. */
  url: NonEmptyArray<string> | string;

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
  urls: NonEmptyArray<{ url: string; label: string }>;

  /** A human-readable string that explains what the reference is about. */
  explanation?: string;

  /** The date the reference was last retrieved. */
  lastRetrieved?: string;
}

type Reference = string | LabeledURL | LooseReference | FullyQualifiedReference;

function isLabeledURL(reference: Reference): reference is LabeledURL {
  return typeof reference === 'object' && !isLoose(reference);
}

function isLoose(reference: Reference): reference is LooseReference {
  return (
    typeof reference === 'object' &&
    Object.hasOwn(reference, 'explanation') &&
    !isFullyQualified(reference)
  );
}

function isFullyQualified(reference: Reference): reference is FullyQualifiedReference {
  return typeof reference === 'object' && Object.hasOwn(reference, 'urls');
}

type References = Reference | NonEmptyArray<Reference>;

export type WithRef<T> = T & { ref?: References };

function getDomain(url: string): string {
  let hostname = new URL(url).hostname;
  if (hostname.startsWith('www.')) {
    hostname = hostname.substring('www.'.length);
  }
  return hostname;
}

/** Fully qualify a `Reference`. */
function toFullyQualified(reference: Reference): FullyQualifiedReference[] {
  if (typeof reference === 'string') {
    return [
      {
        urls: [{ url: reference, label: getDomain(reference) }],
      },
    ];
  }
  if (isFullyQualified(reference)) {
    return [reference];
  }
  if (isLabeledURL(reference)) {
    return [{ urls: [reference] }];
  }
  if (typeof reference.url === 'string') {
    return [
      {
        urls: [
          {
            url: reference.url,
            label: reference.label ?? getDomain(reference.url),
          },
        ],
        explanation: reference.explanation,
        lastRetrieved: reference.lastRetrieved,
      },
    ];
  }
  if (reference.url.length === 1) {
    const url = nonEmptyGet(reference.url);
    return [
      {
        urls: [
          {
            url,
            label: reference.label ?? getDomain(url),
          },
        ],
        explanation: reference.explanation,
        lastRetrieved: reference.lastRetrieved,
      },
    ];
  }
  return reference.url.map((url, idx) => ({
      urls: [
        {
          url,
          label: reference.label ?? `${getDomain(url)} ${idx + 1}`,
        },
      ],
      explanation: reference.explanation,
      lastRetrieved: reference.lastRetrieved,
    }));
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
