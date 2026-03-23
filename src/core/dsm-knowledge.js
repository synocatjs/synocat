// /**
//  * DSM 7 Package Knowledge Base
//  * 基于 DSM Developer Guide 7.2.2 整理
//  * 完整字段规则、字段联动、枚举值、Worker 配置
//  */

// // ─── 必填字段（DSM 7.0 强制要求）──────────────────────────────────────────
// export const INFO_REQUIRED_FIELDS = [
//   'package', 'version', 'os_min_ver', 'description', 'arch', 'maintainer',
// ];

// // ─── 所有 arch 值（Appendix A 精简）────────────────────────────────────────
// export const ARCH_VALUES = [
//   'noarch',
//   // x86_64 家族
//   'x86_64','bromolow','cedarview','avoton','braswell','broadwell',
//   'broadwellnk','broadwellntbap','denverton','geminilake','apollolake',
//   'v1000','r1000','purley','epyc7002',
//   // ARM64
//   'armv8','alpine','alpine4k','rtd1296','rtd1619b',
//   // ARM32
//   'armv7','ipq806x','hi3535','dakota','armada37xx',
//   // 其他
//   'ppc854x','qoriq',
// ];

// // ─── DSM 7.0 可用系统服务────────────────────────────────────────────────────
// export const DSM7_SERVICES = [
//   'ssh-shell','pgsql','network.target','network-online.target',
//   'nginx.service','avahi.service','atalk.service','crond.service','nfsserver.service',
// ];

// // ─── INFO 字段完整定义────────────────────────────────────────────────────────
// export const INFO_FIELDS = {
//   // ── 必填 ──
//   package: {
//     required: true,
//     type: 'string',
//     label: '套件 ID',
//     description: '套件唯一标识符。Package Center 会创建 /var/packages/[id]/ 目录。',
//     note: '不能包含特殊字符：: / > < | =',
//     example: 'MyAwesomeApp',
//     validate(v) {
//       if (!v) return '必填';
//       if (/[:/><=|]/.test(v)) return '不能包含特殊字符：: / > < | =';
//       return null;
//     },
//   },
//   version: {
//     required: true,
//     type: 'string',
//     label: '版本号',
//     description: '格式为 [功能版本]-[构建号]，分隔符只能是 . - _，每段只能是数字。',
//     note: '构建号在每次发布时应递增，用于区分不同 DSM 版本的包。',
//     example: '1.2.0-0001',
//     validate(v) {
//       if (!v) return '必填';
//       if (!/^[\d._-]+$/.test(v)) return '只能包含数字、点、下划线、连字符';
//       return null;
//     },
//   },
//   os_min_ver: {
//     required: true,
//     type: 'string',
//     label: '最低 DSM 版本',
//     description: '运行此套件所需的最低 DSM 版本。DSM 7.0 起必须 >= 7.0-40000。',
//     example: '7.0-40000',
//     validate(v) {
//       if (!v) return '必填';
//       const m = v.match(/^(\d+)\.(\d+)-(\d+)$/);
//       if (!m) return '格式应为 X.Y-Z（例如 7.0-40000）';
//       if (parseInt(m[1]) === 7 && parseInt(m[2]) === 0 && parseInt(m[3]) < 40000)
//         return 'DSM 7.0 的构建号必须 >= 40000';
//       return null;
//     },
//   },
//   description: {
//     required: true,
//     type: 'string',
//     label: '套件描述',
//     description: '在 Package Center 显示的简短描述。',
//     example: 'A web-based file manager for your NAS',
//     validate: (v) => (!v ? '必填' : null),
//   },
//   arch: {
//     required: true,
//     type: 'string',
//     label: 'CPU 架构',
//     description: '支持的 CPU 架构列表（空格分隔）。noarch 表示支持所有平台。',
//     note: '纯 JS/PHP/Shell 套件请用 noarch；含编译二进制的套件需指定具体架构。',
//     example: 'noarch',
//     enum: null,
//     validate(v) {
//       if (!v) return '必填';
//       for (const a of v.split(' ').filter(Boolean)) {
//         if (a !== 'noarch' && !ARCH_VALUES.includes(a))
//           return `未知架构值: "${a}"，请参考附录 A 平台映射表`;
//       }
//       return null;
//     },
//   },
//   maintainer: {
//     required: true,
//     type: 'string',
//     label: '维护者',
//     description: '在 Package Center 显示的开发者/公司名称。',
//     example: 'Your Company Inc.',
//     validate: (v) => (!v ? '必填' : null),
//   },

