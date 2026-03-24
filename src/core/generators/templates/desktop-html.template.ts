import type { IScaffoldTemplate } from './base.template';
import type { GeneratedFile, ScaffoldConfig } from '../../../types/';

export class HtmlUiTemplate implements IScaffoldTemplate {
  readonly type = 'desktop-html';

  generate(cfg: ScaffoldConfig): GeneratedFile[] {
    return [
      { path: 'src/index.html', content: this.entryPoint(cfg) },
      { path: 'src/style.css', content: this.styles(cfg) },
      { path: 'src/script.js', content: this.script(cfg) },
      { path: 'src/README.md', content: this.readme(cfg) },
    ];
  }

  getNextSteps(cfg: ScaffoldConfig): string[] {
    return [
      `Edit src/index.html, style.css, script.js to customize`,
      `Open src/index.html directly in browser to test`,
      `Place in DSM web folder or use Web Station`,
      `Access via: http://your-nas:port/${cfg.package.toLowerCase()}/`,
      `Run: synocat pack ${cfg.package}`,
    ];
  }

  private entryPoint(cfg: ScaffoldConfig): string {
    const title = cfg.package;
    const description = cfg.description || 'A simple HTML web interface';
    
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
        <div class="card">
            <div class="header">
                <h1>${title}</h1>
                <p class="version">v${cfg.version}</p>
            </div>
            
            <div class="content">
                <div class="language-selector">
                    <label data-i18n="language">语言:</label>
                    <select id="languageSelect">
                        <option value="zh">中文</option>
                        <option value="en">English</option>
                    </select>
                </div>
                
                <p class="description" data-i18n="description">${description}</p>
                
                <div id="message" class="message" style="display: none;"></div>
                
                <form id="greetingForm" class="form">
                    <div class="form-group">
                        <label for="name" data-i18n="name">您的姓名:</label>
                        <input type="text" id="name" name="name" required 
                               placeholder="" data-i18n-placeholder="name">
                    </div>
                    <button type="submit" class="btn" data-i18n="submit">提交</button>
                </form>
                
                <div id="result" class="result" style="display: none;"></div>
            </div>
            
            <div class="footer">
                <p>&copy; <span id="currentYear"></span> ${title}</p>
            </div>
        </div>
    </div>
    
    <script src="script.js"></script>
</body>
</html>`;
  }

  private styles(cfg: ScaffoldConfig): string {
    return `/* ${cfg.package} - Main Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.container {
    width: 100%;
    max-width: 500px;
}

.card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    animation: fadeIn 0.5s ease-out;
}

.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    text-align: center;
}

.header h1 {
    font-size: 28px;
    margin-bottom: 8px;
    font-weight: 600;
}

.version {
    font-size: 12px;
    opacity: 0.8;
}

.content {
    padding: 30px;
}

.language-selector {
    margin-bottom: 20px;
    text-align: right;
}

.language-selector label {
    margin-right: 8px;
    color: #666;
    font-size: 14px;
}

.language-selector select {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    font-size: 14px;
    cursor: pointer;
}

.description {
    color: #666;
    line-height: 1.6;
    margin-bottom: 24px;
    text-align: center;
}

.message {
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: center;
    animation: slideIn 0.3s ease-out;
}

.message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.result {
    margin-top: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    text-align: center;
    animation: slideIn 0.3s ease-out;
    font-size: 18px;
    font-weight: 500;
    color: #667eea;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 500;
}

.form-group input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s;
}

.form-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn:active {
    transform: translateY(0);
}

.footer {
    background: #f8f9fa;
    padding: 20px;
    text-align: center;
    color: #666;
    font-size: 12px;
    border-top: 1px solid #eee;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .container {
        max-width: 100%;
    }
    
    .header {
        padding: 20px;
    }
    
    .header h1 {
        font-size: 24px;
    }
    
    .content {
        padding: 20px;
    }
    
    .btn {
        padding: 10px;
    }
}`;
  }

  private script(cfg: ScaffoldConfig): string {
    return `// ${cfg.package} - Main JavaScript
const translations = {
    zh: {
        title: '${cfg.package}',
        description: '${cfg.description || '一个简单的 HTML 网页界面'}',
        language: '语言:',
        name: '您的姓名:',
        submit: '提交',
        greeting: '你好',
        success: '提交成功！',
        error: '请输入您的姓名'
    },
    en: {
        title: '${cfg.package}',
        description: '${cfg.description || 'A simple HTML web interface'}',
        language: 'Language:',
        name: 'Your Name:',
        submit: 'Submit',
        greeting: 'Hello',
        success: 'Submitted successfully!',
        error: 'Please enter your name'
    }
};

let currentLang = 'zh';

// 更新页面语言
function updateLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    
    // 更新所有带 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
    
    // 更新 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) {
            el.placeholder = t[key];
        }
    });
    
    // 更新标题
    document.title = t.title;
}

// 显示消息
function showMessage(text, type = 'success') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = \`message \${type}\`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}

// 显示结果
function showResult(name) {
    const t = translations[currentLang];
    const resultEl = document.getElementById('result');
    resultEl.textContent = \`\${t.greeting}, \${name}!\`;
    resultEl.style.display = 'block';
    
    setTimeout(() => {
        resultEl.style.display = 'none';
    }, 5000);
}

// 处理表单提交
function handleSubmit(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('name');
    const name = nameInput.value.trim();
    const t = translations[currentLang];
    
    if (!name) {
        showMessage(t.error, 'error');
        return;
    }
    
    // 显示成功消息
    showMessage(t.success, 'success');
    
    // 显示问候语
    showResult(name);
    
    // 可选：清空表单
    nameInput.value = '';
}

// 设置当前年份
function setCurrentYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 设置年份
    setCurrentYear();
    
    // 设置语言选择器
    const langSelect = document.getElementById('languageSelect');
    langSelect.addEventListener('change', (e) => {
        updateLanguage(e.target.value);
    });
    
    // 初始化语言
    updateLanguage('zh');
    
    // 绑定表单提交
    const form = document.getElementById('greetingForm');
    form.addEventListener('submit', handleSubmit);
    
    // 添加输入框焦点效果
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });
});`;
  }

  private readme(cfg: ScaffoldConfig): string {
    const packageName = cfg.package.toLowerCase();
    
    return `# ${cfg.package}

${cfg.description || 'A simple HTML/CSS/JS web interface for Synology DSM'}

## Features

- ✅ Pure HTML/CSS/JS - No backend required
- ✅ Multi-language support (中文/English)
- ✅ Responsive design
- ✅ Form validation
- ✅ Animated UI elements
- ✅ Client-side storage ready

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

1. Select your preferred language (中文/English)
2. Enter your name in the input field
3. Click submit to see a personalized greeting

## File Structure

\`\`\`
src/
├── index.html    # Main HTML structure
├── style.css     # Styling and animations
├── script.js     # Client-side logic
└── README.md     # Documentation
\`\`\`

## Customization

### Modify Colors

Edit \`style.css\` to change the gradient colors:

\`\`\`css
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
\`\`\`

### Add More Languages

Edit \`script.js\` and add translations:

\`\`\`javascript
const translations = {
    'jp': {
        title: 'タイトル',
        description: '説明',
        // ... add more translations
    }
};
\`\`\`

### Add More Features

- Local storage for saving preferences
- Fetch API for backend communication
- Canvas animations
- Charts and data visualization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - All rights reserved`;
  }
}