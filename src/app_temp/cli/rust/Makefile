# Makefile for synocat-check (Rust version)

# 项目配置
PROJECT_NAME = synocat-check
VERSION = 1.0.0
CARGO = cargo
TARGET_DIR = target

# 颜色输出
GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[0;33m
BLUE = \033[0;34m
CYAN = \033[0;36m
MAGENTA = \033[0;35m
NC = \033[0m

# 检测操作系统
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S), Linux)
    TARGET_TRIPLE ?= x86_64-unknown-linux-gnu
endif
ifeq ($(UNAME_S), Darwin)
    TARGET_TRIPLE ?= x86_64-apple-darwin
endif

# 默认目标
all: build

# 构建项目
build:
	@echo "$(BLUE)🔨 Building $(PROJECT_NAME)...$(NC)"
	$(CARGO) build --release
	@echo "$(GREEN)✅ Build successful!$(NC)"
	@echo "$(BLUE)📦 Binary: $(TARGET_DIR)/release/$(PROJECT_NAME)$(NC)"

# 开发构建（带调试信息）
dev:
	@echo "$(YELLOW)🔧 Building development version...$(NC)"
	$(CARGO) build
	@echo "$(GREEN)✅ Development build complete!$(NC)"

# 运行程序
run: build
	@echo "$(BLUE)🚀 Running $(PROJECT_NAME)...$(NC)"
	./$(TARGET_DIR)/release/$(PROJECT_NAME)

# 开发运行
run-dev: dev
	@echo "$(BLUE)🚀 Running development version...$(NC)"
	./$(TARGET_DIR)/debug/$(PROJECT_NAME)

# 测试
test:
	@echo "$(BLUE)🧪 Running tests...$(NC)"
	$(CARGO) test -- --nocapture
	@echo "$(GREEN)✅ Tests passed!$(NC)"

# 代码格式化
format:
	@echo "$(BLUE)🎨 Formatting code...$(NC)"
	@which rustfmt > /dev/null || (echo "$(RED)rustfmt not installed! Run: rustup component add rustfmt$(NC)" && exit 1)
	$(CARGO) fmt
	@echo "$(GREEN)✅ Format complete!$(NC)"

# 代码检查
lint:
	@echo "$(YELLOW)🔍 Running linter...$(NC)"
	@which clippy > /dev/null || (echo "$(RED)clippy not installed! Run: rustup component add clippy$(NC)" && exit 1)
	$(CARGO) clippy -- -D warnings
	@echo "$(GREEN)✅ Lint complete!$(NC)"

# 代码检查（允许警告）
lint-all:
	@echo "$(YELLOW)🔍 Running linter (all checks)...$(NC)"
	$(CARGO) clippy
	@echo "$(GREEN)✅ Lint complete!$(NC)"

# 清理构建文件
clean:
	@echo "$(RED)🧹 Cleaning build files...$(NC)"
	$(CARGO) clean
	@echo "$(GREEN)✅ Clean complete!$(NC)"

# 清理并重建
rebuild: clean build

# 安装到系统路径
install: build
	@echo "$(BLUE)📦 Installing $(PROJECT_NAME) to /usr/local/bin...$(NC)"
	@if [ -w /usr/local/bin ]; then \
		cp $(TARGET_DIR)/release/$(PROJECT_NAME) /usr/local/bin/; \
	else \
		sudo cp $(TARGET_DIR)/release/$(PROJECT_NAME) /usr/local/bin/; \
	fi
	@chmod 755 /usr/local/bin/$(PROJECT_NAME)
	@echo "$(GREEN)✅ Installation complete!$(NC)"
	@echo "$(BLUE)✨ Now you can run: $(PROJECT_NAME)$(NC)"

# 卸载
uninstall:
	@echo "$(RED)🗑️  Uninstalling $(PROJECT_NAME)...$(NC)"
	@if [ -w /usr/local/bin ]; then \
		rm -f /usr/local/bin/$(PROJECT_NAME); \
	else \
		sudo rm -f /usr/local/bin/$(PROJECT_NAME); \
	fi
	@echo "$(GREEN)✅ Uninstall complete!$(NC)"

# 生成文档
docs:
	@echo "$(BLUE)📚 Generating documentation...$(NC)"
	$(CARGO) doc --no-deps --open
	@echo "$(GREEN)✅ Documentation generated!$(NC)"

# 基准测试
bench:
	@echo "$(YELLOW)📊 Running benchmarks...$(NC)"
	$(CARGO) bench
	@echo "$(GREEN)✅ Benchmarks complete!$(NC)"

# 交叉编译（Linux 目标）
cross-linux: clean
	@echo "$(BLUE)🐧 Cross-compiling for Linux...$(NC)"
	rustup target add x86_64-unknown-linux-gnu
	$(CARGO) build --release --target x86_64-unknown-linux-gnu
	@echo "$(GREEN)✅ Linux binary created!$(NC)"
	@ls -lh $(TARGET_DIR)/x86_64-unknown-linux-gnu/release/$(PROJECT_NAME)

# 交叉编译（Windows 目标）
cross-windows: clean
	@echo "$(BLUE)🪟 Cross-compiling for Windows...$(NC)"
	rustup target add x86_64-pc-windows-gnu
	$(CARGO) build --release --target x86_64-pc-windows-gnu
	@echo "$(GREEN)✅ Windows binary created!$(NC)"
	@ls -lh $(TARGET_DIR)/x86_64-pc-windows-gnu/release/$(PROJECT_NAME).exe

# 交叉编译（macOS 目标）
cross-macos: clean
	@echo "$(BLUE)🍎 Cross-compiling for macOS...$(NC)"
	rustup target add x86_64-apple-darwin
	$(CARGO) build --release --target x86_64-apple-darwin
	@echo "$(GREEN)✅ macOS binary created!$(NC)"
	@ls -lh $(TARGET_DIR)/x86_64-apple-darwin/release/$(PROJECT_NAME)

# 创建发布包
package: build
	@echo "$(BLUE)📦 Creating release package...$(NC)"
	mkdir -p release
	cp $(TARGET_DIR)/release/$(PROJECT_NAME) release/
	@if [ -f README.md ]; then cp README.md release/; fi
	@if [ -f LICENSE ]; then cp LICENSE release/; fi
	@if [ -f Cargo.toml ]; then cp Cargo.toml release/; fi
	tar -czf $(PROJECT_NAME)-$(VERSION)-$(shell date +%Y%m%d).tar.gz release/
	@echo "$(GREEN)✅ Package created!$(NC)"

# 创建 DEB 包（用于 Debian/Ubuntu）
deb: build
	@echo "$(BLUE)📦 Creating DEB package...$(NC)"
	@which cargo-deb > /dev/null || (echo "$(RED)cargo-deb not installed! Run: cargo install cargo-deb$(NC)" && exit 1)
	$(CARGO) deb
	@echo "$(GREEN)✅ DEB package created in target/debian/$(NC)"

# 安装开发工具
setup-dev:
	@echo "$(BLUE)🔧 Installing development tools...$(NC)"
	@if command -v apt-get > /dev/null; then \
		sudo apt-get update; \
		sudo apt-get install -y build-essential pkg-config libssl-dev; \
	elif command -v yum > /dev/null; then \
		sudo yum install -y gcc openssl-devel; \
	elif command -v brew > /dev/null; then \
		brew install openssl; \
	else \
		echo "$(RED)Unknown package manager. Please install tools manually.$(NC)"; \
	fi
	@echo "$(GREEN)✅ Development tools installed!$(NC)"

# 更新依赖
update:
	@echo "$(BLUE)🔄 Updating dependencies...$(NC)"
	$(CARGO) update
	@echo "$(GREEN)✅ Dependencies updated!$(NC)"

# 生成依赖图
deps:
	@echo "$(BLUE)📊 Generating dependency graph...$(NC)"
	@which cargo-deps > /dev/null || (echo "$(RED)cargo-deps not installed! Run: cargo install cargo-deps$(NC)" && exit 1)
	$(CARGO) deps --all-deps | dot -Tpng > deps.png
	@echo "$(GREEN)✅ Dependency graph saved to deps.png$(NC)"

# 检查更新
check-updates:
	@echo "$(BLUE)🔍 Checking for outdated dependencies...$(NC)"
	@which cargo-outdated > /dev/null || (echo "$(RED)cargo-outdated not installed! Run: cargo install cargo-outdated$(NC)" && exit 1)
	$(CARGO) outdated
	@echo "$(GREEN)✅ Check complete!$(NC)"

# 显示项目信息
info:
	@echo "$(CYAN)╔══════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║                    $(PROJECT_NAME) Information                    ║$(NC)"
	@echo "$(CYAN)╚══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(BLUE)Project:$(NC) $(PROJECT_NAME)"
	@echo "$(BLUE)Version:$(NC) $(VERSION)"
	@echo "$(BLUE)Rust version:$(NC) $(shell rustc --version)"
	@echo "$(BLUE)Cargo version:$(NC) $(shell cargo --version)"
	@echo "$(BLUE)Target:$(NC) $(TARGET_TRIPLE)"
	@echo ""

# 显示帮助
help:
	@echo "$(CYAN)╔══════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║                    synocat-check Makefile                    ║$(NC)"
	@echo "$(CYAN)╚══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(BLUE)Available targets:$(NC)"
	@echo "  $(GREEN)build$(NC)        - Build release binary"
	@echo "  $(GREEN)dev$(NC)          - Build development binary"
	@echo "  $(GREEN)run$(NC)          - Build and run release version"
	@echo "  $(GREEN)run-dev$(NC)      - Build and run development version"
	@echo "  $(GREEN)test$(NC)         - Run tests"
	@echo "  $(GREEN)bench$(NC)        - Run benchmarks"
	@echo "  $(GREEN)format$(NC)       - Format code with rustfmt"
	@echo "  $(GREEN)lint$(NC)         - Run clippy linter (warnings as errors)"
	@echo "  $(GREEN)lint-all$(NC)     - Run clippy linter (all checks)"
	@echo "  $(GREEN)clean$(NC)        - Clean build artifacts"
	@echo "  $(GREEN)rebuild$(NC)      - Clean and rebuild"
	@echo "  $(GREEN)install$(NC)      - Install to /usr/local/bin"
	@echo "  $(GREEN)uninstall$(NC)    - Remove from /usr/local/bin"
	@echo "  $(GREEN)docs$(NC)         - Generate documentation"
	@echo "  $(GREEN)cross-linux$(NC)  - Cross-compile for Linux"
	@echo "  $(GREEN)cross-windows$(NC)- Cross-compile for Windows"
	@echo "  $(GREEN)cross-macos$(NC)  - Cross-compile for macOS"
	@echo "  $(GREEN)package$(NC)      - Create release tarball"
	@echo "  $(GREEN)deb$(NC)          - Create DEB package"
	@echo "  $(GREEN)update$(NC)       - Update dependencies"
	@echo "  $(GREEN)deps$(NC)         - Generate dependency graph"
	@echo "  $(GREEN)check-updates$(NC)- Check outdated dependencies"
	@echo "  $(GREEN)setup-dev$(NC)    - Install development tools"
	@echo "  $(GREEN)info$(NC)         - Show project information"
	@echo "  $(GREEN)help$(NC)         - Show this help message"
	@echo ""

# 伪目标声明
.PHONY: all build dev run run-dev test format lint lint-all clean rebuild \
        install uninstall docs bench cross-linux cross-windows cross-macos \
        package deb update deps check-updates setup-dev info help

# 默认目标
.DEFAULT_GOAL := help