//   // ── 显示相关 ──
//   displayname: {
//     type: 'string',
//     label: '显示名称',
//     description: '在 Package Center 显示的套件名称。若不设置，使用 package 字段值。',
//     example: 'My Awesome App',
//   },
//   maintainer_url: {
//     type: 'string',
//     label: '开发者网页',
//     description: '开发者主页链接，在 Package Center 中显示。',
//     example: 'https://www.example.com',
//   },
//   distributor: { type: 'string', label: '发布者', description: '发布者名称。' },
//   distributor_url: { type: 'string', label: '发布者网页', description: '发布者主页链接。' },
//   support_url: { type: 'string', label: '支持链接', description: '技术支持页面。' },
//   helpurl: { type: 'string', label: '帮助链接', description: '套件帮助文档链接。' },

//   // ── 管理界面三元组（adminport + adminprotocol + adminurl → 访问链接）──
//   adminport: {
//     type: 'number',
//     label: '管理端口',
//     description: '套件 UI 监听的端口。与 adminprotocol 和 adminurl 共同组成访问链接：adminprotocol://nas-ip:adminport/adminurl',
//     example: '8080',
//     related: ['adminprotocol', 'adminurl'],
//     validate(v) {
//       if (!v) return null;
//       const p = parseInt(v);
//       if (isNaN(p) || p < 1 || p > 65535) return '端口范围为 1-65535';
//       return null;
//     },
//   },
//   adminprotocol: {
//     type: 'string',
//     label: '管理协议',
//     description: '管理界面协议。与 adminport 和 adminurl 共同组成访问链接。',
//     enum: ['http', 'https'],
//     default: 'http',
//     related: ['adminport', 'adminurl'],
//   },
//   adminurl: {
//     type: 'string',
//     label: '管理 URL',
//     description: '管理界面路径。与 adminprotocol 和 adminport 共同组成访问链接。',
//     example: '/',
//     related: ['adminprotocol', 'adminport'],
//   },
//   checkport: {
//     type: 'string',
//     label: '检查端口冲突',
//     description: '安装时检查 adminport 是否与 DSM 保留端口冲突（排除 80/443/5000/5001）。',
//     enum: ['yes', 'no'],
//     default: 'yes',
//   },

//   // ── DSM 桌面 UI 集成链（dsmuidir → dsmappname → dsmapppage）──
//   dsmuidir: {
//     type: 'string',
//     label: 'UI 目录',
//     description: 'package.tgz 中 UI 文件夹的路径。DSM 会在 /usr/syno/synoman/webman/3rdparty/ 创建软链接。多应用格式：MyApp1:ui/app1 MyApp2:ui/app2',
//     example: 'ui',
//     related: ['dsmappname', 'dsmapppage'],
//   },
//   dsmappname: {
//     type: 'string',
//     label: '应用名称',
//     description: '桌面应用的唯一标识符，决定 Package Center"打开"按钮跳转的应用。需与 app.config 中的键名匹配。',
//     example: 'com.company.MyApp',
//     related: ['dsmuidir', 'dsmapppage'],
//   },
//   dsmapppage: {
//     type: 'string',
//     label: '应用页面',
//     description: '点击"打开"时跳转到的具体页面（PageListAppWindow 的 fn 值）。',
//     dsm_min: '7.0-40332',
//     related: ['dsmappname'],
//   },
//   dsmapplaunchname: {
//     type: 'string',
//     label: '启动应用名',
//     description: '启动桌面应用的名称，优先级高于 dsmappname。',
//     dsm_min: '7.0-40796',
//   },

