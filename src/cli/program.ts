
import { Command } from 'commander';
import chalk from 'chalk';

import { createCommand }   from '../commands/create.command';
import { validateCommand } from '../commands/validate.command';
import { addCommand, AddType }      from '../commands/add.command';
import { packCommand }     from '../commands/pack.command';
import { infoCommand }     from '../commands/info.command';
import { imageCommand }    from '../commands/image.command';
import { compileCommand }  from '../commands/compile.command';
import { updateCommand }   from '../commands/update.command';
import { showHelp, showCommandHelp } from '../commands/help.command';
import type { TemplateType } from '../types/';
import { getCommand, setCommand, unsetCommand } from '../commands/config.command';
    // 在 import 部分添加
import { listCommand } from '../commands/list.command';

// ── Shared option injection ───────────────────────────────────────────────────

function withCommon(cmd: Command, name: string): Command {
  return cmd
    .option('-h, --help',    `Show help for ${name}`)
    .option('-v, --version', 'Show version');
}

function handleCommon(
  opts: { help?: boolean; version?: boolean },
  name: string,
  version: string,
  customHelp?: () => void,
): boolean {
  if (opts.help) {
    customHelp ? customHelp() : showCommandHelp(name, version);
    return true;
  }
  if (opts.version) {
    console.log(`synocat ${name} v${version}`);
    return true;
  }
  return false;
}

// ── Program builder ───────────────────────────────────────────────────────────

