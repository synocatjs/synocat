import type { IScaffoldTemplate } from './base.template';
import type { GeneratedFile, ScaffoldConfig } from '../../../types/';

export class IframeTemplate implements IScaffoldTemplate {
  readonly type = 'desktop-iframe';

  generate(cfg: ScaffoldConfig): GeneratedFile[] {
    return [
      { path: 'src/index.html', content: this.entryPoint(cfg) },
      { path: 'src/style.css', content: this.styles(cfg) },
      { path: 'src/README.md', content: this.readme(cfg) },
      {path: 'src/script.js',content: this.script(cfg)},
    ];
  }

  getNextSteps(cfg: ScaffoldConfig): string[] {
    return [
      `Edit src/index.html to change iframe URL or settings`,
      `Edit src/style.css to customize the iframe appearance`,
      `Open src/index.html directly in browser to test`,
      `Place in DSM web folder or use Web Station`,
      `Run: synocat pack ${cfg.package}`,
    ];
  }

  private entryPoint(cfg: ScaffoldConfig): string {
    const title = cfg.package;
    const defaultUrl = 'https://www.example.com';
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <div class="toolbar">
            <div class="url-bar">
                <label for="urlInput">URL:</label>
                <input type="text" id="urlInput" placeholder="请输入网址" value="${defaultUrl}">
                <button id="loadBtn" class="btn-primary">加载</button>
                <button id="refreshBtn" class="btn-secondary">刷新</button>
                <button id="fullscreenBtn" class="btn-secondary">全屏</button>
            </div>
            <div class="controls">
                <button id="backBtn" class="btn-icon" title="后退">←</button>
                <button id="forwardBtn" class="btn-icon" title="前进">→</button>
                <button id="homeBtn" class="btn-icon" title="主页">🏠</button>
                <button id="newWindowBtn" class="btn-icon" title="新窗口打开">🔗</button>
            </div>
        </div>
        
        <div class="iframe-wrapper">
            <iframe id="contentFrame" src="${defaultUrl}" title="${title}"></iframe>
            <div id="loadingOverlay" class="loading-overlay" style="display: none;">
                <div class="spinner"></div>
                <p>加载中...</p>
            </div>
        </div>
        
        <div class="status-bar">
            <span id="statusText">就绪</span>
            <span id="urlStatus" class="url-status"></span>
        </div>
    </div>
    
    <script src="script.js"></script>
</body>
</html>`;
  }

  private styles(cfg: ScaffoldConfig): string {
    return `/* ${cfg.package} - Iframe Viewer Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #f5f5f5;
    height: 100vh;
    overflow: hidden;
}

.container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 100%;
}

/* 工具栏样式 */
.toolbar {
    background: white;
    border-bottom: 1px solid #e0e0e0;
    padding: 12px 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.url-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.url-bar label {
    font-weight: 500;
    color: #333;
    font-size: 14px;
}

.url-bar input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.3s;
}

.url-bar input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-primary, .btn-secondary {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background: #667eea;
    color: white;
}

.btn-primary:hover {
    background: #5a67d8;
    transform: translateY(-1px);
}

.btn-secondary {
    background: #f0f0f0;
    color: #333;
}

.btn-secondary:hover {
    background: #e0e0e0;
    transform: translateY(-1px);
}

.controls {
    display: flex;
    gap: 8px;
}

.btn-icon {
    padding: 6px 12px;
    background: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
}

.btn-icon:hover {
    background: #e0e0e0;
    transform: translateY(-1px);
}

/* iframe 容器 */
.iframe-wrapper {
    flex: 1;
    position: relative;
    background: white;
    margin: 0;
    overflow: hidden;
}

#contentFrame {
    width: 100%;
    height: 100%;
    border: none;
    background: white;
}

/* 加载覆盖层 */
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-overlay p {
    color: #666;
    font-size: 14px;
}

/* 状态栏 */
.status-bar {
    background: #f8f9fa;
    border-top: 1px solid #e0e0e0;
    padding: 6px 20px;
    font-size: 12px;
    color: #666;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.url-status {
    color: #999;
    font-family: monospace;
    font-size: 11px;
    max-width: 50%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 全屏模式 */
.container:fullscreen {
    background: white;
}

.container:fullscreen .toolbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1001;
}

.container:fullscreen .iframe-wrapper {
    margin-top: 80px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .toolbar {
        padding: 10px;
    }
    
    .url-bar {
        flex-wrap: wrap;
        gap: 8px;
    }
    
    .url-bar input {
        min-width: 200px;
    }
    
    .btn-primary, .btn-secondary {
        padding: 6px 12px;
        font-size: 12px;
    }
    
    .btn-icon {
        padding: 4px 8px;
        font-size: 14px;
    }
    
    .controls {
        flex-wrap: wrap;
    }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
    body {
        background: #1a1a1a;
    }
    
    .toolbar {
        background: #2d2d2d;
        border-bottom-color: #404040;
    }
    
    .url-bar label {
        color: #e0e0e0;
    }
    
    .url-bar input {
        background: #3d3d3d;
        border-color: #505050;
        color: #e0e0e0;
    }
    
    .url-bar input:focus {
        border-color: #667eea;
    }
    
    .btn-secondary {
        background: #3d3d3d;
        color: #e0e0e0;
    }
    
    .btn-secondary:hover {
        background: #4d4d4d;
    }
    
    .btn-icon {
        background: #3d3d3d;
        border-color: #505050;
        color: #e0e0e0;
    }
    
    .btn-icon:hover {
        background: #4d4d4d;
    }
    
    .status-bar {
        background: #2d2d2d;
        border-top-color: #404040;
        color: #999;
    }
    
    .loading-overlay {
        background: rgba(45, 45, 45, 0.9);
    }
    
    .loading-overlay p {
        color: #e0e0e0;
    }
}`;
  }

  /**
   * 生成 iframe 查看器的脚本代码
   * @param cfg - 脚手架配置对象，包含包名等信息
   * @returns 返回 iframe 查看器的完整脚本代码字符串
   */
  private script(cfg: ScaffoldConfig): string {
    return `// ${cfg.package} - Iframe Viewer Script
class IframeViewer {
    constructor() {
        this.iframe = document.getElementById('contentFrame');
        this.urlInput = document.getElementById('urlInput');
        this.loadBtn = document.getElementById('loadBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.backBtn = document.getElementById('backBtn');
        this.forwardBtn = document.getElementById('forwardBtn');
        this.homeBtn = document.getElementById('homeBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.newWindowBtn = document.getElementById('newWindowBtn');
        this.statusText = document.getElementById('statusText');
        this.urlStatus = document.getElementById('urlStatus');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        this.history = [];
        this.currentIndex = -1;
        
        this.init();
    }
    
    init() {
        // 绑定事件
        this.loadBtn.addEventListener('click', () => this.loadUrl());
        this.refreshBtn.addEventListener('click', () => this.refresh());
        this.backBtn.addEventListener('click', () => this.goBack());
        this.forwardBtn.addEventListener('click', () => this.goForward());
        this.homeBtn.addEventListener('click', () => this.goHome());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.newWindowBtn.addEventListener('click', () => this.openInNewWindow());
        
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loadUrl();
        });
        
        this.iframe.addEventListener('load', () => this.onIframeLoad());
        this.iframe.addEventListener('error', () => this.onIframeError());
        
        // 监听 iframe 内的导航
        this.iframe.addEventListener('load', () => {
            this.updateUrlDisplay();
            this.updateHistory();
        });
        
        // 初始加载
        this.showLoading(false);
        this.updateUrlDisplay();
        
        // 保存默认主页
        this.homeUrl = this.urlInput.value;
    }
    
