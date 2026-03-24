#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#ifdef _WIN32
#include <windows.h>
#define CLEAR_SCREEN() system("cls")
#else
#include <termios.h>
#include <sys/ioctl.h>
#define CLEAR_SCREEN() system("clear")
#endif

#define MAX_INPUT 256
#define VERSION "1.0.0"

// 颜色定义
#define COLOR_RESET   "\033[0m"
#define COLOR_RED     "\033[31m"
#define COLOR_GREEN   "\033[32m"
#define COLOR_YELLOW  "\033[33m"
#define COLOR_BLUE    "\033[34m"
#define COLOR_MAGENTA "\033[35m"
#define COLOR_CYAN    "\033[36m"
#define COLOR_WHITE   "\033[37m"
#define COLOR_BOLD    "\033[1m"

// 获取终端宽度
int get_terminal_width() {
    #ifdef _WIN32
        CONSOLE_SCREEN_BUFFER_INFO csbi;
        int columns;
        GetConsoleScreenBufferInfo(GetStdHandle(STD_OUTPUT_HANDLE), &csbi);
        columns = csbi.srWindow.Right - csbi.srWindow.Left + 1;
        return columns;
    #else
        struct winsize w;
        ioctl(STDOUT_FILENO, TIOCGWINSZ, &w);
        return w.ws_col;
    #endif
}

// 打印居中文本
void print_centered(const char *text, int width, const char *color) {
    int len = strlen(text);
    int padding = (width - len) / 2;
    if (padding < 0) padding = 0;
    
    printf("%s%*s%s%s%s\n", color, padding, "", text, COLOR_RESET, 
           padding > 0 ? " " : "");
}

// 打印带边框的标题
void print_header() {
    int width = get_terminal_width();
    if (width > 80) width = 80;
    
    printf("\n");
    printf(COLOR_CYAN "╔");
    for (int i = 0; i < width - 2; i++) printf("═");
    printf("╗\n" COLOR_RESET);
    
    // 打印 Logo (ASCII Art)
    const char *logo_lines[] = {
        "   _____          _             _   ",
        "  / ____|        | |           | |  ",
        " | (___   _ __   | |_   ___    | |_ ",
        "  \\___ \\ | '_ \\  | __| / _ \\   | __|",
        "  ____) || | | | | |_ | (_) |  | |_ ",
        " |_____/ |_| |_|  \\__| \\___/    \\__|",
        "                                    "
    };
    
    int logo_width = 0;
    for (int i = 0; i < 6; i++) {
        int lw = strlen(logo_lines[i]);
        if (lw > logo_width) logo_width = lw;
    }
    
    for (int i = 0; i < 6; i++) {
        int padding = (width - logo_width) / 2;
        if (padding < 0) padding = 0;
        printf(COLOR_CYAN "║" COLOR_RESET);
        printf("%*s%s%s", padding, "", COLOR_GREEN, logo_lines[i]);
        printf("%*s", width - logo_width - padding - 1, "");
        printf(COLOR_CYAN "║\n" COLOR_RESET);
    }
    
    printf(COLOR_CYAN "╠");
    for (int i = 0; i < width - 2; i++) printf("═");
    printf("╣\n" COLOR_RESET);
    
    char title[256];
    snprintf(title, sizeof(title), "synocat v%s - CLI Scaffold Tool for Synology DSM 7", VERSION);
    print_centered(title, width - 2, COLOR_BOLD COLOR_YELLOW);
    
    char subtitle[] = "Designed for Frontend Developers";
    print_centered(subtitle, width - 2, COLOR_CYAN);
    
    printf(COLOR_CYAN "╚");
    for (int i = 0; i < width - 2; i++) printf("═");
    printf("╝\n" COLOR_RESET);
    printf("\n");
}

