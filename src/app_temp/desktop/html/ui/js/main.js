// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 设置安装时间
    setInstallTime();
    
    // 初始化复制功能
    initCopyButtons();
    
    // 初始化链接
    initLinks();
    
    // 添加控制台欢迎信息
    console.log(`
%c🐱 synocat 安装成功！
%c版本: v1.0.0
%c文档: https://github.com/synocat
%c开始使用: synocat create my-package
`, 
'color: #667eea; font-size: 16px; font-weight: bold;',
'color: #888;',
'color: #22c55e;',
'color: #667eea;'
    );
});

/**
 * 设置安装时间
 */
function setInstallTime() {
    const installTimeElement = document.getElementById('installTime');
    if (installTimeElement) {
        const now = new Date();
        const formattedTime = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        installTimeElement.textContent = formattedTime;
    }
}

/**
 * 初始化复制按钮
 */
function initCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const targetId = button.getAttribute('data-copy');
            const codeElement = document.getElementById(targetId);
            
            if (codeElement) {
                const textToCopy = codeElement.textContent;
                
                try {
                    await copyToClipboard(textToCopy);
                    
                    // 显示复制成功反馈
                    const originalText = button.textContent;
                    button.textContent = '已复制!';
                    button.classList.add('copied');
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('复制失败:', err);
                    button.textContent = '复制失败';
                    setTimeout(() => {
                        button.textContent = '复制';
                    }, 2000);
                }
            }
        });
    });
}

/**
 * 复制文本到剪贴板
 */
async function copyToClipboard(text) {
    // 使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
    } else {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

/**
 * 初始化链接
 */
function initLinks() {
    // 文档链接
    const docsLink = document.getElementById('docsLink');
    if (docsLink) {
        docsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showDocsNotification();
        });
    }
}

/**
 * 显示文档通知
 */
function showDocsNotification() {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        cursor: pointer;
        transition: opacity 0.3s ease-out;
    `;
    notification.textContent = '📚 完整文档即将发布，敬请期待！';
    
    document.body.appendChild(notification);
    
    // 点击关闭
    notification.addEventListener('click', () => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // 自动移除通知
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}