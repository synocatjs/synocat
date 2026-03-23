import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import chalk from 'chalk';
import ora from 'ora';
import fsExtra from 'fs-extra';

const execAsync = promisify(exec);

export interface CompileOptions {
  platform?:   string;
  dsmVersion?: string;
  clean?:      boolean;
  verbose?:    boolean;
}

export async function compileCommand(
  pkgscriptNgDir: string,
  projectDir:     string,
  opts: CompileOptions = {},
): Promise<void> {
  console.log(chalk.cyan('\n🔨 Synology Package Compiler\n'));

  const pkgScriptPath = path.resolve(pkgscriptNgDir);
  const projectPath   = path.resolve(projectDir);

  // ── Validation ─────────────────────────────────────────────────────────

  if (!await fsExtra.pathExists(pkgScriptPath)) {
    console.error(chalk.red(`pkgscript-ng directory not found: ${pkgScriptPath}`));
    process.exitCode = 1;
    return;
  }
  if (!await fsExtra.pathExists(projectPath)) {
    console.error(chalk.red(`Project directory not found: ${projectPath}`));
    process.exitCode = 1;
    return;
  }
  if (!await fsExtra.pathExists(path.join(pkgScriptPath, 'PkgCreate.py'))) {
    console.error(chalk.red(`PkgCreate.py not found in: ${pkgScriptPath}`));
    console.log(chalk.yellow('Ensure you provide the correct pkgscripts-ng directory'));
    process.exitCode = 1;
    return;
  }
  if (!await fsExtra.pathExists(path.join(projectPath, 'INFO'))) {
    console.error(chalk.red(`INFO file not found in: ${projectPath}`));
    console.log(chalk.yellow('This does not look like a valid Synology package project'));
    process.exitCode = 1;
    return;
  }

  // ── Auto-detect platform / DSM version ─────────────────────────────────

  let platform   = opts.platform   ?? 'auto';
  let dsmVersion = opts.dsmVersion ?? 'auto';

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
  console.log(chalk.gray(`  platform      : ${platform === 'auto' ? '(default)' : platform}`));
  console.log(chalk.gray(`  DSM version   : ${dsmVersion === 'auto' ? '(default)' : dsmVersion}`));
  console.log(chalk.gray(`  clean build   : ${opts.clean   ? 'yes' : 'no'}`));
  console.log(chalk.gray(`  verbose       : ${opts.verbose ? 'yes' : 'no'}`));
  console.log('');

  const spinner = ora('Starting compilation...').start();

  try {
    let cmd = `python3 PkgCreate.py`;
    if (platform   && platform   !== 'auto') cmd += ` -p ${platform}`;
    if (dsmVersion && dsmVersion !== 'auto') cmd += ` -v ${dsmVersion}`;
    cmd += ` ${projectPath}`;
    if (opts.clean)   cmd += ` --clean`;
    if (opts.verbose) cmd += ` --verbose`;

    spinner.text = 'Running Synology compiler...';
    if (opts.verbose) console.log(chalk.gray(`\nExecuting: ${cmd}\n`));

    const { stdout, stderr } = await execAsync(cmd, {
      cwd:       pkgScriptPath,
      maxBuffer: 1024 * 1024 * 10,
    });

    if (stdout) {
      if (opts.verbose) {
        process.stdout.write(stdout);
      } else {
        const important = stdout.split('\n').filter(
          (l) => /Building|Compiling|Success|Error/i.test(l),
        );
        important.forEach((l) => console.log(chalk.gray(l)));
      }
    }

    if (stderr?.trim()) {
      if (stderr.includes('warning')) {
        spinner.warn(chalk.yellow('Compilation completed with warnings'));
        console.error(chalk.yellow(stderr));
      } else {
        spinner.fail(chalk.red('Compilation failed'));
        console.error(chalk.red(stderr));
        process.exitCode = 1;
        return;
      }
    }

    spinner.succeed(chalk.green('✓ Compilation completed successfully'));

    // Show output files
    for (const candidate of ['build', 'dist', 'output']) {
      const outDir = path.join(projectPath, candidate);
      if (await fsExtra.pathExists(outDir)) {
        console.log(chalk.green(`\n📦 Output: ${outDir}`));
        const files = await fsExtra.readdir(outDir);
        for (const file of files) {
          const stat = await fsExtra.stat(path.join(outDir, file));
          const size = stat.size > 1024 * 1024
            ? `${(stat.size / (1024 * 1024)).toFixed(2)} MB`
            : `${(stat.size / 1024).toFixed(2)} KB`;
          console.log(chalk.gray(`  ✓ ${file} (${size})`));
        }
        break;
      }
    }
    console.log('');

  } catch (err: unknown) {
    spinner.fail(chalk.red('Compilation failed'));
    console.error(chalk.red(err instanceof Error ? err.message : String(err)));
    if (opts.verbose && err instanceof Error) {
      console.error(chalk.gray(err.stack ?? ''));
    }
    console.log(chalk.yellow('\n💡 Troubleshooting:'));
    console.log(chalk.gray('  1. Check Python 3 is installed: python3 --version'));
    console.log(chalk.gray('  2. Verify pkgscripts-ng contains PkgCreate.py'));
    console.log(chalk.gray('  3. Ensure the project has a valid INFO file'));
    console.log(chalk.gray('  4. Try --verbose for more details'));
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