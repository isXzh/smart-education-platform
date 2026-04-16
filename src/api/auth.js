import http from "@/utils/http.js";
// 认证管理
export default {
  // 用户注册
  async register(data) {
    return await http.post("/api/auth/register", data);
  },
  // 刷新Token
  async refreshToken(data) {
    return await http.post("/api/auth/refresh", data);
  },
  // 退出登录
  async logout() {
    return await http.post("/api/auth/logout");
  },
  // 用户登录
  async login(data) {
    return await http.post("/api/auth/login", data);
  },
  // 获取当前用户信息
  async getUserInfo() {
    return await http.get("/api/auth/user-info");
  },
};
