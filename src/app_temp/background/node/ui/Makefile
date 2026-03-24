# Makefile for synocat-service (Node.js)

# 配置
BINARY_NAME = synocat-service
VERSION = 1.0.0
NPM = npm
NODE = node

# 颜色输出
GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[0;33m
BLUE = \033[0;34m
NC = \033[0m

# 默认目标
all: install-deps

# 安装依赖
install-deps:
	@echo "$(GREEN)📦 Installing dependencies...$(NC)"
	$(NPM) install
	@echo "$(GREEN)✅ Dependencies installed!$(NC)"

# 链接为全局命令
link:
	@echo "$(GREEN)🔗 Linking as global command...$(NC)"
	$(NPM) link
	@echo "$(GREEN)✅ Linked! Run '$(BINARY_NAME)' to use$(NC)"

# 取消链接
unlink:
	@echo "$(RED)🔗 Unlinking global command...$(NC)"
	$(NPM) unlink
	@echo "$(GREEN)✅ Unlinked!$(NC)"

# 安装到系统（全局）
install: install-deps
	@echo "$(GREEN)📦 Installing globally...$(NC)"
	$(NPM) install -g
	@echo "$(GREEN)✅ Installation complete!$(NC)"
	@echo "$(BLUE)✨ Run '$(BINARY_NAME) start' to start the service$(NC)"

# 卸载
uninstall:
	@echo "$(RED)🗑️  Uninstalling...$(NC)"
	$(NPM) uninstall -g $(BINARY_NAME)
	@echo "$(GREEN)✅ Uninstall complete!$(NC)"

# 运行服务
run: install-deps
	@echo "$(BLUE)🚀 Starting service...$(NC)"
	$(NODE) cli.js start

# 显示状态
status: install-deps
	$(NODE) cli.js status

# 显示信息
info: install-deps
	$(NODE) cli.js info

# JSON 格式信息
info-json: install-deps
	$(NODE) cli.js info json

# 开发模式（自动重启）
dev:
	@echo "$(BLUE)🔄 Starting in development mode...$(NC)"
	$(NPM) run dev

# 测试
test:
	@echo "$(YELLOW)🧪 Running tests...$(NC)"
	$(NPM) test
	@echo "$(GREEN)✅ Tests passed!$(NC)"

# 代码检查
lint:
	@echo "$(YELLOW)🔍 Running linter...$(NC)"
	$(NPM) run lint
	@echo "$(GREEN)✅ Lint complete!$(NC)"

# 格式化代码
format:
	@echo "$(BLUE)🎨 Formatting code...$(NC)"
	$(NPM) run format
	@echo "$(GREEN)✅ Format complete!$(NC)"

# 清理
clean:
	@echo "$(RED)🧹 Cleaning...$(NC)"
	rm -rf node_modules package-lock.json
	rm -rf ~/.synocat
	@echo "$(GREEN)✅ Clean complete!$(NC)"

# 清理并重新安装
rebuild: clean install-deps

# 打包为可执行文件（使用 pkg）
package: install-deps
	@echo "$(BLUE)📦 Creating standalone executable...$(NC)"
	@which pkg >/dev/null 2>&1 || (echo "$(RED)pkg not installed! Run: npm install -g pkg$(NC)" && exit 1)
	pkg . --targets node14-linux-x64,node14-macos-x64,node14-win-x64 --output dist/$(BINARY_NAME)
	@echo "$(GREEN)✅ Package created in dist/$(NC)"

# 创建 Linux systemd 服务
install-daemon: install
	@echo "$(BLUE)📦 Installing as systemd service...$(NC)"
	@echo "[Unit]" | sudo tee /etc/systemd/system/$(BINARY_NAME).service
	@echo "Description=Synocat Background Service" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "After=network.target" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "[Service]" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "Type=simple" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "User=$(shell whoami)" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "WorkingDirectory=$(shell pwd)" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "ExecStart=/usr/bin/env $(BINARY_NAME) start" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "Restart=on-failure" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "[Install]" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "WantedBy=multi-user.target" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@sudo systemctl daemon-reload
	@sudo systemctl enable $(BINARY_NAME)
	@echo "$(GREEN)✅ Service installed! Run 'sudo systemctl start $(BINARY_NAME)' to start$(NC)"

# 移除 systemd 服务
remove-daemon:
	@echo "$(RED)🗑️  Removing systemd service...$(NC)"
	@sudo systemctl stop $(BINARY_NAME) 2>/dev/null || true
	@sudo systemctl disable $(BINARY_NAME) 2>/dev/null || true
	@sudo rm -f /etc/systemd/system/$(BINARY_NAME).service
	@sudo systemctl daemon-reload
	@echo "$(GREEN)✅ Service removed!$(NC)"

# 帮助
help:
	@echo "$(BLUE)Available targets:$(NC)"
	@echo "  $(GREEN)install-deps$(NC)   - Install npm dependencies"
	@echo "  $(GREEN)install$(NC)        - Install globally"
	@echo "  $(GREEN)link$(NC)           - Link as global command (development)"
	@echo "  $(GREEN)uninstall$(NC)      - Uninstall globally"
	@echo "  $(GREEN)run$(NC)            - Run the service"
	@echo "  $(GREEN)status$(NC)         - Show service status"
	@echo "  $(GREEN)info$(NC)           - Show service information"
	@echo "  $(GREEN)info-json$(NC)      - Show info in JSON format"
	@echo "  $(GREEN)dev$(NC)            - Run in development mode (auto-reload)"
	@echo "  $(GREEN)test$(NC)           - Run tests"
	@echo "  $(GREEN)lint$(NC)           - Run linter"
	@echo "  $(GREEN)format$(NC)         - Format code"
	@echo "  $(GREEN)clean$(NC)          - Clean node_modules"
	@echo "  $(GREEN)rebuild$(NC)        - Clean and rebuild"
	@echo "  $(GREEN)package$(NC)        - Create standalone executable"
	@echo "  $(GREEN)install-daemon$(NC) - Install as systemd service (Linux)"
	@echo "  $(GREEN)remove-daemon$(NC)  - Remove systemd service"
	@echo "  $(GREEN)help$(NC)           - Show this help message"

.PHONY: all install-deps link unlink install uninstall run status info info-json \
        dev test lint format clean rebuild package install-daemon remove-daemon help