import path from 'node:path';
import chalk from 'chalk';
import { NodeFileSystem } from '../infra/fs';
import { ValidatorService } from '../services/validator.service';

export async function validateCommand(targetDir = '.'): Promise<void> {
  const absDir = path.resolve(process.cwd(), targetDir);

  console.log('');
  console.log(chalk.bold(`🔍 Validating: ${absDir}`));
  console.log(chalk.gray('  Reference: DSM Developer Guide 7.2.2\n'));

  const service = new ValidatorService(new NodeFileSystem());
  const result  = service.validate(absDir);

  if (result.infos.length) {
    result.infos.forEach((i:string) => console.log(chalk.blue(`ℹ  ${i}`)));
    console.log('');
  }
  if (result.warnings.length) {
    console.log(chalk.yellow('⚠  Warnings (recommended to fix):'));
    result.warnings.forEach((w: string) => console.log(chalk.yellow(`   ${w}`)));
    console.log('');
  }
  if (result.errors.length) {
    console.log(chalk.red('✗  Errors (must fix):'));
    result.errors.forEach((e: string) => console.log(chalk.red(`   ${e}`)));
    console.log('');
  }

  if (result.valid) {
    console.log(
      chalk.bold.green('✓ Validation passed!') +
      (result.warnings.length ? chalk.yellow(` (${result.warnings.length} warning${result.warnings.length > 1 ? 's' : ''})`) : ''),
    );
  } else {
    console.log(chalk.bold.red(`✗ Validation failed — ${result.errors.length} error${result.errors.length > 1 ? 's' : ''} to fix`));
    process.exitCode = 1;
  }
  console.log('');
}