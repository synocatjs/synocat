// /**
//  * validate 命令 — 校验套件配置
//  */

// import path from 'path';
// import chalk from 'chalk';
// import { PackageValidator } from '../core/validator.js';

// export function validateCommand(targetDir = '.', options = {}) {
//   const absDir = path.resolve(process.cwd(), targetDir);
//   console.log('');
//   console.log(chalk.bold(`🔍 校验: ${absDir}`));
//   console.log(chalk.gray('  规范来源: DSM Developer Guide 7.2.2\n'));

//   // const validator = new PackageValidator(absDir);
//   const result = validator.validate();

//   if (result.infos.length) {
//     console.log(chalk.blue('ℹ  信息:'));
//     result.infos.forEach(i => console.log(chalk.blue(`   ${i}`)));
//     console.log('');
//   }
//   if (result.warnings.length) {
//     console.log(chalk.yellow('⚠  警告 (建议修复):'));
//     result.warnings.forEach(w => console.log(chalk.yellow(`   ${w}`)));
//     console.log('');
//   }
//   if (result.errors.length) {
//     console.log(chalk.red('✗  错误 (必须修复):'));
//     result.errors.forEach(e => console.log(chalk.red(`   ${e}`)));
//     console.log('');
//   }

//   if (result.valid) {
//     console.log(chalk.bold.green('✓ 校验通过！') + (result.warnings.length ? chalk.yellow(` (${result.warnings.length} 个警告)`) : ''));
//   } else {
//     console.log(chalk.bold.red(`✗ 校验失败 — ${result.errors.length} 个错误需要修复`));
//     process.exitCode = 1;
//   }
//   console.log('');
//   return result;
// }
