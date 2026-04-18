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
          <el-button class="batch-import-btn">
            <i class="el-icon-upload2"></i>
            批量导入
          </el-button>
          <el-button class="export-btn">
            <i class="el-icon-download"></i>
            导出
          </el-button>
          <el-button class="delete-btn" :disabled="selectedIds.length === 0">
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
          />
          <el-select v-model="statusFilter" placeholder="全部状态" class="status-select" clearable>
            <el-option label="全部状态" value="" />
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
          <el-select
            v-if="activeTab === 'teacher'"
            v-model="orgFilter"
            placeholder="全部组织"
            class="org-select"
            clearable
          >
            <el-option label="全部组织" value="" />
            <el-option v-for="org in organizationList" :key="org.id" :label="org.name" :value="org.id" />
          </el-select>
          <el-select
            v-if="activeTab === 'student'"
            v-model="gradeFilter"
            placeholder="全部年级"
            class="grade-select"
            clearable
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
                <span class="name-text">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="employeeNo" label="工号" min-width="120" />
            <el-table-column label="性别" min-width="80" align="center">
              <template #default="{ row }">
                <span>{{ row.gender === 1 ? '男' : '女' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="collegeName" label="所属学段" min-width="120" />
            <el-table-column prop="organizationName" label="所属组织" min-width="120" />
            <el-table-column prop="phone" label="手机号" min-width="120" />
          </template>

          <!-- 学生表格列 -->
          <template v-else>
            <el-table-column label="姓名" min-width="100">
              <template #default="{ row }">
                <span class="name-text">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="studentNo" label="学号" min-width="120" />
            <el-table-column label="性别" min-width="80" align="center">
              <template #default="{ row }">
                <span>{{ row.gender === 1 ? '男' : '女' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="collegeName" label="所属学院" min-width="120" />
            <el-table-column prop="gradeName" label="所属年级" min-width="100" />
            <el-table-column prop="className" label="所属班级" min-width="200" />
            <el-table-column prop="parentPhone" label="家长手机" min-width="120" />
          </template>

          <!-- 公共列 -->
          <el-table-column label="状态" min-width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.status === 1 ? 'success' : 'info'" effect="light">
                {{ row.status === 1 ? '启用' : '禁用' }}
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
                <el-button type="text" size="small" class="reset-btn" @click="resetPassword">
                  <i class="el-icon-refresh-left"></i>
                  重置密码
                </el-button>
                <el-button type="text" size="small" class="delete-btn">
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

  // 静态模拟数据
  const mockTeacherData = [
    {
      id: 1,
      name: '张明',
      employeeNo: 'T2024001',
      gender: 1,
      collegeName: '小学',
      organizationName: '小学部',
      phone: '138****0000',
      status: 1,
    },
    {
      id: 2,
      name: '李芳',
      employeeNo: 'T2024002',
      gender: 0,
      collegeName: '初中',
      organizationName: '初中部',
      phone: '139****1111',
      status: 1,
    },
    {
      id: 3,
      name: '王强',
      employeeNo: 'T2024003',
      gender: 1,
      collegeName: '高中',
      organizationName: '高中部',
      phone: '137****2222',
      status: 0,
    },
  ];

  const mockStudentData = [
    {
      id: 1,
      name: '李小红',
      studentNo: 'S202400123',
      gender: 0,
      collegeName: '初中',
      gradeName: '初一年级',
      className: '初一（2）班',
      parentPhone: '139****1111',
      status: 1,
    },
    {
      id: 2,
      name: '陈浩',
      studentNo: 'S202400124',
      gender: 1,
      collegeName: '小学',
      gradeName: '三年级',
      className: '301班',
      parentPhone: '138****3333',
      status: 1,
    },
    {
      id: 3,
      name: '刘洋',
      studentNo: 'S202400125',
      gender: 0,
      collegeName: '高中',
      gradeName: '高一年级',
      className: '高一（1）班',
      parentPhone: '136****4444',
      status: 2,
    },
  ];

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
        orgFilter: '',
        gradeFilter: '',

        // 分页
        currentPage: 1,
        pageSize: 10,
        total: 3,

        // 筛选列表
        organizationList: [
          { id: 1, name: '小学部' },
          { id: 2, name: '初中部' },
          { id: 3, name: '高中部' },
        ],
        gradeList: [
          { id: 1, gradeName: '一年级' },
          { id: 2, gradeName: '二年级' },
          { id: 3, gradeName: '三年级' },
          { id: 4, gradeName: '初一年级' },
          { id: 5, gradeName: '初二年级' },
          { id: 6, gradeName: '高一年级' },
          { id: 7, gradeName: '高二年级' },
        ],

        // 选中项
        selectedIds: [],

        // 弹窗相关
        teacherDialogVisible: false,
        studentDialogVisible: false,
        dialogTitle: '',
        editData: null,
      };
    },
    computed: {
      // 根据当前Tab返回对应的静态数据
      tableData() {
        return this.activeTab === 'teacher' ? mockTeacherData : mockStudentData;
      },
    },
    methods: {
      resetPassword() {
        this.$confirm('确认重置密码，重置后密码为123456?', '重置密码', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'confirm-reset-btn',
        })
          .then(() => {
            this.$message({
              type: 'success',
              message: '重置密码成功!',
            });
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消重置密码',
            });
          });
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
      // Tab 切换
      handleTabChange(tab) {
        if (this.activeTab === tab) return;
        this.activeTab = tab;
        this.currentPage = 1;
        this.searchKeyword = '';
        this.statusFilter = '';
        this.orgFilter = '';
        this.gradeFilter = '';
        this.selectedIds = [];
      },

      // 分页切换
      handleCurrentChange(page) {
        this.currentPage = page;
      },

      // 每页条数变化
      handleSizeChange(size) {
        this.pageSize = size;
        this.currentPage = 1;
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

      // 弹窗确认
      handleDialogConfirm(formData) {
        console.log('弹窗确认:', formData);
        this.teacherDialogVisible = false;
        this.studentDialogVisible = false;
        // TODO: 调用保存API
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
