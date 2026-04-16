<template>
  <div class="course-schedule-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>课程排课</el-breadcrumb-item>
        <el-breadcrumb-item>课表视图</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 白色卡片容器 -->
    <div class="card-container">
      <!-- 顶部控制栏 -->
      <div class="control-bar">
        <div class="control-bar-left">
          <!-- 视图切换按钮组 -->
          <el-radio-group v-model="viewMode" size="medium" class="view-mode-group">
            <el-radio-button label="day">日视图</el-radio-button>
            <el-radio-button label="week" border-color="#2563eb" text-color="#2563eb">周视图</el-radio-button>
            <el-radio-button label="month">月视图</el-radio-button>
          </el-radio-group>

          <!-- 日期导航 -->
          <div class="date-navigation">
            <el-button @click="navigateDate('prev')" icon="el-icon-arrow-left" circle size="small"></el-button>
            <el-button @click="goToToday" size="small">今天</el-button>
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              size="small"
            ></el-date-picker>
            <el-button @click="navigateDate('next')" icon="el-icon-arrow-right" circle size="small"></el-button>
          </div>
        </div>

        <!-- 右侧：筛选 + 导出 -->
        <div class="control-bar-right">
          <el-button @click="showFilters = !showFilters" size="small">
            筛选
            <el-badge v-if="hasActiveFilters" :value="filterCount" class="filter-badge"></el-badge>
          </el-button>
          <el-button type="text" size="small">导出课表</el-button>
        </div>
      </div>

      <!-- 筛选面板 -->
      <div v-if="showFilters" class="filter-panel">
        <div class="filter-header">
          <h3 class="filter-title">筛选条件</h3>
          <el-button v-if="hasActiveFilters" @click="clearFilters" type="text" size="small">清除全部</el-button>
        </div>
        <div class="filter-content">
          <el-select v-model="filters.type" placeholder="全部类型" size="small" class="filter-select">
            <el-option label="全部类型" value=""></el-option>
            <el-option label="校内" value="校内"></el-option>
            <el-option label="校外" value="校外"></el-option>
          </el-select>

          <el-select v-model="filters.teacher" placeholder="全部教师" size="small" class="filter-select">
            <el-option label="全部教师" value=""></el-option>
            <el-option label="张老师" value="张老师"></el-option>
            <el-option label="李老师" value="李老师"></el-option>
          </el-select>

          <el-select v-model="filters.subject" placeholder="全部学科" size="small" class="filter-select">
            <el-option label="全部学科" value=""></el-option>
            <el-option label="数学" value="数学"></el-option>
            <el-option label="英语" value="英语"></el-option>
          </el-select>

          <el-button type="primary" @click="showFilters = false" size="small" class="apply-filter-btn">应用筛选</el-button>
        </div>
      </div>

      <!-- 课表内容区 -->
      <div class="schedule-content">
        <!-- 日视图 -->
        <div v-if="viewMode === 'day'" class="day-view">
          <div class="view-header">
            <h3 class="view-title">{{ formatDate(selectedDate) }} 课程安排</h3>
          </div>
          <div class="day-timeline">
            <!-- 时间轴 -->
            <div class="time-axis">
              <div v-for="time in timeSlots" :key="time" class="time-slot">
                <span class="time-label">{{ time }}</span>
              </div>
            </div>
            <!-- 课程区域 -->
            <div class="course-area">
              <div v-for="time in timeSlots" :key="time" class="course-slot">
                <!-- 课程卡片 -->
                <div
                  v-for="course in getCoursesForDate(selectedDate)"
                  :key="course.id"
                  v-if="isCourseInTimeSlot(course, time)"
                  class="course-card"
                  :class="getCourseColorClass(course.subject)"
                  @click="showCourseDetail(course)"
                >
                  <div class="course-header">
                    <h4 class="course-title">{{ course.subject }}</h4>
                    <el-button type="text" size="small" icon="el-icon-more" circle class="course-more"></el-button>
                  </div>
                  <p class="course-info">{{ course.teacher }} · {{ course.classroom }}</p>
                  <div class="course-footer">
                    <span class="course-type" :class="getTypeBadgeColorClass(course.type)">
                      {{ course.type }}
                    </span>
                    <span class="course-time">{{ course.startTime }} - {{ course.endTime }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 周视图 -->
        <div v-if="viewMode === 'week'" class="week-view">
          <div class="view-header">
            <h3 class="view-title">{{ getWeekRangeText() }}</h3>
          </div>
          <div class="week-table-container">
            <table class="week-table">
              <!-- 表头 -->
              <thead>
                <tr>
                  <th class="time-header"></th>
                  <th v-for="(day, index) in weekDays" :key="day" class="day-header">
                    <div class="day-name">{{ day }}</div>
                    <div class="day-date">{{ getWeekDate(day) }}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <!-- 时间槽 -->
                <tr v-for="time in timeSlots" :key="time">
                  <td class="time-cell">{{ time }}</td>
                  <!-- 每天的课程 -->
                  <td v-for="day in weekDays" :key="day" class="day-cell">
                    <div v-for="course in getCoursesForWeekDay(day, time)" :key="course.id" class="week-course-card" :class="getCourseColorClass(course.subject)">
                      <div class="week-course-title">{{ course.subject }}</div>
                      <div class="week-course-teacher">{{ course.teacher }}</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 月视图 -->
        <div v-if="viewMode === 'month'" class="month-view">
          <div class="view-header">
            <h3 class="view-title">{{ formatMonth(selectedDate) }}</h3>
          </div>
          <div class="month-calendar">
            <!-- 月视图内容 -->
            <div class="calendar-grid">
              <div class="calendar-header">
                <div v-for="day in weekDays" :key="day" class="calendar-weekday">{{ day }}</div>
              </div>
              <div class="calendar-body">
                <!-- 日期单元格 -->
                <div v-for="date in getMonthDates()" :key="date" class="calendar-day">
                  <div class="day-number">{{ date.getDate() }}</div>
                  <!-- 课程标记 -->
                  <div v-if="hasCoursesOnDate(date)" class="course-indicator"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 课程详情弹窗 -->
    <el-dialog :visible.sync="dialogVisible" title="课程详情" width="500px">
      <div v-if="selectedCourse" class="course-detail">
        <div class="detail-item">
          <span class="detail-label">课程名称：</span>
          <span class="detail-value">{{ selectedCourse.subject }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">教师：</span>
          <span class="detail-value">{{ selectedCourse.teacher }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">教室：</span>
          <span class="detail-value">{{ selectedCourse.classroom }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">时间：</span>
          <span class="detail-value">{{ selectedCourse.date }} {{ selectedCourse.startTime }} - {{ selectedCourse.endTime }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">类型：</span>
          <span class="detail-value">{{ selectedCourse.type }}</span>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="dialogVisible = false">编辑</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns'

export default {
  data() {
    return {
      viewMode: 'week',
      selectedDate: new Date(),
      dialogVisible: false,
      selectedCourse: null,
      showFilters: false,
      filters: {
        classroom: '',
        teacher: '',
        type: '',
        subject: ''
      },
      mockCourses: [
        {
          id: 1,
          subject: '数学',
          teacher: '张老师',
          classroom: 'A101',
          date: format(new Date(), 'yyyy-MM-dd'),
          startTime: '08:00',
          endTime: '09:30',
          type: '校内'
        },
        {
          id: 2,
          subject: '英语',
          teacher: '李老师',
          classroom: 'B202',
          date: format(new Date(), 'yyyy-MM-dd'),
          startTime: '10:00',
          endTime: '11:30',
          type: '校内'
        },
        {
          id: 3,
          subject: '物理',
          teacher: '王老师',
          classroom: 'C303',
          date: format(new Date(), 'yyyy-MM-dd'),
          startTime: '14:00',
          endTime: '15:30',
          type: '校内'
        }
      ],
      timeSlots: [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        '17:00', '17:30', '18:00'
      ],
      weekDays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    }
  },
  computed: {
    ...mapState(['courses']),
    hasActiveFilters() {
      return this.filters.type || this.filters.teacher || this.filters.subject
    },
    filterCount() {
      return [this.filters.type, this.filters.teacher, this.filters.subject].filter(Boolean).length
    }
  },
  methods: {
    navigateDate(direction) {
      const newDate = new Date(this.selectedDate)
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 1)
      } else {
        newDate.setDate(newDate.getDate() + 1)
      }
      this.selectedDate = newDate
    },
    goToToday() {
      this.selectedDate = new Date()
    },
    getWeekDates() {
      const startOfWeek = new Date(this.selectedDate);
      const day = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - day);

      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        weekDates.push(date);
      }
      return weekDates;
    },
    getMonthDates() {
      const start = startOfMonth(this.selectedDate)
      const end = endOfMonth(this.selectedDate)
      return eachDayOfInterval({ start, end })
    },
    getCoursesForDate(date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      return this.mockCourses.filter(course => course.date === dateStr);
    },
    hasCoursesOnDate(date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      return this.mockCourses.some(course => course.date === dateStr);
    },
    clearFilters() {
      this.filters = {
        classroom: '',
        teacher: '',
        type: '',
        subject: ''
      }
    },
    formatDate(date) {
      return format(date, 'yyyy年MM月dd日');
    },
    formatMonth(date) {
      return format(date, 'yyyy年MM月');
    },
    isCourseInTimeSlot(course, timeSlot) {
      const slotTime = timeSlot + ':00';
      return course.startTime <= slotTime && course.endTime > slotTime;
    },
    getCourseColorClass(subject) {
      const colors = {
        '数学': 'course-blue',
        '英语': 'course-green',
        '语文': 'course-purple',
        '物理': 'course-orange',
        '化学': 'course-red',
        '生物': 'course-teal',
        '历史': 'course-indigo',
        '地理': 'course-pink',
        '政治': 'course-yellow'
      };
      return colors[subject] || 'course-gray';
    },
    getTypeBadgeColorClass(type) {
      const colors = {
        '校内': 'type-blue',
        '校外': 'type-green'
      };
      return colors[type] || 'type-gray';
    },
    showCourseDetail(course) {
      this.selectedCourse = course;
      this.dialogVisible = true;
    },
    getWeekRangeText() {
      const weekDates = this.getWeekDates();
      const start = weekDates[0];
      const end = weekDates[6];
      return `${format(start, 'MM月dd日')} - ${format(end, 'MM月dd日')}`;
    },
    getWeekDate(dayName) {
      const weekDates = this.getWeekDates();
      const dayIndex = this.weekDays.indexOf(dayName);
      if (dayIndex !== -1) {
        return format(weekDates[dayIndex], 'MM/dd');
      }
      return '';
    },
    getCoursesForWeekDay(dayName, timeSlot) {
      const weekDates = this.getWeekDates();
      const dayIndex = this.weekDays.indexOf(dayName);
      if (dayIndex === -1) return [];

      const date = weekDates[dayIndex];
      const dateStr = format(date, 'yyyy-MM-dd');
      const slotTime = timeSlot + ':00';

      return this.mockCourses.filter(course => {
        return course.date === dateStr && course.startTime <= slotTime && course.endTime > slotTime;
      });
    }
  }
}
</script>

<style scoped>
.course-schedule-container {
  width: 100%;
}

.breadcrumb-container {
  margin-bottom: 16px;
}

.card-container {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
}

.control-bar-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.view-mode-group .el-radio-button__inner {
  border-radius: 4px;
  margin-right: 8px;
}

.date-navigation {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-badge {
  margin-left: 4px;
}

.filter-panel {
  padding: 16px 24px;
  background: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  border-bottom: 1px solid #e4e7ed;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filter-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.filter-content {
  display: flex;
  gap: 16px;
  align-items: center;
}

.filter-select {
  width: 180px;
}

.apply-filter-btn {
  white-space: nowrap;
}

.schedule-content {
  padding: 24px;
}

.view-header {
  margin-bottom: 16px;
}

.view-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

/* 日视图样式 */
.day-timeline {
  display: flex;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.time-axis {
  width: 80px;
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
}

.time-slot {
  height: 60px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #909399;
}

.course-area {
  flex: 1;
  position: relative;
}

.course-slot {
  height: 60px;
  border-bottom: 1px solid #e4e7ed;
  position: relative;
}

.course-card {
  position: absolute;
  left: 8px;
  right: 8px;
  top: 4px;
  bottom: 4px;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.course-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.course-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.course-more {
  padding: 0;
  min-width: 24px;
  height: 24px;
}

.course-info {
  font-size: 12px;
  color: #606266;
  margin: 0 0 4px 0;
}

.course-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.course-type {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
}

.course-time {
  font-size: 10px;
  color: #909399;
}

/* 周视图样式 */
.week-table-container {
  overflow-x: auto;
}

.week-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.time-header {
  width: 80px;
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  padding: 8px;
  text-align: center;
}

.day-header {
  width: 14.28%;
  background: #ffffff;
  border-right: 1px solid #e4e7ed;
  padding: 8px;
  text-align: center;
}

.day-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.day-date {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.time-cell {
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  border-top: 1px solid #e4e7ed;
  padding: 8px;
  text-align: center;
  font-size: 12px;
  color: #909399;
  height: 60px;
}

.day-cell {
  border-right: 1px solid #e4e7ed;
  border-top: 1px solid #e4e7ed;
  padding: 4px;
  height: 60px;
  position: relative;
}

.week-course-card {
  height: 100%;
  border-radius: 4px;
  padding: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.week-course-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.week-course-title {
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.week-course-teacher {
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 月视图样式 */
.month-calendar {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-header {
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.calendar-weekday {
  padding: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  border-right: 1px solid #e4e7ed;
}

.calendar-weekday:last-child {
  border-right: none;
}

.calendar-body {
  background: #ffffff;
}

.calendar-day {
  padding: 12px;
  border-right: 1px solid #e4e7ed;
  border-bottom: 1px solid #e4e7ed;
  min-height: 100px;
  position: relative;
}

.calendar-day:last-child {
  border-right: none;
}

.day-number {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
}

.course-indicator {
  width: 6px;
  height: 6px;
  background: #2563eb;
  border-radius: 50%;
  margin-top: 4px;
}

/* 课程颜色 */
.course-blue {
  background: #ecf5ff;
  border-color: #d9ecff;
}

.course-green {
  background: #f0f9eb;
  border-color: #e1f3d8;
}

.course-purple {
  background: #faf5ff;
  border-color: #f3e8ff;
}

.course-orange {
  background: #fdf6ec;
  border-color: #faecd8;
}

.course-red {
  background: #fef0f0;
  border-color: #fde2e2;
}

.course-teal {
  background: #f0fdfa;
  border-color: #ccfbf1;
}

.course-indigo {
  background: #f5f7ff;
  border-color: #ebeef5;
}

.course-pink {
  background: #fdf2f8;
  border-color: #fce8f3;
}

.course-yellow {
  background: #fefce8;
  border-color: #fef9c3;
}

.course-gray {
  background: #f5f7fa;
  border-color: #ebeef5;
}

/* 类型徽章颜色 */
.type-blue {
  background: #ecf5ff;
  color: #2563eb;
}

.type-green {
  background: #f0f9eb;
  color: #67c23a;
}

.type-gray {
  background: #f5f7fa;
  color: #909399;
}

/* 课程详情弹窗 */
.course-detail {
  padding: 16px 0;
}

.detail-item {
  margin-bottom: 12px;
}

.detail-label {
  display: inline-block;
  width: 80px;
  font-size: 14px;
  color: #606266;
}

.detail-value {
  font-size: 14px;
  color: #303133;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .control-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .control-bar-right {
    align-self: flex-end;
  }
}

@media (max-width: 768px) {
  .filter-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .apply-filter-btn {
    width: 100%;
  }
  
  .time-axis {
    width: 60px;
  }
  
  .time-slot {
    height: 48px;
  }
  
  .course-slot {
    height: 48px;
  }
  
  .time-cell {
    height: 48px;
  }
  
  .day-cell {
    height: 48px;
  }
}
</style>