import http from "@/utils/http.js";
// 学期管理
export default {
  // 修改学期
  async update(id, data) {
    return await http.put(`/api/base/semester/${id}`, data);
  },
  // 删除学期
  async delete(id) {
    return await http.delete(`/api/base/semester/${id}`);
  },
  // 新增学期
  async add(data) {
    return await http.post("/api/base/semester", data);
  },
  // 设为当前学期
  async setCurrent(id) {
    return await http.patch(`/api/base/semester/${id}/current`);
  },
  // 分页查询学期
  async page(params) {
    return await http.get("/api/base/semester/page", params);
  },
  // 获取学期列表
  async list() {
    return await http.get("/api/base/semester/list");
  },
  // 获取当前学期
  async getCurrent() {
    return await http.get("/api/base/semester/current");
  },
};
