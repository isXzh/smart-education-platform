<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="700px"
    :show-close="false"
    :close-on-click-modal="true"
    custom-class="preview-dialog"
    @close="handleClose"
    top="5vh"
  >
    <!-- 自定义标题插槽 -->
    <div slot="title" class="custom-dialog-header">
      <div class="header-left">
        <div class="course-name">{{ data.courseName || '-' }}</div>
        <div class="tag-container">
<div class="tag type-tag">{{ getActivityTypeText(data.activityType) }}</div>
        <span class="tag subject-tag">{{ data.subjectName || '-' }}</span>
        </div>
        
      </div>
      <i class="el-icon-close close-icon" @click="handleClose"></i>
    </div>

    <!-- 内容区域 -->
    <div class="preview-content">
      <!-- 基本信息 -->
      <div class="info-section">
        <div class="section-title">
          <i class="el-icon-document section-icon"></i>
          <span>基本信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">课程名称</span>
            <span class="info-value">{{ data.courseName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">学科</span>
            <span class="info-value">{{ data.subjectName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">年级</span>
            <span class="info-value">{{ data.gradeName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">授课教师</span>
            <span class="info-value teacher-value">
              <i class="el-icon-user-solid teacher-icon"></i>
              {{ data.teacherName || '-' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 时间信息 -->
      <div class="info-section">
        <div class="section-title">
          <i class="el-icon-time section-icon"></i>
          <span>时间信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">上课日期</span>
            <span class="info-value">
              <i class="el-icon-date date-icon"></i>
              {{ formatDate(data.lessonDate) }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">上课时间</span>
            <span class="info-value">{{ data.periodTimeRange || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">课程节次</span>
            <span class="info-value">{{ data.periodName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">课程时长</span>
            <span class="info-value">{{ data.duration || 40 }} 分钟</span>
          </div>
        </div>
      </div>

      <!-- 地点信息 -->
      <div class="info-section">
        <div class="section-title">
          <i class="el-icon-location section-icon"></i>
          <span>地点信息</span>
        </div>
        <div class="info-list">
          <div class="info-row">
            <span class="info-label">上课地点</span>
            <span class="info-value location-value">{{ getLocationText(data) }}</span>
          </div>
          <div class="info-row" v-if="data.mainClassroom">
            <span class="info-label">主讲教室设备</span>
            <div class="device-tags">
              <span class="device-tag">移动课桌椅-A01</span>
              <span class="device-tag">移动课桌椅-A02</span>
            </div>
          </div>
          <div class="info-row" v-if="data.mainClassroom">
            <span class="info-label">辅讲教室设备</span>
            <div class="device-tags">
              <span class="device-tag green">移动课桌椅-B01</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 其他信息 -->
      <div class="info-section">
        <div class="section-title">
          <i class="el-icon-more section-icon"></i>
          <span>其他信息</span>
        </div>
        <div class="info-list">
          <div class="info-row">
            <span class="info-label">学生人数</span>
            <span class="info-value student-value">{{ data.studentCount }} 人</span>
          </div>
          <div class="info-row">
            <span class="info-label">备注</span>
            <span class="info-value remark-value">{{ data.remark || '需要提前准备教具' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="preview-footer">
      <el-button type="primary" class="close-btn-primary" @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ShowPreview',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      },
    },
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
      this.$emit('close');
    },
    getActivityTypeText(type) {
      const map = {
        1: '日常教学',
        2: '户外教学',
      };
      return map[type] || '日常教学';
    },
    formatDate(date) {
      if (!date) return '-';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const weekDay = weekDays[d.getDay()];
      return `${year}-${month}-${day} (${weekDay})`;
    },
    getLocationText(data) {
      // if (data.mainClassroom && data.mainClassroom.classroomName) {
      //   return data.mainClassroom.classroomName;
      // }
      if (data.location) {
        return data.location;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.tag-container {
  display:flex;
  align-items: center;
  gap: 15px;
}
.preview-dialog {
  ::v-deep .el-dialog__header {
    padding: 0;
    display: none;
  }

  ::v-deep .el-dialog__body {
    padding: 0;
  }

  ::v-deep .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #e4e7ed;
  }
}

.custom-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px 8px 0 0;
  margin: -20px -20px 0 -20px;

  .header-left {
    // display: flex;
    // align-items: center;
    // gap: 12px;
  }

  .course-name {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
        margin-bottom: 10px;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .type-tag {
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
  }

  .subject-tag {
    background: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.9);
  }

  .close-icon {
    color: rgba(255, 255, 255, 0.8);
    font-size: 18px;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #fff;
    }
  }
}

.preview-content {
  padding: 24px;
  max-height: 700px;
  overflow-y: auto;
}

.info-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;

  .section-icon {
    color: #4f7cff;
    font-size: 16px;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 12px;
  color: #909399;
  font-weight: 400;
}

.info-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.teacher-value {
  display: flex;
  align-items: center;
  gap: 6px;

  .teacher-icon {
    color: #4f7cff;
    font-size: 14px;
  }
}

.date-icon {
  color: #909399;
  margin-right: 4px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;

  .info-label {
    flex-shrink: 0;
    width: 90px;
    text-align: left;
  }

  .info-value {
    flex: 1;
  }
}

.location-value {
  color: #4f7cff;
  font-weight: 500;
}

.device-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.device-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: #e8f0ff;
  color: #4f7cff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;

  &.green {
    background: #e8f5e9;
    color: #52c41a;
  }
}

.student-value {
  color: #303133;
  font-weight: 600;
}

.remark-value {
  color: #606266;
  font-weight: 400;
}

.preview-footer {
  display: flex;
  justify-content: flex-end;

  .close-btn-primary {
    padding: 8px 24px;
    background: #4f7cff;
    border-color: #4f7cff;
    font-weight: 500;

    &:hover {
      background: #3d6aea;
      border-color: #3d6aea;
    }
  }
}
</style>
