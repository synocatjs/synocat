import type { PrivilegeConfig } from '../../types/';

/** Pure function — returns the contents of conf/privilege as a JSON string. */
export function generatePrivilege(): string {
  const config: PrivilegeConfig = {
    defaults: { 'run-as': 'package' },
  };
  return JSON.stringify(config, null, 2) + '\n';
}