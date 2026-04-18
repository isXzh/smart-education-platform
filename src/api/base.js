import http from '@/utils/http.js';
// 年级管理
export default {
  // 修改年级
  update(id, data) {
    return http.put2(`/api/base/grade/${id}`, data);
  },
  // 删除年级
  delete(id) {
    return http.delete(`/api/base/grade/${id}`);
  },
  // 新增年级
  add(data) {
    return http.post('/api/base/grade', data);
  },
  // 批量导入年级
  import(data) {
    return http.postFile('/api/base/grade/import', data);
  },
  // 下载导入模板
  downloadTemplate() {
    return http.getFile('/api/base/grade/template');
  },
  // 获取学段下拉列表
  stageList() {
    return http.get('/api/base/grade/stage/list');
  },
  // 查询年级列表
  gradeList(params) {
    return http.get('/api/base/grade/list', params);
  },
};
