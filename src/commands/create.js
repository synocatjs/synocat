/**
 * create 命令 — 交互式脚手架生成
 * 目标用户：纯前端开发者，无需了解 Linux/DSM 底层细节
 */

import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs';
import { generateScaffold } from '../core/generator';
import { PackageValidator } from '../core/validator';

const TEMPLATE_CHOICES = [
  {
    name: `${chalk.bold('minimal')}      — 纯脚本套件（Shell，支持所有平台）`,
    short: 'minimal',
    value: 'minimal',
  },
  {
    name: `${chalk.bold('node-service')} — Node.js 后端服务（含 start/stop 脚本）`,
    short: 'node-service',
    value: 'node-service',
  },
  {
    name: `${chalk.bold('vue-desktop')}  — Vue.js 桌面应用（集成 DSM 桌面 UI）`,
    short: 'vue-desktop',
    value: 'vue-desktop',
  },
  {
    name: `${chalk.bold('docker')}       — Docker Compose 容器套件（需 ContainerManager）`,
    short: 'docker',
    value: 'docker',
  },
];

export async function createCommand(name, options = {}) {
  console.log('');
  console.log(chalk.bold.cyan('  🐢  synocat'));
  console.log(chalk.gray('  Synology DSM 7.2.2 套件脚手架生成器\n'));

  const questions = [
    {
      type: 'input',
      name: 'package',
      message: `套件 ID ${chalk.gray('(用于 /var/packages/[ID]，不能含 : / > < | =)')}`,
      default: name || undefined,
      validate: (v) => {
        if (!v.trim()) return '套件 ID 不能为空';
        if (/[:/><=|]/.test(v)) return '不能包含特殊字符：: / > < | =';
        return true;
      },
    },
    {
      type: 'input',
      name: 'displayname',
      message: `显示名称 ${chalk.gray('(Package Center 中显示的名称)')}`,
      default: (a) => a.package,
    },
    {
      type: 'input',
      name: 'description',
      message: '套件描述',
      validate: (v) => (v.trim() ? true : '描述不能为空'),
    },
    {
      type: 'input',
      name: 'version',
      message: `版本号 ${chalk.gray('(格式：major.minor.patch-build)')}`,
      default: '1.0.0-0001',
      validate: (v) => {
        if (!/^[\d._-]+$/.test(v)) return '只能包含数字、点、下划线、连字符';
        return true;
      },
    },
    {
      type: 'input',
      name: 'maintainer',
      message: '维护者/开发者名称',
      validate: (v) => (v.trim() ? true : '维护者不能为空'),
    },
    {
      type: 'input',
      name: 'maintainer_url',
      message: `开发者网页 ${chalk.gray('(可选，回车跳过)')}`,
    },
    {
      type: 'list',
      name: 'arch',
      message: '目标 CPU 架构',
      choices: [
        { name: `noarch    — 所有平台 ${chalk.gray('(纯 JS/Shell/PHP 套件推荐)')}`, value: 'noarch' },
        { name: `x86_64   — 现代 Intel/AMD NAS ${chalk.gray('(DS9xx+, RS 系列)')}`, value: 'x86_64' },
        { name: `armv8    — ARM 64-bit NAS ${chalk.gray('(DS2xx, DS4xx)')}`, value: 'armv8' },
        { name: '手动输入（多架构空格分隔）', value: '__custom__' },
      ],
      default: 'noarch',
    },
    {
      type: 'input',
      name: 'arch_custom',
      message: '输入架构值（空格分隔，如：x86_64 armv8）',
      when: (a) => a.arch === '__custom__',
    },
    {
      type: 'input',
      name: 'os_min_ver',
      message: `最低 DSM 版本 ${chalk.gray('(DSM 7.0 起必须 >= 7.0-40000)')}`,
      default: '7.0-40000',
      validate: (v) => {
        if (!/^\d+\.\d+-\d+$/.test(v)) return '格式应为 X.Y-Z（如 7.0-40000）';
        return true;
      },
    },
    {
      type: 'list',
      name: 'templateType',
      message: '套件模板类型',
      choices: TEMPLATE_CHOICES,
      default: options.template || 'minimal',
    },
    // 管理界面（非 Vue 模板询问）
    {
      type: 'confirm',
      name: 'hasAdminUI',
      message: `是否有 Web 管理界面？${chalk.gray('（设置 adminport/adminurl）')}`,
      default: false,
      when: (a) => !['vue-desktop'].includes(a.templateType),
    },
    {
      type: 'input',
      name: 'adminport',
      message: '管理界面端口',
      default: '8080',
      when: (a) => a.hasAdminUI,
      validate: (v) => {
        const p = parseInt(v);
        return isNaN(p) || p < 1 || p > 65535 ? '端口范围 1-65535' : true;
      },
    },
    {
      type: 'input',
      name: 'adminurl',
      message: `管理界面 URL 路径 ${chalk.gray('(如 / 或 /admin)')}`,
      default: '/',
      when: (a) => a.hasAdminUI,
    },
    {
      type: 'list',
      name: 'adminprotocol',
      message: '管理界面协议',
      choices: ['http', 'https'],
      default: 'http',
      when: (a) => a.hasAdminUI,
    },
    // 系统资源
    {
      type: 'confirm',
      name: 'hasResource',
      message: `是否需要系统资源？${chalk.gray('（端口注册/共享文件夹/数据库/Docker）')}`,
      default: false,
    },
    {
      type: 'list',
      name: 'resourceType',
      message: '资源类型',
      when: (a) => a.hasResource,
      choices: [
        { name: `port       — 防火墙端口注册`, value: 'port' },
        { name: `data-share — 访问共享文件夹`, value: 'data-share' },
        { name: `mariadb    — MariaDB 10 数据库`, value: 'mariadb' },
        { name: `docker     — Docker Compose 项目`, value: 'docker' },
        { name: `port+share — 端口 + 共享文件夹`, value: 'port+share' },
      ],
    },
    {
      type: 'input',
      name: 'resourcePort',
      message: '注册的端口号',
      default: (a) => a.adminport || '8080',
      when: (a) => a.resourceType === 'port' || a.resourceType === 'port+share',
    },
  ];

  const answers = await inquirer.prompt(questions);

  // 处理自定义 arch
  if (answers.arch === '__custom__') answers.arch = answers.arch_custom || 'noarch';

  // Vue 模板自动设置 DSM UI 集成
  if (answers.templateType === 'vue-desktop') {
    answers.dsmuidir = 'ui';
    answers.dsmappname = `com.example.${answers.package}`;
    if (!answers.hasAdminUI) {
      answers.adminport = '0';
    }
  }

  const targetDir = path.resolve(process.cwd(), answers.package);

  // 目录已存在提示
  if (fs.existsSync(targetDir)) {
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: chalk.yellow(`目录 "${answers.package}/" 已存在，是否覆盖？`),
      default: false,
    }]);
    if (!overwrite) { console.log(chalk.gray('\n已取消。\n')); return; }
  }

  const spinner = ora('正在生成套件脚手架...').start();

  try {
    const files = await generateScaffold(targetDir, {
      ...answers,
      hasUI: answers.templateType === 'vue-desktop',
      resourceOpts: { port: parseInt(answers.resourcePort || answers.adminport || '8080') },
    });
    spinner.succeed(chalk.green('✓ 套件脚手架生成完成'));

    // 文件清单
    console.log('');
    console.log(chalk.bold('生成文件：'));
    const categories = {
      '配置': ['INFO', 'conf/privilege', 'conf/resource'],
      '脚本': files.filter(f => f.startsWith('scripts/')),
      'IDE 支持': ['.vscode/settings.json', '.synopkg/schemas/resource.schema.json'],
      '其他': files.filter(f => !f.startsWith('scripts/') && !f.startsWith('.') && !['INFO','conf/privilege','conf/resource'].includes(f)),
    };
    for (const [cat, catFiles] of Object.entries(categories)) {
      const existing = catFiles.filter(f => files.includes(f));
      if (existing.length) {
        console.log(chalk.dim(`  ${cat}:`));
        existing.forEach(f => console.log(`    ${chalk.green('✓')} ${chalk.gray(answers.package + '/')}${f}`));
      }
    }

    // 校验
    console.log('');
    const validator = new PackageValidator(targetDir);
    const result = validator.validate();

    if (result.warnings.length > 0) {
      console.log(chalk.yellow('⚠ 提示（建议在发布前处理）：'));
      result.warnings.forEach(w => console.log(chalk.yellow(`  ${w}`)));
      console.log('');
    }
    if (result.errors.length > 0) {
      console.log(chalk.red('✗ 问题：'));
      result.errors.forEach(e => console.log(chalk.red(`  ${e}`)));
      console.log('');
    }

    // 下一步引导
    console.log(chalk.bold.green('🎉 完成！接下来：\n'));
    console.log(`  ${chalk.cyan('cd ' + answers.package)}`);
    console.log('');

    const steps = getNextSteps(answers.templateType, answers);
    steps.forEach((s, i) => console.log(`  ${chalk.gray((i + 1) + '.')} ${s}`));

    console.log('');
    console.log(`  ${chalk.gray('随时可运行:')} ${chalk.cyan('synopkg validate .')}  ${chalk.gray('← 检查配置合法性')}`);
    console.log(`  ${chalk.gray('查看字段文档:')} ${chalk.cyan('synopkg info <字段名>')}  ${chalk.gray('← 如 synopkg info adminport')}`);
    console.log('');

  } catch (err) {
    spinner.fail(chalk.red('生成失败'));
    console.error(err);
  }
}

