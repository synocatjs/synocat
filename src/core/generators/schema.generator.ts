/** Pure function — returns the JSON Schema for conf/resource (IDE autocompletion). */
export function generateResourceSchema(): object {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Synology DSM 7 conf/resource',
    description: 'Resource worker configuration for Synology packages (DSM 7.2.2)',
    type: 'object',
    additionalProperties: false,
    properties: {
      'data-share': {
        type: 'object',
        description: 'Request shared folder access permissions',
        required: ['shares'],
        properties: {
          shares: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', description: 'Shared folder name' },
                permission: {
                  type: 'object',
                  properties: {
                    ro: { type: 'array', items: { type: 'string' }, description: 'Read-only user list' },
                    rw: { type: 'array', items: { type: 'string' }, description: 'Read-write user list' },
                  },
                },
              },
            },
          },
        },
      },
      'port-config': {
        type: 'object',
        description: 'Register firewall ports',
        properties: {
          protocol_type: { type: 'string', enum: ['tcp', 'udp', 'both'] },
          ports: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              required: ['protocol', 'src', 'dst'],
              properties: {
                protocol: { type: 'string', enum: ['tcp', 'udp'] },
                src:      { type: 'integer', minimum: 1, maximum: 65535 },
                dst:      { type: 'integer', minimum: 1, maximum: 65535 },
              },
            },
          },
        },
      },
      'docker-project': {
        type: 'object',
        description: 'Manage Docker Compose projects via ContainerManager (DSM 7.2.1+)',
        properties: {
          projects: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'path'],
              properties: {
                name: { type: 'string' },
                path: { type: 'string', description: 'Path to compose directory inside package.tgz' },
              },
            },
          },
        },
      },
      'mariadb10-db': {
        type: 'object',
        description: 'Auto-manage MariaDB 10 database on install/uninstall',
        required: ['admin-account-m10'],
        properties: {
          'admin-account-m10': { type: 'string' },
          'admin-pw-m10':      { type: 'string' },
          'create-db': {
            type: 'object',
            properties: {
              flag:           { type: 'boolean' },
              'db-name':      { type: 'string' },
              'db-collision': { type: 'string', enum: ['skip', 'fail'] },
            },
          },
          'grant-user': {
            type: 'object',
            properties: {
              flag:        { type: 'boolean' },
              'db-name':   { type: 'string' },
              'user-name': { type: 'string' },
              host:        { type: 'string' },
              'user-pw':   { type: 'string' },
            },
          },
          'drop-db-uninst':   { type: 'boolean' },
          'drop-user-uninst': { type: 'boolean' },
        },
      },
    },
  };
}

/** Returns VSCode workspace settings to wire up the JSON Schema. */
export function generateVSCodeSettings(): object {
  return {
    'json.schemas': [
      {
        fileMatch: ['**/conf/resource'],
        url: './.synocat/schemas/resource.schema.json',
      },
    ],
    'editor.formatOnSave': true,
  };
}