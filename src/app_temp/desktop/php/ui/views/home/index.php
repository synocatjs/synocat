<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($title ?? '安装成功'); ?> - 模块化PHP应用</title>
    <style>
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
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            width: 100%;
            overflow: hidden;
            animation: fadeInUp 0.6s ease-out;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header .success-icon {
            font-size: 4em;
            margin-bottom: 10px;
        }
        
        .content {
            padding: 40px;
        }
        
        .message {
            background: #f0fdf4;
            border-left: 4px solid #22c55e;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            color: #166534;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .info-card {
            background: #f9fafb;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
        }
        
        .info-card h3 {
            color: #374151;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        
        .info-card p {
            color: #1f2937;
            font-size: 1.125rem;
            font-weight: 600;
        }
        
        .modules {
            background: #fef3c7;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
        }
        
        .modules h3 {
            color: #92400e;
            margin-bottom: 15px;
        }
        
        .modules ul {
            list-style: none;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .modules li {
            background: #fffbeb;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.875rem;
            color: #b45309;
            border: 1px solid #fed7aa;
        }
        
        .footer {
            background: #f9fafb;
            padding: 20px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 0.875rem;
        }
        
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        @media (max-width: 640px) {
            .header h1 {
                font-size: 1.75em;
            }
            .content {
                padding: 25px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✅</div>
            <h1><?php echo htmlspecialchars($title ?? '安装成功'); ?></h1>
            <p>您的模块化PHP框架已就绪</p>
        </div>
        
        <div class="content">
            <div class="message">
                <strong>✨ <?php echo htmlspecialchars($message ?? '恭喜！项目安装成功！'); ?></strong>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3>📅 服务器时间</h3>
                    <p><?php echo htmlspecialchars($server_time ?? date('Y-m-d H:i:s')); ?></p>
                </div>
                <div class="info-card">
                    <h3>🐘 PHP 版本</h3>
                    <p><?php echo htmlspecialchars($php_version ?? phpversion()); ?></p>
                </div>
                <div class="info-card">
                    <h3>🌐 服务器</h3>
                    <p><?php echo htmlspecialchars($server_software ?? $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'); ?></p>
                </div>
            </div>
            
            <div class="modules">
                <h3>📦 已加载模块</h3>
                <ul>
                    <li>✅ 路由模块 (Router)</li>
                    <li>✅ 控制器模块 (Controller)</li>
                    <li>✅ 视图模块 (View)</li>
                    <li>✅ 自动加载机制</li>
                    <li>✅ 模块化结构</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="/install/success" class="btn">验证安装 →</a>
            </div>
        </div>
        
        <div class="footer">
            <p>🚀 模块化PHP框架 | 安装时间: <?php echo date('Y-m-d H:i:s'); ?></p>
        </div>
    </div>
</body>
</html>