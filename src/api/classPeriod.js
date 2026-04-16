import http from "@/utils/http.js";
// 课时管理
export default {
  // 获取课时详情
  async getById(id) {
    return await http.get(`/api/base/period/${id}`);
  },
  // 编辑课时
  async update(id, data) {
    return await http.put2(`/api/base/period/${id}`, data);
  },
  // 删除课时
  async delete(id) {
    return await http.delete(`/api/base/period/${id}`);
  },
  // 新增课时
  async add(data) {
    return await http.post("/api/base/period", data);
  },
  // 导入课时
  async importPeriods(data, stageId) {
    return await http.post("/api/base/period/import", data, {
      params: { stageId },
    });
  },
  // 下载导入模板
  async downloadTemplate() {
    return await http.getFile("/api/base/period/template");
  },
  // 获取学段下拉列表
  async stageList() {
    return await http.get("/api/base/period/stage/list");
  },
  // 分页查询课时
  async page(params) {
    return await http.get("/api/base/period/page", params);
  },
  // 根据学段查询全部课时
  async list(stageId) {
    return await http.get("/api/base/period/list", { stageId });
  },
  // 导出课时
  async exportPeriods(params) {
    return await http.get("/api/base/period/export", params);
  },
  // 批量删除课时
  async batchDelete(ids) {
    return await http.delete("/api/base/period/batch", ids);
  },
};
