import http from '@/utils/http.js';

export default {
  list(params) {
    return http.get('/api/base/class/grade/list', params);
  },
  add(data) {
    return http.post('/api/base/grade', data);
  },
  update(id, data) {
    return http.put2(`/api/base/grade/${id}`, data);
  },
  delete(id) {
    return http.delete(`/api/base/grade/${id}`);
  },
  import(data) {
    return http.postFile('/api/base/grade/import', data);
  },
  downloadTemplate() {
    return http.getFile('/api/base/grade/template');
  },
}