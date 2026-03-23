import path from 'node:path';
import type { IFileSystem } from '../infra/fs';
import { InfoValidator } from '../core/validator/info.validator';
import { PrivilegeValidator } from '../core/validator/privilege.validator';
import { ResourceValidator } from '../core/validator/resource.validator';
import { ScriptsValidator } from '../core/validator/scripts.validator';
import { ValidationResult } from '../types/result.type';

/**
 * Reads package files via IFileSystem, then delegates to the individual
 * validators. Returns a merged ValidationResult.
 */
export class ValidatorService {
  private readonly infoValidator      = new InfoValidator();
  private readonly privilegeValidator = new PrivilegeValidator();
  private readonly resourceValidator  = new ResourceValidator();
  private readonly scriptsValidator:  ScriptsValidator;

  constructor(private readonly fs: IFileSystem) {
    this.scriptsValidator = new ScriptsValidator(fs);
  }

  validate(packageDir: string): ValidationResult {
    const errors:   string[] = [];
    const warnings: string[] = [];
    const infos:    string[] = [];

    const merge = (r: ValidationResult): void => {
      errors.push(...r.errors);
      warnings.push(...r.warnings);
      infos.push(...r.infos);
    };

    // ── INFO ──────────────────────────────────────────────────────────────
    const infoPath   = path.join(packageDir, 'INFO');
    const infoshPath = path.join(packageDir, 'INFO.sh');

    if (this.fs.exists(infoPath)) {
      const parsed = this.parseINFO(this.fs.read(infoPath));
      merge(this.infoValidator.validate(parsed));
    } else if (this.fs.exists(infoshPath)) {
      infos.push('Found INFO.sh (INFO will be generated at build time)');
    } else {
      errors.push('[INFO] Neither INFO nor INFO.sh found');
    }

    // ── conf/privilege ────────────────────────────────────────────────────
    const privilegePath = path.join(packageDir, 'conf', 'privilege');
    if (this.fs.exists(privilegePath)) {
      try {
        merge(this.privilegeValidator.validate(JSON.parse(this.fs.read(privilegePath))));
      } catch {
        errors.push('[conf/privilege] JSON parse failed');
      }
    } else {
      errors.push('[conf/privilege] File missing — mandatory for all DSM 7.0 packages');
    }

    // ── conf/resource (optional) ──────────────────────────────────────────
    const resourcePath = path.join(packageDir, 'conf', 'resource');
    if (this.fs.exists(resourcePath)) {
      try {
        merge(this.resourceValidator.validate(JSON.parse(this.fs.read(resourcePath))));
      } catch {
        errors.push('[conf/resource] JSON parse failed');
      }
    }

    // ── scripts/ ──────────────────────────────────────────────────────────
    merge(this.scriptsValidator.validate(packageDir));

    // ── Icons ─────────────────────────────────────────────────────────────
    if (!this.fs.exists(path.join(packageDir, 'PACKAGE_ICON.PNG'))) {
      warnings.push('[icons] PACKAGE_ICON.PNG missing (DSM 7.0 requires 64×64 px)');
    }
    if (!this.fs.exists(path.join(packageDir, 'PACKAGE_ICON_256.PNG'))) {
      infos.push('[icons] PACKAGE_ICON_256.PNG recommended (256×256 for hi-DPI)');
    }

    return { valid: errors.length === 0, errors, warnings, infos };
  }

  /** Parse a raw INFO file string into a key→value map. */
  private parseINFO(content: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (const line of content.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      let val   = t.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      result[key] = val;
    }
    return result;
  }
}