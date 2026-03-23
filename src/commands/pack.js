// /**
//  * pack 命令 — 生成 .spk 打包目录结构
//  *
//  * 为前端开发者生成可以直接提交给 DSM 或 Synology Toolkit 的目录结构。
//  * 最终 .spk 格式（tar 包）需要在 Linux 环境用 PkgCreate.py 生成，
//  * 但此命令会帮助组织好所有文件并给出明确指引。
//  */

// import path from 'path';
// import fs from 'fs';
// import chalk from 'chalk';
// import ora from 'ora';
// import { PackageValidator } from '../core/validator.js';

// export async function packCommand(srcDir = '.', options = {}) {
//   const absSrc = path.resolve(process.cwd(), srcDir);
//   const outputBase = path.resolve(process.cwd(), options.output || './dist');

//   console.log('');
//   console.log(chalk.bold(`📦 打包: ${absSrc}`));
//   console.log(chalk.gray(`  输出: ${outputBase}\n`));

//   // 先校验
//   const validator = new PackageValidator(absSrc);
//   const result = validator.validate();

//   if (result.errors.length > 0) {
//     console.log(chalk.red('✗ 校验失败，修复以下错误后重试：'));
//     result.errors.forEach(e => console.log(chalk.red(`  ${e}`)));
//     console.log('');
//     process.exitCode = 1;
//     return;
//   }

//   if (result.warnings.length > 0) {
//     console.log(chalk.yellow('⚠ 存在警告（不影响打包，但建议修复）：'));
//     result.warnings.forEach(w => console.log(chalk.yellow(`  ${w}`)));
//     console.log('');
//   }

//   // 读取 INFO 获取 package/version
//   const infoPath = path.join(absSrc, 'INFO');
//   let pkgName = 'package', pkgVersion = '1.0.0-0001';
//   if (fs.existsSync(infoPath)) {
//     const content = fs.readFileSync(infoPath, 'utf-8');
//     const nameMatch = content.match(/^package="?([^"\n]+)"?/m);
//     const verMatch = content.match(/^version="?([^"\n]+)"?/m);
//     if (nameMatch) pkgName = nameMatch[1];
//     if (verMatch) pkgVersion = verMatch[1];
//   }

//   const outputDir = path.join(outputBase, `${pkgName}-${pkgVersion}`);
//   const spkDir = path.join(outputDir, 'spk');

//   const spinner = ora('组织 .spk 目录结构...').start();

//   try {
//     fs.mkdirSync(spkDir, { recursive: true });

//     // 必须文件：INFO
//     fs.copyFileSync(infoPath, path.join(spkDir, 'INFO'));

//     // conf/
//     const confSrc = path.join(absSrc, 'conf');
//     const confDst = path.join(spkDir, 'conf');
//     if (fs.existsSync(confSrc)) {
//       fs.mkdirSync(confDst, { recursive: true });
//       for (const f of fs.readdirSync(confSrc)) {
//         fs.copyFileSync(path.join(confSrc, f), path.join(confDst, f));
//       }
//     }

//     // scripts/
//     const scriptsSrc = path.join(absSrc, 'scripts');
//     const scriptsDst = path.join(spkDir, 'scripts');
//     if (fs.existsSync(scriptsSrc)) {
//       fs.mkdirSync(scriptsDst, { recursive: true });
//       for (const f of fs.readdirSync(scriptsSrc)) {
//         const dst = path.join(scriptsDst, f);
//         fs.copyFileSync(path.join(scriptsSrc, f), dst);
//         fs.chmodSync(dst, 0o755); // 确保执行权限
//       }
//     }

//     // WIZARD_UIFILES/
//     const wizardSrc = path.join(absSrc, 'WIZARD_UIFILES');
//     if (fs.existsSync(wizardSrc)) {
//       copyDir(wizardSrc, path.join(spkDir, 'WIZARD_UIFILES'));
//     }

//     // 图标
//     for (const icon of ['PACKAGE_ICON.PNG', 'PACKAGE_ICON_256.PNG']) {
//       const iconSrc = path.join(absSrc, icon);
//       if (fs.existsSync(iconSrc)) fs.copyFileSync(iconSrc, path.join(spkDir, icon));
//     }

//     // LICENSE
//     const licenseSrc = path.join(absSrc, 'LICENSE');
//     if (fs.existsSync(licenseSrc)) fs.copyFileSync(licenseSrc, path.join(spkDir, 'LICENSE'));

//     // package.tgz 说明（需要用户自己打包）
//     const packageTgzSrc = path.join(absSrc, 'package.tgz');
//     if (fs.existsSync(packageTgzSrc)) {
//       fs.copyFileSync(packageTgzSrc, path.join(spkDir, 'package.tgz'));
//     } else {
//       // 写一个说明文件
//       fs.writeFileSync(path.join(outputDir, 'PACKAGE_TGZ_README.md'),
//         generatePackageTgzGuide(pkgName, absSrc));
//     }

