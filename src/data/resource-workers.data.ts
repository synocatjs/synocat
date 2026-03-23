export interface ResourceWorkerMeta {
  readonly label:          string;
  readonly description:    string;
  readonly timing?:        string;
  readonly provider?:      string;
  readonly note?:          string;
  readonly requiredFields?: readonly string[];
}

export const RESOURCE_WORKERS: Readonly<Record<string, ResourceWorkerMeta>> = {
  'data-share': {
    label:          'Shared Folder',
    description:    'Request access to NAS shared folders.',
    timing:         'FROM_POSTINST_TO_PREUNINST',
    requiredFields: ['shares'],
  },
  'port-config': {
    label:       'Port Config',
    description: 'Register package ports in DSM firewall.',
    timing:      'FROM_POSTINST_TO_PREUNINST',
  },
  'web-service': {
    label:       'Web Service',
    description: 'Register HTTP/HTTPS routes to DSM nginx.',
    timing:      'FROM_POSTINST_TO_PREUNINST',
  },
  'docker': {
    label:       'Docker Container',
    description: 'Manage a single Docker container via ContainerManager.',
    timing:      'FROM_POSTINST_TO_PREUNINST / FROM_STARTUP_TO_HALT',
    provider:    'ContainerManager',
  },
  'docker-project': {
    label:       'Docker Compose Project',
    description: 'Manage a multi-container Compose project via ContainerManager.',
    timing:      'FROM_POSTINST_TO_PREUNINST / FROM_STARTUP_TO_HALT',
    provider:    'ContainerManager >= 1432 (DSM 7.2.1+)',
    note:        'Requires ContainerManager on DSM 7.2.1+',
  },
  'mariadb10-db': {
    label:          'MariaDB 10',
    description:    'Auto-create/drop a MariaDB database and user on install/uninstall.',
    timing:         'FROM_PREINST_TO_PREUNINST / FROM_POSTINST_TO_POSTUNINST',
    provider:       'MariaDB10 package',
    requiredFields: ['admin-account-m10'],
  },
  'indexdb': {
    label:       'Index DB',
    description: 'Register desktop app and help doc indexes.',
    timing:      'FROM_ENABLE_TO_DISABLE',
  },
  'systemd-user-unit': {
    label:       'Systemd User Unit',
    description: 'Manage systemd user-level service units.',
    timing:      'FROM_STARTUP_TO_HALT',
    note:        'Requires DSM 7.0+',
  },
};