# Makefile for synocat-check (C++ version)

# 编译器设置
CXX = g++
CXXFLAGS = -Wall -Wextra -O2 -std=c++17
LDFLAGS = 

# 目标文件
TARGET = synocat-check
SRC = synocat-check.cpp
OBJ = $(SRC:.cpp=.o)
DEP = $(SRC:.cpp=.d)

# 平台检测
UNAME_S := $(shell uname -s)

# 平台特定标志
ifeq ($(UNAME_S), Linux)
    CXXFLAGS += -D_GNU_SOURCE
endif
ifeq ($(UNAME_S), Darwin)
    CXXFLAGS += -D_DARWIN_C_SOURCE
endif
ifeq ($(UNAME_S), MINGW32_NT)
    CXXFLAGS += -D_WIN32
    TARGET := synocat-check.exe
endif
ifeq ($(UNAME_S), MINGW64_NT)
    CXXFLAGS += -D_WIN32
    TARGET := synocat-check.exe
endif
ifeq ($(UNAME_S), MSYS_NT)
    CXXFLAGS += -D_WIN32
    TARGET := synocat-check.exe
endif

# 颜色输出
GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[0;33m
BLUE = \033[0;34m
CYAN = \033[0;36m
NC = \033[0m

# 默认目标
all: $(TARGET)

# 编译主程序
$(TARGET): $(OBJ)
	@echo "$(GREEN)🔨 Linking $(TARGET)...$(NC)"
	$(CXX) $(OBJ) -o $(TARGET) $(LDFLAGS)
	@echo "$(GREEN)✅ Build successful!$(NC)"
	@echo "$(BLUE)📦 Run: ./$(TARGET)$(NC)"

# 编译对象文件并生成依赖
%.o: %.cpp
	@echo "$(YELLOW)📝 Compiling $<...$(NC)"
	$(CXX) $(CXXFLAGS) -MMD -MP -c $< -o $@

# 包含依赖文件
-include $(DEP)

# 清理构建文件
clean:
	@echo "$(RED)🧹 Cleaning build files...$(NC)"
	rm -f $(OBJ) $(DEP) $(TARGET)
	@echo "$(GREEN)✅ Clean complete!$(NC)"

# 完全清理
distclean: clean
	@echo "$(RED)🧹 Removing backup files...$(NC)"
	rm -f *~ *.bak *.swp
	@echo "$(GREEN)✅ Distclean complete!$(NC)"

# 安装
install: $(TARGET)
	@echo "$(BLUE)📦 Installing $(TARGET) to /usr/local/bin...$(NC)"
	@if [ -w /usr/local/bin ]; then \
		cp $(TARGET) /usr/local/bin/; \
	else \
		sudo cp $(TARGET) /usr/local/bin/; \
	fi
	@chmod 755 /usr/local/bin/$(TARGET)
	@echo "$(GREEN)✅ Installation complete!$(NC)"
	@echo "$(BLUE)✨ Now you can run: $(TARGET)$(NC)"

# 卸载
uninstall:
	@echo "$(RED)🗑️  Uninstalling $(TARGET)...$(NC)"
	@if [ -w /usr/local/bin ]; then \
		rm -f /usr/local/bin/$(TARGET); \
	else \
		sudo rm -f /usr/local/bin/$(TARGET); \
	fi
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
debug: CXXFLAGS += -g -DDEBUG -O0
debug: clean $(TARGET)
	@echo "$(YELLOW)🐛 Debug build created!$(NC)"

# 发布版本（优化）
release: CXXFLAGS += -DNDEBUG -O3 -march=native -flto
release: LDFLAGS += -flto
release: clean $(TARGET)
	@echo "$(GREEN)🚀 Release build created!$(NC)"

# 静态链接版本
static: LDFLAGS += -static
static: clean $(TARGET)
	@echo "$(BLUE)📦 Static build created!$(NC)"

# 交叉编译（Linux to Windows）
windows: CXX = x86_64-w64-mingw32-g++
windows: CXXFLAGS += -D_WIN32 -static -O2
windows: TARGET = synocat-check.exe
windows: clean $(TARGET)
	@echo "$(GREEN)🪟 Windows binary created: $(TARGET)$(NC)"

# 代码分析
analyze:
	@echo "$(YELLOW)🔍 Running static analysis...$(NC)"
	@which clang-tidy > /dev/null || (echo "$(RED)clang-tidy not installed!$(NC)" && exit 1)
	clang-tidy $(SRC) -- $(CXXFLAGS)
	@echo "$(GREEN)✅ Analysis complete!$(NC)"

# 代码格式化
format:
	@echo "$(BLUE)🎨 Formatting code...$(NC)"
	@which clang-format > /dev/null || (echo "$(RED)clang-format not installed!$(NC)" && exit 1)
	clang-format -i -style=file $(SRC)
	@echo "$(GREEN)✅ Format complete!$(NC)"

# 性能分析
profile: CXXFLAGS += -pg -g
profile: LDFLAGS += -pg
profile: clean $(TARGET)
	@echo "$(YELLOW)📊 Profiling build created!$(NC)"
	@echo "$(BLUE)Run: ./$(TARGET) && gprof $(TARGET) gmon.out > analysis.txt$(NC)"

# 代码覆盖率
coverage: CXXFLAGS += -g -O0 --coverage
coverage: LDFLAGS += --coverage
coverage: clean $(TARGET)
	@echo "$(YELLOW)📈 Running coverage tests...$(NC)"
	./$(TARGET)
	@gcov $(SRC)
	@echo "$(GREEN)✅ Coverage report generated!$(NC)"

# 文档生成
docs:
	@echo "$(BLUE)📚 Generating documentation...$(NC)"
	@which doxygen > /dev/null || (echo "$(RED)doxygen not installed!$(NC)" && exit 1)
	@if [ ! -f Doxyfile ]; then \
		echo "Creating Doxyfile..."; \
		doxygen -g; \
		sed -i 's/^PROJECT_NAME.*/PROJECT_NAME = "synocat-check"/' Doxyfile; \
		sed -i 's/^INPUT.*/INPUT = .\//' Doxyfile; \
		sed -i 's/^RECURSIVE.*/RECURSIVE = YES/' Doxyfile; \
	fi
	doxygen
	@echo "$(GREEN)✅ Documentation generated in docs/$(NC)"

# 打包发布
package: release
	@echo "$(BLUE)📦 Creating release package...$(NC)"
	mkdir -p release
	cp $(TARGET) release/
	@if [ -f README.md ]; then cp README.md release/; fi
	@if [ -f LICENSE ]; then cp LICENSE release/; fi
	tar -czf synocat-check-$(shell date +%Y%m%d).tar.gz release/
	@echo "$(GREEN)✅ Package created!$(NC)"

# 安装依赖（开发工具）
setup-dev:
	@echo "$(BLUE)🔧 Installing development tools...$(NC)"
	@if command -v apt-get > /dev/null; then \
		sudo apt-get update; \
		sudo apt-get install -y g++ make cppcheck clang-tidy clang-format doxygen; \
	elif command -v yum > /dev/null; then \
		sudo yum install -y gcc-c++ make cppcheck clang-tidy clang-format doxygen; \
	elif command -v brew > /dev/null; then \
		brew install gcc make cppcheck llvm doxygen; \
	else \
		echo "$(RED)Unknown package manager. Please install tools manually.$(NC)"; \
	fi
	@echo "$(GREEN)✅ Development tools installed!$(NC)"

# 显示帮助
help:
	@echo "$(CYAN)╔══════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║                    synocat-check Makefile                    ║$(NC)"
	@echo "$(CYAN)╚══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(BLUE)Available targets:$(NC)"
	@echo "  $(GREEN)all$(NC)        - Build the program (default)"
	@echo "  $(GREEN)clean$(NC)      - Remove object files and binary"
	@echo "  $(GREEN)distclean$(NC)  - Clean everything including backup files"
	@echo "  $(GREEN)rebuild$(NC)    - Clean and rebuild"
	@echo "  $(GREEN)run$(NC)        - Build and run the program"
	@echo "  $(GREEN)test$(NC)       - Run tests (--help and --version)"
	@echo "  $(GREEN)debug$(NC)      - Build with debug symbols"
	@echo "  $(GREEN)release$(NC)    - Build with optimizations"
	@echo "  $(GREEN)static$(NC)     - Build statically linked binary"
	@echo "  $(GREEN)windows$(NC)    - Cross-compile for Windows"
	@echo "  $(GREEN)install$(NC)    - Install to /usr/local/bin"
	@echo "  $(GREEN)uninstall$(NC)  - Remove from /usr/local/bin"
	@echo "  $(GREEN)analyze$(NC)    - Run static code analysis"
	@echo "  $(GREEN)format$(NC)     - Format code with clang-format"
	@echo "  $(GREEN)profile$(NC)    - Build for profiling with gprof"
	@echo "  $(GREEN)coverage$(NC)   - Generate code coverage report"
	@echo "  $(GREEN)docs$(NC)       - Generate documentation with Doxygen"
	@echo "  $(GREEN)package$(NC)    - Create release package"
	@echo "  $(GREEN)setup-dev$(NC)  - Install development tools"
	@echo "  $(GREEN)help$(NC)       - Show this help message"
	@echo ""

# 伪目标声明
.PHONY: all clean distclean rebuild run test debug release static windows \
        install uninstall analyze format profile coverage docs package setup-dev help

# 默认目标
.DEFAULT_GOAL := all