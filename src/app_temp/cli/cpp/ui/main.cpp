// synocat-check.cpp
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <cstring>
#include <unistd.h>

#ifdef _WIN32
#include <windows.h>
#include <io.h>
#define CLEAR_SCREEN() system("cls")
#define isatty _isatty
#else
#include <termios.h>
#include <sys/ioctl.h>
#define CLEAR_SCREEN() system("clear")
#endif

class Terminal {
public:
    // 颜色定义
    static constexpr const char* RESET = "\033[0m";
    static constexpr const char* RED = "\033[31m";
    static constexpr const char* GREEN = "\033[32m";
    static constexpr const char* YELLOW = "\033[33m";
    static constexpr const char* BLUE = "\033[34m";
    static constexpr const char* MAGENTA = "\033[35m";
    static constexpr const char* CYAN = "\033[36m";
    static constexpr const char* WHITE = "\033[37m";
    static constexpr const char* BOLD = "\033[1m";
    static constexpr const char* DIM = "\033[2m";
    
    static int get_width() {
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
    
    static void print_centered(const std::string& text, int width, const char* color = nullptr) {
        int len = text.length();
        int padding = (width - len) / 2;
        if (padding < 0) padding = 0;
        
        if (color) std::cout << color;
        std::cout << std::string(padding, ' ') << text;
        if (padding > 0) std::cout << ' ';
        if (color) std::cout << RESET;
        std::cout << std::endl;
    }
    
    static void print_line(char ch, int width, const char* color = nullptr) {
        if (color) std::cout << color;
        std::cout << std::string(width, ch);
        if (color) std::cout << RESET;
        std::cout << std::endl;
    }
};

class SynocatChecker {
private:
    static constexpr const char* VERSION = "1.0.0";
    int terminal_width;
    
    // 辅助函数：安全地组合颜色字符串
    std::string color_str(const char* color) const {
        return std::string(color);
    }
    
    std::string bold_color(const char* color) const {
        return std::string(Terminal::BOLD) + color;
    }
    
public:
    SynocatChecker() : terminal_width(std::min(Terminal::get_width(), 80)) {}
    
    void print_header() {
        std::cout << "\n";
        Terminal::print_line('=', terminal_width, Terminal::CYAN);
        
        // ASCII Art Logo
        std::vector<std::string> logo = {
            "   _____          _             _   ",
            "  / ____|        | |           | |  ",
            " | (___   _ __   | |_   ___    | |_ ",
            "  \\___ \\ | '_ \\  | __| / _ \\   | __|",
            "  ____) || | | | | |_ | (_) |  | |_ ",
            " |_____/ |_| |_|  \\__| \\___/    \\__|"
        };
        
        int logo_width = 0;
        for (const auto& line : logo) {
            logo_width = std::max(logo_width, (int)line.length());
        }
        
        for (const auto& line : logo) {
            std::cout << Terminal::CYAN << "|" << Terminal::RESET;
            int padding = (terminal_width - logo_width) / 2;
            if (padding < 0) padding = 0;
            std::cout << std::string(padding, ' ');
            std::cout << Terminal::GREEN << line;
            std::cout << std::string(terminal_width - logo_width - padding - 1, ' ');
            std::cout << Terminal::CYAN << "|" << Terminal::RESET << std::endl;
        }
        
        Terminal::print_line('=', terminal_width, Terminal::CYAN);
        
        std::string title = std::string("synocat v") + VERSION + 
                           " - CLI Scaffold Tool for Synology DSM 7";
        std::string title_color = bold_color(Terminal::YELLOW);
        Terminal::print_centered(title, terminal_width - 2, title_color.c_str());
        
        std::string subtitle = "Designed for Frontend Developers";
        Terminal::print_centered(subtitle, terminal_width - 2, Terminal::CYAN);
        
        Terminal::print_line('=', terminal_width, Terminal::CYAN);
        std::cout << std::endl;
    }
    
