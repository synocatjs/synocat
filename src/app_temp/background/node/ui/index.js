#!/usr/bin/env node

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class SynocatService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.version = '1.0.0';
    this.startTime = null;
    this.installTime = null;
    this.isRunning = false;
    this.pidFile = options.pidFile || path.join(os.tmpdir(), 'synocat-service.pid');
    this.logFile = options.logFile || path.join(os.homedir(), '.synocat', 'service.log');
    this.healthCheckInterval = options.healthCheckInterval || 30000; // 30秒
    this.healthCheckTimer = null;
  }

  async init() {
    // 读取或设置安装时间
    try {
      const installInfoPath = path.join(os.homedir(), '.synocat', 'install.json');
      const installInfo = JSON.parse(await fs.readFile(installInfoPath, 'utf8'));
      this.installTime = new Date(installInfo.installTime);
    } catch (err) {
      this.installTime = new Date();
      // 保存安装时间
      const installDir = path.join(os.homedir(), '.synocat');
      await fs.mkdir(installDir, { recursive: true });
      await fs.writeFile(
        path.join(installDir, 'install.json'),
        JSON.stringify({ installTime: this.installTime.toISOString(), version: this.version })
      );
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('Service is already running');
      return false;
    }

    await this.init();
    this.startTime = new Date();
    this.isRunning = true;

    // 写入 PID 文件
    await fs.writeFile(this.pidFile, process.pid.toString());

    // 启动健康检查
    this.startHealthCheck();

    this.emit('started', { startTime: this.startTime, pid: process.pid });
    return true;
  }

  startHealthCheck() {
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, this.healthCheckInterval);
  }

  async performHealthCheck() {
    // 健康检查逻辑（静默模式）
    // 实际项目中可以检查数据库连接、磁盘空间等
    const healthStatus = {
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };

    // 可选：记录健康检查日志
    // await this.logHealthStatus(healthStatus);
    
    this.emit('healthcheck', healthStatus);
  }

  async stop() {
    if (!this.isRunning) {
      console.log('Service is not running');
      return false;
    }

    this.isRunning = false;
    
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    // 删除 PID 文件
    try {
      await fs.unlink(this.pidFile);
    } catch (err) {
      // 忽略文件不存在的错误
    }

    this.emit('stopped', { stopTime: new Date() });
    return true;
  }

  getStatus() {
    return {
      status: this.isRunning ? 'running' : 'stopped',
      version: this.version,
      startTime: this.startTime,
      uptime: this.getUptime(),
      installTime: this.installTime,
      pid: this.isRunning ? process.pid : null
    };
  }

  getUptime() {
    if (!this.startTime) return 0;
    return Date.now() - this.startTime.getTime();
  }

  async log(message, level = 'info') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      pid: process.pid
    };

    try {
      const logDir = path.dirname(this.logFile);
      await fs.mkdir(logDir, { recursive: true });
      await fs.appendFile(this.logFile, JSON.stringify(logEntry) + '\n');
    } catch (err) {
      console.error('Failed to write log:', err.message);
    }
  }

  async getLogs(lines = 100) {
    try {
      const content = await fs.readFile(this.logFile, 'utf8');
      const logs = content.trim().split('\n').filter(Boolean);
      return logs.slice(-lines).map(line => JSON.parse(line));
    } catch (err) {
      return [];
    }
  }
}

module.exports = SynocatService;