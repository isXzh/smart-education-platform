import http from '@/utils/http.js';
// 公共资源管理
export default {
  // 分页查询公共资源
  page(params) {
    return http.get('/api/base/resource/public/page', params);
  },
  // 获取公共资源详情
  getById(id) {
    return http.get(`/api/base/resource/public/${id}`);
  },
  // 新增公共资源
  add(data) {
    return http.post('/api/base/resource/public', data);
  },
  // 编辑公共资源
  update(id, data) {
    return http.put2(`/api/base/resource/public/${id}`, data);
  },
  // 删除公共资源
  delete(id) {
    return http.delete(`/api/base/resource/public/${id}`);
  },
  // 上下架切换
  togglePublish(id) {
    return http.put2(`/api/base/resource/public/${id}/publish`);
  },
  // 简单上传视频
  uploadVideo(data) {
    return http.postFileJson('/api/base/resource/public/video/upload', data);
    // return http.postFileJson('/smartedu-api/base/resource/public/video/upload', data);
  },
  uploadChunk(data) {
    return http.postFileJson('/api/base/resource/public/video/chunk', data);
  },
  // 合并分片
  mergeChunks(data) {
    return http.post('/api/base/resource/public/video/merge', data);
  },
  // 替换视频文件
  replaceVideo(id, data) {
    return http.post(`/api/base/resource/public/video/${id}/replace`, data);
  },
  // 下载视频资源
  download(id) {
    return http.getFile(`/api/base/resource/public/${id}/download`);
  },
  // 获取视频AI编目数据
  getCatalogData(id) {
    return http.get(`/api/base/resource/public/catalog/${id}`);
  },
  // 手动生成视频缩略图
  generateThumbnail(id) {
    return http.post(`/api/base/resource/public/${id}/thumbnail`);
  },
  // 测试AI平台编目接口
  testCatalog(platformVideoId) {
    return http.get(`/api/base/resource/public/test/catalog/${platformVideoId}`);
  },
  proxyImage(url) {
    return http.get('/api/base/resource/public/proxy/image', { url });
  },
};
