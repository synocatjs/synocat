// API 基础 URL
const API_BASE = '/api';

// 页面加载时获取数据
document.addEventListener('DOMContentLoaded', () => {
    loadStatus();
    loadInfo();
    loadSystemInfo();
    loadCommands();
    
    // 每 5 秒更新一次状态
    setInterval(updateUptime, 1000);
});

// 加载服务状态
async function loadStatus() {
    try {
        const response = await fetch(`${API_BASE}/status`);
        const data = await response.json();
        
        document.getElementById('status').textContent = data.status;
        document.getElementById('service-version').textContent = data.version;
        document.getElementById('start-time').textContent = formatDateTime(data.start_time);
        document.getElementById('install-time').textContent = formatDateTime(data.install_time);
        document.getElementById('host').textContent = data.host;
        document.getElementById('port').textContent = data.port;
        
        // 存储 uptime 用于实时更新
        window.uptimeStart = new Date(data.start_time);
        updateUptime();
    } catch (error) {
        console.error('Failed to load status:', error);
        document.getElementById('status').textContent = 'Error loading';
    }
}

// 加载服务信息
async function loadInfo() {
    try {
        const response = await fetch(`${API_BASE}/info`);
        const data = await response.json();
        
        // 更新功能列表
        const featuresList = document.getElementById('features-list');
        featuresList.innerHTML = data.features.map(feature => `<li>${feature}</li>`).join('');
        
        // 更新模板列表
        const templatesGrid = document.getElementById('templates-grid');
        templatesGrid.innerHTML = data.templates.map(template => `
            <div class="template-item">
                <div class="template-name">${template.name}</div>
                <div class="template-desc">${template.description}</div>
            </div>
        `).join('');
        
        // 更新快速开始命令
        const quickStart = document.getElementById('quick-start');
        quickStart.innerHTML = data.quick_start.map(cmd => `
            <div class="command">
                <span class="prompt">$</span>
                <span class="cmd">${cmd}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load info:', error);
    }
}

// 加载系统信息
async function loadSystemInfo() {
    try {
        const response = await fetch(`${API_BASE}/system`);
        const data = await response.json();
        
        // 这里可以显示更多系统信息
        console.log('System info:', data);
    } catch (error) {
        console.error('Failed to load system info:', error);
    }
}

// 加载命令列表
async function loadCommands() {
    try {
        const response = await fetch(`${API_BASE}/commands`);
        const data = await response.json();
        
        // 这里可以显示命令列表
        console.log('Commands:', data);
    } catch (error) {
        console.error('Failed to load commands:', error);
    }
}

// 更新运行时间
function updateUptime() {
    if (window.uptimeStart) {
        const now = new Date();
        const diff = now - window.uptimeStart;
        const uptime = formatDuration(diff);
        document.getElementById('uptime').textContent = uptime;
    }
}

// 格式化日期时间
function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString();
}

// 格式化持续时间
function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

// 健康检查
async function healthCheck() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        console.log('Health check:', data);
        return data;
    } catch (error) {
        console.error('Health check failed:', error);
        return null;
    }
}

// 验证包（示例）
async function validatePackage(packagePath) {
    try {
        const response = await fetch(`${API_BASE}/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ package_path: packagePath })
        });
        const data = await response.json();
        console.log('Validation result:', data);
        return data;
    } catch (error) {
        console.error('Validation failed:', error);
        return null;
    }
}

// 打包 SPK（示例）
async function packPackage(packagePath) {
    try {
        const response = await fetch(`${API_BASE}/pack`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ package_path: packagePath })
        });
        const data = await response.json();
        console.log('Pack result:', data);
        return data;
    } catch (error) {
        console.error('Pack failed:', error);
        return null;
    }
}

// 导出函数供控制台使用
window.synocat = {
    healthCheck,
    validatePackage,
    packPackage,
    loadStatus,
    loadInfo
};