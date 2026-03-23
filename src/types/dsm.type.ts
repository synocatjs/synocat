// ─── Primitive DSM value types ───────────────────────────────────────────────

export type YesNo           = 'yes' | 'no';
export type AdminProtocol   = 'http' | 'https';
export type RunAs           = 'package';          // DSM 7.0+ only value
export type InstallType     = 'system' | 'system_hidden' | '';
export type PortProtocol    = 'tcp' | 'udp' | 'both';

// ─── INFO file types ─────────────────────────────────────────────────────────

/** Fields that MUST be present for a valid package */
export interface InfoRequired {
  package:     string;
  version:     string;
  os_min_ver:  string;
  description: string;
  arch:        string;   // space-separated; validated at runtime
  maintainer:  string;
}

/** All optional INFO fields */
export interface InfoOptional {
  displayname?:       string;
  maintainer_url?:    string;
  distributor?:       string;
  distributor_url?:   string;
  support_url?:       string;
  helpurl?:           string;

  // Admin UI triple
  adminport?:         string;
  adminprotocol?:     AdminProtocol;
  adminurl?:          string;
  checkport?:         YesNo;

  // DSM Desktop integration chain
  dsmuidir?:          string;
  dsmappname?:        string;
  dsmapppage?:        string;
  dsmapplaunchname?:  string;

  // Lifecycle control
  ctl_stop?:          YesNo;
  ctl_uninstall?:     YesNo;
  precheckstartstop?: YesNo;
  startable?:         YesNo;   // deprecated

  // Installation behaviour
  install_reboot?:            YesNo;
  install_type?:              InstallType;
  install_on_cold_storage?:   YesNo;
  support_move?:              YesNo;
  silent_install?:            YesNo;
  silent_upgrade?:            YesNo;
  silent_uninstall?:          YesNo;
  auto_upgrade_from?:         string;
  os_max_ver?:                string;

  // Dependencies / conflicts
  install_dep_packages?:      string;
  install_conflict_packages?: string;
  install_break_packages?:    string;
  install_replace_packages?:  string;
  install_dep_services?:      string;
  start_dep_services?:        string;
  use_deprecated_replace_mechanism?: YesNo;

  // Misc
  beta?:         YesNo;
  report_url?:   string;
  offline_install?: YesNo;
  checksum?:     string;
  extractsize?:  string;
}

export type InfoConfig = InfoRequired & InfoOptional;

/** A key→value map parsed directly from an INFO file */
export type ParsedInfo = Partial<Record<string, string>>;

// ─── conf/privilege ──────────────────────────────────────────────────────────

export interface PrivilegeConfig {
  defaults: {
    'run-as': RunAs;
  };
}

// ─── conf/resource ───────────────────────────────────────────────────────────

export interface PortEntry {
  protocol: Exclude<PortProtocol, 'both'>;
  src: number;
  dst: number;
}

export interface PortConfig {
  protocol_type: PortProtocol;
  ports: Record<string, PortEntry>;
}

export interface SharePermission {
  ro?: string[];
  rw?: string[];
}

export interface ShareEntry {
  name: string;
  permission?: SharePermission;
}

export interface DataShareConfig {
  shares: ShareEntry[];
}

export interface MariaDbConfig {
  'admin-account-m10': string;
  'admin-pw-m10':      string;
  'create-db': {
    flag:           boolean;
    'db-name':      string;
    'db-collision': 'skip' | 'fail';
  };
  'grant-user': {
    flag:        boolean;
    'db-name':   string;
    'user-name': string;
    host:        string;
    'user-pw':   string;
  };
  'drop-db-uninst':   boolean;
  'drop-user-uninst': boolean;
}

export interface DockerProjectEntry {
  name: string;
  path: string;
}

export interface DockerProjectConfig {
  projects: DockerProjectEntry[];
}

export interface ResourceConfig {
  'port-config'?:    PortConfig;
  'data-share'?:     DataShareConfig;
  'mariadb10-db'?:   MariaDbConfig;
  'docker-project'?: DockerProjectConfig;
  'web-service'?:    Record<string, unknown>;
  'indexdb'?:        Record<string, unknown>;
  'systemd-user-unit'?: Record<string, unknown>;
}