    void print_success_box() {
        int box_width = std::min(terminal_width - 4, 70);
        int padding = (terminal_width - box_width) / 2;
        
        std::cout << std::string(padding, ' ');
        std::cout << Terminal::GREEN << "+" << std::string(box_width - 2, '-') << "+" 
                  << Terminal::RESET << std::endl;
        
        std::string success_msg = "[ SUCCESS ] INSTALLATION SUCCESSFUL!";
        int msg_padding = (box_width - success_msg.length()) / 2;
        std::cout << std::string(padding, ' ');
        std::cout << Terminal::GREEN << "|" << std::string(msg_padding, ' ') 
                  << Terminal::BOLD << success_msg << Terminal::RESET
                  << std::string(msg_padding + (box_width - success_msg.length() - 2 * msg_padding), ' ')
                  << Terminal::GREEN << "|" << Terminal::RESET << std::endl;
        
        std::string msg1 = "synocat has been installed successfully";
        msg_padding = (box_width - msg1.length()) / 2;
        std::cout << std::string(padding, ' ');
        std::cout << Terminal::GREEN << "|" << std::string(msg_padding, ' ') 
                  << msg1 << std::string(msg_padding + (box_width - msg1.length() - 2 * msg_padding), ' ')
                  << Terminal::GREEN << "|" << Terminal::RESET << std::endl;
        
        std::cout << std::string(padding, ' ');
        std::cout << Terminal::GREEN << "|" << std::string(box_width - 2, ' ') 
                  << "|" << Terminal::RESET << std::endl;
        
        std::string msg2 = "Ready to create Synology DSM 7 packages";
        msg_padding = (box_width - msg2.length()) / 2;
        std::cout << std::string(padding, ' ');
        std::cout << Terminal::GREEN << "|" << std::string(msg_padding, ' ') 
                  << msg2 << std::string(msg_padding + (box_width - msg2.length() - 2 * msg_padding), ' ')
                  << Terminal::GREEN << "|" << Terminal::RESET << std::endl;
        
        std::cout << std::string(padding, ' ');
        std::cout << Terminal::GREEN << "+" << std::string(box_width - 2, '-') << "+" 
                  << Terminal::RESET << std::endl << std::endl;
    }
    
    void print_features() {
        std::cout << Terminal::BOLD << Terminal::CYAN << "Available Features:\n" << Terminal::RESET;
        std::cout << "  " << Terminal::GREEN << "*" << Terminal::RESET 
                  << " Interactive package creation wizard\n";
        std::cout << "  " << Terminal::GREEN << "*" << Terminal::RESET 
                  << " Vue.js DSM desktop application templates\n";
        std::cout << "  " << Terminal::GREEN << "*" << Terminal::RESET 
                  << " Node.js backend service templates\n";
        std::cout << "  " << Terminal::GREEN << "*" << Terminal::RESET 
                  << " Docker package support (DSM 7.2.1+)\n";
        std::cout << "  " << Terminal::GREEN << "*" << Terminal::RESET 
                  << " SPK package generation\n";
        std::cout << "  " << Terminal::GREEN << "*" << Terminal::RESET 
                  << " Configuration validation\n\n";
    }
    
    void print_quick_start() {
        std::cout << Terminal::BOLD << Terminal::YELLOW << "Quick Start:\n" << Terminal::RESET;
        std::cout << "  " << Terminal::GREEN << "$" << Terminal::RESET 
                  << " synocat                    " << Terminal::CYAN 
                  << "# Interactive package creation" << Terminal::RESET << "\n";
        std::cout << "  " << Terminal::GREEN << "$" << Terminal::RESET 
                  << " synocat create my-package   " << Terminal::CYAN 
                  << "# Create with default template" << Terminal::RESET << "\n";
        std::cout << "  " << Terminal::GREEN << "$" << Terminal::RESET 
                  << " synocat create my-package -t vue-desktop  " << Terminal::CYAN 
                  << "# Use Vue template" << Terminal::RESET << "\n";
        std::cout << "  " << Terminal::GREEN << "$" << Terminal::RESET 
                  << " synocat pack ./my-package   " << Terminal::CYAN 
                  << "# Generate .spk package" << Terminal::RESET << "\n";
        std::cout << "  " << Terminal::GREEN << "$" << Terminal::RESET 
                  << " synocat validate ./package  " << Terminal::CYAN 
                  << "# Validate configuration" << Terminal::RESET << "\n\n";
    }
    
    void print_templates() {
        std::cout << Terminal::BOLD << Terminal::MAGENTA << "Available Templates:\n" << Terminal::RESET;
        std::cout << "  " << Terminal::GREEN << "*" << Terminal::RESET 
                  << " " << Terminal::BOLD << "minimal" << Terminal::RESET 
                  << std::string(15 - 8, ' ') << "Pure shell package, works on all platforms\n";
        std::cout << "  " << Terminal::GREEN << "*" << Terminal::RESET 
                  << " " << Terminal::BOLD << "node-service" << Terminal::RESET 
                  << std::string(15 - 12, ' ') << "Node.js backend service with start/stop scripts\n";
        std::cout << "  " << Terminal::GREEN << "*" << Terminal::RESET 
                  << " " << Terminal::BOLD << "vue-desktop" << Terminal::RESET 
                  << std::string(15 - 11, ' ') << "Vue.js DSM desktop application\n";
        std::cout << "  " << Terminal::GREEN << "*" << Terminal::RESET 
                  << " " << Terminal::BOLD << "docker" << Terminal::RESET 
                  << std::string(15 - 6, ' ') << "Docker Compose package (DSM 7.2.1+)\n\n";
    }
    
