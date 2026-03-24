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
      .command('compile [pkgscript-ng-dir] [project-dir]')
      .description('Compile package using Synology toolchain')
      .option('-p, --platform <platform>',   'Target platform', 'auto')
      .option('-d, --dsm-version <version>', 'DSM version',     'auto')
      .option('--clean',   'Clean build')
      .option('--verbose', 'Verbose output'),
    'compile',
  ).action(async (
    ngDir: string | undefined,
    projDir: string | undefined,
    opts: { help?: boolean; version?: boolean; platform?: string; dsmVersion?: string; clean?: boolean; verbose?: boolean },
  ) => {
    if (handleCommon(opts, 'compile', version)) return;
    if (!ngDir || !projDir) {
      const missing = !ngDir ? 'pkgscript-ng directory' : 'project directory';
      console.error(chalk.red(`Error: ${missing} is required`));
      console.log(chalk.gray('Usage: synocat compile <pkgscript-ng-dir> <project-dir>'));
      process.exitCode = 1;
      return;
    }
    await compileCommand(ngDir, projDir, {
      platform:   opts.platform,
      dsmVersion: opts.dsmVersion,
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