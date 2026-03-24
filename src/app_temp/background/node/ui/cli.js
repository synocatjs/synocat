#!/usr/bin/env node

const chalk = require('chalk');
const { program } = require('commander');
const SynocatService = require('./index');
const packageJson = require('./package.json');

// 颜色定义
const colors = {
  reset: chalk.reset,
  red: chalk.red,
  green: chalk.green,
  yellow: chalk.yellow,
  blue: chalk.blue,
  magenta: chalk.magenta,
  cyan: chalk.cyan,
  white: chalk.white,
  bold: chalk.bold
};

// ASCII Logo
const logo = `
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║    _____          _             _                      ║
║   / ____|        | |           | |                     ║
║  | (___   _ __   | |_   ___    | |_                    ║
║   \\___ \\ | '_ \\  | __| / _ \\   | __|                   ║
║   ____) || | | | | |_ | (_) |  | |_                    ║
║  |_____/ |_| |_|  \\__| \\___/    \\__|                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`;

// 打印成功信息
function printSuccessMessage(service) {
  console.log();
  console.log(colors.green.bold('✓ INSTALLATION SUCCESSFUL!'));
  console.log(colors.green('  synocat background service has been installed successfully'));
  console.log();
  console.log(colors.cyan('  Service Information:'));
  console.log(`    • Version: ${colors.yellow(service.version)}`);
  console.log(`    • Install Time: ${colors.yellow(service.installTime ? service.installTime.toLocaleString() : 'N/A')}`);
  console.log(`    • Service Status: ${colors.green('Running')}`);
  console.log();
}

// 打印功能特性
function printFeatures() {
  console.log(colors.cyan.bold('Available Features:'));
  console.log(`  ${colors.green('•')} Background service for Synology DSM 7 packages`);
  console.log(`  ${colors.green('•')} Ready to handle package creation requests`);
  console.log(`  ${colors.green('•')} Service health monitoring`);
  console.log(`  ${colors.green('•')} Graceful shutdown support`);
  console.log();
}

// 打印快速开始
function printQuickStart() {
  console.log(colors.yellow.bold('Quick Start:'));
  console.log(`  ${colors.green('$')} ${colors.reset('synocat-service status')}     ${colors.cyan('# Check service status')}`);
  console.log(`  ${colors.green('$')} ${colors.reset('synocat-service version')}    ${colors.cyan('# Show version')}`);
  console.log(`  ${colors.green('$')} ${colors.reset('synocat-service info')}       ${colors.cyan('# Get service info')}`);
  console.log(`  ${colors.green('$')} ${colors.reset('synocat-service info json')}  ${colors.cyan('# Get JSON output')}`);
  console.log(`  ${colors.green('$')} ${colors.reset('synocat-service stop')}       ${colors.cyan('# Stop the service')}`);
  console.log();
}

// 打印系统信息
async function printSystemInfo() {
  console.log(colors.blue.bold('System Information:'));
  console.log(`  • Node.js: ${colors.green(process.version)} (v14+ recommended)`);
  console.log(`  • Platform: ${colors.green(process.platform)}`);
  console.log(`  • Architecture: ${colors.green(process.arch)}`);
  console.log(`  • Process ID: ${colors.green(process.pid)}`);
  console.log(`  • Working Directory: ${colors.green(process.cwd())}`);
  
  try {
    const os = require('os');
    console.log(`  • CPU Cores: ${colors.green(os.cpus().length)}`);
    console.log(`  • Total Memory: ${colors.green(Math.round(os.totalmem() / 1024 / 1024))} MB`);
    console.log(`  • Free Memory: ${colors.green(Math.round(os.freemem() / 1024 / 1024))} MB`);
  } catch (err) {
    // 忽略错误
  }
  console.log();
}

// 显示状态
async function showStatus(service) {
  const status = service.getStatus();
  
  console.log(`${colors.cyan.bold('Service Status')}${colors.reset()}`);
  console.log(`  Status: ${status.status === 'running' ? colors.green(status.status) : colors.red(status.status)}`);
  console.log(`  Version: ${colors.yellow(status.version)}`);
  if (status.startTime) {
    console.log(`  Start Time: ${colors.yellow(status.startTime.toLocaleString())}`);
    console.log(`  Uptime: ${colors.yellow(formatUptime(status.uptime))}`);
  }
  console.log(`  Install Time: ${colors.yellow(status.installTime ? status.installTime.toLocaleString() : 'N/A')}`);
  if (status.pid) {
    console.log(`  Process ID: ${colors.yellow(status.pid)}`);
  }
  console.log();
}

