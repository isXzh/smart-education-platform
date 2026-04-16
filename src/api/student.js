import http from "@/utils/http.js";
// 学生管理
export default {
  // 修改学生
  async update(id, data) {
    return await http.put(`/api/base/student/${id}`, data);
  },
  // 删除学生
  async delete(id) {
    return await http.delete(`/api/base/student/${id}`);
  },
  // 新增学生
  async add(data) {
    return await http.post("/api/base/student", data);
  },
  // 导入学生
  async importStudents(data) {
    return await http.post("/api/base/student/import", data);
  },
  // 修改学生状态
  async updateStatus(id, status) {
    return await http.patch(`/api/base/student/${id}/status`, null, {
      params: { status },
    });
  },
  // 分页查询学生
  async page(params) {
    return await http.get("/api/base/student/page", params);
  },
  // 获取学生列表
  async list() {
    return await http.get("/api/base/student/list");
  },
  // 导出学生
  async exportStudents(params) {
    return await http.get("/api/base/student/export", params);
  },
};
