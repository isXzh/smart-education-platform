import http from '@/utils/http.js';
// 资源类型管理
export default {
  // 修改资源类型
  update(id, data) {
    return http.put2(`/api/base/resource/type/${id}`, data);
  },
  // 删除资源类型
  delete(id) {
    return http.delete(`/api/base/resource/type/${id}`);
  },
  // 新增资源类型
  add(data) {
    return http.post('/api/base/resource/type', data);
  },
  // 修改资源类型状态（启用/禁用）
  updateStatus(id, status) {
    return http.put2(`/api/base/resource/type/${id}/status?status=${status}`);
  },
  // 批量修改资源类型状态
  batchUpdateStatus(data) {
    return http.put2('/api/base/resource/type/batch/status', data);
  },
  // 获取资源类型详情
  getById(id) {
    return http.get(`/api/base/resource/type/${id}`);
  },
  // 分页查询资源类型列表
  page(data) {
    return http.post('/api/base/resource/type/page', data);
  },
  // 获取所有启用的资源类型列表
  listEnabled() {
    return http.get('/api/base/resource/type/list');
  },
};
