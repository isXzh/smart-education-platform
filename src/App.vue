<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "App",
  beforeDestroy() {
    // 移除监听器
    // window.removeEventListener('beforeunload', this.handleBeforeUnload);
  },
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
