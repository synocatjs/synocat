# synocat

> Synology DSM 7 套件脚手架 CLI — 专为前端开发者设计

[![DSM](https://img.shields.io/badge/DSM-7.2.2-blue)](https://help.synology.com/developer-guide/)
[![Node](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)

## 安装

```bash
npm install -g synocat
```
## 本地测试

```bash
npm link
```

## 快速开始

```bash
# 交互式创建新套件（推荐）
npx synocat

# 或者全局安装后使用子命令
synopkg create MyApp
```

## 命令参考

### `create` — 创建套件脚手架

```bash
npx synocat [套件名]
synopkg create [套件名] [--template <类型>]
```

**支持的模板类型：**

| 模板 | 说明 | 适用场景 |
|------|------|---------|
| `minimal` | 纯脚本套件（Shell，noarch） | 简单任务、备份脚本 |
| `node-service` | Node.js 后端服务 | API 服务、自动化任务 |
| `vue-desktop` | Vue.js 桌面应用 | 含 DSM 桌面 UI 集成 |
| `docker` | Docker Compose 套件 | 容器化应用 |

创建后得到的目录结构：

```
MyApp/
├── INFO                       # 套件元数据（自动生成，含所有填写的字段）
├── conf/
│   ├── privilege              # DSM 7.0 强制：{ "defaults": { "run-as": "package" } }
│   └── resource               # 系统资源（按需生成：port/data-share/mariadb/docker）
├── scripts/
│   ├── start-stop-status      # 生命周期控制（已含 start/stop/status/prestart/prestop）
│   ├── preinst / postinst
│   ├── preuninst / postuninst
│   └── preupgrade / postupgrade
├── .vscode/settings.json      # IDE JSON Schema 绑定（conf/resource 有自动补全）
├── .synopkg/schemas/
│   └── resource.schema.json   # conf/resource 的 JSON Schema
└── README.md                  # 项目说明（含开发工作流）
```

---

### `validate` — 校验套件配置

```bash
synopkg validate [目录]
synopkg validate .
synopkg validate ./MyApp
```

校验内容：

| 文件 | 检查项 |
|------|--------|
| `INFO` | 必填字段、字段格式、枚举值、字段联动关系 |
| `conf/privilege` | DSM 7.0 强制要求（必须存在，run-as 只能为 package） |
| `conf/resource` | Worker 类型合法性、必填字段 |
| `scripts/start-stop-status` | shebang、start/stop/status 分支、执行权限 |
| 图标 | PACKAGE_ICON.PNG（64×64）、PACKAGE_ICON_256.PNG |

**错误分级：**
- `✗ 错误` — 必须修复，否则套件无法安装
- `⚠ 警告` — 建议修复（规范问题、废弃字段等）
- `ℹ 信息` — 提示性内容

---

### `add` — 添加配置

```bash
synopkg add resource port          # 添加端口注册配置
synopkg add resource data-share    # 添加共享文件夹配置
synopkg add resource mariadb       # 添加 MariaDB 10 数据库配置
synopkg add resource docker        # 添加 Docker Compose 项目配置
synopkg add script prereplace      # 添加替换脚本
```

---

### `pack` — 生成 .spk 目录结构

```bash
synopkg pack [目录] [--output ./dist]
synopkg pack .
synopkg pack . -o ./release
```

输出内容：

```
dist/MyApp-1.0.0-0001/
├── spk/                    # 可直接打包为 .spk 的目录
│   ├── INFO
│   ├── conf/
│   ├── scripts/            # 自动确保执行权限
│   └── WIZARD_UIFILES/     # 若存在
├── manifest.txt            # 文件清单
└── PACKAGE_TGZ_README.md   # package.tgz 准备指南（若缺失）
```

pack 会先自动运行 validate，有错误时拒绝打包。

---

### `info` — 查看字段文档

```bash
synopkg info                   # 列出所有 INFO 字段
synopkg info adminport         # 查看 adminport 字段详情
synopkg info arch              # 查看所有 arch 值
synopkg info resource          # 查看所有 Resource Worker 类型
synopkg info lifecycle         # 查看脚本执行顺序
synopkg info privilege         # 查看 conf/privilege 说明
```

---

## DSM 7 关键规则（前端开发者必读）

### 1. conf/privilege 是强制要求

DSM 7.0 起，所有套件**必须**提供此文件，且 `run-as` 只能为 `"package"`：

```json
{
  "defaults": {
    "run-as": "package"
  }
}
```

`run-as: system` 在 DSM 7.0 已被移除。

### 2. INFO 字段联动关系

```
adminprotocol + adminport + adminurl → 组合成管理界面访问链接
    └─ 示例: http://nas:8080/  

dsmuidir → dsmappname → dsmapppage → dsmapplaunchname
    └─ 缺少上游字段时下游字段无效
```

### 3. 版本号格式

```
version="1.2.3-0001"
         ↑ ↑ ↑  ↑
         功能版本 构建号（每次发布递增）
```

### 4. package.tgz

套件的实际应用文件（可执行文件、UI 文件等）需打包为 `package.tgz`，安装后解压到：

```
/var/packages/[package]/target/   ← SYNOPKG_PKGDEST 环境变量
/var/packages/[package]/var/      ← SYNOPKG_PKGVAR（持久数据）
/var/packages/[package]/etc/      ← 配置存储
```

### 5. 脚本执行顺序

```
安装: prereplace? → preinst → postinst → postreplace? → prestart? → start?
升级: stop(旧) → preupgrade → preuninst(旧) → postuninst(旧) → preinst(新) → postinst(新) → postupgrade → start?
卸载: stop? → preuninst → postuninst
```

---

## IDE 支持

安装后，`conf/resource` 文件在 VS Code 中自动获得：
- JSON Schema 验证
- 字段自动补全
- 悬停文档提示

无需额外配置，`.vscode/settings.json` 已自动生成。

---

## 参考文档

- [Synology DSM Developer Guide 7.2.2](https://help.synology.com/developer-guide/)
- [ExamplePackages](https://github.com/SynologyOpenSource/ExamplePackages)
- [pkgscripts-ng](https://github.com/SynologyOpenSource/pkgscripts-ng)
# synocat
