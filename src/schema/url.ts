/** A URL and a label. */
export interface LabeledUrl {
  url: string;
  label: string;
}

/** A Url is either a simple URL string or a LabeledUrl. */
export type Url = string | LabeledUrl;

/**
 * Unlabeled URLs have their labels default to their domain name.
 * However, if an entry for this domain name exists in this map, it
 * will be used as label instead.
 */
const wellKnownDomainsToLabels: Record<string, string> = {
  'crunchbase.com': 'Crunchbase',
  'github.com': 'GitHub',
  'warpcast.com': 'Warpcast',
};

/** Return the label for a URL. */
export function getUrlLabel(url: Url): string {
  if (isLabeledUrl(url)) {
    return url.label;
  }
  let hostname = new URL(url).hostname;
  if (hostname.startsWith('www.')) {
    hostname = hostname.substring('www.'.length);
  }
  if (Object.hasOwn(wellKnownDomainsToLabels, hostname)) {
    return wellKnownDomainsToLabels[hostname];
  }
  return hostname;
}

/**
 * Label a URL automatically.
 * @param url The URL to label.
 * @param defaultLabel The label to use if no label exists in the URL.
 *                     If undefined, use `getUrlLabel(url)`.
 * @return A labeled URL.
 */
export function labeledUrl(url: Url, defaultLabel?: string): LabeledUrl {
  if (typeof url === 'string') {
    return { label: defaultLabel ?? getUrlLabel(url), url };
  }
  return url;
}

/** Type predicate for `LabeledUrl`. */
export function isLabeledUrl(obj: unknown): obj is LabeledUrl {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Object.hasOwn(obj, 'label') &&
    Object.hasOwn(obj, 'url')
  );
}

/** Type predicate for `Url`. */
export function isUrl(obj: unknown): obj is Url {
  return typeof obj === 'string' || isLabeledUrl(obj);
}