//   // ── 套件行为 ──
//   ctl_stop: {
//     type: 'string',
//     label: '允许停止',
//     description: '设为 no 时，用户无法在 Package Center 手动启停套件。',
//     enum: ['yes', 'no'],
//     default: 'yes',
//     dsm_min: '6.1-14907',
//   },
//   ctl_uninstall: {
//     type: 'string',
//     label: '允许卸载',
//     description: '设为 no 时，用户无法在 Package Center 卸载套件。',
//     enum: ['yes', 'no'],
//     default: 'yes',
//     dsm_min: '6.1-14907',
//   },
//   precheckstartstop: {
//     type: 'string',
//     label: '启停前检查',
//     description: '设为 yes 时，启停前会调用 start-stop-status 脚本的 prestart/prestop 分支。DSM 7.0 起，prestart 在开机时也会被调用。',
//     enum: ['yes', 'no'],
//     default: 'yes',
//   },
//   startable: {
//     type: 'string',
//     label: '可启停（已废弃）',
//     description: '已在 DSM 6.1-14907 废弃，请改用 ctl_stop。',
//     enum: ['yes', 'no'],
//     deprecated: true,
//     replacement: 'ctl_stop',
//   },

//   // ── 安装行为 ──
//   install_reboot: {
//     type: 'string',
//     label: '安装后重启',
//     description: '安装或升级后是否重启 NAS。',
//     enum: ['yes', 'no'],
//     default: 'no',
//   },
//   install_type: {
//     type: 'string',
//     label: '安装位置',
//     description: '设为 system 时安装到根分区（无卷也可安装），注意根分区空间有限。',
//     enum: ['system', 'system_hidden', ''],
//     warn: '根分区空间有限，使用 install_type=system 需谨慎',
//   },
//   install_on_cold_storage: {
//     type: 'string',
//     label: '冷存储安装',
//     description: '是否允许安装到冷存储设备。',
//     enum: ['yes', 'no'],
//     default: 'no',
//     dsm_min: '7.0-40726',
//   },
//   support_move: {
//     type: 'string',
//     label: '支持迁移',
//     description: '是否允许安装后将套件移动到其他卷。',
//     enum: ['yes', 'no'],
//     default: 'no',
//     dsm_min: '6.2-22306',
//   },

//   // ── 静默操作（CMS 批量管理）──
//   silent_install: {
//     type: 'string',
//     label: '静默安装',
//     description: '允许在没有向导界面的情况下安装（CMS 批量部署时必须）。',
//     enum: ['yes', 'no'],
//     default: 'no',
//   },
//   silent_upgrade: {
//     type: 'string',
//     label: '静默升级',
//     description: '允许自动静默升级（配合 auto_upgrade_from 使用）。',
//     enum: ['yes', 'no'],
//     default: 'no',
//   },
//   silent_uninstall: {
//     type: 'string',
//     label: '静默卸载',
//     description: '允许在没有向导界面的情况下卸载。',
//     enum: ['yes', 'no'],
//     default: 'no',
//   },
//   auto_upgrade_from: {
//     type: 'string',
//     label: '自动升级起始版本',
//     description: '仅从此版本（含）以上的安装才会自动升级（配合 silent_upgrade=yes）。',
//     dsm_min: '5.2-5565',
//     related: ['silent_upgrade'],
//   },

//   // ── 版本约束 ──
//   os_max_ver: {
//     type: 'string',
//     label: '最高 DSM 版本',
//     description: '套件支持的最高 DSM 版本，超出则不显示。',
//     example: '7.2-64570',
//   },

