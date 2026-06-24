import http from '@/utils/http.js';
// 设备管理
export default {
  // 标记维修 / 标记正常（批量修改设备综合状态：3 标记维修 1 标记正常）
  // confirmStatus 通过 query 传递，body 为设备 ID 数组
  async repairStatus(confirmStatus, ids) {
    return await http.put2(`/api/device/repair-status?confirmStatus=${confirmStatus}`, ids);
  },
  // 从华为云同步设备
  async sync() {
    return await http.post('/api/device/sync');
  },
  // 分页查询设备列表
  async page(data) {
    return await http.post('/api/device/page', data);
  },
  // 软终端-分页查询账号
  async pageMembers(params) {
    return await http.get('/api/device/members', params);
  },
  // 软终端-新增账号
  async addMembers(data) {
    return await http.post('/api/device/members', data);
  },
  // 软终端-批量删除账号
  async deleteMembers(data) {
    return await http.deleteData('/api/device/members', data);
  },
  // 设备心跳上报
  async heartbeat(data) {
    return await http.post('/api/device/heartbeat', data);
  },
  // 导出设备 Excel（根据选中的设备 ID 列表导出）
  async exportDevices(data) {
    return await http.postJsonFile('/api/device/export', data);
  },
  // 刷新华为云会议组织目录缓存
  async refreshDeptTree() {
    return await http.post('/api/device/dept-tree/refresh');
  },
  // 查询设备详情（包含设备基础信息、最近 7 天排课记录、近 7 天每日使用时长）
  async getById(id) {
    return await http.get(`/api/device/${id}/detail`);
  },
  // 设备操作日志分页
  async logPage(params) {
    return await http.get('/api/device/log/page', params);
  },
  // 导出操作日志
  async logExport(params) {
    return await http.getFile('/api/device/log/export', params);
  },
  // 根据组织筛选设备
  async list(params) {
    return await http.get('/api/device/list', params);
  },
  // 硬终端-分页查询终端设备
  async hardDevices(params) {
    return await http.get('/api/device/hard-devices', params);
  },
  // 查询华为云会议组织目录
  async deptTree() {
    return await http.get('/api/device/dept-tree');
  },
  // 设备卡片看板数据
  async card() {
    return await http.get('/api/device/card');
  },
  // 查询所有软硬终端账号
  async allMembers(params) {
    return await http.get('/api/device/all-members', params);
  },
  // 异常设备列表
  async abnormal(params) {
    return await http.get('/api/device/abnormal', params);
  },
};
