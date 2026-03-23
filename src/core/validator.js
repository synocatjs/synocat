// /**
//  * 套件配置校验器
//  * 校验 INFO、conf/privilege、conf/resource、scripts/ 的规范性
//  */

// import fs from 'fs';
// import path from 'path';
// import {
//   INFO_FIELDS, INFO_REQUIRED_FIELDS, ARCH_VALUES,
//   RESOURCE_WORKERS, FIELD_DEPENDENCIES,
// } from './dsm-knowledge.js';

// export class PackageValidator {
//   constructor(packageDir) {
//     this.packageDir = packageDir;
//     this.errors = [];
//     this.warnings = [];
//     this.infos = [];
//   }

//   validate() {
//     this.errors = []; this.warnings = []; this.infos = [];
//     const infoPath = path.join(this.packageDir, 'INFO');
//     const infoshPath = path.join(this.packageDir, 'INFO.sh');
//     const privilegePath = path.join(this.packageDir, 'conf', 'privilege');
//     const resourcePath = path.join(this.packageDir, 'conf', 'resource');

//     // INFO / INFO.sh
//     if (fs.existsSync(infoPath)) {
//       const info = this._parseINFO(fs.readFileSync(infoPath, 'utf-8'));
//       this._validateINFO(info);
//     } else if (fs.existsSync(infoshPath)) {
//       this.infos.push('找到 INFO.sh（构建时会生成 INFO）');
//     } else {
//       this.errors.push('[INFO] 找不到 INFO 或 INFO.sh 文件');
//     }

//     // conf/privilege（DSM 7.0 强制）
//     if (fs.existsSync(privilegePath)) {
//       try {
//         this._validatePrivilege(JSON.parse(fs.readFileSync(privilegePath, 'utf-8')));
//       } catch (e) {
//         this.errors.push(`[conf/privilege] JSON 解析失败: ${e.message}`);
//       }
//     } else {
//       this.errors.push('[conf/privilege] 文件缺失 ── DSM 7.0 强制要求所有套件必须提供此文件');
//     }

//     // conf/resource（可选）
//     if (fs.existsSync(resourcePath)) {
//       try {
//         this._validateResource(JSON.parse(fs.readFileSync(resourcePath, 'utf-8')));
//       } catch (e) {
//         this.errors.push(`[conf/resource] JSON 解析失败: ${e.message}`);
//       }
//     }

//     this._validateScripts();
//     this._validateIcons();

//     return { valid: this.errors.length === 0, errors: this.errors, warnings: this.warnings, infos: this.infos };
//   }

//   _parseINFO(content) {
//     const result = {};
//     for (const line of content.split('\n')) {
//       const t = line.trim();
//       if (!t || t.startsWith('#')) continue;
//       const eq = t.indexOf('=');
//       if (eq === -1) continue;
//       const key = t.slice(0, eq).trim();
//       let val = t.slice(eq + 1).trim();
//       if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
//         val = val.slice(1, -1);
//       result[key] = val;
//     }
//     return result;
//   }

//   _validateINFO(info) {
//     // 必填
//     for (const f of INFO_REQUIRED_FIELDS)
//       if (!info[f]) this.errors.push(`[INFO] 必填字段缺失: "${f}"`);

//     // 逐字段
//     for (const [key, val] of Object.entries(info)) {
//       const def = INFO_FIELDS[key];
//       if (!def) {
//         this.warnings.push(`[INFO] 未知字段 "${key}"（可能是拼写错误）`);
//         continue;
//       }
//       if (def.deprecated) this.warnings.push(`[INFO] "${key}" 已废弃${def.replacement ? `，请改用 "${def.replacement}"` : ''}`);
//       if (def.enum && !def.enum.includes(val)) this.errors.push(`[INFO] "${key}" 的值 "${val}" 无效，允许值: ${def.enum.join(', ')}`);
//       if (def.validate) { const err = def.validate(val); if (err) this.errors.push(`[INFO] "${key}": ${err}`); }
//       if (def.warn) this.warnings.push(`[INFO] "${key}": ${def.warn}`);
//     }

