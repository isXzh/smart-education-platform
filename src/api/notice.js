import http from '@/utils/http.js';
// 平台端-通知消息
export default {
  // 发布系统公告
  async createSystemNotice(data) {
    return await http.post('/api/system/notice/system-notice', data);
  },
  // 标记单条消息为已读
  async markRead(id) {
    return await http.post2(`/api/system/notice/read/${id}`);
  },
  // 标记本人全部消息为已读
  async markAllRead() {
    return await http.post2('/api/system/notice/read-all');
  },
  // 分页查询本人通知消息
  async page(params) {
    return await http.post('/api/system/notice/page', params);
  },
  // 获取消息详情
  async getById(id) {
    return await http.get(`/api/system/notice/${id}`);
  },
  // 统计本人未读消息数量
  async unreadCount() {
    return await http.get('/api/system/notice/unread-count');
  },
  // 批量删除本人通知消息
  async deleteByIds(ids) {
    return await http.deleteData('/api/system/notice/batch', ids);
  },
};
