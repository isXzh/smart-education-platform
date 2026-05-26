import http from '@/utils/http.js';
// 设备管理
export default {
  // 获取设备详情
  async getById(id) {
    return await http.get(`/api/device/${id}`);
  },
  // 编辑设备
  async update(id, data) {
    return await http.put(`/api/device/${id}`, data);
  },
  // 删除设备
  async delete(id) {
    return await http.delete(`/api/device/${id}`);
  },
  // 新增设备
  async add(data) {
    return await http.post('/api/device', data);
  },
  // 批量导入设备
  async importDevices(data) {
    return await http.post('/api/device/import', data);
  },
  // 下载导入模板
  async downloadTemplate() {
    return await http.get('/api/device/template');
  },
  // 分页查询设备列表
  async page(params) {
    return await http.get('/api/device/page', params);
  },
  // 根据组织筛选设备
  async list(params) {
    return await http.get('/api/device/list', params);
  },
  // 导出设备列表
  async exportDevices(params) {
    return await http.get('/api/device/export', params);
  },
  // 批量删除设备
  async batchDelete(ids) {
    return await http.delete('/api/device/batch', ids);
  },
  // 软终端-分页查询账号
  async pageMembers(params) {
    return await http.get('/api/device/members', params);
  },
  // 软终端-新增账号
  async addMembers(data) {
    return await http.post('/api/device/members', data);
  },
  // 软终端-批量删除账号
  async deleteMembers(data) {
    return await http.deleteData('/api/device/members', data);
  },
  // 刷新华为云会议组织目录缓存
  async refreshDeptTree() {
    return await http.post('/api/device/dept-tree/refresh');
  },
  // 硬终端-分页查询终端设备
  async hardDevices(params) {
    return await http.get('/api/device/hard-devices', params);
  },
  // 查询华为云会议组织目录
  async deptTree() {
    return await http.get('/api/device/dept-tree');
  },
  // 查询所有软硬终端账号
  async allMembers() {
    return await http.get('/api/device/all-members');
  },
};
