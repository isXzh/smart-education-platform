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
};