//     // 生成 checksum 清单
//     const manifest = generateManifest(spkDir);
//     fs.writeFileSync(path.join(outputDir, 'manifest.txt'), manifest);

//     spinner.succeed(chalk.green('✓ .spk 目录结构准备完成'));

//     // 输出结构
//     console.log('');
//     console.log(chalk.bold('输出目录：') + chalk.cyan(outputDir));
//     console.log('');
//     printTree(spkDir, '  ');

//     // 下一步指引
//     console.log('');
//     console.log(chalk.bold('下一步：'));

//     const hasTgz = fs.existsSync(path.join(spkDir, 'package.tgz'));
//     if (!hasTgz) {
//       console.log(chalk.yellow('  ① 准备 package.tgz（套件的实际应用文件）:'));
//       console.log(chalk.gray('     cd <你的应用目录>'));
//       console.log(chalk.gray('     tar czf package.tgz ./  # 打包应用文件'));
//       console.log(chalk.gray(`     cp package.tgz ${spkDir}/`));
//       console.log('');
//     }

//     console.log(chalk.gray('  在 Linux 环境中，用 Synology Toolkit 生成最终 .spk:'));
//     console.log(chalk.cyan(`    tar cf ${pkgName}-${pkgVersion}.spk -C ${spkDir} .`));
//     console.log('');
//     console.log(chalk.gray('  或者使用 pkgscripts-ng 工具链:'));
//     console.log(chalk.cyan(`    ./PkgCreate.py -v 7.2 -p [platform] ${pkgName}`));
//     console.log('');
//     console.log(chalk.gray('  安装测试: DSM > 套件中心 > 手动安装 > 上传 .spk'));
//     console.log('');

//   } catch (err) {
//     spinner.fail(chalk.red('打包失败'));
//     console.error(err);
//   }
// }

// function copyDir(src, dst) {
//   fs.mkdirSync(dst, { recursive: true });
//   for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
//     const s = path.join(src, entry.name), d = path.join(dst, entry.name);
//     entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
//   }
// }

// function printTree(dir, prefix = '') {
//   const entries = fs.readdirSync(dir, { withFileTypes: true });
//   entries.forEach((entry, i) => {
//     const isLast = i === entries.length - 1;
//     const connector = isLast ? '└── ' : '├── ';
//     const childPrefix = prefix + (isLast ? '    ' : '│   ');
//     const name = entry.isDirectory() ? chalk.bold(entry.name + '/') : entry.name;
//     console.log(prefix + chalk.gray(connector) + name);
//     if (entry.isDirectory()) printTree(path.join(dir, entry.name), childPrefix);
//   });
// }

// function generateManifest(spkDir) {
//   const lines = ['# .spk 文件清单', `# 生成时间: ${new Date().toISOString()}`, ''];
//   function walk(d, base = '') {
//     for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
//       const rel = base ? `${base}/${entry.name}` : entry.name;
//       if (entry.isDirectory()) walk(path.join(d, entry.name), rel);
//       else lines.push(rel);
//     }
//   }
//   walk(spkDir);
//   return lines.join('\n');
// }

// function generatePackageTgzGuide(pkgName, srcDir) {
//   return `# package.tgz 准备指南

// ## 什么是 package.tgz？

// package.tgz 是套件的"应用载体"——包含套件运行所需的所有文件：
// - 可执行文件（二进制、Node.js 脚本等）
// - UI 文件（若设置了 dsmuidir）
// - 配置文件模板
// - 静态资源

// 安装后，package.tgz 会被解压到 \`/var/packages/${pkgName}/target/\`

// ## 如何准备

// ### Node.js 套件

// \`\`\`bash
// # 安装生产依赖
// npm install --production

// # 打包（排除开发文件）
// tar czf package.tgz \\
//   --exclude=node_modules/.cache \\
//   --exclude='.git*' \\
//   --exclude='*.test.js' \\
//   src/ node_modules/ package.json
// \`\`\`

// ### 含 UI 的套件

// \`\`\`bash
// # 先构建 UI
// cd ui && npm run build && cd ..

// # 打包（包含构建后的 UI）
// tar czf package.tgz ui/dist/ bin/ lib/
// \`\`\`

// ### Docker 套件

// Docker Compose 套件的 package.tgz 包含 compose 目录：

// \`\`\`bash
// tar czf package.tgz compose/
// \`\`\`

// ## 打包后

// 将生成的 package.tgz 复制到 .spk 目录：

// \`\`\`bash
// cp package.tgz ${srcDir}/../dist/${pkgName}-*/spk/
// \`\`\`

// 然后重新运行 \`synopkg pack .\`
// `;
// }
