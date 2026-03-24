<p align="center">
  <img src="docs/assets/logo.svg" width="100" height="100" alt="synocat logo">
</p>

<h1 align="center">synocat (synocatjs)</h1>

<p align="center">
  <strong>CLI scaffold tool for Synology DSM 7 packages — designed for frontend developers</strong>
</p>

<p align="center">
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.4-blue.svg" alt="TypeScript"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18%2B-green.svg" alt="Node.js"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License"></a>
</p>

---

## 📦 Installation

```bash
npm install -g synocat
# or use without installing
npx synocat
```

## 🚀 Quick Start

```bash
# Interactive package creation
synocat

# Create a new package with specific template
synocat create my-package -t vue-desktop

# Validate existing package configuration
synocat validate ./my-package

# Generate .spk package
synocat pack ./my-package -o ./dist
```

## 🏗️ Architecture

```
src/
├── cli/                  # Entry point + Commander program
├── commands/             # Thin command handlers
├── services/             # Orchestration layer
├── core/
│   ├── generators/       # Pure functions with templates
│   └── validators/       # Stateless validators
├── data/                 # DSM field definitions
├── infra/                # File system abstraction
└── types/                # TypeScript interfaces
```

**Design principles:**

| Principle | Benefit |
|-----------|---------|
| `IFileSystem` interface | Zero-I/O unit tests with `MemoryFileSystem` |
| Pure generators | No mocking needed, easily testable |
| `Result<T,E>` type | Explicit error handling |
| Strategy pattern | Add templates without touching existing code |

## 📚 Commands

| Command | Description |
|---------|-------------|
| `synocat` | Interactive package creation wizard |
| `synocat create <name>` | Create package with optional `-t` template flag |
| `synocat validate <path>` | Validate package configuration |
| `synocat pack <path>` | Generate `.spk` package structure |
| `synocat add resource <type>` | Add DSM resource (port, data-share) |
| `synocat info <topic>` | Show documentation for adminport, arch, resource |
| `synocat image <file>` | Generate all icon sizes from source image |
| `synocat compile <pkgscripts-ng> <package>` | Compile with Synology toolchain |
| `synocat update` | Update to latest version |

## 🎨 Templates

| Template | Description |
|----------|-------------|
| `minimal` | Pure shell package, works on all platforms |
| `node-service` | Node.js backend service with start/stop scripts |
| `vue-desktop` | Vue.js DSM desktop application |
| `docker` | Docker Compose package (DSM 7.2.1+) |

## 🛠️ Development

```bash
npm run build        # Compile TypeScript
npm run dev          # Watch mode
npm run typecheck    # Type-check only
npm test             # Run tests
npm run test:coverage# Coverage report
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

## 📖 References

- [DSM Developer Guide](https://help.synology.com/developer-guide/)
- [Example Packages](https://github.com/SynologyOpenSource/ExamplePackages)
- [pkgscripts-ng](https://github.com/SynologyOpenSource/pkgscripts-ng)

---

<p align="center">
  <sub>Built with ❤️ for the Synology community</sub>
</p>