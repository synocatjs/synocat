import path from 'node:path';
import type { IFileSystem } from '../infra/fs';
import type { ValidationResult } from '../types/';
import { ValidatorService } from './validator.service';

export interface PackOptions {
  output?: string;
}

export interface PackResult {
  validation:  ValidationResult;
  outputDir:   string;
  spkDir:      string;
  files:       string[];
  pkgName:     string;
  pkgVersion:  string;
}

/**
 * Validates, then assembles a .spk directory structure.
 * Actual .spk file generation (tar) requires a Linux environment with
 * Synology pkgscripts-ng or a simple tar command.
 */
export class PackService {
  private readonly validator: ValidatorService;

  constructor(private readonly fs: IFileSystem) {
    this.validator = new ValidatorService(fs);
  }

  pack(srcDir: string, opts: PackOptions = {}): PackResult {
    const validation = this.validator.validate(srcDir);

    const { pkgName, pkgVersion } = this.readMeta(srcDir);
    const outputBase = path.resolve(opts.output ?? path.join(srcDir, '..', 'dist'));
    const outputDir  = path.join(outputBase, `${pkgName}-${pkgVersion}`);
    const spkDir     = path.join(outputDir,  'spk');
    const files:     string[] = [];

    this.fs.mkdir(spkDir);

    const copy = (rel: string): void => {
      const src = path.join(srcDir, rel);
      if (!this.fs.exists(src)) return;
      this.fs.copy(src, path.join(spkDir, rel));
      files.push(rel);
    };

    const copyDir = (rel: string): void => {
      const src = path.join(srcDir, rel);
      if (!this.fs.exists(src)) return;
      this.copyDirRecursive(src, path.join(spkDir, rel));
      files.push(rel + '/');
    };

    // INFO (required)
    copy('INFO');

    // conf/
    copyDir('conf');

    // scripts/ — ensure executable bit
    const scriptsDir = path.join(srcDir, 'scripts');
    if (this.fs.exists(scriptsDir)) {
      this.fs.mkdir(path.join(spkDir, 'scripts'));
      for (const name of this.fs.readdir(scriptsDir)) {
        const dst = path.join(spkDir, 'scripts', name);
        this.fs.copy(path.join(scriptsDir, name), dst);
        this.fs.chmod(dst, 0o755);
        files.push(`scripts/${name}`);
      }
    }

    // WIZARD_UIFILES/
    copyDir('WIZARD_UIFILES');

    // Icons
    copy('PACKAGE_ICON.PNG');
    copy('PACKAGE_ICON_256.PNG');

    // LICENSE
    copy('LICENSE');

    // package.tgz (if present)
    copy('package.tgz');

    // Generate manifest
    this.fs.write(
      path.join(outputDir, 'manifest.txt'),
      this.generateManifest(files, pkgName, pkgVersion),
    );

    // Generate package.tgz guide if missing
    if (!this.fs.exists(path.join(spkDir, 'package.tgz'))) {
      this.fs.write(
        path.join(outputDir, 'PACKAGE_TGZ_README.md'),
        this.packageTgzGuide(pkgName, srcDir),
      );
    }

    return { validation, outputDir, spkDir, files, pkgName, pkgVersion };
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private readMeta(srcDir: string): { pkgName: string; pkgVersion: string } {
    let pkgName    = 'package';
    let pkgVersion = '1.0.0-0001';
    const infoPath = path.join(srcDir, 'INFO');
    if (this.fs.exists(infoPath)) {
      const content = this.fs.read(infoPath);
      const name    = content.match(/^package="?([^"\n]+)"?/m)?.[1];
      const ver     = content.match(/^version="?([^"\n]+)"?/m)?.[1];
      if (name) pkgName    = name;
      if (ver)  pkgVersion = ver;
    }
    return { pkgName, pkgVersion };
  }

  private copyDirRecursive(src: string, dst: string): void {
    if (!this.fs.exists(src)) return;
    this.fs.mkdir(dst);
    for (const entry of this.fs.readdir(src)) {
      const s = path.join(src, entry);
      const d = path.join(dst, entry);
      try {
        const st = this.fs.stat(s);
        if (st.isDirectory()) this.copyDirRecursive(s, d);
        else this.fs.copy(s, d);
      } catch {
        this.fs.copy(s, d);
      }
    }
  }

  private generateManifest(files: string[], name: string, version: string): string {
    const lines = [
      `# .spk manifest`,
      `# Package: ${name}  Version: ${version}`,
      `# Generated: ${new Date().toISOString()}`,
      '',
      ...files,
    ];
    return lines.join('\n') + '\n';
  }

  private packageTgzGuide(pkgName: string, srcDir: string): string {
    return `# package.tgz Guide

## What is package.tgz?

\`package.tgz\` is the application payload — all files needed to run the package:
- Executables (binaries, Node.js scripts, etc.)
- UI files (if dsmuidir is set)
- Config templates
- Static assets

After install, it is extracted to \`/var/packages/${pkgName}/target/\`.

## How to prepare

### Node.js package
\`\`\`bash
npm install --production
tar czf package.tgz src/ node_modules/ package.json
\`\`\`

### Package with UI
\`\`\`bash
cd ui && npm run build && cd ..
tar czf package.tgz ui/dist/ bin/ lib/
\`\`\`

### Docker package
\`\`\`bash
tar czf package.tgz compose/
\`\`\`

## After packaging
\`\`\`bash
cp package.tgz ${srcDir}/../dist/${pkgName}-*/spk/
synocat pack .
\`\`\`
`;
  }
}