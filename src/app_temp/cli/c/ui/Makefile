# Makefile for synocat-check

# 编译器设置
CC = gcc
CFLAGS = -Wall -Wextra -O2 -std=c99
LDFLAGS =

# 目标文件
TARGET = synocat-check
SRC = synocat-check.c
OBJ = $(SRC:.c=.o)

# 平台检测
UNAME_S := $(shell uname -s)

# 平台特定标志
ifeq ($(UNAME_S), Linux)
    CFLAGS += -D_GNU_SOURCE
endif
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

# 颜色输出（用于 Make 本身）
GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[0;33m
BLUE = \033[0;34m
NC = \033[0m

# 默认目标
all: $(TARGET)

# 编译主程序
$(TARGET): $(OBJ)
	@echo "$(GREEN)🔨 Linking $(TARGET)...$(NC)"
	$(CC) $(OBJ) -o $(TARGET) $(LDFLAGS)
	@echo "$(GREEN)✅ Build successful!$(NC)"
	@echo "$(BLUE)📦 Run: ./$(TARGET)$(NC)"

# 编译对象文件
%.o: %.c
	@echo "$(YELLOW)📝 Compiling $<...$(NC)"
	$(CC) $(CFLAGS) -c $< -o $@

# 清理构建文件
clean:
	@echo "$(RED)🧹 Cleaning build files...$(NC)"
	rm -f $(OBJ) $(TARGET)
	@echo "$(GREEN)✅ Clean complete!$(NC)"

# 完全清理（包括备份文件）
distclean: clean
	@echo "$(RED)🧹 Removing backup files...$(NC)"
	rm -f *~ *.bak *.swp
	@echo "$(GREEN)✅ Distclean complete!$(NC)"

# 安装到系统路径（需要 sudo）
install: $(TARGET)
	@echo "$(BLUE)📦 Installing $(TARGET) to /usr/local/bin...$(NC)"
	sudo cp $(TARGET) /usr/local/bin/
	sudo chmod 755 /usr/local/bin/$(TARGET)
	@echo "$(GREEN)✅ Installation complete!$(NC)"
	@echo "$(BLUE)✨ Now you can run: $(TARGET)$(NC)"

# 卸载
uninstall:
	@echo "$(RED)🗑️  Uninstalling $(TARGET)...$(NC)"
	sudo rm -f /usr/local/bin/$(TARGET)
	@echo "$(GREEN)✅ Uninstall complete!$(NC)"

# 重新构建
rebuild: clean all

# 运行程序
run: $(TARGET)
	@echo "$(BLUE)🚀 Running $(TARGET)...$(NC)"
	./$(TARGET)

# 测试运行
test: $(TARGET)
	@echo "$(BLUE)🧪 Testing $(TARGET)...$(NC)"
	./$(TARGET) --help
	@echo ""
	./$(TARGET) --version

# 调试版本
debug: CFLAGS += -g -DDEBUG -O0
debug: clean $(TARGET)
	@echo "$(YELLOW)🐛 Debug build created!$(NC)"

# 发布版本（优化）
release: CFLAGS += -DNDEBUG -O3 -march=native
release: clean $(TARGET)
	@echo "$(GREEN)🚀 Release build created!$(NC)"

# 静态链接版本
static: LDFLAGS += -static
static: clean $(TARGET)
	@echo "$(BLUE)📦 Static build created!$(NC)"

# 交叉编译（Linux to Windows）
windows: CC = x86_64-w64-mingw32-gcc
windows: CFLAGS += -D_WIN32 -static
windows: TARGET = synocat-check.exe
windows: clean $(TARGET)
	@echo "$(GREEN)🪟 Windows binary created: $(TARGET)$(NC)"

# 检查代码风格
lint:
	@echo "$(YELLOW)🔍 Running code linter...$(NC)"
	@which cppcheck > /dev/null || (echo "$(RED)cppcheck not installed!$(NC)" && exit 1)
	cppcheck --enable=all --suppress=missingIncludeSystem $(SRC)
	@echo "$(GREEN)✅ Lint complete!$(NC)"

# 代码格式化
format:
	@echo "$(BLUE)🎨 Formatting code...$(NC)"
	@which clang-format > /dev/null || (echo "$(RED)clang-format not installed!$(NC)" && exit 1)
	clang-format -i -style=file $(SRC)
	@echo "$(GREEN)✅ Format complete!$(NC)"

# 显示帮助
help:
	@echo "$(BLUE)Available targets:$(NC)"
	@echo "  $(GREEN)all$(NC)       - Build the program (default)"
	@echo "  $(GREEN)clean$(NC)     - Remove object files and binary"
	@echo "  $(GREEN)distclean$(NC) - Clean everything including backup files"
	@echo "  $(GREEN)rebuild$(NC)   - Clean and rebuild"
	@echo "  $(GREEN)run$(NC)       - Build and run the program"
	@echo "  $(GREEN)test$(NC)      - Run tests (--help and --version)"
	@echo "  $(GREEN)debug$(NC)     - Build with debug symbols"
	@echo "  $(GREEN)release$(NC)   - Build with optimizations"
	@echo "  $(GREEN)static$(NC)    - Build statically linked binary"
	@echo "  $(GREEN)windows$(NC)   - Cross-compile for Windows"
	@echo "  $(GREEN)install$(NC)   - Install to /usr/local/bin"
	@echo "  $(GREEN)uninstall$(NC) - Remove from /usr/local/bin"
	@echo "  $(GREEN)lint$(NC)      - Check code style"
	@echo "  $(GREEN)format$(NC)    - Format code with clang-format"
	@echo "  $(GREEN)help$(NC)      - Show this help message"

# 伪目标声明
.PHONY: all clean distclean rebuild run test debug release static windows install uninstall lint format help

# 默认目标
.DEFAULT_GOAL := all