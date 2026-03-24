#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Service management utilities for synocat-service
"""

import os
import sys
import signal
import atexit
import logging
from pathlib import Path

class ServiceManager:
    """服务管理器"""
    
    def __init__(self, name="synocat-service", pid_file=None):
        self.name = name
        self.pid_file = pid_file or f"/tmp/{name}.pid"
        self.logger = logging.getLogger(name)
    
    def write_pid(self):
        """写入 PID 文件"""
        try:
            with open(self.pid_file, 'w') as f:
                f.write(str(os.getpid()))
            atexit.register(self.remove_pid)
            return True
        except IOError as e:
            self.logger.error(f"Failed to write PID file: {e}")
            return False
    
    def remove_pid(self):
        """删除 PID 文件"""
        try:
            if os.path.exists(self.pid_file):
                os.unlink(self.pid_file)
        except OSError:
            pass
    
    def read_pid(self):
        """读取 PID 文件"""
        try:
            with open(self.pid_file, 'r') as f:
                return int(f.read().strip())
        except (IOError, ValueError):
            return None
    
    def is_running(self):
        """检查服务是否运行"""
        pid = self.read_pid()
        if pid is None:
            return False
        
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False
    
    def stop(self):
        """停止服务"""
        pid = self.read_pid()
        if pid is None:
            self.logger.info("Service is not running")
            return True
        
        try:
            os.kill(pid, signal.SIGTERM)
            self.logger.info(f"Sent SIGTERM to process {pid}")
            return True
        except OSError as e:
            self.logger.error(f"Failed to stop service: {e}")
            return False

# 便捷函数
def create_service_manager():
    """创建服务管理器实例"""
    return ServiceManager()