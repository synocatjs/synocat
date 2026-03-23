import path from 'node:path';
import type { IFileSystem } from '../infra/fs';
import type { ScaffoldConfig } from '../types/';
import { generatePrivilege }       from '../core/generators/privilege.generator';
import { generateResource }        from '../core/generators/resource.generator';
import { generateScript, generateStartStopStatus } from '../core/generators/script.generator';
import { generateResourceSchema, generateVSCodeSettings } from '../core/generators/schema.generator';
import { TEMPLATE_REGISTRY }       from '../core/generators/templates/registry';
import { generateINFO } from '../core/generators/info.generator';


const LIFECYCLE_SCRIPTS = [
  'preinst', 'postinst', 'preuninst', 'postuninst', 'preupgrade', 'postupgrade',
] as const;

/**
 * Orchestrates all generators and writes files via the injected IFileSystem.
 * Contains zero console output — the command layer owns all UI.
 */
export class ScaffoldService {
  constructor(private readonly fs: IFileSystem) {}

  /** Generates a full package scaffold. Returns list of relative file paths written. */
  generate(targetDir: string, cfg: ScaffoldConfig): string[] {
    const written: string[] = [];

    const write = (rel: string, content: string, executable = false): void => {
      const abs = path.join(targetDir, rel);
      this.fs.write(abs, content);
      if (executable) this.fs.chmod(abs, 0o755);
      written.push(rel);
    };

    // ── Common files ───────────────────────────────────────────────────────
    write('INFO',             generateINFO(cfg));
    write('conf/privilege',   generatePrivilege());

    if (cfg.hasResource && cfg.resourceType && cfg.resourceType !== 'none') {
      write('conf/resource', generateResource(cfg.resourceType, {
        package: cfg.package,
        ...cfg.resourceOpts,
      }));
    }

    // ── Lifecycle scripts ──────────────────────────────────────────────────
    for (const name of LIFECYCLE_SCRIPTS) {
      write(`scripts/${name}`, generateScript(name), true);
    }
    write('scripts/start-stop-status', generateStartStopStatus(cfg), true);

    // ── IDE support ────────────────────────────────────────────────────────
    write('.synocat/schemas/resource.schema.json',
      JSON.stringify(generateResourceSchema(), null, 2) + '\n');
    write('.vscode/settings.json',
      JSON.stringify(generateVSCodeSettings(), null, 2) + '\n');

    // ── Template-specific files ────────────────────────────────────────────
    const template = TEMPLATE_REGISTRY[cfg.templateType];
    for (const file of template.generate(cfg)) {
      write(file.path, file.content, file.executable);
    }

    // ── Icon placeholder ───────────────────────────────────────────────────
    write('PACKAGE_ICON.README.md', [
      '# Package Icons',
      '',
      'Place the following files in this directory:',
      '- `PACKAGE_ICON.PNG`     — 64×64 px  (required by DSM 7.0)',
      '- `PACKAGE_ICON_256.PNG` — 256×256 px (recommended for hi-DPI)',
      '',
      'Generate from any source image with:',
      '```bash',
      'synocat image ./logo.png',
      '```',
    ].join('\n'));
    written.push('PACKAGE_ICON.README.md');

    // ── README ─────────────────────────────────────────────────────────────
    write('README.md', this.generateReadme(cfg));

    return written;
  }

  /** Returns the next-step hints for a given template type. */
  getNextSteps(cfg: ScaffoldConfig): string[] {
    return TEMPLATE_REGISTRY[cfg.templateType].getNextSteps(cfg);
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private generateReadme(cfg: ScaffoldConfig): string {
    const templateLabels: Record<string, string> = {
      minimal:        'Pure shell package (noarch)',
      'node-service': 'Node.js backend service',
      'vue-desktop':  'Vue.js desktop application',
      docker:         'Docker Compose package',
    };

    return [
      `# ${cfg.displayname ?? cfg.package}`,
      ``,
      `> ${cfg.description}`,
      ``,
      `**Template**: ${templateLabels[cfg.templateType] ?? cfg.templateType}`,
      `**Min DSM**:  ${cfg.os_min_ver}`,
      `**Maintainer**: ${cfg.maintainer}`,
      ``,
      `---`,
      ``,
      `## Directory structure`,
      ``,
      '```',
      `${cfg.package}/`,
      `├── INFO                       # Package metadata (required)`,
      `├── PACKAGE_ICON.PNG           # 64×64 icon (required by DSM 7.0)`,
      `├── PACKAGE_ICON_256.PNG       # 256×256 hi-res icon`,
      `├── scripts/`,
      `│   ├── start-stop-status      # Lifecycle controller (required)`,
      `│   ├── preinst / postinst     # Pre/post install`,
      `│   ├── preuninst / postuninst # Pre/post uninstall`,
      `│   └── preupgrade / postupgrade`,
      `├── conf/`,
      `│   ├── privilege              # Permissions (mandatory in DSM 7.0)`,
      `│   └── resource               # System resources (optional)`,
      `├── .vscode/settings.json      # IDE JSON Schema hints`,
      `└── .synocat/schemas/          # JSON Schema files`,
      '```',
      ``,
      `## Development workflow`,
      ``,
      '```bash',
      `synocat validate .          # Validate configuration`,
      `synocat info <field>        # Field documentation`,
      `synocat add resource port   # Add system resource`,
      `synocat pack .              # Generate .spk directory structure`,
      '```',
      ``,
      `## References`,
      ``,
      `- [DSM Developer Guide 7.2.2](https://help.synology.com/developer-guide/)`,
      `- [ExamplePackages](https://github.com/SynologyOpenSource/ExamplePackages)`,
      `- [pkgscripts-ng](https://github.com/SynologyOpenSource/pkgscripts-ng)`,
      ``,
    ].join('\n');
  }
}