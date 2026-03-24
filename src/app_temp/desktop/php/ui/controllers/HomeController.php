<?php
// 确保文件不会被重复加载
if (!class_exists('HomeController')) {

    class HomeController extends Controller
    {
        public function index()
        {
            $data = [
                'title' => '安装成功',
                'message' => '恭喜！您的PHP模块化项目已成功安装并运行！',
                'server_time' => date('Y-m-d H:i:s'),
                'php_version' => phpversion(),
                'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
            ];
            
            $this->view('home.index', $data);
        }
        
        public function installSuccess()
        {
            echo "<h1>✅ 安装验证成功！</h1>";
            echo "<p>您的模块化框架运行正常。</p>";
            echo "<p><a href='/'>返回首页</a></p>";
        }
    }
}