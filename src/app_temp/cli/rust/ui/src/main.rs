// main.rs
use std::io::{self, Write};
use std::process::Command;
use termion::{color, style, cursor, clear};
use termion::raw::IntoRawMode;
use std::io::stdout;

// 常量定义
const VERSION: &str = "1.0.0";

// 终端宽度获取
fn get_terminal_width() -> u16 {
    termion::terminal_size().map(|(w, _)| w).unwrap_or(80)
}

// 居中打印
fn print_centered(text: &str, width: u16, color: &str) {
    let len = text.len() as u16;
    let padding = if width > len { (width - len) / 2 } else { 0 };
    print!("{}{}{}{}", 
           color,
           " ".repeat(padding as usize),
           text,
           style::Reset);
    if padding > 0 {
        println!();
    } else {
        println!();
    }
}

// 打印标题栏
fn print_header() {
    let width = get_terminal_width().min(80);
    
    println!("\n{}{}{}", 
             color::Cyan, 
             "═".repeat(width as usize), 
             style::Reset);
    
    // ASCII Art Logo
    let logo = vec![
        "   _____          _             _   ",
        "  / ____|        | |           | |  ",
        " | (___   _ __   | |_   ___    | |_ ",
        "  \\___ \\ | '_ \\  | __| / _ \\   | __|",
        "  ____) || | | | | |_ | (_) |  | |_ ",
        " |_____/ |_| |_|  \\__| \\___/    \\__|"
    ];
    
    let logo_width = logo.iter().map(|l| l.len()).max().unwrap_or(0);
    
    for line in logo {
        print!("{}║{}", color::Cyan, style::Reset);
        let padding = (width as usize - logo_width) / 2;
        print!("{}", " ".repeat(padding));
        print!("{}{}{}", color::Green, line, style::Reset);
        println!("{}{}", 
                 " ".repeat(width as usize - logo_width - padding - 1),
                 format!("{}║{}", color::Cyan, style::Reset));
    }
    
    println!("{}{}{}", 
             color::Cyan, 
             "═".repeat(width as usize), 
             style::Reset);
    
    let title = format!("synocat v{} - CLI Scaffold Tool for Synology DSM 7", VERSION);
    print_centered(&title, width - 2, &format!("{}{}", style::Bold, color::Yellow));
    
    let subtitle = "Designed for Frontend Developers";
    print_centered(subtitle, width - 2, &format!("{}", color::Cyan));
    
    println!("{}{}{}\n", 
             color::Cyan, 
             "═".repeat(width as usize), 
             style::Reset);
}

// 打印成功信息框
fn print_success_box() {
    let width = get_terminal_width();
    let box_width = (width - 4).min(70);
    let padding = (width - box_width) / 2;
    
    println!("{}{}{}{}", 
             " ".repeat(padding as usize),
             color::Green,
             format!("┌{}┐", "─".repeat((box_width - 2) as usize)),
             style::Reset);
    
    let success_msg = "✓ INSTALLATION SUCCESSFUL!";
    let msg_padding = (box_width - success_msg.len() as u16) / 2;
    println!("{}{}{}{}{}{}{}", 
             " ".repeat(padding as usize),
             color::Green, "│",
             " ".repeat(msg_padding as usize),
             format!("{}{}{}", style::Bold, success_msg, style::Reset),
             " ".repeat((box_width - success_msg.len() as u16 - msg_padding) as usize),
             format!("{}│{}", color::Green, style::Reset));
    
    let msg1 = "synocat has been installed successfully";
    let msg_padding = (box_width - msg1.len() as u16) / 2;
    println!("{}{}{}{}{}{}{}", 
             " ".repeat(padding as usize),
             color::Green, "│",
             " ".repeat(msg_padding as usize),
             msg1,
             " ".repeat((box_width - msg1.len() as u16 - msg_padding) as usize),
             format!("{}│{}", color::Green, style::Reset));
    
    println!("{}{}{}{}{}", 
             " ".repeat(padding as usize),
             color::Green, "│",
             " ".repeat((box_width - 2) as usize),
             format!("{}│{}", color::Green, style::Reset));
    
    let msg2 = "Ready to create Synology DSM 7 packages";
    let msg_padding = (box_width - msg2.len() as u16) / 2;
    println!("{}{}{}{}{}{}{}", 
             " ".repeat(padding as usize),
             color::Green, "│",
             " ".repeat(msg_padding as usize),
             msg2,
             " ".repeat((box_width - msg2.len() as u16 - msg_padding) as usize),
             format!("{}│{}", color::Green, style::Reset));
    
    println!("{}{}{}{}\n", 
             " ".repeat(padding as usize),
             color::Green,
             format!("└{}┘", "─".repeat((box_width - 2) as usize)),
             style::Reset);
}

// 打印功能列表
fn print_features() {
    println!("{}{}Available Features:{}{}", 
             style::Bold, color::Cyan, style::Reset, color::Reset);
    println!("  {}•{} Interactive package creation wizard", color::Green, style::Reset);
    println!("  {}•{} Vue.js DSM desktop application templates", color::Green, style::Reset);
    println!("  {}•{} Node.js backend service templates", color::Green, style::Reset);
    println!("  {}•{} Docker package support (DSM 7.2.1+)", color::Green, style::Reset);
    println!("  {}•{} SPK package generation", color::Green, style::Reset);
    println!("  {}•{} Configuration validation\n", color::Green, style::Reset);
}

