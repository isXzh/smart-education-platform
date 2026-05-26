<template>
  <!-- 资源类型管理 -->
  <div class="p-6 common-container">
    <!-- 面包屑 -->
    <div class="mb-6">
      <div class="text-sm text-gray-500">
        <span class="text-blue-600 cursor-pointer" @click="$router.push('/resource-personal')">资源库管理</span>
        <span class="mx-2">/</span>
        <span class="text-gray-700">资源类型管理</span>
      </div>
    </div>

    <!-- 主内容卡片 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <!-- 头部：标题 + 操作按钮 -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">资源类型管理</h2>
          <div class="flex items-center gap-2">
            <el-button
              type="primary"
              class="!h-9 !bg-[#1677FF] !border-[#1677FF] !flex !items-center"
              @click="openAddModal"
            >
              <i class="el-icon-plus mr-1"></i>
              新增类型
            </el-button>
            <el-button
              class="!h-9 !text-green-600 !border-green-300 hover:!bg-green-50 !flex !items-center"
              @click="handleBatchToggleStatus(1)"
            >
              <i class="el-icon-circle-check mr-1"></i>
              批量启用
            </el-button>
            <el-button
              class="!h-9 !text-red-600 !border-red-300 hover:!bg-red-50 !flex !items-center"
              @click="handleBatchToggleStatus(0)"
            >
              <i class="el-icon-circle-close mr-1"></i>
              批量禁用
            </el-button>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="relative w-64">
          <i class="el-icon-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"></i>
          <el-input
            v-model="searchTerm"
            placeholder="搜索类型名称..."
            class="search-input"
            size="small"
            clearable
            @input="handleSearchInput"
            @keyup.enter.native="handleSearch"
          />
        </div>
      </div>

      <!-- 已选择提示 -->
      <div v-if="selectedIds.length > 0" class="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
        <span class="text-sm text-blue-600">已选择 {{ selectedIds.length }} 项</span>
      </div>

      <!-- 数据表格 -->
      <el-table
        :data="tableData"
        style="width: 100%"
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        height="650"
      >
        <el-table-column type="selection" width="50" align="center" />

        <el-table-column label="类型名称" min-width="220">
          <template #default="{ row }">
            <div>
              <span class="font-medium text-gray-900">{{ row.typeName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="140" align="center">
          <template #default="{ row }">
            <div>
              <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small" effect="plain">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
              <div v-if="row.status === 0" class="mt-1 flex items-center justify-center gap-1">
                <i class="el-icon-warning-outline text-amber-500 text-xs"></i>
                <span class="text-xs text-amber-600">上传不可选</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="160" />

        <el-table-column label="操作" width="180" align="right">
          <template #default="{ row }">
            <div class="flex items-center justify-end gap-1">
              <el-tooltip content="编辑" placement="top" :open-delay="200">
                <button class="action-btn hover:!bg-blue-50 group" @click="openEditModal(row)">
                  <i class="el-icon-edit text-gray-600 group-hover:text-blue-600"></i>
                </button>
              </el-tooltip>
              <el-tooltip :content="row.status === 1 ? '禁用' : '启用'" placement="top" :open-delay="200">
                <button
                  :class="['action-btn group', row.status === 1 ? 'hover:!bg-red-50' : 'hover:!bg-green-50']"
                  @click="handleToggleStatus(row)"
                >
                  <i v-if="row.status === 1" class="el-icon-circle-close text-gray-600 group-hover:text-red-600"></i>
                  <i v-else class="el-icon-circle-check text-gray-600 group-hover:text-green-600"></i>
                </button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top" :open-delay="200">
                <button class="action-btn hover:!bg-red-50 group" @click="openDeleteModal(row.id)">
                  <i class="el-icon-delete text-gray-600 group-hover:text-red-600"></i>
                </button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <div class="flex flex-col items-center py-10 text-gray-400">
            <i class="el-icon-search text-4xl opacity-40 mb-2"></i>
            <p class="m-0">暂无数据</p>
          </div>
        </template>
      </el-table>

      <!-- 底部分页 -->
      <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
        <span>共 {{ total }} 条记录</span>
        <el-pagination
          background
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="prev, pager, next, jumper"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 新增/编辑类型弹窗 -->
    <ResourceTypeDialog
      v-model="showFormModal"
      :is-edit="!!editingType"
      :edit-data="editingType"
      @submit="handleFormSubmit"
    />

    <!-- 删除确认弹窗 -->
    <ResourceTypeDeleteDialog v-model="showDeleteModal" @confirm="confirmDelete" />
  </div>
</template>

<script>
  import ResourceTypeDialog from './resourceTypesDialog/ResourceTypeDialog.vue';
  import ResourceTypeDeleteDialog from './resourceTypesDialog/ResourceTypeDeleteDialog.vue';
  import resourceTypeApi from '@/api/resourceType.js';

  export default {
    name: 'ResourceTypes',
    components: {
      ResourceTypeDialog,
      ResourceTypeDeleteDialog,
    },
    data() {
      return {
        tableData: [],
        loading: false,
        total: 0,
        searchTerm: '',
        selectedIds: [],
        showFormModal: false,
        showDeleteModal: false,
        editingType: null,
        deletingId: null,
        searchTimer: null,
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          typeName: '',
        },
      };
    },
    created() {
      this.fetchPage();
    },
    beforeDestroy() {
      clearTimeout(this.searchTimer);
    },
    methods: {
      async fetchPage() {
        this.loading = true;
        try {
          const params = {
            pageNum: this.queryParams.pageNum,
            pageSize: this.queryParams.pageSize,
          };
          if (this.queryParams.typeName) {
            params.typeName = this.queryParams.typeName;
          }
          const res = await resourceTypeApi.page(params);
          if (res.code === 200 && res.data) {
            this.tableData = res.data.list || [];
            this.total = res.data.total || 0;
          }
        } catch (error) {
          console.error('加载资源类型列表失败:', error);
          this.$message.error('加载资源类型列表失败');
        } finally {
          this.loading = false;
        }
      },
      handleSearchInput() {
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {
          this.handleSearch();
        }, 300);
      },
      handleSearch() {
        this.queryParams.typeName = this.searchTerm.trim();
        this.queryParams.pageNum = 1;
        this.fetchPage();
      },
      handleCurrentChange(page) {
        this.queryParams.pageNum = page;
        this.fetchPage();
      },
      handleSizeChange(size) {
        this.queryParams.pageSize = size;
        this.queryParams.pageNum = 1;
        this.fetchPage();
      },
      headerCellStyle() {
        return {
          background: '#f9fafb',
          color: '#4b5563',
          fontWeight: 500,
          fontSize: '13px',
          padding: '12px 16px',
        };
      },
      cellStyle() {
        return {
          padding: '14px 16px',
          color: '#4b5563',
        };
      },
      handleSelectionChange(selection) {
        this.selectedIds = selection.map(row => row.id);
      },
      openAddModal() {
        this.editingType = null;
        this.showFormModal = true;
      },
      openEditModal(row) {
        this.editingType = { ...row };
        this.showFormModal = true;
      },
      async handleFormSubmit(form) {
        try {
          if (this.editingType) {
            const res = await resourceTypeApi.update(this.editingType.id, form);
            if (res.code === 200) {
              this.$message.success('编辑成功');
              this.fetchPage();
            } else {
              this.$message.error(res.message || '编辑失败');
            }
          } else {
            const res = await resourceTypeApi.add(form);
            if (res.code === 200) {
              this.$message.success('新增成功');
              this.fetchPage();
            } else {
              this.$message.error(res.message || '新增失败');
            }
          }
        } catch (error) {
          console.error('保存资源类型失败:', error);
          this.$message.error('保存失败');
        }
      },
      openDeleteModal(id) {
        this.deletingId = id;
        this.showDeleteModal = true;
      },
      async confirmDelete() {
        if (this.deletingId != null) {
          try {
            const res = await resourceTypeApi.delete(this.deletingId);
            if (res.code === 200) {
              this.$message.success('删除成功');
              this.selectedIds = this.selectedIds.filter(id => id !== this.deletingId);
              this.fetchPage();
            } else {
              this.$message.error(res.message || '删除失败');
            }
          } catch (error) {
            console.error('删除资源类型失败:', error);
            this.$message.error('删除失败');
          } finally {
            this.deletingId = null;
          }
        }
      },
      async handleToggleStatus(row) {
        const newStatus = row.status === 1 ? 0 : 1;
        try {
          const res = await resourceTypeApi.batchUpdateStatus({
            ids: [row.id],
            status: newStatus,
          });
          if (res.code === 200) {
            this.$message.success(newStatus === 1 ? '启用成功' : '禁用成功');
            this.fetchPage();
          } else {
            this.$message.error(res.message || '操作失败');
          }
        } catch (error) {
          console.error('切换状态失败:', error);
          this.$message.error('操作失败');
        }
      },
      async handleBatchToggleStatus(status) {
        if (this.selectedIds.length === 0) {
          this.$message.warning('请先选择要操作的类型');
          return;
        }
        try {
          const res = await resourceTypeApi.batchUpdateStatus({
            ids: this.selectedIds,
            status: status,
          });
          if (res.code === 200) {
            this.$message.success(status === 1 ? '批量启用成功' : '批量禁用成功');
            this.selectedIds = [];
            this.fetchPage();
          } else {
            this.$message.error(res.message || '操作失败');
          }
        } catch (error) {
          console.error('批量操作失败:', error);
          this.$message.error('操作失败');
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

  .search-input {
    ::v-deep .el-input__inner {
      padding-left: 36px;
      border-radius: 6px;
      height: 36px;
      line-height: 36px;
    }
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;

    i {
      font-size: 16px;
    }
  }

  ::v-deep .el-table {
    font-size: 14px;

    &::before {
      display: none;
    }

    th.el-table__cell {
      background: #f9fafb !important;
    }

    .el-table__row {
      &:hover > td.el-table__cell {
        background: #f9fafb !important;
      }
    }

    // 解决表头与单元格出现省略号 "..."
    th.el-table__cell > .cell,
    td.el-table__cell > .cell {
      white-space: normal;
      text-overflow: clip;
      overflow: visible;
    }

    // selection 列：固定宽度、内容居中，避免勾选前后位置偏移
    th.el-table-column--selection .cell,
    td.el-table-column--selection .cell {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-left: 0;
      padding-right: 0;
      text-overflow: clip;
      overflow: visible;
      white-space: nowrap;
    }

    // 复选框统一尺寸，保证选中态不撑大单元格
    .el-checkbox {
      margin: 0;
      height: 16px;
      line-height: 16px;
      display: inline-flex;
      align-items: center;
    }

    .el-checkbox__input {
      line-height: 1;
    }

    .el-checkbox__inner {
      width: 16px;
      height: 16px;
    }

    // 选中态颜色与主题保持一致
    .el-checkbox__input.is-checked .el-checkbox__inner,
    .el-checkbox__input.is-indeterminate .el-checkbox__inner {
      background-color: #1677ff;
      border-color: #1677ff;
    }
  }

  ::v-deep .el-tag--success.is-plain {
    background-color: #ecfdf5;
    border-color: #a7f3d0;
    color: #047857;
  }

  ::v-deep .el-tag--danger.is-plain {
    background-color: #fef2f2;
    border-color: #fecaca;
    color: #b91c1c;
  }
</style>
