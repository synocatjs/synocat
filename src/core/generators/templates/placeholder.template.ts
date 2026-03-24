import { GeneratedFile, ScaffoldConfig } from "../../../types";
import { IScaffoldTemplate } from "./base.template";

export class PlaceholderTemplate implements IScaffoldTemplate {
  readonly type = 'minimal-app';

  generate(_cfg: ScaffoldConfig): GeneratedFile[] {
    return [];   // All common files handled by ScaffoldService
  }

  getNextSteps(cfg: ScaffoldConfig): string[] {
    return [
      `Edit scripts/start-stop-status to implement start/stop logic`,
      `Pack your application files into package.tgz`,
      `Place PACKAGE_ICON.PNG (64×64 px)`,
      `Run: synocat pack ${cfg.package}`,
    ];
  }
}