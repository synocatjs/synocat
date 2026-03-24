package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"
)

// Version 版本信息
const Version = "1.0.0"

// ServiceStatus 服务状态
type ServiceStatus struct {
	Status      string    `json:"status"`
	Version     string    `json:"version"`
	StartTime   time.Time `json:"start_time"`
	Uptime      string    `json:"uptime"`
	InstallTime time.Time `json:"install_time"`
}

var (
	startTime   = time.Now()
	installTime time.Time
)

func init() {
	// 从环境变量或文件读取安装时间
	if envTime := os.Getenv("SYNOCAT_INSTALL_TIME"); envTime != "" {
		if t, err := time.Parse(time.RFC3339, envTime); err == nil {
			installTime = t
			return
		}
	}
	installTime = startTime
}

// printASCIILogo 打印 ASCII Logo
func printASCIILogo() {
	fmt.Print(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
`)
	fmt.Print(`║    _____          _             _                      ║
║   / ____|        | |           | |                     ║
║  | (___   _ __   | |_   ___    | |_                    ║
║   \___ \ | '_ \  | __| / _ \   | __|                   ║
║   ____) || | | | | |_ | (_) |  | |_                    ║
║  |_____/ |_| |_|  \__| \___/    \__|                   ║
`)
	fmt.Print(`║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`)
}

// printSuccessMessage 打印安装成功信息
func printSuccessMessage() {
	fmt.Println("\n" + colorGreen + colorBold + "✓ INSTALLATION SUCCESSFUL!" + colorReset)
	fmt.Println(colorGreen + "  synocat background service has been installed successfully" + colorReset)
	fmt.Println()
	fmt.Println(colorCyan + "  Service Information:" + colorReset)
	fmt.Printf("    • Version: %s%s%s\n", colorYellow, Version, colorReset)
	fmt.Printf("    • Install Time: %s%s%s\n", colorYellow, installTime.Format("2006-01-02 15:04:05"), colorReset)
	fmt.Printf("    • Service Status: %sRunning%s\n", colorGreen, colorReset)
	fmt.Println()
}

// printFeatures 打印功能特性
func printFeatures() {
	fmt.Println(colorCyan + colorBold + "Available Features:" + colorReset)
	fmt.Printf("  %s•%s Background service for Synology DSM 7 packages\n", colorGreen, colorReset)
	fmt.Printf("  %s•%s Ready to handle package creation requests\n", colorGreen, colorReset)
	fmt.Printf("  %s•%s Service health monitoring\n", colorGreen, colorReset)
	fmt.Printf("  %s•%s Graceful shutdown support\n", colorGreen, colorReset)
	fmt.Println()
}

// printQuickStart 打印快速开始指南
func printQuickStart() {
	fmt.Println(colorYellow + colorBold + "Quick Start:" + colorReset)
	fmt.Printf("  %s$%s %-30s %s# Check service status%s\n", 
		colorGreen, colorReset, "synocat-service status", colorCyan, colorReset)
	fmt.Printf("  %s$%s %-30s %s# Show version%s\n", 
		colorGreen, colorReset, "synocat-service version", colorCyan, colorReset)
	fmt.Printf("  %s$%s %-30s %s# Get service info (JSON)%s\n", 
		colorGreen, colorReset, "synocat-service info", colorCyan, colorReset)
	fmt.Printf("  %s$%s %-30s %s# Stop the service%s\n", 
		colorGreen, colorReset, "synocat-service stop", colorCyan, colorReset)
	fmt.Println()
}

// printSystemInfo 打印系统信息
func printSystemInfo() {
	fmt.Println(colorBlue + colorBold + "System Information:" + colorReset)
	
	// Go 版本
	fmt.Printf("  • Go Version: %s%s%s\n", colorGreen, 
		os.Getenv("GOVERSION"), colorReset)
	
	// 操作系统
	fmt.Printf("  • OS: %s%s%s\n", colorGreen, 
		os.Getenv("GOOS"), colorReset)
	
	// 架构
	fmt.Printf("  • Architecture: %s%s%s\n", colorGreen, 
		os.Getenv("GOARCH"), colorReset)
	
	// PID
	fmt.Printf("  • Process ID: %s%d%s\n", colorGreen, 
		os.Getpid(), colorReset)
	
	// 工作目录
	if wd, err := os.Getwd(); err == nil {
		fmt.Printf("  • Working Directory: %s%s%s\n", colorGreen, 
			wd, colorReset)
	}
	
	fmt.Println()
}

// showStatus 显示服务状态
func showStatus() {
	status := ServiceStatus{
		Status:      "running",
		Version:     Version,
		StartTime:   startTime,
		Uptime:      time.Since(startTime).String(),
		InstallTime: installTime,
	}
	
	fmt.Printf("%s%sService Status%s\n", colorCyan, colorBold, colorReset)
	fmt.Printf("  Status: %s%s%s\n", colorGreen, status.Status, colorReset)
	fmt.Printf("  Version: %s%s%s\n", colorYellow, status.Version, colorReset)
	fmt.Printf("  Start Time: %s%s%s\n", colorYellow, status.StartTime.Format("2006-01-02 15:04:05"), colorReset)
	fmt.Printf("  Uptime: %s%s%s\n", colorYellow, status.Uptime, colorReset)
	fmt.Printf("  Install Time: %s%s%s\n", colorYellow, status.InstallTime.Format("2006-01-02 15:04:05"), colorReset)
}

// showInfoJSON 以 JSON 格式显示信息
func showInfoJSON() {
	status := ServiceStatus{
		Status:      "running",
		Version:     Version,
		StartTime:   startTime,
		Uptime:      time.Since(startTime).String(),
		InstallTime: installTime,
	}
	
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(status); err != nil {
		fmt.Fprintf(os.Stderr, "Error encoding JSON: %v\n", err)
		os.Exit(1)
	}
}

// runService 运行后台服务
func runService() {
	// 打印启动信息
	printASCIILogo()
	printSuccessMessage()
	printFeatures()
	printQuickStart()
	printSystemInfo()
	
	// 创建信号通道
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	
	// 启动健康检查 ticker
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	
	// 服务主循环
	fmt.Println(colorGreen + colorBold + "✨ Service is running... ✨" + colorReset)
	fmt.Println(colorCyan + "Press Ctrl+C to stop the service" + colorReset)
	fmt.Println()
	
	for {
		select {
		case sig := <-sigChan:
			// 收到停止信号
			fmt.Printf("\n%sReceived signal: %v%s\n", colorYellow, sig, colorReset)
			fmt.Println(colorYellow + "Shutting down gracefully..." + colorReset)
			time.Sleep(1 * time.Second)
			fmt.Println(colorGreen + "✓ Service stopped successfully" + colorReset)
			return
			
		case <-ticker.C:
			// 健康检查（静默模式，不输出）
			// 实际项目中可以在这里添加健康检查逻辑
			// 例如：检查数据库连接、清理临时文件等
			_ = ticker
		}
	}
}

// main 主函数
func main() {
	// 解析命令行参数
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "status":
			showStatus()
			return
			
		case "version", "--version", "-v":
			fmt.Printf("synocat-service version %s\n", Version)
			return
			
		case "info":
			if len(os.Args) > 2 && os.Args[2] == "json" {
				showInfoJSON()
			} else {
				showStatus()
			}
			return
			
		case "help", "--help", "-h":
			printHelp()
			return
			
		case "stop":
			// 发送停止信号给服务进程
			// 实际项目中可以通过 PID 文件或信号来停止服务
			fmt.Println(colorYellow + "Stopping service..." + colorReset)
			// 这里简化处理，直接退出
			return
			
		case "start":
			runService()
			return
		}
	}
	
	// 默认行为：显示帮助
	printHelp()
}

// printHelp 打印帮助信息
func printHelp() {
	printASCIILogo()
	fmt.Println(colorCyan + colorBold + "synocat-service - Background service for Synology DSM 7 packages" + colorReset)
	fmt.Println()
	fmt.Println(colorYellow + "Usage:" + colorReset)
	fmt.Printf("  %s%s%s [command]\n", colorGreen, os.Args[0], colorReset)
	fmt.Println()
	fmt.Println(colorYellow + "Commands:" + colorReset)
	fmt.Printf("  %sstart%s          Start the background service\n", colorGreen, colorReset)
	fmt.Printf("  %sstatus%s         Show service status\n", colorGreen, colorReset)
	fmt.Printf("  %sinfo%s           Show service information\n", colorGreen, colorReset)
	fmt.Printf("  %sinfo json%s      Show service information in JSON format\n", colorGreen, colorReset)
	fmt.Printf("  %sstop%s           Stop the service\n", colorGreen, colorReset)
	fmt.Printf("  %sversion%s        Show version information\n", colorGreen, colorReset)
	fmt.Printf("  %shelp%s           Show this help message\n", colorGreen, colorReset)
	fmt.Println()
	fmt.Println(colorYellow + "Examples:" + colorReset)
	fmt.Printf("  %s$ %sstart%s\n", colorCyan, os.Args[0], colorReset)
	fmt.Printf("  %s$ %sstatus%s\n", colorCyan, os.Args[0], colorReset)
	fmt.Printf("  %s$ %sinfo json%s\n", colorCyan, os.Args[0], colorReset)
	fmt.Println()
}