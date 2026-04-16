import http from "@/utils/http.js";
// 系统配置
export default {
  // 更新单个配置
  async update(id, data) {
    return await http.put(`/api/system/config/${id}`, data);
  },
  // 批量更新配置
  async batchUpdate(data) {
    return await http.put("/api/system/config/batch", data);
  },
  // 刷新配置缓存
  async refreshCache() {
    return await http.post("/api/system/config/refresh-cache");
  },
  // 根据key获取配置值
  async getValueByKey(key) {
    return await http.get(`/api/system/config/${key}`);
  },
  // 获取配置列表
  async list() {
    return await http.get("/api/system/config/list");
  },
  // 获取配置列表（按类型分组）
  async listGroupByType() {
    return await http.get("/api/system/config/list/group");
  },
};
