import http from "@/utils/http.js";
// 用户管理
export default {
  // 获取用户详情
  getById(id) {
    return http.get(`/api/system/user/${id}`);
  },
  // 修改用户
  update(id, data) {
    return http.put2(`/api/system/user/${id}`, data);
  },
  // 删除用户
  delete(id) {
    return http.delete(`/api/system/user/${id}`);
  },
  // 修改状态
  updateStatus(id, status) {
    return http.put(`/api/system/user/${id}/status`, null, {
      params: { status },
    });
  },
  // 分配角色
  assignRoles(id, roleIds) {
    return http.put(`/api/system/user/${id}/roles`, roleIds);
  },
  // 重置密码
  resetPassword(id, newPassword) {
    return http.put(`/api/system/user/${id}/reset-password`, newPassword);
  },
  // 新增用户
  add(data) {
    return http.post("/api/system/user", data);
  },
  // 分页查询用户
  page(params) {
    return http.post("/api/system/user/page", params);
  },
};
