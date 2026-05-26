import http from '@/utils/http.js';
// 资源库-标签管理
export default {
  // 新增标签
  createTag(data) {
    return http.post('/api/base/resource/tag/tag', data);
  },
  // 编辑标签
  updateTag(id, data) {
    return http.put2(`/api/base/resource/tag/tag/${id}`, data);
  },
  // 删除标签
  deleteTag(id) {
    return http.delete(`/api/base/resource/tag/tag/${id}`);
  },
  // 切换标签状态（启用/禁用）
  toggleTagStatus(id) {
    return http.put2(`/api/base/resource/tag/tag/${id}/status`);
  },
  // 标签分页列表
  tagPage(params) {
    return http.get('/api/base/resource/tag/tag/page', params);
  },
  // 获取标签列表（按分类）
  tagList(categoryId) {
    return http.get('/api/base/resource/tag/list', { categoryId });
  },
  // 创建分类
  createCategory(data) {
    return http.post('/api/base/resource/tag/category', data);
  },
  // 编辑分类
  updateCategory(id, data) {
    return http.put2(`/api/base/resource/tag/category/${id}`, data);
  },
  // 删除分类
  deleteCategory(id) {
    return http.delete(`/api/base/resource/tag/category/${id}`);
  },
  // 获取分类列表
  categoryList() {
    return http.get('/api/base/resource/tag/category/list');
  },
};
