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
              @click="handleTagChange(tag.value)"
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
              @keyup.enter="handleSearch"
            />
          </div>
          <!-- 学科下拉 -->
          <el-select
            v-model="filterForm.subjectId"
            placeholder="学科"
            class="filter-select"
            clearable
            @change="handleFilterChange"
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
            v-model="filterForm.stageId"
            placeholder="学段"
            class="filter-select"
            clearable
            @change="handleFilterChange"
          >
            <el-option
              v-for="item in stageOptions"
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
          :data="tableData"
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
          <el-table-column prop="subjectId" label="所属学科" width="100">
            <template slot-scope="scope">
              <span class="subject-text">{{ getSubjectName(scope.row.subjectId) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="stageId" label="学段" width="80">
            <template slot-scope="scope">
              <span class="grade-level">{{ getStageName(scope.row.stageId) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="creditHours" label="课时数" width="80">
            <template slot-scope="scope">
              <span class="credit-hours">{{ scope.row.creditHours }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="courseDesc" label="课程简介" min-width="150" show-overflow-tooltip>
            <template slot-scope="scope">
              <span class="description">{{ scope.row.courseDesc }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template slot-scope="scope">
              <span :class="['status-badge', getStatusClass(scope.row.status)]">
                {{ scope.row.status === 1 ? '启用' : '停用' }}
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
          显示 {{ (filterForm.pageNum - 1) * filterForm.pageSize + 1 }} - {{ Math.min(filterForm.pageNum * filterForm.pageSize, total) }} 条，共 {{ total }} 条
        </div>
        <el-pagination
          background
          :current-page="filterForm.pageNum"
          :page-size="filterForm.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="prev, pager, next, jumper"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
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
import courseApi from '@/api/course.js'
import subjectApi from '@/api/subject.js'
import gradeLevelApi from '@/api/gradeLevel.js'

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
      total: 0,
      courseDialogVisible: false,
      isEdit: false,
      currentEditData: null,
      filterTags: [
        { label: '总计', value: 'all', count: 0 },
        { label: '启用', value: 'active', count: 0 },
        { label: '停用', value: 'inactive', count: 0 }
      ],
      subjectOptions: [],
      stageOptions: [],
      filterForm: {
        subjectId: null,
        stageId: null,
        pageNum: 1,
        pageSize: 10
      },
      tableData: []
    }
  },
  created() {
    this.loadSubjectOptions()
    this.loadStageOptions()
    this.loadCourseList()
  },
  methods: {
    // 加载学科下拉选项
    async loadSubjectOptions() {
      try {
        const res = await subjectApi.list()
        if (res.code === 200 && res.data) {
          this.subjectOptions = res.data.map(item => ({
            label: item.subjectName,
            value: item.id
          }))
        }
      } catch (error) {
        console.error('加载学科列表失败:', error)
      }
    },
    // 加载学段下拉选项
    async loadStageOptions() {
      try {
        const res = await gradeLevelApi.list()
        if (res.code === 200 && res.data) {
          this.stageOptions = res.data.map(item => ({
            label: item.stageName,
            value: item.id
          }))
        }
      } catch (error) {
        console.error('加载学段列表失败:', error)
      }
    },
    // 加载课程列表
    async loadCourseList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.filterForm.pageNum,
          pageSize: this.filterForm.pageSize
        }
        
        // 添加查询条件
        if (this.searchQuery) {
          params.courseName = this.searchQuery
        }
        if (this.filterForm.subjectId) {
          params.subjectId = this.filterForm.subjectId
        }
        if (this.filterForm.stageId) {
          params.stageId = this.filterForm.stageId
        }
        
        // 状态筛选
        if (this.currentTag === 'active') {
          params.status = 1
        } else if (this.currentTag === 'inactive') {
          params.status = 0
        }
        
        const res = await courseApi.page(params)
        if (res.code === 200 && res.data) {
          this.tableData = res.data.list || []
          this.total = res.data.total || 0
          
          // 更新筛选标签数量
          this.updateFilterTagCounts()
        }
      } catch (error) {
        console.error('加载课程列表失败:', error)
        this.$message.error('加载课程列表失败')
      } finally {
        this.loading = false
      }
    },
    // 更新筛选标签计数
    async updateFilterTagCounts() {
      try {
        // 获取总数量
        const totalRes = await courseApi.page({ pageNum: 1, pageSize: 1 })
        const totalCount = totalRes.code === 200 && totalRes.data ? totalRes.data.total : 0
        
        // 获取启用数量
        const activeRes = await courseApi.page({ pageNum: 1, pageSize: 1, status: 1 })
        const activeCount = activeRes.code === 200 && activeRes.data ? activeRes.data.total : 0
        
        // 获取停用数量
        const inactiveRes = await courseApi.page({ pageNum: 1, pageSize: 1, status: 0 })
        const inactiveCount = inactiveRes.code === 200 && inactiveRes.data ? inactiveRes.data.total : 0
        
        this.filterTags = [
          { label: '总计', value: 'all', count: totalCount },
          { label: '启用', value: 'active', count: activeCount },
          { label: '停用', value: 'inactive', count: inactiveCount }
        ]
      } catch (error) {
        console.error('更新筛选标签计数失败:', error)
      }
    },
    // 搜索
    handleSearch() {
      this.filterForm.pageNum = 1
      this.loadCourseList()
    },
    // 标签切换
    handleTagChange(tag) {
      this.currentTag = tag
      this.filterForm.pageNum = 1
      this.loadCourseList()
    },
    // 筛选条件改变
    handleFilterChange() {
      this.filterForm.pageNum = 1
      this.loadCourseList()
    },
    // 分页改变
    handleCurrentChange(page) {
      this.filterForm.pageNum = page
      this.loadCourseList()
    },
    // 每页条数改变
    handleSizeChange(size) {
      this.filterForm.pageSize = size
      this.filterForm.pageNum = 1
      this.loadCourseList()
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
      return status === 1 ? 'status-active' : 'status-inactive'
    },
    // 根据学科ID获取学科名称
    getSubjectName(subjectId) {
      if (!subjectId) return ''
      const subject = this.subjectOptions.find(item => item.value === subjectId)
      return subject ? subject.label : subjectId
    },
    // 根据学段ID获取学段名称
    getStageName(stageId) {
      if (!stageId) return ''
      const stage = this.stageOptions.find(item => item.value === stageId)
      return stage ? stage.label : stageId
    },
    handleAddCourse() {
      this.isEdit = false
      this.currentEditData = null
      this.courseDialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      // 转换数据格式以适配弹窗
      this.currentEditData = {
        id: row.id,
        courseName: row.courseName,
        courseCode: row.courseCode,
        subjectId: row.subjectId,
        stageId: row.stageId,
        creditHours: row.creditHours,
        courseDesc: row.courseDesc,
        status: row.status,
        remark: row.remark
      }
      this.courseDialogVisible = true
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该课程?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const res = await courseApi.delete(row.id)
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.loadCourseList()
        } else {
          this.$message.error(res.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除课程失败:', error)
          this.$message.error('删除失败')
        }
      }
    },
    async handleCourseSubmit(formData) {
      try {
        if (this.isEdit) {
          // 编辑模式
          const res = await courseApi.update(formData.id, formData)
          if (res.code === 200) {
            this.$message.success('编辑成功')
            this.loadCourseList()
          } else {
            this.$message.error(res.message || '编辑失败')
          }
        } else {
          // 新增模式
          const res = await courseApi.add(formData)
          if (res.code === 200) {
            this.$message.success('新增成功')
            this.loadCourseList()
          } else {
            this.$message.error(res.message || '新增失败')
          }
        }
        this.courseDialogVisible = false
      } catch (error) {
        console.error('保存课程失败:', error)
        this.$message.error('保存失败')
      }
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
.credit-hours,
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
