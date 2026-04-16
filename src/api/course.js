import http from "@/utils/http.js";
// 课程管理
export default {
  // 修改课程
  async update(id, data) {
    return await http.put(`/api/base/course/${id}`, data);
  },
  // 删除课程
  async delete(id) {
    return await http.delete(`/api/base/course/${id}`);
  },
  // 新增课程
  async add(data) {
    return await http.post("/api/base/course", data);
  },
  // 导入课程
  async importCourses(data) {
    return await http.post("/api/base/course/import", data);
  },
  // 修改课程状态
  async updateStatus(id, status) {
    return await http.patch(`/api/base/course/${id}/status`, null, {
      params: { status },
    });
  },
  // 分页查询课程
  async page(params) {
    return await http.get("/api/base/course/page", params);
  },
  // 获取课程列表
  async list() {
    return await http.get("/api/base/course/list");
  },
  // 根据学科获取课程列表
  async listBySubject(subjectId) {
    return await http.get(`/api/base/course/list/subject/${subjectId}`);
  },
  // 根据学段获取课程列表
  async listByStage(stageId) {
    return await http.get(`/api/base/course/list/stage/${stageId}`);
  },
  // 导出课程
  async exportCourses(params) {
    return await http.get("/api/base/course/export", params);
  },
};
