import type { IScaffoldTemplate } from './base.template';
import type { GeneratedFile, ScaffoldConfig } from '../../../types/';

export class PhpUiTemplate implements IScaffoldTemplate {
  readonly type = 'desktop-php';

  generate(cfg: ScaffoldConfig): GeneratedFile[] {
    return [
      { path: 'src/index.php', content: this.entryPoint(cfg) },
      { path: 'src/style.css', content: this.styles(cfg) },
      { path: 'src/README.md', content: this.readme(cfg) },
    ];
  }

  getNextSteps(cfg: ScaffoldConfig): string[] {
    return [
      `Edit src/index.php to implement your UI logic`,
      `Edit src/style.css to customize the styling`,
      `Place in DSM web folder or use Web Station`,
      `Access via: http://your-nas:port/${cfg.package.toLowerCase()}/`,
      `Run: synocat pack ${cfg.package}`,
    ];
  }

  private entryPoint(cfg: ScaffoldConfig): string {
    const title = cfg.package;
    const description = cfg.description || 'A simple PHP web interface';
    
    return `<?php
/**
 * ${title} - Web Interface
 * Version: ${cfg.version}
 * Description: ${description}
 */

// 获取当前语言
$lang = isset($_GET['lang']) ? $_GET['lang'] : 'en';
$translations = [
    'en' => [
        'title' => '${title}',
        'welcome' => 'Welcome',
        'description' => '${description}',
        'submit' => 'Submit',
        'name' => 'Your Name',
        'greeting' => 'Hello',
        'language' => 'Language'
    ],
    'zh' => [
        'title' => '${title}',
        'welcome' => '欢迎',
        'description' => '${description}',
        'submit' => '提交',
        'name' => '您的姓名',
        'greeting' => '你好',
        'language' => '语言'
    ]
];

$t = $translations[$lang] ?? $translations['en'];

// 处理表单提交
$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['name'])) {
    $name = htmlspecialchars($_POST['name']);
    $message = "{$t['greeting']}, {$name}!";
}
?>
<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $t['title']; ?></title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1><?php echo $t['title']; ?></h1>
                <p class="version">v<?php echo ${cfg.version}; ?></p>
            </div>
            
            <div class="content">
                <div class="language-selector">
                    <label><?php echo $t['language']; ?>:</label>
                    <select onchange="location.href='?lang='+this.value">
                        <option value="en" <?php echo $lang === 'en' ? 'selected' : ''; ?>>English</option>
                        <option value="zh" <?php echo $lang === 'zh' ? 'selected' : ''; ?>>中文</option>
                    </select>
                </div>
                
                <p class="description"><?php echo $t['description']; ?></p>
                
                <?php if ($message): ?>
                <div class="message success">
                    <?php echo $message; ?>
                </div>
                <?php endif; ?>
                
                <form method="POST" class="form">
                    <div class="form-group">
                        <label for="name"><?php echo $t['name']; ?>:</label>
                        <input type="text" id="name" name="name" required 
                               placeholder="<?php echo $t['name']; ?>">
                    </div>
                    <button type="submit" class="btn"><?php echo $t['submit']; ?></button>
                </form>
            </div>
            
            <div class="footer">
                <p>&copy; <?php echo date('Y'); ?> ${title}</p>
            </div>
        </div>
    </div>
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

  private readme(cfg: ScaffoldConfig): string {
    const packageName = cfg.package.toLowerCase();
    
    return `# ${cfg.package}

${cfg.description || 'A simple PHP web interface for Synology DSM'}

## Features

- ✅ Clean and modern UI design
- ✅ Multi-language support (English/中文)
- ✅ Responsive layout
- ✅ Form handling with validation
- ✅ Success message display

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

### For Testing

1. Start PHP built-in server:
   \`\`\`bash
   cd src
   php -S localhost:8000
   \`\`\`

2. Open browser:
   \`\`\`
   http://localhost:8000
   \`\`\`

## Usage

1. Select your preferred language (English/中文)
2. Enter your name in the input field
3. Click submit to see a personalized greeting

## File Structure

\`\`\`
src/
├── index.php      # Main application logic
├── style.css      # Styling and animations
└── README.md      # Documentation
\`\`\`

## Customization

### Modify Colors

Edit \`style.css\` to change the gradient colors:

\`\`\`css
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
\`\`\`

### Add More Languages

Edit \`index.php\` and add translations:

\`\`\`php
$translations = [
    'jp' => [
        'title' => 'タイトル',
        // ... add more translations
    ]
];
\`\`\`

### Add More Features

- Database integration
- User authentication
- File upload
- API endpoints

## Requirements

- PHP 7.4 or higher
- Web server (Apache/Nginx) or DSM Web Station

## License

Proprietary - All rights reserved`;
  }
}