import path from 'node:path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { NodeFileSystem } from '../infra/fs';
import { ScaffoldService } from '../services/scaffold.service';
import { ValidatorService } from '../services/validator.service';
import type { ScaffoldConfig, TemplateType, ResourceShorthand } from '../types/';

const TEMPLATE_CHOICES = [
  { name: `${chalk.bold('minimal')}      — Pure shell package (supports all platforms)`, short: 'minimal',      value: 'minimal' as TemplateType },
  { name: `${chalk.bold('node-service')} — Node.js backend service (with start/stop)`,    short: 'node-service', value: 'node-service' as TemplateType },
  { name: `${chalk.bold('vue-desktop')}  — Vue.js desktop app (DSM Desktop UI)`,          short: 'vue-desktop',  value: 'vue-desktop' as TemplateType },
  { name: `${chalk.bold('docker')}       — Docker Compose package (requires ContainerManager)`, short: 'docker', value: 'docker' as TemplateType },
];

interface Answers {
  package: string;
  displayname: string;
  description: string;
  version: string;
  maintainer: string;
  maintainer_url?: string;
  arch: string;
  arch_custom?: string;
  os_min_ver: string;
  templateType: TemplateType;
  hasAdminUI?: boolean;
  adminport?: string;
  adminurl?: string;
  adminprotocol?: 'http' | 'https';
  hasResource?: boolean;
  resourceType?: ResourceShorthand;
  resourcePort?: string;
  dsmuidir?: string;
  dsmappname?: string;
}



