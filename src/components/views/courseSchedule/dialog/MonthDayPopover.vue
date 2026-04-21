<template>
  <el-popover
    v-model="visible"
    placement="right"
    trigger="click"
    :visible-arrow="true"
    popper-class="month-day-popover"
    :width="320"
    @show="handleShow"
    @hide="handleHide"
  >
    <!-- 触发元素插槽 -->
    <div slot="reference" class="more-trigger" @click.stop="handleTriggerClick">
      <slot></slot>
    </div>

    <!-- 浮动窗内容 -->
    <div class="popover-container">
      <!-- 标题区域 -->
      <div class="popover-header">
        <div class="header-title">{{ title }}</div>
        <i class="el-icon-close close-btn" @click="close"></i>
      </div>

      <!-- 课程列表 -->
      <div class="course-list">
        <div
          v-for="(course, index) in courses"
          :key="course.id || index"
          :class="['course-item', getCourseTypeClass(course)]"
          @click.stop="handleCourseClick(course)"
        >
          <div class="course-info">
            <div class="course-name">{{ course.courseName }}</div>
            <div class="course-detail">
              <i class="el-icon-time"></i>
              <span class="time-range">{{ course.periodTimeRange }}</span>
            </div>
            <div class="course-detail">
              <i class="el-icon-user"></i>
              <span class="teacher-name">{{ course.teacherName }}</span>
            </div>
            <div class="course-detail">
              <i class="el-icon-location"></i>
              <span class="location">{{ course.location || '-' }}</span>
            </div>
          </div>
          <div class="course-status">
            <span :class="['status-tag', getStatusClass(course)]">{{ getStatusText(course) }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="courses.length === 0" class="empty-state">
        <i class="el-icon-document"></i>
        <span>暂无课程安排</span>
      </div>
    </div>
  </el-popover>
</template>

<script>
export default {
  name: 'MonthDayPopover',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    date: {
      type: String,
      default: '',
    },
    courses: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    visible: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
    title() {
      if (!this.date) return '全部课程';
      const d = new Date(this.date);
      const month = d.getMonth() + 1;
      const day = d.getDate();
      return `${month}月${day}日 全部课程 (${this.courses.length})`;
    },
  },
  methods: {
    handleTriggerClick() {
      this.visible = true;
    },
    close() {
      this.visible = false;
    },
    handleShow() {
      this.$emit('show');
    },
    handleHide() {
      this.$emit('hide');
    },
    handleCourseClick(course) {
      this.$emit('course-click', course);
      this.close();
    },
    getCourseTypeClass(course) {
      return course.activityType === 1 ? 'type-school' : 'type-outdoor';
    },
    getStatusText(course) {
      const map = {
        1: '正常教学',
        2: '户外教学',
      };
      return map[course.activityType] || '正常教学';
    },
    getStatusClass(course) {
      return course.activityType === 1 ? 'status-normal' : 'status-outdoor';
    },
  },
};
</script>

<style lang="scss" scoped>
.more-trigger {
  display: inline-block;
  cursor: pointer;
}

.popover-container {
  max-height: 400px;
  overflow: hidden;
}

.popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  background: #fff;

  .header-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  .close-btn {
    font-size: 14px;
    color: #909399;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #409eff;
    }
  }
}

.course-list {
  max-height: 350px;
  overflow-y: auto;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f7fa;
  }
}

.course-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  margin: 0 8px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 3px solid transparent;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: #f5f7fa;
    transform: translateX(2px);
  }

  &.type-school {
    background: #f0f9ff;
    border-left-color: #1890ff;

    &:hover {
      background: #e6f7ff;
    }

    .course-name {
      color: #1890ff;
    }
  }

  &.type-outdoor {
    background: #f6ffed;
    border-left-color: #52c41a;

    &:hover {
      background: #e6ffdf;
    }

    .course-name {
      color: #52c41a;
    }
  }
}

.course-info {
  flex: 1;
  min-width: 0;

  .course-name {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .course-detail {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #606266;
    margin-bottom: 2px;

    &:last-child {
      margin-bottom: 0;
    }

    i {
      font-size: 10px;
      color: #909399;
    }

    .time-range {
      color: #409eff;
      font-weight: 500;
    }
  }
}

.course-status {
  flex-shrink: 0;
  margin-left: 8px;

  .status-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;

    &.status-normal {
      background: #e6f7ff;
      color: #1890ff;
      border: 1px solid #91d5ff;
    }

    &.status-outdoor {
      background: #f6ffed;
      color: #52c41a;
      border: 1px solid #b7eb8f;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  color: #909399;

  i {
    font-size: 32px;
    margin-bottom: 8px;
  }

  span {
    font-size: 12px;
  }
}
</style>

<style lang="scss">
/* 全局样式覆盖 el-popover */
.month-day-popover {
  padding: 0 !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;

  .el-popover__title {
    display: none;
  }

  .popper__arrow {
    border-width: 8px;
  }
}
</style>
