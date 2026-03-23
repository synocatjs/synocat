import type { ValidationResult } from '../../types/';
import { RESOURCE_WORKERS } from '../../data/resource-workers.data';

export class ResourceValidator {
  validate(raw: unknown): ValidationResult {
    const errors:   string[] = [];
    const warnings: string[] = [];
    const infos:    string[] = [];

    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      errors.push('[conf/resource] Root must be a JSON object');
      return { valid: false, errors, warnings, infos };
    }

    const res = raw as Record<string, unknown>;

    for (const [key, cfg] of Object.entries(res)) {
      const worker = RESOURCE_WORKERS[key];
      if (!worker) {
        warnings.push(`[conf/resource] Unknown worker type: "${key}"`);
        continue;
      }
      infos.push(`[conf/resource] ${key} (${worker.label}): ${worker.description}`);
      if (worker.note) {
        warnings.push(`[conf/resource] ${key}: ${worker.note}`);
      }
      if (worker.requiredFields) {
        for (const rf of worker.requiredFields) {
          if (typeof cfg !== 'object' || cfg === null || !(rf in (cfg as object))) {
            errors.push(`[conf/resource] "${key}" is missing required field: "${rf}"`);
          }
        }
      }
      if (key === 'data-share') {
        const ds = cfg as Record<string, unknown>;
        if (!ds['shares']) {
          errors.push('[conf/resource] data-share is missing "shares" array');
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings, infos };
  }
}