import path from 'node:path';
import chalk from 'chalk';
import fsExtra from 'fs-extra';
// import os from 'node:os';
import { getAvailablePlatforms, resolvePkgScriptsNg } from './compile.command';

export interface ListOptions {
  pkgscriptNg?: string;
  projectDir?: string;
}

/**
 * 列出可用的编译平台
 */
export async function listPlatforms(pkgScriptPath?: string): Promise<void> {
  console.log(chalk.cyan('\n📦 Available Build Platforms\n'));
  
  const platforms = await getAvailablePlatforms(pkgScriptPath);
  
  if (platforms.size === 0) {
    console.log(chalk.yellow('No build environments found.'));
    console.log(chalk.gray('\n💡 To set up build environments:'));
    console.log(chalk.gray('  cd /path/to/pkgscripts-ng'));
    console.log(chalk.gray('  sudo ./EnvDeploy -v 7.2 -p r1000'));
    console.log(chalk.gray('  sudo ./EnvDeploy -v 7.2 -p braswell'));
    return;
  }
  
  const sortedPlatforms = Array.from(platforms.keys()).sort();
  
  for (const platform of sortedPlatforms) {
    const versions = platforms.get(platform)!.sort();
    console.log(chalk.green(`  ${platform}:`));
    for (const version of versions) {
      console.log(chalk.gray(`    - DSM ${version}`));
    }
  }
  
  console.log(chalk.gray('\n📋 Usage:'));
  console.log(chalk.gray('  synocat compile . -p <platform> -d <version>'));
  console.log(chalk.gray('  Example: synocat compile . -p r1000 -d 7.2'));
  console.log('');
}

/**
 * 列出可用的架构 (arch)
 */
export async function listArch(): Promise<void> {
  console.log(chalk.cyan('\n🏗️  Supported Architectures (arch)\n'));
  
  const archList = [
    { arch: 'x86_64', description: '64-bit x86 (most modern Intel/AMD CPUs)', platforms: ['r1000', 'braswell', 'apollolake', 'denverton', 'broadwell', 'purley', 'v1000', 'epyc7002'] },
    { arch: 'i686', description: '32-bit x86 (older Intel/AMD CPUs)', platforms: ['evansport'] },
    { arch: 'armv7', description: '32-bit ARM (older ARM devices)', platforms: ['alpine', 'alpine4k'] },
    { arch: 'armv8', description: '64-bit ARM (modern ARM devices)', platforms: ['rtd1296', 'armada37xx', 'rtd1619b'] },
    { arch: 'noarch', description: 'Platform-independent (scripts only, no binaries)', platforms: [] },
  ];
  
  for (const item of archList) {
    console.log(chalk.green(`  ${item.arch}`));
    console.log(chalk.gray(`    ${item.description}`));
    if (item.platforms.length > 0) {
      console.log(chalk.gray(`    Platforms: ${item.platforms.join(', ')}`));
    }
    console.log('');
  }
  
  console.log(chalk.gray('📋 In INFO.sh, set: arch="x86_64" or arch="noarch"'));
  console.log('');
}

/**
 * 列出可用的模板
 */
export async function listTemplates(): Promise<void> {
  console.log(chalk.cyan('\n🎨 Available Package Templates\n'));
  
  const templates = [
    { name: 'minimal', description: 'Pure shell package, works on all platforms (noarch)', features: ['No compilation', 'Pure shell scripts'] },
    { name: 'node-service', description: 'Node.js backend service with start/stop scripts', features: ['Node.js runtime', 'Background service'] },
    { name: 'vue-desktop', description: 'Vue.js DSM desktop application', features: ['Vue 2.x', 'Webpack build', 'DSM UI integration'] },
    { name: 'docker', description: 'Docker Compose package via ContainerManager (DSM 7.2.1+)', features: ['Docker Compose', 'Container integration'] },
  ];
  
  for (const tpl of templates) {
    console.log(chalk.green(`  ${tpl.name}`));
    console.log(chalk.gray(`    ${tpl.description}`));
    console.log(chalk.gray(`    Features: ${tpl.features.join(', ')}`));
    console.log('');
  }
  
  console.log(chalk.gray('📋 Usage: synocat create my-app -t <template>'));
  console.log('');
}

/**
 * 列出可用的资源类型
 */
