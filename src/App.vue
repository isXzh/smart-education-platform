<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import configLoader from '@/utils/config';
  export default {
    name: 'App',
    beforeDestroy() {
      // 移除监听器
      // window.removeEventListener('beforeunload', this.handleBeforeUnload);
    },
    data() {
      return {
        loading: true,
        error: null,
        config: null,
      };
    },
    // async created() {
    //   try {
    //     // 在应用启动时加载配置
    //     this.config = await configLoader.loadConfig();
    //     this.loading = false;

    //     // 将配置挂载到 Vue 原型上，方便全局使用
    //     Vue.prototype.$appConfig = this.config;

    //     // 或者存到 Vuex
    //     // this.$store.commit('setConfig', this.config)
    //   } catch (err) {
    //     this.error = err.message;
    //     this.loading = false;
    //     console.error('应用启动失败:', err);
    //   }
    // },
    methods: {
      // handleBeforeUnload() {
      //   // 页面关闭时移除 token（刷新也会触发）
      //   sessionStorage.removeItem('token');
      // }
    },
  };
</script>

<style>
  /* App级别样式补充 */
</style>
