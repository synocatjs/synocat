# Makefile for synocat-check (C and Shell versions)
# Version: 1.0.0

# 配置
C_TARGET = synocat-check
SH_TARGET = synocat-check.sh
INSTALL_DIR = /usr/local/bin
VERSION = 1.0.0

# 编译器设置
CC = gcc
CFLAGS = -Wall -Wextra -O2 -std=c99 -D_GNU_SOURCE
LDFLAGS =

# 平台检测
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S), Darwin)
    CFLAGS += -D_DARWIN_C_SOURCE
endif
ifeq ($(UNAME_S), MINGW32_NT)
    CFLAGS += -D_WIN32
endif
ifeq ($(UNAME_S), MINGW64_NT)
    CFLAGS += -D_WIN32
endif
ifeq ($(UNAME_S), MSYS_NT)
    CFLAGS += -D_WIN32
endif

# 颜色输出
GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[0;33m
BLUE = \033[0;34m
NC = \033[0m

# 默认目标
all: c shell

# 编译 C 版本
c: $(C_TARGET)

$(C_TARGET): synocat-check.c
	@echo "$(GREEN)🔨 Building C version...$(NC)"
	$(CC) $(CFLAGS) $< -o $@ $(LDFLAGS)
	@echo "$(GREEN)✅ C build complete: $(C_TARGET)$(NC)"

# Shell 版本（添加执行权限）
shell: $(SH_TARGET)
	@chmod +x $(SH_TARGET)
	@echo "$(GREEN)✅ Shell script ready: $(SH_TARGET)$(NC)"

# 调试版本
debug: CFLAGS += -g -DDEBUG -O0
debug: c
	@echo "$(YELLOW)🐛 Debug build created$(NC)"

# 发布版本
release: CFLAGS += -DNDEBUG -O3 -march=native
release: c
	@echo "$(GREEN)🚀 Release build created$(NC)"

# 静态链接版本
static: LDFLAGS += -static
static: c
	@echo "$(BLUE)📦 Static build created$(NC)"

# 交叉编译 Windows 版本
windows: CC = x86_64-w64-mingw32-gcc
windows: CFLAGS += -D_WIN32 -static
windows: C_TARGET = synocat-check.exe
windows: c
	@echo "$(GREEN)🪟 Windows binary created: $(C_TARGET)$(NC)"

# 安装（安装 C 版本和 Shell 版本）
install: all
	@echo "$(BLUE)📦 Installing to $(INSTALL_DIR)...$(NC)"
	@sudo mkdir -p $(INSTALL_DIR)
	@sudo cp $(C_TARGET) $(INSTALL_DIR)/$(C_TARGET)
	@sudo cp $(SH_TARGET) $(INSTALL_DIR)/synocat-check-sh
	@sudo chmod 755 $(INSTALL_DIR)/$(C_TARGET)
	@sudo chmod 755 $(INSTALL_DIR)/synocat-check-sh
	@echo "$(GREEN)✅ Installation complete!$(NC)"
	@echo "$(BLUE)✨ Run 'synocat-check' or 'synocat-check-sh'$(NC)"

# 安装只安装 Shell 版本
install-shell: shell
	@echo "$(BLUE)📦 Installing shell version...$(NC)"
	@sudo cp $(SH_TARGET) $(INSTALL_DIR)/synocat-check
	@sudo chmod 755 $(INSTALL_DIR)/synocat-check
	@echo "$(GREEN)✅ Shell version installed as 'synocat-check'$(NC)"

# 安装只安装 C 版本
install-c: c
	@echo "$(BLUE)📦 Installing C version...$(NC)"
	@sudo cp $(C_TARGET) $(INSTALL_DIR)/synocat-check
	@sudo chmod 755 $(INSTALL_DIR)/synocat-check
	@echo "$(GREEN)✅ C version installed as 'synocat-check'$(NC)"

# 卸载
uninstall:
	@echo "$(RED)🗑️  Uninstalling...$(NC)"
	@sudo rm -f $(INSTALL_DIR)/synocat-check
	@sudo rm -f $(INSTALL_DIR)/synocat-check-sh
	@echo "$(GREEN)✅ Uninstall complete!$(NC)"

# 清理
clean:
	@echo "$(RED)🧹 Cleaning build files...$(NC)"
	@rm -f $(C_TARGET) $(C_TARGET).exe
	@echo "$(GREEN)✅ Clean complete!$(NC)"

# 完全清理
distclean: clean
	@echo "$(RED)🧹 Removing backup files...$(NC)"
	@rm -f *~ *.bak *.swp
	@echo "$(GREEN)✅ Distclean complete!$(NC)"

# 重新构建
rebuild: clean all

# 运行 C 版本
run-c: c
	@echo "$(BLUE)🚀 Running C version...$(NC)"
	@./$(C_TARGET)

# 运行 Shell 版本
run-shell: shell
	@echo "$(BLUE)🚀 Running Shell version...$(NC)"
	@./$(SH_TARGET)

# 运行默认版本（优先 C 版本）
run: c
	@echo "$(BLUE)🚀 Running default version...$(NC)"
	@./$(C_TARGET)

# 测试所有版本
test: c shell
	@echo "$(BLUE)🧪 Testing C version...$(NC)"
	@./$(C_TARGET) --version
	@./$(C_TARGET) --help | head -5
	@echo ""
	@echo "$(BLUE)🧪 Testing Shell version...$(NC)"
	@./$(SH_TARGET) --version
	@./$(SH_TARGET) --help | head -5
	@echo ""
	@echo "$(GREEN)✅ All tests passed!$(NC)"

# 代码格式化（C）
format-c:
	@echo "$(BLUE)🎨 Formatting C code...$(NC)"
	@which clang-format >/dev/null 2>&1 || (echo "$(RED)clang-format not installed!$(NC)" && exit 1)
	@clang-format -i -style=file synocat-check.c
	@echo "$(GREEN)✅ C code formatted!$(NC)"

# 代码格式化（Shell）
format-sh:
	@echo "$(BLUE)🎨 Formatting Shell script...$(NC)"
	@which shfmt >/dev/null 2>&1 || (echo "$(RED)shfmt not installed!$(NC)" && exit 1)
	@shfmt -w -i 4 $(SH_TARGET)
	@echo "$(GREEN)✅ Shell script formatted!$(NC)"

# 代码检查（C）
lint-c:
	@echo "$(YELLOW)🔍 Linting C code...$(NC)"
	@which cppcheck >/dev/null 2>&1 || (echo "$(RED)cppcheck not installed!$(NC)" && exit 1)
	@cppcheck --enable=all --suppress=missingIncludeSystem synocat-check.c
	@echo "$(GREEN)✅ C lint complete!$(NC)"

# 代码检查（Shell）
lint-sh:
	@echo "$(YELLOW)🔍 Linting Shell script...$(NC)"
	@which shellcheck >/dev/null 2>&1 || (echo "$(RED)shellcheck not installed!$(NC)" && exit 1)
	@shellcheck $(SH_TARGET)
	@echo "$(GREEN)✅ Shell lint complete!$(NC)"

# 全部检查
lint: lint-c lint-sh

# 全部格式化
format: format-c format-sh

# 比较两个版本的输出
compare: c shell
	@echo "$(BLUE)📊 Comparing outputs...$(NC)"
	@echo "$(YELLOW)C version output:$(NC)"
	@./$(C_TARGET) --quiet 2>/dev/null || true
	@echo ""
	@echo "$(YELLOW)Shell version output:$(NC)"
	@./$(SH_TARGET) --quiet 2>/dev/null || true
	@echo ""
	@echo "$(GREEN)✅ Comparison complete!$(NC)"

# 打包发布
package: release shell
	@echo "$(BLUE)📦 Creating release package...$(NC)"
	@mkdir -p dist
	@cp $(C_TARGET) dist/
	@cp $(SH_TARGET) dist/
	@cp README.md dist/ 2>/dev/null || true
	@cp LICENSE dist/ 2>/dev/null || true
	@cd dist && tar -czf synocat-check-$(VERSION).tar.gz *
	@echo "$(GREEN)✅ Package created: dist/synocat-check-$(VERSION).tar.gz$(NC)"

# 帮助信息
help:
	@echo "$(BLUE)Available targets:$(NC)"
	@echo "  $(GREEN)all$(NC)           - Build both C and shell versions (default)"
	@echo "  $(GREEN)c$(NC)             - Build C version only"
	@echo "  $(GREEN)shell$(NC)         - Prepare shell script only"
	@echo "  $(GREEN)debug$(NC)         - Build C version with debug symbols"
	@echo "  $(GREEN)release$(NC)       - Build optimized release version"
	@echo "  $(GREEN)static$(NC)        - Build statically linked C version"
	@echo "  $(GREEN)windows$(NC)       - Cross-compile Windows version"
	@echo "  $(GREEN)install$(NC)       - Install both versions to system"
	@echo "  $(GREEN)install-c$(NC)     - Install only C version"
	@echo "  $(GREEN)install-shell$(NC) - Install only shell version"
	@echo "  $(GREEN)uninstall$(NC)     - Remove installed versions"
	@echo "  $(GREEN)clean$(NC)         - Remove build files"
	@echo "  $(GREEN)distclean$(NC)     - Clean everything including backups"
	@echo "  $(GREEN)rebuild$(NC)       - Clean and rebuild all"
	@echo "  $(GREEN)run$(NC)           - Run C version"
	@echo "  $(GREEN)run-c$(NC)         - Run C version"
	@echo "  $(GREEN)run-shell$(NC)     - Run shell version"
	@echo "  $(GREEN)test$(NC)          - Test both versions"
	@echo "  $(GREEN)compare$(NC)       - Compare outputs of both versions"
	@echo "  $(GREEN)lint$(NC)          - Run linters on both versions"
	@echo "  $(GREEN)format$(NC)        - Format both versions"
	@echo "  $(GREEN)package$(NC)       - Create release package"
	@echo "  $(GREEN)help$(NC)          - Show this help message"

# 伪目标
.PHONY: all c shell debug release static windows install install-c install-shell \
        uninstall clean distclean rebuild run run-c run-shell test compare \
        lint lint-c lint-sh format format-c format-sh package help

.DEFAULT_GOAL := all