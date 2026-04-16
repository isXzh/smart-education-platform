import http from "@/utils/http.js";
// 教室管理
export default {
  // 获取教室详情
  async getById(id) {
    return await http.get(`/api/base/classroom/${id}`);
  },
  // 修改教室
  async update(id, data) {
    return await http.put(`/api/base/classroom/${id}`, data);
  },
  // 删除教室
  async delete(id) {
    return await http.delete(`/api/base/classroom/${id}`);
  },
  // 新增教室
  async add(data) {
    return await http.post("/api/base/classroom", data);
  },
  // 绑定设备到教室
  async bindDevice(classroomId, deviceId) {
    return await http.post("/api/base/classroom/device/bind", null, {
      params: { classroomId, deviceId },
    });
  },
  // 修改教室状态
  async updateStatus(id, status) {
    return await http.patch(`/api/base/classroom/${id}/status`, null, {
      params: { status },
    });
  },
  // 查询教室绑定的设备
  async getDevices(classroomId) {
    return await http.get(`/api/base/classroom/${classroomId}/device`);
  },
  // 分页查询教室
  async page(params) {
    return await http.get("/api/base/classroom/page", params);
  },
  // 获取教室列表
  async list() {
    return await http.get("/api/base/classroom/list");
  },
  // 根据组织获取教室列表
  async listByOrg(orgId) {
    return await http.get(`/api/base/classroom/list/org/${orgId}`);
  },
  // 解绑教室设备
  async unbindDevice(classroomId, deviceId) {
    return await http.delete("/api/base/classroom/device/unbind", null, {
      params: { classroomId, deviceId },
    });
  },
  // 批量删除教室
  async batchDelete(ids) {
    return await http.delete("/api/base/classroom/batch", ids);
  },
};
