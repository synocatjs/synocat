import chalk from 'chalk';

const BOX_WIDTH = 66;

function centerLine(text: string): string {
  const pad  = BOX_WIDTH - text.length;
  const left = Math.floor(pad / 2);
  return `║${' '.repeat(left)}${text}${' '.repeat(pad - left)}║`;
}

export function showHelp(version: string): void {
  console.log(chalk.cyan(`╔${'═'.repeat(BOX_WIDTH)}╗`));
  console.log(chalk.cyan(centerLine(`🐈  synocat  v${version}`)));
  console.log(chalk.cyan(centerLine('Synology DSM 7.2.2 Package Scaffold Generator')));
  console.log(chalk.cyan(`╚${'═'.repeat(BOX_WIDTH)}╝`));
  console.log('');

  console.log(chalk.yellow.bold('USAGE:'));
  console.log(chalk.gray('  $ synocat [command] [options]\n'));

  console.log(chalk.yellow.bold('COMMANDS:'));

  const cmds: Array<[string, string]> = [
    ['create [name]',             'Create a new package (default command)'],
    ['validate [dir]',            'Validate package configuration'],
    ['add <type> [subtype]',      'Add resource or script to existing package'],
    ['pack [dir]',                'Generate .spk directory structure'],
    ['info [field]',              'View INFO field documentation'],
    ['image [path]',              'Generate package icons from source image'],
    ['compile <ng-dir> <pkg-dir>', 'Compile package with Synology toolchain'],
    ['update',                    'Update synocat to latest version'],
    ['help [command]',            'Show this help or command-specific help'],
  ];

  for (const [cmd, desc] of cmds) {
    console.log(`  ${chalk.green(cmd.padEnd(30))} ${chalk.white(desc)}`);
  }
  console.log('');

  console.log(chalk.yellow.bold('COMMON OPTIONS:'));
  console.log(`  ${chalk.green('-h, --help'.padEnd(30))} ${chalk.white('Show help for the command')}`);
  console.log(`  ${chalk.green('-v, --version'.padEnd(30))} ${chalk.white('Show version')}`);
  console.log('');

  console.log(chalk.yellow.bold('EXAMPLES:'));
  const examples: Array<[string, string]> = [
    ['synocat',                      'Interactive project creation'],
    ['synocat my-app',               'Create project named "my-app"'],
    ['synocat create my-app -t vue', 'Create Vue.js desktop app'],
    ['synocat validate ./my-app',    'Validate package configuration'],
    ['synocat pack ./my-app -o dist','Build SPK structure into dist/'],
    ['synocat info adminport',        'Show adminport field documentation'],
    ['synocat add resource port',    'Add port registration to package'],
    ['synocat image ./logo.png',     'Generate all icon sizes'],
  ];

  for (const [ex, desc] of examples) {
    console.log(`  ${chalk.gray(ex.padEnd(38))} ${chalk.white('# ' + desc)}`);
  }
  console.log('');

  console.log(chalk.gray('For more: https://github.com/synocatjs/synocat\n'));
}