//     // 字段联动
//     for (const dep of FIELD_DEPENDENCIES) {
//       const msg = dep.check(info);
//       if (msg) {
//         if (dep.severity === 'error') this.errors.push(`[INFO 联动] ${msg}`);
//         else this.warnings.push(`[INFO 联动] ${msg}`);
//       }
//     }

//     // os_min_ver DSM7 提醒
//     const major = parseInt((info.os_min_ver || '').split('.')[0] || '0');
//     if (major >= 7 && info.arch && !info.arch.split(' ').includes('noarch'))
//       this.infos.push(`[INFO] arch="${info.arch}" — 若套件无编译二进制可用 noarch 覆盖所有平台`);
//   }

//   _validatePrivilege(priv) {
//     if (!priv.defaults) { this.errors.push('[conf/privilege] 缺少 "defaults" 对象'); return; }
//     const runAs = priv.defaults['run-as'];
//     if (!runAs) this.errors.push('[conf/privilege] defaults 中缺少 "run-as" 字段');
//     else if (runAs === 'system') this.errors.push('[conf/privilege] "run-as: system" 在 DSM 7.0 已不支持，必须改为 "package"');
//     else if (runAs !== 'package') this.warnings.push(`[conf/privilege] "run-as: ${runAs}" 非标准值，标准值为 "package"`);
//   }

//   _validateResource(res) {
//     for (const [key, cfg] of Object.entries(res)) {
//       const worker = RESOURCE_WORKERS[key];
//       if (!worker) { this.warnings.push(`[conf/resource] 未知 Worker 类型: "${key}"`); continue; }
//       this.infos.push(`[conf/resource] ${key} (${worker.label}): ${worker.description}`);
//       if (worker.note) this.warnings.push(`[conf/resource] ${key}: ${worker.note}`);
//       if (worker.requiredFields) {
//         for (const rf of worker.requiredFields)
//           if (!cfg[rf]) this.errors.push(`[conf/resource] "${key}" 缺少必需字段: "${rf}"`);
//       }
//       if (key === 'data-share' && !cfg.shares) this.errors.push('[conf/resource] data-share 缺少 "shares" 数组');
//     }
//   }

//   _validateScripts() {
//     const dir = path.join(this.packageDir, 'scripts');
//     if (!fs.existsSync(dir)) { this.warnings.push('[scripts] 目录不存在（至少需要 start-stop-status）'); return; }
//     const sss = path.join(dir, 'start-stop-status');
//     if (!fs.existsSync(sss)) { this.warnings.push('[scripts] 缺少 start-stop-status 脚本'); return; }
//     const content = fs.readFileSync(sss, 'utf-8');
//     if (!content.startsWith('#!/')) this.warnings.push('[scripts] start-stop-status 缺少 shebang（如 #!/bin/sh）');
//     if (!content.includes('start)')) this.warnings.push('[scripts] start-stop-status 缺少 start) 分支');
//     if (!content.includes('stop)')) this.warnings.push('[scripts] start-stop-status 缺少 stop) 分支');
//     if (!content.includes('status)')) this.warnings.push('[scripts] start-stop-status 缺少 status) 分支');
//     try {
//       const mode = fs.statSync(sss).mode & 0o777;
//       if (!(mode & 0o111)) this.warnings.push('[scripts] start-stop-status 没有执行权限，请运行 chmod +x');
//     } catch {}
//   }

//   _validateIcons() {
//     if (!fs.existsSync(path.join(this.packageDir, 'PACKAGE_ICON.PNG')))
//       this.warnings.push('[图标] 缺少 PACKAGE_ICON.PNG（DSM 7.0 要求 64×64 像素）');
//     if (!fs.existsSync(path.join(this.packageDir, 'PACKAGE_ICON_256.PNG')))
//       this.infos.push('[图标] 建议提供 PACKAGE_ICON_256.PNG（256×256，高分屏）');
//   }
// }

// export function validateINFOString(content) {
//   const v = new PackageValidator('/tmp/_stub');
//   const info = v._parseINFO(content);
//   v._validateINFO(info);
//   return { valid: v.errors.length === 0, errors: v.errors, warnings: v.warnings, infos: v.infos, parsed: info };
// }
