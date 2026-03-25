import path from 'node:path';
import { spawn } from 'node:child_process';
import chalk from 'chalk';
import ora from 'ora';
import fsExtra from 'fs-extra';
import os from 'node:os';

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
  if (cmdPath) {
    const resolved = path.resolve(cmdPath);
    if (await fsExtra.pathExists(path.join(resolved, 'PkgCreate.py'))) {
      return resolved;
    }
  }
  
  const config = await readGlobalConfig();
  if (config.pkgscriptsNg) {
    const resolved = path.resolve(config.pkgscriptsNg);
    if (await fsExtra.pathExists(path.join(resolved, 'PkgCreate.py'))) {
      return resolved;
    }
  }
  
  const envPath = process.env.SYNOLOGY_PKGSCRIPTS_NG;
  if (envPath) {
    const resolved = path.resolve(envPath);
    if (await fsExtra.pathExists(path.join(resolved, 'PkgCreate.py'))) {
      return resolved;
    }
  }
  
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

/**
 * 检查项目必要文件并获取包名
 * 必须文件: INFO.sh 和 SynoBuildConf/build, SynoBuildConf/install
 */
async function validateAndGetPackageName(projectPath: string): Promise<string> {
  // 检查必要文件
  const requiredFiles = [
    'INFO.sh',
    'SynoBuildConf/build',
    'SynoBuildConf/install'
  ];
  
  const missingFiles: string[] = [];
  
  for (const file of requiredFiles) {
    const filePath = path.join(projectPath, file);
    if (!await fsExtra.pathExists(filePath)) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    console.error(chalk.red(`Missing required files:`));
    for (const file of missingFiles) {
      console.error(chalk.red(`  ✗ ${file}`));
    }
    console.log(chalk.yellow('\n💡 A valid Synology package project must have:'));
    console.log(chalk.gray('  • INFO.sh - Package metadata generator'));
    console.log(chalk.gray('  • SynoBuildConf/build - Build script'));
    console.log(chalk.gray('  • SynoBuildConf/install - Install script'));
    process.exitCode = 1;
    throw new Error('Invalid package structure');
  }
  
  // 从 INFO.sh 获取包名
  const infoShPath = path.join(projectPath, 'INFO.sh');
  try {
    const content = await fsExtra.readFile(infoShPath, 'utf-8');
    const match = content.match(/package="([^"]+)"/);
    if (match?.[1]) {
      return match[1];
    }
  } catch (err) {
    console.error(chalk.red(`Failed to read INFO.sh: ${err}`));
  }
  
  // 如果无法从 INFO.sh 获取，使用目录名
  const dirName = path.basename(projectPath);
  console.log(chalk.yellow(`⚠️  Could not detect package name from INFO.sh, using directory name: ${dirName}`));
  return dirName;
}

