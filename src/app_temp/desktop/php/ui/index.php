<?php
// 开启错误显示（开发环境）
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 定义根目录
define('ROOT_PATH', __DIR__);
define('DS', DIRECTORY_SEPARATOR);

// 自动加载（修复版）
spl_autoload_register(function($className) {
    // 定义类文件可能的路径
    $paths = [
        ROOT_PATH . DS . 'core' . DS,
        ROOT_PATH . DS . 'controllers' . DS
    ];
    
    foreach ($paths as $path) {
        $file = $path . $className . '.php';
        if (file_exists($file) && is_file($file)) {
            require_once $file;
            return;
        }
    }
});

// 加载配置
if (file_exists(ROOT_PATH . DS . 'config' . DS . 'config.php')) {
    require_once ROOT_PATH . DS . 'config' . DS . 'config.php';
}

// 启动路由
try {
    $router = new Router();
    $router->dispatch();
} catch (Exception $e) {
    die('Error: ' . $e->getMessage());
}