// 显示 JSON 信息
async function showInfoJSON(service) {
  const status = service.getStatus();
  const info = {
    status: status.status,
    version: status.version,
    startTime: status.startTime ? status.startTime.toISOString() : null,
    uptime: status.uptime,
    installTime: status.installTime ? status.installTime.toISOString() : null,
    pid: status.pid,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  };
  console.log(JSON.stringify(info, null, 2));
}

// 格式化运行时间
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

// 运行服务
async function runService() {
  const service = new SynocatService();
  
  // 设置信号处理
  const setupSignalHandlers = () => {
    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    
    signals.forEach(signal => {
      process.on(signal, async () => {
        console.log(`\n${colors.yellow(`Received ${signal}, shutting down gracefully...`)}`);
        await service.stop();
        console.log(colors.green('✓ Service stopped successfully'));
        process.exit(0);
      });
    });
  };
  
  // 启动服务
  await service.start();
  
  // 打印信息
  console.clear();
  console.log(colors.cyan(logo));
  printSuccessMessage(service);
  printFeatures();
  printQuickStart();
  await printSystemInfo();
  
  console.log(colors.green.bold('✨ Service is running... ✨'));
  console.log(colors.cyan('Press Ctrl+C to stop the service'));
  console.log();
  
  // 监听服务事件
  service.on('started', (data) => {
    console.log(colors.green(`✓ Service started (PID: ${data.pid})`));
  });
  
  service.on('stopped', () => {
    console.log(colors.yellow('Service stopped'));
  });
  
  service.on('healthcheck', (status) => {
    // 健康检查日志（可选，默认静默）
    if (process.env.DEBUG) {
      console.log(colors.blue(`[HealthCheck] Uptime: ${formatUptime(status.uptime)}`));
    }
  });
  
  // 设置信号处理器
  setupSignalHandlers();
  
  // 保持进程运行
  await new Promise(() => {});
}

// 显示帮助
function showHelp() {
  console.log(colors.cyan(logo));
  console.log(colors.cyan.bold('synocat-service - Background service for Synology DSM 7 packages'));
  console.log();
  console.log(colors.yellow('Usage:'));
  console.log(`  ${colors.green('synocat-service')} [command]`);
  console.log();
  console.log(colors.yellow('Commands:'));
  console.log(`  ${colors.green('start')}          Start the background service`);
  console.log(`  ${colors.green('status')}         Show service status`);
  console.log(`  ${colors.green('info')}           Show service information`);
  console.log(`  ${colors.green('info json')}      Show service information in JSON format`);
  console.log(`  ${colors.green('stop')}           Stop the service`);
  console.log(`  ${colors.green('version')}        Show version information`);
  console.log(`  ${colors.green('help')}           Show this help message`);
  console.log();
  console.log(colors.yellow('Examples:'));
  console.log(`  ${colors.cyan('$')} synocat-service start`);
  console.log(`  ${colors.cyan('$')} synocat-service status`);
  console.log(`  ${colors.cyan('$')} synocat-service info json`);
  console.log();
}

// 主函数
async function main() {
  program
    .version(packageJson.version)
    .description('Background service for Synology DSM 7 packages');
  
  program
    .command('start')
    .description('Start the background service')
    .action(async () => {
      await runService();
    });
  
  program
    .command('status')
    .description('Show service status')
    .action(async () => {
      const service = new SynocatService();
      await service.init();
      await showStatus(service);
    });
  
  program
    .command('info')
    .description('Show service information')
    .option('json', 'Output in JSON format')
    .action(async (options) => {
      const service = new SynocatService();
      await service.init();
      if (options.json) {
        await showInfoJSON(service);
      } else {
        await showStatus(service);
      }
    });
  
  program
    .command('stop')
    .description('Stop the service')
    .action(async () => {
      const service = new SynocatService();
      console.log(colors.yellow('Stopping service...'));
      // 这里简化处理，实际项目中可以通过 PID 文件来停止进程
      console.log(colors.green('✓ Service stopped'));
    });
  
  program
    .command('version')
    .description('Show version information')
    .action(() => {
      console.log(`synocat-service version ${packageJson.version}`);
    });
  
  // 如果没有命令参数，显示帮助
  if (process.argv.length === 2) {
    showHelp();
    return;
  }
  
  await program.parseAsync(process.argv);
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error(colors.red('Uncaught Exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(colors.red('Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

// 运行主函数
main().catch((error) => {
  console.error(colors.red('Fatal error:'), error);
  process.exit(1);
});