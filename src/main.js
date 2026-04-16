import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import axios from "axios";
import "@/assets/styles/global.css";
import "@/assets/styles/tailwind.css";
import "@/assets/styles/theme.css";
import "@/assets/styles/custom.css";
import "@/assets/styles/common.scss";
import request from "./utils/request";

Vue.config.productionTip = false;
Vue.prototype.axios = axios;

// 设置默认 businessURL，防止异步加载时未定义
// window.businessURL = "http://120.55.72.186:8081";

// 异步加载配置文件，覆盖默认值
axios.get("/static/config.json").then((res) => {
  window.businessURL = res.data.api.businessURL;
});
// 全局过滤器
Vue.filter("date", function (value, format = "yyyy-MM-dd") {
  if (!value) return "";
  // 这里可以根据需要添加日期格式化逻辑
  return value;
});

Vue.filter("status", function (value) {
  const statusMap = {
    pending: "待处理",
    processing: "处理中",
    completed: "已完成",
    failed: "失败",
  };
  return statusMap[value] || value;
});

// 注册全局组件
Vue.component("PageTitle", {
  props: ["title"],
  template: `
    <div class="page-header">
      <h1 class="page-title">{{ title }}</h1>
      <p class="page-subtitle">管理相关内容和功能</p>
    </div>
  `,
});

Vue.use(ElementUI);
// ✅ 关键修改：等待配置加载完成后再启动应用
async function bootstrap() {
  try {
    // 加载配置文件
    const response = await axios.get("/static/config.json");
    window.businessURL = response.data.api.businessURL;
    console.log("配置加载完成:", window.businessURL);

    // 配置加载完成后启动应用
    new Vue({
      router,
      store,
      render: (h) => h(App),
    }).$mount("#app");
  } catch (error) {
    console.error("配置加载失败，使用默认配置:", error);
    // 降级：使用默认配置
    window.businessURL = "http://120.55.72.186:8081";

    new Vue({
      router,
      store,
      render: (h) => h(App),
    }).$mount("#app");
  }
}

// 启动应用
bootstrap();
// new Vue({
//   router,
//   store,
//   render: (h) => h(App),
// }).$mount("#app");
