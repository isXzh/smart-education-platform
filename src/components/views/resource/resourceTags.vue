<template>
    <!-- 标签管理 -->
  <div class="p-6 common-container">
    <!-- 面包屑 -->
    <div class="mb-6">
      <div class="text-sm text-gray-500">
        <span class="text-blue-600 cursor-pointer" @click="$router.push('/resource')">资源库管理</span>
        <span class="mx-2">/</span>
        <span class="text-gray-700">标签管理</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="flex gap-6 h-[calc(100vh-180px)]">
      <!-- 左侧分类面板 -->
      <div class="w-[320px] flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <!-- 分类头部 -->
        <div class="px-5 py-4 border-b border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <i class="el-icon-collection text-[#1677FF] text-lg"></i>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 text-sm">资源分类</h3>
                <p class="text-xs text-gray-400">共 {{ categories.length }} 个分类</p>
              </div>
            </div>
            <el-button type="primary" size="small" class="!h-8 !px-3 !text-xs !bg-[#1677FF] !border-[#1677FF] !flex !items-center !justify-center" @click="openAddCategory">
              <i class="el-icon-plus mr-1"></i>
              新增
            </el-button>
          </div>
          <!-- 分类搜索 -->
          <div class="relative">
            <i class="el-icon-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <el-input
              v-model="categorySearch"
              placeholder="搜索分类..."
              class="!pl-9"
              size="small"
            />
          </div>
        </div>

        <!-- 分类列表 -->
        <div class="flex-1 overflow-y-auto p-3">
          <!-- 全部分类选项 -->
          <div
            :class="[
              'flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all mb-1 border',
              selectedCategoryId === null
                ? 'bg-blue-50 border-blue-100 shadow-sm'
                : 'hover:bg-gray-50 border-transparent'
            ]"
            @click="selectedCategoryId = null"
          >
            <div
              :class="[
                'w-8 h-8 rounded-lg flex items-center justify-center',
                selectedCategoryId === null ? 'bg-blue-100' : 'bg-gray-100'
              ]"
            >
              <i
                :class="[
                  'el-icon-folder-opened text-lg',
                  selectedCategoryId === null ? 'text-[#1677FF]' : 'text-gray-500'
                ]"
              ></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm text-gray-900">全部分类</div>
              <div class="text-xs text-gray-400">查看所有标签</div>
            </div>
            <el-tag size="mini" class="!bg-gray-100 !text-gray-600 !border-gray-200">{{ tags.length }}</el-tag>
          </div>

          <!-- 分类项 -->
          <div class="mt-2 space-y-1">
            <div
              v-for="category in filteredCategories"
              :key="category.id"
              :class="[
                'group flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all border',
                selectedCategoryId === category.id
                  ? 'bg-blue-50 border-blue-100 shadow-sm'
                  : 'hover:bg-gray-50 border-transparent'
              ]"
              @click="selectedCategoryId = category.id"
            >
              <div
                :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  selectedCategoryId === category.id ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-white'
                ]"
              >
                <i
                  :class="[
                    'el-icon-price-tag text-lg',
                    selectedCategoryId === category.id ? 'text-[#1677FF]' : 'text-gray-500'
                  ]"
                ></i>
              </div>
              <div class="flex-1 min-w-0">
                <span class="font-medium text-sm text-gray-900 truncate">{{ category.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <el-tag size="mini" variant="outline" class="!border-gray-200 !text-gray-500">
                  {{ getTagCount(category.id) }}
                </el-tag>
                <el-dropdown trigger="click" @command="(cmd) => handleCategoryCommand(cmd, category)" @click.native.stop>
                  <button
                    class="p-1.5 hover:bg-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <i class="el-icon-more text-gray-400"></i>
                  </button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="edit">
                      <i class="el-icon-edit text-gray-500 mr-2"></i>
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" class="!text-red-600">
                      <i class="el-icon-delete text-red-500 mr-2"></i>
                      <span class="text-red-600">删除</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧标签面板 -->
      <div class="flex-1 min-w-0 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <!-- 标签头部 -->
        <div class="px-6 py-4 border-b border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <i class="el-icon-price-tag text-white text-xl"></i>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">
                  {{ selectedCategory ? `${selectedCategory.name} - 标签` : '全部标签' }}
                </h3>
                <p class="text-xs text-gray-400">
                  共 {{ filteredTags.length }} 个标签
                </p>
              </div>
            </div>
            <el-button type="primary" class="!h-9 !px-4 !bg-[#1677FF] !border-[#1677FF]" @click="openAddTag">
              <i class="el-icon-plus mr-1"></i>
              新增标签
            </el-button>
          </div>

          <!-- 筛选栏 -->
          <div class="flex items-center gap-3">
            <div class="relative flex-1 max-w-[280px]">
              <i class="el-icon-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <el-input
                v-model="searchKeyword"
                placeholder="搜索标签名称或描述..."
                class="!pl-10"
                size="small"
              />
            </div>
            <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
              <button
                :class="[
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  filterStatus === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                ]"
                @click="filterStatus = 'all'"
              >
                全部
              </button>
              <button
                :class="[
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  filterStatus === 'enabled'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                ]"
                @click="filterStatus = 'enabled'"
              >
                已启用
              </button>
              <button
                :class="[
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  filterStatus === 'disabled'
                    ? 'bg-white text-gray-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                ]"
                @click="filterStatus = 'disabled'"
              >
                已禁用
              </button>
            </div>
          </div>
        </div>

        <!-- 标签网格 -->
        <div class="flex-1 overflow-auto p-6">
          <div v-if="filteredTags.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i class="el-icon-price-tag text-4xl text-gray-300"></i>
            </div>
            <p class="text-gray-500 font-medium">暂无标签数据</p>
            <p class="text-sm text-gray-400 mt-1">点击右上角按钮新增标签</p>
          </div>

          <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <div
              v-for="tag in filteredTags"
              :key="tag.id"
              class="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-200"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                    <i class="el-icon-price-tag text-[#1677FF] text-xl"></i>
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-900">{{ tag.name }}</h4>
                    <el-tag size="mini" class="!mt-1 !border-blue-200 !text-blue-600 !bg-blue-50">
                      {{ tag.categoryName }}
                    </el-tag>
                  </div>
                </div>
                <el-switch
                  v-model="tag.status"
                  active-value="enabled"
                  inactive-value="disabled"
                  @change="() => toggleTagStatus(tag.id)"
                />
              </div>

              <p class="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                {{ tag.description || '暂无描述' }}
              </p>

              <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                <span class="text-xs text-gray-400">创建于 {{ tag.createdAt }}</span>
                <div class="flex items-center gap-1">
                  <button
                    class="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                    @click="openEditTag(tag)"
                  >
                    <i class="el-icon-edit"></i>
                  </button>
                  <button
                    class="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                    @click="openDeleteTag(tag.id)"
                  >
                    <i class="el-icon-delete"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类弹窗 -->
    <CategoryDialog
      v-model="showCategoryModal"
      :is-edit="!!editingCategory"
      :edit-data="editingCategory"
      @submit="handleCategorySubmit"
    />

    <!-- 分类删除确认 -->
    <CategoryDeleteDialog
      v-model="showCategoryDeleteConfirm"
      @confirm="confirmDeleteCategory"
    />

    <!-- 标签弹窗 -->
    <TagDialog
      v-model="showTagModal"
      :is-edit="!!editingTag"
      :edit-data="editingTag"
      :categories="categories"
      :default-category-id="selectedCategoryId || ''"
      @submit="handleTagSubmit"
    />

    <!-- 标签删除确认 -->
    <TagDeleteDialog
      v-model="showTagDeleteConfirm"
      @confirm="confirmDeleteTag"
    />
  </div>
