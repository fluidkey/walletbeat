/**
 * Get the URL root of the site, containing the scheme and host
 * but not containing the trailing slash.
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }

  if (process.env.WALLETBEAT_URL_ROOT !== undefined && process.env.WALLETBEAT_URL_ROOT !== '') {
    return process.env.WALLETBEAT_URL_ROOT;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL !== undefined && process.env.NEXT_PUBLIC_SITE_URL !== '') {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_BRANCH_URL !== undefined && process.env.VERCEL_BRANCH_URL !== '') {
    return `https://${process.env.VERCEL_BRANCH_URL}`;
  }

  if (
    process.env.VERCEL_PROJECT_PRODUCTION_URL !== undefined &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL !== ''
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL !== undefined && process.env.VERCEL_URL !== '') {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (
    process.env.WALLETBEAT_DEV !== undefined &&
    process.env.WALLETBEAT_DEV !== '' &&
    process.env.WALLETBEAT_DEV !== 'false'
  ) {
    return `http://${process.env.HOSTNAME ?? 'localhost'}:${process.env.PORT ?? 3000}`;
  }

  throw new Error(
    'Could not determine site URL root; please set WALLETBEAT_URL_ROOT environment variable'
  );
}
