import type { IScaffoldTemplate } from './base.template';
import type { GeneratedFile, ScaffoldConfig } from '../../../types/';

export class PythonServiceTemplate implements IScaffoldTemplate {
  readonly type = 'python-service';

  generate(cfg: ScaffoldConfig): GeneratedFile[] {
    return [
      { path: 'src/main.py', content: this.entryPoint(cfg) },
      { path: 'src/requirements.txt', content: this.requirements(cfg) },
      { path: 'src/start.sh', content: this.startScript(cfg) },
    ];
  }

  getNextSteps(cfg: ScaffoldConfig): string[] {
    return [
      `Edit src/main.py to implement your service logic`,
      `Install dependencies: pip install -r src/requirements.txt`,
      `Test: python src/main.py`,
      `Make script executable: chmod +x src/start.sh`,
      `Run: synocat pack ${cfg.package}`,
    ];
  }

  private entryPoint(cfg: ScaffoldConfig): string {
    const port = cfg.adminport ?? '8080';
    const name = cfg.package.toLowerCase();
    
    return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
${cfg.package} - Python Service
Version: ${cfg.version}
Description: ${cfg.description || 'A Python-based service for DSM'}
"""

import os
import signal
import sys
import time
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='[${name}] %(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class Handler(BaseHTTPRequestHandler):
    """HTTP 请求处理器"""
    
    def do_GET(self):
        """处理 GET 请求"""
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            response = f'${cfg.package} v${cfg.version}\\n'
            self.wfile.write(response.encode())
            
        elif self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = json.dumps({'status': 'ok', 'version': '${cfg.version}'})
            self.wfile.write(response.encode())
            
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        """处理 POST 请求"""
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        response = json.dumps({
            'status': 'ok',
            'received': post_data.decode('utf-8')
        })
        self.wfile.write(response.encode())
    
    def log_message(self, format, *args):
        """重写日志方法"""
        logger.info("%s - %s" % (self.address_string(), format % args))

def signal_handler(signum, frame):
    """信号处理器"""
    logger.info("Received signal %d, shutting down...", signum)
    sys.exit(0)

def main():
    """主函数"""
    # 获取端口
    port = int(os.environ.get('PORT', ${port}))
    
    # 注册信号处理器
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # 启动服务
    server = HTTPServer(('0.0.0.0', port), Handler)
    logger.info("Server starting on port %d", port)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.shutdown()
        server.server_close()
        logger.info("Server stopped")

if __name__ == '__main__':
    main()`;
  }

  private requirements(cfg: ScaffoldConfig): string {
    return `# Python dependencies for ${cfg.package}
# Add your dependencies here

# Web frameworks
# flask
# fastapi
# uvicorn

# Database
# sqlalchemy
# pymongo

# Utilities
# requests
# python-dotenv`;
  }

  private startScript(cfg: ScaffoldConfig): string {
    const name = cfg.package.toLowerCase();
    console.log(name);
    
    return `#!/bin/bash
# ${cfg.package} - Python Service Start Script

cd "$(dirname "$0")"

# 设置环境变量
export PORT="${cfg.adminport ?? '8080'}"
export PYTHONUNBUFFERED=1

# 安装依赖（可选）
if [ -f requirements.txt ]; then
    pip install -r requirements.txt
fi

# 启动服务
python3 main.py

# 或者使用 gunicorn（生产环境）
# exec gunicorn -w 2 -b 0.0.0.0:$PORT main:app`;
  }
}