    void print_system_info() {
        std::cout << Terminal::BOLD << Terminal::BLUE << "System Information:\n" << Terminal::RESET;
        
        // 检测 Node.js
        bool node_available = (system("node --version > /dev/null 2>&1") == 0);
        std::cout << "  * Node.js: ";
        if (node_available) {
            std::cout << Terminal::GREEN << "Available";
        } else {
            std::cout << Terminal::RED << "Not found";
        }
        std::cout << Terminal::RESET << " (v18+ recommended)\n";
        
        // 检测 TypeScript
        bool ts_available = (system("tsc --version > /dev/null 2>&1") == 0);
        std::cout << "  * TypeScript: ";
        if (ts_available) {
            std::cout << Terminal::GREEN << "Supported";
        } else {
            std::cout << Terminal::YELLOW << "Optional";
        }
        std::cout << Terminal::RESET << "\n";
        
        std::cout << "  * DSM Version: " << Terminal::GREEN << "7.0+ compatible" 
                  << Terminal::RESET << "\n\n";
    }
    
    bool interactive_menu() {
        std::string input;
        int choice = 0;
        
        std::cout << Terminal::BOLD << Terminal::CYAN 
                  << "+-------------------------------------------------------------+\n"
                  << "|  Would you like to:\n"
                  << "|\n"
                  << "|    1) Create a new package now\n"
                  << "|    2) View documentation\n"
                  << "|    3) Show help\n"
                  << "|    4) Exit\n"
                  << "|\n"
                  << "+-------------------------------------------------------------+\n\n"
                  << Terminal::RESET;
        
        while (true) {
            std::cout << Terminal::BOLD << "Enter your choice [1-4]: " << Terminal::RESET;
            std::getline(std::cin, input);
            
            try {
                choice = std::stoi(input);
                if (choice >= 1 && choice <= 4) {
                    break;
                }
            } catch (...) {
                // 无效输入，继续循环
            }
            
            std::cout << Terminal::RED << "Invalid input. Please enter a number between 1 and 4.\n\n" 
                      << Terminal::RESET;
        }
        
        std::cout << std::endl;
        switch (choice) {
            case 1:
                std::cout << Terminal::GREEN 
                          << "[OK] Good choice! Run 'synocat create <package-name>' to get started.\n\n" 
                          << Terminal::RESET;
                break;
            case 2:
                std::cout << Terminal::CYAN 
                          << "[DOC] Documentation:\n"
                          << "   https://help.synology.com/developer-guide/\n"
                          << "   https://github.com/SynologyOpenSource/ExamplePackages\n\n" 
                          << Terminal::RESET;
                break;
            case 3:
                std::cout << Terminal::YELLOW 
                          << "[HELP] Help:\n"
                          << "   synocat --help          # Show all commands\n"
                          << "   synocat info <topic>    # Show documentation for specific topic\n"
                          << "   synocat image <file>    # Generate all icon sizes\n\n" 
                          << Terminal::RESET;
                break;
            case 4:
                std::cout << Terminal::YELLOW 
                          << "[EXIT] Goodbye! Happy package development!\n\n" 
                          << Terminal::RESET;
                return false;
        }
        
        return true;
    }
    
    void print_next_steps() {
        std::cout << Terminal::BOLD << Terminal::CYAN << "Next Steps:\n" << Terminal::RESET;
        std::cout << "  * Run " << Terminal::GREEN << "synocat create my-first-package" 
                  << Terminal::RESET << " to create your first package\n";
        std::cout << "  * Visit " << Terminal::CYAN 
                  << "https://github.com/SynologyOpenSource/ExamplePackages" 
                  << Terminal::RESET << " for examples\n";
        std::cout << "  * Join the community: " << Terminal::CYAN 
                  << "https://community.synology.com" << Terminal::RESET << "\n\n";
        
        std::cout << Terminal::BOLD << "[DONE] Thank you for installing synocat!\n\n" 
                  << Terminal::RESET;
    }
    
    void show_version() {
        std::cout << "synocat version " << VERSION << "\n";
        std::cout << "Copyright (c) 2024 Synology Community\n";
        std::cout << "License: MIT\n\n";
    }
    
    int run(int argc, char* argv[]) {
        // 检查命令行参数
        if (argc >= 2) {
            std::string arg = argv[1];
            if (arg == "--version" || arg == "-v") {
                show_version();
                return 0;
            }
            if (arg == "--help" || arg == "-h") {
                print_header();
                print_quick_start();
                print_features();
                print_templates();
                return 0;
            }
        }
        
        // 主界面
        print_header();
        print_success_box();
        print_features();
        print_quick_start();
        print_templates();
        print_system_info();
        
        // 交互式菜单
        interactive_menu();
        
        // 下一步提示
        print_next_steps();
        
        return 0;
    }
};

int main(int argc, char* argv[]) {
    SynocatChecker checker;
    return checker.run(argc, argv);
}