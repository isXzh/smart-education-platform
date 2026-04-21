import http from '@/utils/http.js';
// 排课管理
export default {
  // 获取排课详情
  async getById(id) {
    return await http.get(`/api/schedule/${id}`);
  },
  // 编辑排课
  async update(id, data) {
    return await http.put2(`/api/schedule/${id}`, data);
  },
  // 删除排课
  async delete(id) {
    return await http.delete(`/api/schedule/${id}`);
  },
  // 新增排课
  async add(data) {
    return await http.post('/api/schedule', data);
  },
  // 复制排课
  async copy(id, data) {
    return await http.post(`/api/schedule/${id}/copy`, data);
  },
  // 分页查询排课
  async page(data) {
    return await http.post('/api/schedule/page', data);
  },
  // 导入排课
  async importSchedules(data) {
    return await http.postFile('/api/schedule/import', data);
  },
  // 教室空闲校验
  async checkClassroomAvailable(data) {
    return await http.post('/api/schedule/classroom/check', data);
  },
  // 下载导入模板
  async downloadTemplate() {
    return await http.getFile('/api/schedule/template');
  },
  // 获取排课下拉选项
  async getOptions() {
    return await http.get('/api/schedule/options');
  },
  // 导出排课
  async exportSchedules(params) {
    return await http.get('/api/schedule/export', params);
  },
  // 日历概览
  async getCalendarOverview(params) {
    return await http.get('/api/schedule/calendar', params);
  },
  // 批量删除排课
  async batchDelete(data) {
    return await http.delete('/api/schedule/batch', data);
  },
  // 周视图
  async getWeekView(params) {
    return await http.get('/api/schedule/timetable/week', params);
  },
  // 月视图
  async getMonthView(params) {
    return await http.get('/api/schedule/timetable/month', params);
  },
  // 导出课表
  async exportTimetable(params) {
    return await http.get('/api/schedule/timetable/export', params);
  },
  // 日视图
  async getDayView(params) {
    return await http.get('/api/schedule/timetable/day', params);
  },
};
