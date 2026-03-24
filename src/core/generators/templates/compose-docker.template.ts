import type { IScaffoldTemplate } from './base.template';
import type { GeneratedFile, ScaffoldConfig } from '../../../types/';

export class DockerTemplate implements IScaffoldTemplate {
  readonly type = 'docker';

  generate(cfg: ScaffoldConfig): GeneratedFile[] {
    return [
      { path: 'compose/compose.yml', content: this.composeYml(cfg) },
    ];
  }

  getNextSteps(cfg: ScaffoldConfig): string[] {
    return [
      `Edit compose/compose.yml to configure your containers`,
      `Ensure ContainerManager is installed on DSM (DSM 7.2.1+)`,
      `Place PACKAGE_ICON.PNG (64×64 px)`,
      `Run: synocat pack ${cfg.package}`,
    ];
  }

  private composeYml(cfg: ScaffoldConfig): string {
    const port = cfg.adminport ?? '8080';
    return [
      `# Docker Compose for ${cfg.package}`,
      `# DSM automatically manages this Compose project on install/start/stop`,
      `services:`,
      `  app:`,
      `    image: your-image:latest`,
      `    container_name: ${cfg.package}`,
      `    ports:`,
      `      - "${port}:${port}"`,
      `    restart: unless-stopped`,
      `    volumes:`,
      `      - app_data:/data`,
      `    environment:`,
      `      - NODE_ENV=production`,
      ``,
      `volumes:`,
      `  app_data:`,
      ``,
    ].join('\n');
  }
}