export function showCommandHelp(command: string, version: string): void {
  const map: Record<string, string> = {
    create: `
${chalk.cyan('🐈  synocat create')} — Create a new package

${chalk.yellow.bold('USAGE:')}
  ${chalk.gray('synocat create [name] [options]')}

${chalk.yellow.bold('ARGUMENTS:')}
  ${chalk.green('name')}                Package name (prompted if omitted)

${chalk.yellow.bold('OPTIONS:')}
  ${chalk.green('-t, --template <type>')}  Template: minimal | node-service | vue-desktop | docker
  ${chalk.green('-h, --help')}             Show this help

${chalk.yellow.bold('EXAMPLES:')}
  ${chalk.gray('synocat create')}                    # Interactive
  ${chalk.gray('synocat create my-app')}             # Named package
  ${chalk.gray('synocat create my-app -t docker')}   # Docker template
`,
    validate: `
${chalk.cyan('🐈  synocat validate')} — Validate package configuration

${chalk.yellow.bold('USAGE:')}
  ${chalk.gray('synocat validate [dir]')}

${chalk.yellow.bold('CHECKS:')}
  • INFO file — required fields, format, enum values, cross-field rules
  • conf/privilege — run-as must be "package" (not "system")
  • conf/resource  — worker types and required fields
  • scripts/       — shebang, start/stop/status branches
  • Icons          — PACKAGE_ICON.PNG presence

${chalk.yellow.bold('EXAMPLES:')}
  ${chalk.gray('synocat validate')}             # Validate current directory
  ${chalk.gray('synocat validate ./my-app')}    # Validate specific package
`,
    pack: `
${chalk.cyan('🐈  synocat pack')} — Generate .spk directory structure

${chalk.yellow.bold('USAGE:')}
  ${chalk.gray('synocat pack [dir] [options]')}

${chalk.yellow.bold('OPTIONS:')}
  ${chalk.green('-o, --output <path>')}  Output directory (default: ./dist)

${chalk.yellow.bold('EXAMPLES:')}
  ${chalk.gray('synocat pack')}                        # Pack current dir
  ${chalk.gray('synocat pack ./my-app')}               # Pack specific dir
  ${chalk.gray('synocat pack ./my-app -o ./build')}    # Custom output
`,
    add: `
${chalk.cyan('🐈  synocat add')} — Add configuration to existing package

${chalk.yellow.bold('USAGE:')}
  ${chalk.gray('synocat add resource [type]')}
  ${chalk.gray('synocat add script [name]')}

${chalk.yellow.bold('RESOURCE TYPES:')}
  port, data-share, mariadb, docker, port+share

${chalk.yellow.bold('SCRIPT NAMES:')}
  prereplace, postreplace

${chalk.yellow.bold('EXAMPLES:')}
  ${chalk.gray('synocat add resource port')}
  ${chalk.gray('synocat add resource mariadb')}
  ${chalk.gray('synocat add script prereplace')}
`,
    image: `
${chalk.cyan('🐈  synocat image')} — Generate package icons

${chalk.yellow.bold('USAGE:')}
  ${chalk.gray('synocat image [path] [options]')}

${chalk.yellow.bold('OPTIONS:')}
  ${chalk.green('-s, --sizes <sizes>')}  Comma-separated sizes (default: 16,32,64,128,256)
  ${chalk.green('-o, --output <dir>')}   Output directory (default: .)

${chalk.yellow.bold('EXAMPLES:')}
  ${chalk.gray('synocat image logo.png')}
  ${chalk.gray('synocat image logo.png -s 32,64,256')}
  ${chalk.gray('synocat image logo.svg -o ./icons')}
`,
    compile: `
${chalk.cyan('🐈  synocat compile')} — Compile with Synology toolchain

${chalk.yellow.bold('USAGE:')}
  ${chalk.gray('synocat compile <pkgscripts-ng-dir> <project-dir> [options]')}

${chalk.yellow.bold('OPTIONS:')}
  ${chalk.green('-p, --platform <platform>')}    Target platform (auto-detect or e.g. braswell)
  ${chalk.green('-d, --dsm-version <version>')}  DSM version (auto-detect or e.g. 7.2)
  ${chalk.green('--clean')}                      Clean build before compiling
  ${chalk.green('--verbose')}                    Show full compiler output

${chalk.yellow.bold('PLATFORMS:')} braswell, apollolake, avoton, dockerx64, alpine

${chalk.yellow.bold('EXAMPLES:')}
  ${chalk.gray('synocat compile /path/to/pkgscripts-ng /path/to/my-pkg')}
  ${chalk.gray('synocat compile /path/to/pkgscripts-ng /path/to/my-pkg -p braswell -d 7.2')}
`,
  };

  if (map[command]) {
    console.log(map[command]);
  } else {
    console.log(chalk.yellow(`\n  No detailed help for command: ${command}\n`));
    console.log(chalk.gray(`  Run "synocat help" for all commands.\n`));
  }

  void version; // version available if needed for future use
}