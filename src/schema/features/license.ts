/**
 * An enum of licenses mapping to their SPDX ID.
 * https://spdx.org/licenses/
 */
export enum License {
  APACHE_2_0 = 'Apache-2.0',
  BUSL_1_1 = 'BUSL-1.1',
  MIT = 'MIT',
  PROPRIETARY = 'PROPRIETARY',
}

/**
 * An enum representing whether a given license is FOSS
 * (Free and Open Source Software).
 */
export enum FOSS {
  FOSS = 'FOSS',
  FUTURE_FOSS = 'FUTURE_FOSS',
  NOT_FOSS = 'NOT_FOSS',
}

/**
 * @param license The license to get the name of.
 * @returns Human-friendly name of the license.
 */
export function LicenseName(license: License): string {
  switch (license) {
    case License.APACHE_2_0:
      return 'Apache 2.0';
    case License.MIT:
      return 'MIT';
    case License.BUSL_1_1:
      return 'BUSL 1.1';
    case License.PROPRIETARY:
      return 'Proprietary';
  }
}

/**
 * @param license The license to get the FOSS status of.
 * @returns FOSS status of the license.
 */
export function LicenseIsFOSS(license: License): FOSS {
  switch (license) {
    case License.APACHE_2_0:
      return FOSS.FOSS;
    case License.MIT:
      return FOSS.FOSS;
    case License.BUSL_1_1:
      return FOSS.FUTURE_FOSS;
    case License.PROPRIETARY:
      return FOSS.NOT_FOSS;
  }
}

/**
 * @param license The license to get the source visibility of.
 * @returns Whether the license guarantees that the source code is visible.
 */
export function LicenseSourceIsVisible(license: License): boolean {
  switch (license) {
    case License.APACHE_2_0:
      return true;
    case License.MIT:
      return true;
    case License.BUSL_1_1:
      return true;
    case License.PROPRIETARY:
      return false;
  }
}

/**
 * @param license The license to get the URL of.
 * @returns The SPDX URL of the license.
 */
export function LicenseURL(license: License): string | null {
  if (license === License.PROPRIETARY) {
    return null;
  }
  return `https://spdx.org/licenses/${license}.html`;
}
