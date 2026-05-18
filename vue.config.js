// vue.config.js
module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/smartedu-admin/' : '/',
  // 如果需要路由不带 /smartedu-admin 前缀（如 https://www.xtxk.top:9833/login），请使用下面的配置：
  // publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  // ... 你原有的其他配置（如 devServer.proxy 等）
  assetsDir: '', // 添加这行
  devServer: {
    // ... 你原有的 devServer 配置

    // 重点：添加 client 配置
    client: {
      // 将 overlay 设置为 false，即可完全关闭报错遮罩
      overlay: false,
    },
  },
};
