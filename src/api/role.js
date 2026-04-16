import http from "@/utils/http.js";
// 角色管理
export default {
  // 获取角色详情
  async getById(id) {
    return await http.get(`/api/system/role/${id}`);
  },
  // 修改角色
  async update(id, data) {
    return await http.put(`/api/system/role/${id}`, data);
  },
  // 删除角色
  async delete(id) {
    return await http.delete(`/api/system/role/${id}`);
  },
  // 修改状态
  async updateStatus(id, status) {
    return await http.put(`/api/system/role/${id}/status`, null, {
      params: { status },
    });
  },
  // 分配菜单权限
  async assignMenus(id, menuIds) {
    return await http.put(`/api/system/role/${id}/menus`, menuIds);
  },
  // 新增角色
  async add(data) {
    return await http.post("/api/system/role", data);
  },
  // 分页查询角色
  async page(params) {
    return await http.get("/api/system/role/page", params);
  },
  // 获取角色列表
  async list() {
    return await http.get("/api/system/role/list");
  },
};
