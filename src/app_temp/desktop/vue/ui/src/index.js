import Vue from 'vue';
import VueI18n from 'vue-i18n';
import App from './App.vue';
import './styles/tailwind.css'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);
Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'enu',  // 默认语言
  messages: {
    enu: {
      package: {
        package_name: 'Synocat Package Manager',
        package_description: 'Your package has been successfully installed and is ready to use.'
      },
      success: {
        install_success: 'Installation Successful!',
        copy_success: 'Copied to clipboard!'
      },
      error: {
        copy_failed: 'Failed to copy to clipboard'
      },
      wizard: {
        quick_commands: 'Quick Commands',
        help_title: 'Help - Quick Guide',
        create_package: 'Create Package',
        validate_package: 'Validate Package',
        pack_package: 'Pack Package'
      },
      common: {
        copy: 'Copy',
        close: 'Close'
      }
    },
    chs: {
      package: {
        package_name: 'Synocat 包管理器',
        package_description: '您的软件包已成功安装，可以开始使用了。'
      },
      success: {
        install_success: '安装成功！',
        copy_success: '已复制到剪贴板！'
      },
      error: {
        copy_failed: '复制失败'
      },
      wizard: {
        quick_commands: '快速命令',
        help_title: '帮助 - 快速指南',
        create_package: '创建软件包',
        validate_package: '验证软件包',
        pack_package: '打包软件包'
      },
      common: {
        copy: '复制',
        close: '关闭'
      }
    },
    cht: {
      package: {
        package_name: 'Synocat 套件管理器',
        package_description: '您的軟體套件已成功安裝，可以開始使用了。'
      },
      success: {
        install_success: '安裝成功！',
        copy_success: '已複製到剪貼簿！'
      },
      error: {
        copy_failed: '複製失敗'
      },
      wizard: {
        quick_commands: '快速指令',
        help_title: '幫助 - 快速指南',
        create_package: '建立套件',
        validate_package: '驗證套件',
        pack_package: '打包套件'
      },
      common: {
        copy: '複製',
        close: '關閉'
      }
    },
    jpn: {
      package: {
        package_name: 'Synocat パッケージマネージャー',
        package_description: 'パッケージが正常にインストールされ、使用可能になりました。'
      },
      success: {
        install_success: 'インストール成功！',
        copy_success: 'クリップボードにコピーしました！'
      },
      error: {
        copy_failed: 'コピーに失敗しました'
      },
      wizard: {
        quick_commands: 'クイックコマンド',
        help_title: 'ヘルプ - クイックガイド',
        create_package: 'パッケージを作成',
        validate_package: 'パッケージを検証',
        pack_package: 'パッケージをパック'
      },
      common: {
        copy: 'コピー',
        close: '閉じる'
      }
    },
    kor: {
      package: {
        package_name: 'Synocat 패키지 관리자',
        package_description: '패키지가 성공적으로 설치되어 사용할 준비가 되었습니다.'
      },
      success: {
        install_success: '설치 성공!',
        copy_success: '클립보드에 복사됨!'
      },
      error: {
        copy_failed: '복사 실패'
      },
      wizard: {
        quick_commands: '빠른 명령어',
        help_title: '도움말 - 빠른 가이드',
        create_package: '패키지 생성',
        validate_package: '패키지 검증',
        pack_package: '패키지 압축'
      },
      common: {
        copy: '복사',
        close: '닫기'
      }
    }
  }
});

// 开发环境直接挂载
if (process.env.NODE_ENV === 'development') {
  new Vue({
    i18n,
    render: h => h(App)
  }).$mount('#app');
}

// Synology DSM 应用注册
if (typeof SYNO !== 'undefined') {
  SYNO.namespace('com.synocat.sykit');
  
  com.synocat.sykit.Instance = Vue.extend({
    components: { App },
    template: '<App/>',
    i18n,
    data() {
      return {
        appVersion: '0.0.1',
        appName: 'Sykit UI'
      };
    }
  });
}