// 打印快速入门
fn print_quick_start() {
    println!("{}{}Quick Start:{}{}", 
             style::Bold, color::Yellow, style::Reset, color::Reset);
    println!("  {}${} synocat                    {}# Interactive package creation{}", 
             color::Green, style::Reset, color::Cyan, style::Reset);
    println!("  {}${} synocat create my-package   {}# Create with default template{}", 
             color::Green, style::Reset, color::Cyan, style::Reset);
    println!("  {}${} synocat create my-package -t vue-desktop  {}# Use Vue template{}", 
             color::Green, style::Reset, color::Cyan, style::Reset);
    println!("  {}${} synocat pack ./my-package   {}# Generate .spk package{}", 
             color::Green, style::Reset, color::Cyan, style::Reset);
    println!("  {}${} synocat validate ./package  {}# Validate configuration{}\n", 
             color::Green, style::Reset, color::Cyan, style::Reset);
}

// 打印模板列表
fn print_templates() {
    println!("{}{}Available Templates:{}{}", 
             style::Bold, color::Magenta, style::Reset, color::Reset);
    println!("  {}•{} {:<15} {}", color::Green, style::Reset, "minimal", 
             "Pure shell package, works on all platforms");
    println!("  {}•{} {:<15} {}", color::Green, style::Reset, "node-service", 
             "Node.js backend service with start/stop scripts");
    println!("  {}•{} {:<15} {}", color::Green, style::Reset, "vue-desktop", 
             "Vue.js DSM desktop application");
    println!("  {}•{} {:<15} {}\n", color::Green, style::Reset, "docker", 
             "Docker Compose package (DSM 7.2.1+)");
}

// 打印系统信息
fn print_system_info() {
    println!("{}{}System Information:{}{}", 
             style::Bold, color::Blue, style::Reset, color::Reset);
    
    // 检测 Node.js
    let node_available = Command::new("node")
        .arg("--version")
        .output()
        .is_ok();
    
    println!("  • Node.js: {}{}{} (v18+ recommended)", 
             if node_available { color::Green } else { color::Red },
             if node_available { "Available" } else { "Not found" },
             style::Reset);
    
    // 检测 TypeScript
    let ts_available = Command::new("tsc")
        .arg("--version")
        .output()
        .is_ok();
    
    println!("  • TypeScript: {}{}{}", 
             if ts_available { color::Green } else { color::Yellow },
             if ts_available { "Supported" } else { "Optional" },
             style::Reset);
    
    println!("  • DSM Version: {}7.0+ compatible{}\n", color::Green, style::Reset);
}

// 交互式菜单
fn interactive_menu() -> bool {
    println!("{}{}", style::Bold, color::Cyan);
    println!("┌─────────────────────────────────────────────────────────────┐");
    println!("│  Would you like to:");
    println!("│");
    println!("│    1) Create a new package now");
    println!("│    2) View documentation");
    println!("│    3) Show help");
    println!("│    4) Exit");
    println!("│");
    println!("└─────────────────────────────────────────────────────────────┘");
    println!("{}{}", style::Reset, color::Reset);
    
    loop {
        print!("{}Enter your choice [1-4]: {}{}", 
               style::Bold, style::Reset, color::Reset);
        io::stdout().flush().unwrap();
        
        let mut input = String::new();
        io::stdin().read_line(&mut input).unwrap();
        
        match input.trim().parse::<u32>() {
            Ok(choice) => match choice {
                1 => {
                    println!("\n{}✓ Good choice! Run 'synocat create <package-name>' to get started.\n{}", 
                             color::Green, style::Reset);
                    return true;
                }
                2 => {
                    println!("\n{}📖 Documentation:{}\n   https://help.synology.com/developer-guide/\n   https://github.com/SynologyOpenSource/ExamplePackages\n{}", 
                             color::Cyan, style::Reset, style::Reset);
                    return true;
                }
                3 => {
                    println!("\n{}Help:{}\n   synocat --help          # Show all commands\n   synocat info <topic>    # Show documentation for specific topic\n   synocat image <file>    # Generate all icon sizes\n{}", 
                             color::Yellow, style::Reset, style::Reset);
                    return true;
                }
                4 => {
                    println!("\n{}Goodbye! Happy package development! 🚀\n{}", 
                             color::Yellow, style::Reset);
                    return false;
                }
                _ => {
                    println!("{}Invalid choice. Please enter a number between 1 and 4.{}\n", 
                             color::Red, style::Reset);
                }
            },
            Err(_) => {
                println!("{}Invalid input. Please enter a number between 1 and 4.{}\n", 
                         color::Red, style::Reset);
            }
        }
    }
}

// 打印下一步提示
fn print_next_steps() {
    println!("{}{}Next Steps:{}{}", 
             style::Bold, color::Cyan, style::Reset, color::Reset);
    println!("  • Run {}{}synocat create my-first-package{}{} to create your first package", 
             style::Reset, color::Green, style::Reset, color::Reset);
    println!("  • Visit {}{}https://github.com/SynologyOpenSource/ExamplePackages{}{} for examples", 
             style::Reset, color::Cyan, style::Reset, color::Reset);
    println!("  • Join the community: {}{}https://community.synology.com{}{}\n", 
             style::Reset, color::Cyan, style::Reset, color::Reset);
    
    println!("{}✨ Thank you for installing synocat! ✨{}\n", 
             style::Bold, style::Reset);
}

// 显示版本信息
fn show_version() {
    println!("synocat version {}", VERSION);
    println!("Copyright (c) 2024 Synology Community");
    println!("License: MIT\n");
}

// 显示帮助信息
fn show_help() {
    print_header();
    print_quick_start();
    print_features();
    print_templates();
}

// 主函数
fn main() -> io::Result<()> {
    let args: Vec<String> = std::env::args().collect();
    
    // 处理命令行参数
    if args.len() >= 2 {
        match args[1].as_str() {
            "--version" | "-v" => {
                show_version();
                return Ok(());
            }
            "--help" | "-h" => {
                show_help();
                return Ok(());
            }
            _ => {}
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
    
    Ok(())
}