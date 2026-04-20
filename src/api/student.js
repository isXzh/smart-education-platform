import http from '@/utils/http.js';

export default {
  page(params) {
    return http.post('/api/base/student/page', params);
  },
  add(data) {
    return http.post('/api/base/student', data);
  },
  update(id, data) {
    return http.put2(`/api/base/student/${id}`, data);
  },
  delete( data) {
    return http.deleteData(`/api/base/student`, data);
  },
  import(data) {
    return http.postFile('/api/base/student/import', data);
  },
  export(params) {
    return http.postJsonFile('/api/base/student/export', params);
  },
  downloadTemplate() {
    return http.getFile('/api/base/student/template');
  },
  updateStatus(id, status) {
    return http.put2(`/api/base/student/${id}/status`, { status });
  },
  list() {
    return http.get('/api/base/student/list');
  },
}
