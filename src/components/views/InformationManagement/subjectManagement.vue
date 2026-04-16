<template>
  <div class="subject-management-page common-container">
    <!-- 页面标题和面包屑 -->
    <div class="page-header">
      <div class="breadcrumb">
        <span class="breadcrumb-item">基础信息管理</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">学科管理</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 页面标题栏 -->
      <div class="content-header">
        <div class="title-section">
          <i class="el-icon-collection"></i>
          <span class="title">学科管理</span>
          <div class="stats-tags">
            <span class="stat-tag total">总计 {{ stats.total }}</span>
            <span class="stat-tag enabled">启用 {{ stats.enabled }}</span>
            <span class="stat-tag disabled">禁用 {{ stats.disabled }}</span>
          </div>
        </div>
        <el-button
          type="primary"
          class="add-subject-btn"
          @click="handleAddSubject"
        >
          <i class="el-icon-plus"></i>
          新增学科
        </el-button>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchText"
          placeholder="搜索学科名称、代码或学段..."
          prefix-icon="el-icon-search"
          class="search-input"
          clearable
        />
      </div>

      <!-- 数据表格 -->
      <div class="table-container">
        <el-table
          :data="filteredSubjectList"
          style="width: 100%"
          :header-cell-style="headerCellStyle"
          :cell-style="cellStyle"
        >
          <el-table-column
            type="index"
            label="序号"
            width="80"
            align="center"
          />

          <el-table-column label="学科名称" min-width="200">
            <template #default="{ row }">
              <div class="subject-name-cell">
                <div class="subject-icon">
                  <i class="el-icon-reading"></i>
                </div>
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="code" label="学科代码" min-width="150" />

          <el-table-column label="所属学段" min-width="150">
            <template #default="{ row }">
              <el-tag
                size="small"
                :type="getPeriodTagType(row.period)"
                effect="plain"
              >
                {{ row.period }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="状态" min-width="120" align="center">
            <template #default="{ row }">
              <el-tag
                size="small"
                :type="row.status === '启用' ? 'success' : 'info'"
                effect="light"
              >
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="createTime" label="创建时间" min-width="150" />

          <el-table-column
            label="操作"
            width="120"
            fixed="right"
            align="center"
          >
            <template #default="{ row }">
              <div class="table-actions">
                <el-button
                  type="text"
                  size="small"
                  @click="handleEditSubject(row)"
                >
                  <i class="el-icon-edit"></i>
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  class="delete-btn"
                  @click="handleDeleteSubject(row)"
                >
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
          显示 1 - {{ filteredSubjectList.length }} 条，共
          {{ subjectList.length }} 条
        </div>
        <el-pagination
          background
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="prev, pager, next, jumper"
          :total="subjectList.length"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 使用提示 -->
      <div class="tips-section">
        <div class="tips-header">
          <i class="el-icon-info"></i>
          <span>使用提示：</span>
        </div>
        <ul class="tips-list">
          <li>学科代码用于系统内部识别，建议使用简短的拼音首字母</li>
          <li>不同学段的学科需要分别创建，方便按学段管理课程</li>
          <li>禁用的学科在排课时将不可选择</li>
        </ul>
      </div>
    </div>

    <!-- 新增学科弹窗 -->
    <subject-dialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      :edit-data="editData"
      @confirm="handleDialogConfirm"
    />
  </div>
</template>

<script>
import SubjectDialog from "../dialog/SubjectDialog.vue";

export default {
  name: "SubjectManagement",
  components: {
    SubjectDialog,
  },
  data() {
    return {
      searchText: "",
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      dialogTitle: "新增学科",
      editData: null,
      subjectList: [
        {
          id: 1,
          name: "语文",
          code: "YW",
          period: "小学",
          status: "启用",
          createTime: "2024-01-15",
        },
        {
          id: 2,
          name: "数学",
          code: "SX",
          period: "小学",
          status: "启用",
          createTime: "2024-01-15",
        },
        {
          id: 3,
          name: "英语",
          code: "YY",
          period: "小学",
          status: "启用",
          createTime: "2024-01-15",
        },
        {
          id: 4,
          name: "科学",
          code: "KX",
          period: "小学",
          status: "启用",
          createTime: "2024-01-15",
        },
        {
          id: 5,
          name: "体育",
          code: "TY",
          period: "小学",
          status: "启用",
          createTime: "2024-01-15",
        },
        {
          id: 6,
          name: "音乐",
          code: "YL",
          period: "小学",
          status: "启用",
          createTime: "2024-01-15",
        },
        {
          id: 7,
          name: "美术",
          code: "MS",
          period: "小学",
          status: "启用",
          createTime: "2024-01-15",
        },
        {
          id: 8,
          name: "语文",
          code: "YW",
          period: "初中",
          status: "启用",
          createTime: "2024-01-15",
        },
        {
          id: 9,
          name: "数学",
          code: "SX",
          period: "初中",
          status: "启用",
          createTime: "2024-01-15",
        },
        {
          id: 10,
          name: "英语",
          code: "YY",
          period: "初中",
          status: "启用",
          createTime: "2024-01-15",
        },
      ],
    };
  },
  computed: {
    stats() {
      return {
        total: this.subjectList.length,
        enabled: this.subjectList.filter((item) => item.status === "启用")
          .length,
        disabled: this.subjectList.filter((item) => item.status === "禁用")
          .length,
      };
    },
    filteredSubjectList() {
      if (!this.searchText) return this.subjectList;
      const keyword = this.searchText.toLowerCase();
      return this.subjectList.filter(
        (item) =>
          item.name.toLowerCase().includes(keyword) ||
          item.code.toLowerCase().includes(keyword) ||
          item.period.toLowerCase().includes(keyword)
      );
    },
  },
  methods: {
    headerCellStyle() {
      return {
        background: "#f9fafb",
        color: "#374151",
        fontWeight: 500,
        fontSize: "13px",
        padding: "12px 16px",
      };
    },
    cellStyle() {
      return {
        padding: "12px 16px",
        color: "#4b5563",
      };
    },
    getPeriodTagType(period) {
      const types = {
        小学: "primary",
        初中: "success",
        高中: "warning",
        幼儿园: "info",
      };
      return types[period] || "";
    },
    handleCurrentChange(page) {
      this.currentPage = page;
    },
    handleAddSubject() {
      this.dialogTitle = "新增学科";
      this.editData = null;
      this.dialogVisible = true;
    },
    handleEditSubject(row) {
      this.dialogTitle = "编辑学科";
      this.editData = { ...row };
      this.dialogVisible = true;
    },
    handleDeleteSubject(row) {
      this.$confirm(`确认删除学科 "${row.name}" 吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          const index = this.subjectList.findIndex(
            (item) => item.id === row.id
          );
          if (index > -1) {
            this.subjectList.splice(index, 1);
          }
          this.$message.success("删除成功");
        })
        .catch(() => {});
    },
    handleDialogConfirm(data) {
      if (this.editData) {
        // 编辑
        const index = this.subjectList.findIndex(
          (item) => item.id === this.editData.id
        );
        if (index > -1) {
          this.subjectList.splice(index, 1, { ...this.editData, ...data });
        }
        this.$message.success("编辑成功");
      } else {
        // 新增
        const newSubject = {
          id: this.subjectList.length + 1,
          ...data,
          createTime: new Date().toISOString().split("T")[0],
        };
        this.subjectList.push(newSubject);
        this.$message.success("新增成功");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.subject-management-page {
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

  .add-subject-btn {
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
}

// 搜索栏
.search-bar {
  margin-bottom: 20px;

  .search-input {
    width: 440px;

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

// 学科名称单元格
.subject-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .subject-icon {
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
