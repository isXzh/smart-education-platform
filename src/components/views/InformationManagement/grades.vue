<template>
  <div class="grades-management-page common-container">
    <!-- 页面标题和面包屑 -->
    <div class="page-header">
      <div class="breadcrumb">
        <span class="breadcrumb-item">基础信息管理</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">年级管理</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 页面标题栏 -->
      <div class="content-header">
        <div class="title-section">
          <i class="el-icon-s-order"></i>
          <span class="title">年级管理</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" class="add-grade-btn" @click="handleAddGrade">
            <i class="el-icon-plus"></i>
            新增年级
          </el-button>
          <el-button class="import-btn" @click="handleBatchImport">
            <i class="el-icon-upload2"></i>
            批量导入
          </el-button>
        </div>
      </div>

      <!-- 搜索筛选栏 -->
      <div class="search-bar">
        <div class="search-left">
          <el-input
            v-model="searchText"
            placeholder="搜索年级名称"
            prefix-icon="el-icon-search"
            class="search-input"
            clearable
            @input="handleSearch"
          />
        </div>
        <div class="search-right">
          <el-select
            v-model="selectedStage"
            placeholder="全部学段"
            class="stage-select"
            clearable
            @change="handleStageChange"
          >
            <el-option v-for="stage in stageList" :key="stage.id" :label="stage.stageName" :value="stage.id" />
          </el-select>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="table-container">
        <el-table :data="gradeList" style="width: 100%" :header-cell-style="headerCellStyle" :cell-style="cellStyle">
          <el-table-column type="index" label="序号" width="80" align="center" />

          <el-table-column label="年级名称" min-width="200">
            <template #default="{ row }">
              <div class="grade-name-cell">
                <div class="grade-icon">
                  <i class="el-icon-s-flag"></i>
                </div>
                <span>{{ row.gradeName }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="所属学段" min-width="150">
            <template #default="{ row }">
              <el-tag size="small" :type="getStageTagType(row.stageName)" effect="plain">
                {{ row.stageName }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="sortOrder" label="排序" min-width="100" align="center" />

          <el-table-column label="状态" min-width="120" align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                active-color="#10b981"
                inactive-color="#d1d5db"
                @change="handleStatusChange(row)"
              />
              <span class="status-text">{{ row.status === 1 ? '启用' : '禁用' }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />

          <el-table-column label="操作" width="120" fixed="right" align="center">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button type="text" size="small" @click="handleEditGrade(row)">
                  <i class="el-icon-edit"></i>
                </el-button>
                <el-button type="text" size="small" class="delete-btn" @click="handleDeleteGrade(row)">
                  <i class="el-icon-delete"></i>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 使用提示 -->
      <div class="tips-section">
        <div class="tips-header">
          <i class="el-icon-info"></i>
          <span>使用提示：</span>
        </div>
        <ul class="tips-list">
          <li>年级名称在同一学段下不能重复</li>
          <li>不同学段的年级需要分别创建，方便按学段管理</li>
          <li>禁用的年级在排课时将不可选择</li>
          <li>排序号越小，显示越靠前</li>
        </ul>
      </div>
    </div>

    <!-- 新增/编辑年级弹窗 -->
    <grade-dialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      :edit-data="editData"
      :stage-list="stageList"
      @confirm="handleDialogConfirm"
    />

    <!-- 批量导入弹窗 -->
    <grade-import-dialog :visible.sync="importDialogVisible" @confirm="handleImportConfirm" />
  </div>
</template>

<script>
  import GradeDialog from './dialog/GradeDialog.vue';
  import GradeImportDialog from './dialog/GradeImportDialog.vue';
  import gradeApi from '@/api/base.js';

  export default {
    name: 'GradesManagement',
    components: {
      GradeDialog,
      GradeImportDialog,
    },
    data() {
      return {
        searchText: '',
        selectedStage: '',
        dialogVisible: false,
        importDialogVisible: false,
        dialogTitle: '新增年级',
        editData: null,
        gradeList: [],
        stageList: [],
        searchTimer: null,
      };
    },
    created() {
      this.loadStageList();
      this.loadGradeList();
    },
    methods: {
      async loadStageList() {
        try {
          const result = await gradeApi.stageList();
          this.stageList = result.data || [];
        } catch (error) {
          this.$message.error('加载学段列表失败');
        }
      },
      async loadGradeList() {
        try {
          const params = {};
          if (this.searchText) {
            params.gradeName = this.searchText;
          }
          if (this.selectedStage) {
            params.stageId = this.selectedStage;
          }
          const result = await gradeApi.gradeList(params);
          this.gradeList = result.data || [];
        } catch (error) {
          this.$message.error('加载年级列表失败');
        }
      },
      headerCellStyle() {
        return {
          background: '#f9fafb',
          color: '#374151',
          fontWeight: 500,
          fontSize: '13px',
          padding: '12px 16px',
        };
      },
      cellStyle() {
        return {
          padding: '12px 16px',
          color: '#4b5563',
        };
      },
      getStageTagType(stageName) {
        const types = {
          小学: 'primary',
          初中: 'success',
          高中: 'warning',
          幼儿园: 'info',
        };
        return types[stageName] || '';
      },
      handleSearch() {
        if (this.searchTimer) {
          clearTimeout(this.searchTimer);
        }
        this.searchTimer = setTimeout(() => {
          this.loadGradeList();
        }, 300);
      },
      handleStageChange() {
        this.loadGradeList();
      },
      handleAddGrade() {
        this.dialogTitle = '新增年级';
        this.editData = null;
        this.dialogVisible = true;
      },
      handleEditGrade(row) {
        this.dialogTitle = '编辑年级';
        this.editData = { ...row };
        this.dialogVisible = true;
      },
      async handleDeleteGrade(row) {
        try {
          await this.$confirm(`确认删除年级 "${row.gradeName}" 吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          });
          await gradeApi.delete(row.id);
          this.$message.success('删除成功');
          await this.loadGradeList();
        } catch (error) {
          if (error !== 'cancel') {
            this.$message.error('删除失败');
          }
        }
      },
      async handleStatusChange(row) {
        try {
          const updateData = {
            gradeName: row.gradeName,
            stageId: row.stageId,
            sortOrder: row.sortOrder,
            status: row.status,
            remark: row.remark || '',
          };
          await gradeApi.update(row.id, updateData);
          this.$message.success(row.status === 1 ? '已启用' : '已禁用');
        } catch (error) {
          this.$message.error('状态更新失败');
          row.status = row.status === 1 ? 0 : 1;
        }
      },
      async handleDialogConfirm(formData) {
        try {
          if (this.editData) {
            await gradeApi.update(this.editData.id, formData);
            this.$message.success('编辑成功');
          } else {
            await gradeApi.add(formData);
            this.$message.success('新增成功');
          }
          this.dialogVisible = false;
          await this.loadGradeList();
        } catch (error) {
          this.$message.error(this.editData ? '编辑失败' : '新增失败');
        }
      },
      handleBatchImport() {
        this.importDialogVisible = true;
      },
      handleImportConfirm(file) {
        this.loadGradeList();
      },
    },
    beforeDestroy() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
    },
  };
</script>

<style lang="scss" scoped>
  .grades-management-page {
    min-height: 100%;
    background: #f3f4f6;
    padding: 16px 24px;
  }

  // 页面头部
  .page-header {
    margin-bottom: 16px;

    .breadcrumb {
      font-size: 14px;
      color: #6b7280;

      .breadcrumb-item {
        &.active {
          color: #374151;
          font-weight: 500;
        }
      }

      .breadcrumb-separator {
        margin: 0 8px;
        color: #d1d5db;
      }
    }
  }

  // 主内容区
  .main-content {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    padding: 24px;
  }

  // 内容头部
  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .title-section {
      display: flex;
      align-items: center;
      gap: 12px;

      i {
        font-size: 24px;
        color: #4f46e5;
      }

      .title {
        font-size: 20px;
        font-weight: 600;
        color: #111827;
      }

      .stats-tags {
        display: flex;
        gap: 8px;
        margin-left: 8px;

        .stat-tag {
          font-size: 12px;
          padding: 2px 10px;
          border-radius: 12px;
          font-weight: 500;

          &.total {
            background: #eff6ff;
            color: #3b82f6;
          }

          &.enabled {
            background: #ecfdf5;
            color: #10b981;
          }

          &.disabled {
            background: #f3f4f6;
            color: #6b7280;
          }
        }
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;

      // .add-grade-btn {
      //   background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
      //   border: none;
      //   padding: 10px 20px;
      //   border-radius: 8px;
      //   font-size: 14px;

      //   &:hover {
      //     background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
      //   }

      //   i {
      //     margin-right: 6px;
      //   }
      // }

      .import-btn {
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        border: 1px solid #e5e7eb;
        color: #4b5563;

        &:hover {
          border-color: #4f46e5;
          color: #4f46e5;
        }

        i {
          margin-right: 6px;
        }
      }
    }
  }

  // 搜索栏
  .search-bar {
    display: flex;
    //   justify-content: space-between;
    gap: 20px;
    align-items: center;
    margin-bottom: 20px;

    .search-left {
      .search-input {
        width: 300px;

        ::v-deep .el-input__inner {
          border-radius: 8px;
          border-color: #e5e7eb;
          background: #f9fafb;
          height: 40px;
          padding-left: 40px;

          &:focus {
            border-color: #4f46e5;
            background: #fff;
          }

          &::placeholder {
            color: #9ca3af;
          }
        }

        ::v-deep .el-input__prefix {
          left: 12px;

          i {
            color: #9ca3af;
            font-size: 16px;
          }
        }
      }
    }

    .search-right {
      .stage-select {
        width: 180px;

        ::v-deep .el-input__inner {
          border-radius: 8px;
          border-color: #e5e7eb;
          background: #f9fafb;
          height: 40px;

          &:focus {
            border-color: #4f46e5;
            background: #fff;
          }
        }
      }
    }
  }

  // 表格容器
  .table-container {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    margin-bottom: 20px;

    ::v-deep .el-table {
      font-size: 14px;

      &::before {
        display: none;
      }

      .el-table__header {
        th {
          background: #f9fafb;
          color: #374151;
          font-weight: 500;
          font-size: 13px;
          border-bottom: 1px solid #e5e7eb;
          padding: 12px 16px;
        }
      }

      .el-table__row {
        td {
          border-bottom: 1px solid #f3f4f6;
          padding: 12px 16px;
          color: #4b5563;
        }

        &:hover {
          background: #f9fafb;
        }
      }

      .el-table__empty-block {
        padding: 40px 0;
      }
    }
  }

  // 年级名称单元格
  .grade-name-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    .grade-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 14px;
        color: #fff;
      }
    }

    span {
      color: #111827;
      font-weight: 500;
    }
  }

  // 状态文本
  .status-text {
    margin-left: 8px;
    font-size: 13px;
    color: #6b7280;
  }

  // 表格操作
  .table-actions {
    display: flex;
    gap: 8px;
    justify-content: center;

    .el-button {
      padding: 4px 8px;
      font-size: 14px;

      i {
        font-size: 14px;
      }

      &:hover {
        color: #4f46e5;
      }
    }

    .delete-btn {
      color: #ef4444;

      &:hover {
        color: #dc2626;
      }
    }
  }

  // 分页容器
  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;

    .pagination-left {
      font-size: 14px;
      color: #6b7280;
    }

    ::v-deep .el-pagination {
      .btn-prev,
      .btn-next {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        color: #6b7280;

        &:disabled {
          opacity: 0.5;
        }
      }

      .el-pager {
        li {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          color: #4b5563;
          font-weight: 500;
          margin: 0 4px;

          &.active {
            background: #4f46e5;
            border-color: #4f46e5;
            color: #fff;
          }

          &:hover:not(.active) {
            border-color: #4f46e5;
            color: #4f46e5;
          }
        }
      }

      .el-pagination__jump {
        color: #6b7280;

        .el-input__inner {
          border-radius: 6px;
          border-color: #e5e7eb;
        }
      }
    }
  }

  // 提示区域
  .tips-section {
    margin-top: 20px;
    padding: 16px 20px;
    background: #eff6ff;
    border-radius: 8px;

    .tips-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;

      i {
        color: #3b82f6;
        font-size: 16px;
      }

      span {
        color: #1d4ed8;
        font-weight: 500;
        font-size: 14px;
      }
    }

    .tips-list {
      margin: 0;
      padding-left: 24px;
      list-style: disc;

      li {
        color: #3b82f6;
        font-size: 13px;
        line-height: 1.8;
      }
    }
  }

  // 滚动条样式
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
</style>
