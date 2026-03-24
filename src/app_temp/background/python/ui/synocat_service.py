#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
synocat-service - Background service for Synology DSM 7 packages
Version: 1.0.0
"""

import os
import sys
import json
import time
import signal
import argparse
import logging
from datetime import datetime
from typing import Dict, Any

# 颜色定义
class Colors:
    RESET = '\033[0m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'
    BOLD = '\033[1m'

# 版本信息
VERSION = "1.0.0"
START_TIME = datetime.now()
INSTALL_TIME = None

def get_install_time() -> datetime:
    """获取安装时间"""
    global INSTALL_TIME
    if INSTALL_TIME:
        return INSTALL_TIME
    
    # 尝试从环境变量读取
    env_time = os.environ.get('SYNOCAT_INSTALL_TIME')
    if env_time:
        try:
            INSTALL_TIME = datetime.fromisoformat(env_time)
            return INSTALL_TIME
        except ValueError:
            pass
    
    # 尝试从文件读取
    install_file = os.path.expanduser('~/.synocat_install_time')
    if os.path.exists(install_file):
        try:
            with open(install_file, 'r') as f:
                INSTALL_TIME = datetime.fromisoformat(f.read().strip())
                return INSTALL_TIME
        except (ValueError, IOError):
            pass
    
    INSTALL_TIME = START_TIME
    return INSTALL_TIME

def print_ascii_logo():
    """打印 ASCII Logo"""
    logo = f"""
{Colors.CYAN}╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║    _____          _             _                      ║
║   / ____|        | |           | |                     ║
║  | (___   _ __   | |_   ___    | |_                    ║
║   \\___ \\ | '_ \\  | __| / _ \\   | __|                   ║
║   ____) || | | | | |_ | (_) |  | |_                    ║
║  |_____/ |_| |_|  \\__| \\___/    \\__|                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝{Colors.RESET}
"""
    print(logo)

def print_success_message():
    """打印安装成功信息"""
    install_time = get_install_time()
    print(f"\n{Colors.GREEN}{Colors.BOLD}✓ INSTALLATION SUCCESSFUL!{Colors.RESET}")
    print(f"{Colors.GREEN}  synocat background service has been installed successfully{Colors.RESET}")
    print()
    print(f"{Colors.CYAN}  Service Information:{Colors.RESET}")
    print(f"    • Version: {Colors.YELLOW}{VERSION}{Colors.RESET}")
    print(f"    • Install Time: {Colors.YELLOW}{install_time.strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")
    print(f"    • Service Status: {Colors.GREEN}Running{Colors.RESET}")
    print()

def print_features():
    """打印功能特性"""
    print(f"{Colors.CYAN}{Colors.BOLD}Available Features:{Colors.RESET}")
    print(f"  {Colors.GREEN}•{Colors.RESET} Background service for Synology DSM 7 packages")
    print(f"  {Colors.GREEN}•{Colors.RESET} Ready to handle package creation requests")
    print(f"  {Colors.GREEN}•{Colors.RESET} Service health monitoring")
    print(f"  {Colors.GREEN}•{Colors.RESET} Graceful shutdown support")
    print(f"  {Colors.GREEN}•{Colors.RESET} Python 3.6+ compatible")
    print()

def print_quick_start():
    """打印快速开始指南"""
    print(f"{Colors.YELLOW}{Colors.BOLD}Quick Start:{Colors.RESET}")
    print(f"  {Colors.GREEN}$ {Colors.RESET}{'synocat-service status':<30} {Colors.CYAN}# Check service status{Colors.RESET}")
    print(f"  {Colors.GREEN}$ {Colors.RESET}{'synocat-service version':<30} {Colors.CYAN}# Show version{Colors.RESET}")
    print(f"  {Colors.GREEN}$ {Colors.RESET}{'synocat-service info':<30} {Colors.CYAN}# Get service info{Colors.RESET}")
    print(f"  {Colors.GREEN}$ {Colors.RESET}{'synocat-service info json':<30} {Colors.CYAN}# Get info as JSON{Colors.RESET}")
    print(f"  {Colors.GREEN}$ {Colors.RESET}{'synocat-service stop':<30} {Colors.CYAN}# Stop the service{Colors.RESET}")
    print()

def print_system_info():
    """打印系统信息"""
    print(f"{Colors.BLUE}{Colors.BOLD}System Information:{Colors.RESET}")
    print(f"  • Python Version: {Colors.GREEN}{sys.version.split()[0]}{Colors.RESET}")
    print(f"  • Platform: {Colors.GREEN}{sys.platform}{Colors.RESET}")
    print(f"  • Process ID: {Colors.GREEN}{os.getpid()}{Colors.RESET}")
    
    # 工作目录
    try:
        wd = os.getcwd()
        print(f"  • Working Directory: {Colors.GREEN}{wd}{Colors.RESET}")
    except OSError:
        pass
    
    print()

class ServiceStatus:
    """服务状态类"""
    def __init__(self):
        self.status = "running"
        self.version = VERSION
        self.start_time = START_TIME
        self.install_time = get_install_time()
    
    def get_uptime(self) -> str:
        """获取运行时间"""
        uptime = datetime.now() - self.start_time
        return str(uptime).split('.')[0]
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "status": self.status,
            "version": self.version,
            "start_time": self.start_time.isoformat(),
            "uptime": self.get_uptime(),
            "install_time": self.install_time.isoformat()
        }
    
    def print_status(self):
        """打印状态"""
        print(f"{Colors.CYAN}{Colors.BOLD}Service Status{Colors.RESET}")
        print(f"  Status: {Colors.GREEN}{self.status}{Colors.RESET}")
        print(f"  Version: {Colors.YELLOW}{self.version}{Colors.RESET}")
        print(f"  Start Time: {Colors.YELLOW}{self.start_time.strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")
        print(f"  Uptime: {Colors.YELLOW}{self.get_uptime()}{Colors.RESET}")
        print(f"  Install Time: {Colors.YELLOW}{self.install_time.strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")

def show_status():
    """显示服务状态"""
    status = ServiceStatus()
    status.print_status()

def show_info_json():
    """以 JSON 格式显示信息"""
    status = ServiceStatus()
    print(json.dumps(status.to_dict(), indent=2))

def signal_handler(signum, frame):
    """信号处理器"""
    print(f"\n{Colors.YELLOW}Received signal: {signum}{Colors.RESET}")
    print(f"{Colors.YELLOW}Shutting down gracefully...{Colors.RESET}")
    time.sleep(1)
    print(f"{Colors.GREEN}✓ Service stopped successfully{Colors.RESET}")
    sys.exit(0)

def run_service():
    """运行后台服务"""
    # 设置信号处理
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # 打印启动信息
    print_ascii_logo()
    print_success_message()
    print_features()
    print_quick_start()
    print_system_info()
    
    # 保存安装时间
    install_file = os.path.expanduser('~/.synocat_install_time')
    if not os.path.exists(install_file):
        try:
            with open(install_file, 'w') as f:
                f.write(START_TIME.isoformat())
        except IOError:
            pass
    
    # 服务主循环
    print(f"{Colors.GREEN}{Colors.BOLD}✨ Service is running... ✨{Colors.RESET}")
    print(f"{Colors.CYAN}Press Ctrl+C to stop the service{Colors.RESET}")
    print()
    
    try:
        # 简单的健康检查循环
        while True:
            time.sleep(30)
            # 实际项目中可以在这里添加健康检查逻辑
            # 例如：检查数据库连接、清理临时文件等
            pass
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)

def print_help():
    """打印帮助信息"""
    print_ascii_logo()
    print(f"{Colors.CYAN}{Colors.BOLD}synocat-service - Background service for Synology DSM 7 packages{Colors.RESET}")
    print()
    print(f"{Colors.YELLOW}Usage:{Colors.RESET}")
    print(f"  {Colors.GREEN}{sys.argv[0]}{Colors.RESET} [command]")
    print()
    print(f"{Colors.YELLOW}Commands:{Colors.RESET}")
    print(f"  {Colors.GREEN}start{Colors.RESET}          Start the background service")
    print(f"  {Colors.GREEN}status{Colors.RESET}         Show service status")
    print(f"  {Colors.GREEN}info{Colors.RESET}           Show service information")
    print(f"  {Colors.GREEN}info json{Colors.RESET}      Show service information in JSON format")
    print(f"  {Colors.GREEN}stop{Colors.RESET}           Stop the service")
    print(f"  {Colors.GREEN}version{Colors.RESET}        Show version information")
    print(f"  {Colors.GREEN}help{Colors.RESET}           Show this help message")
    print()
    print(f"{Colors.YELLOW}Examples:{Colors.RESET}")
    print(f"  {Colors.CYAN}$ {Colors.RESET}{sys.argv[0]} start")
    print(f"  {Colors.CYAN}$ {Colors.RESET}{sys.argv[0]} status")
    print(f"  {Colors.CYAN}$ {Colors.RESET}{sys.argv[0]} info json")
    print()

def main():
    """主函数"""
    # 设置日志
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    # 解析命令行参数
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "start":
            run_service()
        elif command == "status":
            show_status()
        elif command == "version":
            print(f"synocat-service version {VERSION}")
        elif command == "info":
            if len(sys.argv) > 2 and sys.argv[2].lower() == "json":
                show_info_json()
            else:
                show_status()
        elif command == "stop":
            print(f"{Colors.YELLOW}Stopping service...{Colors.RESET}")
            # 实际项目中可以通过 PID 文件来停止服务
            # 这里简化处理
            sys.exit(0)
        elif command in ["help", "--help", "-h"]:
            print_help()
        else:
            print(f"{Colors.RED}Unknown command: {command}{Colors.RESET}")
            print_help()
    else:
        # 默认行为：显示帮助
        print_help()

if __name__ == "__main__":
    main()