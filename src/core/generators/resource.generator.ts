import type { ResourceConfig, PortConfig, DataShareConfig, MariaDbConfig, DockerProjectConfig } from '../../types';
import type { ResourceShorthand, ResourceOptions } from '../../types/';

/** Pure function — returns conf/resource JSON string for a given shorthand type. */
export function generateResource(type: ResourceShorthand, opts: ResourceOptions = {}): string {
  const resource: ResourceConfig = {};
  const pkg = opts.package ?? 'mypkg';

  if (type === 'port' || type === 'port+share') {
    const portCfg: PortConfig = {
      protocol_type: 'both',
      ports: {
        main: { protocol: 'tcp', src: opts.port ?? 8080, dst: opts.port ?? 8080 },
      },
    };
    resource['port-config'] = portCfg;
  }

  if (type === 'data-share' || type === 'port+share') {
    const shareCfg: DataShareConfig = {
      shares: [
        {
          name: opts.shareName ?? `${pkg}-data`,
          permission: { rw: [`sc-${pkg}`] },
        },
      ],
    };
    resource['data-share'] = shareCfg;
  }

  if (type === 'mariadb') {
    const dbCfg: MariaDbConfig = {
      'admin-account-m10': 'root',
      'admin-pw-m10':      '{{WIZARD_MARIADB_ADMIN_PASSWORD}}',
      'create-db': {
        flag:           true,
        'db-name':      `${pkg}_db`,
        'db-collision': 'skip',
      },
      'grant-user': {
        flag:        true,
        'db-name':   `${pkg}_db`,
        'user-name': `${pkg}_user`,
        host:        'localhost',
        'user-pw':   '{{WIZARD_DB_PASSWORD}}',
      },
      'drop-db-uninst':   false,
      'drop-user-uninst': false,
    };
    resource['mariadb10-db'] = dbCfg;
  }

  if (type === 'docker') {
    const dockerCfg: DockerProjectConfig = {
      projects: [{ name: pkg, path: 'compose' }],
    };
    resource['docker-project'] = dockerCfg;
  }

  return JSON.stringify(resource, null, 2) + '\n';
}