export async function createCommand(name?: string, templateOverride?: TemplateType): Promise<void> {
  console.log('');
  console.log(chalk.bold.cyan('  🐈  synocat'));
  console.log(chalk.gray('  Synology DSM 7.2.2 Package Scaffold Generator\n'));

  const answers= await inquirer.prompt<Answers>([
    {
      type: 'input',
      name: 'package',
      message: `Package ID ${chalk.gray('(used for /var/packages/[ID], no : / > < | =)')}`,
      default: name,
      validate: (v: string) => {
        if (!v.trim()) return 'Package ID cannot be empty';
        if (/[:/><=|]/.test(v)) return 'Cannot contain: : / > < | =';
        return true;
      },
    },
    {
      type: 'input',
      name: 'displayname',
      message: `Display name ${chalk.gray('(shown in Package Center)')}`,
      default: (a: { package: string }) => a.package,
    },
    {
      type: 'input',
      name: 'description',
      message: 'Package description',
      validate: (v: string) => v.trim() ? true : 'Description cannot be empty',
    },
    {
      type: 'input',
      name: 'version',
      message: `Version ${chalk.gray('(format: major.minor.patch-build)')}`,
      default: '1.0.0-0001',
      validate: (v: string) => /^[\d._-]+$/.test(v) ? true : 'Only digits, dots, underscores, hyphens allowed',
    },
    {
      type: 'input',
      name: 'maintainer',
      message: 'Maintainer / developer name',
      validate: (v: string) => v.trim() ? true : 'Maintainer cannot be empty',
    },
    {
      type: 'input',
      name: 'maintainer_url',
      message: `Developer webpage ${chalk.gray('(optional)')}`,
    },
    {
      type: 'list',
      name: 'arch',
      message: 'Target CPU architecture',
      choices: [
        { name: `noarch    — All platforms ${chalk.gray('(pure JS/Shell/PHP packages)')}`, value: 'noarch' },
        { name: `x86_64   — Modern Intel/AMD NAS ${chalk.gray('(DS9xx+, RS series)')}`,    value: 'x86_64' },
        { name: `armv8    — ARM 64-bit NAS ${chalk.gray('(DS2xx, DS4xx)')}`,                value: 'armv8' },
        { name: 'Custom (space-separated multi-arch)',                                       value: '__custom__' },
      ],
      default: 'noarch',
    },
    {
      type: 'input',
      name: 'arch_custom',
      message: 'Enter architectures (space-separated, e.g.: x86_64 armv8)',
      when: (a: { arch: string }) => a.arch === '__custom__',
    },
    {
      type: 'input',
      name: 'os_min_ver',
      message: `Min DSM version ${chalk.gray('(>= 7.0-40000 for DSM 7)')}`,
      default: '7.0-40000',
      validate: (v: string) => /^\d+\.\d+-\d+$/.test(v) ? true : 'Format must be X.Y-Z (e.g. 7.0-40000)',
    },
    {
      type: 'list',
      name: 'templateType',
      message: 'Package template',
      choices: TEMPLATE_CHOICES,
      default: templateOverride ?? 'minimal',
    },
    {
      type: 'confirm',
      name: 'hasAdminUI',
      message: `Include a web admin UI? ${chalk.gray('(sets adminport/adminurl)')}`,
      default: false,
      when: (a: { templateType: TemplateType }) => a.templateType !== 'vue-desktop',
    },
    {
      type: 'input',
      name: 'adminport',
      message: 'Admin UI port',
      default: '8080',
      when: (a: { hasAdminUI?: boolean }) => a.hasAdminUI === true,
      validate: (v: string) => {
        const p = parseInt(v, 10);
        return !isNaN(p) && p >= 1 && p <= 65535 ? true : 'Port must be 1–65535';
      },
    },
    {
      type: 'input',
      name: 'adminurl',
      message: `Admin UI URL path ${chalk.gray('(e.g. / or /admin)')}`,
      default: '/',
      when: (a: { hasAdminUI?: boolean }) => a.hasAdminUI === true,
    },
    {
      type: 'list',
      name: 'adminprotocol',
      message: 'Admin UI protocol',
      choices: ['http', 'https'],
      default: 'http',
      when: (a: { hasAdminUI?: boolean }) => a.hasAdminUI === true,
    },
    {
      type: 'confirm',
      name: 'hasResource',
      message: `Need system resources? ${chalk.gray('(ports, shared folders, database, Docker)')}`,
      default: false,
    },
    {
      type: 'list',
      name: 'resourceType',
      message: 'Resource type',
      when: (a: { hasResource: boolean }) => a.hasResource,
      choices: [
        { name: 'port        — Firewall port registration',     value: 'port' },
        { name: 'data-share  — Shared folder access',           value: 'data-share' },
        { name: 'mariadb     — MariaDB 10 database',            value: 'mariadb' },
        { name: 'docker      — Docker Compose project',         value: 'docker' },
        { name: 'port+share  — Port + shared folder',           value: 'port+share' },
      ],
    },
    {
      type: 'input',
      name: 'resourcePort',
      message: 'Port number to register',
      default: (a: { adminport?: string }) => a.adminport ?? '8080',
      when: (a: { resourceType?: string }) =>
        a.resourceType === 'port' || a.resourceType === 'port+share',
    },
  ]);

  // Resolve custom arch
  if (answers.arch === '__custom__') {
    answers.arch = answers.arch_custom ?? 'noarch';
  }

  // Vue template DSM desktop defaults
  if (answers.templateType === 'vue-desktop') {
    answers.dsmuidir   = 'ui';
    answers.dsmappname = `com.example.${answers.package}`;
    answers.hasAdminUI = false;
    answers.adminport  = '0';
  }

  const targetDir = path.resolve(process.cwd(), answers.package as string);
  const fs        = new NodeFileSystem();

  // Overwrite check
  if (fs.exists(targetDir)) {
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: chalk.yellow(`Directory "${answers.package}/" already exists. Overwrite?`),
      default: false,
    }]);
    if (!overwrite) {
      console.log(chalk.gray('\nCancelled.\n'));
      return;
    }
  }

  const spinner = ora('Generating scaffold...').start();

  try {
    const cfg: ScaffoldConfig = {
      package:       answers.package as string,
      version:       answers.version as string,
      os_min_ver:    answers.os_min_ver as string,
      description:   answers.description as string,
      arch:          answers.arch as string,
      maintainer:    answers.maintainer as string,
      displayname:   answers.displayname as string | undefined,
      maintainer_url: answers.maintainer_url as string | undefined || undefined,
      adminport:     answers.adminport as string | undefined,
      adminurl:      answers.adminurl as string | undefined,
      adminprotocol: answers.adminprotocol as 'http' | 'https' | undefined,
      dsmuidir:      answers.dsmuidir as string | undefined,
      dsmappname:    answers.dsmappname as string | undefined,
      templateType:  answers.templateType as TemplateType,
      hasAdminUI:    Boolean(answers.hasAdminUI),
      hasResource:   Boolean(answers.hasResource),
      resourceType:  answers.resourceType as ResourceShorthand | undefined,
      hasUI:         answers.templateType === 'vue-desktop',
      resourceOpts: {
        port:    answers.resourcePort ? parseInt(answers.resourcePort as string, 10) : undefined,
        package: answers.package as string,
      },
    };

    const service = new ScaffoldService(fs);
    const files   = service.generate(targetDir, cfg);

    spinner.succeed(chalk.green('✓ Scaffold generated successfully'));

    // File list
    console.log('');
    console.log(chalk.bold('Generated files:'));
    for (const f of files) {
      console.log(`  ${chalk.green('✓')} ${chalk.gray(cfg.package + '/')}${f}`);
    }

    // Quick validation
    console.log('');
    const validator = new ValidatorService(fs);
    const result    = validator.validate(targetDir);
    if (result.warnings.length > 0) {
      console.log(chalk.yellow('⚠  Warnings (recommended to fix before publishing):'));
      result.warnings.forEach((w:string) => console.log(chalk.yellow(`   ${w}`)));
      console.log('');
    }

    // Next steps
    console.log(chalk.bold.green('🎉 Done! Next steps:\n'));
    console.log(`  ${chalk.cyan(`cd ${cfg.package}`)}`);
    console.log('');
    service.getNextSteps(cfg).forEach((s, i) => {
      console.log(`  ${chalk.gray(`${i + 1}.`)} ${s}`);
    });
    console.log('');
    console.log(`  ${chalk.gray('Validate:  ')} ${chalk.cyan('synocat validate .')}`);
    console.log(`  ${chalk.gray('Field docs:')} ${chalk.cyan('synocat info <field>')}`);
    console.log('');

  } catch (err) {
    spinner.fail(chalk.red('Scaffold generation failed'));
    console.error(err);
    process.exitCode = 1;
  }
}