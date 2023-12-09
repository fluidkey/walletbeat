import { type Features } from './Features';

export interface Info {
  url: string;
  mobile?: Features;
  browser?: Features;
  desktop?: Features;
}
