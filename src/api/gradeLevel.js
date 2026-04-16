import http from "@/utils/http.js";
// 学段管理
export default {
  // 修改学段
  async update(id, data) {
    return await http.put(`/api/base/stage/${id}`, data);
  },
  // 删除学段
  async delete(id) {
    return await http.delete(`/api/base/stage/${id}`);
  },
  // 新增学段
  async add(data) {
    return await http.post("/api/base/stage", data);
  },
  // 分页查询学段
  async page(params) {
    return await http.get("/api/base/stage/page", params);
  },
  // 获取学段列表
  async list() {
    return await http.get("/api/base/stage/list");
  },
};