export async function compileCommand(
  projectDir: string,
  opts: CompileOptions = {},
): Promise<void> {
  console.log(chalk.cyan('\n🔨 Synology Package Compiler\n'));

  const projectPath = path.resolve(projectDir);
  const pkgScriptPath = await resolvePkgScriptsNg(opts.pkgscriptNg, projectPath);

  if (!pkgScriptPath) {
    console.error(chalk.red('pkgscripts-ng directory not found.'));
    console.log(chalk.yellow('\n💡 To fix:'));
    console.log(chalk.gray('  1. Specify with --pkgscript-ng /path/to/pkgscripts-ng'));
    console.log(chalk.gray('  2. Set environment: export SYNOLOGY_PKGSCRIPTS_NG=/path/to/pkgscripts-ng'));
    console.log(chalk.gray('  3. Add to ~/.synocat/config.json: { "pkgscriptsNg": "/path/to/pkgscripts-ng" }'));
    process.exitCode = 1;
    return;
  }

  if (!await fsExtra.pathExists(projectPath)) {
    console.error(chalk.red(`Project directory not found: ${projectPath}`));
    process.exitCode = 1;
    return;
  }
  
  // 验证项目结构并获取包名
  let packageName: string;
  try {
    packageName = await validateAndGetPackageName(projectPath);
  } catch {
    return;
  }
  
  console.log(chalk.gray(`📦 Package name: ${chalk.cyan(packageName)}`));

  const toolkitRoot = path.dirname(pkgScriptPath);
  const sourceDir = path.join(toolkitRoot, 'source');
  const targetSourceDir = path.join(sourceDir, packageName);

  console.log(chalk.gray(`\n📁 Toolkit root: ${toolkitRoot}`));
  console.log(chalk.gray(`📁 Source directory: ${sourceDir}`));
  console.log(chalk.gray(`📁 Target: ${targetSourceDir}`));

  await fsExtra.ensureDir(sourceDir);

  // 复制项目
  const copySpinner = ora(`Copying project to ${targetSourceDir}...`).start();
  try {
    if (await fsExtra.pathExists(targetSourceDir)) {
      if (opts.clean) {
        copySpinner.text = `Removing existing ${targetSourceDir}...`;
        await fsExtra.remove(targetSourceDir);
        copySpinner.text = `Copying project to ${targetSourceDir}...`;
        await fsExtra.copy(projectPath, targetSourceDir);
        copySpinner.succeed(chalk.green(`✓ Project copied to ${targetSourceDir}`));
      } else {
        copySpinner.warn(chalk.yellow(`Directory ${targetSourceDir} already exists`));
        console.log(chalk.gray('  Use --clean to remove and re-copy'));
        copySpinner.succeed(chalk.green(`✓ Using existing directory: ${targetSourceDir}`));
      }
    } else {
      await fsExtra.copy(projectPath, targetSourceDir);
      copySpinner.succeed(chalk.green(`✓ Project copied to ${targetSourceDir}`));
    }
  } catch (err) {
    copySpinner.fail(chalk.red('Failed to copy project'));
    console.error(chalk.red(err instanceof Error ? err.message : String(err)));
    process.exitCode = 1;
    return;
  }

  // 确定平台和 DSM 版本
  let platform = opts.platform ?? 'auto';
  let dsmVersion = opts.dsmVersion ?? 'auto';

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

  console.log(chalk.gray('\n📋 Configuration:'));
  console.log(chalk.gray(`  pkgscripts-ng : ${pkgScriptPath}`));
  console.log(chalk.gray(`  project       : ${projectPath}`));
  console.log(chalk.gray(`  package name  : ${packageName}`));
  console.log(chalk.gray(`  platform      : ${platform === 'auto' ? '(default)' : platform}`));
  console.log(chalk.gray(`  DSM version   : ${dsmVersion === 'auto' ? '(default)' : dsmVersion}`));
  console.log(chalk.gray(`  clean build   : ${opts.clean ? 'yes' : 'no'}`));
  console.log(chalk.gray(`  verbose       : ${opts.verbose ? 'yes' : 'no'}`));
  console.log('');

  // ── 执行编译（实时显示日志）──────────────────────────────────────────────────

  console.log(chalk.cyan('🚀 Starting compilation...\n'));

  const cmd = `sudo ./PkgCreate.py -v ${dsmVersion} -p ${platform} -c ${packageName}`;
  if (opts.verbose) {
    console.log(chalk.gray(`Executing: ${cmd}\n`));
  }

  return new Promise((resolve, reject) => {
    const proc = spawn('sudo', [
      './PkgCreate.py',
      '-v', dsmVersion,
      '-p', platform,
      '-c', packageName,
    ], {
      cwd: pkgScriptPath,
      stdio: 'pipe',
    });

    let stdout = '';
    let stderr = '';
    let hasError = false;

    // 实时显示 stdout
    proc.stdout.on('data', (data: Buffer) => {
      const output = data.toString();
      stdout += output;
      
      // 实时输出到控制台
      process.stdout.write(chalk.gray(output));
      
      // 检测错误
      if (output.includes('[Error]') || output.includes('failed')) {
        hasError = true;
      }
    });

    // 实时显示 stderr
    proc.stderr.on('data', (data: Buffer) => {
      const output = data.toString();
      stderr += output;
      
      // 实时输出到控制台
      if (output.includes('warning') || output.includes('WARNING')) {
        process.stdout.write(chalk.yellow(output));
      } else {
        process.stdout.write(chalk.red(output));
      }
    });

    proc.on('close', async (code) => {
      console.log(''); // 空行分隔
      
      if (code !== 0 || hasError) {
        console.log(chalk.red('\n❌ Compilation failed!'));
        
        // 显示关键错误信息
        const errorLines = stdout.split('\n').filter(l => 
          l.includes('[Error]') || l.includes('failed') || l.includes('error')
        );
        if (errorLines.length > 0) {
          console.log(chalk.red('\n  Error summary:'));
          errorLines.forEach(l => console.log(chalk.red(`    ${l}`)));
        }
        
        console.log(chalk.yellow('\n💡 Troubleshooting:'));
        console.log(chalk.gray('  1. Check the error messages above'));
        console.log(chalk.gray('  2. Verify your package structure'));
        console.log(chalk.gray('  3. Check if INFO.sh has execute permission'));
        console.log(chalk.gray('  4. Try --verbose for more details'));
        
        process.exitCode = 1;
        reject(new Error(`Compilation failed with code ${code}`));
      } else {
        console.log(chalk.green('\n✅ Compilation completed successfully!'));
        
        // 显示输出文件
        const buildEnvDir = path.join(toolkitRoot, 'build_env');
        const platformDir = `ds.${platform}-${dsmVersion}`;
        const outputDir = path.join(buildEnvDir, platformDir, 'image', 'packages');
        
        if (await fsExtra.pathExists(outputDir)) {
          const files = await fsExtra.readdir(outputDir);
          const spkFiles = files.filter(f => f.endsWith('.spk'));
          
          if (spkFiles.length > 0) {
            console.log(chalk.green('\n📦 Generated SPK files:'));
            for (const file of spkFiles) {
              const stat = await fsExtra.stat(path.join(outputDir, file));
              const size = stat.size > 1024 * 1024
                ? `${(stat.size / (1024 * 1024)).toFixed(2)} MB`
                : `${(stat.size / 1024).toFixed(2)} KB`;
              console.log(chalk.gray(`    ✓ ${file} (${size})`));
            }
            console.log(chalk.gray(`\n  Location: ${outputDir}\n`));
          }
        }
        
        resolve();
      }
    });

    proc.on('error', (err) => {
      console.log(chalk.red(`\n❌ Failed to start compiler: ${err.message}`));
      process.exitCode = 1;
      reject(err);
    });
  });
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