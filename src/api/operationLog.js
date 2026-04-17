import http from "@/utils/http.js";
// 操作日志
export default {
  // 获取日志详情
  async getById(id) {
    return await http.get(`/api/system/log/${id}`);
  },
  // 获取模块列表
  async modules() {
    return await http.get("/api/system/log/modules");
  },
  // 分页查询操作日志
  async page(params) {
    return await http.post("/api/system/log/page", params);
  },
  // 导出操作日志
  async exportLogs(params) {
    return await http.getFile("/api/system/log/export", params);
  },
  // 清空日志
  async clear(keepDays) {
    return await http.delete("/api/system/log/clear", null, {
      params: { keepDays },
    });
  },
};
