import http from "@/utils/http.js";
// 学科管理
export default {
  // 修改学科
  async update(id, data) {
    return await http.put(`/api/base/subject/${id}`, data);
  },
  // 删除学科
  async delete(id) {
    return await http.delete(`/api/base/subject/${id}`);
  },
  // 新增学科
  async add(data) {
    return await http.post("/api/base/subject", data);
  },
  // 修改学科状态
  async updateStatus(id, status) {
    return await http.patch(`/api/base/subject/${id}/status`, null, {
      params: { status },
    });
  },
  // 获取学科统计信息
  async statistics() {
    return await http.get("/api/base/subject/statistics");
  },
  // 分页查询学科
  async page(params) {
    return await http.get("/api/base/subject/page", params);
  },
  // 获取学科列表
  async list() {
    return await http.get("/api/base/subject/list");
  },
  // 根据学段获取学科列表
  async listByStage(stageId) {
    return await http.get(`/api/base/subject/list/${stageId}`);
  },
};
