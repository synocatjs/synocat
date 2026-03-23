/**
 * add 命令 — 向现有套件添加配置
 * synopkg add resource port
 * synopkg add resource data-share
 * synopkg add resource mariadb
 * synopkg add resource docker
 * synopkg add script prereplace
 */

import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { generateResource, generateScript } from '../core/generator.js';
import { RESOURCE_WORKERS } from '../core/dsm-knowledge.js';

export async function addCommand(type, subtype, options = {}) {
  const cwd = process.cwd();

  if (type === 'resource') {
    await addResource(cwd, subtype);
  } else if (type === 'script') {
    await addScript(cwd, subtype);
  } else {
    console.log(chalk.red(`未知类型: ${type}`));
    console.log(chalk.gray('用法: synopkg add resource <type>  |  synopkg add script <name>'));
  }
}

async function addResource(cwd, resourceType) {
  const confDir = path.join(cwd, 'conf');
  const resourcePath = path.join(confDir, 'resource');

  // 选择资源类型
  if (!resourceType) {
    const { rt } = await inquirer.prompt([{
      type: 'list',
      name: 'rt',
      message: '选择要添加的资源类型',
      choices: Object.entries(RESOURCE_WORKERS).map(([k, v]) => ({
        name: `${k.padEnd(20)} — ${v.description}`,
        value: k,
      })),
    }]);
    resourceType = rt;
  }

  const worker = RESOURCE_WORKERS[resourceType];
  if (!worker) { console.log(chalk.red(`未知资源类型: ${resourceType}`)); return; }

  console.log('');
  console.log(chalk.bold(`添加 ${resourceType} (${worker.label})`));
  console.log(chalk.gray(`  ${worker.description}`));
  if (worker.provider) console.log(chalk.gray(`  需要: ${worker.provider}`));
  if (worker.timing) console.log(chalk.gray(`  触发时机: ${worker.timing}`));
  console.log('');

  // 读取 package 名
  let pkgName = 'mypkg';
  const infoPath = path.join(cwd, 'INFO');
  if (fs.existsSync(infoPath)) {
    const infoContent = fs.readFileSync(infoPath, 'utf-8');
    const match = infoContent.match(/^package="?([^"\n]+)"?/m);
    if (match) pkgName = match[1];
  }

  // 按类型问答
  const opts = { package: pkgName };

  if (resourceType === 'port-config' || resourceType === 'port') {
    const { port } = await inquirer.prompt([{
      type: 'input', name: 'port', message: '端口号', default: '8080',
      validate: v => (parseInt(v) > 0 && parseInt(v) < 65536) || '端口范围 1-65535',
    }]);
    opts.port = parseInt(port);
    resourceType = 'port';
  }

  if (resourceType === 'data-share') {
    const { shareName } = await inquirer.prompt([{
      type: 'input', name: 'shareName', message: '共享文件夹名称', default: `${pkgName}-data`,
    }]);
    opts.shareName = shareName;
  }

  // 读取/合并已有 resource
  let existing = {};
  if (fs.existsSync(resourcePath)) {
    try { existing = JSON.parse(fs.readFileSync(resourcePath, 'utf-8')); } catch {}
  }

  const newConfig = JSON.parse(generateResource(resourceType, opts));
  const merged = { ...existing, ...newConfig };

  fs.mkdirSync(confDir, { recursive: true });
  fs.writeFileSync(resourcePath, JSON.stringify(merged, null, 2) + '\n');

  console.log(chalk.green(`✓ 已更新 conf/resource，添加了 ${Object.keys(newConfig).join(', ')}`));
  console.log(chalk.gray('  运行 synopkg validate . 验证配置'));
  console.log('');
}

async function addScript(cwd, scriptName) {
  const valid = ['prereplace', 'postreplace'];
  if (!scriptName || !valid.includes(scriptName)) {
    const { sn } = await inquirer.prompt([{
      type: 'list', name: 'sn', message: '选择脚本', choices: valid,
    }]);
    scriptName = sn;
  }
  const scriptPath = path.join(cwd, 'scripts', scriptName);
  if (fs.existsSync(scriptPath)) {
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm', name: 'overwrite',
      message: `${scriptName} 已存在，是否覆盖？`, default: false,
    }]);
    if (!overwrite) return;
  }
  fs.mkdirSync(path.join(cwd, 'scripts'), { recursive: true });
  fs.writeFileSync(scriptPath, generateScript(scriptName));
  fs.chmodSync(scriptPath, 0o755);
  console.log(chalk.green(`✓ 已生成 scripts/${scriptName}`));
}
