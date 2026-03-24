#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
synocat-web - Web service for Synology DSM 7 packages
Version: 1.0.0
"""

import os
import sys
import json
import time
import signal
import argparse
import logging
import platform
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path

try:
    from flask import Flask, render_template, jsonify, request, send_from_directory
    from flask_cors import CORS
except ImportError:
    print("Error: Flask not installed. Run: pip install flask flask-cors")
    sys.exit(1)

# 版本信息
VERSION = "1.0.0"
START_TIME = datetime.now()
INSTALL_TIME = None

# 配置
DEFAULT_HOST = "0.0.0.0"
DEFAULT_PORT = 5000
DEFAULT_DEBUG = False

# 创建 Flask 应用
app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')
CORS(app)

# 日志配置
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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

class ServiceStatus:
    """服务状态类"""
    def __init__(self):
        self.status = "running"
        self.version = VERSION
        self.start_time = START_TIME
        self.install_time = get_install_time()
        self.host = app.config.get('HOST', DEFAULT_HOST)
        self.port = app.config.get('PORT', DEFAULT_PORT)
    
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
            "install_time": self.install_time.isoformat(),
            "host": self.host,
            "port": self.port,
            "python_version": sys.version.split()[0],
            "platform": platform.platform()
        }

# 创建全局状态对象
status = ServiceStatus()

# ==================== 路由定义 ====================

@app.route('/')
def index():
    """首页"""
    return render_template('index.html', version=VERSION)

@app.route('/api/status')
def api_status():
    """API: 获取服务状态"""
    return jsonify(status.to_dict())

@app.route('/api/health')
def api_health():
    """API: 健康检查"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "uptime": status.get_uptime()
    })

@app.route('/api/info')
def api_info():
    """API: 获取服务信息"""
    info = {
        "name": "synocat-web",
        "version": VERSION,
        "description": "Web service for Synology DSM 7 packages",
        "features": [
            "Interactive package creation wizard",
            "Vue.js DSM desktop application templates",
            "Node.js backend service templates",
            "Docker package support (DSM 7.2.1+)",
            "SPK package generation",
            "Configuration validation"
        ],
        "templates": [
            {"name": "minimal", "description": "Pure shell package, works on all platforms"},
            {"name": "node-service", "description": "Node.js backend service with start/stop scripts"},
            {"name": "vue-desktop", "description": "Vue.js DSM desktop application"},
            {"name": "docker", "description": "Docker Compose package (DSM 7.2.1+)"}
        ],
        "quick_start": [
            "synocat create my-package",
            "synocat create my-package -t vue-desktop",
            "synocat pack ./my-package",
            "synocat validate ./package"
        ]
    }
    return jsonify(info)

@app.route('/api/system')
def api_system():
    """API: 获取系统信息"""
    system_info = {
        "python_version": sys.version,
        "platform": platform.platform(),
        "processor": platform.processor(),
        "hostname": platform.node(),
        "working_directory": os.getcwd(),
        "pid": os.getpid(),
        "environment": {
            "SYNOCAT_ENV": os.environ.get('SYNOCAT_ENV', 'production'),
            "SYNOCAT_CONFIG": os.environ.get('SYNOCAT_CONFIG', 'default')
        }
    }
    return jsonify(system_info)

@app.route('/api/commands')
def api_commands():
    """API: 获取可用命令列表"""
    commands = [
        {"name": "synocat", "description": "Interactive package creation wizard"},
        {"name": "synocat create <name>", "description": "Create package with optional template"},
        {"name": "synocat validate <path>", "description": "Validate package configuration"},
        {"name": "synocat pack <path>", "description": "Generate .spk package structure"},
        {"name": "synocat add resource <type>", "description": "Add DSM resource"},
        {"name": "synocat info <topic>", "description": "Show documentation"},
        {"name": "synocat image <file>", "description": "Generate all icon sizes"},
        {"name": "synocat compile <pkgscripts-ng> <package>", "description": "Compile with Synology toolchain"},
        {"name": "synocat update", "description": "Update to latest version"}
    ]
    return jsonify({"commands": commands})

