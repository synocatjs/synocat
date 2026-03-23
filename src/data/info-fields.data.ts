import { ARCH_VALUES } from './arch-values.data';

// ─── Field metadata type ──────────────────────────────────────────────────────

export interface FieldMeta {
  readonly label:        string;
  readonly description:  string;
  readonly required?:    true;
  readonly note?:        string;
  readonly example?:     string;
  readonly default?:     string;
  readonly enum?:        readonly string[];
  readonly deprecated?:  true;
  readonly replacement?: string;
  readonly dsm_min?:     string;
  readonly related?:     readonly string[];
  readonly warn?:        string;
  /** Returns an error message string on failure, null on pass */
  readonly validate?:    (value: string) => string | null;
}

// ─── Required field list ──────────────────────────────────────────────────────

export const INFO_REQUIRED_FIELDS = [
  'package', 'version', 'os_min_ver', 'description', 'arch', 'maintainer',
] as const;

export type RequiredFieldKey = typeof INFO_REQUIRED_FIELDS[number];

// ─── Field definitions ────────────────────────────────────────────────────────

export const INFO_FIELDS: Readonly<Record<string, FieldMeta>> = {
  // ── Required ──────────────────────────────────────────────────────────────
  package: {
    required: true,
    label: 'Package ID',
    description: 'Unique package identifier. Package Center creates /var/packages/[id]/ directory.',
    note: 'Cannot contain special characters: : / > < | =',
    example: 'MyAwesomeApp',
    validate: (v) => /[:/><=|]/.test(v) ? 'Cannot contain special characters: : / > < | =' : null,
  },
  version: {
    required: true,
    label: 'Version',
    description: 'Format: [major.minor.patch]-[build]. Separators: . - _ Segments: digits only.',
    note: 'Build number should increment with each release.',
    example: '1.2.0-0001',
    validate: (v) => !/^[\d._-]+$/.test(v) ? 'Only digits, dots, underscores, hyphens allowed' : null,
  },
  os_min_ver: {
    required: true,
    label: 'Minimum DSM version',
    description: 'Minimum DSM version required. Must be >= 7.0-40000 for DSM 7+.',
    example: '7.0-40000',
    validate: (v) => {
      const m = v.match(/^(\d+)\.(\d+)-(\d+)$/);
      if (!m) return 'Format must be X.Y-Z (e.g. 7.0-40000)';
      if (parseInt(m[1] ?? '0') === 7 && parseInt(m[2] ?? '0') === 0 && parseInt(m[3] ?? '0') < 40000)
        return 'DSM 7.0 build number must be >= 40000';
      return null;
    },
  },
  description: {
    required: true,
    label: 'Description',
    description: 'Short description shown in Package Center.',
    example: 'A web-based file manager for your NAS',
    validate: (v) => !v.trim() ? 'Cannot be empty' : null,
  },
  arch: {
    required: true,
    label: 'CPU Architecture',
    description: 'Supported CPU architectures (space-separated). noarch supports all platforms.',
    note: 'Use noarch for pure JS/PHP/Shell packages. Specify arch for compiled binaries.',
    example: 'noarch',
    validate: (v) => {
      for (const a of v.split(' ').filter(Boolean)) {
        if (!(ARCH_VALUES as readonly string[]).includes(a))
          return `Unknown arch value: "${a}". See Appendix A platform table.`;
      }
      return null;
    },
  },
  maintainer: {
    required: true,
    label: 'Maintainer',
    description: 'Developer/company name shown in Package Center.',
    example: 'Your Company Inc.',
    validate: (v) => !v.trim() ? 'Cannot be empty' : null,
  },

  // ── Display ───────────────────────────────────────────────────────────────
  displayname:     { label: 'Display name',     description: 'Package name shown in Package Center. Falls back to `package` if omitted.', example: 'My Awesome App' },
  maintainer_url:  { label: 'Maintainer URL',   description: 'Developer homepage shown in Package Center.', example: 'https://www.example.com' },
  distributor:     { label: 'Distributor',       description: 'Distributor name.' },
  distributor_url: { label: 'Distributor URL',   description: 'Distributor homepage.' },
  support_url:     { label: 'Support URL',       description: 'Technical support page.' },
  helpurl:         { label: 'Help URL',          description: 'Package help documentation link.' },

  // ── Admin UI triple ───────────────────────────────────────────────────────
  adminport: {
    label: 'Admin port',
    description: 'Port the UI listens on. Combined with adminprotocol + adminurl to form the access link.',
    example: '8080',
    related: ['adminprotocol', 'adminurl'],
    validate: (v) => {
      const p = parseInt(v, 10);
      return isNaN(p) || p < 1 || p > 65535 ? 'Port must be 1–65535' : null;
    },
  },
  adminprotocol: {
    label: 'Admin protocol',
    description: 'Protocol for the admin UI access link.',
    enum: ['http', 'https'],
    default: 'http',
    related: ['adminport', 'adminurl'],
  },
  adminurl: {
    label: 'Admin URL path',
    description: 'URL path for the admin UI access link.',
    example: '/',
    related: ['adminprotocol', 'adminport'],
  },
  checkport: {
    label: 'Check port conflict',
    description: 'Check if adminport conflicts with DSM reserved ports (excludes 80/443/5000/5001).',
    enum: ['yes', 'no'],
    default: 'yes',
  },

  // ── DSM Desktop integration chain ─────────────────────────────────────────
  dsmuidir: {
    label: 'UI directory',
    description: 'Path to UI folder inside package.tgz. DSM creates a symlink in /usr/syno/synoman/webman/3rdparty/.',
    example: 'ui',
    related: ['dsmappname', 'dsmapppage'],
  },
  dsmappname: {
    label: 'App name',
    description: 'Desktop app unique identifier. Must match key in app.config.',
    example: 'com.company.MyApp',
    related: ['dsmuidir', 'dsmapppage'],
  },
  dsmapppage: {
    label: 'App page',
    description: 'Page to open when clicking "Open" button (PageListAppWindow fn value).',
    dsm_min: '7.0-40332',
    related: ['dsmappname'],
  },
  dsmapplaunchname: {
    label: 'Launch app name',
    description: 'App launch name; takes precedence over dsmappname.',
    dsm_min: '7.0-40796',
  },

  // ── Lifecycle control ─────────────────────────────────────────────────────
  ctl_stop:          { label: 'Allow stop',        description: 'Set to no to prevent manual start/stop in Package Center.', enum: ['yes', 'no'], default: 'yes', dsm_min: '6.1-14907' },
  ctl_uninstall:     { label: 'Allow uninstall',   description: 'Set to no to prevent uninstall from Package Center.', enum: ['yes', 'no'], default: 'yes', dsm_min: '6.1-14907' },
  precheckstartstop: { label: 'Pre-check start/stop', description: 'Call prestart/prestop branches before start/stop. Also called on boot in DSM 7.0.', enum: ['yes', 'no'], default: 'yes' },
  startable:         { label: 'Startable (deprecated)', description: 'Deprecated since DSM 6.1-14907. Use ctl_stop instead.', enum: ['yes', 'no'], deprecated: true, replacement: 'ctl_stop' },

  // ── Installation behaviour ────────────────────────────────────────────────
  install_reboot:           { label: 'Reboot after install', description: 'Reboot NAS after install/upgrade.', enum: ['yes', 'no'], default: 'no' },
  install_type:             { label: 'Install location', description: 'Set to system to install on root partition (limited space).', enum: ['system', 'system_hidden', ''], warn: 'Root partition has limited space; use install_type=system carefully.' },
  install_on_cold_storage:  { label: 'Cold storage install', description: 'Allow installation on cold-storage devices.', enum: ['yes', 'no'], default: 'no', dsm_min: '7.0-40726' },
  support_move:             { label: 'Support move', description: 'Allow moving the package to another volume after install.', enum: ['yes', 'no'], default: 'no', dsm_min: '6.2-22306' },
  silent_install:           { label: 'Silent install', description: 'Allow install without wizard (required for CMS batch deployment).', enum: ['yes', 'no'], default: 'no' },
  silent_upgrade:           { label: 'Silent upgrade', description: 'Allow automatic silent upgrade (use with auto_upgrade_from).', enum: ['yes', 'no'], default: 'no' },
  silent_uninstall:         { label: 'Silent uninstall', description: 'Allow uninstall without wizard.', enum: ['yes', 'no'], default: 'no' },
  auto_upgrade_from:        { label: 'Auto upgrade from', description: 'Only auto-upgrade from this version and above (with silent_upgrade=yes).', dsm_min: '5.2-5565', related: ['silent_upgrade'] },
  os_max_ver:               { label: 'Max DSM version', description: 'Package is not shown in Package Center above this DSM version.', example: '7.2-64570' },

  // ── Dependencies ──────────────────────────────────────────────────────────
  install_dep_packages:             { label: 'Dependency packages',   description: 'Packages that must be installed first (colon-separated, optional version constraints).', example: 'Node.js>18.0:PHP', related: ['install_conflict_packages'] },
  install_conflict_packages:        { label: 'Conflict packages',     description: 'Packages that must NOT be installed (conflicts).' },
  install_break_packages:           { label: 'Break packages',        description: 'Packages that will be stopped after this package installs.', dsm_min: '6.1-15117' },
  install_replace_packages:         { label: 'Replace packages',      description: 'Old packages that this package replaces (will be deleted).', dsm_min: '6.1-15117', related: ['use_deprecated_replace_mechanism'] },
  install_dep_services:             { label: 'Dependency services',   description: 'DSM system services required (space-separated). DSM 7.0 options: ssh-shell, pgsql, nginx.service, avahi.service...', example: 'ssh-shell' },
  start_dep_services:               { label: 'Start dependency services', description: 'DSM system services that must be running before this package starts.' },
  use_deprecated_replace_mechanism: { label: 'Use deprecated replace', description: 'Use old replace order (install new first, then uninstall old). Skips prereplace/postreplace.', enum: ['yes', 'no'], default: 'no', dsm_min: '7.0-40340', related: ['install_replace_packages'] },

  // ── Misc ─────────────────────────────────────────────────────────────────
  beta:            { label: 'Beta',           description: 'Mark as beta version.',                         enum: ['yes', 'no'], default: 'no' },
  report_url:      { label: 'Report URL',     description: 'Bug report link for beta packages.',            related: ['beta'] },
  offline_install: { label: 'Offline install', description: 'Hidden from official Package Center; manual install only.', enum: ['yes', 'no'], default: 'no', dsm_min: '6.0' },
  checksum:        { label: 'Checksum',       description: 'MD5 checksum of package.tgz.' },
  extractsize:     { label: 'Extract size',   description: 'Minimum disk space required in KB (DSM 6.0+).' },
};