function getNextSteps(templateType, answers) {
  const pkg = answers.package;
  const steps = {
    minimal: [
      `编辑 ${chalk.cyan('scripts/start-stop-status')} 实现启停逻辑`,
      `准备应用文件并打包为 ${chalk.cyan('package.tgz')}`,
      `放置 ${chalk.cyan('PACKAGE_ICON.PNG')} (64×64 像素)`,
      `运行 ${chalk.cyan('synopkg pack .')} 生成 .spk 目录结构`,
    ],
    'node-service': [
      `编辑 ${chalk.cyan('src/index.js')} 实现服务逻辑`,
      `编辑 ${chalk.cyan('scripts/start-stop-status')} 的 start/stop 分支`,
      `运行 ${chalk.cyan('npm install')} 安装依赖`,
      `放置 ${chalk.cyan('PACKAGE_ICON.PNG')} (64×64 像素)`,
      `运行 ${chalk.cyan('synopkg pack .')} 生成 .spk 目录结构`,
    ],
    'vue-desktop': [
      `编辑 ${chalk.cyan('ui/src/')} 中的 Vue 组件`,
      `运行 ${chalk.cyan('cd ui && npm install && npm run build')} 构建 UI`,
      `放置 ${chalk.cyan('PACKAGE_ICON.PNG')} (64×64 像素)`,
      `运行 ${chalk.cyan('synopkg pack .')} 生成 .spk 目录结构`,
    ],
    docker: [
      `编辑 ${chalk.cyan('compose/compose.yml')} 配置容器`,
      `确认已在 DSM 安装 ${chalk.cyan('ContainerManager')} (DSM 7.2.1+)`,
      `放置 ${chalk.cyan('PACKAGE_ICON.PNG')} (64×64 像素)`,
      `运行 ${chalk.cyan('synopkg pack .')} 生成 .spk 目录结构`,
    ],
  };
  return steps[templateType] || steps.minimal;
}