export function buildProgram(version: string): Command {
  const program = new Command();

  program
    .name('synocat')
    .description(
      chalk.cyan('🐈  synocat\n') +
      chalk.gray('Synology DSM 7.2.2 Package Scaffold Generator'),
    )
    .helpOption(false)
    .helpCommand(false);



// 在 buildProgram 函数中添加 list 命令
// ── list 命令 ──────────────────────────────────────────────────────────────
const listCmd = program
  .command('list')
  .description('List available resources')
  .helpOption(false);

listCmd
  .command('platforms')
  .description('List available build platforms')
  .option('--pkgscript-ng <path>', 'pkgscripts-ng directory')
  .action(async (opts: { pkgscriptNg?: string }) => {
    await listCommand('platforms', { pkgscriptNg: opts.pkgscriptNg });
  });

listCmd
  .command('arch')
  .description('List supported architectures')
  .action(async () => {
    await listCommand('arch');
  });

listCmd
  .command('templates')
  .description('List available package templates')
  .action(async () => {
    await listCommand('templates');
  });

listCmd
  .command('resources')
  .description('List available resource types')
  .action(async () => {
    await listCommand('resources');
  });

listCmd
  .command('packages')
  .description('List available packages in source directory')
  .option('--pkgscript-ng <path>', 'pkgscripts-ng directory')
  .option('--project-dir <path>', 'Project directory for auto-detection')
  .action(async (opts: { pkgscriptNg?: string; projectDir?: string }) => {
    await listCommand('packages', { pkgscriptNg: opts.pkgscriptNg, projectDir: opts.projectDir });
  });

listCmd
  .command('all')
  .description('List all information')
  .option('--pkgscript-ng <path>', 'pkgscripts-ng directory')
  .option('--project-dir <path>', 'Project directory for auto-detection')
  .action(async (opts: { pkgscriptNg?: string; projectDir?: string }) => {
    await listCommand('all', { pkgscriptNg: opts.pkgscriptNg, projectDir: opts.projectDir });
  });

// 默认 list 命令（无参数时显示所有）
program
  .command('list')
  .description('List all available resources')
  .option('--pkgscript-ng <path>', 'pkgscripts-ng directory')
  .option('--project-dir <path>', 'Project directory for auto-detection')
  .action(async (opts: { pkgscriptNg?: string; projectDir?: string }) => {
    await listCommand('all', { pkgscriptNg: opts.pkgscriptNg, projectDir: opts.projectDir });
  });

  // ── set 命令组 ──────────────────────────────────────────────────────────────
  const configCmd = program
    .command('config')
    .description('Manage configuration')
    .helpOption(false);

  configCmd
    .command('get <key>')
    .description('Get configuration value')
    .action(async (key: string) => {
      await getCommand(key);
    });

  configCmd
    .command('set <key> <value>')
    .description('Set configuration value')
    .option('-g, --global', 'Save to global config file')
    .option('-e, --env', 'Add to shell config (.bashrc/.zshrc)')
    .action(async (key: string, value: string, opts: { global?: boolean; env?: boolean }) => {
      if (!opts.global && !opts.env) {
        console.log(chalk.yellow('Please specify either --global or --env'));
        console.log(chalk.gray('  --global: Save to ~/.synocat/config.json'));
        console.log(chalk.gray('  --env:    Add to .bashrc/.zshrc as environment variable'));
        process.exitCode = 1;
        return;
      }
      await setCommand(key, value, opts);
    });

  configCmd
    .command('unset <key>')
    .description('Remove configuration value')
    .action(async (key: string) => {
      await unsetCommand(key);
    });

  configCmd
    .command('list')
    .description('List all configuration')
    .action(async () => {
      await listCommand();
    });

  // ── create ──────────────────────────────────────────────────────────────
  withCommon(
    program
      .command('create [name]')
      .description('Create a new package interactively')
      .option('-t, --template <type>', 'Template: minimal | node-service | vue-desktop | docker'),
    'create',
  ).action(async (name: string | undefined, opts: { help?: boolean; version?: boolean; template?: string }) => {
    if (handleCommon(opts, 'create', version)) return;
    await createCommand(name, opts.template as TemplateType | undefined);
  });

  // ── validate ─────────────────────────────────────────────────────────────
  withCommon(
    program
      .command('validate [dir]')
      .description('Validate package configuration'),
    'validate',
  ).action(async (dir: string | undefined, opts: { help?: boolean; version?: boolean }) => {
    if (handleCommon(opts, 'validate', version)) return;
    await validateCommand(dir);
  });

  // ── add ──────────────────────────────────────────────────────────────────
  withCommon(
    program
      .command('add <type> [subtype]')
      .description('Add configuration (resource | script)'),
    'add',
  ).action(async (type: AddType, subtype: string | undefined, opts: { help?: boolean; version?: boolean }) => {
    if (handleCommon(opts, 'add', version)) return;
    await addCommand(type, subtype);
  });

  // ── pack ─────────────────────────────────────────────────────────────────
  withCommon(
    program
      .command('pack [dir]')
      .description('Generate .spk package directory structure')
      .option('-o, --output <path>', 'Output directory', './dist'),
    'pack',
  ).action(async (dir: string | undefined, opts: { help?: boolean; version?: boolean; output?: string }) => {
    if (handleCommon(opts, 'pack', version)) return;
    await packCommand(dir, { output: opts.output });
  });

  // ── info ─────────────────────────────────────────────────────────────────
  withCommon(
    program
      .command('info [field]')
      .description('View INFO field documentation'),
    'info',
  ).action((field: string | undefined, opts: { help?: boolean; version?: boolean }) => {
    if (handleCommon(opts, 'info', version)) return;
    infoCommand(field);
  });

  // ── image ────────────────────────────────────────────────────────────────
  withCommon(
    program
      .command('image [path]')
      .description('Generate package icons in multiple sizes')
      .option('-s, --sizes <sizes>', 'Comma-separated sizes', '16,32,64,128,256')
      .option('-o, --output <dir>',  'Output directory', '.'),
    'image',
  ).action(async (imgPath: string | undefined, opts: { help?: boolean; version?: boolean; sizes?: string; output?: string }) => {
    if (handleCommon(opts, 'image', version)) return;
    await imageCommand(imgPath, { sizes: opts.sizes, output: opts.output });
  });



  // ── compile ───────────────────────────────────────────────────────────────
  withCommon(
    program
      .command('compile [project-dir]')
      .description('Compile package using Synology toolchain')
      .option('-p, --platform <platform>',   'Target platform')
      .option('-d, --dsm-version <version>', 'DSM version'  )
      .option('--pkgscript-ng <path>',       'pkgscripts-ng directory')
      .option('--clean',   'Clean build')
      .option('--verbose', 'Verbose output'),
    'compile',
  ).action(async (
    projDir: string | undefined,
    opts: { 
      help?: boolean; 
      version?: boolean; 
      platform?: string; 
      dsmVersion?: string; 
      pkgscriptNg?: string;
      clean?: boolean; 
      verbose?: boolean 
    },
  ) => {
    if (handleCommon(opts, 'compile', version)) return;
    
    const projectDir = projDir || '.';
    
    await compileCommand(projectDir, {
      platform:   opts.platform,
      dsmVersion: opts.dsmVersion,
      pkgscriptNg: opts.pkgscriptNg,
      clean:      opts.clean,
      verbose:    opts.verbose,
    });
  });

  // ── update ────────────────────────────────────────────────────────────────
  withCommon(
    program
      .command('update')
      .description('Update synocat to latest version'),
    'update',
  ).action(async (opts: { help?: boolean; version?: boolean }) => {
    if (handleCommon(opts, 'update', version)) return;
    await updateCommand(version);
  });

  // ── help ──────────────────────────────────────────────────────────────────
  program
    .command('help [command]')
    .description('Show help')
    .action((cmd: string | undefined) => {
      if (cmd) {
        const knownNames = program.commands.map((c) => c.name());
        if (knownNames.includes(cmd)) {
          showCommandHelp(cmd, version);
        } else {
          console.error(chalk.red(`\n  Unknown command: "${cmd}"\n`));
          console.log(chalk.yellow('  Run "synocat help" for available commands.\n'));
          process.exitCode = 1;
        }
      } else {
        showHelp(version);
      }
    });

  // ── Unknown command fallback → implicit create ────────────────────────────
  program.on('command:*', async (operands: string[]) => {
    const candidate = operands[0];
    if (operands.length === 1 && candidate && !candidate.startsWith('-')) {
      await createCommand(candidate).catch((err: unknown) => {
        console.error(chalk.red('Error:'), err instanceof Error ? err.message : err);
        process.exitCode = 1;
      });
      return;
    }
    console.error(chalk.red(`\n  Unknown command: "${candidate ?? ''}"\n`));
    console.log(chalk.yellow('  Run "synocat help" for usage information.\n'));
    process.exitCode = 1;
  });

  return program;
}