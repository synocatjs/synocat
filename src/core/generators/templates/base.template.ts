import type { GeneratedFile, ScaffoldConfig } from '../../../types/';

/** Contract every scaffold template must satisfy */
export interface IScaffoldTemplate {
  readonly type: string;
  generate(cfg: ScaffoldConfig): GeneratedFile[];
  getNextSteps(cfg: ScaffoldConfig): string[];
}