import { type Features } from './Features';
import { type Issues } from './Issues';

export interface Info {
  url: string;
  submittedByName: string;
  submittedByUrl: string;
  updatedAt: string;
  updatedByName: string;
  updatedByUrl: string;
  repoUrl?: string;
  mobile?: Features;
  browser?: Features;
  desktop?: Features;
  issues?: Issues;
}
