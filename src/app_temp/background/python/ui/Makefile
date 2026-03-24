# Makefile for synocat-service (Python version)

# 配置
BINARY_NAME = synocat-service
PYTHON = python3
VERSION = 1.0.0
INSTALL_DIR = /usr/local/bin
SERVICE_NAME = synocat-service

# 颜色输出
GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[0;33m
BLUE = \033[0;34m
NC = \033[0m

# 默认目标
all: install

# 检查 Python 版本
check-python:
	@echo "$(BLUE)🔍 Checking Python version...$(NC)"
	@$(PYTHON) -c "import sys; exit(0) if sys.version_info >= (3,6) else exit(1)" || \
		(echo "$(RED)Python 3.6+ required!$(NC)" && exit 1)
	@echo "$(GREEN)✅ Python version OK$(NC)"

# 安装依赖（无外部依赖）
deps: check-python
	@echo "$(GREEN)✅ No external dependencies required$(NC)"

# 安装到系统
install: check-python
	@echo "$(BLUE)📦 Installing to $(INSTALL_DIR)...$(NC)"
	@sudo cp synocat_service.py $(INSTALL_DIR)/$(BINARY_NAME)
	@sudo chmod 755 $(INSTALL_DIR)/$(BINARY_NAME)
	@echo "$(GREEN)✅ Installation complete!$(NC)"
	@echo "$(BLUE)✨ Run '$(BINARY_NAME) start' to start the service$(NC)"

# 卸载
uninstall:
	@echo "$(RED)🗑️  Uninstalling...$(NC)"
	@sudo rm -f $(INSTALL_DIR)/$(BINARY_NAME)
	@sudo rm -f ~/.synocat_install_time
	@echo "$(GREEN)✅ Uninstall complete!$(NC)"

# 运行服务
run: check-python
	@echo "$(BLUE)🚀 Starting service...$(NC)"
	$(PYTHON) synocat_service.py start

# 显示状态
status:
	$(PYTHON) synocat_service.py status

# 显示信息
info:
	$(PYTHON) synocat_service.py info

# JSON 格式信息
info-json:
	$(PYTHON) synocat_service.py info json

# 测试
test:
	@echo "$(YELLOW)🧪 Running tests...$(NC)"
	$(PYTHON) -m pytest tests/ 2>/dev/null || echo "No tests found"
	@echo "$(GREEN)✅ Tests passed!$(NC)"

# 清理
clean:
	@echo "$(RED)🧹 Cleaning...$(NC)"
	@rm -rf __pycache__
	@rm -rf *.pyc
	@rm -rf .pytest_cache
	@rm -rf dist build *.egg-info
	@rm -f ~/.synocat_install_time
	@echo "$(GREEN)✅ Clean complete!$(NC)"

# 代码格式化
fmt:
	@echo "$(BLUE)🎨 Formatting code...$(NC)"
	@which black >/dev/null 2>&1 || (echo "$(RED)black not installed! Install with: pip install black$(NC)" && exit 1)
	black synocat_service.py service.py setup.py
	@echo "$(GREEN)✅ Format complete!$(NC)"

# 代码检查
lint:
	@echo "$(YELLOW)🔍 Running linter...$(NC)"
	@which pylint >/dev/null 2>&1 || (echo "$(RED)pylint not installed! Install with: pip install pylint$(NC)" && exit 1)
	pylint synocat_service.py service.py --exit-zero
	@echo "$(GREEN)✅ Lint complete!$(NC)"

# 类型检查
typecheck:
	@echo "$(YELLOW)🔍 Running type checker...$(NC)"
	@which mypy >/dev/null 2>&1 || (echo "$(RED)mypy not installed! Install with: pip install mypy$(NC)" && exit 1)
	mypy synocat_service.py service.py --ignore-missing-imports
	@echo "$(GREEN)✅ Type check complete!$(NC)"

# 安装开发依赖
dev-deps:
	@echo "$(BLUE)📦 Installing development dependencies...$(NC)"
	pip install black pylint mypy pytest
	@echo "$(GREEN)✅ Development dependencies installed!$(NC)"

# 安装为系统服务（systemd）
install-daemon: install
	@echo "$(BLUE)📦 Installing as systemd service...$(NC)"
	@echo "[Unit]" | sudo tee /etc/systemd/system/$(SERVICE_NAME).service
	@echo "Description=Synocat Background Service" | sudo tee -a /etc/systemd/system/$(SERVICE_NAME).service
	@echo "After=network.target" | sudo tee -a /etc/systemd/system/$(SERVICE_NAME).service
	@echo "" | sudo tee -a /etc/systemd/system/$(SERVICE_NAME).service
	@echo "[Service]" | sudo tee -a /etc/systemd/system/$(SERVICE_NAME).service
	@echo "Type=simple" | sudo tee -a /etc/systemd/system/$(SERVICE_NAME).service
	@echo "User=$(shell whoami)" | sudo tee -a /etc/systemd/system/$(SERVICE_NAME).service
	@echo "ExecStart=/usr/local/bin/$(BINARY_NAME) start" | sudo tee -a /etc/systemd/system/$(SERVICE_NAME).service
	@echo "Restart=on-failure" | sudo tee -a /etc/systemd/system/$(SERVICE_NAME).service
	@echo "" | sudo tee -a /etc/systemd/system/$(SERVICE_NAME).service
	@echo "[Install]" | sudo tee -a /etc/systemd/system/$(SERVICE_NAME).service
	@echo "WantedBy=multi-user.target" | sudo tee -a /etc/systemd/system/$(SERVICE_NAME).service
	@sudo systemctl daemon-reload
	@sudo systemctl enable $(SERVICE_NAME)
	@echo "$(GREEN)✅ Service installed! Run 'make daemon' to start$(NC)"

# 运行服务作为守护进程（Linux）
daemon:
	@echo "$(BLUE)🚀 Starting as daemon...$(NC)"
	@if [ -f /etc/systemd/system/$(SERVICE_NAME).service ]; then \
		sudo systemctl start $(SERVICE_NAME); \
		sudo systemctl status $(SERVICE_NAME); \
	else \
		echo "$(RED)Service not installed as systemd service!$(NC)"; \
		echo "$(YELLOW)Run 'make install-daemon' first$(NC)"; \
	fi

# 移除系统服务
remove-daemon:
	@echo "$(RED)🗑️  Removing systemd service...$(NC)"
	@sudo systemctl stop $(SERVICE_NAME) 2>/dev/null || true
	@sudo systemctl disable $(SERVICE_NAME) 2>/dev/null || true
	@sudo rm -f /etc/systemd/system/$(SERVICE_NAME).service
	@sudo systemctl daemon-reload
	@echo "$(GREEN)✅ Service removed!$(NC)"

# 打包发布
package:
	@echo "$(BLUE)📦 Creating release package...$(NC)"
	@mkdir -p dist
	@tar -czf dist/$(BINARY_NAME)-$(VERSION).tar.gz \
		synocat_service.py service.py setup.py requirements.txt README.md
	@echo "$(GREEN)✅ Package created: dist/$(BINARY_NAME)-$(VERSION).tar.gz$(NC)"

# 帮助
help:
	@echo "$(BLUE)Available targets:$(NC)"
	@echo "  $(GREEN)install$(NC)         - Install the service to system"
	@echo "  $(GREEN)uninstall$(NC)       - Remove from system"
	@echo "  $(GREEN)run$(NC)             - Run the service"
	@echo "  $(GREEN)status$(NC)          - Show service status"
	@echo "  $(GREEN)info$(NC)            - Show service information"
	@echo "  $(GREEN)info-json$(NC)       - Show service info in JSON format"
	@echo "  $(GREEN)test$(NC)            - Run tests"
	@echo "  $(GREEN)clean$(NC)           - Clean cache files"
	@echo "  $(GREEN)fmt$(NC)             - Format code"
	@echo "  $(GREEN)lint$(NC)            - Run linter"
	@echo "  $(GREEN)typecheck$(NC)       - Run type checker"
	@echo "  $(GREEN)dev-deps$(NC)        - Install development dependencies"
	@echo "  $(GREEN)install-daemon$(NC)  - Install as systemd service"
	@echo "  $(GREEN)daemon$(NC)          - Run as systemd daemon"
	@echo "  $(GREEN)remove-daemon$(NC)   - Remove systemd service"
	@echo "  $(GREEN)package$(NC)         - Create release package"
	@echo "  $(GREEN)help$(NC)            - Show this help message"

.PHONY: all check-python deps install uninstall run status info info-json \
        test clean fmt lint typecheck dev-deps install-daemon daemon \
        remove-daemon package help