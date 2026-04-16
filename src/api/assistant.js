import http from "@/utils/http.js";
// 互动助手
export default {
  // 互动会话列表
  async sessions(params) {
    return await http.get("/api/interactive/sessions", params);
  },
  // 创建互动会话
  async createSession(data) {
    return await http.post("/api/interactive/sessions", data);
  },
  // 结束互动
  async stop(id) {
    return await http.post(`/api/interactive/sessions/${id}/stop`);
  },
  // 开始互动
  async start(id) {
    return await http.post(`/api/interactive/sessions/${id}/start`);
  },
  // 加入互动
  async join(id, data) {
    return await http.post(`/api/interactive/sessions/${id}/join`, data);
  },
  // 今日课堂
  async today() {
    return await http.get("/api/interactive/today");
  },
  // 会话详情
  async getSession(id) {
    return await http.get(`/api/interactive/sessions/${id}`);
  },
  // 会话状态
  async status(id) {
    return await http.get(`/api/interactive/sessions/${id}/status`);
  },
};
