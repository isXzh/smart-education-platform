<template>
  <el-dialog
    :visible.sync="visible"
    width="700px"
    :show-close="false"
    :close-on-click-modal="true"
    custom-class="course-detail-dialog"
    @close="handleClose"
  >
    <!-- 自定义头部 -->
    <div slot="title" class="dialog-header">
      <div class="header-left">
        <div class="header-icon">
          <i class="el-icon-reading"></i>
        </div>
        <div class="header-title">
          <div class="title-main">课程详情</div>
          <div class="title-sub">Course Details</div>
        </div>
      </div>
      <button class="close-btn" @click="handleClose">
        <i class="el-icon-close"></i>
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="dialog-content">
      <!-- 课程标题 -->
      <div class="course-title-section">
        <div class="course-name">
          <i class="el-icon-collection"></i>
          {{ courseData.name }}
        </div>
        <span class="course-tag" :class="courseData.type">{{ courseData.type }}</span>
      </div>

      <!-- 信息卡片 -->
      <div class="info-cards">
        <div class="info-card date">
          <div class="card-icon">
            <i class="el-icon-date"></i>
          </div>
          <div class="card-content">
            <div class="card-label">日期</div>
            <div class="card-value">{{ courseData.date }}</div>
          </div>
        </div>

        <div class="info-card duration">
          <div class="card-icon">
            <i class="el-icon-time"></i>
          </div>
          <div class="card-content">
            <div class="card-label">时长</div>
            <div class="card-value">{{ courseData.duration }}</div>
          </div>
        </div>

        <div class="info-card teacher">
          <div class="card-icon">
            <i class="el-icon-user"></i>
          </div>
          <div class="card-content">
            <div class="card-label">教师</div>
            <div class="card-value">{{ courseData.teacher }}</div>
          </div>
        </div>

        <div class="info-card grade">
          <div class="card-icon">
            <i class="el-icon-s-custom"></i>
          </div>
          <div class="card-content">
            <div class="card-label">学段</div>
            <div class="card-value">{{ courseData.grade }}</div>
          </div>
        </div>
      </div>

      <!-- 详细信息网格 -->
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">
            <span class="label-dot"></span>
            教学活动类型
          </div>
          <div class="detail-value">{{ courseData.activityType || courseData.type }}</div>
        </div>

        <div class="detail-item">
          <div class="detail-label">
            <span class="label-dot"></span>
            学段
          </div>
          <div class="detail-value">{{ courseData.grade }}</div>
        </div>

        <div class="detail-item">
          <div class="detail-label">
            <span class="label-dot"></span>
            学科
          </div>
          <div class="detail-value">{{ courseData.subject || courseData.subjectName }}</div>
        </div>

        <div class="detail-item">
          <div class="detail-label">
            <span class="label-dot"></span>
            教师
          </div>
          <div class="detail-value">{{ courseData.teacher }}</div>
        </div>

        <div class="detail-item">
          <div class="detail-label">
            <span class="label-dot"></span>
            上课时间
          </div>
          <div class="detail-value">{{ courseData.timeRange || courseData.time }}</div>
        </div>

        <div class="detail-item">
          <div class="detail-label">
            <span class="label-dot"></span>
            上课节次
          </div>
          <div class="detail-value">{{ courseData.period }}</div>
        </div>
      </div>

      <!-- 上课地点 -->
      <div class="location-section">
        <div class="location-label">
          <i class="el-icon-location-outline"></i>
          上课地点
        </div>
        <div class="location-value">{{ courseData.location }}</div>
      </div>

      <!-- 主讲教室 -->
      <div class="classroom-section" v-if="courseData.classrooms && courseData.classrooms.length">
        <div class="section-title">
          <span class="title-bar"></span>
          主讲教室
        </div>
        <div class="classroom-tags">
          <span
            v-for="(room, index) in courseData.classrooms"
            :key="index"
            class="classroom-tag"
          >
            {{ room }}
          </span>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div slot="footer" class="dialog-footer">
      <div class="footer-left">
        <el-button plain class="action-btn" @click="handleEdit">
          <i class="el-icon-edit"></i>
          编辑
        </el-button>
        <el-button plain class="action-btn" @click="handleCopy">
          <i class="el-icon-document-copy"></i>
          复制
        </el-button>
        <el-button plain class="action-btn delete" @click="handleDelete">
          <i class="el-icon-delete"></i>
          删除
        </el-button>
      </div>
      <el-button type="primary" class="close-action-btn" @click="handleClose">
        关闭
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'CourseDetailDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    course: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // 默认课程数据，用于演示
      defaultCourse: {
        name: '物理实验课',
        type: '校内',
        date: '2026-04-02',
        duration: '90 分钟',
        teacher: '刘老师',
        grade: '初中二年级',
        activityType: '校内',
        subject: '物理',
        subjectName: '物理',
        time: '08:00 - 09:30',
        timeRange: '08:00 - 09:30',
        period: '第1-2节',
        location: '实验楼205',
        classrooms: ['移动课堂箱-E01', '移动课堂箱-E02']
      }
    }
  },
  computed: {
    courseData() {
      // 合并传入的数据和默认数据
      return { ...this.defaultCourse, ...this.course }
    }
  },
  watch: {
    visible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    handleEdit() {
      this.$emit('edit', this.courseData)
    },
    handleCopy() {
      this.$emit('copy', this.courseData)
    },
    handleDelete() {
      this.$emit('delete', this.courseData)
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .course-detail-dialog {
  border-radius: 12px;
  overflow: hidden;

  .el-dialog__header {
    padding: 0;
  }

  .el-dialog__body {
    padding: 0;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #ebeef5;
  }
}

// 对话框头部
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #4f7cff 0%, #3b5de0 100%);
  color: #fff;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .header-icon {
      width: 44px;
      height: 44px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .header-title {
      .title-main {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 2px;
      }

      .title-sub {
        font-size: 12px;
        opacity: 0.8;
      }
    }
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: rotate(90deg);
    }
  }
}

