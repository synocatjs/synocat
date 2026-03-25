	import os from 'node:os';
import fsExtra from 'fs-extra';
import path from 'node:path';
import chalk from 'chalk';
// ── 配置管理 ───────────────────────────────────────────────────────────────────

interface GlobalConfig {
  pkgscriptsNg?: string;
  defaultPlatform?: string;
  defaultDsmVersion?: string;
}

export function getConfigPath(): string {
  return path.join(os.homedir(), '.synocat', 'config.json');
}

export async function readGlobalConfig(): Promise<GlobalConfig> {
  const configPath = getConfigPath();
  if (await fsExtra.pathExists(configPath)) {
    try {
      return await fsExtra.readJSON(configPath);
    } catch {
      return {};
    }
  }
  return {};
}

export async function writeGlobalConfig(config: GlobalConfig): Promise<void> {
  const configPath = getConfigPath();
  await fsExtra.ensureDir(path.dirname(configPath));
  await fsExtra.writeJSON(configPath, config, { spaces: 2 });
}

export async function updateShellConfig(key: string, value: string): Promise<void> {
  const shell = process.env.SHELL || '/bin/bash';
  const isZsh = shell.includes('zsh');
  const rcFile = isZsh 
    ? path.join(os.homedir(), '.zshrc')
    : path.join(os.homedir(), '.bashrc');
  
  const exportLine = `export ${key}="${value}"`;
  const comment = `# Added by synocat set command`;
  
  let content = '';
  if (await fsExtra.pathExists(rcFile)) {
    content = await fsExtra.readFile(rcFile, 'utf-8');
  }
  
  // 检查是否已存在
  const regex = new RegExp(`export ${key}=.*`);
  if (regex.test(content)) {
    content = content.replace(regex, exportLine);
  } else {
    content += `\n${comment}\n${exportLine}\n`;
  }
  
  await fsExtra.writeFile(rcFile, content);
  console.log(chalk.green(`✓ Added to ${rcFile}`));
  console.log(chalk.yellow(`  Run: source ${rcFile} or restart your terminal`));
}

// ── config 命令 ────────────────────────────────────────────────────────────────────

export async function setCommand(key: string, value: string, opts: { global?: boolean; env?: boolean }): Promise<void> {
  const validKeys = ['pkgscriptsNg', 'defaultPlatform', 'defaultDsmVersion'];
  
  if (!validKeys.includes(key)) {
    console.error(chalk.red(`Invalid key: ${key}`));
    console.log(chalk.yellow(`Valid keys: ${validKeys.join(', ')}`));
    process.exitCode = 1;
    return;
  }
  
  if (opts.env) {
    // 写入 shell 配置文件
    const envKey = key === 'pkgscriptsNg' ? 'SYNOLOGY_PKGSCRIPTS_NG' : `SYNOCAT_${key.toUpperCase()}`;
    await updateShellConfig(envKey, value);
    console.log(chalk.green(`✓ Environment variable ${envKey} set to: ${value}`));
  } else if (opts.global) {
    // 写入全局配置文件
    const config = await readGlobalConfig();
    config[key as keyof GlobalConfig] = value;
    await writeGlobalConfig(config);
    console.log(chalk.green(`✓ Global config saved: ${key} = ${value}`));
    console.log(chalk.gray(`  Config file: ${getConfigPath()}`));
  } else {
    // 显示当前值
    const config = await readGlobalConfig();
    const current = config[key as keyof GlobalConfig];
    if (current) {
      console.log(chalk.cyan(`${key} = ${current}`));
    } else {
      console.log(chalk.yellow(`${key} is not set`));
    }
  }
}

export async function getCommand(key: string): Promise<void> {
  const validKeys = ['pkgscriptsNg', 'defaultPlatform', 'defaultDsmVersion'];
  
  if (!validKeys.includes(key)) {
    console.error(chalk.red(`Invalid key: ${key}`));
    console.log(chalk.yellow(`Valid keys: ${validKeys.join(', ')}`));
    process.exitCode = 1;
    return;
  }
  
  const config = await readGlobalConfig();
  const value = config[key as keyof GlobalConfig];
  
  if (value) {
    console.log(chalk.cyan(`${key} = ${value}`));
  } else {
    console.log(chalk.yellow(`${key} is not set`));
  }
}

export async function unsetCommand(key: string): Promise<void> {
  const validKeys = ['pkgscriptsNg', 'defaultPlatform', 'defaultDsmVersion'];
  
  if (!validKeys.includes(key)) {
    console.error(chalk.red(`Invalid key: ${key}`));
    process.exitCode = 1;
    return;
  }
  
  const config = await readGlobalConfig();
  delete config[key as keyof GlobalConfig];
  await writeGlobalConfig(config);
  console.log(chalk.green(`✓ Removed ${key} from config`));
}

export async function listCommand(): Promise<void> {
  const config = await readGlobalConfig();
  console.log(chalk.cyan('\n📋 Current configuration:\n'));
  
  if (Object.keys(config).length === 0) {
    console.log(chalk.gray('  No configuration set'));
  } else {
    for (const [key, value] of Object.entries(config)) {
      console.log(chalk.gray(`  ${key}: ${chalk.white(value)}`));
    }
  }
  console.log('');
}


