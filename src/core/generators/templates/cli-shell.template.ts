import type { IScaffoldTemplate } from './base.template';
import type { GeneratedFile, ScaffoldConfig } from '../../../types/';

export class ShellCliTemplate implements IScaffoldTemplate {
  readonly type = 'cli-shell';

  generate(cfg: ScaffoldConfig): GeneratedFile[] {
    return [
      { path: 'src/cli.sh', content: this.entryPoint(cfg) },
      { path: 'src/README.md', content: this.readme(cfg) },
    ];
  }

  getNextSteps(cfg: ScaffoldConfig): string[] {
    return [
      `Edit src/cli.sh to implement your CLI logic`,
      `Make it executable: chmod +x src/cli.sh`,
      `Test: ./src/cli.sh --help`,
      `Run: synocat pack ${cfg.package}`,
    ];
  }

  private entryPoint(cfg: ScaffoldConfig): string {
    const binaryName = cfg.package.toLowerCase();
    const version = cfg.version;
    
    return `#!/bin/bash
# ${cfg.package} - Command Line Tool
# Version: ${version}
# Description: ${cfg.description || 'A simple shell-based CLI tool'}

VERSION="${version}"
NAME="${binaryName}"

# 显示帮助
show_help() {
    cat << EOF
\${NAME} - Command Line Tool
Version: \${VERSION}

Usage: \${NAME} [OPTIONS] [NAME]

Options:
  -h, --help      Show this help message
  -v, --version   Show version information

Examples:
  \${NAME}                # Say Hello, World!
  \${NAME} John           # Say Hello, John!
  \${NAME} --help         # Show help
  \${NAME} --version      # Show version
EOF
}

# 显示版本
show_version() {
    echo "\${NAME} version \${VERSION}"
}

# 主要逻辑
main() {
    case "\$1" in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--version)
            show_version
            exit 0
            ;;
        "")
            echo "Hello, World!"
            ;;
        *)
            echo "Hello, \$1!"
            ;;
    esac
}

# 运行主函数
main "\$@"`;
  }

  private readme(cfg: ScaffoldConfig): string {
    const binaryName = cfg.package.toLowerCase();
    
    return `# ${cfg.package}

${cfg.description || 'A simple shell-based command-line tool'}

## Install

Make the script executable:

\`\`\`bash
chmod +x src/cli.sh
\`\`\`

Optionally, install to PATH:

\`\`\`bash
sudo cp src/cli.sh /usr/local/bin/${binaryName}
\`\`\`

## Usage

\`\`\`bash
./src/cli.sh [name]
./src/cli.sh --help
./src/cli.sh --version
\`\`\`

## Examples

\`\`\`bash
# Say hello to World
./src/cli.sh

# Say hello to specific name
./src/cli.sh John

# Show help
./src/cli.sh --help

# Show version
./src/cli.sh --version
\`\`\`

## Features

- Simple and lightweight
- No dependencies
- Works on any Unix-like system
- Perfect for Synology DSM

## License

Proprietary - All rights reserved`;
  }
}