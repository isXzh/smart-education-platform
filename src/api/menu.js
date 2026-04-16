import http from "@/utils/http.js";
// 菜单管理
export default {
  // 获取菜单详情
  getById(id) {
    return http.get(`/api/system/menu/${id}`);
  },
  // 修改菜单
  update(id, data) {
    return http.put(`/api/system/menu/${id}`, data);
  },
  // 删除菜单
  delete(id) {
    return http.delete(`/api/system/menu/${id}`);
  },
  // 新增菜单
  add(data) {
    return http.post("/api/system/menu", data);
  },
  // 获取菜单树
  tree() {
    return http.get("/api/system/menu/tree");
  },
  // 获取菜单树（用于权限分配）
  treeForPermission() {
    return http.get("/api/system/menu/tree/permission");
  },
};
