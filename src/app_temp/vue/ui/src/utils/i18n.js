// 获取当前 DSM 语言
export function getCurrentLang() {
  // 从 DSM 环境获取语言设置
  if (typeof SYNO !== 'undefined' && SYNO.Env && SYNO.Env.getLang) {
    return SYNO.Env.getLang();
  }
  // 默认返回英文
  return 'enu';
}

// 获取字符串
export function getString(section, key, fallback = '') {
  const lang = getCurrentLang();
  
  if (typeof __STRINGS__ !== 'undefined' && __STRINGS__[lang] && __STRINGS__[lang][section]) {
    return __STRINGS__[lang][section][key] || fallback || key;
  }
  
  return fallback || key;
}

// Vue 插件
export default {
  install(Vue) {
    Vue.prototype.$t = getString;
    Vue.prototype.$lang = getCurrentLang;
    
    // 添加全局过滤器
    Vue.filter('translate', (value) => {
      if (typeof value === 'string' && value.includes('.')) {
        const [section, key] = value.split('.');
        return getString(section, key);
      }
      return value;
    });
  }
};