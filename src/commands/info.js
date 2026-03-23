// /**
//  * info 命令 — 查看 INFO 字段文档
//  * synopkg info adminport
//  * synopkg info arch
//  * synopkg info  （不带参数，列出所有字段）
//  */

// import chalk from 'chalk';
// import { INFO_FIELDS, ARCH_VALUES, RESOURCE_WORKERS, SCRIPT_LIFECYCLE } from '../core/dsm-knowledge.js';

// export function infoCommand(field, options = {}) {
//   if (!field) {
//     listAllFields();
//     return;
//   }

//   // 特殊主题
//   if (field === 'arch' || field === 'archs') { showArchList(); return; }
//   if (field === 'resource' || field === 'workers') { showResourceWorkers(); return; }
//   if (field === 'lifecycle' || field === 'scripts') { showLifecycle(); return; }
//   if (field === 'privilege') { showPrivilege(); return; }

//   const def = INFO_FIELDS[field];
//   if (!def) {
//     console.log(chalk.red(`\n  未找到字段 "${field}"\n`));
//     // 模糊匹配建议
//     const similar = Object.keys(INFO_FIELDS).filter(k =>
//       k.includes(field) || field.includes(k.slice(0, 4))
//     );
//     if (similar.length) {
//       console.log(chalk.gray('  相似字段：') + similar.map(k => chalk.cyan(k)).join('  '));
//     }
//     console.log(chalk.gray('\n  用 synopkg info 查看所有字段列表\n'));
//     return;
//   }

//   console.log('');
//   console.log(chalk.bold(`  ${chalk.cyan(field)}${def.required ? chalk.red(' *必填') : chalk.gray(' 可选')}`));
//   console.log(chalk.gray(`  ${'─'.repeat(60)}`));
//   console.log(`  ${chalk.bold('说明：')} ${def.description}`);
//   if (def.note) console.log(`  ${chalk.bold('注意：')} ${chalk.yellow(def.note)}`);
//   if (def.example) console.log(`  ${chalk.bold('示例：')} ${chalk.green(`${field}="${def.example}"`)}`);
//   if (def.default !== undefined) console.log(`  ${chalk.bold('默认值：')} ${def.default}`);
//   if (def.enum) console.log(`  ${chalk.bold('允许值：')} ${def.enum.map(e => chalk.green(`"${e}"`)).join(' | ')}`);
//   if (def.deprecated) console.log(`  ${chalk.bold('状态：')} ${chalk.red('已废弃')}${def.replacement ? ` → 请改用 ${chalk.cyan(def.replacement)}` : ''}`);
//   if (def.dsm_min) console.log(`  ${chalk.bold('最低 DSM：')} ${def.dsm_min}`);
//   if (def.related) console.log(`  ${chalk.bold('相关字段：')} ${def.related.map(r => chalk.cyan(r)).join('  ')}`);
//   if (def.warn) console.log(`  ${chalk.bold('警告：')} ${chalk.yellow(def.warn)}`);
//   console.log('');
// }

// function listAllFields() {
//   console.log('');
//   console.log(chalk.bold('  INFO 字段列表') + chalk.red(' *') + chalk.gray(' = 必填\n'));

//   const required = Object.entries(INFO_FIELDS).filter(([, d]) => d.required);
//   const optional = Object.entries(INFO_FIELDS).filter(([, d]) => !d.required && !d.deprecated);
//   const deprecated = Object.entries(INFO_FIELDS).filter(([, d]) => d.deprecated);

//   console.log(chalk.bold.red('  必填字段'));
//   required.forEach(([k, d]) => console.log(`    ${chalk.red('*')} ${chalk.cyan(k.padEnd(28))} ${chalk.gray(d.label || '')}`));

//   console.log('');
//   console.log(chalk.bold('  可选字段'));
//   optional.forEach(([k, d]) => console.log(`      ${chalk.cyan(k.padEnd(28))} ${chalk.gray(d.label || '')}`));

//   if (deprecated.length) {
//     console.log('');
//     console.log(chalk.bold.gray('  已废弃'));
//     deprecated.forEach(([k, d]) => console.log(`      ${chalk.gray(k.padEnd(28))} ${chalk.gray('→ ' + (d.replacement || '已移除'))}`));
//   }

//   console.log('');
//   console.log(chalk.gray('  用法: synopkg info <字段名>  例如: synopkg info adminport'));
//   console.log(chalk.gray('  特殊主题: synopkg info arch | resource | lifecycle | privilege'));
//   console.log('');
// }

// function showArchList() {
//   console.log('');
//   console.log(chalk.bold('  支持的 arch 值（Appendix A）\n'));
//   console.log(`  ${chalk.cyan('noarch')}${' '.repeat(18)}所有平台（纯脚本/JS/PHP 套件推荐）`);
//   console.log('');
//   const groups = {
//     'x86_64 家族': ['x86_64','bromolow','cedarview','avoton','braswell','broadwell','broadwellnk','denverton','geminilake','apollolake','v1000','r1000'],
//     'ARM 64-bit': ['armv8','alpine','alpine4k','rtd1296','rtd1619b'],
//     'ARM 32-bit': ['armv7','ipq806x','armada37xx'],
//   };
//   for (const [g, archs] of Object.entries(groups)) {
//     console.log(chalk.bold(`  ${g}`));
//     const row = archs.map(a => chalk.cyan(a)).join('  ');
//     console.log(`    ${row}`);
//     console.log('');
//   }
//   console.log(chalk.gray('  提示: 多个架构用空格分隔，如 arch="x86_64 armv8"\n'));
// }

// function showResourceWorkers() {
//   console.log('');
//   console.log(chalk.bold('  conf/resource — Worker 类型\n'));
//   for (const [key, w] of Object.entries(RESOURCE_WORKERS)) {
//     console.log(`  ${chalk.cyan(key.padEnd(22))} ${chalk.bold(w.label)}`);
//     console.log(`  ${' '.repeat(22)} ${chalk.gray(w.description)}`);
//     if (w.timing) console.log(`  ${' '.repeat(22)} ${chalk.gray('时机: ' + w.timing)}`);
//     if (w.provider) console.log(`  ${' '.repeat(22)} ${chalk.yellow('需要: ' + w.provider)}`);
//     console.log('');
//   }
//   console.log(chalk.gray('  用法: synopkg add resource <type>  例如: synopkg add resource port\n'));
// }

// function showLifecycle() {
//   console.log('');
//   console.log(chalk.bold('  脚本执行顺序\n'));
//   for (const [phase, steps] of Object.entries(SCRIPT_LIFECYCLE)) {
//     console.log(chalk.bold(`  ${phase}:`));
//     steps.forEach((s, i) => {
//       const optional = s.startsWith('(') || s.endsWith('?');
//       const name = s.replace(/[()？?]/g, '');
//       console.log(`    ${i + 1}. ${optional ? chalk.gray(name + ' (可选)') : chalk.cyan(name)}`);
//     });
//     console.log('');
//   }
// }

// function showPrivilege() {
//   console.log('');
//   console.log(chalk.bold('  conf/privilege — DSM 7.0 强制要求\n'));
//   console.log(`  所有套件必须以普通用户身份运行（DSM 7.0 移除了 run-as: system）\n`);
//   console.log(chalk.bold('  最简配置：'));
//   console.log(chalk.green(`  {
//     "defaults": {
//       "run-as": "package"
//     }
//   }`));
//   console.log('');
//   console.log(chalk.gray('  位置: conf/privilege'));
//   console.log(chalk.gray('  若此文件缺失，套件在 DSM 7.0 将无法安装\n'));
// }
