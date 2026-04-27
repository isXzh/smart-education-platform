// vue.config.js
module.exports = {
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
