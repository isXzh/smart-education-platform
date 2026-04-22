<template>
  <div class="schedule-view common-container">
    <!-- 面包屑 -->
    <div class="breadcrumb">
      <span class="breadcrumb-link" @click="$router.push('/')">课程排课</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">课表视图</span>
    </div>

    <!-- 主内容区 -->
    <div class="schedule-container">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <!-- 视图切换 -->
        <div class="view-switcher">
          <button
            v-for="view in views"
            :key="view.key"
            :class="['view-btn', { active: currentView === view.key }]"
            @click="switchView(view.key)"
          >
            {{ view.label }}
          </button>
        </div>

        <!-- 日期导航 -->
        <div class="date-navigator">
          <button class="nav-btn" @click="prev">
            <i class="el-icon-arrow-left"></i>
          </button>
          <button class="today-btn" @click="goToday">今天</button>
          <div class="date-display">
            <i class="el-icon-date"></i>
            <span>{{ displayDate }}</span>
          </div>
          <button class="nav-btn" @click="next">
            <i class="el-icon-arrow-right"></i>
          </button>
        </div>

        <!-- 右侧操作 -->
        <div class="actions">
          <div class="filter-item">
            <label>学段</label>
            <el-select
              class="xueduan-title"
              v-model="selectedStage"
              placeholder="请选择学段"
              @change="handleStageChange"
            >
              <el-option
                v-for="stage in stageList"
                :key="stage.id"
                :label="stage.stageName"
                :value="stage.id"
              ></el-option>
            </el-select>
          </div>
          <button class="action-btn" :class="{ active: filterVisible }" @click="toggleFilter">
            <i class="el-icon-s-operation"></i>
            高级筛选
          </button>
          <button class="action-btn primary" @click="exportSchedule">
            <i class="el-icon-download"></i>
            导出课表
          </button>
        </div>
      </div>

      <!-- 筛选面板 -->
      <div v-show="filterVisible" class="filter-panel">
        <div class="filter-header">
          <span class="filter-title">筛选条件</span>
        </div>
        <div class="filter-content">
          <div class="filter-row">
            <!-- <div class="filter-item">
              <label>学段</label>
              <el-select
                v-model="selectedStage"
                placeholder="请选择学段"
                @change="handleStageChange"
              >
                <el-option
                  v-for="stage in stageList"
                  :key="stage.id"
                  :label="stage.name"
                  :value="stage.id"
                ></el-option>
              </el-select>
            </div> -->
            <div class="filter-item">
              <label>活动类型</label>
              <el-select v-model="filterForm.activityType" placeholder="全部类型" clearable>
                <el-option label="全部类型" value=""></el-option>
                <el-option label="校内课程" value="校内"></el-option>
                <el-option label="校外课程" value="校外"></el-option>
              </el-select>
            </div>
            <div class="filter-item">
              <label>教师</label>
              <el-select v-model="filterForm.teacher" placeholder="全部教师" clearable>
                <el-option label="全部教师" value=""></el-option>
                <el-option label="张老师" value="张老师"></el-option>
                <el-option label="李老师" value="李老师"></el-option>
                <el-option label="王老师" value="王老师"></el-option>
                <el-option label="赵老师" value="赵老师"></el-option>
              </el-select>
            </div>
            <div class="filter-item">
              <label>学科</label>
              <el-select v-model="filterForm.subject" placeholder="全部学科" clearable>
                <el-option label="全部学科" value=""></el-option>
                <el-option label="数学" value="数学"></el-option>
                <el-option label="语文" value="语文"></el-option>
                <el-option label="英语" value="英语"></el-option>
                <el-option label="物理" value="物理"></el-option>
                <el-option label="化学" value="化学"></el-option>
              </el-select>
            </div>
          </div>
          <div class="filter-actions">
            <el-button type="primary" class="apply-filter-btn" @click="applyFilter"> 应用筛选 </el-button>
          </div>
        </div>
      </div>

      <!-- 周视图 -->
      <div v-show="currentView === 'week'" class="week-view">
        <div class="week-grid">
          <!-- 表头 -->
          <div class="grid-header">
            <div class="time-column">时间</div>
            <div v-for="(day, index) in weekDays" :key="index" :class="['day-column', { today: isToday(day.date) }]">
              <div class="day-name">{{ day.name }}</div>
              <div class="day-date">{{ day.dateStr }}</div>
            </div>
          </div>

          <!-- 表格主体 -->
          <div class="grid-body">
            <div v-for="timeSlot in timeSlots" :key="timeSlot.time" class="time-row">
              <div class="time-label">{{ timeSlot.label }}</div>
              <div
                v-for="(day, dayIndex) in weekDays"
                :key="dayIndex"
                :class="['course-cell', { today: isToday(day.date) }]"
                @click="handleCellClick(day, timeSlot)"
              >
                <div
                  v-for="course in getWeekViewCourses(day.date, timeSlot.time)"
                  :key="course.id"
                  :class="['course-card', course.activityType === 1 ? '校内' : '校外']"
                  @click.stop="handleCourseClick(course)"
                >
                  <div class="course-name">{{ course.courseName }}</div>
                  <div class="course-teacher">{{ course.teacherName }}</div>
                  <div class="course-teacher">{{ course.periodTimeRange }}</div>
                  <!-- <div class="course-location">
                    <i class="el-icon-location"></i>
                    {{ course.location  }}
                  </div> -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 日视图 -->
      <div v-show="currentView === 'day'" class="day-view">
        <div class="day-header">
          <div class="current-day">{{ currentDayText }}</div>
        </div>
        <div class="day-timeline">
          <div v-for="timeSlot in timeSlots" :key="timeSlot.time" class="timeline-row">
            <div class="time-label">{{ timeSlot.label }}</div>
            <div class="course-area">
              <div
                v-for="course in getDayViewCourses(timeSlot.time)"
                :key="course.id"
                :class="['course-card', course.activityType === 1 ? '校内' : '校外']"
                @click="handleCourseClick(course)"
              >
                <div class="course-name">{{ course.courseName }}</div>
                <div class="course-teacher">{{ course.teacherName }}</div>
                <div class="course-teacher">{{ course.periodTimeRange }}</div>
                <div class="course-location">{{ course.location }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 月视图 -->
      <div v-show="currentView === 'month'" class="month-view">
        <div class="month-calendar">
          <div class="calendar-header">
            <div v-for="day in ['周一', '周二', '周三', '周四', '周五', '周六', '周日']" :key="day" class="week-day">
              {{ day }}
            </div>
          </div>
          <div class="calendar-body">
            <div v-for="(week, weekIndex) in monthWeeks" :key="weekIndex" class="calendar-week">
              <div
                v-for="(day, dayIndex) in week"
                :key="dayIndex"
                :class="[
                  'calendar-day',
                  {
                    'other-month': !day.isCurrentMonth,
                    today: day.isToday,
                  },
                ]"
              >
                <div class="day-number">{{ day.date }}</div>
                <div class="day-courses">
                  <div
                    v-for="course in day.courses.slice(0, 3)"
                    :key="course.id"
                    :class="['mini-course', course.activityType === 1 ? '校内' : '校外']"
                    @click.stop="handleCourseClick(course)"
                  >
                    {{ course.courseName }}
                  </div>
                  <MonthDayPopover
                    v-if="day.courses.length > 3"
                    :date="day.fullDate"
                    :courses="day.courses"
                    @course-click="handleCourseClick"
                  >
                    <div class="more-courses">+{{ day.courses.length - 3 }} 更多</div>
                  </MonthDayPopover>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 排课预览弹窗 -->
    <ShowPreview :visible.sync="previewVisible" :data="selectedCourse" />
  </div>
