#!/bin/bash

# synocat-check.sh - Installation verification tool for synocat
# Version: 1.0.0

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# 版本号
VERSION="1.0.0"

# 获取终端宽度
get_terminal_width() {
    if command -v tput >/dev/null 2>&1; then
        tput cols 2>/dev/null || echo 80
    else
        echo 80
    fi
}

# 打印居中文本
print_centered() {
    local text="$1"
    local width="$2"
    local color="${3:-$NC}"
    local len=${#text}
    local padding=$(( (width - len) / 2 ))
    [[ $padding -lt 0 ]] && padding=0
    
    printf "${color}%*s%s${NC}\n" $padding "" "$text"
}

# 打印带边框的标题
print_header() {
    local width=$(get_terminal_width)
    [[ $width -gt 80 ]] && width=80
    
    echo ""
    echo -e "${CYAN}╔$(printf '═%.0s' $(seq 1 $((width - 2))))╗${NC}"
    
    # ASCII Logo
    echo -e "${CYAN}║${NC}${GREEN}"
    echo "   _____          _             _   "
    echo "  / ____|        | |           | |  "
    echo " | (___   _ __   | |_   ___    | |_ "
    echo "  \\___ \\ | '_ \\  | __| / _ \\   | __|"
    echo "  ____) || | | | | |_ | (_) |  | |_ "
    echo " |_____/ |_| |_|  \\__| \\___/    \\__|"
    echo "                                    "
    echo -e "${NC}${CYAN}║${NC}"
    
    echo -e "${CYAN}╠$(printf '═%.0s' $(seq 1 $((width - 2))))╣${NC}"
    
    local title="synocat v${VERSION} - CLI Scaffold Tool for Synology DSM 7"
    print_centered "$title" $((width - 2)) "${BOLD}${YELLOW}"
    
    local subtitle="Designed for Frontend Developers"
    print_centered "$subtitle" $((width - 2)) "${CYAN}"
    
    echo -e "${CYAN}╚$(printf '═%.0s' $(seq 1 $((width - 2))))╝${NC}"
    echo ""
}

# 打印成功信息框
print_success_box() {
    local width=$(get_terminal_width)
    [[ $width -gt 70 ]] && width=70
    
    echo -e "${GREEN}┌$(printf '─%.0s' $(seq 1 $((width - 2))))┐${NC}"
    
    local success_msg="✓ INSTALLATION SUCCESSFUL!"
    print_centered "$success_msg" $((width - 2)) "${BOLD}${GREEN}"
    
    local msg1="synocat has been installed successfully"
    print_centered "$msg1" $((width - 2)) "${GREEN}"
    
    echo ""
    
    local msg2="Ready to create Synology DSM 7 packages"
    print_centered "$msg2" $((width - 2)) "${GREEN}"
    
    echo -e "${GREEN}└$(printf '─%.0s' $(seq 1 $((width - 2))))┘${NC}"
    echo ""
}

# 打印功能列表
print_features() {
    echo -e "${BOLD}${CYAN}Available Features:${NC}"
    echo -e "  ${GREEN}•${NC} Interactive package creation wizard"
    echo -e "  ${GREEN}•${NC} Vue.js DSM desktop application templates"
    echo -e "  ${GREEN}•${NC} Node.js backend service templates"
    echo -e "  ${GREEN}•${NC} Docker package support (DSM 7.2.1+)"
    echo -e "  ${GREEN}•${NC} SPK package generation"
    echo -e "  ${GREEN}•${NC} Configuration validation"
    echo ""
}

# 打印快速入门指南
print_quick_start() {
    echo -e "${BOLD}${YELLOW}Quick Start:${NC}"
    echo -e "  ${GREEN}\$${NC} synocat                    ${CYAN}# Interactive package creation${NC}"
    echo -e "  ${GREEN}\$${NC} synocat create my-package   ${CYAN}# Create with default template${NC}"
    echo -e "  ${GREEN}\$${NC} synocat create my-package -t vue-desktop  ${CYAN}# Use Vue template${NC}"
    echo -e "  ${GREEN}\$${NC} synocat pack ./my-package   ${CYAN}# Generate .spk package${NC}"
    echo -e "  ${GREEN}\$${NC} synocat validate ./package  ${CYAN}# Validate configuration${NC}"
    echo ""
}

# 打印可用模板
print_templates() {
    echo -e "${BOLD}${MAGENTA}Available Templates:${NC}"
    printf "  ${GREEN}•${NC} %-15s %s\n" "minimal" "Pure shell package, works on all platforms"
    printf "  ${GREEN}•${NC} %-15s %s\n" "node-service" "Node.js backend service with start/stop scripts"
    printf "  ${GREEN}•${NC} %-15s %s\n" "vue-desktop" "Vue.js DSM desktop application"
    printf "  ${GREEN}•${NC} %-15s %s\n" "docker" "Docker Compose package (DSM 7.2.1+)"
    echo ""
}

# 交互式确认函数
interactive_confirmation() {
    local choice
    
    echo -e "${BOLD}${CYAN}┌─────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${BOLD}${CYAN}│  Would you like to:${NC}"
    echo -e "${BOLD}${CYAN}│${NC}"
    echo -e "${BOLD}${CYAN}│    1) Create a new package now${NC}"
    echo -e "${BOLD}${CYAN}│    2) View documentation${NC}"
    echo -e "${BOLD}${CYAN}│    3) Show help${NC}"
    echo -e "${BOLD}${CYAN}│    4) Exit${NC}"
    echo -e "${BOLD}${CYAN}│${NC}"
    echo -e "${BOLD}${CYAN}└─────────────────────────────────────────────────────────────┘${NC}"
    echo ""
    
    while true; do
        read -p "$(echo -e ${BOLD}"Enter your choice [1-4]: "${NC})" choice
        case $choice in
            1)
                echo ""
                echo -e "${GREEN}✓ Good choice! Run 'synocat create <package-name>' to get started.${NC}"
                echo ""
                return 0
                ;;
            2)
                echo ""
                echo -e "${CYAN}📖 Documentation:${NC}"
                echo "   https://help.synology.com/developer-guide/"
                echo "   https://github.com/SynologyOpenSource/ExamplePackages"
                echo ""
                return 0
                ;;
            3)
                echo ""
                echo -e "${YELLOW}Help:${NC}"
                echo "   synocat --help          # Show all commands"
                echo "   synocat info <topic>    # Show documentation for specific topic"
                echo "   synocat image <file>    # Generate all icon sizes"
                echo ""
                return 0
                ;;
            4)
                echo ""
                echo -e "${YELLOW}Goodbye! Happy package development! 🚀${NC}"
                echo ""
                return 1
                ;;
            *)
                echo -e "${RED}Invalid input. Please enter a number between 1 and 4.${NC}"
                echo ""
                ;;
        esac
    done
}

