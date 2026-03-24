<?php
// 确保文件不会被重复加载
if (!class_exists('Router')) {

    class Router
    {
        private $routes = [];
        
        public function __construct()
        {
            // 定义路由规则
            $this->routes = [
                '/' => ['HomeController', 'index'],
                '/home' => ['HomeController', 'index'],
                '/install/success' => ['HomeController', 'installSuccess']
            ];
        }
        
        public function dispatch()
        {
            $url = $_SERVER['REQUEST_URI'];
            $url = strtok($url, '?'); // 去除查询参数
            $url = rtrim($url, '/');
            
            if (empty($url)) {
                $url = '/';
            }
            
            // 匹配路由
            if (isset($this->routes[$url])) {
                $controllerName = $this->routes[$url][0];
                $methodName = $this->routes[$url][1];
                
                if (class_exists($controllerName)) {
                    $controller = new $controllerName();
                    if (method_exists($controller, $methodName)) {
                        $controller->$methodName();
                    } else {
                        $this->show404();
                    }
                } else {
                    $this->show404();
                }
            } else {
                $this->show404();
            }
        }
        
        private function show404()
        {
            header("HTTP/1.0 404 Not Found");
            echo "<h1>404 - Page Not Found</h1>";
            echo "<p>The requested page does not exist.</p>";
            echo "<p><a href='/'>Go to Homepage</a></p>";
            exit;
        }
    }
}