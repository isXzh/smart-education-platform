import http from '@/utils/http.js';

export default {
  page(params) {
    return http.post('/api/base/teacher/page', params);
  },
  add(data) {
    return http.post('/api/base/teacher', data);
  },
  update(id, data) {
    return http.put2(`/api/base/teacher/${id}`, data);
  },
  delete(data) {
    return http.deleteData(`/api/base/teacher`, data);
  },
  import(data) {
    return http.postImport('/api/base/teacher/import', data);
  },
  export(params) {
    return http.postJsonFile('/api/base/teacher/export', params);
  },
  downloadTemplate() {
    return http.getFile('/api/base/teacher/template');
  },
  resetPassword(id) {
    return http.put2(`/api/base/teacher/${id}/reset-password`);
  },
  updateStatus(id, status) {
    return http.put2(`/api/base/teacher/${id}/status`, { status });
  },
  list() {
    return http.get('/api/base/teacher/list');
  },
}