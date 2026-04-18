<template>
  <div class="course-manage-container common-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item class="breadcrumb-active">基础信息管理</el-breadcrumb-item>
        <el-breadcrumb-item>课程管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 主内容卡片 -->
    <div class="main-card">
      <!-- 页面标题和快捷筛选 -->
      <div class="header-section">
        <h2 class="page-title">课程管理</h2>
        <div class="filter-section">
          <!-- 快捷筛选标签 -->
          <div class="quick-filter-tags">
            <span
              v-for="tag in filterTags"
              :key="tag.value"
              :class="['filter-tag', { active: currentTag === tag.value }]"
              @click="currentTag = tag.value"
            >
              {{ tag.label }}
              <span
                class="tag-count"
                :class="{ 'tag-count-active': currentTag === tag.value }"
              >
                {{ tag.count }}
              </span>
            </span>
          </div>
          <!-- 新增课程按钮 -->
          <el-button
            type="primary"
            class="add-course-btn"
            @click="handleAddCourse"
          >
            <i class="el-icon-plus"></i>
            新增课程
          </el-button>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="operation-bar">
        <div class="operation-left">
          <!-- 搜索框 -->
          <div class="search-box">
            <i class="el-icon-search search-icon"></i>
            <input
              type="text"
              class="search-input"
              placeholder="搜索课程名称"
              v-model="searchQuery"
            />
          </div>
          <!-- 筛选标签 -->
          <!-- <div class="filter-label">
            <i class="el-icon-s-operation"></i>
            <span>筛选</span>
          </div> -->
          <!-- 学科下拉 -->
          <el-select
            v-model="filterForm.subject"
            placeholder="学科"
            class="filter-select"
            clearable
          >
            <el-option
              v-for="item in subjectOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <!-- 学段下拉 -->
          <el-select
            v-model="filterForm.gradeLevel"
            placeholder="学段"
            class="filter-select"
            clearable
          >
            <el-option
              v-for="item in gradeLevelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="table-container">
        <el-table
          :data="filteredTableData"
          style="width: 100%"
          :header-cell-style="headerCellStyle"
          :cell-style="cellStyle"
          v-loading="loading"
        >
          <el-table-column prop="courseName" label="课程名称" min-width="120">
            <template slot-scope="scope">
              <span class="course-name">{{ scope.row.courseName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="courseCode" label="课程代码" width="100">
            <template slot-scope="scope">
              <span class="course-code">{{ scope.row.courseCode }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="subject" label="所属学科" width="100">
            <template slot-scope="scope">
              <span class="subject-text">{{ scope.row.subject }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="gradeLevel" label="学段" width="80">
            <template slot-scope="scope">
              <span class="grade-level">{{ scope.row.gradeLevel }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="classHourName" label="课时名称" min-width="120">
            <template slot-scope="scope">
              <span class="class-hour">{{ scope.row.classHourName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="课程简介" min-width="150" show-overflow-tooltip>
            <template slot-scope="scope">
              <span class="description">{{ scope.row.description }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template slot-scope="scope">
              <span :class="['status-badge', getStatusClass(scope.row.status)]">
                {{ scope.row.status }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template slot-scope="scope">
              <div class="operation-icons">
                <i
                  class="el-icon-edit operation-icon"
                  @click="handleEdit(scope.row)"
                ></i>
                <i
                  class="el-icon-delete operation-icon delete-icon"
                  @click="handleDelete(scope.row)"
                ></i>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <div class="pagination-left">
          显示 1 - {{ filterForm.pageSize }} 条，共 {{ total }} 条
        </div>
        <el-pagination
          background
          :current-page="filterForm.currentPage"
          :page-size="filterForm.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="prev, pager, next, jumper"
          :total="total"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/编辑课程弹窗 -->
    <CourseDialog
      :visible.sync="courseDialogVisible"
      :is-edit="isEdit"
      :edit-data="currentEditData"
      @submit="handleCourseSubmit"
    />
  </div>
</template>

<script>
import CourseDialog from './dialog/CourseDialog.vue'

export default {
  name: 'CourseManage',
  components: {
    CourseDialog
  },
  data() {
    return {
      searchQuery: '',
      currentTag: 'all',
      loading: false,
      total: 48,
      courseDialogVisible: false,
      isEdit: false,
      currentEditData: null,
      filterTags: [
        { label: '总计', value: 'all', count: 48 },
        { label: '启用', value: 'active', count: 24 },
        { label: '停用', value: 'inactive', count: 12 }
      ],
      subjectOptions: [
        { label: '全部', value: '' },
        { label: '语文', value: '语文' },
        { label: '数学', value: '数学' },
        { label: '英语', value: '英语' },
        { label: '物理', value: '物理' },
        { label: '化学', value: '化学' },
        { label: '生物', value: '生物' },
        { label: '历史', value: '历史' },
        { label: '地理', value: '地理' },
        { label: '政治', value: '政治' },
        { label: '体育', value: '体育' },
        { label: '美术', value: '美术' },
        { label: '音乐', value: '音乐' },
        { label: '信息技术', value: '信息技术' }
      ],
      gradeLevelOptions: [
        { label: '全部', value: '' },
        { label: '小学', value: '小学' },
        { label: '初中', value: '初中' },
        { label: '高中', value: '高中' }
      ],
      filterForm: {
        subject: '',
        gradeLevel: '',
        currentPage: 1,
        pageSize: 10
      },
      tableData: [
        {
          id: 1,
          courseName: '语文',
          courseCode: 'CHN001',
          subject: '语文',
          gradeLevel: '小学',
          classHourName: '小学语文课时',
          description: '小学语文基础课程，培养学生的阅读理解和写作能力',
          status: '启用'
        },
        {
          id: 2,
          courseName: '数学',
          courseCode: 'MAT001',
          subject: '数学',
          gradeLevel: '小学',
          classHourName: '小学数学课时',
          description: '小学数学基础课程，培养学生的逻辑思维和计算能力',
          status: '启用'
        },
        {
          id: 3,
          courseName: '英语',
          courseCode: 'ENG001',
          subject: '英语',
          gradeLevel: '小学',
          classHourName: '小学英语课时',
          description: '小学英语基础课程，培养学生的英语听说读写能力',
          status: '启用'
        },
        {
          id: 4,
          courseName: '物理',
          courseCode: 'PHY001',
          subject: '物理',
          gradeLevel: '初中',
          classHourName: '初中物理课时',
          description: '初中物理课程，探索自然界的物理规律',
          status: '启用'
        },
        {
          id: 5,
          courseName: '化学',
          courseCode: 'CHE001',
          subject: '化学',
          gradeLevel: '初中',
          classHourName: '初中化学课时',
          description: '初中化学课程，了解物质的组成和变化',
          status: '启用'
        },
        {
          id: 6,
          courseName: '生物',
          courseCode: 'BIO001',
          subject: '生物',
          gradeLevel: '初中',
          classHourName: '初中生物课时',
          description: '初中生物课程，探索生命的奥秘',
          status: '启用'
        },
        {
          id: 7,
          courseName: '历史',
          courseCode: 'HIS001',
          subject: '历史',
          gradeLevel: '高中',
          classHourName: '高中历史课时',
          description: '高中历史课程，了解人类社会发展历程',
          status: '启用'
        },
        {
          id: 8,
          courseName: '地理',
          courseCode: 'GEO001',
          subject: '地理',
          gradeLevel: '高中',
          classHourName: '高中地理课时',
          description: '高中地理课程，认识地球和地理环境',
          status: '启用'
        },
        {
          id: 9,
          courseName: '政治',
          courseCode: 'POL001',
          subject: '政治',
          gradeLevel: '高中',
          classHourName: '高中政治课时',
          description: '高中政治课程，培养公民素养',
          status: '停用'
        },
        {
          id: 10,
          courseName: '体育',
          courseCode: 'PE001',
          subject: '体育',
          gradeLevel: '小学',
          classHourName: '小学体育课时',
          description: '小学体育课程，增强体质',
          status: '启用'
        }
      ]
    }
  },
  computed: {
    filteredTableData() {
      let data = [...this.tableData]

      // 快捷筛选
      if (this.currentTag === 'active') {
        data = data.filter((item) => item.status === '启用')
      } else if (this.currentTag === 'inactive') {
        data = data.filter((item) => item.status === '停用')
      }

      // 搜索框筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        data = data.filter(
          (item) =>
            item.courseName.toLowerCase().includes(query) ||
            item.subject.toLowerCase().includes(query) ||
            item.gradeLevel.toLowerCase().includes(query)
        )
      }

      // 学科筛选
      if (this.filterForm.subject) {
        data = data.filter((item) => item.subject === this.filterForm.subject)
      }

      // 学段筛选
      if (this.filterForm.gradeLevel) {
        data = data.filter((item) => item.gradeLevel === this.filterForm.gradeLevel)
      }

      return data
    }
  },
  methods: {
    handleCurrentChange(page) {
      this.filterForm.currentPage = page
    },
    headerCellStyle() {
      return {
        background: '#f5f7fa',
        color: '#606266',
        fontWeight: 500,
        fontSize: '14px',
        padding: '12px 0'
      }
    },
    cellStyle() {
      return {
        padding: '12px 0',
        fontSize: '14px'
      }
    },
    getStatusClass(status) {
      const map = {
        启用: 'status-active',
        停用: 'status-inactive'
      }
      return map[status] || 'status-active'
    },
    handleAddCourse() {
      this.isEdit = false
      this.currentEditData = null
      this.courseDialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.currentEditData = { ...row }
      this.courseDialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确认删除该课程?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.tableData = this.tableData.filter((item) => item.id !== row.id)
          this.$message.success('删除成功')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    handleCourseSubmit(formData) {
      if (this.isEdit) {
        // 编辑模式
        const index = this.tableData.findIndex((item) => item.id === formData.id)
        if (index !== -1) {
          this.tableData.splice(index, 1, { ...formData })
        }
        this.$message.success('编辑成功')
      } else {
        // 新增模式
        const newId = Math.max(...this.tableData.map((item) => item.id), 0) + 1
        this.tableData.push({
          ...formData,
          id: newId,
          status: '启用'
        })
        this.$message.success('新增成功')
      }
      this.courseDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.course-manage-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 84px);
}

.breadcrumb-container {
  margin-bottom: 16px;

  ::v-deep .el-breadcrumb__item {
    .el-breadcrumb__inner {
      color: #909399;
      font-size: 14px;
    }

    &.breadcrumb-active .el-breadcrumb__inner {
      color: #4f7cff;
      font-weight: 500;
    }

    &:last-child .el-breadcrumb__inner {
      color: #606266;
    }
  }
}

.main-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  padding: 20px;
}

.header-section {
  margin-bottom: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.quick-filter-tags {
  display: flex;
  gap: 12px;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f5f7fa;
  color: #606266;
  border: 1px solid transparent;

  &:hover {
    background: #e8f0ff;
    color: #4f7cff;
  }

  &.active {
    background: #e8f0ff;
    color: #4f7cff;
    border-color: #4f7cff;
  }
}

.tag-count {
  margin-left: 6px;
  padding: 0px 8px;
  border-radius: 10px;
  font-size: 12px;
  background: #dcdfe6;
  color: #606266;

  &.tag-count-active {
    background: #4f7cff;
    color: #fff;
  }
}

.add-course-btn {
  height: 36px;
  padding: 0 20px;
  background: #4f7cff;
  border-color: #4f7cff;
  font-size: 14px;

  i {
    margin-right: 6px;
  }

  &:hover {
    background: #3d6aea;
    border-color: #3d6aea;
  }
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
  flex-wrap: wrap;
  gap: 12px;
}

.operation-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 280px;

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #909399;
    font-size: 16px;
  }

  .search-input {
    width: 100%;
    height: 36px;
    padding: 0 12px 0 36px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
    outline: none;
    transition: all 0.3s;

    &:focus {
      border-color: #4f7cff;
    }

    &::placeholder {
      color: #c0c4cc;
    }
  }
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 36px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s;
  white-space: nowrap;

  &:hover {
    border-color: #4f7cff;
    color: #4f7cff;
  }

  i {
    font-size: 14px;
  }
}

.filter-select {
  width: 120px;

  ::v-deep .el-input__inner {
    height: 36px;
    line-height: 36px;
  }
}

.table-container {
  margin-top: 16px;
}

.course-name {
  color: #303133;
  font-weight: 500;
}

.course-code {
  color: #606266;
  font-family: 'Courier New', monospace;
}

.subject-text,
.grade-level,
.class-hour,
.description {
  color: #606266;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;

  &.status-active {
    background: #e8f5e9;
    color: #52c41a;
  }

  &.status-inactive {
    background: #f5f5f5;
    color: #909399;
  }
}

.operation-icons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.operation-icon {
  color: #909399;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #4f7cff;
  }

  &.delete-icon:hover {
    color: #f56c6c;
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

// 表格样式覆盖
::v-deep .el-table {
  th {
    font-weight: 500;
  }

  td {
    padding: 12px 0;
  }
}

// Element UI 样式覆盖
::v-deep .el-select {
  .el-input__inner {
    height: 36px;
    line-height: 36px;
  }
}
</style>