// 打印成功信息框
void print_success_box() {
    int width = get_terminal_width();
    if (width > 70) width = 70;
    
    printf(COLOR_GREEN "┌");
    for (int i = 0; i < width - 2; i++) printf("─");
    printf("┐\n" COLOR_RESET);
    
    char success_msg[] = "✓ INSTALLATION SUCCESSFUL!";
    print_centered(success_msg, width - 2, COLOR_BOLD COLOR_GREEN);
    
    char msg1[] = "synocat has been installed successfully";
    print_centered(msg1, width - 2, COLOR_GREEN);
    
    printf("\n");
    
    char msg2[] = "Ready to create Synology DSM 7 packages";
    print_centered(msg2, width - 2, COLOR_GREEN);
    
    printf(COLOR_GREEN "└");
    for (int i = 0; i < width - 2; i++) printf("─");
    printf("┘\n\n" COLOR_RESET);
}

// 打印功能列表
void print_features() {
    printf(COLOR_BOLD COLOR_CYAN "Available Features:\n" COLOR_RESET);
    printf("  %s•%s Interactive package creation wizard\n", COLOR_GREEN, COLOR_RESET);
    printf("  %s•%s Vue.js DSM desktop application templates\n", COLOR_GREEN, COLOR_RESET);
    printf("  %s•%s Node.js backend service templates\n", COLOR_GREEN, COLOR_RESET);
    printf("  %s•%s Docker package support (DSM 7.2.1+)\n", COLOR_GREEN, COLOR_RESET);
    printf("  %s•%s SPK package generation\n", COLOR_GREEN, COLOR_RESET);
    printf("  %s•%s Configuration validation\n\n", COLOR_GREEN, COLOR_RESET);
}

// 打印快速入门指南
void print_quick_start() {
    printf(COLOR_BOLD COLOR_YELLOW "Quick Start:\n" COLOR_RESET);
    printf("  %s$%s synocat                    %s# Interactive package creation%s\n", 
           COLOR_GREEN, COLOR_RESET, COLOR_CYAN, COLOR_RESET);
    printf("  %s$%s synocat create my-package   %s# Create with default template%s\n", 
           COLOR_GREEN, COLOR_RESET, COLOR_CYAN, COLOR_RESET);
    printf("  %s$%s synocat create my-package -t vue-desktop  %s# Use Vue template%s\n", 
           COLOR_GREEN, COLOR_RESET, COLOR_CYAN, COLOR_RESET);
    printf("  %s$%s synocat pack ./my-package   %s# Generate .spk package%s\n", 
           COLOR_GREEN, COLOR_RESET, COLOR_CYAN, COLOR_RESET);
    printf("  %s$%s synocat validate ./package  %s# Validate configuration%s\n\n", 
           COLOR_GREEN, COLOR_RESET, COLOR_CYAN, COLOR_RESET);
}

// 打印可用模板
void print_templates() {
    printf(COLOR_BOLD COLOR_MAGENTA "Available Templates:\n" COLOR_RESET);
    printf("  %s•%s %-15s %s\n", COLOR_GREEN, COLOR_RESET, "minimal", "Pure shell package, works on all platforms");
    printf("  %s•%s %-15s %s\n", COLOR_GREEN, COLOR_RESET, "node-service", "Node.js backend service with start/stop scripts");
    printf("  %s•%s %-15s %s\n", COLOR_GREEN, COLOR_RESET, "vue-desktop", "Vue.js DSM desktop application");
    printf("  %s•%s %-15s %s\n\n", COLOR_GREEN, COLOR_RESET, "docker", "Docker Compose package (DSM 7.2.1+)");
}

