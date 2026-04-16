<template>
  <div class="calendar-view common-container">
    <!-- 面包屑 -->
    <div class="breadcrumb">
      <span class="breadcrumb-link" @click="$router.push('/')">课程排课</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">排课日历</span>
    </div>

    <!-- 主内容区 -->
    <div class="calendar-container">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="calendar-title">
            <i class="el-icon-date"></i>
            <span>排课日历</span>
          </div>
          <div class="month-navigator">
            <button class="nav-btn" @click="prevMonth">
              <i class="el-icon-arrow-left"></i>
            </button>
            <span class="month-display">{{ currentYearMonth }}</span>
            <button class="nav-btn" @click="nextMonth">
              <i class="el-icon-arrow-right"></i>
            </button>
          </div>
          <span class="stats-tag blue">本月排课 8 天</span>
          <span class="stats-tag green">共 156 节课</span>
        </div>
        <div class="toolbar-right">
          <button class="today-btn" @click="goToday">
            <i class="el-icon-refresh"></i>
            返回今日
          </button>
        </div>
      </div>

      <!-- 图例说明 -->
      <div class="legend-bar">
        <div class="legend-item">
          <span class="legend-dot blue"></span>
          <span>校内课程</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot orange"></span>
          <span>校外课程</span>
        </div>
        <div class="legend-divider"></div>
        <div class="legend-item">
          <span class="legend-pill light-blue"></span>
          <span>1-3节课</span>
        </div>
        <div class="legend-item">
          <span class="legend-pill medium-blue"></span>
          <span>4-6节课</span>
        </div>
        <div class="legend-item">
          <span class="legend-pill dark-blue"></span>
          <span>7-9节课</span>
        </div>
        <div class="legend-item">
          <span class="legend-pill darkest-blue"></span>
          <span>10节以上</span>
        </div>
      </div>

      <!-- 日历网格 -->
      <div class="calendar-grid">
        <!-- 星期表头 -->
        <div class="calendar-header">
          <div v-for="day in weekDays" :key="day" class="header-cell">
            {{ day }}
          </div>
        </div>
        <!-- 日期格子 -->
        <div class="calendar-body">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            :class="[
              'day-cell',
              {
                'other-month': !day.isCurrentMonth,
                today: day.isToday,
                'has-courses': day.courses.length > 0,
              },
            ]"
            @click="handleDayClick(day)"
          >
            <div class="day-number">{{ day.date }}</div>
            <div v-if="day.courses.length > 0" class="course-info">
              <div
                class="course-badge"
                :class="getBadgeClass(day.courses.length)"
              >
                {{ day.courses.length }}节课
              </div>
              <div class="course-dots">
                <span
                  v-for="(course, idx) in day.courses.slice(0, 5)"
                  :key="idx"
                  class="dot"
                  :class="course.type === '校外' ? 'orange' : 'blue'"
                ></span>
              </div>
            </div>
            <!-- 今日标记 -->
            <div v-if="day.isToday" class="today-badge">今</div>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="usage-tips">
        <div class="tips-title">
          <i class="el-icon-info"></i>
          使用说明：
        </div>
        <ul class="tips-list">
          <li>
            点击有排课的日期可跳转到课表视图的日视图，查看该日详细课程安排
          </li>
          <li>鼠标悬浮在日期上可查看该日的校内/校外课程数量统计</li>
          <li>标签颜色深浅代表排课密度，颜色越深表示课程越多</li>
          <li>小圆点表示课程类型比例：蓝色为校内课程，橙色为校外课程</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CourseCalendar",
  data() {
    return {
      currentDate: new Date(),
      weekDays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
      // 模拟课程数据
      courseData: {
        "2026-04-01": [
          { type: "校内", name: "数学" },
          { type: "校内", name: "语文" },
          { type: "校内", name: "英语" },
          { type: "校外", name: "美术" },
        ],
        "2026-04-02": [
          { type: "校内", name: "物理" },
          { type: "校内", name: "化学" },
          { type: "校内", name: "生物" },
          { type: "校外", name: "音乐" },
        ],
        "2026-04-03": [
          { type: "校内", name: "历史" },
          { type: "校内", name: "地理" },
          { type: "校外", name: "体育" },
        ],
        "2026-04-07": [
          { type: "校内", name: "数学" },
          { type: "校内", name: "语文" },
        ],
        "2026-04-09": [
          { type: "校内", name: "英语" },
          { type: "校内", name: "物理" },
          { type: "校外", name: "化学" },
        ],
        "2026-04-14": [
          { type: "校内", name: "数学" },
          { type: "校内", name: "语文" },
        ],
        "2026-04-15": [{ type: "校内", name: "英语" }],
        "2026-04-16": [{ type: "校外", name: "美术" }],
      },
    };
  },
  computed: {
    currentYearMonth() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth() + 1;
      return `${year}年${month}月`;
    },
    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const daysInMonth = lastDay.getDate();
      const firstDayOfWeek = firstDay.getDay();

      const days = [];

      // 上个月的日期
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = prevMonthLastDay - i;
        days.push({
          date,
          isCurrentMonth: false,
          isToday: false,
          courses: [],
          fullDate: this.formatDate(new Date(year, month - 1, date)),
        });
      }

      // 当月的日期
      const today = new Date();
      for (let i = 1; i <= daysInMonth; i++) {
        const fullDate = this.formatDate(new Date(year, month, i));
        const isToday =
          year === today.getFullYear() &&
          month === today.getMonth() &&
          i === today.getDate();

        days.push({
          date: i,
          isCurrentMonth: true,
          isToday,
          courses: this.courseData[fullDate] || [],
          fullDate,
        });
      }

      // 下个月的日期
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: i,
          isCurrentMonth: false,
          isToday: false,
          courses: [],
          fullDate: this.formatDate(new Date(year, month + 1, i)),
        });
      }

      return days;
    },
  },
  methods: {
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    prevMonth() {
      const newDate = new Date(this.currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      this.currentDate = newDate;
    },
    nextMonth() {
      const newDate = new Date(this.currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      this.currentDate = newDate;
    },
    goToday() {
      this.currentDate = new Date();
    },
    getBadgeClass(count) {
      if (count <= 3) return "light-blue";
      if (count <= 6) return "medium-blue";
      if (count <= 9) return "dark-blue";
      return "darkest-blue";
    },
    handleDayClick(day) {
      if (day.courses.length > 0) {
        console.log("排课日历跳转视图===", day);

        // 跳转到课表视图的日视图
        this.$router.push({
          path: "/schedule-view",
          query: { date: day.fullDate, view: "day" },
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.calendar-view {
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

.calendar-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #ebeef5;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.calendar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;

  i {
    color: #4f7cff;
    font-size: 18px;
  }
}

.month-navigator {
  display: flex;
  align-items: center;
  gap: 12px;
}

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

.month-display {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  min-width: 100px;
  text-align: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;

  &.blue {
    background: #e6f7ff;
    color: #1890ff;
    border: 1px solid #91d5ff;
  }

  &.green {
    background: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
  }
}

.today-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  height: 32px;
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
}

.legend-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;

  &.blue {
    background: #4f7cff;
  }

  &.orange {
    background: #ff9c4f;
  }
}

.legend-divider {
  width: 1px;
  height: 20px;
  background: #dcdfe6;
  margin: 0 8px;
}

.legend-pill {
  width: 40px;
  height: 18px;
  border-radius: 4px;

  &.light-blue {
    background: #e6f7ff;
    border: 1px solid #91d5ff;
  }

  &.medium-blue {
    background: #91caff;
    border: 1px solid #4096ff;
  }

  &.dark-blue {
    background: #4f7cff;
    border: 1px solid #3056e3;
  }

  &.darkest-blue {
    background: #1d39c4;
    border: 1px solid #10239e;
  }
}

.calendar-grid {
  padding: 0 24px 24px;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.header-cell {
  padding: 12px;
  text-align: center;
  font-weight: 500;
  color: #606266;
  border-right: 1px solid #ebeef5;

  &:last-child {
    border-right: none;
  }
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border: 1px solid #ebeef5;
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.day-cell {
  min-height: 120px;
  padding: 8px;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;

  &:nth-child(7n) {
    border-right: none;
  }

  &:nth-last-child(-n + 7) {
    border-bottom: none;
  }

  &:hover {
    background: #f5f7fa;
  }

  &.other-month {
    background: #fafafa;

    .day-number {
      color: #c0c4cc;
    }
  }

  &.today {
    background: #ecf5ff;
    border: 2px solid #4f7cff;

    .day-number {
      color: #4f7cff;
      font-weight: 600;
    }
  }

  &.has-courses {
    &:hover {
      background: #e6f7ff;
    }
  }
}

.day-number {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.course-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.course-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;

  &.light-blue {
    background: #e6f7ff;
    color: #1890ff;
    border: 1px solid #91d5ff;
  }

  &.medium-blue {
    background: #91caff;
    color: #fff;
    border: 1px solid #4096ff;
  }

  &.dark-blue {
    background: #4f7cff;
    color: #fff;
    border: 1px solid #3056e3;
  }

  &.darkest-blue {
    background: #1d39c4;
    color: #fff;
    border: 1px solid #10239e;
  }
}

.course-dots {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;

  &.blue {
    background: #4f7cff;
  }

  &.orange {
    background: #ff9c4f;
  }
}

.today-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: #4f7cff;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}

.usage-tips {
  margin-top: 20px;
  padding: 16px 20px;
  background: #f0f5ff;
  border: 1px solid #d6e4ff;
  border-radius: 8px;

  .tips-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #1d39c4;
    margin-bottom: 8px;

    i {
      font-size: 14px;
    }
  }

  .tips-list {
    margin: 0;
    padding-left: 20px;
    font-size: 13px;
    color: #4f7cff;
    line-height: 1.8;

    li {
      list-style-type: disc;
    }
  }
}
</style>
