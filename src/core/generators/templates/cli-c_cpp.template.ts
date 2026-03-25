import type { IScaffoldTemplate } from './base.template';
import type { GeneratedFile, ScaffoldConfig } from '../../../types/';

export class CliCCppTemplate implements IScaffoldTemplate {
  readonly type = 'cli-cpp';

  generate(cfg: ScaffoldConfig): GeneratedFile[] {
    return [
      { path: 'src/Makefile', content: this.makefile(cfg) },
      { path: 'src/README.md', content: this.readme(cfg) },
      { path: 'src/main.c', content: this.entryPointC(cfg) },
    ];
  }

  getNextSteps(cfg: ScaffoldConfig): string[] {
    return [
      `Edit src/main.c to implement your CLI logic`,
      `Run: make`,
      `Test: ./bin/${cfg.package.toLowerCase()} --help`,
      `Run: synocat pack ${cfg.package}`,
    ];
  }

  private makefile(cfg: ScaffoldConfig): string {
    const binaryName = cfg.package.toLowerCase();
    
    return `CC = gcc
CFLAGS = -Wall -O2
TARGET = ${binaryName}
SRC = main.c

all:
\tmkdir -p ../bin
\t$(CC) $(CFLAGS) $(SRC) -o ../bin/$(TARGET)
\t@echo "Build complete: ../bin/$(TARGET)"

clean:
\trm -f ../bin/$(TARGET)
\t@echo "Clean complete"

install: all
\tsudo cp ../bin/$(TARGET) /usr/local/bin/

.PHONY: all clean install`;
  }

  private readme(cfg: ScaffoldConfig): string {
    const binaryName = cfg.package.toLowerCase();
    
    return `# ${cfg.package}

${cfg.description || 'A simple command-line tool'}

## Build

\`\`\`bash
cd src
make
\`\`\`

## Usage

\`\`\`bash
./bin/${binaryName} [name]
./bin/${binaryName} --help
./bin/${binaryName} --version
\`\`\`

## Install

\`\`\`bash
cd src && make install
\`\`\``;
  }

  private entryPointC(cfg: ScaffoldConfig): string {
    const binaryName = cfg.package.toLowerCase();
    const version = cfg.version;
    
    return `#include <stdio.h>
#include <string.h>

#define VERSION "${version}"
#define NAME "${binaryName}"

int main(int argc, char *argv[]) {
    // 显示帮助
    if (argc > 1 && (strcmp(argv[1], "--help") == 0 || strcmp(argv[1], "-h") == 0)) {
        printf("%s - Command Line Tool\\n", NAME);
        printf("Usage: %s [NAME]\\n", NAME);
        printf("       %s --help\\n", NAME);
        printf("       %s --version\\n", NAME);
        return 0;
    }
    
    // 显示版本
    if (argc > 1 && (strcmp(argv[1], "--version") == 0 || strcmp(argv[1], "-v") == 0)) {
        printf("%s version %s\\n", NAME, VERSION);
        return 0;
    }
    
    // 主要逻辑：打招呼
    if (argc > 1) {
        printf("Hello, %s!\\n", argv[1]);
    } else {
        printf("Hello, World!\\n");
    }
    
    return 0;
}`;
  }
}