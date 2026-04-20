import http from "@/utils/http.js";
// 学段管理
export default {
  async update(id, data) {
    return await http.put(`/api/base/stage/${id}`, data);
  },
  async delete(id) {
    return await http.delete(`/api/base/stage/${id}`);
  },
  async add(data) {
    return await http.post("/api/base/stage", data);
  },
  async page(params) {
    return await http.get("/api/base/stage/page", params);
  },
  async list() {
    return await http.get("/api/base/class/stage/list");
  },
};
