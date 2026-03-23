import path from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import { NodeFileSystem } from '../infra/fs';
import { PackService } from '../services/pack.service';

export interface PackCommandOptions {
  output?: string;
}

export async function packCommand(srcDir = '.', opts: PackCommandOptions = {}): Promise<void> {
  const absSrc    = path.resolve(process.cwd(), srcDir);
  const outputDir = opts.output ?? './dist';

  console.log('');
  console.log(chalk.bold(`📦 Packing: ${absSrc}`));
  console.log(chalk.gray(`   Output:  ${path.resolve(process.cwd(), outputDir)}\n`));

  const fs      = new NodeFileSystem();
  const service = new PackService(fs);

  // Validate first
  const result  = service.pack(absSrc, { output: path.resolve(process.cwd(), outputDir) });

  if (result.validation.errors.length > 0) {
    console.log(chalk.red('✗ Validation failed — fix these errors first:'));
    result.validation.errors.forEach((e: string) => console.log(chalk.red(`  ${e}`)));
    console.log('');
    process.exitCode = 1;
    return;
  }

  if (result.validation.warnings.length > 0) {
    console.log(chalk.yellow('⚠  Warnings (not blocking pack):'));
    result.validation.warnings.forEach((w: string) => console.log(chalk.yellow(`  ${w}`)));
    console.log('');
  }

  const spinner = ora('Assembling .spk directory structure...').start();

  try {
    spinner.succeed(chalk.green('✓ .spk directory structure ready'));

    console.log('');
    console.log(chalk.bold('Output directory: ') + chalk.cyan(result.outputDir));
    console.log('');
    console.log(chalk.bold('Files included:'));
    result.files.forEach((f) => console.log(`  ${chalk.green('✓')} ${f}`));

    console.log('');
    console.log(chalk.bold('Next steps:'));

    const hasTgz = result.files.includes('package.tgz');
    if (!hasTgz) {
      console.log(chalk.yellow('  ① Prepare package.tgz (your application files):'));
      console.log(chalk.gray('     tar czf package.tgz ./'));
      console.log(chalk.gray(`     cp package.tgz ${result.spkDir}/`));
      console.log('');
    }

    console.log(chalk.gray('  Final .spk (Linux / Synology Toolkit):'));
    console.log(chalk.cyan(`    tar cf ${result.pkgName}-${result.pkgVersion}.spk -C ${result.spkDir} .`));
    console.log('');
    console.log(chalk.gray('  Or with pkgscripts-ng:'));
    console.log(chalk.cyan(`    ./PkgCreate.py -v 7.2 -p [platform] ${result.pkgName}`));
    console.log('');
    console.log(chalk.gray('  Install test: DSM > Package Center > Manual Install > Upload .spk'));
    console.log('');
  } catch (err) {
    spinner.fail(chalk.red('Pack failed'));
    console.error(err);
    process.exitCode = 1;
  }
}