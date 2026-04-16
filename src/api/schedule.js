import http from "@/utils/http.js";
// 排课管理
export default {
  // 获取排课详情
  async getById(id) {
    return await http.get(`/api/schedule/${id}`);
  },
  // 修改排课
  async update(id, data) {
    return await http.put(`/api/schedule/${id}`, data);
  },
  // 删除排课
  async delete(id) {
    return await http.delete(`/api/schedule/${id}`);
  },
  // 新增排课
  async add(data) {
    return await http.post("/api/schedule", data);
  },
  // 导入排课
  async importSchedules(data) {
    return await http.post("/api/schedule/import", data);
  },
  // 批量创建排课
  async batchAdd(data) {
    return await http.post("/api/schedule/batch", data);
  },
  // 分页查询排课
  async page(params) {
    return await http.get("/api/schedule/page", params);
  },
  // 导出排课
  async exportSchedules() {
    return await http.get("/api/schedule/export");
  },
};
