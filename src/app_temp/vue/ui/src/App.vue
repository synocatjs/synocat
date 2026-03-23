<template>
  <div id="app">
    <el-container class="min-h-screen">
      <el-header class="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div class="flex justify-between items-center h-full px-4">
          <div class="flex items-center gap-3">
            <i class="el-icon-cat text-2xl"></i>
            <h1 class="text-xl font-bold">{{ $t('package.package_name') }}</h1>
            <el-tag size="small" type="info" effect="plain">v{{ version }}</el-tag>
          </div>
          <div class="flex gap-2">
            <el-dropdown @command="changeLanguage">
              <el-button icon="el-icon-edit" circle size="small" class="bg-white/20 border-none text-white">
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
              icon="el-icon-question" 
              circle 
              size="small"
              @click="showHelp = true"
              class="bg-white/20 border-none text-white hover:bg-white/30"
            ></el-button>
          </div>
        </div>
      </el-header>

      <el-main class="bg-gradient-to-br from-purple-600 to-indigo-700 py-8">
        <el-card class="max-w-4xl mx-auto" :body-style="{ padding: '2rem' }">
          <!-- 成功图标 -->
          <div class="text-center mb-8">
            <i class="el-icon-circle-check text-green-500 text-6xl mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ $t('success.install_success') }}</h2>
            <p class="text-gray-600">{{ $t('package.package_description') }}</p>
          </div>

          <!-- 快速命令 -->
          <el-card shadow="never" class="bg-gray-50">
            <div slot="header">
              <i class="el-icon-terminal"></i>
              <span class="ml-2">{{ $t('wizard.quick_commands') }}</span>
            </div>
            <div class="space-y-3">
              <div v-for="cmd in commands" :key="cmd.text" class="flex gap-2">
                <el-input 
                  :value="cmd.text" 
                  readonly 
                  size="small"
                  class="flex-1"
                ></el-input>
                <el-button 
                  size="small" 
                  icon="el-icon-copy-document" 
                  @click="copyCommand(cmd.text)"
                >
                  {{ $t('common.copy') }}
                </el-button>
              </div>
            </div>
          </el-card>
        </el-card>
      </el-main>
    </el-container>

    <!-- 帮助对话框 -->
    <el-dialog :title="$t('wizard.help_title')" :visible.sync="showHelp" width="30%">
      <div class="space-y-3 text-gray-600">
        <p>🔹 <strong>{{ $t('wizard.create_package') }}</strong>: synocat create</p>
        <p>🔹 <strong>{{ $t('wizard.validate_package') }}</strong>: synocat validate ./my-package</p>
        <p>🔹 <strong>{{ $t('wizard.pack_package') }}</strong>: synocat pack ./my-package</p>
      </div>
      <span slot="footer">
        <el-button type="primary" @click="showHelp = false">{{ $t('common.close') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      version: '1.0.0',
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
      // 切换 i18n 语言
      this.$i18n.locale = lang;
      // 通知 DSM 语言变更
      if (typeof SYNO !== 'undefined' && SYNO.Env && SYNO.Env.setLang) {
        SYNO.Env.setLang(lang);
      }
    },
    
    copyCommand(command) {
      navigator.clipboard.writeText(command).then(() => {
        this.$message.success(this.$t('success.copy_success'));
      }).catch(() => {
        this.$message.error(this.$t('error.copy_failed'));
      });
    }
  },
  mounted() {
    // 获取当前 DSM 语言并设置 i18n
    if (typeof SYNO !== 'undefined' && SYNO.Env && SYNO.Env.getLang) {
      const dsmLang = SYNO.Env.getLang();
      this.currentLang = dsmLang;
      this.$i18n.locale = dsmLang;
    }
  }
};
</script>