//   // ── 依赖/冲突 ──
//   install_dep_packages: {
//     type: 'string',
//     label: '依赖套件',
//     description: '安装本套件前必须已安装的套件（冒号分隔，可带版本约束）。',
//     example: 'Node.js>18.0:PHP',
//     related: ['install_conflict_packages'],
//   },
//   install_conflict_packages: {
//     type: 'string',
//     label: '冲突套件',
//     description: '与本套件冲突的套件（安装前不能存在）。',
//   },
//   install_break_packages: {
//     type: 'string',
//     label: '破坏套件',
//     description: '本套件安装后会导致停止的其他套件。',
//     dsm_min: '6.1-15117',
//   },
//   install_replace_packages: {
//     type: 'string',
//     label: '替换套件',
//     description: '本套件安装后会替换（删除）的旧套件。',
//     dsm_min: '6.1-15117',
//     related: ['use_deprecated_replace_mechanism'],
//   },
//   install_dep_services: {
//     type: 'string',
//     label: '依赖系统服务',
//     description: 'DSM 7.0 可选值：ssh-shell, pgsql, nginx.service, avahi.service, crond.service 等（空格分隔）。',
//     example: 'ssh-shell',
//   },
//   start_dep_services: {
//     type: 'string',
//     label: '启动依赖服务',
//     description: '套件启动前必须开启的 DSM 系统服务。',
//   },

//   // ── 其他 ──
//   beta: { type: 'string', label: 'Beta 版本', enum: ['yes', 'no'], default: 'no', description: '标记为测试版本。' },
//   report_url: { type: 'string', label: '反馈链接', description: 'Beta 版问题反馈链接。', related: ['beta'] },
//   offline_install: { type: 'string', label: '离线安装', enum: ['yes', 'no'], default: 'no', description: '从官方 Package Center 隐藏，只能手动安装。', dsm_min: '6.0' },
//   checksum: { type: 'string', label: 'MD5 校验', description: 'package.tgz 的 MD5 校验值。' },
//   extractsize: { type: 'number', label: '安装空间(KB)', description: '安装所需最小磁盘空间（单位 KB，DSM 6.0+）。' },
//   use_deprecated_replace_mechanism: {
//     type: 'string',
//     label: '旧版替换机制',
//     enum: ['yes', 'no'],
//     default: 'no',
//     description: '设为 yes 时使用旧版替换顺序（先安装新包再卸载旧包），不执行 prereplace/postreplace。',
//     dsm_min: '7.0-40340',
//     related: ['install_replace_packages'],
//   },
// };

// // ─── 字段联动依赖关系（用于校验时提示）────────────────────────────────────
// export const FIELD_DEPENDENCIES = [
//   {
//     name: 'admin_url_triple',
//     fields: ['adminprotocol', 'adminport', 'adminurl'],
//     check(info) {
//       const any = info.adminport || info.adminurl || info.adminprotocol;
//       if (!any) return null;
//       const missing = ['adminport', 'adminurl'].filter(f => !info[f]);
//       return missing.length
//         ? `使用管理界面时，建议同时设置：${missing.join(', ')}`
//         : null;
//     },
//     severity: 'warning',
//   },
//   {
//     name: 'dsmui_chain',
//     fields: ['dsmuidir', 'dsmappname', 'dsmapppage'],
//     check(info) {
//       if (info.dsmappname && !info.dsmuidir) return 'dsmappname 必须配合 dsmuidir 使用';
//       if (info.dsmapppage && !info.dsmappname) return 'dsmapppage 必须配合 dsmappname 使用';
//       return null;
//     },
//     severity: 'error',
//   },
//   {
//     name: 'beta_report',
//     fields: ['beta', 'report_url'],
//     check: (info) => (info.beta === 'yes' && !info.report_url ? '标记为 beta 时建议提供 report_url' : null),
//     severity: 'warning',
//   },
//   {
//     name: 'deprecated_startable',
//     fields: ['startable'],
//     check: (info) => (info.startable ? 'startable 已废弃，请改用 ctl_stop' : null),
//     severity: 'warning',
//   },
//   {
//     name: 'replace_mechanism',
//     fields: ['install_replace_packages', 'use_deprecated_replace_mechanism'],
//     check: (info) => (info.use_deprecated_replace_mechanism === 'yes' && !info.install_replace_packages
//       ? 'use_deprecated_replace_mechanism 需配合 install_replace_packages 使用' : null),
//     severity: 'warning',
//   },
//   {
//     name: 'silent_upgrade_from',
//     fields: ['silent_upgrade', 'auto_upgrade_from'],
//     check: (info) => (info.auto_upgrade_from && info.silent_upgrade !== 'yes'
//       ? 'auto_upgrade_from 需配合 silent_upgrade=yes 才生效' : null),
//     severity: 'warning',
//   },
// ];

