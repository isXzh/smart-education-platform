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
  // 修改自动入会提前时间
  async updateAutoJoinMinutes(data) {
    return await http.put("/api/system/config/auto-join-minutes", data);
  },
  // 更新上课提醒提前时间
  async updateReminderMinutes(data) {
    return await http.put("/api/system/config/class-reminder-minutes", data);
  },
  // 更新平台名称和简介
  async updatePlatformInfo(data) {
    return await http.put2("/api/system/config/platform-info", data);
  },
  // 刷新配置缓存
  async refreshCache() {
    return await http.post("/api/system/config/refresh-cache");
  },
  // 根据key获取配置值
  async getValueByKey(key) {
    return await http.get(`/api/system/config/${key}`);
  },
  // 获取平台图片信息
  async getPlatformImage() {
    return await http.get(`/api/system/config/platform-image`);
  },
  // 获取配置列表
  async list() {
    return await http.get("/api/system/config/list");
  },
  // 获取配置列表（按类型分组）
  async listGroupByType() {
    return await http.get("/api/system/config/list/group");
  },
  // 上传平台Logo图片
  async uploadLogo(data) {
    return await http.postFile("/api/system/config/upload-logo", data);
  },
};
