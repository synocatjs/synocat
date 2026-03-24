import type { IScaffoldTemplate } from './base.template';
import type { GeneratedFile, ScaffoldConfig } from '../../../types/';

export class NodeServiceTemplate implements IScaffoldTemplate {
  readonly type = 'node-service';

  generate(cfg: ScaffoldConfig): GeneratedFile[] {
    return [
      { path: 'src/index.js',  content: this.entryPoint(cfg) },
      { path: 'package.json',  content: JSON.stringify(this.pkgJson(cfg), null, 2) + '\n' },
    ];
  }

  getNextSteps(cfg: ScaffoldConfig): string[] {
    return [
      `Edit src/index.js to implement your service logic`,
      `Edit scripts/start-stop-status start/stop branches`,
      `Run: npm install`,
      `Place PACKAGE_ICON.PNG (64×64 px)`,
      `Run: synocat pack ${cfg.package}`,
    ];
  }

  private entryPoint(cfg: ScaffoldConfig): string {
    const port = cfg.adminport ?? '8080';
    return [
      `// ${cfg.package} — Main entry point`,
      `// DSM env vars are available as process.env.SYNOPKG_PKGDEST etc.`,
      ``,
      `const port = parseInt(process.env.PORT ?? '${port}', 10);`,
      ``,
      `// TODO: implement your service`,
      `console.log(\`[${cfg.package}] Server running on port \${port}\`);`,
      ``,
    ].join('\n');
  }

  private pkgJson(cfg: ScaffoldConfig): object {
    return {
      name:        cfg.package.toLowerCase(),
      version:     cfg.version,
      description: cfg.description,
      main:        'src/index.js',
      scripts: {
        start: 'node src/index.js',
        dev:   'node --watch src/index.js',
      },
      engines: { node: '>=18.0.0' },
    };
  }
}