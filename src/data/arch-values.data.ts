/** All valid arch values from DSM Appendix A */
export const ARCH_VALUES = [
  'noarch',
  // x86_64 family
  'x86_64', 'bromolow', 'cedarview', 'avoton', 'braswell', 'broadwell',
  'broadwellnk', 'broadwellntbap', 'denverton', 'geminilake', 'apollolake',
  'v1000', 'r1000', 'purley', 'epyc7002',
  // ARM 64-bit
  'armv8', 'alpine', 'alpine4k', 'rtd1296', 'rtd1619b',
  // ARM 32-bit
  'armv7', 'ipq806x', 'hi3535', 'dakota', 'armada37xx',
  // Other
  'ppc854x', 'qoriq',
] as const;

export type ArchValue = typeof ARCH_VALUES[number];

export const ARCH_GROUPS: Record<string, readonly ArchValue[]> = {
  'x86_64 Family': [
    'x86_64', 'bromolow', 'cedarview', 'avoton', 'braswell', 'broadwell',
    'broadwellnk', 'denverton', 'geminilake', 'apollolake', 'v1000', 'r1000',
  ],
  'ARM 64-bit': ['armv8', 'alpine', 'alpine4k', 'rtd1296', 'rtd1619b'],
  'ARM 32-bit': ['armv7', 'ipq806x', 'hi3535', 'dakota', 'armada37xx'],
};