    loadUrl() {
        let url = this.urlInput.value.trim();
        
        if (!url) {
            this.showStatus('请输入 URL', 'error');
            return;
        }
        
        // 添加协议前缀
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        this.showLoading(true);
        this.showStatus('加载中...');
        
        try {
            this.iframe.src = url;
            this.urlInput.value = url;
        } catch (error) {
            this.showStatus('加载失败: ' + error.message, 'error');
            this.showLoading(false);
        }
    }
    
    refresh() {
        this.showLoading(true);
        this.showStatus('刷新中...');
        this.iframe.src = this.iframe.src;
    }
    
    goBack() {
        try {
            this.iframe.contentWindow.history.back();
            this.showStatus('后退');
        } catch (error) {
            this.showStatus('无法后退', 'error');
        }
    }
    
    goForward() {
        try {
            this.iframe.contentWindow.history.forward();
            this.showStatus('前进');
        } catch (error) {
            this.showStatus('无法前进', 'error');
        }
    }
    
    goHome() {
        this.urlInput.value = this.homeUrl;
        this.loadUrl();
    }
    
    toggleFullscreen() {
        const container = document.querySelector('.container');
        
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                this.showStatus('全屏失败: ' + err.message, 'error');
            });
            this.fullscreenBtn.textContent = '退出';
            this.fullscreenBtn.title = '退出全屏';
        } else {
            document.exitFullscreen();
            this.fullscreenBtn.textContent = '全屏';
            this.fullscreenBtn.title = '全屏';
        }
    }
    
    openInNewWindow() {
        const url = this.iframe.src;
        if (url && url !== 'about:blank') {
            window.open(url, '_blank');
            this.showStatus('已在新窗口打开');
        } else {
            this.showStatus('无有效 URL', 'error');
        }
    }
    
    onIframeLoad() {
        this.showLoading(false);
        this.showStatus('加载完成');
        this.updateUrlDisplay();
    }
    
    onIframeError() {
        this.showLoading(false);
        this.showStatus('加载失败，请检查 URL 是否可访问', 'error');
    }
    
    updateUrlDisplay() {
        try {
            const currentUrl = this.iframe.contentWindow.location.href;
            if (currentUrl && currentUrl !== 'about:blank') {
                this.urlStatus.textContent = currentUrl;
                this.urlInput.value = currentUrl;
            }
        } catch (error) {
            // 跨域限制，无法获取 iframe 内的 URL
            this.urlStatus.textContent = '无法获取 URL (跨域限制)';
        }
    }
    
    updateHistory() {
        try {
            const currentUrl = this.iframe.contentWindow.location.href;
            if (currentUrl && currentUrl !== 'about:blank') {
                // 简单记录历史
                if (this.history[this.currentIndex] !== currentUrl) {
                    this.history = this.history.slice(0, this.currentIndex + 1);
                    this.history.push(currentUrl);
                    this.currentIndex++;
                }
            }
        } catch (error) {
            // 跨域限制，无法记录历史
        }
    }
    
    showLoading(show) {
        if (show) {
            this.loadingOverlay.style.display = 'flex';
        } else {
            this.loadingOverlay.style.display = 'none';
        }
    }
    
    showStatus(message, type = 'info') {
        this.statusText.textContent = message;
        
        if (type === 'error') {
            this.statusText.style.color = '#dc3545';
            setTimeout(() => {
                if (this.statusText.textContent === message) {
                    this.statusText.style.color = '';
                }
            }, 3000);
        } else {
            this.statusText.style.color = '';
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new IframeViewer();
});`;
  }

  private readme(cfg: ScaffoldConfig): string {
    const packageName = cfg.package.toLowerCase();
    
    return `# ${cfg.package}

