// src/commands/set.command.ts
import chalk from 'chalk';
import os from 'node:os';
import path from 'node:path';
import fsExtra from 'fs-extra';

interface GlobalConfig {
  pkgscriptsNg?: string;
  defaultPlatform?: string;
  defaultDsmVersion?: string;
}

function getConfigPath(): string {
  return path.join(os.homedir(), '.synocat', 'config.json');
}

async function readGlobalConfig(): Promise<GlobalConfig> {
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

async function writeGlobalConfig(config: GlobalConfig): Promise<void> {
  const configPath = getConfigPath();
  await fsExtra.ensureDir(path.dirname(configPath));
  await fsExtra.writeJSON(configPath, config, { spaces: 2 });
}

async function updateShellConfig(key: string, value: string): Promise<void> {
  const shell = process.env.SHELL || '/bin/bash';
  const isZsh = shell.includes('zsh');
  const rcFile = isZsh 
    ? path.join(os.homedir(), '.zshrc')
    : path.join(os.homedir(), '.bashrc');
  
  const exportLine = `export ${key}="${value}"`;
  const comment = `# Added by synocat config set command`;
  
  let content = '';
  if (await fsExtra.pathExists(rcFile)) {
    content = await fsExtra.readFile(rcFile, 'utf-8');
  }
  
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

function getEnvKey(key: string): string {
  const envMap: Record<string, string> = {
    pkgscriptsNg: 'SYNOLOGY_PKGSCRIPTS_NG',
    defaultPlatform: 'SYNOCAT_DEFAULT_PLATFORM',
    defaultDsmVersion: 'SYNOCAT_DEFAULT_DSM_VERSION',
  };
  return envMap[key] || `SYNOCAT_${key.toUpperCase()}`;
}

export async function getCommand(key: string): Promise<void> {
  const validKeys = ['pkgscriptsNg', 'defaultPlatform', 'defaultDsmVersion'];
  
  if (!validKeys.includes(key)) {
    console.error(chalk.red(`Invalid key: ${key}`));
    console.log(chalk.yellow(`Valid keys: ${validKeys.join(', ')}`));
    process.exitCode = 1;
    return;
  }
  
  // 1. 检查环境变量
  const envKey = getEnvKey(key);
  const envValue = process.env[envKey];
  if (envValue) {
    console.log(chalk.cyan(`${key} = ${envValue} (from environment variable ${envKey})`));
    return;
  }
  
  // 2. 检查全局配置文件
  const config = await readGlobalConfig();
  const configValue = config[key as keyof GlobalConfig];
  if (configValue) {
    console.log(chalk.cyan(`${key} = ${configValue} (from ~/.synocat/config.json)`));
    return;
  }
  
  console.log(chalk.yellow(`${key} is not set`));
}

export async function setCommand(
  key: string, 
  value: string, 
  opts: { global?: boolean; env?: boolean }
): Promise<void> {
  const validKeys = ['pkgscriptsNg', 'defaultPlatform', 'defaultDsmVersion'];
  
  if (!validKeys.includes(key)) {
    console.error(chalk.red(`Invalid key: ${key}`));
    console.log(chalk.yellow(`Valid keys: ${validKeys.join(', ')}`));
    process.exitCode = 1;
    return;
  }
  
  if (opts.env) {
    const envKey = getEnvKey(key);
    await updateShellConfig(envKey, value);
    console.log(chalk.green(`✓ Environment variable ${envKey} set to: ${value}`));
  } else if (opts.global) {
    const config = await readGlobalConfig();
    config[key as keyof GlobalConfig] = value;
    await writeGlobalConfig(config);
    console.log(chalk.green(`✓ Global config saved: ${key} = ${value}`));
    console.log(chalk.gray(`  Config file: ${getConfigPath()}`));
  } else {
    console.error(chalk.red('Error: Please specify either --global or --env'));
    console.log(chalk.gray('  --global: Save to ~/.synocat/config.json'));
    console.log(chalk.gray('  --env:    Add to .bashrc/.zshrc as environment variable'));
    process.exitCode = 1;
  }
}

export async function unsetCommand(key: string): Promise<void> {
  const validKeys = ['pkgscriptsNg', 'defaultPlatform', 'defaultDsmVersion'];
  
  if (!validKeys.includes(key)) {
    console.error(chalk.red(`Invalid key: ${key}`));
    console.log(chalk.yellow(`Valid keys: ${validKeys.join(', ')}`));
    process.exitCode = 1;
    return;
  }
  
  const config = await readGlobalConfig();
  delete config[key as keyof GlobalConfig];
  await writeGlobalConfig(config);
  console.log(chalk.green(`✓ Removed ${key} from config`));
  
  // 提示环境变量需要手动删除
  const envKey = getEnvKey(key);
  console.log(chalk.yellow(`Note: Environment variable ${envKey} (if set) needs to be removed manually from your shell config`));
}

export async function listCommand(): Promise<void> {
  console.log(chalk.cyan('\n📋 Current configuration:\n'));
  
  // 显示环境变量
  const envKeys = ['SYNOLOGY_PKGSCRIPTS_NG', 'SYNOCAT_DEFAULT_PLATFORM', 'SYNOCAT_DEFAULT_DSM_VERSION'];
  let hasEnv = false;
  for (const envKey of envKeys) {
    const value = process.env[envKey];
    if (value) {
      console.log(chalk.gray(`  ${envKey}: ${chalk.white(value)} ${chalk.gray('(from environment)')}`));
      hasEnv = true;
    }
  }
  if (hasEnv) console.log('');
  
  // 显示全局配置
  const config = await readGlobalConfig();
  if (Object.keys(config).length === 0 && !hasEnv) {
    console.log(chalk.gray('  No configuration set'));
  } else {
    for (const [k, v] of Object.entries(config)) {
      console.log(chalk.gray(`  ${k}: ${chalk.white(v)} ${chalk.gray('(from ~/.synocat/config.json)')}`));
    }
  }
  console.log('');
}