</template>

<script>
import CategoryDialog from './resourceTagsDialog/CategoryDialog.vue';
import CategoryDeleteDialog from './resourceTagsDialog/CategoryDeleteDialog.vue';
import TagDialog from './resourceTagsDialog/TagDialog.vue';
import TagDeleteDialog from './resourceTagsDialog/TagDeleteDialog.vue';
import resourceTagApi from '@/api/resourceTag.js';

export default {
  name: 'ResourceTags',
  components: {
    CategoryDialog,
    CategoryDeleteDialog,
    TagDialog,
    TagDeleteDialog,
  },
  data() {
    return {
      categories: [],
      tags: [],
      selectedCategoryId: null,
      categorySearch: '',
      searchKeyword: '',
      filterStatus: 'all',
      showCategoryModal: false,
      showCategoryDeleteConfirm: false,
      editingCategory: null,
      deletingCategoryId: null,
      showTagModal: false,
      showTagDeleteConfirm: false,
      editingTag: null,
      deletingTagId: null,
    };
  },
  computed: {
    filteredCategories() {
      return this.categories.filter((cat) =>
        cat.name.toLowerCase().includes(this.categorySearch.toLowerCase())
      );
    },
    filteredTags() {
      return this.tags.filter((tag) => {
        const matchKeyword = tag.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
                            (tag.description || '').toLowerCase().includes(this.searchKeyword.toLowerCase());
        const matchStatus = this.filterStatus === 'all' || tag.status === this.filterStatus;
        const matchCategory = !this.selectedCategoryId || tag.categoryId === this.selectedCategoryId;
        return matchKeyword && matchStatus && matchCategory;
      });
    },
    selectedCategory() {
      return this.categories.find((c) => c.id === this.selectedCategoryId);
    },
  },
  mounted() {
    this.loadCategories();
    this.loadTags();
  },
  methods: {
    convertStatus(status) {
      return status === 1 ? 'enabled' : 'disabled';
    },
    toApiStatus(status) {
      return status === 'enabled' ? 1 : 0;
    },
    async loadCategories() {
      try {
        const res = await resourceTagApi.categoryList();
        if (res.code === 200) {
          this.categories = (res.data || []).map((cat) => ({
            ...cat,
            status: this.convertStatus(cat.status),
          }));
        }
      } catch (error) {
        console.error('加载分类列表失败:', error);
      }
    },
    async loadTags() {
      try {
        const res = await resourceTagApi.tagList();
        if (res.code === 200) {
          this.tags = (res.data || []).map((tag) => ({
            ...tag,
            status: this.convertStatus(tag.status),
            createdAt: tag.createdAt ? tag.createdAt.split('T')[0] : '',
          }));
        }
      } catch (error) {
        console.error('加载标签列表失败:', error);
      }
    },
    getTagCount(categoryId) {
      return this.tags.filter((tag) => tag.categoryId === categoryId).length;
    },
    handleCategoryCommand(command, category) {
      switch (command) {
        case 'edit':
          this.openEditCategory(category);
          break;
        case 'delete':
          this.openDeleteCategory(category.id);
          break;
      }
    },
    openAddCategory() {
      this.editingCategory = null;
      this.showCategoryModal = true;
    },
    openEditCategory(category) {
      this.editingCategory = category;
      this.showCategoryModal = true;
    },
    openDeleteCategory(categoryId) {
      const tagCount = this.getTagCount(categoryId);
      if (tagCount > 0) {
        this.$message.warning(`该分类下有${tagCount}个标签，请先删除或转移标签`);
        return;
      }
      this.deletingCategoryId = categoryId;
      this.showCategoryDeleteConfirm = true;
    },
    async handleCategorySubmit(form) {
      try {
        if (this.editingCategory) {
          const res = await resourceTagApi.updateCategory(this.editingCategory.id, {
            name: form.name.trim(),
          });
          if (res.code === 200) {
            this.$message.success('编辑分类成功');
            this.loadCategories();
          }
        } else {
          const res = await resourceTagApi.createCategory({
            name: form.name.trim(),
          });
          if (res.code === 200) {
            this.$message.success('新增分类成功');
            this.loadCategories();
          }
        }
      } catch (error) {
        console.error('操作分类失败:', error);
        this.$message.error('操作分类失败');
      }
    },
    async confirmDeleteCategory() {
      if (this.deletingCategoryId) {
        try {
          const res = await resourceTagApi.deleteCategory(this.deletingCategoryId);
          if (res.code === 200) {
            this.$message.success('删除分类成功');
            if (this.selectedCategoryId === this.deletingCategoryId) {
              this.selectedCategoryId = null;
            }
            this.deletingCategoryId = null;
            this.loadCategories();
            this.loadTags();
          }
        } catch (error) {
          console.error('删除分类失败:', error);
          this.$message.error('删除分类失败');
        }
      }
    },
    openAddTag() {
      this.editingTag = null;
      this.showTagModal = true;
    },
    openEditTag(tag) {
      this.editingTag = tag;
      this.showTagModal = true;
    },
    openDeleteTag(tagId) {
      this.deletingTagId = tagId;
      this.showTagDeleteConfirm = true;
    },
    async handleTagSubmit(form) {
      try {
        if (this.editingTag) {
          const res = await resourceTagApi.updateTag(this.editingTag.id, {
            id: this.editingTag.id,
            name: form.name.trim(),
            categoryId: form.categoryId,
            description: form.description,
            status: this.toApiStatus(form.status),
          });
          if (res.code === 200) {
            this.$message.success('编辑标签成功');
            this.loadTags();
            this.loadCategories();
          }
        } else {
          const res = await resourceTagApi.createTag({
            name: form.name.trim(),
            categoryId: form.categoryId,
            description: form.description,
            status: this.toApiStatus(form.status),
          });
          if (res.code === 200) {
            this.$message.success('新增标签成功');
            this.loadTags();
            this.loadCategories();
          }
        }
      } catch (error) {
        console.error('操作标签失败:', error);
        this.$message.error('操作标签失败');
      }
    },
    async confirmDeleteTag() {
      if (this.deletingTagId) {
        try {
          const res = await resourceTagApi.deleteTag(this.deletingTagId);
          if (res.code === 200) {
            this.$message.success('删除标签成功');
            this.deletingTagId = null;
            this.loadTags();
            this.loadCategories();
          }
        } catch (error) {
          console.error('删除标签失败:', error);
          this.$message.error('删除标签失败');
        }
      }
    },
    async toggleTagStatus(tagId) {
      try {
        const res = await resourceTagApi.toggleTagStatus(tagId);
        if (res.code === 200) {
          this.$message.success('状态切换成功');
        }
      } catch (error) {
        console.error('切换标签状态失败:', error);
        this.$message.error('切换标签状态失败');
      } finally {
        this.loadTags();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.common-container {
  background: #f5f7fa;
  min-height: 100%;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

::v-deep .el-switch.is-checked .el-switch__core {
  border-color: #10b981;
  background-color: #10b981;
}
</style>
