# Podman Web App Makefile
# 项目名称
APP_NAME = web-app
IMAGE_NAME = $(APP_NAME)
CONTAINER_NAME = $(APP_NAME)
PORT = 8080
NETWORK = web-network

# 检测是否使用 Podman 或 Docker
PODMAN := $(shell command -v podman 2> /dev/null)
DOCKER := $(shell command -v docker 2> /dev/null)

ifeq ($(PODMAN),)
    CONTAINER_CMD = docker
    CONTAINER_TYPE = Docker
else
    CONTAINER_CMD = podman
    CONTAINER_TYPE = Podman
endif

# 颜色输出
COLOR_RESET = \033[0m
COLOR_GREEN = \033[32m
COLOR_YELLOW = \033[33m
COLOR_BLUE = \033[34m
COLOR_RED = \033[31m
COLOR_CYAN = \033[36m

# 默认目标
.PHONY: help
help:
	@echo "$(COLOR_CYAN)╔════════════════════════════════════════╗$(COLOR_RESET)"
	@echo "$(COLOR_CYAN)║     $(CONTAINER_TYPE) Web App - Makefile 命令      ║$(COLOR_RESET)"
	@echo "$(COLOR_CYAN)╚════════════════════════════════════════╝$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_GREEN)基础命令:$(COLOR_RESET)"
	@echo "  make build          - 构建容器镜像"
	@echo "  make run            - 创建并运行容器"
	@echo "  make start          - 启动已存在的容器"
	@echo "  make stop           - 停止容器"
	@echo "  make restart        - 重启容器"
	@echo "  make status         - 查看容器状态"
	@echo "  make logs           - 查看容器日志"
	@echo ""
	@echo "$(COLOR_GREEN)开发命令:$(COLOR_RESET)"
	@echo "  make dev            - 开发模式（热更新）"
	@echo "  make shell          - 进入容器 Shell"
	@echo "  make exec           - 在容器中执行命令"
	@echo ""
	@echo "$(COLOR_GREEN)管理命令:$(COLOR_RESET)"
	@echo "  make clean          - 清理容器"
	@echo "  make clean-all      - 完全清理（包括镜像）"
	@echo "  make rebuild        - 重新构建并运行"
	@echo "  make ps             - 查看所有容器"
	@echo "  make images         - 查看所有镜像"
	@echo "  make size           - 查看镜像大小"
	@echo ""
	@echo "$(COLOR_GREEN)高级命令:$(COLOR_RESET)"
	@echo "  make test           - 测试容器运行"
	@echo "  make export         - 导出镜像"
	@echo "  make import         - 导入镜像"
	@echo "  make stats          - 查看容器资源使用"
	@echo "  make backup         - 备份容器数据"
	@echo "  make info           - 显示项目信息"
	@echo "  make version        - 显示 $(CONTAINER_TYPE) 版本"
	@echo ""

# 构建镜像
.PHONY: build
build:
	@echo "$(COLOR_YELLOW)📦 构建 $(CONTAINER_TYPE) 镜像...$(COLOR_RESET)"
	@if [ -f "Containerfile" ]; then \
		$(CONTAINER_CMD) build -t $(IMAGE_NAME) -f Containerfile .; \
	elif [ -f "Dockerfile" ]; then \
		$(CONTAINER_CMD) build -t $(IMAGE_NAME) -f Dockerfile .; \
	else \
		$(CONTAINER_CMD) build -t $(IMAGE_NAME) .; \
	fi
	@echo "$(COLOR_GREEN)✅ 镜像构建成功: $(IMAGE_NAME)$(COLOR_RESET)"
	@$(MAKE) images

# 运行容器（首次创建并启动）
.PHONY: run
run: build
	@echo "$(COLOR_YELLOW)🚀 创建并启动容器...$(COLOR_RESET)"
	@$(MAKE) stop 2>/dev/null || true
	@$(CONTAINER_CMD) rm $(CONTAINER_NAME) 2>/dev/null || true
	@$(CONTAINER_CMD) run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):80 \
		--restart unless-stopped \
		$(IMAGE_NAME)
	@echo "$(COLOR_GREEN)✅ 容器启动成功！$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_CYAN)╔════════════════════════════════════════╗$(COLOR_RESET)"
	@echo "$(COLOR_CYAN)║         $(COLOR_GREEN)🎉 安装成功！$(COLOR_CYAN)                ║$(COLOR_RESET)"
	@echo "$(COLOR_CYAN)╚════════════════════════════════════════╝$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_YELLOW)访问地址:$(COLOR_RESET) http://localhost:$(PORT)"
	@echo "$(COLOR_YELLOW)容器名称:$(COLOR_RESET) $(CONTAINER_NAME)"
	@echo "$(COLOR_YELLOW)容器引擎:$(COLOR_RESET) $(CONTAINER_TYPE)"
	@echo ""
	@$(MAKE) status

# 启动已存在的容器
.PHONY: start
start:
	@echo "$(COLOR_YELLOW)▶️  启动容器...$(COLOR_RESET)"
	@$(CONTAINER_CMD) start $(CONTAINER_NAME) 2>/dev/null || echo "$(COLOR_RED)❌ 容器不存在，请先运行 make run$(COLOR_RESET)"
	@$(MAKE) status

# 停止容器
.PHONY: stop
stop:
	@echo "$(COLOR_YELLOW)⏹️  停止容器...$(COLOR_RESET)"
	@$(CONTAINER_CMD) stop $(CONTAINER_NAME) 2>/dev/null || true

# 重启容器
.PHONY: restart
restart: stop start
	@echo "$(COLOR_GREEN)✅ 容器已重启$(COLOR_RESET)"

# 查看容器状态
.PHONY: status
status:
	@echo "$(COLOR_BLUE)📊 容器状态:$(COLOR_RESET)"
	@if $(CONTAINER_CMD) ps --filter "name=$(CONTAINER_NAME)" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q $(CONTAINER_NAME); then \
		$(CONTAINER_CMD) ps --filter "name=$(CONTAINER_NAME)" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"; \
	else \
		echo "$(COLOR_RED)❌ 容器未运行$(COLOR_RESET)"; \
	fi

# 查看日志
.PHONY: logs
logs:
	@echo "$(COLOR_BLUE)📝 容器日志 (按 Ctrl+C 退出):$(COLOR_RESET)"
	$(CONTAINER_CMD) logs -f $(CONTAINER_NAME)

# 进入容器 shell
.PHONY: shell
shell:
	@echo "$(COLOR_BLUE)🔧 进入容器 shell...$(COLOR_RESET)"
	$(CONTAINER_CMD) exec -it $(CONTAINER_NAME) sh

# 在容器中执行命令
.PHONY: exec
exec:
	@echo "$(COLOR_BLUE)🔧 执行命令 (需要指定 CMD):$(COLOR_RESET)"
	@echo "示例: make exec CMD='ls -la'"
	$(CONTAINER_CMD) exec -it $(CONTAINER_NAME) $(CMD)

# 开发模式（挂载当前目录，支持热更新）
.PHONY: dev
dev:
	@echo "$(COLOR_YELLOW)🛠️  开发模式启动...$(COLOR_RESET)"
	@$(CONTAINER_CMD) stop $(CONTAINER_NAME)-dev 2>/dev/null || true
	@$(CONTAINER_CMD) rm $(CONTAINER_NAME)-dev 2>/dev/null || true
	@echo "$(COLOR_YELLOW)🚀 启动开发容器（支持热更新）...$(COLOR_RESET)"
	@$(CONTAINER_CMD) run -d \
		--name $(CONTAINER_NAME)-dev \
		-p $(PORT):80 \
		-v $(PWD):/usr/share/nginx/html:ro \
		--restart unless-stopped \
		nginx:alpine
	@echo "$(COLOR_GREEN)✅ 开发容器启动成功！$(COLOR_RESET)"
	@echo "$(COLOR_YELLOW)访问地址:$(COLOR_RESET) http://localhost:$(PORT)"
	@echo "$(COLOR_YELLOW)提示:$(COLOR_RESET) 修改文件后刷新浏览器即可看到变化"
	@echo "$(COLOR_YELLOW)停止开发:$(COLOR_RESET) make dev-stop"

# 停止开发容器
.PHONY: dev-stop
dev-stop:
	@echo "$(COLOR_YELLOW)⏹️  停止开发容器...$(COLOR_RESET)"
	@$(CONTAINER_CMD) stop $(CONTAINER_NAME)-dev 2>/dev/null || true
	@$(CONTAINER_CMD) rm $(CONTAINER_NAME)-dev 2>/dev/null || true
	@echo "$(COLOR_GREEN)✅ 开发容器已停止$(COLOR_RESET)"

# 清理容器
.PHONY: clean
clean:
	@echo "$(COLOR_YELLOW)🧹 清理容器...$(COLOR_RESET)"
	@$(CONTAINER_CMD) stop $(CONTAINER_NAME) 2>/dev/null || true
	@$(CONTAINER_CMD) rm $(CONTAINER_NAME) 2>/dev/null || true
	@$(CONTAINER_CMD) stop $(CONTAINER_NAME)-dev 2>/dev/null || true
	@$(CONTAINER_CMD) rm $(CONTAINER_NAME)-dev 2>/dev/null || true
	@echo "$(COLOR_GREEN)✅ 清理完成$(COLOR_RESET)"

# 完全清理（包括镜像）
.PHONY: clean-all
clean-all: clean
	@echo "$(COLOR_YELLOW)🧹 清理镜像...$(COLOR_RESET)"
	@$(CONTAINER_CMD) rmi $(IMAGE_NAME) 2>/dev/null || true
	@$(CONTAINER_CMD) image prune -f 2>/dev/null || true
	@echo "$(COLOR_GREEN)✅ 完全清理完成$(COLOR_RESET)"

# 重新构建并运行
.PHONY: rebuild
rebuild: clean-all run

# 测试容器
.PHONY: test
test:
	@echo "$(COLOR_BLUE)🧪 测试容器运行...$(COLOR_RESET)"
	@$(MAKE) run
	@sleep 2
	@echo "$(COLOR_BLUE)测试 HTTP 访问...$(COLOR_RESET)"
	@curl -s -o /dev/null -w "$(COLOR_GREEN)HTTP 状态码: %{http_code}$(COLOR_RESET)\n" http://localhost:$(PORT) || echo "$(COLOR_RED)❌ 无法访问$(COLOR_RESET)"
	@echo "$(COLOR_GREEN)✅ 测试完成$(COLOR_RESET)"

# 查看所有容器
.PHONY: ps
ps:
	@echo "$(COLOR_BLUE)📋 所有容器:$(COLOR_RESET)"
	$(CONTAINER_CMD) ps -a

# 查看所有镜像
.PHONY: images
images:
	@echo "$(COLOR_BLUE)📦 所有镜像:$(COLOR_RESET)"
	$(CONTAINER_CMD) images | grep -E "REPOSITORY|$(IMAGE_NAME)"

# 查看镜像大小
.PHONY: size
size:
	@echo "$(COLOR_BLUE)📦 镜像大小:$(COLOR_RESET)"
	$(CONTAINER_CMD) images $(IMAGE_NAME) --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# 导出镜像
.PHONY: export
export:
	@echo "$(COLOR_YELLOW)💾 导出镜像...$(COLOR_RESET)"
	$(CONTAINER_CMD) save $(IMAGE_NAME) | gzip > $(IMAGE_NAME)_$(shell date +%Y%m%d).tar.gz
	@echo "$(COLOR_GREEN)✅ 镜像已导出为: $(IMAGE_NAME)_$(shell date +%Y%m%d).tar.gz$(COLOR_RESET)"

# 导入镜像
.PHONY: import
import:
	@echo "$(COLOR_YELLOW)📥 导入镜像...$(COLOR_RESET)"
	@read -p "请输入镜像文件名: " filename; \
	gunzip -c $$filename | $(CONTAINER_CMD) load
	@echo "$(COLOR_GREEN)✅ 镜像导入成功$(COLOR_RESET)"

# 查看容器资源使用
.PHONY: stats
stats:
	@echo "$(COLOR_BLUE)📊 容器资源使用:$(COLOR_RESET)"
	$(CONTAINER_CMD) stats --no-stream $(CONTAINER_NAME)

# 备份容器数据
.PHONY: backup
backup:
	@echo "$(COLOR_YELLOW)💾 备份容器...$(COLOR_RESET)"
	@mkdir -p backups
	$(CONTAINER_CMD) exec $(CONTAINER_NAME) tar czf - /usr/share/nginx/html > backups/backup_$(shell date +%Y%m%d_%H%M%S).tar.gz
	@echo "$(COLOR_GREEN)✅ 备份完成，保存在 backups/ 目录$(COLOR_RESET)"

# 显示项目信息
.PHONY: info
info:
	@echo "$(COLOR_BLUE)项目信息:$(COLOR_RESET)"
	@echo "  应用名称:     $(APP_NAME)"
	@echo "  镜像名称:     $(IMAGE_NAME)"
	@echo "  容器名称:     $(CONTAINER_NAME)"
	@echo "  访问端口:     $(PORT)"
	@echo "  容器引擎:     $(CONTAINER_TYPE)"
	@echo "  引擎版本:     $(shell $(CONTAINER_CMD) version --format '{{.Client.Version}}')"
	@echo "  配置文件:     $(shell test -f Containerfile && echo 'Containerfile' || echo 'Dockerfile')"

# 显示版本
.PHONY: version
version:
	@echo "$(COLOR_CYAN)$(CONTAINER_TYPE) 版本信息:$(COLOR_RESET)"
	$(CONTAINER_CMD) version

# 创建并运行（带交互）
.PHONY: interactive
interactive:
	@echo "$(COLOR_YELLOW)🎯 交互式运行...$(COLOR_RESET)"
	@read -p "请输入端口号 [$(PORT)]: " input_port; \
	port=$${input_port:-$(PORT)}; \
	$(CONTAINER_CMD) run -d \
		--name $(CONTAINER_NAME) \
		-p $$port:80 \
		--restart unless-stopped \
		$(IMAGE_NAME)
	@echo "$(COLOR_GREEN)✅ 容器已启动在端口 $$port$(COLOR_RESET)"

# 清理所有未使用的资源
.PHONY: prune
prune:
	@echo "$(COLOR_YELLOW)🧹 清理未使用的资源...$(COLOR_RESET)"
	$(CONTAINER_CMD) system prune -f
	@echo "$(COLOR_GREEN)✅ 清理完成$(COLOR_RESET)"

# 默认目标
.DEFAULT_GOAL := help