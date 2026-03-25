import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import chalk from 'chalk';
import ora from 'ora';
import fsExtra from 'fs-extra';
import os from 'node:os';

const execAsync = promisify(exec);

export interface CompileOptions {
  platform?:   string;
  dsmVersion?: string;
  pkgscriptNg?: string;
  clean?:      boolean;
  verbose?:    boolean;
}

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

async function resolvePkgScriptsNg(
  cmdPath?: string,
  projectPath?: string,
): Promise<string | null> {
  // 1. 命令行参数优先
  if (cmdPath) {
    const resolved = path.resolve(cmdPath);
    if (await fsExtra.pathExists(path.join(resolved, 'PkgCreate.py'))) {
      return resolved;
    }
  }
  
  // 2. 全局配置文件
  const config = await readGlobalConfig();
  if (config.pkgscriptsNg) {
    const resolved = path.resolve(config.pkgscriptsNg);
    if (await fsExtra.pathExists(path.join(resolved, 'PkgCreate.py'))) {
      return resolved;
    }
  }
  
  // 3. 环境变量
  const envPath = process.env.SYNOLOGY_PKGSCRIPTS_NG;
  if (envPath) {
    const resolved = path.resolve(envPath);
    if (await fsExtra.pathExists(path.join(resolved, 'PkgCreate.py'))) {
      return resolved;
    }
  }
  
  // 4. 从项目目录向上查找
  if (projectPath) {
    let current = path.resolve(projectPath);
    for (let i = 0; i < 5; i++) {
      const candidate = path.join(current, 'pkgscripts-ng');
      if (await fsExtra.pathExists(path.join(candidate, 'PkgCreate.py'))) {
        return candidate;
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  
  // 5. 常见默认位置
  const commonPaths = [
    '/opt/pkgscripts-ng',
    '/usr/local/pkgscripts-ng',
    path.join(os.homedir(), 'toolkit', 'pkgscripts-ng'),
    path.join(os.homedir(), 'Documents', 'toolkit', 'pkgscripts-ng'),
  ];
  
  for (const candidate of commonPaths) {
    if (await fsExtra.pathExists(path.join(candidate, 'PkgCreate.py'))) {
      return candidate;
    }
  }
  
  return null;
}

async function getPackageName(projectPath: string): Promise<string> {
  const infoPath = path.join(projectPath, 'INFO');
  if (await fsExtra.pathExists(infoPath)) {
    const content = await fsExtra.readFile(infoPath, 'utf-8');
    const match = content.match(/package="([^"]+)"/);
    if (match?.[1]) return match[1];
  }
  return path.basename(projectPath);
}

export async function compileCommand(
  projectDir: string,
  opts: CompileOptions = {},
): Promise<void> {
  console.log(chalk.cyan('\n🔨 Synology Package Compiler\n'));

  // 使用绝对路径
  const projectPath = path.resolve(projectDir);

  // ── 获取 pkgscripts-ng 路径（传入 projectPath 用于向上查找）─────────────────
  const pkgScriptPath = await resolvePkgScriptsNg(opts.pkgscriptNg, projectPath);

  if (!pkgScriptPath) {
    console.error(chalk.red('pkgscripts-ng directory not found.'));
    console.log(chalk.yellow('\n💡 To fix:'));
    console.log(chalk.gray('  1. Specify with --pkgscript-ng /path/to/pkgscripts-ng'));
    console.log(chalk.gray('  2. Set environment: export SYNOLOGY_PKGSCRIPTS_NG=/path/to/pkgscripts-ng'));
    console.log(chalk.gray('  3. Add to ~/.synocat/config.json: { "pkgscriptsNg": "/path/to/pkgscripts-ng" }'));
    console.log(chalk.gray('  4. Place pkgscripts-ng in common locations:'));
    console.log(chalk.gray('     - ~/toolkit/pkgscripts-ng'));
    console.log(chalk.gray('     - ~/Documents/toolkit/pkgscripts-ng'));
    process.exitCode = 1;
    return;
  }

  // ── Validation ─────────────────────────────────────────────────────────

  if (!await fsExtra.pathExists(projectPath)) {
    console.error(chalk.red(`Project directory not found: ${projectPath}`));
    process.exitCode = 1;
    return;
  }
  
  if (!await fsExtra.pathExists(path.join(projectPath, 'INFO.sh'))) {
    console.error(chalk.red(`INFO file not found in: ${projectPath}`));
    console.log(chalk.yellow('This does not look like a valid Synology package project'));
    process.exitCode = 1;
    return;
  }

  if (!await fsExtra.pathExists(path.join(projectPath, 'SynoBuildConf/build'))) {
    console.error(chalk.red(`build file not found in: ${projectPath}`));
    console.log(chalk.yellow('This does not look like a valid Synology package project'));
    process.exitCode = 1;
    return;
  }

   if (!await fsExtra.pathExists(path.join(projectPath, 'SynoBuildConf/install'))) {
    console.error(chalk.red(`build file not found in: ${projectPath}`));
    console.log(chalk.yellow('This does not look like a valid Synology package project'));
    process.exitCode = 1;
    return;
  }

  // ── 获取包名 ───────────────────────────────────────────────────────────────

  const packageName = await getPackageName(projectPath);
  console.log(chalk.gray(`📦 Package name: ${chalk.cyan(packageName)}`));

  // ── 准备 source 目录 ───────────────────────────────────────────────────────

  const toolkitRoot = path.dirname(pkgScriptPath);
  const sourceDir = path.join(toolkitRoot, 'source');
  const targetSourceDir = path.join(sourceDir, packageName);

  console.log(chalk.gray(`\n📁 Toolkit root: ${toolkitRoot}`));
  console.log(chalk.gray(`📁 Source directory: ${sourceDir}`));
  console.log(chalk.gray(`📁 Target: ${targetSourceDir}`));

  // 确保 source 目录存在
  await fsExtra.ensureDir(sourceDir);

  // 复制项目到 source 目录
  const spinner = ora(`Copying project to ${targetSourceDir}...`).start();
  
  try {
    // 如果目标已存在
    if (await fsExtra.pathExists(targetSourceDir)) {
      if (opts.clean) {
        spinner.text = `Removing existing ${targetSourceDir}...`;
        await fsExtra.remove(targetSourceDir);
        spinner.text = `Copying project to ${targetSourceDir}...`;
        await fsExtra.copy(projectPath, targetSourceDir);
        spinner.succeed(chalk.green(`✓ Project copied to ${targetSourceDir}`));
      } else {
        spinner.warn(chalk.yellow(`Directory ${targetSourceDir} already exists`));
        console.log(chalk.gray('  Use --clean to remove and re-copy'));
        // 继续使用现有目录
        spinner.succeed(chalk.green(`✓ Using existing directory: ${targetSourceDir}`));
      }
    } else {
      await fsExtra.copy(projectPath, targetSourceDir);
      spinner.succeed(chalk.green(`✓ Project copied to ${targetSourceDir}`));
    }
  } catch (err) {
    spinner.fail(chalk.red('Failed to copy project'));
    console.error(chalk.red(err instanceof Error ? err.message : String(err)));
    process.exitCode = 1;
    return;
  }

  // ── 确定平台和 DSM 版本 ────────────────────────────────────────────────────

  let platform = opts.platform ?? 'auto';
  let dsmVersion = opts.dsmVersion ?? 'auto';

  // 从全局配置读取默认值
  const config = await readGlobalConfig();
  if (platform === 'auto' && config.defaultPlatform) {
    platform = config.defaultPlatform;
    console.log(chalk.gray(`🔍 Using default platform from config: ${platform}`));
  }
  if (dsmVersion === 'auto' && config.defaultDsmVersion) {
    dsmVersion = config.defaultDsmVersion;
    console.log(chalk.gray(`🔍 Using default DSM version from config: ${dsmVersion}`));
  }

  if (platform === 'auto') {
    platform = await detectPlatform(projectPath);
    if (platform !== 'auto') console.log(chalk.gray(`🔍 Auto-detected platform: ${platform}`));
  }
  if (dsmVersion === 'auto') {
    dsmVersion = await detectDsmVersion(projectPath);
    if (dsmVersion !== 'auto') console.log(chalk.gray(`🔍 Auto-detected DSM version: ${dsmVersion}`));
  }

  // ── Summary ─────────────────────────────────────────────────────────────

  console.log(chalk.gray('\n📋 Configuration:'));
  console.log(chalk.gray(`  pkgscripts-ng : ${pkgScriptPath}`));
  console.log(chalk.gray(`  project       : ${projectPath}`));
  console.log(chalk.gray(`  package name  : ${packageName}`));
  console.log(chalk.gray(`  platform      : ${platform === 'auto' ? '(default)' : platform}`));
  console.log(chalk.gray(`  DSM version   : ${dsmVersion === 'auto' ? '(default)' : dsmVersion}`));
  console.log(chalk.gray(`  clean build   : ${opts.clean ? 'yes' : 'no'}`));
  console.log(chalk.gray(`  verbose       : ${opts.verbose ? 'yes' : 'no'}`));
  console.log('');

  // ── 执行编译 ────────────────────────────────────────────────────────────────

  const compileSpinner = ora('Starting compilation...').start();

  try {
    // 构建命令
    let cmd = `sudo ./PkgCreate.py -v ${dsmVersion} -p ${platform} -c ${packageName}`;
    
    if (opts.verbose) {
      cmd += ` --verbose`;
    }

    compileSpinner.text = 'Running Synology compiler...';
    if (opts.verbose) console.log(chalk.gray(`\nExecuting: ${cmd}\n`));

    const { stdout, stderr } = await execAsync(cmd, {
      cwd: pkgScriptPath,
      maxBuffer: 1024 * 1024 * 10,
    });

    if (stdout) {
      if (opts.verbose) {
        process.stdout.write(stdout);
      } else {
        const important = stdout.split('\n').filter(
          (l) => /Building|Compiling|Success|Error|completed|failed/i.test(l),
        );
        important.forEach((l) => console.log(chalk.gray(l)));
      }
    }

    if (stderr?.trim()) {
      if (stderr.includes('warning') || stderr.includes('WARNING')) {
        compileSpinner.warn(chalk.yellow('Compilation completed with warnings'));
        console.error(chalk.yellow(stderr));
      } else {
        compileSpinner.fail(chalk.red('Compilation failed'));
        console.error(chalk.red(stderr));
        process.exitCode = 1;
        return;
      }
    }

    compileSpinner.succeed(chalk.green('✓ Compilation completed successfully'));

    // ── 显示输出文件 ──────────────────────────────────────────────────────────

    const buildEnvDir = path.join(toolkitRoot, 'build_env');
    const platformDir = `ds.${platform}-${dsmVersion}`;
    const outputDir = path.join(buildEnvDir, platformDir, 'image', 'packages');
    
    if (await fsExtra.pathExists(outputDir)) {
      console.log(chalk.green(`\n📦 Output directory: ${outputDir}`));
      const files = await fsExtra.readdir(outputDir);
      const spkFiles = files.filter(f => f.endsWith('.spk'));
      
      if (spkFiles.length > 0) {
        console.log(chalk.green('\n  Generated SPK files:'));
        for (const file of spkFiles) {
          const stat = await fsExtra.stat(path.join(outputDir, file));
          const size = stat.size > 1024 * 1024
            ? `${(stat.size / (1024 * 1024)).toFixed(2)} MB`
            : `${(stat.size / 1024).toFixed(2)} KB`;
          console.log(chalk.gray(`    ✓ ${file} (${size})`));
        }
      } else {
        console.log(chalk.yellow('\n  No SPK files found in output directory'));
      }
    } else {
      console.log(chalk.yellow(`\n  Output directory not found: ${outputDir}`));
    }
    console.log('');

  } catch (err: unknown) {
    compileSpinner.fail(chalk.red('Compilation failed'));
    console.error(chalk.red(err instanceof Error ? err.message : String(err)));
    if (opts.verbose && err instanceof Error) {
      console.error(chalk.gray(err.stack ?? ''));
    }
    console.log(chalk.yellow('\n💡 Troubleshooting:'));
    console.log(chalk.gray('  1. Check Python 3 is installed: python3 --version'));
    console.log(chalk.gray('  2. Verify pkgscripts-ng contains PkgCreate.py'));
    console.log(chalk.gray('  3. Ensure the project has a valid INFO file'));
    console.log(chalk.gray('  4. Ensure you have sudo privileges'));
    console.log(chalk.gray('  5. Try --verbose for more details'));
    process.exitCode = 1;
  }
}

async function detectPlatform(projectPath: string): Promise<string> {
  try {
    const infoPath = path.join(projectPath, 'INFO');
    if (await fsExtra.pathExists(infoPath)) {
      const content = await fsExtra.readFile(infoPath, 'utf-8');
      const m = content.match(/platform="([^"]+)"/);
      if (m?.[1]) return m[1];
    }
  } catch { /* ignore */ }
  return 'auto';
}

async function detectDsmVersion(projectPath: string): Promise<string> {
  try {
    const infoPath = path.join(projectPath, 'INFO');
    if (await fsExtra.pathExists(infoPath)) {
      const content = await fsExtra.readFile(infoPath, 'utf-8');
      const m = content.match(/os_min_ver="(\d+\.\d+)/);
      if (m?.[1]) return m[1];
    }
  } catch { /* ignore */ }
  return 'auto';
}