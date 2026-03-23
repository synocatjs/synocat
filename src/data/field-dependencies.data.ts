import type { ParsedInfo } from '../types';

export interface FieldDependency {
  readonly name:     string;
  readonly fields:   readonly string[];
  readonly severity: 'error' | 'warning';
  readonly check:    (info: ParsedInfo) => string | null;
}

export const FIELD_DEPENDENCIES: readonly FieldDependency[] = [
  {
    name: 'admin_url_triple',
    fields: ['adminprotocol', 'adminport', 'adminurl'],
    severity: 'warning',
    check: (info) => {
      const any = info['adminport'] ?? info['adminurl'] ?? info['adminprotocol'];
      if (!any) return null;
      const missing = ['adminport', 'adminurl'].filter((f) => !info[f]);
      return missing.length ? `When using admin UI, also set: ${missing.join(', ')}` : null;
    },
  },
  {
    name: 'dsmui_chain',
    fields: ['dsmuidir', 'dsmappname', 'dsmapppage'],
    severity: 'error',
    check: (info) => {
      if (info['dsmappname'] && !info['dsmuidir']) return 'dsmappname requires dsmuidir to be set';
      if (info['dsmapppage'] && !info['dsmappname']) return 'dsmapppage requires dsmappname to be set';
      return null;
    },
  },
  {
    name: 'beta_report',
    fields: ['beta', 'report_url'],
    severity: 'warning',
    check: (info) => info['beta'] === 'yes' && !info['report_url']
      ? 'When beta=yes, providing a report_url is recommended'
      : null,
  },
  {
    name: 'deprecated_startable',
    fields: ['startable'],
    severity: 'warning',
    check: (info) => info['startable'] ? 'startable is deprecated; use ctl_stop instead' : null,
  },
  {
    name: 'replace_mechanism',
    fields: ['install_replace_packages', 'use_deprecated_replace_mechanism'],
    severity: 'warning',
    check: (info) => info['use_deprecated_replace_mechanism'] === 'yes' && !info['install_replace_packages']
      ? 'use_deprecated_replace_mechanism requires install_replace_packages'
      : null,
  },
  {
    name: 'silent_upgrade_from',
    fields: ['silent_upgrade', 'auto_upgrade_from'],
    severity: 'warning',
    check: (info) => info['auto_upgrade_from'] && info['silent_upgrade'] !== 'yes'
      ? 'auto_upgrade_from requires silent_upgrade=yes to take effect'
      : null,
  },
];