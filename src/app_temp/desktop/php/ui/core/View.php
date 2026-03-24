<?php
// 确保文件不会被重复加载
if (!class_exists('View')) {

    class View
    {
        private $data = [];
        
        public function assign($key, $value)
        {
            $this->data[$key] = $value;
            return $this;
        }
        
        public function render($viewName)
        {
            $viewFile = ROOT_PATH . DS . 'views' . DS . str_replace('.', DS, $viewName) . '.php';
            
            if (file_exists($viewFile)) {
                extract($this->data);
                require_once $viewFile;
            } else {
                die("View not found: {$viewName}");
            }
        }
    }
}