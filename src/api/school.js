import http from '@/utils/http.js';
// 学校管理
export default {
  // 分页查询学校
  page(params) {
    return http.get('/api/base/school/page', params);
  },
  // 新增学校
  add(data) {
    return http.post('/api/base/school', data);
  },
  // 修改学校
  update(id, data) {
    return http.put2(`/api/base/school/${id}`, data);
  },
  // 删除学校
  delete(data) {
    return http.deleteData('/api/base/school', data);
  },
  // 批量启用学校
  batchEnable(data) {
    return http.put2('/api/base/school/batch-enable', data);
  },
  // 批量禁用学校
  batchDisable(data) {
    return http.put2('/api/base/school/batch-disable', data);
  },
  // 批量导入学校
  import(data) {
    return http.postFileJson('/api/base/school/import', data);
  },
  // 下载导入模板
  downloadTemplate() {
    return http.getFile('/api/base/school/template');
  },
};
