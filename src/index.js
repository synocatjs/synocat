// #!/usr/bin/env node
// /**
//  * synocat — Synology DSM 7 Package CLI
//  *
//  * npx synocat              → 直接进入交互式创建
//  * synopkg create [name]           → 创建套件
//  * synopkg validate [dir]          → 校验配置
//  * synopkg add resource <type>     → 添加资源配置
//  * synopkg pack [dir]              → 生成 .spk 结构
//  * synopkg info <field>            → 查看字段文档
//  */

// import { program } from 'commander';
// import { createCommand } from './commands/create.js';
// import { validateCommand } from './commands/validate.js';
// import { addCommand } from './commands/add.js';
// import { packCommand } from './commands/pack.js';
// import { infoCommand } from './commands/info.js';
// import chalk from 'chalk';
// import { existsSync } from 'fs';

// // 检测调用方式：npx synocat [name] → 直接创建
// const argv1 = process.argv[1] || '';
// const isCreateMode = argv1.endsWith('synocat') || argv1.endsWith('synocat.js');
// const firstArg = process.argv[2];
// const knownSubcommands = ['create', 'validate', 'add', 'pack', 'info', '--help', '-h', '--version', '-V'];
// const isSubcommand = firstArg && knownSubcommands.includes(firstArg);

// if (isCreateMode && !isSubcommand) {
//   // npx synocat [name] 模式
//   createCommand(firstArg, {}).catch(err => { console.error(err); process.exit(1); });
// } else {
//   program
//     .name('synopkg')
//     .description(chalk.cyan('Synology DSM 7 Package CLI') + chalk.gray(' — for frontend developers'))
//     .version('1.0.0');

//   program
//     .command('create [name]')
//     .description('交互式创建新套件（生成完整项目结构）')
//     .option('-t, --template <type>', '模板: minimal | node-service | vue-desktop | docker')
//     .action(createCommand);

//   program
//     .command('validate [dir]')
//     .description('校验套件配置（INFO、privilege、resource、scripts）')
//     .action(validateCommand);

//   program
//     .command('add <type> [subtype]')
//     .description('添加配置  type: resource | script')
//     .action(addCommand);

//   program
//     .command('pack [dir]')
//     .description('生成 .spk 打包目录结构')
//     .option('-o, --output <path>', '输出目录', './dist')
//     .action(packCommand);

//   program
//     .command('info [field]')
//     .description('查看 INFO 字段文档  synopkg info adminport')
//     .action(infoCommand);

//   program.parse();
// }
