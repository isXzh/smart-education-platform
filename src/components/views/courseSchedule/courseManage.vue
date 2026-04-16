<template>
  <div class="course-manage-container common-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item class="breadcrumb-active"
          >课程排课</el-breadcrumb-item
        >
        <el-breadcrumb-item>排课管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 主内容卡片 -->
    <div class="main-card">
      <!-- 页面标题 -->
      <div class="paike-manage">
        <h2 class="page-title">排课管理</h2>
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
      </div>

      <!-- 操作栏 -->
      <div class="operation-bar">
        <div class="operation-left">
          <div class="search-box">
            <i class="el-icon-search search-icon"></i>
            <input
              type="text"
              class="search-input"
              placeholder="搜索课程名称、教师、教室、学科、年级..."
              v-model="searchQuery"
            />
          </div>
          <div class="filter-box" @click="toggleFilterPanel">
            <i class="el-icon-s-operation"></i>
            <span>高级筛选</span>
            <i
              class="el-icon-arrow-down"
              :class="{ 'is-reverse': showFilterPanel }"
            ></i>
          </div>
        </div>
        <div class="operation-right">
          <el-button class="batch-import-btn">
            <i class="el-icon-upload2"></i>
            批量导入
          </el-button>
          <el-button
            type="primary"
            class="new-schedule-btn"
            @click="openNewScheduleModal"
          >
            <i class="el-icon-plus"></i>
            新建排课
          </el-button>
        </div>
      </div>

      <!-- 高级筛选面板 -->
      <div class="filter-panel" v-show="showFilterPanel">
        <div class="filter-form">
          <div class="filter-row">
            <div class="filter-item">
              <label class="filter-label">课程类型</label>
              <el-select
                v-model="filterForm.type"
                placeholder="全部"
                class="filter-select"
              >
                <el-option
                  v-for="item in typeOptions"
                  :key="item.label"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
            <div class="filter-item">
              <label class="filter-label">学科</label>
              <el-select
                v-model="filterForm.subject"
                placeholder="全部"
                class="filter-select"
              >
                <el-option
                  v-for="item in subjectOptions"
                  :key="item.label"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
            <div class="filter-item">
              <label class="filter-label">年级</label>
              <el-select
                v-model="filterForm.grade"
                placeholder="全部"
                class="filter-select"
              >
                <el-option
                  v-for="item in gradeOptions"
                  :key="item.label"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
            <div class="filter-item">
              <label class="filter-label">教师</label>
              <el-select
                v-model="filterForm.teacher"
                placeholder="全部"
                class="filter-select"
              >
                <el-option
                  v-for="item in teacherOptions"
                  :key="item.label"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
          </div>
          <div class="filter-row">
            <div class="filter-item">
              <label class="filter-label">状态</label>
              <el-select
                v-model="filterForm.status"
                placeholder="全部"
                class="filter-select"
              >
                <el-option
                  v-for="item in statusOptions"
                  :key="item.label"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
            <div class="filter-item">
              <label class="filter-label">开始日期</label>
              <el-date-picker
                v-model="filterForm.startDate"
                type="date"
                placeholder="年/月/日"
                class="filter-date-picker"
                value-format="yyyy-MM-dd"
              ></el-date-picker>
            </div>
            <div class="filter-item">
              <label class="filter-label">结束日期</label>
              <el-date-picker
                v-model="filterForm.endDate"
                type="date"
                placeholder="年/月/日"
                class="filter-date-picker"
                value-format="yyyy-MM-dd"
              ></el-date-picker>
            </div>
          </div>
        </div>
        <div class="filter-actions">
          <el-button @click="resetFilter" class="reset-btn">重置</el-button>
          <el-button type="primary" @click="applyFilter" class="apply-btn"
            >应用筛选</el-button
          >
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
          <el-table-column prop="type" label="类型" width="80">
            <template slot-scope="scope">
              <span
                :class="[
                  'type-badge',
                  scope.row.type === '校内' ? 'type-school' : 'type-outside',
                ]"
              >
                {{ scope.row.type }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="subject" label="学科" width="80">
            <template slot-scope="scope">
              <span class="subject-text">{{ scope.row.subject }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="teacher" label="教师" width="100">
            <template slot-scope="scope">
              <span class="teacher-text">{{ scope.row.teacher }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="grade" label="年级" width="120">
            <template slot-scope="scope">
              <span class="grade-text">{{ scope.row.grade }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="date" label="日期" width="100">
            <template slot-scope="scope">
              <span class="date-text">{{ scope.row.date }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="time" label="时间" width="100">
            <template slot-scope="scope">
              <span class="time-text">{{ scope.row.time }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="location" label="地点" min-width="120">
            <template slot-scope="scope">
              <span class="location-text">{{ scope.row.location }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template slot-scope="scope">
              <span :class="['status-badge', getStatusClass(scope.row.status)]">
                {{ scope.row.status }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template slot-scope="scope">
              <div class="operation-icons">
                <i
                  class="el-icon-edit operation-icon"
                  @click="handleEdit(scope.row)"
                ></i>
                <i
                  class="el-icon-connection operation-icon"
                  @click="handleCopy(scope.row)"
                ></i>
                <i
                  class="el-icon-delete operation-icon"
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
      <!-- 底部提示 -->
      <div class="table-tips">
        <div class="tip-item">
          <i class="el-icon-info tip-icon"></i>
          <span>点击表格行可查看排课详细信息和操作历史</span>
        </div>
        <div class="tip-item">
          <i class="el-icon-info tip-icon"></i>
          <span>支持通过拖拽调整排课顺序，长按编辑按钮可删除排课</span>
        </div>
        <div class="tip-item">
          <i class="el-icon-info tip-icon"></i>
          <span>在"高级筛选"中进行多条件组合过滤</span>
        </div>
        <div class="tip-item">
          <i class="el-icon-info tip-icon"></i>
          <span>已排课可进行批量导出和打印</span>
        </div>
      </div>
    </div>

    <!-- 新建排课弹窗 -->
    <NewScheduleModal
      :visible.sync="newScheduleVisible"
      @submit="handleNewScheduleSubmit"
    />
  </div>
</template>

<script>
import NewScheduleModal from "../dialog/NewScheduleModal.vue";

export default {
  name: "CourseManage",
  components: {
    NewScheduleModal,
  },
  data() {
    return {
      searchQuery: "",
      currentTag: "all",
      loading: false,
      showFilterPanel: false,
      newScheduleVisible: false,
      total: 0,
      filterTags: [
        { label: "总计", value: "all", count: 24 },
        { label: "校内", value: "school", count: 15 },
        { label: "校外", value: "outside", count: 3 },
        { label: "已排课", value: "today", count: 2 },
      ],
      typeOptions: [
        {
          label: "全部",
          value: "",
        },
        {
          label: "校内",
          value: "校内",
        },
        {
          label: "校外",
          value: "校外",
        },
      ],
      subjectOptions: [
        {
          label: "全部",
          value: "",
        },
        {
          label: "数学",
          value: "数学",
        },
        {
          label: "语文",
          value: "语文",
        },
        {
          label: "英语",
          value: "英语",
        },
        {
          label: "物理",
          value: "物理",
        },
        {
          label: "化学",
          value: "化学",
        },
        {
          label: "生物",
          value: "生物",
        },
        {
          label: "历史",
          value: "历史",
        },
        {
          label: "政治",
          value: "政治",
        },
        {
          label: "美术",
          value: "美术",
        },
        {
          label: "音乐",
          value: "音乐",
        },
        {
          label: "体育",
          value: "体育",
        },
        {
          label: "信息技术",
          value: "信息技术",
        },
      ],
      gradeOptions: [
        {
          label: "全部",
          value: "",
        },
        {
          label: "小学一年级",
          value: "小学一年级",
        },
        {
          label: "小学二年级",
          value: "小学二年级",
        },
        {
          label: "小学三年级",
          value: "小学三年级",
        },
        {
          label: "初中一年级",
          value: "初中一年级",
        },
        {
          label: "初中二年级",
          value: "初中二年级",
        },
        {
          label: "初中三年级",
          value: "初中三年级",
        },
        {
          label: "高中一年级",
          value: "高中一年级",
        },
        {
          label: "高中二年级",
          value: "高中二年级",
        },
        {
          label: "高中三年级",
          value: "高中三年级",
        },
      ],
      teacherOptions: [
        {
          label: "全部",
          value: "",
        },
        {
          label: "张老师",
          value: "张老师",
        },
        {
          label: "李老师",
          value: "李老师",
        },
        {
          label: "王老师",
          value: "王老师",
        },
        {
          label: "赵老师",
          value: "赵老师",
        },
        {
          label: "刘老师",
          value: "刘老师",
        },
        {
          label: "陈老师",
          value: "陈老师",
        },
        {
          label: "孙老师",
          value: "孙老师",
        },
        {
          label: "吴老师",
          value: "吴老师",
        },
        {
          label: "郑老师",
          value: "郑老师",
        },
        {
          label: "周老师",
          value: "周老师",
        },
        {
          label: "马老师",
          value: "马老师",
        },
      ],
      statusOptions: [
        {
          label: "全部",
          value: "",
        },
        {
          label: "已排课",
          value: "已排课",
        },
        {
          label: "已完成",
          value: "已完成",
        },
        {
          label: "已取消",
          value: "已取消",
        },
      ],
      filterForm: {
        type: "",
        subject: "",
        grade: "",
        teacher: "",
        status: "",
        startDate: "",
        endDate: "",
        currentPage: 1,
        pageSize: 10,
      },
      tableData: [
        {
          id: 1,
          courseName: "数学基础课",
          type: "校内",
          subject: "数学",
          teacher: "张老师",
          grade: "小学一年级",
          date: "2026-04-01",
          time: "08:00-08:40",
          location: "教学楼A-101",
          status: "已排课",
        },
        {
          id: 2,
          courseName: "语文阅读课",
          type: "校内",
          subject: "语文",
          teacher: "李老师",
          grade: "小学二年级",
          date: "2026-04-01",
          time: "09:00-09:40",
          location: "教学楼A-201",
          status: "已排课",
        },
        {
          id: 3,
          courseName: "英语口语训练",
          type: "校外",
          subject: "英语",
          teacher: "王老师",
          grade: "初中一年级",
          date: "2026-04-01",
          time: "14:00-15:30",
          location: "社区活动中心",
          status: "已排课",
        },
        {
          id: 4,
          courseName: "美术创作课",
          type: "校内",
          subject: "美术",
          teacher: "赵老师",
          grade: "小学三年级",
          date: "2026-04-01",
          time: "15:00-16:00",
          location: "艺术楼301",
          status: "已排课",
        },
        {
          id: 5,
          courseName: "物理化学实验",
          type: "校内",
          subject: "物理",
          teacher: "刘老师",
          grade: "高中一年级",
          date: "2026-04-02",
          time: "08:00-09:40",
          location: "实验楼B205",
          status: "已排课",
        },
        {
          id: 6,
          courseName: "化学入门",
          type: "校内",
          subject: "化学",
          teacher: "陈老师",
          grade: "初中二年级",
          date: "2026-04-02",
          time: "10:00-10:40",
          location: "实验楼301",
          status: "已排课",
        },
        {
          id: 7,
          courseName: "体育运动课",
          type: "校内",
          subject: "体育",
          teacher: "周老师",
          grade: "高中一年级",
          date: "2026-04-02",
          time: "14:00-15:30",
          location: "体育场",
          status: "已排课",
        },
        {
          id: 8,
          courseName: "音乐鉴赏",
          type: "校内",
          subject: "音乐",
          teacher: "吴老师",
          grade: "小学四年级",
          date: "2026-04-02",
          time: "15:00-15:40",
          location: "音乐教室",
          status: "已排课",
        },
        {
          id: 9,
          courseName: "历史讲堂",
          type: "校内",
          subject: "历史",
          teacher: "郑老师",
          grade: "初中一年级",
          date: "2026-04-03",
          time: "08:00-08:40",
          location: "教学楼B-101",
          status: "已排课",
        },
        {
          id: 10,
          courseName: "地理探索",
          type: "校内",
          subject: "地理",
          teacher: "孙老师",
          grade: "初中二年级",
          date: "2026-04-03",
          time: "09:00-09:40",
          location: "教学楼B-201",
          status: "已排课",
        },
        {
          id: 11,
          courseName: "编程入门",
          type: "校外",
          subject: "信息技术",
          teacher: "马老师",
          grade: "高中二年级",
          date: "2026-04-03",
          time: "14:00-16:00",
          location: "科技馆A区",
          status: "已排课",
        },
        {
          id: 12,
          courseName: "数学进阶",
          type: "校内",
          subject: "数学",
          teacher: "张老师",
          grade: "小学五年级",
          date: "2026-04-07",
          time: "08:00-08:40",
          location: "教学楼A-301",
          status: "已排课",
        },
        {
          id: 13,
          courseName: "语文写作课",
          type: "校内",
          subject: "语文",
          teacher: "李老师",
          grade: "小学六年级",
          date: "2026-04-07",
          time: "09:00-09:40",
          location: "教学楼A-401",
          status: "已排课",
        },
        {
          id: 14,
          courseName: "物理力学",
          type: "校内",
          subject: "物理",
          teacher: "刘老师",
          grade: "高中一年级",
          date: "2026-04-09",
          time: "08:00-09:30",
          location: "实验楼A301",
          status: "已排课",
        },
        {
          id: 15,
          courseName: "英语阅读",
          type: "校内",
          subject: "英语",
          teacher: "王老师",
          grade: "初中二年级",
          date: "2026-04-09",
          time: "10:00-10:40",
          location: "教学楼C-201",
          status: "已排课",
        },
        {
          id: 16,
          courseName: "科学实验",
          type: "校内",
          subject: "科学",
          teacher: "赵老师",
          grade: "小学五年级",
          date: "2026-04-09",
          time: "14:00-15:30",
          location: "科技馆",
          status: "已排课",
        },
        {
          id: 17,
          courseName: "生物观察课",
          type: "校内",
          subject: "生物",
          teacher: "陈老师",
          grade: "初中一年级",
          date: "2026-04-14",
          time: "08:00-08:40",
          location: "实验楼101",
          status: "已排课",
        },
        {
          id: 18,
          courseName: "政治课",
          type: "校内",
          subject: "政治",
          teacher: "林老师",
          grade: "高中三年级",
          date: "2026-04-14",
          time: "10:00-10:40",
          location: "教学楼D-301",
          status: "已排课",
        },
        {
          id: 19,
          courseName: "数学竞赛辅导",
          type: "校内",
          subject: "数学",
          teacher: "张老师",
          grade: "初中三年级",
          date: "2026-04-15",
          time: "15:00-16:30",
          location: "教学楼A-501",
          status: "已排课",
        },
        {
          id: 20,
          courseName: "书法课",
          type: "校内",
          subject: "美术",
          teacher: "赵老师",
          grade: "小学三年级",
          date: "2026-04-16",
          time: "14:00-15:00",
          location: "文化中心",
          status: "已排课",
        },
      ],
    };
  },
  computed: {
    filteredTableData() {
      let data = [...this.tableData];

      // 快捷筛选
      if (this.currentTag === "school") {
        data = data.filter((item) => item.type === "校内");
      } else if (this.currentTag === "outside") {
        data = data.filter((item) => item.type === "校外");
      } else if (this.currentTag === "today") {
        const today = "2026-04-01";
        data = data.filter((item) => item.date === today);
      }

      // 搜索框筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        data = data.filter(
          (item) =>
            item.courseName.toLowerCase().includes(query) ||
            item.teacher.toLowerCase().includes(query) ||
            item.location.toLowerCase().includes(query) ||
            item.subject.toLowerCase().includes(query) ||
            item.grade.toLowerCase().includes(query)
        );
      }

      // 高级筛选
      if (this.filterForm.type) {
        data = data.filter((item) => item.type === this.filterForm.type);
      }
      if (this.filterForm.subject) {
        data = data.filter((item) => item.subject === this.filterForm.subject);
      }
      if (this.filterForm.grade) {
        data = data.filter((item) => item.grade === this.filterForm.grade);
      }
      if (this.filterForm.teacher) {
        data = data.filter((item) => item.teacher === this.filterForm.teacher);
      }
      if (this.filterForm.status) {
        data = data.filter((item) => item.status === this.filterForm.status);
      }
      if (this.filterForm.startDate) {
        data = data.filter((item) => item.date >= this.filterForm.startDate);
      }
      if (this.filterForm.endDate) {
        data = data.filter((item) => item.date <= this.filterForm.endDate);
      }

      return data;
    },
  },
  methods: {
    toggleFilterPanel() {
      this.showFilterPanel = !this.showFilterPanel;
    },
    handleCurrentChange(page) {
      this.filterForm.currentPage = page;
      this.applyFilter();
    },
    headerCellStyle() {
      return {
        background: "#f5f7fa",
        color: "#606266",
        fontWeight: 500,
        fontSize: "14px",
        padding: "12px 0",
      };
    },
    cellStyle() {
      return {
        padding: "12px 0",
        fontSize: "14px",
      };
    },
    getStatusClass(status) {
      const map = {
        已排课: "status-scheduled",
        进行中: "status-ongoing",
        已结束: "status-ended",
      };
      return map[status] || "status-scheduled";
    },
    openNewScheduleModal() {
      this.newScheduleVisible = true;
    },
    handleNewScheduleSubmit(formData) {
      console.log("新建排课:", formData);
      this.$message.success("排课成功");
      this.newScheduleVisible = false;
    },
    handleEdit(row) {
      console.log("编辑:", row);
    },
    handleCopy(row) {
      console.log("复制:", row);
    },
    handleDelete(row) {
      this.$confirm("确认删除该排课?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.tableData = this.tableData.filter((item) => item.id !== row.id);
          this.$message.success("删除成功");
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    resetFilter() {
      this.filterForm = {
        type: "",
        subject: "",
        grade: "",
        teacher: "",
        status: "",
        startDate: "",
        endDate: "",
      };
    },
    applyFilter() {
      // 筛选已应用，无需关闭面板
      this.$message.success("筛选已应用");
    },
  },
};
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

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.quick-filter-tags {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  // padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
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

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
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
  max-width: 360px;

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

.filter-box {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
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

  .el-icon-arrow-down {
    transition: transform 0.3s;

    &.is-reverse {
      transform: rotate(180deg);
    }
  }
}

.operation-right {
  display: flex;
  gap: 12px;
}

.batch-import-btn {
  height: 36px;
  padding: 0 16px;
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #606266;

  i {
    margin-right: 6px;
  }

  &:hover {
    color: #4f7cff;
    border-color: #4f7cff;
  }
}

.new-schedule-btn {
  height: 36px;
  padding: 0 16px;
  background: #4f7cff;
  border-color: #4f7cff;

  i {
    margin-right: 6px;
  }

  &:hover {
    background: #3d6aea;
    border-color: #3d6aea;
  }
}

// 高级筛选面板
.filter-panel {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-top: 16px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-form {
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.filter-item {
  flex: 0 0 calc(25% - 15px);
  min-width: 160px;
}

.filter-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.filter-select,
.filter-date-picker {
  width: 100%;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.reset-btn {
  padding: 8px 20px;
}

.apply-btn {
  padding: 8px 24px;
  background: #4f7cff;
  border-color: #4f7cff;

  &:hover {
    background: #3d6aea;
    border-color: #3d6aea;
  }
}

.table-container {
  margin-top: 16px;
}

.course-name {
  color: #303133;
  font-weight: 500;
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
.type-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;

  &.type-school {
    background: #e8f5e9;
    color: #52c41a;
  }

  &.type-outside {
    background: #fff7e6;
    color: #fa8c16;
  }
}

.subject-text,
.teacher-text,
.grade-text,
.date-text,
.time-text {
  color: #606266;
}
.paike-manage {
  display: flex;
  gap: 10px;
  align-items: center;
}
.location-text {
  color: #303133;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;

  &.status-scheduled {
    background: #e8f0ff;
    color: #4f7cff;
  }

  &.status-ongoing {
    background: #e8f5e9;
    color: #52c41a;
  }

  &.status-ended {
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

  &.el-icon-delete:hover {
    color: #f56c6c;
  }
}

.more-icon {
  transform: rotate(90deg);
}

.table-tips {
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
  margin-top: 16px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #909399;

  &:last-child {
    margin-bottom: 0;
  }

  .tip-icon {
    color: #4f7cff;
    font-size: 14px;
    margin-top: 2px;
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
  width: 100%;
}

::v-deep .el-date-editor {
  width: 100%;
}
</style>
