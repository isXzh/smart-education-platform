import http from "@/utils/http.js";
// 设备监控
export default {
  // 设备心跳上报
  async heartbeat(params) {
    return await http.post("/api/device/heartbeat", null, { params });
  },
  // 设备操作日志分页
  async logPage(params) {
    return await http.get("/api/device/log/page", params);
  },
  // 导出操作日志
  async exportLog(params) {
    return await http.get("/api/device/log/export", params);
  },
  // 设备卡片看板数据
  async getCardData() {
    return await http.get("/api/device/card");
  },
  // 异常设备列表
  async getAbnormalDevices() {
    return await http.get("/api/device/abnormal");
  },
};
