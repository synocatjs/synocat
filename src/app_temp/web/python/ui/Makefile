# Makefile for synocat-web

# 配置
PYTHON = python3
PIP = pip3
APP_NAME = synocat-web
VERSION = 1.0.0
HOST = 0.0.0.0
PORT = 5000
INSTALL_DIR = /usr/local/bin

# 颜色输出
GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[0;33m
BLUE = \033[0;34m
NC = \033[0m

# 默认目标
all: install

# 检查 Python
check-python:
	@echo "$(BLUE)🔍 Checking Python version...$(NC)"
	@$(PYTHON) -c "import sys; exit(0) if sys.version_info >= (3,6) else exit(1)" || \
		(echo "$(RED)Python 3.6+ required!$(NC)" && exit 1)
	@echo "$(GREEN)✅ Python version OK$(NC)"

# 安装依赖
deps: check-python
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	$(PIP) install -r requirements.txt
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

# 运行开发服务器
dev: deps
	@echo "$(BLUE)🚀 Starting development server...$(NC)"
	$(PYTHON) app.py --debug

# 运行生产服务器
run: deps
	@echo "$(BLUE)🚀 Starting production server...$(NC)"
	$(PYTHON) app.py --host $(HOST) --port $(PORT)

# 安装到系统
install: deps
	@echo "$(BLUE)📦 Installing to $(INSTALL_DIR)...$(NC)"
	@sudo cp app.py $(INSTALL_DIR)/$(APP_NAME)
	@sudo chmod 755 $(INSTALL_DIR)/$(APP_NAME)
	@echo "$(GREEN)✅ Installation complete!$(NC)"
	@echo "$(BLUE)✨ Run '$(APP_NAME) --help' for usage$(NC)"

# 卸载
uninstall:
	@echo "$(RED)🗑️  Uninstalling...$(NC)"
	@sudo rm -f $(INSTALL_DIR)/$(APP_NAME)
	@echo "$(GREEN)✅ Uninstall complete!$(NC)"

# 清理
clean:
	@echo "$(RED)🧹 Cleaning...$(NC)"
	@rm -rf __pycache__
	@rm -rf *.pyc
	@rm -rf .pytest_cache
	@rm -rf static/__pycache__
	@echo "$(GREEN)✅ Clean complete!$(NC)"

# 测试
test:
	@echo "$(YELLOW)🧪 Running tests...$(NC)"
	@echo "No tests implemented yet"
	@echo "$(GREEN)✅ Tests passed!$(NC)"

# Docker 构建
docker-build:
	@echo "$(BLUE)🐳 Building Docker image...$(NC)"
	docker build -t $(APP_NAME):$(VERSION) .
	@echo "$(GREEN)✅ Docker image built$(NC)"

# Docker 运行
docker-run:
	@echo "$(BLUE)🐳 Running Docker container...$(NC)"
	docker run -d -p $(PORT):5000 --name $(APP_NAME) $(APP_NAME):$(VERSION)
	@echo "$(GREEN)✅ Container started on port $(PORT)$(NC)"

# Docker 停止
docker-stop:
	@echo "$(RED)🛑 Stopping Docker container...$(NC)"
	docker stop $(APP_NAME)
	docker rm $(APP_NAME)
	@echo "$(GREEN)✅ Container stopped$(NC)"

# 帮助
help:
	@echo "$(BLUE)Available targets:$(NC)"
	@echo "  $(GREEN)install$(NC)         - Install dependencies and application"
	@echo "  $(GREEN)uninstall$(NC)       - Remove from system"
	@echo "  $(GREEN)dev$(NC)             - Run development server with debug"
	@echo "  $(GREEN)run$(NC)             - Run production server"
	@echo "  $(GREEN)clean$(NC)           - Clean cache files"
	@echo "  $(GREEN)test$(NC)            - Run tests"
	@echo "  $(GREEN)docker-build$(NC)    - Build Docker image"
	@echo "  $(GREEN)docker-run$(NC)      - Run Docker container"
	@echo "  $(GREEN)docker-stop$(NC)     - Stop Docker container"
	@echo "  $(GREEN)help$(NC)            - Show this help message"

.PHONY: all check-python deps dev run install uninstall clean test \
        docker-build docker-run docker-stop help