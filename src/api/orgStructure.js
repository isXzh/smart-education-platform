import http from "@/utils/http.js";
// 组织架构管理
export default {
  // 获取组织详情
  async getById(id) {
    return await http.get(`/api/base/org/${id}`);
  },
  // 修改组织
  async update(id, data) {
    return await http.put2(`/api/base/org/${id}`, data);
  },
  // 删除组织
  async delete(id) {
    return await http.delete(`/api/base/org/${id}`);
  },
  // 新增组织
  async add(data) {
    return await http.post("/api/base/org", data);
  },
  // 获取下级组织列表
  async getChildrenList(parentId) {
    return await http.get(`/api/base/org/${parentId}/list`);
  },
  // 获取组织树
  async tree() {
    return await http.get("/api/base/org/tree");
  },
  // 获取指定节点的子节点列表
  async children(parentId) {
    return await http.get(`/api/base/org/children/${parentId}`);
  },
  // 获取下级组织类型
  async getChildOrgType(parentId) {
    return await http.get(`/api/base/org/childType/${parentId}`);
  },
  // 检查是否可以新增下级组织
  async canAddChild(parentId) {
    return await http.get(`/api/base/org/canAddChild/${parentId}`);
  },
};
