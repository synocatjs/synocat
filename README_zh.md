<p align="center">
  <img src="docs/assets/logo.svg" width="100" height="100" alt="synocat logo">
</p>

<h1 align="center">synocat (synocatjs)</h1>

<p align="center">
  <strong>专为前端开发者设计的 Synology DSM 7 包 CLI 脚手架工具</strong>
</p>

<p align="center">
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-blue.svg" alt="TypeScript"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18%2B-green.svg" alt="Node.js"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License"></a>
</p>

---

## 📦 安装

```bash
npm install -g synocat
# 或不安装直接使用
npx synocat
```

## 🚀 快速开始

```bash
# 交互式创建包
synocat

# 使用指定模板创建新包
synocat create my-package -t vue-desktop

# 验证现有包配置
synocat validate ./my-package

# 生成 .spk 包
synocat pack ./my-package -o ./dist
```

## 🏗️ 架构

```
src/
├── cli/                  # 入口点 + Commander 程序
├── commands/             # 薄命令处理器
├── services/             # 编排层
├── core/
│   ├── generators/       # 纯函数生成器及模板
│   └── validators/       # 无状态验证器
├── data/                 # DSM 字段定义
├── infra/                # 文件系统抽象层
└── types/                # TypeScript 类型定义
```

**设计原则:**

| 原则 | 优势 |
|------|------|
| `IFileSystem` 接口 | 使用 `MemoryFileSystem` 实现零 I/O 单元测试 |
| 纯函数生成器 | 无需模拟，易于测试 |
| `Result<T,E>` 类型 | 明确的错误处理 |
| 策略模式 | 添加模板无需修改现有代码 |

## 📚 命令

| 命令 | 描述 |
|------|------|
| `synocat` | 交互式包创建向导 |
| `synocat create <name>` | 创建包，可使用 `-t` 参数指定模板 |
| `synocat validate <path>` | 验证包配置 |
| `synocat pack <path>` | 生成 `.spk` 包结构 |
| `synocat add resource <type>` | 添加 DSM 资源（端口、共享文件夹） |
| `synocat info <topic>` | 显示 adminport、arch、resource 等相关文档 |
| `synocat image <file>` | 从源图片生成所有图标尺寸 |
| `synocat compile <pkgscripts-ng> <package>` | 使用 Synology 工具链编译 |
| `synocat update` | 更新到最新版本 |

## 🎨 模板

| 模板 | 描述 |
|------|------|
| `minimal` | 纯 Shell 包，适用于所有平台 |
| `node-service` | Node.js 后端服务，包含启动/停止脚本 |
| `vue-desktop` | Vue.js DSM 桌面应用 |
| `docker` | Docker Compose 包（DSM 7.2.1+） |

## 🛠️ 开发

```bash
npm run build        # 编译 TypeScript
npm run dev          # 监视模式
npm run typecheck    # 仅类型检查
npm test             # 运行测试
npm run test:coverage# 测试覆盖率报告
```

```bash
npm link

npm unlink
npm uninstall -g synocat
npm uninstall -g synopkg
sudo npm unlink -g synocat
```

```bash
which snc 
```

## 📖 参考资料

- [DSM 开发者指南](https://help.synology.com/developer-guide/)
- [Synology 示例包](https://github.com/SynologyOpenSource/ExamplePackages)
- [pkgscripts-ng](https://github.com/SynologyOpenSource/pkgscripts-ng)

---

<p align="center">
  <sub>为 Synology 社区倾心打造 ❤️</sub>
</p>