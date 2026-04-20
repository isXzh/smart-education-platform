<template>
  <div class="classes-management-page common-container">
    <!-- 页面标题和面包屑 -->
    <div class="page-header">
      <div class="breadcrumb">
        <span class="breadcrumb-item">基础信息管理</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">班级管理</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 页面标题栏 -->
      <div class="content-header">
        <div class="header-actions-left">
          <el-button type="primary" class="add-class-btn" @click="handleAddClass">
            <i class="el-icon-plus"></i>
            新增班级
          </el-button>
          <el-button class="action-btn" @click="handleBatchImport">
            <i class="el-icon-upload2"></i>
            批量导入
          </el-button>
          <el-button class="action-btn" @click="handleExport">
            <i class="el-icon-download"></i>
            导出
          </el-button>
          <el-button class="delete-btn" @click="handleBatchDelete">
            <i class="el-icon-delete"></i>
            删除
          </el-button>
        </div>
        <div class="header-actions-right">
          <el-input
            v-model="searchText"
            placeholder="搜索班级名称"
            prefix-icon="el-icon-search"
            class="search-input"
            clearable
            @input="handleSearch"
          />
          <el-select
            v-model="selectedStage"
            placeholder="全部学段"
            class="stage-select"
            clearable
            @change="handleStageChange"
          >
            <el-option
              v-for="stage in stageList"
              :key="stage.id"
              :label="stage.stageName"
              :value="stage.id"
            />
          </el-select>
          <el-select
            v-model="selectedGrade"
            placeholder="全部年级"
            class="grade-select"
            clearable
            @change="handleGradeChange"
          >
            <el-option
              v-for="grade in gradeList"
              :key="grade.id"
              :label="grade.gradeName"
              :value="grade.id"
            />
          </el-select>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="table-container">
        <el-table
          :data="classList"
          style="width: 100%"
          :header-cell-style="headerCellStyle"
          :cell-style="cellStyle"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" align="center" />

          <el-table-column label="班级名称" min-width="120">
            <template #default="{ row }">
              <span class="class-name">{{ row.className }}</span>
            </template>
          </el-table-column>

          <el-table-column label="所属学段" min-width="100">
            <template #default="{ row }">
              <el-tag size="small" :type="getStageTagType(row.stageName)" effect="plain">
                {{ row.stageName }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="所属年级" min-width="100">
            <template #default="{ row }">
              <span>{{ row.gradeName }}</span>
            </template>
          </el-table-column>

          <el-table-column label="班主任" min-width="100">
            <template #default="{ row }">
              <span>{{ row.teacherName || '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="教室" min-width="120">
            <template #default="{ row }">
              <span>{{ row.classroomName || '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="sortOrder" label="排序" min-width="80" align="center" />

          <el-table-column label="状态" min-width="100" align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                active-color="#10b981"
                inactive-color="#d1d5db"
                @change="handleStatusChange(row)"
              />
            </template>
          </el-table-column>

          <el-table-column label="操作" width="100" fixed="right" align="center">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button type="text" size="small" @click="handleEditClass(row)">
                  <i class="el-icon-edit"></i>
                </el-button>
                <el-button type="text" size="small" class="delete-btn" @click="handleDeleteClass(row)">
                  <i class="el-icon-delete"></i>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <div class="pagination-left">
          <span>每页显示</span>
          <el-select v-model="pageSize" class="page-size-select" @change="handlePageSizeChange">
            <el-option label="10条" :value="10" />
            <el-option label="20条" :value="20" />
            <el-option label="50条" :value="50" />
          </el-select>
        </div>
        <div class="pagination-right">
          <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 新增/编辑班级弹窗 -->
    <class-dialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      :edit-data="editData"
      :stage-list="stageList"
      :grade-list="gradeList"
      :teacher-list="teacherList"
      @confirm="handleDialogConfirm"
    />

    <!-- 批量导入弹窗 -->
    <class-import-dialog :visible.sync="importDialogVisible" @confirm="handleImportConfirm" />
  </div>
</template>

<script>
  import ClassDialog from './dialog/ClassDialog.vue';
  import ClassImportDialog from './dialog/ClassImportDialog.vue';
  import classApi from '@/api/class';
  import gradeLevelApi from '@/api/gradeLevel';
  import gradeApi from '@/api/grade';

  export default {
    name: 'ClassesManagement',
    components: {
      ClassDialog,
      ClassImportDialog,
    },
    data() {
      return {
        searchText: '',
        selectedStage: '',
        selectedGrade: '',
        dialogVisible: false,
        importDialogVisible: false,
        dialogTitle: '新增班级',
        editData: null,
        classList: [],
        stageList: [],
        gradeList: [],
        teacherList: [],
        selectedRows: [],
        currentPage: 1,
        pageSize: 10,
        total: 0,
        searchTimer: null,
      };
    },
    created() {
      this.loadStageList();
      this.loadGradeList();
      this.loadTeacherList();
      this.loadClassList();
    },
    methods: {
      async loadStageList() {
        try {
          const res = await gradeLevelApi.list();
          this.stageList = res.data || [];
        } catch (error) {
          console.error('加载学段列表失败:', error);
          this.$message.error('加载学段列表失败');
        }
      },
      async loadGradeList() {
        try {
          const res = await gradeApi.list();
          this.gradeList = res.data || [];
        } catch (error) {
          console.error('加载年级列表失败:', error);
          this.$message.error('加载年级列表失败');
        }
      },
      async loadTeacherList() {
        try {
          const res = await classApi.teacherList();
          this.teacherList = res.data || [];
        } catch (error) {
          console.error('加载教师列表失败:', error);
          this.$message.error('加载教师列表失败');
        }
      },
      async loadClassList() {
        try {
          const params = {
            pageNum: this.currentPage,
            pageSize: this.pageSize,
            stageId: this.selectedStage,
            gradeId: this.selectedGrade,
            keyword: this.searchText,
          };
          const res = await classApi.page(params);
          this.classList = res.data?.list || [];
          this.total = res.data?.total || 0;
        } catch (error) {
          console.error('加载班级列表失败:', error);
          this.$message.error('加载班级列表失败');
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
        };
        return types[stageName] || '';
      },
      handleSearch() {
        if (this.searchTimer) {
          clearTimeout(this.searchTimer);
        }
        this.searchTimer = setTimeout(() => {
          this.loadClassList();
        }, 300);
      },
      handleStageChange() {
        this.loadClassList();
      },
      handleGradeChange() {
        this.loadClassList();
      },
      handleSelectionChange(selection) {
        this.selectedRows = selection;
      },
      handleAddClass() {
        this.dialogTitle = '新增班级';
        this.editData = null;
        this.dialogVisible = true;
      },
      handleEditClass(row) {
        this.dialogTitle = '编辑班级';
        this.editData = { ...row };
        this.dialogVisible = true;
      },
      async handleDeleteClass(row) {
        try {
          await this.$confirm(`确认删除班级 "${row.className}" 吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          });
          await classApi.delete([row.id]);
          this.$message.success('删除成功');
          await this.loadClassList();
        } catch (error) {
          if (error !== 'cancel') {
            this.$message.error('删除失败');
          }
        }
      },
      async handleBatchDelete() {
        if (this.selectedRows.length === 0) {
          this.$message.warning('请选择要删除的班级');
          return;
        }
        try {
          await this.$confirm(`确认删除选中的 ${this.selectedRows.length} 个班级吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          });
          const ids = this.selectedRows.map(row => row.id);
          await classApi.delete(ids);
          this.$message.success('批量删除成功');
          await this.loadClassList();
        } catch (error) {
          if (error !== 'cancel') {
            this.$message.error('批量删除失败');
          }
        }
      },
      handleBatchImport() {
        this.importDialogVisible = true;
      },
      async handleExport() {
        if (this.selectedRows.length === 0) {
          this.$message.warning('请选择要导出的班级');
          return;
        }
        try {
          const ids = this.selectedRows.map(row => row.id);
          const response = await classApi.export(ids);
          
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = '班级数据.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          this.$message.success('导出成功');
        } catch (error) {
          this.$message.error('导出失败');
        }
      },
      async handleStatusChange(row) {
        try {
          this.$message.success(row.status === 1 ? '已启用' : '已禁用');
        } catch (error) {
          this.$message.error('状态更新失败');
          row.status = row.status === 1 ? 0 : 1;
        }
      },
      async handleDialogConfirm(formData) {
        try {
          if (this.editData) {
            await classApi.update(this.editData.id, formData);
            this.$message.success('编辑成功');
          } else {
            await classApi.add(formData);
            this.$message.success('新增成功');
          }
          this.dialogVisible = false;
          await this.loadClassList();
        } catch (error) {
          this.$message.error(this.editData ? '编辑失败' : '新增失败');
        }
      },
      handleImportConfirm() {
        this.loadClassList();
      },
      handlePageSizeChange() {
        this.currentPage = 1;
        this.loadClassList();
      },
      handleCurrentChange(page) {
        this.currentPage = page;
        this.loadClassList();
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
  .classes-management-page {
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
    gap: 16px;

    .header-actions-left {
      display: flex;
      gap: 12px;

      .add-class-btn {
        background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;

        &:hover {
          background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
        }

        i {
          margin-right: 6px;
        }
      }

      .action-btn {
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

      .delete-btn {
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        border: 1px solid #e5e7eb;
        color: #ef4444;

        &:hover {
          border-color: #ef4444;
          background: #fef2f2;
        }

        i {
          margin-right: 6px;
        }
      }
    }

    .header-actions-right {
      display: flex;
      gap: 12px;
      align-items: center;

      .search-input {
        width: 200px;

        ::v-deep .el-input__inner {
          border-radius: 8px;
          border-color: #e5e7eb;
          background: #f9fafb;
          height: 40px;

          &:focus {
            border-color: #4f46e5;
            background: #fff;
          }

          &::placeholder {
            color: #9ca3af;
          }
        }
      }

      .stage-select,
      .grade-select {
        width: 120px;

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

    .class-name {
      color: #111827;
      font-weight: 500;
    }
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
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #6b7280;

      .page-size-select {
        width: 80px;

        ::v-deep .el-input__inner {
          border-radius: 6px;
          border-color: #e5e7eb;
        }
      }
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
