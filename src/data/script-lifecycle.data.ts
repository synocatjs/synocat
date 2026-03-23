export type LifecyclePhase = 'install' | 'upgrade' | 'uninstall' | 'start' | 'stop';

export const SCRIPT_LIFECYCLE: Readonly<Record<LifecyclePhase, readonly string[]>> = {
  install:   ['prereplace?', 'preinst', 'postinst', 'postreplace?', 'prestart?', 'start?'],
  upgrade:   ['prestop(old)', 'stop(old)', 'preupgrade', 'preuninst(old)', 'postuninst(old)',
              'prereplace?', 'preinst', 'postinst', 'postreplace?', 'postupgrade', 'prestart?', 'start?'],
  uninstall: ['prestop?', 'stop?', 'preuninst', 'postuninst'],
  start:     ['prestart', 'start'],
  stop:      ['prestop', 'stop'],
};

export const SCRIPT_COMMENTS: Readonly<Record<string, string>> = {
  preinst:     'Pre-install check. Non-zero return aborts install; package.tgz will not be extracted.',
  postinst:    'Post-install init (e.g. create config, init DB). Non-zero puts package in corrupted state.',
  preuninst:   'Pre-uninstall check. Non-zero aborts uninstall. Do not create side effects here.',
  postuninst:  'Post-uninstall cleanup (e.g. remove leftover files, clean DB).',
  preupgrade:  'Pre-upgrade check (new version script). Non-zero aborts upgrade.',
  postupgrade: 'Post-upgrade init (new version script). Non-zero puts package in corrupted state.',
  prereplace:  'Pre-replace data migration (used with install_replace_packages).',
  postreplace: 'Post-replace data migration.',
};

export const DSM7_SERVICES = [
  'ssh-shell', 'pgsql', 'network.target', 'network-online.target',
  'nginx.service', 'avahi.service', 'atalk.service', 'crond.service', 'nfsserver.service',
] as const;