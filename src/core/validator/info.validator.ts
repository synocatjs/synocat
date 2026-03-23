import type { ParsedInfo } from '../../types/';
import type { ValidationResult } from '../../types/';
import { INFO_FIELDS, INFO_REQUIRED_FIELDS } from '../../data/info-fields.data';
import { FIELD_DEPENDENCIES } from '../../data/field-dependencies.data';

export class InfoValidator {
  validate(info: ParsedInfo): ValidationResult {
    const errors:   string[] = [];
    const warnings: string[] = [];
    const infos:    string[] = [];

    // 1. Required fields
    for (const field of INFO_REQUIRED_FIELDS) {
      if (!info[field]) {
        errors.push(`[INFO] Required field missing: "${field}"`);
      }
    }

    // 2. Per-field rules
    for (const [key, val] of Object.entries(info)) {
      if (val === undefined) continue;
      const meta = INFO_FIELDS[key];
      if (!meta) {
        warnings.push(`[INFO] Unknown field "${key}" (possible typo)`);
        continue;
      }
      if (meta.deprecated) {
        warnings.push(`[INFO] "${key}" is deprecated${meta.replacement ? `; use "${meta.replacement}" instead` : ''}`);
      }
      if (meta.enum && !meta.enum.includes(val)) {
        errors.push(`[INFO] "${key}" value "${val}" is invalid. Allowed: ${meta.enum.join(', ')}`);
      }
      const validationErr = meta.validate?.(val);
      if (validationErr) {
        errors.push(`[INFO] "${key}": ${validationErr}`);
      }
      if (meta.warn) {
        warnings.push(`[INFO] "${key}": ${meta.warn}`);
      }
    }

    // 3. Field dependencies / cross-field rules
    for (const dep of FIELD_DEPENDENCIES) {
      const msg = dep.check(info);
      if (msg) {
        if (dep.severity === 'error') errors.push(`[INFO] ${msg}`);
        else warnings.push(`[INFO] ${msg}`);
      }
    }

    // 4. Informational hints
    const major = parseInt((info['os_min_ver'] ?? '').split('.')[0] ?? '0', 10);
    const arch  = info['arch'] ?? '';
    if (major >= 7 && arch && !arch.split(' ').includes('noarch')) {
      infos.push(`[INFO] arch="${arch}" — if the package has no compiled binaries, consider "noarch" to cover all platforms`);
    }

    return { valid: errors.length === 0, errors, warnings, infos };
  }
}