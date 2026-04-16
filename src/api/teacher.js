import http from "@/utils/http.js";
// 教师管理
export default {
  // 修改教师
  async update(id, data) {
    return await http.put(`/api/base/teacher/${id}`, data);
  },
  // 删除教师
  async delete(id) {
    return await http.delete(`/api/base/teacher/${id}`);
  },
  // 新增教师
  async add(data) {
    return await http.post("/api/base/teacher", data);
  },
  // 导入教师
  async importTeachers(data) {
    return await http.post("/api/base/teacher/import", data);
  },
  // 修改教师状态
  async updateStatus(id, status) {
    return await http.patch(`/api/base/teacher/${id}/status`, null, {
      params: { status },
    });
  },
  // 分页查询教师
  async page(params) {
    return await http.get("/api/base/teacher/page", params);
  },
  // 获取教师列表
  async list() {
    return await http.get("/api/base/teacher/list");
  },
  // 导出教师
  async exportTeachers(params) {
    return await http.get("/api/base/teacher/export", params);
  },
};