@app.route('/api/docs/<topic>')
def api_docs(topic):
    """API: 获取文档"""
    docs = {
        "adminport": "Admin port configuration for DSM package. Must be between 1-65535.",
        "arch": "Supported architectures: x86_64, armv7, aarch64, ppc, etc.",
        "resource": "Resource types: port, data-share, database, etc.",
        "package": "Package structure and configuration guidelines."
    }
    
    content = docs.get(topic, f"Documentation for '{topic}' not available yet.")
    return jsonify({"topic": topic, "content": content})

@app.route('/api/validate', methods=['POST'])
def api_validate():
    """API: 验证包配置（模拟）"""
    data = request.get_json()
    
    # 这里是模拟验证，实际项目中会进行真实验证
    result = {
        "valid": True,
        "errors": [],
        "warnings": [],
        "message": "Package configuration is valid (simulation)"
    }
    
    if data and data.get('package_path'):
        result["package_path"] = data['package_path']
        logger.info(f"Validating package: {data['package_path']}")
    else:
        result["warnings"].append("No package path provided")
    
    return jsonify(result)

@app.route('/api/pack', methods=['POST'])
def api_pack():
    """API: 打包 SPK（模拟）"""
    data = request.get_json()
    
    result = {
        "success": True,
        "message": "SPK package generated successfully (simulation)",
        "output": "/tmp/package.spk"
    }
    
    if data and data.get('package_path'):
        result["package_path"] = data['package_path']
        logger.info(f"Packing package: {data['package_path']}")
    
    return jsonify(result)

@app.route('/static/<path:path>')
def serve_static(path):
    """提供静态文件"""
    return send_from_directory('static', path)

