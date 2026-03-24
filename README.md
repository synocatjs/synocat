# synocat

<p align="center">
  <img src="docs/assets/logo.svg" width="80" height="80" alt="Synology Package Logo">
</p>

<p align="center">
  <strong>synocat</strong> (synocatjs)
</p>
> CLI scaffold tool for Synology DSM 7 packages — designed for frontend developers.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Jest](https://img.shields.io/badge/Tested%20with-Jest-orange)](https://jestjs.io/)

---

## Architecture

```
src/
├── cli/                  Entry point + Commander program builder
├── commands/             Thin command handlers (UI only, no logic)
├── services/             Orchestration layer (scaffold, validator, pack)
├── core/
│   ├── generators/       Pure functions: INFO, privilege, resource, scripts
│   │   └── templates/    Strategy pattern: minimal, node-service, vue-desktop, docker
│   └── validators/       Stateless validators: INFO, privilege, resource, scripts
├── data/                 Pure data: DSM field definitions, arch values, workers
├── infra/                NodeFileSystem, MemoryFileSystem (for tests), Updater, Logger
└── types/                Shared TypeScript interfaces and Result<T,E>
```

**Key design decisions:**

| Decision | Rationale |
|---|---|
| `IFileSystem` interface | All file I/O is injectable → `MemoryFileSystem` enables zero-I/O unit tests |
| Pure generators | No `fs` calls in generators → trivially testable, no mocking needed |
| `Result<T,E>` type | Explicit error handling, no `process.exit` scattered across modules |
| Strategy pattern for templates | Adding a new template = add one class, touch zero existing code |
| Data layer separated from logic | `data/` files are plain objects — no imports, no functions, no side effects |

---

## Installation

```bash
npm install -g synocat
# or
npx synocat
```

```bash
npm link

npm unlink
npm uninstall -g synocat
npm uninstall -g synopkg
sudo npm unlink -g synocat
```

## Commands

```bash
synocat                              # Interactive package creation
synocat create my-app                # Create package named "my-app"
synocat create my-app -t vue-desktop # Vue.js desktop app template
synocat validate ./my-app            # Validate configuration
synocat pack ./my-app -o ./dist      # Generate .spk directory structure
synocat add resource port            # Add port registration
synocat add resource data-share      # Add shared folder access
synocat info adminport               # Show field documentation
synocat info arch                    # List all arch values
synocat info resource                # List all resource workers
synocat image ./logo.png             # Generate all icon sizes
synocat compile /path/to/pkgscripts-ng ./my-app  # Compile with Synology toolchain
synocat update                       # Update to latest version
synocat help                         # Show full help
synocat help pack                    # Command-specific help
```

## Templates

| Template | Description |
|---|---|
| `minimal` | Pure shell package, works on all platforms (noarch) |
| `node-service` | Node.js backend service with start/stop scripts |
| `vue-desktop` | Vue.js DSM desktop application |
| `docker` | Docker Compose package via ContainerManager (DSM 7.2.1+) |

---

## Development

```bash
npm run build        # Compile TypeScript → dist/
npm run dev          # Watch mode
npm run typecheck    # Type-check without emitting
npm test             # Run Jest test suite
npm run test:watch   # Watch mode tests
npm run test:coverage# Coverage report
npm run lint         # ESLint
```

### Project structure after build

```
dist/
└── cli/
    └── index.js     # Entry point (referenced by package.json bin)
```

### Adding a new template

1. Create `src/core/generators/templates/my-template.template.ts` implementing `IScaffoldTemplate`
2. Register it in `src/core/generators/templates/registry.ts`
3. Add the type to `TemplateType` in `src/types/scaffold.types.ts`
4. Add a choice to the inquirer prompt in `src/commands/create.command.ts`

### Adding a new resource worker

1. Add the worker metadata to `src/data/resource-workers.data.ts`
2. Add the generator branch in `src/core/generators/resource.generator.ts`
3. Add the type to the `ResourceConfig` interface in `src/types/dsm.types.ts`

---

## References

- [DSM Developer Guide 7.2.2](https://help.synology.com/developer-guide/)
- [Synology Example Packages](https://github.com/SynologyOpenSource/ExamplePackages)
- [pkgscripts-ng](https://github.com/SynologyOpenSource/pkgscripts-ng)