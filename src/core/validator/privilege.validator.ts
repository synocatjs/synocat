import type { ValidationResult } from '../../types/';

export class PrivilegeValidator {
  validate(raw: unknown): ValidationResult {
    const errors:   string[] = [];
    const warnings: string[] = [];
    const infos:    string[] = [];

    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      errors.push('[conf/privilege] Root must be a JSON object');
      return { valid: false, errors, warnings, infos };
    }

    const priv = raw as Record<string, unknown>;

    if (!priv['defaults'] || typeof priv['defaults'] !== 'object') {
      errors.push('[conf/privilege] Missing "defaults" object');
      return { valid: false, errors, warnings, infos };
    }

    const defaults = priv['defaults'] as Record<string, unknown>;
    const runAs    = defaults['run-as'];

    if (!runAs) {
      errors.push('[conf/privilege] defaults is missing "run-as" field');
    } else if (runAs === 'system') {
      errors.push('[conf/privilege] "run-as: system" is not supported in DSM 7.0+; must be "package"');
    } else if (runAs !== 'package') {
      warnings.push(`[conf/privilege] "run-as: ${String(runAs)}" is non-standard; expected "package"`);
    }

    return { valid: errors.length === 0, errors, warnings, infos };
  }
}