// 对话框内容
.dialog-content {
  padding: 24px;
  max-height: 600px;
  overflow-y: auto;

  // 课程标题
  .course-title-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;

    .course-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 22px;
      font-weight: 600;
      color: #1a1a2e;

      i {
        color: #4f7cff;
        font-size: 20px;
      }
    }

    .course-tag {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;

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
  }

  // 信息卡片
  .info-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    .info-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 10px;
      background: #fff;
      border: 1px solid #e4e7ed;

      &.date { background: linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%); border-color: #d6e4ff; }
      &.duration { background: linear-gradient(135deg, #f9f0ff 0%, #f0e6ff 100%); border-color: #e6d6ff; }
      &.teacher { background: linear-gradient(135deg, #f0f9f0 0%, #e6f5e6 100%); border-color: #d6e6d6; }
      &.grade { background: linear-gradient(135deg, #fff5f0 0%, #ffece6 100%); border-color: #ffd6c4; }

      .card-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      }

      &.date .card-icon { background: #4f7cff; color: #fff; }
      &.duration .card-icon { background: #a855f7; color: #fff; }
      &.teacher .card-icon { background: #22c55e; color: #fff; }
      &.grade .card-icon { background: #f97316; color: #fff; }

      .card-content {
        .card-label {
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }

        .card-value {
          font-size: 15px;
          font-weight: 600;
          color: #1a1a2e;
        }
      }
    }
  }

  // 详细信息网格
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 20px;

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;

      .detail-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #606266;
        font-weight: 500;

        .label-dot {
          width: 6px;
          height: 6px;
          background: #4f7cff;
          border-radius: 50%;
        }
      }

      .detail-value {
        font-size: 14px;
        color: #1a1a2e;
        font-weight: 500;
        padding-left: 14px;
      }
    }
  }

  // 上课地点
  .location-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #f0f5ff 0%, #e8f0ff 100%);
    border-radius: 10px;
    border: 1px solid #d6e4ff;
    margin-bottom: 20px;

    .location-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #4f7cff;
      font-weight: 500;

      i {
        font-size: 16px;
      }
    }

    .location-value {
      font-size: 16px;
      color: #1a1a2e;
      font-weight: 600;
      padding-left: 24px;
    }
  }

  // 主讲教室
  .classroom-section {
    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 12px;

      .title-bar {
        width: 4px;
        height: 16px;
        background: #4f7cff;
        border-radius: 2px;
      }
    }

    .classroom-tags {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;

      .classroom-tag {
        padding: 8px 16px;
        background: #f0f5ff;
        border: 1px solid #d6e4ff;
        border-radius: 6px;
        font-size: 13px;
        color: #4f7cff;
        font-weight: 500;
      }
    }
  }
}

// 底部操作栏
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .footer-left {
    display: flex;
    gap: 10px;

    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 16px;
      height: 36px;
      border: 1px solid #dcdfe6;
      background: #fff;
      border-radius: 6px;
      font-size: 14px;
      color: #606266;
      cursor: pointer;
      transition: all 0.3s;

      i {
        font-size: 14px;
      }

      &:hover {
        border-color: #4f7cff;
        color: #4f7cff;
      }

      &.delete:hover {
        border-color: #f56c6c;
        color: #f56c6c;
      }
    }
  }

  .close-action-btn {
    padding: 0 28px;
    height: 36px;
    background: #4f7cff;
    border-color: #4f7cff;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;

    &:hover {
      background: #3b5de0;
      border-color: #3b5de0;
    }
  }
}

// 滚动条样式
.dialog-content::-webkit-scrollbar {
  width: 6px;
}

.dialog-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