@app.errorhandler(404)
def not_found(error):
    """404 错误处理"""
    return jsonify({
        "error": "Not Found",
        "message": "The requested resource was not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """500 错误处理"""
    return jsonify({
        "error": "Internal Server Error",
        "message": "An internal error occurred"
    }), 500

# ==================== 命令行接口 ====================

def run_server(host=DEFAULT_HOST, port=DEFAULT_PORT, debug=DEFAULT_DEBUG):
    """运行服务器"""
    # 保存安装时间
    install_file = os.path.expanduser('~/.synocat_install_time')
    if not os.path.exists(install_file):
        try:
            with open(install_file, 'w') as f:
                f.write(START_TIME.isoformat())
        except IOError:
            pass
    
    # 设置应用配置
    app.config['HOST'] = host
    app.config['PORT'] = port
    app.config['DEBUG'] = debug
    
    # 打印启动信息
    print_colored_logo()
    print_success_message(host, port)
    print_features()
    print_quick_start()
    print_system_info()
    
    # 启动服务器
    logger.info(f"Starting synocat-web on {host}:{port}")
    
    try:
        app.run(host=host, port=port, debug=debug)
    except KeyboardInterrupt:
        print("\n" + Colors.YELLOW + "Shutting down gracefully..." + Colors.RESET)
        time.sleep(1)
        print(Colors.GREEN + "✓ Service stopped successfully" + Colors.RESET)

def print_colored_logo():
    """打印彩色 Logo"""
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

def print_success_message(host, port):
    """打印成功信息"""
    install_time = get_install_time()
    print(f"\n{Colors.GREEN}{Colors.BOLD}✓ INSTALLATION SUCCESSFUL!{Colors.RESET}")
    print(f"{Colors.GREEN}  synocat web service has been installed successfully{Colors.RESET}")
    print()
    print(f"{Colors.CYAN}  Service Information:{Colors.RESET}")
    print(f"    • Version: {Colors.YELLOW}{VERSION}{Colors.RESET}")
    print(f"    • Install Time: {Colors.YELLOW}{install_time.strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")
    print(f"    • Web Interface: {Colors.GREEN}http://{host}:{port}{Colors.RESET}")
    print(f"    • API Endpoint: {Colors.GREEN}http://{host}:{port}/api/status{Colors.RESET}")
    print()

def print_features():
    """打印功能特性"""
    print(f"{Colors.CYAN}{Colors.BOLD}Available Features:{Colors.RESET}")
    print(f"  {Colors.GREEN}•{Colors.RESET} Web-based package creation interface")
    print(f"  {Colors.GREEN}•{Colors.RESET} RESTful API for automation")
    print(f"  {Colors.GREEN}•{Colors.RESET} Real-time service monitoring")
    print(f"  {Colors.GREEN}•{Colors.RESET} Package validation endpoint")
    print(f"  {Colors.GREEN}•{Colors.RESET} SPK generation simulation")
    print(f"  {Colors.GREEN}•{Colors.RESET} Interactive documentation")
    print()

def print_quick_start():
    """打印快速开始指南"""
    print(f"{Colors.YELLOW}{Colors.BOLD}Quick Start:{Colors.RESET}")
    print(f"  {Colors.GREEN}${Colors.RESET} curl http://localhost:5000/api/status     {Colors.CYAN}# Check service status{Colors.RESET}")
    print(f"  {Colors.GREEN}${Colors.RESET} curl http://localhost:5000/api/info       {Colors.CYAN}# Get service info{Colors.RESET}")
    print(f"  {Colors.GREEN}${Colors.RESET} curl http://localhost:5000/api/health     {Colors.CYAN}# Health check{Colors.RESET}")
    print(f"  {Colors.GREEN}${Colors.RESET} open http://localhost:5000                {Colors.CYAN}# Open web interface{Colors.RESET}")
    print()

def print_system_info():
    """打印系统信息"""
    print(f"{Colors.BLUE}{Colors.BOLD}System Information:{Colors.RESET}")
    print(f"  • Python Version: {Colors.GREEN}{sys.version.split()[0]}{Colors.RESET}")
    print(f"  • Flask Version: {Colors.GREEN}{Flask.__version__}{Colors.RESET}")
    print(f"  • Platform: {Colors.GREEN}{platform.platform()}{Colors.RESET}")
    print(f"  • Process ID: {Colors.GREEN}{os.getpid()}{Colors.RESET}")
    print()

def print_help():
    """打印帮助信息"""
    print_colored_logo()
    print(f"{Colors.CYAN}{Colors.BOLD}synocat-web - Web service for Synology DSM 7 packages{Colors.RESET}")
    print()
    print(f"{Colors.YELLOW}Usage:{Colors.RESET}")
    print(f"  {Colors.GREEN}{sys.argv[0]}{Colors.RESET} [options]")
    print()
    print(f"{Colors.YELLOW}Options:{Colors.RESET}")
    print(f"  {Colors.GREEN}-h, --help{Colors.RESET}           Show this help message")
    print(f"  {Colors.GREEN}-v, --version{Colors.RESET}        Show version information")
    print(f"  {Colors.GREEN}--host HOST{Colors.RESET}          Set server host (default: 0.0.0.0)")
    print(f"  {Colors.GREEN}--port PORT{Colors.RESET}          Set server port (default: 5000)")
    print(f"  {Colors.GREEN}--debug{Colors.RESET}              Enable debug mode")
    print()
    print(f"{Colors.YELLOW}Examples:{Colors.RESET}")
    print(f"  {Colors.CYAN}$ {Colors.RESET}{sys.argv[0]}                        # Start server on default settings")
    print(f"  {Colors.CYAN}$ {Colors.RESET}{sys.argv[0]} --port 8080            # Start on port 8080")
    print(f"  {Colors.CYAN}$ {Colors.RESET}{sys.argv[0]} --host 127.0.0.1       # Listen only on localhost")
    print(f"  {Colors.CYAN}$ {Colors.RESET}{sys.argv[0]} --debug                # Start with debug mode")
    print()

class Colors:
    """颜色定义"""
    RESET = '\033[0m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'
    BOLD = '\033[1m'

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='synocat-web service')
    parser.add_argument('-v', '--version', action='store_true', help='Show version')
    parser.add_argument('--host', default=DEFAULT_HOST, help=f'Server host (default: {DEFAULT_HOST})')
    parser.add_argument('--port', type=int, default=DEFAULT_PORT, help=f'Server port (default: {DEFAULT_PORT})')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    if args.version:
        print(f"synocat-web version {VERSION}")
        return
    
    run_server(host=args.host, port=args.port, debug=args.debug)

if __name__ == "__main__":
    main()