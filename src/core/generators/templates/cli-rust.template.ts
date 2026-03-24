import type { IScaffoldTemplate } from './base.template';
import type { GeneratedFile, ScaffoldConfig } from '../../../types/';

export class RustCliTemplate implements IScaffoldTemplate {
  readonly type = 'cli-rust';

  generate(cfg: ScaffoldConfig): GeneratedFile[] {
    return [
      { path: 'src/main.rs', content: this.entryPoint(cfg) },
      { path: 'Cargo.toml', content: this.cargoToml(cfg) },
      { path: 'README.md', content: this.readme(cfg) },
      { path: 'Makefile', content: this.makefile(cfg) },
    ];
  }

  getNextSteps(cfg: ScaffoldConfig): string[] {
    return [
      `Edit src/main.rs to implement your CLI logic`,
      `Run: make build`,
      `Test: ./target/release/${cfg.package.toLowerCase()} --help`,
      `Run: synocat pack ${cfg.package}`,
    ];
  }

  private entryPoint(cfg: ScaffoldConfig): string {
    const binaryName = cfg.package.toLowerCase();
    const version = cfg.version;
    
    return `use std::env;

const VERSION: &str = "${version}";
const NAME: &str = "${binaryName}";

fn main() {
    let args: Vec<String> = env::args().collect();
    
    // 显示帮助
    if args.len() > 1 && (args[1] == "--help" || args[1] == "-h") {
        println!("{} - Command Line Tool", NAME);
        println!("Usage: {} [NAME]", NAME);
        println!("       {} --help", NAME);
        println!("       {} --version", NAME);
        return;
    }
    
    // 显示版本
    if args.len() > 1 && (args[1] == "--version" || args[1] == "-v") {
        println!("{} version {}", NAME, VERSION);
        return;
    }
    
    // 主要逻辑：打招呼
    if args.len() > 1 {
        println!("Hello, {}!", args[1]);
    } else {
        println!("Hello, World!");
    }
}`;
  }

  private cargoToml(cfg: ScaffoldConfig): string {
    const binaryName = cfg.package.toLowerCase();
    
    return `[package]
name = "${binaryName}"
version = "${cfg.version}"
edition = "2021"
description = "${cfg.description || 'A simple command-line tool'}"

[dependencies]

[[bin]]
name = "${binaryName}"
path = "src/main.rs"`;
  }

  private readme(cfg: ScaffoldConfig): string {
    const binaryName = cfg.package.toLowerCase();
    
    return `# ${cfg.package}

${cfg.description || 'A simple command-line tool'}

## Build

\`\`\`bash
make build
# or
cargo build --release
\`\`\`

## Usage

\`\`\`bash
./target/release/${binaryName} [name]
./target/release/${binaryName} --help
./target/release/${binaryName} --version
\`\`\`

## Install

\`\`\`bash
sudo make install
# or
sudo cp target/release/${binaryName} /usr/local/bin/
\`\`\`

## Development

\`\`\`bash
# Run with cargo
cargo run -- [name]

# Run tests
cargo test
\`\`\``;
  }

  private makefile(cfg: ScaffoldConfig): string {
    const binaryName = cfg.package.toLowerCase();
    
    return `TARGET = ${binaryName}
RELEASE_DIR = target/release

.PHONY: build clean install run

build:
\tcargo build --release
\t@echo "Build complete: $(RELEASE_DIR)/$(TARGET)"

clean:
\tcargo clean
\t@echo "Clean complete"

install: build
\tsudo cp $(RELEASE_DIR)/$(TARGET) /usr/local/bin/
\t@echo "Installed to /usr/local/bin/$(TARGET)"

run:
\tcargo run -- $(ARGS)

test:
\tcargo test

help:
\t@echo "Available targets:"
\t@echo "  make build   - Build release binary"
\t@echo "  make clean   - Clean build artifacts"
\t@echo "  make install - Install binary to /usr/local/bin"
\t@echo "  make run     - Run with ARGS variable (e.g., make run ARGS='--help')"
\t@echo "  make test    - Run tests"`;
  }
}