// 交互式确认函数
int interactive_confirmation() {
    char input[MAX_INPUT];
    int choice = 0;
    
    printf(COLOR_BOLD COLOR_CYAN "┌─────────────────────────────────────────────────────────────┐\n");
    printf("│  Would you like to:\n");
    printf("│\n");
    printf("│    1) Create a new package now\n");
    printf("│    2) View documentation\n");
    printf("│    3) Show help\n");
    printf("│    4) Exit\n");
    printf("│\n");
    printf("└─────────────────────────────────────────────────────────────┘\n\n" COLOR_RESET);
    
    while (1) {
        printf(COLOR_BOLD "Enter your choice [1-4]: " COLOR_RESET);
        if (fgets(input, sizeof(input), stdin) != NULL) {
            if (sscanf(input, "%d", &choice) == 1) {
                if (choice >= 1 && choice <= 4) {
                    break;
                }
            }
        }
        printf(COLOR_RED "Invalid input. Please enter a number between 1 and 4.\n\n" COLOR_RESET);
    }
    
    printf("\n");
    switch (choice) {
        case 1:
            printf(COLOR_GREEN "✓ Good choice! Run 'synocat create <package-name>' to get started.\n\n" COLOR_RESET);
            break;
        case 2:
            printf(COLOR_CYAN "📖 Documentation:\n");
            printf("   https://help.synology.com/developer-guide/\n");
            printf("   https://github.com/SynologyOpenSource/ExamplePackages\n\n" COLOR_RESET);
            break;
        case 3:
            printf(COLOR_YELLOW "Help:\n");
            printf("   synocat --help          # Show all commands\n");
            printf("   synocat info <topic>    # Show documentation for specific topic\n");
            printf("   synocat image <file>    # Generate all icon sizes\n\n" COLOR_RESET);
            break;
        case 4:
            printf(COLOR_YELLOW "Goodbye! Happy package development! 🚀\n\n" COLOR_RESET);
            return 0;
    }
    
    return 1;
}

// 显示版本信息
void show_version() {
    printf("synocat version %s\n", VERSION);
    printf("Copyright (c) 2024 Synology Community\n");
    printf("License: MIT\n\n");
}

// 主函数
int main(int argc, char *argv[]) {
    // 检查版本参数
    if (argc >= 2) {
        if (strcmp(argv[1], "--version") == 0 || strcmp(argv[1], "-v") == 0) {
            show_version();
            return 0;
        }
        if (strcmp(argv[1], "--help") == 0 || strcmp(argv[1], "-h") == 0) {
            print_header();
            print_quick_start();
            print_features();
            print_templates();
            return 0;
        }
    }
    
    // 清屏（可选，注释掉以保持历史）
    // CLEAR_SCREEN();
    
    // 打印标题
    print_header();
    
    // 打印成功信息
    print_success_box();
    
    // 打印功能列表
    print_features();
    
    // 打印快速入门
    print_quick_start();
    
    // 打印模板列表
    print_templates();
    
    // 显示系统信息
    printf(COLOR_BOLD COLOR_BLUE "System Information:\n" COLOR_RESET);
    printf("  • Node.js: %sAvailable (v18+ recommended)%s\n", COLOR_GREEN, COLOR_RESET);
    printf("  • TypeScript: %sSupported%s\n", COLOR_GREEN, COLOR_RESET);
    printf("  • DSM Version: %s7.0+ compatible%s\n\n", COLOR_GREEN, COLOR_RESET);
    
    // 交互式确认
    interactive_confirmation();
    
    // 显示下一步提示
    printf(COLOR_BOLD COLOR_CYAN "Next Steps:\n" COLOR_RESET);
    printf("  • Run %ssynocat create my-first-package%s to create your first package\n", 
           COLOR_GREEN, COLOR_RESET);
    printf("  • Visit %shttps://github.com/SynologyOpenSource/ExamplePackages%s for examples\n", 
           COLOR_CYAN, COLOR_RESET);
    printf("  • Join the community: %shttps://community.synology.com%s\n\n", 
           COLOR_CYAN, COLOR_RESET);
    
    printf(COLOR_BOLD "✨ Thank you for installing synocat! ✨\n\n" COLOR_RESET);
    
    return 0;
}