export async function listResources(): Promise<void> {
  console.log(chalk.cyan('\n🔧 Available Resource Types\n'));
  
  const resources = [
    { name: 'port', description: 'Register firewall ports', config: 'port-config', example: 'synocat add resource port' },
    { name: 'data-share', description: 'Request shared folder access permissions', config: 'data-share', example: 'synocat add resource data-share' },
    { name: 'mariadb', description: 'Auto-manage MariaDB 10 database', config: 'mariadb10-db', example: 'synocat add resource mariadb' },
    { name: 'docker', description: 'Manage Docker Compose projects', config: 'docker-project', example: 'synocat add resource docker' },
    { name: 'port+share', description: 'Combined port and share resources', config: 'both', example: 'synocat add resource port+share' },
  ];
  
  for (const res of resources) {
    console.log(chalk.green(`  ${res.name}`));
    console.log(chalk.gray(`    ${res.description}`));
    console.log(chalk.gray(`    Example: ${res.example}`));
    console.log('');
  }
  
  console.log(chalk.gray('📋 Resources are configured in conf/resource file'));
  console.log('');
}

/**
 * 列出可用的包路径
 */
export async function listPackages(options: ListOptions = {}): Promise<void> {
  console.log(chalk.cyan('\n📁 Available Packages\n'));
  
  const pkgScriptPath = await resolvePkgScriptsNg(options.pkgscriptNg, options.projectDir);
  
  if (!pkgScriptPath) {
    console.log(chalk.yellow('pkgscripts-ng directory not found.'));
    console.log(chalk.gray('Run "synocat config set pkgscriptsNg /path/to/pkgscripts-ng --global" to set it.'));
    return;
  }
  
  const toolkitRoot = path.dirname(pkgScriptPath);
  const sourceDir = path.join(toolkitRoot, 'source');
  
  if (!await fsExtra.pathExists(sourceDir)) {
    console.log(chalk.yellow('No packages found. Source directory does not exist.'));
    return;
  }
  
  const packages = await fsExtra.readdir(sourceDir);
  const validPackages: Array<{ name: string; path: string; hasInfo: boolean; hasBuild: boolean }> = [];
  
  for (const pkg of packages) {
    const pkgPath = path.join(sourceDir, pkg);
    const stat = await fsExtra.stat(pkgPath);
    if (stat.isDirectory()) {
      const hasInfo = await fsExtra.pathExists(path.join(pkgPath, 'INFO.sh'));
      const hasBuild = await fsExtra.pathExists(path.join(pkgPath, 'SynoBuildConf', 'build'));
      validPackages.push({
        name: pkg,
        path: pkgPath,
        hasInfo,
        hasBuild,
      });
    }
  }
  
  if (validPackages.length === 0) {
    console.log(chalk.yellow('No packages found in source directory.'));
    console.log(chalk.gray(`  Location: ${sourceDir}`));
    return;
  }
  
  console.log(chalk.gray(`  Source directory: ${sourceDir}\n`));
  
  for (const pkg of validPackages.sort((a, b) => a.name.localeCompare(b.name))) {
    const status = [];
    if (pkg.hasInfo) status.push(chalk.green('✓ INFO.sh'));
    else status.push(chalk.red('✗ INFO.sh'));
    if (pkg.hasBuild) status.push(chalk.green('✓ build'));
    else status.push(chalk.red('✗ build'));
    
    console.log(chalk.green(`  ${pkg.name}`));
    console.log(chalk.gray(`    Path: ${pkg.path}`));
    console.log(chalk.gray(`    Status: ${status.join(' | ')}`));
    console.log('');
  }
  
  console.log(chalk.gray('📋 To compile a package:'));
  console.log(chalk.gray('  snc compile ./<package-name>'));
  console.log('');
}

/**
 * 列出所有信息
 */
export async function listAll(options: ListOptions = {}): Promise<void> {
  await listTemplates();
  await listArch();
  await listResources();
  await listPlatforms(options.pkgscriptNg);
  await listPackages(options);
}

/**
 * 主 list 命令入口
 */
export async function listCommand(
  type?: string,
  options: ListOptions = {},
): Promise<void> {
  switch (type) {
    case 'platforms':
    case 'platform':
      await listPlatforms(options.pkgscriptNg);
      break;
    case 'arch':
    case 'architectures':
      await listArch();
      break;
    case 'templates':
    case 'template':
      await listTemplates();
      break;
    case 'resources':
    case 'resource':
      await listResources();
      break;
    case 'packages':
    case 'package':
      await listPackages(options);
      break;
    case 'all':
      await listAll(options);
      break;
    default:
      // 默认显示所有信息
      await listAll(options);
  }
}