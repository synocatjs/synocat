import type { IScaffoldTemplate } from './base.template';
import type { GeneratedFile, ScaffoldConfig } from '../../../types/';

export class GoServiceTemplate implements IScaffoldTemplate {
  readonly type = 'go-service';

  generate(cfg: ScaffoldConfig): GeneratedFile[] {
    return [
      { path: 'src/main.go', content: this.entryPoint(cfg) },
      { path: 'src/go.mod', content: this.goMod(cfg) },
      { path: 'src/Makefile', content: this.makefile(cfg) },
    ];
  }

  getNextSteps(cfg: ScaffoldConfig): string[] {
    return [
      `Edit src/main.go to implement your service logic`,
      `Run: cd src && go mod tidy`,
      `Build: cd src && make`,
      `Test: ./bin/${cfg.package.toLowerCase()}`,
      `Run: synocat pack ${cfg.package}`,
    ];
  }

  private entryPoint(cfg: ScaffoldConfig): string {
    const port = cfg.adminport ?? '8080';
    const name = cfg.package.toLowerCase();
    
    return `package main

import (
    "fmt"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"
)

func main() {
    port := os.Getenv("PORT")
    if port == "" {
        port = "${port}"
    }

    // HTTP 路由
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        fmt.Fprintf(w, "${cfg.package} v${cfg.version}\\n")
    })

    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        fmt.Fprintf(w, "OK\\n")
    })

    // 启动服务
    srv := &http.Server{
        Addr:         ":" + port,
        ReadTimeout:  15 * time.Second,
        WriteTimeout: 15 * time.Second,
        IdleTimeout:  60 * time.Second,
    }

    // 优雅关闭
    go func() {
        log.Printf("[${name}] Server starting on port %s", port)
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("[${name}] Server failed: %v", err)
        }
    }()

    // 等待中断信号
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("[${name}] Shutting down server...")
    
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    
    if err := srv.Shutdown(ctx); err != nil {
        log.Fatalf("[${name}] Server forced to shutdown: %v", err)
    }
    
    log.Println("[${name}] Server exited")
}`;
  }

  private goMod(cfg: ScaffoldConfig): string {
    const module = cfg.package.toLowerCase();
    
    return `module ${module}

go 1.21

require (
    // 添加依赖
)`;
  }

  private makefile(cfg: ScaffoldConfig): string {
    const binaryName = cfg.package.toLowerCase();
    
    return `BINARY = ${binaryName}
BIN_DIR = ../bin
GO = go
GOFLAGS = -ldflags="-s -w"

all: build

build:
\tmkdir -p $(BIN_DIR)
\t$(GO) build $(GOFLAGS) -o $(BIN_DIR)/$(BINARY) .

clean:
\trm -f $(BIN_DIR)/$(BINARY)

run: build
\t$(BIN_DIR)/$(BINARY)

.PHONY: all build clean run`;
  }
}