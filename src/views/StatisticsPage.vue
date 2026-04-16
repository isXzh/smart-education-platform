<template>
  <div class="statistics-page">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>统计分析</el-breadcrumb-item>
        <el-breadcrumb-item>数据报表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 顶部控制栏 -->
    <div class="control-bar">
      <div class="control-bar-left">
        <h2 class="page-title">数据统计</h2>
      </div>
      <div class="control-bar-right">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          size="small"
          class="date-picker"
        ></el-date-picker>
        <el-button type="primary" @click="refreshStatistics" size="small">
          <i class="el-icon-refresh"></i>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-container">
      <div class="stat-card blue-card">
        <div class="stat-content">
          <div class="stat-label">总课程数</div>
          <div class="stat-value">156</div>
          <div class="stat-change positive">
            <i class="el-icon-caret-top"></i>
            <span>较上月 +12%</span>
          </div>
        </div>
        <div class="stat-icon">
          <i class="el-icon-reading"></i>
        </div>
      </div>
      <div class="stat-card green-card">
        <div class="stat-content">
          <div class="stat-label">总学生数</div>
          <div class="stat-value">2,345</div>
          <div class="stat-change positive">
            <i class="el-icon-caret-top"></i>
            <span>较上月 +8%</span>
          </div>
        </div>
        <div class="stat-icon">
          <i class="el-icon-user"></i>
        </div>
      </div>
      <div class="stat-card orange-card">
        <div class="stat-content">
          <div class="stat-label">设备使用率</div>
          <div class="stat-value">85%</div>
          <div class="stat-change positive">
            <i class="el-icon-caret-top"></i>
            <span>较上月 +5%</span>
          </div>
        </div>
        <div class="stat-icon">
          <i class="el-icon-video-camera"></i>
        </div>
      </div>
      <div class="stat-card purple-card">
        <div class="stat-content">
          <div class="stat-label">出勤率</div>
          <div class="stat-value">92%</div>
          <div class="stat-change negative">
            <i class="el-icon-caret-bottom"></i>
            <span>较上月 -2%</span>
          </div>
        </div>
        <div class="stat-icon">
          <i class="el-icon-data-analysis"></i>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 课程趋势图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">课程趋势</h3>
          <el-select v-model="chartType" size="small" class="chart-select">
            <el-option label="周" value="week"></el-option>
            <el-option label="月" value="month"></el-option>
            <el-option label="年" value="year"></el-option>
          </el-select>
        </div>
        <div class="chart-content">
          <div id="courseTrendChart" class="chart"></div>
        </div>
      </div>

      <!-- 学生分布图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">学生分布</h3>
        </div>
        <div class="chart-content">
          <div id="studentDistributionChart" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 数据表格区域 -->
    <div class="table-container">
      <div class="table-header">
        <h3 class="table-title">课程详情</h3>
        <el-button type="primary" size="small" @click="exportData">导出数据</el-button>
      </div>
      <el-table :data="courseData" style="width: 100%" stripe>
        <el-table-column prop="name" label="课程名称" min-width="180"></el-table-column>
        <el-table-column prop="teacher" label="教师" width="120"></el-table-column>
        <el-table-column prop="students" label="学生数" width="100"></el-table-column>
        <el-table-column prop="attendance" label="出勤率" width="100">
          <template slot-scope="scope">
            <el-progress :percentage="scope.row.attendance" :color="getAttendanceColor(scope.row.attendance)" :stroke-width="8"></el-progress>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '进行中' ? 'success' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dateRange: [],
      chartType: 'month',
      courseData: [
        { name: '数学基础', teacher: '张老师', students: 45, attendance: 95, status: '进行中' },
        { name: '英语听力', teacher: '李老师', students: 38, attendance: 88, status: '进行中' },
        { name: '物理实验', teacher: '王老师', students: 25, attendance: 92, status: '进行中' },
        { name: '化学原理', teacher: '赵老师', students: 32, attendance: 85, status: '已结束' },
        { name: '生物多样性', teacher: '孙老师', students: 28, attendance: 90, status: '进行中' }
      ]
    }
  },
  mounted() {
    this.initCharts()
  },
  methods: {
    refreshStatistics() {
      // 刷新统计数据
      this.$message.success('统计数据已刷新')
    },
    initCharts() {
      // 初始化图表
      // 这里可以使用ECharts等图表库
    },
    getAttendanceColor(attendance) {
      if (attendance >= 90) {
        return '#1d4ed8'
      } else if (attendance >= 80) {
        return '#2563eb'
      } else {
        return '#e6a23c'
      }
    },
    exportData() {
      // 导出数据
      this.$message.success('数据导出成功')
    }
  }
}
</script>

<style scoped>
.statistics-page {
  width: 100%;
}

.breadcrumb-container {
  margin-bottom: 16px;
}

.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.control-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-picker {
  width: 240px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
}

.blue-card {
  border-left: 4px solid #2563eb;
}

.green-card {
  border-left: 4px solid #1d4ed8;
}

.orange-card {
  border-left: 4px solid #e6a23c;
}

.purple-card {
  border-left: 4px solid #909399;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.positive {
  color: #1d4ed8;
}

.negative {
  color: #f56c6c;
}

.stat-icon {
  font-size: 32px;
  opacity: 0.5;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.chart-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.chart-select {
  width: 100px;
}

.chart-content {
  padding: 24px;
}

.chart {
  height: 300px;
  width: 100%;
}

.table-container {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
}

.table-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .control-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .control-bar-right {
    align-self: stretch;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .control-bar-right {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .date-picker {
    width: 100%;
  }
  
  .chart-content {
    padding: 16px;
  }
  
  .chart {
    height: 250px;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>