<template>
  <div id="app">
    <el-container class="min-h-screen">
      <!-- 简洁头部 - 黑白基调 -->
      <el-header class="bg-white border-b border-gray-100 shadow-sm">
        <div class="flex justify-between items-center h-full px-6">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <i class="el-icon-cat text-white text-lg"></i>
            </div>
            <h1 class="text-lg font-medium text-gray-800">{{ $t('package.package_name') }}</h1>
            <el-tag size="mini" type="success" effect="plain">v{{ version }}</el-tag>
          </div>
          <div class="flex gap-2">
            <el-dropdown @command="changeLanguage">
              <el-button size="small" class="border-gray-200 text-gray-600 hover:text-teal-500">
                <i class="el-icon-edit"></i>
                {{ currentLang }}
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="enu">English</el-dropdown-item>
                <el-dropdown-item command="chs">简体中文</el-dropdown-item>
                <el-dropdown-item command="cht">繁體中文</el-dropdown-item>
                <el-dropdown-item command="jpn">日本語</el-dropdown-item>
                <el-dropdown-item command="kor">한국어</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-button 
              size="small"
              icon="el-icon-question" 
              @click="showHelp = true"
              class="border-gray-200 text-gray-600 hover:text-teal-500"
            ></el-button>
          </div>
        </div>
      </el-header>

      <!-- 主内容区 - 青色调背景 -->
      <el-main class="bg-gradient-to-br from-teal-50 to-white py-12">
        <el-card class="max-w-4xl mx-auto shadow-sm border-gray-100" :body-style="{ padding: '2.5rem' }">
          <!-- 成功图标 - 青色主题 -->
          <div class="text-center mb-10">
            <div class="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="el-icon-circle-check text-teal-500 text-4xl"></i>
            </div>
            <h2 class="text-xl font-medium text-gray-800 mb-2">{{ $t('success.install_success') }}</h2>
            <p class="text-gray-500 text-sm">{{ $t('package.package_description') }}</p>
          </div>

          <!-- 快速命令 - 简洁卡片 -->
          <el-card shadow="never" class="bg-gray-50 border-gray-100">
            <div slot="header" class="flex items-center gap-2">
              <i class="el-icon-terminal text-teal-500"></i>
              <span class="text-gray-700 font-medium">{{ $t('wizard.quick_commands') }}</span>
            </div>
            <div class="space-y-3">
              <div v-for="cmd in commands" :key="cmd.text" class="flex gap-2">
                <div class="flex-1 bg-white rounded border border-gray-200 px-3 py-1.5 text-sm font-mono text-gray-600">
                  {{ cmd.text }}
                </div>
                <el-button 
                  size="small" 
                  icon="el-icon-copy-document"
                  @click="copyCommand(cmd.text)"
                  class="border-gray-200 text-teal-500 hover:text-teal-600"
                >
                  {{ $t('common.copy') }}
                </el-button>
              </div>
            </div>
          </el-card>
        </el-card>
      </el-main>
    </el-container>

    <!-- 帮助对话框 - 简洁设计 -->
    <el-dialog :title="$t('wizard.help_title')" :visible.sync="showHelp" width="30%" class="simple-dialog">
      <div class="space-y-3 text-gray-600">
        <div class="flex items-start gap-2">
          <span class="text-teal-500">●</span>
          <div>
            <strong class="text-gray-800">{{ $t('wizard.create_package') }}</strong>
            <p class="text-sm text-gray-500 mt-1">synocat create</p>
          </div>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-teal-500">●</span>
          <div>
            <strong class="text-gray-800">{{ $t('wizard.validate_package') }}</strong>
            <p class="text-sm text-gray-500 mt-1">synocat validate ./my-package</p>
          </div>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-teal-500">●</span>
          <div>
            <strong class="text-gray-800">{{ $t('wizard.pack_package') }}</strong>
            <p class="text-sm text-gray-500 mt-1">synocat pack ./my-package</p>
          </div>
        </div>
      </div>
      <span slot="footer">
        <el-button @click="showHelp = false" class="border-gray-200">{{ $t('common.close') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      version: '0.0.1',
      showHelp: false,
      currentLang: 'enu',
      commands: [
        { text: 'synocat create my-package' },
        { text: 'synocat validate ./my-package' },
        { text: 'synocat pack ./my-package -o ./dist' }
      ]
    };
  },
  methods: {
    changeLanguage(lang) {
      this.currentLang = lang;
      this.$i18n.locale = lang;
      if (typeof SYNO !== 'undefined' && SYNO.Env && SYNO.Env.setLang) {
        SYNO.Env.setLang(lang);
      }
    },
    
    copyCommand(command) {
      navigator.clipboard.writeText(command).then(() => {
        this.$message({
          message: this.$t('success.copy_success'),
          type: 'success',
          duration: 2000
        });
      }).catch(() => {
        this.$message({
          message: this.$t('error.copy_failed'),
          type: 'error',
          duration: 2000
        });
      });
    }
  },
  mounted() {
    if (typeof SYNO !== 'undefined' && SYNO.Env && SYNO.Env.getLang) {
      const dsmLang = SYNO.Env.getLang();
      this.currentLang = dsmLang;
      this.$i18n.locale = dsmLang;
    }
  }
};
</script>