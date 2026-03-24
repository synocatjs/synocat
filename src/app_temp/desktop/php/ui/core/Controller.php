<?php
// 确保文件不会被重复加载
if (!class_exists('Controller')) {

    class Controller
    {
        protected function view($viewName, $data = [])
        {
            $viewFile = ROOT_PATH . DS . 'views' . DS . str_replace('.', DS, $viewName) . '.php';
            
            if (file_exists($viewFile)) {
                // 提取数据到变量
                extract($data);
                require_once $viewFile;
            } else {
                die("View not found: {$viewName}");
            }
        }
        
        protected function json($data)
        {
            header('Content-Type: application/json');
            echo json_encode($data);
            exit;
        }
        
        protected function redirect($url)
        {
            header("Location: {$url}");
            exit;
        }
    }
}