${cfg.description || 'A versatile iframe-based web viewer for Synology DSM'}

## Features

- ✅ Embedded iframe viewer
- ✅ URL navigation with history
- ✅ Back/Forward navigation
- ✅ Refresh functionality
- ✅ Fullscreen mode
- ✅ Open in new window
- ✅ Loading indicator
- ✅ Status bar with URL display
- ✅ Responsive design
- ✅ Dark mode support

## Installation

### For DSM Web Station

1. Copy the \`src\` folder to your web directory:
   \`\`\`bash
   cp -r src /volume1/web/${packageName}/
   \`\`\`

2. Access via web browser:
   \`\`\`
   http://your-nas:port/${packageName}/
   \`\`\`

### For Local Testing

Simply open \`src/index.html\` in any web browser.

## Usage

1. **Enter URL**: Type any website URL in the address bar
2. **Load**: Click "加载" or press Enter to load the URL
3. **Navigate**: Use back/forward buttons or browser navigation
4. **Refresh**: Click refresh button to reload current page
5. **Fullscreen**: Click fullscreen button for immersive viewing
6. **New Window**: Open current page in a new browser tab

## File Structure

\`\`\`
src/
├── index.html    # Main HTML structure
├── style.css     # Styling with dark mode support
├── script.js     # Iframe viewer logic
└── README.md     # Documentation
\`\`\`

## Features Explained

### URL Bar
- Enter any website URL
- Auto-adds https:// if missing
- Displays current iframe URL

### Navigation Controls
- **Back/Forward**: Navigate through history
- **Refresh**: Reload current page
- **Home**: Return to default URL
- **Fullscreen**: Toggle fullscreen mode
- **New Window**: Open in separate tab

### Status Indicators
- Loading spinner during page loads
- Status messages for actions
- Current URL display (when accessible)

## Customization

### Change Default URL

Edit \`index.html\`:
\`\`\`html
<input type="text" id="urlInput" value="https://your-default-url.com">
\`\`\`

### Modify Theme Colors

Edit \`style.css\`:
\`\`\`css
.btn-primary {
    background: #your-color;
}
\`\`\`

### Add Custom Features

- Bookmark manager
- Multiple tabs
- Screenshot capability
- Download helper

## Limitations

- Cross-origin restrictions may limit iframe access to some websites
- Some websites block being displayed in iframes
- Cannot access iframe content due to same-origin policy

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Use Cases

- Embed external web applications
- Create a custom dashboard
- Integrate web services
- Display remote content
- Web development testing

## License

Proprietary - All rights reserved`;
  }
}