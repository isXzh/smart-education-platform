<template>
  <div class="personnel-management-page common-container">
    <!-- 页面标题和面包屑 -->
    <div class="page-header">
      <div class="breadcrumb">
        <span class="breadcrumb-item">基础信息管理</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">人员管理</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- Tab 切换 -->
      <div class="tab-header">
        <div class="tab-item" :class="{ active: activeTab === 'teacher' }" @click="handleTabChange('teacher')">
          教师管理
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'student' }" @click="handleTabChange('student')">
          学生管理
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="operation-bar">
        <div class="operation-left">
          <el-button type="primary" class="add-btn" @click="handleAdd">
            <i class="el-icon-plus"></i>
            新增{{ activeTab === 'teacher' ? '教师' : '学生' }}
          </el-button>
          <el-button class="batch-import-btn" @click="handleDownloadTemplate">
            <i class="el-icon-upload2"></i>
            下载导入模板
          </el-button>
          <el-button class="batch-import-btn" @click="handleBatchImport">
            <i class="el-icon-upload2"></i>
            批量导入
          </el-button>
          <el-button class="export-btn" @click="handleExport">
            <i class="el-icon-download"></i>
            导出
          </el-button>
          <el-button class="delete-btn" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
            <i class="el-icon-delete"></i>
            删除
          </el-button>
        </div>

        <div class="operation-right">
          <el-input
            v-model="searchKeyword"
            :placeholder="activeTab === 'teacher' ? '搜索姓名/工号/手机号' : '搜索姓名/学号/家长手机'"
            prefix-icon="el-icon-search"
            class="search-input"
            clearable
            @change="handleSearchChange"
          />
          <el-select
            v-model="statusFilter"
            placeholder="全部状态"
            class="status-select"
            clearable
            @change="handleStatusChange"
          >
            <el-option label="全部状态" value="" />
            <template v-if="activeTab === 'teacher'">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </template>
            <template v-else>
              <el-option label="在读" :value="1" />
              <el-option label="休学" :value="2" />
              <el-option label="毕业" :value="3" />
            </template>
          </el-select>
          <el-select
            v-if="activeTab === 'teacher'"
            v-model="stageFilter"
            placeholder="选段"
            class="org-select"
            clearable
            @change="handleStageChange"
          >
            <el-option label="全部学段" value="" />
            <el-option v-for="stage in stageList" :key="stage.id" :label="stage.stageName" :value="stage.id" />
          </el-select>
          <el-select
            v-if="activeTab === 'student'"
            v-model="gradeFilter"
            placeholder="全部年级"
            class="grade-select"
            clearable
            @change="handleGradeChange"
          >
            <el-option label="全部年级" value="" />
            <el-option v-for="grade in gradeList" :key="grade.id" :label="grade.gradeName" :value="grade.id" />
          </el-select>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="table-container">
        <el-table
          :key="activeTab"
          :data="tableData"
          style="width: 100%"
          :header-cell-style="headerCellStyle"
          :cell-style="cellStyle"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column type="index" label="序号" width="100" align="center" />

          <!-- 教师表格列 -->
          <template v-if="activeTab === 'teacher'">
            <el-table-column label="姓名" min-width="100">
              <template #default="{ row }">
                <span class="name-text">{{ row.teacherName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="teacherCode" label="工号" min-width="120" />
            <el-table-column label="性别" min-width="80" align="center">
              <template #default="{ row }">
                <span>{{ row.gender === 1 ? '男' : '女' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="所属学段" min-width="120">
              <template #default="{ row }">
                <span>{{ stageMap[row.stageId] || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="orgNamePath" label="所属组织" min-width="120" />
            <el-table-column prop="phone" label="手机号" min-width="120" />
          </template>

          <!-- 学生表格列 -->
          <template v-else>
            <el-table-column label="姓名" min-width="100">
              <template #default="{ row }">
                <span class="name-text">{{ row.studentName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="studentCode" label="学号" min-width="120" />
            <el-table-column label="性别" min-width="80" align="center">
              <template #default="{ row }">
                <span>{{ row.gender === 1 ? '男' : '女' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="所属学段" min-width="120">
              <template #default="{ row }">
                <span>{{ stageMap[row.stageId] || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="gradeName" label="所属年级" min-width="100" />
            <el-table-column prop="className" label="所属班级" min-width="200" />
            <el-table-column prop="parentPhone" label="家长手机" min-width="120" />
          </template>

          <!-- 公共列 -->
          <el-table-column label="状态" min-width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="getStatusType(row.status)" effect="light">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="280" fixed="right" align="center">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button @click="handleEdit(row)" type="text" size="small" class="edit-btn">
                  <i class="el-icon-edit"></i>
                  编辑
                </el-button>
                <el-button type="text" size="small" class="reset-btn" @click="resetPassword(row)">
                  <i class="el-icon-refresh-left"></i>
                  重置密码
                </el-button>
                <el-button type="text" size="small" class="delete-btn" @click="handleDelete(row.id)">
                  <i class="el-icon-delete"></i>
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <div class="pagination-left">
          显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, total) }} 条，共
          {{ total }} 条
        </div>
        <el-pagination
          background
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="prev, pager, next, jumper"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>

      <!-- 弹窗组件 -->
      <teacher-dialog
        :visible.sync="teacherDialogVisible"
        :title="dialogTitle"
        :edit-data="editData"
        @confirm="handleDialogConfirm"
      />

      <student-dialog
        :visible.sync="studentDialogVisible"
        :title="dialogTitle"
        :edit-data="editData"
        @confirm="handleDialogConfirm"
      />
    </div>
  </div>
</template>

<script>
  import TeacherDialog from './dialog/TeacherDialog.vue';
  import StudentDialog from './dialog/StudentDialog.vue';
  import teacherApi from '@/api/teacher.js';
  import studentApi from '@/api/student.js';
  import gradeApi from '@/api/grade.js';
  import classApi from '@/api/class.js';
  import baseApi from '@/api/base.js';
  import orgStructureApi from '@/api/orgStructure.js';
  export default {
    name: 'PersonnelManagement',
    components: {
      TeacherDialog,
      StudentDialog,
    },
    data() {
      return {
        // Tab 切换
        activeTab: 'teacher',

        // 搜索筛选
        searchKeyword: '',
        statusFilter: '',
        stageFilter: '',
        gradeFilter: '',

        // 分页
        currentPage: 1,
        pageSize: 10,
        total: 0,

        // 数据列表
        teacherList: [],
        studentList: [],

        // 筛选列表
        stageList: [],
        gradeList: [],

        // 选中项
        selectedIds: [],

        // 弹窗相关
        teacherDialogVisible: false,
        studentDialogVisible: false,
        dialogTitle: '',
        editData: null,

        // 加载状态
        loading: false,
      };
    },
    computed: {
      tableData() {
        return this.activeTab === 'teacher' ? this.teacherList : this.studentList;
      },
      stageMap() {
        const map = {};
        this.stageList.forEach(stage => {
          map[stage.id] = stage.stageName;
        });
        return map;
      },
    },
    mounted() {
      this.loadStageList();
      this.loadGradeList();
      this.loadTeacherList();
    },
    methods: {
      async loadStageList() {
        try {
          const res = await baseApi.stageList();
          if (res.code === 200) {
            this.stageList = res.data || [];
          }
        } catch (error) {
          console.error('加载学段列表失败:', error);
        }
      },
      async loadGradeList() {
        try {
          const res = await gradeApi.list();
          if (res.code === 200) {
            this.gradeList = res.data || [];
          }
        } catch (error) {
          console.error('加载年级列表失败:', error);
        }
      },
      async loadTeacherList() {
        this.loading = true;
        try {
          const params = {
            pageNum: this.currentPage,
            pageSize: this.pageSize,
            keyword: this.searchKeyword,
            status: this.statusFilter,
            stageId: this.stageFilter,
          };
          const res = await teacherApi.page(params);
          if (res.code === 200) {
            this.teacherList = res.data.list || [];
            this.total = res.data.total || 0;
          }
        } catch (error) {
          console.error('加载教师列表失败:', error);
          this.$message.error('加载教师列表失败');
        } finally {
          this.loading = false;
        }
      },
      async loadStudentList() {
        this.loading = true;
        try {
          const params = {
            pageNum: this.currentPage,
            pageSize: this.pageSize,
            keyword: this.searchKeyword,
            status: this.statusFilter,
            gradeId: this.gradeFilter,
          };
          const res = await studentApi.page(params);
          if (res.code === 200) {
            this.studentList = res.data.list || [];
            this.total = res.data.total || 0;
          }
        } catch (error) {
          console.error('加载学生列表失败:', error);
          this.$message.error('加载学生列表失败');
        } finally {
          this.loading = false;
        }
      },
      async handleDownloadTemplate() {
        try {
          const api = this.activeTab === 'teacher' ? teacherApi : studentApi;
          const blob = await api.downloadTemplate();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${this.activeTab === 'teacher' ? '教师' : '学生'}导入模板.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          this.$message.success('模板下载成功');
        } catch (error) {
          console.error('下载模板失败:', error);
          this.$message.error('下载模板失败');
        }
      },
      async handleBatchImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        input.onchange = async e => {
          const file = e.target.files[0];
          if (!file) return;
          const formData = new FormData();
          formData.append('file', file);
          try {
            const api = this.activeTab === 'teacher' ? teacherApi : studentApi;
            const res = await api.import(formData);
            if (res.code === 200) {
              this.$message.success('导入成功');
              if (this.activeTab === 'teacher') {
                this.loadTeacherList();
              } else {
                this.loadStudentList();
              }
            }
          } catch (error) {
            console.error('导入失败:', error);
            this.$message.error('导入失败');
          }
        };
        input.click();
      },
      async handleExport() {
        if (this.selectedIds.length === 0) {
          this.$message.warning('请选择要导出的数据');
          return;
        }
        try {
          const api = this.activeTab === 'teacher' ? teacherApi : studentApi;
          const blob = await api.export(this.selectedIds);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${this.activeTab === 'teacher' ? '教师' : '学生'}数据.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          this.$message.success('导出成功');
        } catch (error) {
          console.error('导出失败:', error);
          this.$message.error('导出失败');
        }
      },
      async handleDelete(id) {
        this.$confirm('确认删除该数据?', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(async () => {
            try {
              const api = this.activeTab === 'teacher' ? teacherApi : studentApi;
              let arr = [];
              arr.push(id);
              const res = await api.delete(arr);
              if (res.code === 200) {
                this.$message.success('删除成功');
                if (this.activeTab === 'teacher') {
                  this.loadTeacherList();
                } else {
                  this.loadStudentList();
                }
              }
            } catch (error) {
              console.error('删除失败:', error);
              this.$message.error('删除失败');
            }
          })
          .catch(() => {});
      },
      async handleBatchDelete() {
        if (this.selectedIds.length === 0) {
          this.$message.warning('请选择要删除的数据');
          return;
        }
        this.$confirm(`确认删除选中的 ${this.selectedIds.length} 条数据?`, '批量删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(async () => {
            try {
              const api = this.activeTab === 'teacher' ? teacherApi : studentApi;
              const promises = this.selectedIds.map(id => api.delete(id));
              const res = await api.delete([...this.selectedIds]);
              if (res.code === 200) {
                this.$message.success('批量删除成功');
              }
              this.selectedIds = [];
              if (this.activeTab === 'teacher') {
                this.loadTeacherList();
              } else {
                this.loadStudentList();
              }
            } catch (error) {
              console.error('批量删除失败:', error);
              this.$message.error('批量删除失败');
            }
          })
          .catch(() => {});
      },
      async resetPassword(row) {
        this.$confirm('确认重置密码，重置后密码为123456?', '重置密码', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'confirm-reset-btn',
        })
          .then(async () => {
            try {
              const api = this.activeTab === 'teacher' ? teacherApi : studentApi;
              const res = await api.resetPassword(row.id);
              if (res.code === 200) {
                this.$message.success('重置密码成功');
              }
            } catch (error) {
              console.error('重置密码失败:', error);
              this.$message.error('重置密码失败');
            }
          })
          .catch(() => {});
      },

      handleAdd() {
        if (this.activeTab === 'teacher') {
          this.dialogTitle = '新增教师';
          this.editData = null;
          this.teacherDialogVisible = true;
        } else {
          this.dialogTitle = '新增学生';
          this.editData = null;
          this.studentDialogVisible = true;
        }
      },

      handleEdit(row) {
        if (this.activeTab === 'teacher') {
          this.dialogTitle = '编辑教师';
          this.editData = { ...row };
          this.teacherDialogVisible = true;
        } else {
          this.dialogTitle = '编辑学生';
          this.editData = { ...row };
          this.studentDialogVisible = true;
        }
      },
      handleTabChange(tab) {
        if (this.activeTab === tab) return;
        this.activeTab = tab;
        this.currentPage = 1;
        this.searchKeyword = '';
        this.statusFilter = '';
        this.stageFilter = '';
        this.gradeFilter = '';
        this.selectedIds = [];
        if (tab === 'teacher') {
          this.loadTeacherList();
        } else {
          this.loadStudentList();
        }
      },

      handleCurrentChange(page) {
        this.currentPage = page;
        if (this.activeTab === 'teacher') {
          this.loadTeacherList();
        } else {
          this.loadStudentList();
        }
      },

      handleSizeChange(size) {
        this.pageSize = size;
        this.currentPage = 1;
        if (this.activeTab === 'teacher') {
          this.loadTeacherList();
        } else {
          this.loadStudentList();
        }
      },

      handleSearchChange() {
        this.currentPage = 1;
        if (this.activeTab === 'teacher') {
          this.loadTeacherList();
        } else {
          this.loadStudentList();
        }
      },

      handleStatusChange() {
        this.currentPage = 1;
        if (this.activeTab === 'teacher') {
          this.loadTeacherList();
        } else {
          this.loadStudentList();
        }
      },

      handleStageChange() {
        this.currentPage = 1;
        this.loadTeacherList();
      },

      handleGradeChange() {
        this.currentPage = 1;
        this.loadStudentList();
      },

      getStatusText(status) {
        if (this.activeTab === 'teacher') {
          return status === 1 ? '在职' : '离职';
        } else {
          const statusMap = {
            1: '在读',
            2: '休学',
            3: '毕业',
          };
          return statusMap[status] || '-';
        }
      },

      getStatusType(status) {
        if (this.activeTab === 'teacher') {
          return status === 1 ? 'success' : 'info';
        } else {
          const typeMap = {
            1: 'success',
            2: 'warning',
            3: 'info',
          };
          return typeMap[status] || 'info';
        }
      },

      // 表格选择
      handleSelectionChange(selection) {
        this.selectedIds = selection.map(item => item.id);
      },

      // 表格样式
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

      async handleDialogConfirm(formData) {
        try {
          if (this.activeTab === 'teacher') {
            if (formData.id) {
              const res = await teacherApi.update(formData.id, formData);
              if (res.code === 200) {
                this.$message.success('修改教师成功');
                this.loadTeacherList();
              }
            } else {
              const res = await teacherApi.add(formData);
              if (res.code === 200) {
                this.$message.success('新增教师成功');
                this.loadTeacherList();
              } else {
                this.$message.error(res.message ? res.message : '新增教师失败');
              }
            }
          } else {
            if (formData.id) {
              const res = await studentApi.update(formData.id, formData);
              if (res.code === 200) {
                this.$message.success('修改学生成功');
                this.loadStudentList();
              }
            } else {
              const res = await studentApi.add(formData);
              if (res.code === 200) {
                this.$message.success('新增学生成功');
                this.loadStudentList();
              }
            }
          }
          this.teacherDialogVisible = false;
          this.studentDialogVisible = false;
        } catch (error) {
          console.error('保存失败:', error);
          this.$message.error('保存失败');
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .personnel-management-page {
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

  // Tab 切换
  .tab-header {
    display: flex;
    gap: 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #e5e7eb;

    .tab-item {
      padding: 12px 24px;
      font-size: 14px;
      color: #6b7280;
      cursor: pointer;
      position: relative;
      transition: all 0.3s;

      &:hover {
        color: #4f46e5;
      }

      &.active {
        color: #4f46e5;
        font-weight: 500;

        &::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #4f46e5;
        }
      }
    }
  }

  // 操作栏
  .operation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 16px;

    .operation-left {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;

      // .add-btn {
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

      .batch-import-btn,
      .export-btn {
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
        border: 1px solid #ef4444;
        color: #ef4444;
        background: #fff;

        &:not(:disabled):hover {
          background: #ef4444;
          color: #fff;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        i {
          margin-right: 6px;
        }
      }
    }

    .operation-right {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;

      .search-input {
        width: 220px;

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

      .status-select,
      .org-select,
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

      .el-table__column--selection {
        .cell {
          display: block;
          text-align: center;
          padding: 0;
          line-height: normal;
        }
      }
    }
  }

  // 姓名文字
  .name-text {
    color: #111827;
    font-weight: 500;
  }

  // 表格操作
  .table-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    align-items: center;

    .el-button {
      padding: 0;
      font-size: 13px;

      i {
        font-size: 13px;
        margin-right: 4px;
      }

      &.edit-btn {
        color: #4f46e5;

        &:hover {
          color: #4338ca;
        }
      }

      &.reset-btn {
        color: #f59e0b;

        &:hover {
          color: #d97706;
        }
      }

      &.delete-btn {
        color: #ef4444;

        &:hover {
          color: #dc2626;
        }
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
<style>
  .el-message-box__btns .confirm-reset-btn {
    background-color: #ff4d4f !important;
    border-color: #ff4d4f !important;
  }

  .el-message-box__btns .el-button--primary:hover,
  .el-message-box__btns .el-button--primary:focus {
    background-color: #ff4d4f !important;
    border-color: #ff4d4f !important;
  }
</style>
