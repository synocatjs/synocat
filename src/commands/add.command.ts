import path from 'node:path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { NodeFileSystem } from '../infra/fs';
import { generateResource } from '../core/generators/resource.generator';
import { generateScript }   from '../core/generators/script.generator';
import { RESOURCE_WORKERS } from '../data/resource-workers.data';
import type { ResourceShorthand } from '../types/';
import type { ResourceConfig }    from '../types/';

export type AddType = 'resource' | 'script';

export async function addCommand(type: AddType, subtype?: string): Promise<void> {
  const cwd = process.cwd();

  if (type === 'resource') {
    await addResource(cwd, subtype as ResourceShorthand | undefined);
  } else if (type === 'script') {
    await addScript(cwd, subtype);
  } else {
    console.log(chalk.red(`Unknown type: ${type}`));
    console.log(chalk.gray('Usage: synocat add resource <type>  |  synocat add script <name>'));
  }
}

async function addResource(cwd: string, resourceType?: ResourceShorthand): Promise<void> {
  const fs      = new NodeFileSystem();
  const confDir = path.join(cwd, 'conf');

  if (!resourceType) {
    const { rt } = await inquirer.prompt([{
      type:    'list',
      name:    'rt',
      message: 'Select resource type to add',
      choices: Object.entries(RESOURCE_WORKERS).map(([k, v]) => ({
        name:  `${k.padEnd(22)} — ${v.description}`,
        value: k,
      })),
    }]);
    resourceType = rt as ResourceShorthand;
  }

  const worker = RESOURCE_WORKERS[resourceType];
  if (!worker) {
    console.log(chalk.red(`Unknown resource type: ${resourceType}`));
    return;
  }

  console.log('');
  console.log(chalk.bold(`Adding ${resourceType} (${worker.label})`));
  console.log(chalk.gray(`  ${worker.description}`));
  if (worker.provider) console.log(chalk.gray(`  Requires: ${worker.provider}`));
  if (worker.timing)   console.log(chalk.gray(`  Timing:   ${worker.timing}`));
  console.log('');

  // Read package name from INFO
  let pkgName = 'mypkg';
  const infoPath = path.join(cwd, 'INFO');
  if (fs.exists(infoPath)) {
    const match = fs.read(infoPath).match(/^package="?([^"\n]+)"?/m);
    if (match?.[1]) pkgName = match[1];
  }

  const opts: { port?: number; shareName?: string; package: string } = { package: pkgName };

  if (resourceType === 'port' || resourceType === 'port+share') {
    const { port } = await inquirer.prompt([{
      type:     'input',
      name:     'port',
      message:  'Port number',
      default:  '8080',
      validate: (v: string) => {
        const p = parseInt(v, 10);
        return p > 0 && p < 65536 ? true : 'Port must be 1–65535';
      },
    }]);
    opts.port = parseInt(port as string, 10);
  }

  if (resourceType === 'data-share' || resourceType === 'port+share') {
    const { shareName } = await inquirer.prompt([{
      type:    'input',
      name:    'shareName',
      message: 'Shared folder name',
      default: `${pkgName}-data`,
    }]);
    opts.shareName = shareName as string;
  }

  // Read / merge existing resource
  const resourcePath = path.join(confDir, 'resource');
  let existing: ResourceConfig = {};
  if (fs.exists(resourcePath)) {
    try {
      existing = JSON.parse(fs.read(resourcePath)) as ResourceConfig;
    } catch {
      console.log(chalk.yellow('⚠  Existing conf/resource could not be parsed; will overwrite.'));
    }
  }

  const newConfig = JSON.parse(generateResource(resourceType, opts)) as ResourceConfig;
  const merged    = { ...existing, ...newConfig };

  fs.write(resourcePath, JSON.stringify(merged, null, 2) + '\n');

  console.log(chalk.green(`✓ Updated conf/resource — added: ${Object.keys(newConfig).join(', ')}`));
  console.log(chalk.gray('  Run "synocat validate ." to verify the configuration'));
  console.log('');
}

async function addScript(cwd: string, scriptName?: string): Promise<void> {
  const fs    = new NodeFileSystem();
  const valid = ['prereplace', 'postreplace'];

  if (!scriptName || !valid.includes(scriptName)) {
    const { sn } = await inquirer.prompt([{
      type:    'list',
      name:    'sn',
      message: 'Select script to add',
      choices: valid,
    }]);
    scriptName = sn as string;
  }

  const scriptPath = path.join(cwd, 'scripts', scriptName);

  if (fs.exists(scriptPath)) {
    const { overwrite } = await inquirer.prompt([{
      type:    'confirm',
      name:    'overwrite',
      message: `${scriptName} already exists. Overwrite?`,
      default: false,
    }]);
    if (!overwrite) return;
  }

  fs.write(scriptPath, generateScript(scriptName));
  fs.chmod(scriptPath, 0o755);
  console.log(chalk.green(`✓ Generated scripts/${scriptName}`));
}