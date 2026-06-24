import http from '@/utils/http.js';
// 年级管理
export default {
  // 审批驳回
  reject(data) {
    return http.post(`/api/base/course-adjustment-approval/reject`, data);
  },
  // 审批通过
  approve(data) {
    return http.post(`/api/base/course-adjustment-approval/approve`, data);
  },
  // 分页查询调课审批
  page(data) {
    return http.post(`/api/base/course-adjustment-approval/page`, data);
  },
};