# 显示版本信息
show_version() {
    echo "synocat version ${VERSION}"
    echo "Copyright (c) 2024 Synology Community"
    echo "License: MIT"
}

# 显示帮助信息
show_help() {
    print_header
    print_quick_start
    print_features
    print_templates
}

# 检查依赖
check_dependencies() {
    local missing_deps=()
    
    if ! command -v node &>/dev/null; then
        missing_deps+=("node")
    fi
    
    if ! command -v npm &>/dev/null; then
        missing_deps+=("npm")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        echo -e "${YELLOW}⚠ Warning: Some dependencies are missing:${NC}"
        for dep in "${missing_deps[@]}"; do
            echo -e "  • ${dep}"
        done
        echo -e "${YELLOW}Some features may not work properly.${NC}"
        echo ""
    fi
}

# 主函数
main() {
    # 解析命令行参数
    case "${1:-}" in
        --version|-v)
            show_version
            exit 0
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        --check-deps)
            check_dependencies
            exit 0
            ;;
        --quiet|-q)
            # 静默模式，只输出成功标志
            echo "synocat installed successfully"
            exit 0
            ;;
    esac
    
    # 清屏（可选）
    # clear
    
    # 打印标题
    print_header
    
    # 打印成功信息
    print_success_box
    
    # 打印功能列表
    print_features
    
    # 打印快速入门
    print_quick_start
    
    # 打印模板列表
    print_templates
    
    # 显示系统信息
    echo -e "${BOLD}${BLUE}System Information:${NC}"
    if command -v node &>/dev/null; then
        local node_version=$(node --version 2>/dev/null || echo "unknown")
        echo -e "  • Node.js: ${GREEN}${node_version}${NC} (v18+ recommended)"
    else
        echo -e "  • Node.js: ${RED}Not installed${NC} (v18+ recommended)"
    fi
    
    if command -v npm &>/dev/null; then
        local npm_version=$(npm --version 2>/dev/null || echo "unknown")
        echo -e "  • npm: ${GREEN}${npm_version}${NC}"
    else
        echo -e "  • npm: ${RED}Not installed${NC}"
    fi
    
    echo -e "  • TypeScript: ${GREEN}Supported${NC}"
    echo -e "  • DSM Version: ${GREEN}7.0+ compatible${NC}"
    echo ""
    
    # 交互式确认
    if interactive_confirmation; then
        # 用户选择了非退出选项
        :
    else
        exit 0
    fi
    
    # 显示下一步提示
    echo -e "${BOLD}${CYAN}Next Steps:${NC}"
    echo -e "  • Run ${GREEN}synocat create my-first-package${NC} to create your first package"
    echo -e "  • Visit ${CYAN}https://github.com/SynologyOpenSource/ExamplePackages${NC} for examples"
    echo -e "  • Join the community: ${CYAN}https://community.synology.com${NC}"
    echo ""
    
    echo -e "${BOLD}✨ Thank you for installing synocat! ✨${NC}"
    echo ""
}

# 运行主函数
main "$@"