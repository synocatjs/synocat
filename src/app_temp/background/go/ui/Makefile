# Makefile for synocat-service

# 配置
BINARY_NAME = synocat-service
VERSION = 1.0.0
BUILD_TIME = $(shell date -u '+%Y-%m-%d_%H:%M:%S')
GIT_COMMIT = $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Go 相关
GOCMD = go
GOBUILD = $(GOCMD) build
GOCLEAN = $(GOCMD) clean
GOTEST = $(GOCMD) test
GOGET = $(GOCMD) get
GOMOD = $(GOCMD) mod

# 构建标志
LDFLAGS = -ldflags "-X main.Version=$(VERSION) -X main.BuildTime=$(BUILD_TIME) -X main.GitCommit=$(GIT_COMMIT)"

# 平台构建
PLATFORMS = linux/amd64 linux/arm64 darwin/amd64 darwin/arm64 windows/amd64

# 颜色输出
GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[0;33m
BLUE = \033[0;34m
NC = \033[0m

# 默认目标
all: build

# 构建当前平台
build:
	@echo "$(GREEN)🔨 Building $(BINARY_NAME)...$(NC)"
	$(GOBUILD) $(LDFLAGS) -o $(BINARY_NAME) main.go service.go
	@echo "$(GREEN)✅ Build complete: $(BINARY_NAME)$(NC)"

# 构建所有平台
build-all:
	@echo "$(BLUE)📦 Building for all platforms...$(NC)"
	@for platform in $(PLATFORMS); do \
		GOOS=$${platform%/*} GOARCH=$${platform#*/} \
		$(GOBUILD) $(LDFLAGS) -o $(BINARY_NAME)-$${platform%/*}-$${platform#*/} \
		main.go service.go; \
		echo "$(GREEN)✅ Built: $(BINARY_NAME)-$${platform%/*}-$${platform#*/}$(NC)"; \
	done

# 安装到系统
install: build
	@echo "$(BLUE)📦 Installing to /usr/local/bin...$(NC)"
	@sudo cp $(BINARY_NAME) /usr/local/bin/
	@sudo chmod 755 /usr/local/bin/$(BINARY_NAME)
	@echo "$(GREEN)✅ Installation complete!$(NC)"
	@echo "$(BLUE)✨ Run '$(BINARY_NAME) start' to start the service$(NC)"

# 卸载
uninstall:
	@echo "$(RED)🗑️  Uninstalling...$(NC)"
	@sudo rm -f /usr/local/bin/$(BINARY_NAME)
	@echo "$(GREEN)✅ Uninstall complete!$(NC)"

# 运行服务
run: build
	@echo "$(BLUE)🚀 Starting service...$(NC)"
	./$(BINARY_NAME) start

# 显示状态
status: build
	./$(BINARY_NAME) status

# 显示信息
info: build
	./$(BINARY_NAME) info

# JSON 格式信息
info-json: build
	./$(BINARY_NAME) info json

# 测试
test:
	@echo "$(YELLOW)🧪 Running tests...$(NC)"
	$(GOTEST) -v ./...
	@echo "$(GREEN)✅ Tests passed!$(NC)"

# 清理
clean:
	@echo "$(RED)🧹 Cleaning...$(NC)"
	$(GOCLEAN)
	rm -f $(BINARY_NAME) $(BINARY_NAME)-*
	@echo "$(GREEN)✅ Clean complete!$(NC)"

# 依赖管理
deps:
	@echo "$(BLUE)📦 Downloading dependencies...$(NC)"
	$(GOMOD) download
	@echo "$(GREEN)✅ Dependencies ready!$(NC)"

# 格式化代码
fmt:
	@echo "$(BLUE)🎨 Formatting code...$(NC)"
	$(GOCMD) fmt ./...
	@echo "$(GREEN)✅ Format complete!$(NC)"

# 代码检查
lint:
	@echo "$(YELLOW)🔍 Running linter...$(NC)"
	@which golangci-lint >/dev/null 2>&1 || (echo "$(RED)golangci-lint not installed!$(NC)" && exit 1)
	golangci-lint run
	@echo "$(GREEN)✅ Lint complete!$(NC)"

# 运行服务作为守护进程（Linux）
daemon: build
	@echo "$(BLUE)🚀 Starting as daemon...$(NC)"
	@if [ -f /etc/systemd/system/$(BINARY_NAME).service ]; then \
		sudo systemctl start $(BINARY_NAME); \
		sudo systemctl status $(BINARY_NAME); \
	else \
		echo "$(RED)Service not installed as systemd service!$(NC)"; \
		echo "$(YELLOW)Run 'make install-daemon' first$(NC)"; \
	fi

# 安装为系统服务（systemd）
install-daemon: build
	@echo "$(BLUE)📦 Installing as systemd service...$(NC)"
	@echo "[Unit]" | sudo tee /etc/systemd/system/$(BINARY_NAME).service
	@echo "Description=Synocat Background Service" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "After=network.target" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "[Service]" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "Type=simple" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "User=$(shell whoami)" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "WorkingDirectory=$(shell pwd)" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "ExecStart=$(shell pwd)/$(BINARY_NAME) start" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "Restart=on-failure" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "[Install]" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@echo "WantedBy=multi-user.target" | sudo tee -a /etc/systemd/system/$(BINARY_NAME).service
	@sudo systemctl daemon-reload
	@sudo systemctl enable $(BINARY_NAME)
	@echo "$(GREEN)✅ Service installed! Run 'make daemon' to start$(NC)"

# 移除系统服务
remove-daemon:
	@echo "$(RED)🗑️  Removing systemd service...$(NC)"
	@sudo systemctl stop $(BINARY_NAME) 2>/dev/null || true
	@sudo systemctl disable $(BINARY_NAME) 2>/dev/null || true
	@sudo rm -f /etc/systemd/system/$(BINARY_NAME).service
	@sudo systemctl daemon-reload
	@echo "$(GREEN)✅ Service removed!$(NC)"

# 打包发布
package: build-all
	@echo "$(BLUE)📦 Creating release packages...$(NC)"
	@mkdir -p dist
	@for binary in $(BINARY_NAME)-*; do \
		if [ -f "$$binary" ]; then \
			tar -czf "dist/$$binary.tar.gz" "$$binary"; \
			echo "$(GREEN)✅ Packaged: $$binary.tar.gz$(NC)"; \
		fi \
	done
	@echo "$(GREEN)✅ Packages created in dist/$(NC)"

# 帮助
help:
	@echo "$(BLUE)Available targets:$(NC)"
	@echo "  $(GREEN)build$(NC)         - Build the service"
	@echo "  $(GREEN)build-all$(NC)     - Build for all platforms"
	@echo "  $(GREEN)install$(NC)       - Install to /usr/local/bin"
	@echo "  $(GREEN)uninstall$(NC)     - Remove from /usr/local/bin"
	@echo "  $(GREEN)run$(NC)           - Build and run the service"
	@echo "  $(GREEN)status$(NC)        - Show service status"
	@echo "  $(GREEN)info$(NC)          - Show service information"
	@echo "  $(GREEN)info-json$(NC)     - Show service info in JSON format"
	@echo "  $(GREEN)test$(NC)          - Run tests"
	@echo "  $(GREEN)clean$(NC)         - Clean build files"
	@echo "  $(GREEN)deps$(NC)          - Download dependencies"
	@echo "  $(GREEN)fmt$(NC)           - Format code"
	@echo "  $(GREEN)lint$(NC)          - Run linter"
	@echo "  $(GREEN)daemon$(NC)        - Run as systemd daemon (Linux)"
	@echo "  $(GREEN)install-daemon$(NC) - Install as systemd service"
	@echo "  $(GREEN)remove-daemon$(NC) - Remove systemd service"
	@echo "  $(GREEN)package$(NC)       - Create release packages"
	@echo "  $(GREEN)help$(NC)          - Show this help message"

.PHONY: all build build-all install uninstall run status info info-json test \
        clean deps fmt lint daemon install-daemon remove-daemon package help