# Docker Web App Makefile
# 项目名称
APP_NAME = web-app
IMAGE_NAME = $(APP_NAME)
CONTAINER_NAME = $(APP_NAME)
PORT = 8080
NETWORK = web-network

# 颜色输出
COLOR_RESET = \033[0m
COLOR_GREEN = \033[32m
COLOR_YELLOW = \033[33m
COLOR_BLUE = \033[34m
COLOR_RED = \033[31m

# 默认目标
.PHONY: help
help:
	@echo "$(COLOR_BLUE)Docker Web App - Makefile 命令$(COLOR_RESET)"
	@echo "================================"
	@echo "$(COLOR_GREEN)make build$(COLOR_RESET)      - 构建 Docker 镜像"
	@echo "$(COLOR_GREEN)make run$(COLOR_RESET)        - 运行容器"
	@echo "$(COLOR_GREEN)make start$(COLOR_RESET)      - 启动容器（如果存在）"
	@echo "$(COLOR_GREEN)make stop$(COLOR_RESET)       - 停止容器"
	@echo "$(COLOR_GREEN)make restart$(COLOR_RESET)    - 重启容器"
	@echo "$(COLOR_GREEN)make status$(COLOR_RESET)     - 查看容器状态"
	@echo "$(COLOR_GREEN)make logs$(COLOR_RESET)       - 查看容器日志"
	@echo "$(COLOR_GREEN)make shell$(COLOR_RESET)      - 进入容器 shell"
	@echo "$(COLOR_GREEN)make clean$(COLOR_RESET)      - 清理容器和镜像"
	@echo "$(COLOR_GREEN)make clean-all$(COLOR_RESET)  - 完全清理（包括镜像）"
	@echo "$(COLOR_GREEN)make rebuild$(COLOR_RESET)    - 重新构建并运行"
	@echo "$(COLOR_GREEN)make dev$(COLOR_RESET)        - 开发模式（挂载当前目录）"
	@echo "$(COLOR_GREEN)make test$(COLOR_RESET)       - 测试容器运行"
	@echo "$(COLOR_GREEN)make ps$(COLOR_RESET)         - 查看所有容器"
	@echo "$(COLOR_GREEN)make size$(COLOR_RESET)       - 查看镜像大小"

# 构建镜像
.PHONY: build
build:
	@echo "$(COLOR_YELLOW)📦 构建 Docker 镜像...$(COLOR_RESET)"
	docker build -t $(IMAGE_NAME) .
	@echo "$(COLOR_GREEN)✅ 镜像构建成功: $(IMAGE_NAME)$(COLOR_RESET)"
	@docker images | grep $(IMAGE_NAME)

# 运行容器（首次创建并启动）
.PHONY: run
run: build
	@echo "$(COLOR_YELLOW)🚀 创建并启动容器...$(COLOR_RESET)"
	@$(MAKE) stop
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):80 \
		--restart unless-stopped \
		--network $(NETWORK) \
		$(IMAGE_NAME)
	@echo "$(COLOR_GREEN)✅ 容器启动成功！$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_BLUE)============================$(COLOR_RESET)"
	@echo "$(COLOR_GREEN)🎉 安装成功！$(COLOR_RESET)"
	@echo "$(COLOR_BLUE)============================$(COLOR_RESET)"
	@echo "$(COLOR_YELLOW)访问地址:$(COLOR_RESET) http://localhost:$(PORT)"
	@echo "$(COLOR_YELLOW)容器名称:$(COLOR_RESET) $(CONTAINER_NAME)"
	@echo "$(COLOR_YELLOW)容器状态:$(COLOR_RESET) $(shell docker ps --filter "name=$(CONTAINER_NAME)" --format "table {{.Status}}" | tail -n 1)"
	@echo ""
	@$(MAKE) status

# 启动已存在的容器
.PHONY: start
start:
	@echo "$(COLOR_YELLOW)▶️  启动容器...$(COLOR_RESET)"
	docker start $(CONTAINER_NAME) 2>/dev/null || echo "$(COLOR_RED)容器不存在，请先运行 make run$(COLOR_RESET)"
	@$(MAKE) status

# 停止容器
.PHONY: stop
stop:
	@echo "$(COLOR_YELLOW)⏹️  停止容器...$(COLOR_RESET)"
	docker stop $(CONTAINER_NAME) 2>/dev/null || true

# 重启容器
.PHONY: restart
restart: stop start
	@echo "$(COLOR_GREEN)✅ 容器已重启$(COLOR_RESET)"

# 查看容器状态
.PHONY: status
status:
	@echo "$(COLOR_BLUE)📊 容器状态:$(COLOR_RESET)"
	@if docker ps --filter "name=$(CONTAINER_NAME)" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q $(CONTAINER_NAME); then \
		docker ps --filter "name=$(CONTAINER_NAME)" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"; \
	else \
		echo "$(COLOR_RED)容器未运行$(COLOR_RESET)"; \
	fi

# 查看日志
.PHONY: logs
logs:
	@echo "$(COLOR_BLUE)📝 容器日志 (按 Ctrl+C 退出):$(COLOR_RESET)"
	docker logs -f $(CONTAINER_NAME)

# 进入容器 shell
.PHONY: shell
shell:
	@echo "$(COLOR_BLUE)🔧 进入容器 shell...$(COLOR_RESET)"
	docker exec -it $(CONTAINER_NAME) sh

# 清理容器
.PHONY: clean
clean:
	@echo "$(COLOR_YELLOW)🧹 清理容器...$(COLOR_RESET)"
	docker stop $(CONTAINER_NAME) 2>/dev/null || true
	docker rm $(CONTAINER_NAME) 2>/dev/null || true
	@echo "$(COLOR_GREEN)✅ 清理完成$(COLOR_RESET)"

# 完全清理（包括镜像）
.PHONY: clean-all
clean-all: clean
	@echo "$(COLOR_YELLOW)🧹 清理镜像...$(COLOR_RESET)"
	docker rmi $(IMAGE_NAME) 2>/dev/null || true
	@echo "$(COLOR_GREEN)✅ 完全清理完成$(COLOR_RESET)"

# 重新构建并运行
.PHONY: rebuild
rebuild: clean-all run

# 开发模式（挂载当前目录，支持热更新）
.PHONY: dev
dev:
	@echo "$(COLOR_YELLOW)🛠️  开发模式启动...$(COLOR_RESET)"
	@$(MAKE) clean
	@echo "$(COLOR_YELLOW)📦 构建镜像...$(COLOR_RESET)"
	docker build -t $(IMAGE_NAME)-dev .
	@echo "$(COLOR_YELLOW)🚀 启动开发容器（支持热更新）...$(COLOR_RESET)"
	docker run -d \
		--name $(CONTAINER_NAME)-dev \
		-p $(PORT):80 \
		-v $(PWD):/usr/share/nginx/html:ro \
		--restart unless-stopped \
		nginx:alpine
	@echo "$(COLOR_GREEN)✅ 开发容器启动成功！$(COLOR_RESET)"
	@echo "$(COLOR_YELLOW)访问地址:$(COLOR_RESET) http://localhost:$(PORT)"
	@echo "$(COLOR_YELLOW)提示:$(COLOR_RESET) 修改文件后刷新浏览器即可看到变化"

# 停止开发容器
.PHONY: dev-stop
dev-stop:
	@echo "$(COLOR_YELLOW)⏹️  停止开发容器...$(COLOR_RESET)"
	docker stop $(CONTAINER_NAME)-dev 2>/dev/null || true
	docker rm $(CONTAINER_NAME)-dev 2>/dev/null || true
	@echo "$(COLOR_GREEN)✅ 开发容器已停止$(COLOR_RESET)"

# 测试容器
.PHONY: test
test:
	@echo "$(COLOR_BLUE)🧪 测试容器运行...$(COLOR_RESET)"
	@$(MAKE) run
	@sleep 2
	@echo "$(COLOR_BLUE)测试 HTTP 访问...$(COLOR_RESET)"
	@curl -s -o /dev/null -w "$(COLOR_GREEN)HTTP 状态码: %{http_code}$(COLOR_RESET)\n" http://localhost:$(PORT)
	@echo "$(COLOR_GREEN)✅ 测试完成$(COLOR_RESET)"

# 查看所有容器
.PHONY: ps
ps:
	@echo "$(COLOR_BLUE)📋 所有容器:$(COLOR_RESET)"
	docker ps -a

# 查看镜像大小
.PHONY: size
size:
	@echo "$(COLOR_BLUE)📦 镜像大小:$(COLOR_RESET)"
	docker images $(IMAGE_NAME) --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# 导出镜像
.PHONY: export
export:
	@echo "$(COLOR_YELLOW}💾 导出镜像...$(COLOR_RESET)"
	docker save $(IMAGE_NAME) | gzip > $(IMAGE_NAME).tar.gz
	@echo "$(COLOR_GREEN)✅ 镜像已导出为: $(IMAGE_NAME).tar.gz$(COLOR_RESET)"

# 导入镜像
.PHONY: import
import:
	@echo "$(COLOR_YELLOW)📥 导入镜像...$(COLOR_RESET)"
	docker load < $(IMAGE_NAME).tar.gz
	@echo "$(COLOR_GREEN)✅ 镜像导入成功$(COLOR_RESET)"

# 查看容器资源使用
.PHONY: stats
stats:
	@echo "$(COLOR_BLUE)📊 容器资源使用:$(COLOR_RESET)"
	docker stats --no-stream $(CONTAINER_NAME)

# 备份容器数据
.PHONY: backup
backup:
	@echo "$(COLOR_YELLOW)💾 备份容器...$(COLOR_RESET)"
	docker exec $(CONTAINER_NAME) tar czf - /usr/share/nginx/html > backup_$(shell date +%Y%m%d_%H%M%S).tar.gz
	@echo "$(COLOR_GREEN)✅ 备份完成$(COLOR_RESET)"

# 显示帮助信息
.PHONY: info
info:
	@echo "$(COLOR_BLUE)项目信息:$(COLOR_RESET)"
	@echo "  应用名称: $(APP_NAME)"
	@echo "  镜像名称: $(IMAGE_NAME)"
	@echo "  容器名称: $(CONTAINER_NAME)"
	@echo "  访问端口: $(PORT)"
	@echo "  网络名称: $(NETWORK)"

# 创建网络
.PHONY: network
network:
	@echo "$(COLOR_YELLOW)🌐 创建 Docker 网络...$(COLOR_RESET)"
	docker network create $(NETWORK) 2>/dev/null || true
	@echo "$(COLOR_GREEN)✅ 网络已就绪$(COLOR_RESET)"

# 默认目标
.DEFAULT_GOAL := help