// // ─── Resource Worker 定义──────────────────────────────────────────────────
// export const RESOURCE_WORKERS = {
//   'data-share': {
//     label: '共享文件夹',
//     description: '申请访问 NAS 共享文件夹的权限。',
//     timing: 'FROM_POSTINST_TO_PREUNINST',
//     requiredFields: ['shares'],
//     example: {
//       'data-share': { shares: [{ name: 'MyData', permission: { rw: ['sc-mypkg'] } }] },
//     },
//   },
//   'port-config': {
//     label: '端口配置',
//     description: '在 DSM 防火墙中注册套件使用的端口。',
//     timing: 'FROM_POSTINST_TO_PREUNINST',
//     example: {
//       'port-config': { protocol_type: 'both', ports: { main: { protocol: 'tcp', src: 8080, dst: 8080 } } },
//     },
//   },
//   'web-service': {
//     label: 'Web 服务',
//     description: '注册 HTTP/HTTPS 路由到 DSM nginx。',
//     timing: 'FROM_POSTINST_TO_PREUNINST',
//   },
//   'docker': {
//     label: 'Docker 容器',
//     description: '通过 ContainerManager 管理 Docker 容器（单容器）。',
//     timing: 'FROM_POSTINST_TO_PREUNINST / FROM_STARTUP_TO_HALT',
//     provider: 'ContainerManager',
//   },
//   'docker-project': {
//     label: 'Docker Compose 项目',
//     description: '通过 ContainerManager 管理多容器 Compose 项目。',
//     timing: 'FROM_POSTINST_TO_PREUNINST / FROM_STARTUP_TO_HALT',
//     provider: 'ContainerManager >= 1432 (DSM 7.2.1+)',
//     note: '需要 DSM 7.2.1+ 版本的 ContainerManager',
//   },
//   'mariadb10-db': {
//     label: 'MariaDB 10',
//     description: '安装/卸载时自动创建/删除 MariaDB 数据库和用户。',
//     timing: 'FROM_PREINST_TO_PREUNINST / FROM_POSTINST_TO_POSTUNINST',
//     provider: 'MariaDB10 package',
//     requiredFields: ['admin-account-m10'],
//   },
//   'indexdb': {
//     label: '索引数据库',
//     description: '注册桌面应用和帮助文档索引（enable/disable 时触发）。',
//     timing: 'FROM_ENABLE_TO_DISABLE',
//   },
//   'systemd-user-unit': {
//     label: 'Systemd 用户单元',
//     description: '管理 systemd 用户级别的服务单元。',
//     timing: 'FROM_STARTUP_TO_HALT',
//     dsm_min: '7.0',
//   },
// };

// // ─── scripts 执行顺序──────────────────────────────────────────────────────
// export const SCRIPT_LIFECYCLE = {
//   install:   ['prereplace?', 'preinst', 'postinst', 'postreplace?', 'prestart?', 'start?'],
//   upgrade:   ['prestop(old)', 'stop(old)', 'preupgrade', 'preuninst(old)', 'postuninst(old)',
//                'prereplace?', 'preinst', 'postinst', 'postreplace?', 'postupgrade', 'prestart?', 'start?'],
//   uninstall: ['prestop?', 'stop?', 'preuninst', 'postuninst'],
//   start:     ['prestart', 'start'],
//   stop:      ['prestop', 'stop'],
// };
