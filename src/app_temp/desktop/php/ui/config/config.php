<?php
// 应用配置
define('APP_NAME', 'MyApp');
define('APP_VERSION', '1.0.0');

// 数据库配置（示例）
$config = [
    'database' => [
        'host' => 'localhost',
        'name' => 'myapp',
        'user' => 'root',
        'pass' => '',
        'charset' => 'utf8mb4'
    ],
    'app' => [
        'debug' => true,
        'timezone' => 'Asia/Shanghai'
    ]
];

// 设置时区
date_default_timezone_set($config['app']['timezone']);

return $config;