import http from '@/utils/http.js';

export default {
  page(params) {
    return http.get('/api/base/class/page', params);
  },
  list(params) {
    return http.get('/api/base/class/list', params);
  },
  add(data) {
    return http.post('/api/base/class', data);
  },
  update(id, data) {
    return http.put2(`/api/base/class/${id}`, data);
  },
  delete(data) {
    return http.deleteData(`/api/base/class`,data);
  },
  import(data) {
    return http.postFile('/api/base/class/import', data);
  },
  export(params) {
    return http.postJsonFile('/api/base/class/export', params);
  },
  downloadTemplate() {
    return http.getFile('/api/base/class/template');
  },
  teacherList() {
    return http.get('/api/base/class/teacher/list');
  }
}