</template>

<script>
  import gradeLevelApi from '@/api/gradeLevel.js';
  import classPeriodApi from '@/api/classPeriod.js';
  import scheduleApi from '@/api/schedule.js';
  import ShowPreview from './dialog/showPreview.vue';
  import MonthDayPopover from './dialog/MonthDayPopover.vue';

  export default {
    name: 'CourseView',
    components: {
      ShowPreview,
      MonthDayPopover,
    },
    data() {
      return {
        currentView: 'week',
        views: [
          { key: 'day', label: '日视图' },
          { key: 'week', label: '周视图' },
          { key: 'month', label: '月视图' },
        ],
        currentDate: new Date(),
        // 时间段列表，从classPeriod接口获取
        timeSlots: [],
        // 学段列表
        stageList: [],
        // 当前选中的学段
        selectedStage: null,
        // 排课数据列表
        scheduleList: [],
        // 课时id与数据的映射，用于匹配
        periodMap: {},
        filterVisible: false,
        filterForm: {
          activityType: '',
          teacher: '',
          subject: '',
        },
        // 排课预览弹窗
        previewVisible: false,
        selectedCourse: {},
      };
    },
    created() {
      // 从 URL 参数读取日期和视图
      const { date, view } = this.$route.query;
      if (date) {
        this.currentDate = new Date(date);
      }
      if (view && ['day', 'week', 'month'].includes(view)) {
        this.currentView = view;
      }
      this.initStageList();
    },
    computed: {
      weekDays() {
        const days = [];
        const weekStart = this.getWeekStart(this.currentDate);
        const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

        for (let i = 0; i < 7; i++) {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + i);
          days.push({
            name: dayNames[i],
            date: this.formatDate(date),
            dateStr: `${date.getMonth() + 1}/${date.getDate()}`,
          });
        }
        return days;
      },
      currentDayText() {
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const date = this.currentDate;
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${days[date.getDay()]}`;
      },
      currentDateStr() {
        return this.formatDate(this.currentDate);
      },
      displayDate() {
        if (this.currentView === 'week') {
          const start = this.weekDays[0];
          const end = this.weekDays[6];
          return `${start.date} - ${end.date}`;
        } else if (this.currentView === 'month') {
          return `${this.currentDate.getFullYear()}年${this.currentDate.getMonth() + 1}月`;
        } else {
          return this.currentDayText;
        }
      },
      monthWeeks() {
        const weeks = [];
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // 获取当月第一天
        const firstDay = new Date(year, month, 1);
        // 获取当月最后一天
        const lastDay = new Date(year, month + 1, 0);

        // 获取第一周的开始（周一）
        let currentWeekStart = new Date(firstDay);
        const dayOfWeek = firstDay.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        currentWeekStart.setDate(firstDay.getDate() - daysToSubtract);

        // 生成所有周
        while (currentWeekStart <= lastDay || weeks.length < 6) {
          const week = [];
          for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekStart);
            date.setDate(currentWeekStart.getDate() + i);

            const isCurrentMonth = date.getMonth() === month;
            const isToday = this.isToday(date);
            const dateStr = this.formatDate(date);

            // 通过lessonDate匹配月视图数据
            const dayCourses = this.getMonthViewCourses(dateStr);

            week.push({
              date: date.getDate(),
              fullDate: dateStr,
              isCurrentMonth,
              isToday,
              courses: dayCourses,
            });
          }
          weeks.push(week);
          currentWeekStart.setDate(currentWeekStart.getDate() + 7);

          // 如果已经超出当月并且至少生成了4周，停止
          if (currentWeekStart > lastDay && weeks.length >= 4) {
            break;
          }
        }

        return weeks;
      },
    },
    methods: {
      // 初始化学段列表
      async initStageList() {
        try {
          const res = await gradeLevelApi.list();
          if (res && res.data) {
            this.stageList = res.data;
            // 默认选择第一个学段
            if (this.stageList.length > 0) {
              this.selectedStage = this.stageList[0].id;
              // 初始化学段后，获取课时列表和排课数据
              await this.initClassPeriods();
              await this.fetchScheduleData();
            }
          }
        } catch (error) {
          console.error('获取学段列表失败:', error);
        }
      },

      // 学段切换处理
      async handleStageChange() {
        await this.initClassPeriods();
        await this.fetchScheduleData();
      },

      // 初始化课时列表
      async initClassPeriods() {
        if (!this.selectedStage) return;
        try {
          const res = await classPeriodApi.list(this.selectedStage);
          if (res && res.data) {
            // 构建课时map，用于后续匹配
            this.periodMap = {};
            res.data.forEach(period => {
              this.periodMap[period.id] = period;
            });
            // 构建时间段列表，用于视图左侧显示
            this.timeSlots = res.data.map(period => ({
              time: period.startTime,
              label: `${period.startTime}`,
              periodId: period.id,
            }));
          }
        } catch (error) {
          console.error('获取课时列表失败:', error);
        }
      },

      // 获取排课数据
      async fetchScheduleData() {
        if (!this.selectedStage) return;

        try {
          let params = {
            stageId: this.selectedStage,
          };

          if (this.currentView === 'day') {
            // 日视图：查询当天数据
            params.startDate = this.currentDateStr;
            params.endDate = this.currentDateStr;
          } else if (this.currentView === 'week') {
            // 周视图：查询本周数据
            const startDate = this.weekDays[0].date;
            const endDate = this.weekDays[6].date;
            params.startDate = startDate;
            params.endDate = endDate;
          } else if (this.currentView === 'month') {
            // 月视图：查询本月数据
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            params.startDate = this.formatDate(firstDay);
            params.endDate = this.formatDate(lastDay);
          }

          const res = await scheduleApi.page(params);
          if (res && res.data && res.data.list) {
            this.scheduleList = res.data.list;
          } else {
            this.scheduleList = [];
          }
        } catch (error) {
          console.error('获取排课数据失败:', error);
          this.scheduleList = [];
        }
      },

      // 日视图获取课程
      getDayViewCourses(time) {
        // 通过periodId匹配排课数据
        return this.scheduleList.filter(schedule => {
          const period = this.periodMap[schedule.periodId];
          if (!period) return false;
          return period.startTime === time;
        });
      },

      // 周视图获取课程
      getWeekViewCourses(date, time) {
        // 通过periodId匹配排课数据，并且日期匹配
        return this.scheduleList.filter(schedule => {
          if (schedule.lessonDate !== date) return false;
          const period = this.periodMap[schedule.periodId];
          if (!period) return false;
          return period.startTime === time;
        });
      },

      // 月视图获取课程
      getMonthViewCourses(dateStr) {
        // 通过lessonDate匹配月视图数据
        return this.scheduleList.filter(schedule => {
          return schedule.lessonDate === dateStr;
        });
      },

      formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      },

      getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
      },

      isToday(date) {
        const today = new Date();
        const dateStr = typeof date === 'string' ? date : this.formatDate(date);
        return dateStr === this.formatDate(today);
      },

      switchView(view) {
        this.currentView = view;
        this.fetchScheduleData();
      },

      prev() {
        if (this.currentView === 'week') {
          this.currentDate.setDate(this.currentDate.getDate() - 7);
        } else if (this.currentView === 'month') {
          this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        } else {
          this.currentDate.setDate(this.currentDate.getDate() - 1);
        }
        // 触发响应式更新
        this.currentDate = new Date(this.currentDate);
        this.fetchScheduleData();
      },

      next() {
        if (this.currentView === 'week') {
          this.currentDate.setDate(this.currentDate.getDate() + 7);
        } else if (this.currentView === 'month') {
          this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        } else {
          this.currentDate.setDate(this.currentDate.getDate() + 1);
        }
        // 触发响应式更新
        this.currentDate = new Date(this.currentDate);
        this.fetchScheduleData();
      },

      goToday() {
        this.currentDate = new Date();
        this.fetchScheduleData();
      },

      handleCellClick(day, timeSlot) {
        console.log('点击了单元格:', day, timeSlot);
      },

      handleCourseClick(course) {
        // 打开排课预览弹窗
        this.selectedCourse = course;
        this.previewVisible = true;
      },

      toggleFilter() {
        this.filterVisible = !this.filterVisible;
      },

      applyFilter() {
        this.filterVisible = false;
        console.log('应用筛选:', this.filterForm);
        this.$message.success('筛选已应用');
        // 重新获取排课数据
        this.fetchScheduleData();
      },

      exportSchedule() {
        console.log('导出课表');
        this.$message.info('导出功能开发中...');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .xueduan-title {
    margin-left: 10px;
  }
  .schedule-view {
    padding: 20px;
    background: #f5f7fa;
    min-height: 100%;
  }

  .breadcrumb {
    margin-bottom: 16px;
    font-size: 14px;
    color: #606266;

    .breadcrumb-link {
      color: #4f7cff;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }

    .breadcrumb-separator {
      margin: 0 8px;
      color: #c0c4cc;
    }

    .breadcrumb-current {
      color: #303133;
    }
  }

  .schedule-container {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
    flex-wrap: wrap;
    gap: 12px;
  }

  .view-switcher {
    display: flex;
    gap: 0;
    background: #f5f7fa;
    border-radius: 4px;
    padding: 4px;

    .view-btn {
      padding: 6px 16px;
      border: none;
      background: transparent;
      color: #606266;
      font-size: 14px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s;

      &:hover {
        color: #4f7cff;
      }

      &.active {
        background: #4f7cff;
        color: #fff;
      }
    }
  }

  .date-navigator {
    display: flex;
    align-items: center;
    gap: 8px;

    .nav-btn {
      width: 32px;
      height: 32px;
      border: 1px solid #dcdfe6;
      background: #fff;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;

      &:hover {
        border-color: #4f7cff;
        color: #4f7cff;
      }
    }

    .today-btn {
      padding: 0 16px;
      height: 32px;
      border: 1px solid #dcdfe6;
      background: #fff;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;

      &:hover {
        border-color: #4f7cff;
        color: #4f7cff;
      }
    }

    .date-display {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px;
      height: 32px;
      background: #f5f7fa;
      border-radius: 4px;
      font-size: 14px;
      color: #303133;
      font-weight: 500;

      i {
        color: #4f7cff;
      }
    }
  }

  .actions {
    display: flex;
    gap: 8px;
    align-items: center;

    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 16px;
      height: 40px;
      border: 1px solid #dcdfe6;
      background: #fff;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      color: #606266;
      transition: all 0.3s;

      &:hover {
        border-color: #4f7cff;
        color: #4f7cff;
      }

      &.primary {
        background: #4f7cff;
        border-color: #4f7cff;
        color: #fff;

        &:hover {
          background: #3b5de0;
          border-color: #3b5de0;
        }
      }

      &.active {
        background: #ecf5ff;
        border-color: #4f7cff;
        color: #4f7cff;
      }
    }
  }

  // 筛选面板样式
  .filter-panel {
    background: #fff;
    border: 1px solid #ebeef5;
    border-top: none;
    border-radius: 0 0 8px 8px;
    padding: 16px 20px;

    .filter-header {
      margin-bottom: 12px;

      .filter-title {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
      }
    }

    .filter-content {
      .filter-row {
        display: flex;
        gap: 16px;
        align-items: flex-end;
      }

      .filter-item {
        flex: 1;

        label {
          display: block;
          font-size: 13px;
          color: #606266;
          margin-bottom: 6px;
        }

        ::v-deep .el-select {
          width: 100%;

          .el-input__inner {
            height: 36px;
            line-height: 36px;
          }
        }
      }

      .filter-actions {
        flex-shrink: 0;

        .apply-filter-btn {
          height: 36px;
          padding: 0 24px;
          background: #4f7cff;
          border-color: #4f7cff;

          &:hover {
            background: #3b5de0;
            border-color: #3b5de0;
          }
        }
      }
    }
  }

  // 周视图样式
  .week-view {
    padding: 20px;
  }

  .week-grid {
    border: 1px solid #ebeef5;
    border-radius: 8px;
    overflow: hidden;
  }

  .grid-header {
    display: flex;
    background: #f5f7fa;
    border-bottom: 1px solid #ebeef5;

    .time-column {
      width: 80px;
      padding: 12px;
      text-align: center;
      font-weight: 500;
      color: #606266;
      border-right: 1px solid #ebeef5;
    }

    .day-column {
      flex: 1;
      padding: 12px;
      text-align: center;
      border-right: 1px solid #ebeef5;

      &:last-child {
        border-right: none;
      }

      &.today {
        background: #ecf5ff;
      }

      .day-name {
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }

      .day-date {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .grid-body {
    .time-row {
      display: flex;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .time-label {
        width: 80px;
        padding: 12px;
        text-align: center;
        color: #606266;
        font-size: 12px;
        background: #fafafa;
        border-right: 1px solid #ebeef5;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .course-cell {
        flex: 1;
        min-height: 80px;
        padding: 8px;
        border-right: 1px solid #ebeef5;
        background: #fff;

        &:last-child {
          border-right: none;
        }

        &.today {
          background: #f5f9ff;
        }
      }
    }
  }

  .course-card {
    padding: 8px;
    border-radius: 6px;
    margin-bottom: 4px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:last-child {
      margin-bottom: 0;
    }

    &.校内 {
      background: #e6f7ff;
      border: 1px solid #91d5ff;

      .course-name {
        color: #1890ff;
      }
    }

    &.校外 {
      background: #f6ffed;
      border: 1px solid #b7eb8f;

      .course-name {
        color: #52c41a;
      }
    }

    .course-name {
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .course-teacher {
      font-size: 11px;
      color: #666;
      margin-bottom: 2px;
    }

    .course-location {
      font-size: 11px;
      color: #999;
      display: flex;
      align-items: center;
      gap: 2px;

      i {
        font-size: 10px;
      }
    }
  }

  // 日视图样式
  .day-view {
    padding: 20px;

    .day-header {
      text-align: center;
      margin-bottom: 20px;

      .current-day {
        font-size: 20px;
        font-weight: 500;
        color: #303133;
      }
    }

    .day-timeline {
      border: 1px solid #ebeef5;
      border-radius: 8px;
      overflow: hidden;

      .timeline-row {
        display: flex;
        border-bottom: 1px solid #ebeef5;

        &:last-child {
          border-bottom: none;
        }

        .time-label {
          width: 100px;
          padding: 16px;
          background: #f5f7fa;
          border-right: 1px solid #ebeef5;
          font-weight: 500;
          color: #606266;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .course-area {
          flex: 1;
          padding: 12px;
          min-height: 80px;
        }
      }
    }
  }

  // 月视图样式
  .month-view {
    padding: 20px;

    .month-calendar {
      border: 1px solid #ebeef5;
      border-radius: 8px;
      overflow: hidden;

      .calendar-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        background: #f5f7fa;
        border-bottom: 1px solid #ebeef5;

        .week-day {
          padding: 12px;
          text-align: center;
          font-weight: 500;
          color: #606266;
        }
      }

      .calendar-body {
        .calendar-week {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          border-bottom: 1px solid #ebeef5;

          &:last-child {
            border-bottom: none;
          }

          .calendar-day {
            min-height: 120px;
            padding: 8px;
            border-right: 1px solid #ebeef5;
            background: #fff;

            &:last-child {
              border-right: none;
            }

            &.other-month {
              background: #fafafa;
              color: #c0c4cc;
            }

            &.today {
              background: #ecf5ff;

              .day-number {
                color: #409eff;
                font-weight: 600;
              }
            }

            .day-number {
              font-size: 14px;
              margin-bottom: 4px;
            }

            .day-courses {
              .mini-course {
                font-size: 11px;
                padding: 2px 4px;
                margin-bottom: 2px;
                border-radius: 3px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                cursor: pointer;

                &.校内 {
                  background: #e6f7ff;
                  color: #1890ff;
                  border: 1px solid #91d5ff;
                }

                &.校外 {
                  background: #f6ffed;
                  color: #52c41a;
                  border: 1px solid #b7eb8f;
                }
              }

              .more-courses {
                font-size: 11px;
                color: #999;
                text-align: center;
                margin-top: 4px;
              }
            }
          }
        }
      }
    }
  }
</style>
