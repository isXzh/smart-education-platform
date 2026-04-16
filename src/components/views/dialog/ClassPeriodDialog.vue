<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="class-period-dialog"
    @closed="handleClose"
  >
    <div class="dialog-content">
      <!-- 学段 -->
      <div class="form-item">
        <label class="form-label"> 学段 </label>
        <div class="grade-display">
          <span class="grade-tag">{{ gradeName }}</span>
          <span class="grade-desc">（当前选中学段）</span>
        </div>
      </div>

      <!-- 课时名称 -->
      <div class="form-item">
        <label class="form-label required"> 课时名称 </label>
        <div class="form-input-wrap">
          <el-input
            v-model="form.name"
            placeholder="请输入课时名称，如：第1节"
            class="form-input"
          />
        </div>
        <div class="form-hint">建议格式：第N节、早读、课间操等</div>
      </div>

      <!-- 开始时间 -->
      <div class="form-item">
        <label class="form-label required"> 开始时间 </label>
        <div class="form-input-wrap">
          <el-time-picker
            v-model="form.startTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="--:--"
            class="form-time-picker"
            popper-class="time-picker-dropdown"
          />
        </div>
      </div>

      <!-- 结束时间 -->
      <div class="form-item">
        <label class="form-label required"> 结束时间 </label>
        <div class="form-input-wrap">
          <el-time-picker
            v-model="form.endTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="--:--"
            class="form-time-picker"
            popper-class="time-picker-dropdown"
          />
        </div>
      </div>
      <div class="form-item time-length" v-if="title == '编辑课时'">
        <span class="time-title">课时时长：</span>
        <span class="time-data">{{ `40分钟` }}</span>
      </div>
      <!-- 排序 -->
      <div class="form-item">
        <label class="form-label"> 排序 </label>
        <div class="form-input-wrap">
          <el-input-number
            v-model="form.sort"
            :min="1"
            :max="99"
            controls-position="right"
            class="form-number-input"
          />
        </div>
        <div class="form-hint">数字越小排序越靠前，系统已自动生成</div>
      </div>

      <!-- 当前学段已有课时 -->
      <div class="existing-periods-section">
        <div class="section-title">
          当前学段已有课时（{{ existingPeriods.length }}个）
        </div>
        <div class="periods-list">
          <div
            v-for="(period, index) in existingPeriods"
            :key="index"
            class="period-item"
          >
            <span class="period-name">{{ period.periodName }}</span>
            <span class="period-time"
              >{{ period.startTime }} - {{ period.endTime }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button class="cancel-btn" @click="handleCancel"> 取消 </el-button>
      <el-button type="primary" class="confirm-btn" @click="handleConfirm">
        {{ isEdit ? "保存" : "添加" }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "ClassPeriodDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "新增课时",
    },
    gradeName: {
      type: String,
      default: "小学",
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    editData: {
      type: Object,
      default: null,
    },
    existingPeriods: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      dialogVisible: this.visible,
      form: {
        name: "",
        startTime: "",
        endTime: "",
        sort: 1,
      },
    };
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
      if (val) {
        this.initForm();
      }
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
    },
  },
  methods: {
    initForm() {
      if (this.isEdit && this.editData) {
        this.form = {
          name: this.editData.periodName || "",
          startTime: this.editData.startTime || "",
          endTime: this.editData.endTime || "",
          sort: this.editData.periodIndex || 1,
        };
      } else {
        // 新增时，排序默认为已有课时数+1
        this.form = {
          name: "",
          startTime: "",
          endTime: "",
          sort: this.existingPeriods.length + 1,
        };
      }
    },
    handleCancel() {
      this.dialogVisible = false;
      this.$emit("cancel");
    },
    handleConfirm() {
      // 表单验证
      if (!this.form.name.trim()) {
        this.$message.warning("请输入课时名称");
        return;
      }
      if (!this.form.startTime) {
        this.$message.warning("请选择开始时间");
        return;
      }
      if (!this.form.endTime) {
        this.$message.warning("请选择结束时间");
        return;
      }

      // 验证开始时间是否早于结束时间
      const start = new Date(`2000-01-01 ${this.form.startTime}`);
      const end = new Date(`2000-01-01 ${this.form.endTime}`);
      if (start >= end) {
        this.$message.warning("结束时间必须晚于开始时间");
        return;
      }

      // 检查时间重叠
      const hasOverlap = this.checkTimeOverlap();
      if (hasOverlap) {
        this.$message.warning("该时间段与已有课时重叠");
        return;
      }

      this.$emit("confirm", { ...this.form });
      this.dialogVisible = false;
    },
    checkTimeOverlap() {
      const start = new Date(`2000-01-01 ${this.form.startTime}`);
      const end = new Date(`2000-01-01 ${this.form.endTime}`);

      return this.existingPeriods.some((item) => {
        // 编辑时跳过当前编辑的课时
        if (this.isEdit && this.editData && item.id === this.editData.id) {
          return false;
        }

        const itemStart = new Date(`2000-01-01 ${item.startTime}`);
        const itemEnd = new Date(`2000-01-01 ${item.endTime}`);

        return start < itemEnd && end > itemStart;
      });
    },
    handleClose() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.class-period-dialog {
  ::v-deep .el-dialog {
    // border-radius: 8px;
    overflow: hidden;
  }

  ::v-deep .el-dialog__header {
    background: linear-gradient(135deg, #4f7cff 0%, #3b5de0 100%);
    padding: 16px 24px;
    margin: 0;

    .el-dialog__title {
      color: #fff;
      font-size: 18px;
      font-weight: 500;
    }

    .el-dialog__headerbtn {
      top: 16px;
      right: 16px;

      .el-dialog__close {
        color: #fff;
        font-size: 18px;

        &:hover {
          color: #f0f0f0;
        }
      }
    }
  }

  ::v-deep .el-dialog__body {
    padding: 24px;
    max-height: 600px;
    overflow-y: auto;
  }

  ::v-deep .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #e8e8e8;
    text-align: right;
  }
}

.dialog-content {
  .form-item {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }
  .time-length {
    width: 546px;
    height: 40px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    background-color: #f1f6fe;
    .time-title {
      color: oklch(48.8% 0.243 264.376);
    }
    .time-data {
      color: oklch(37.9% 0.146 265.522);
      font-weight: 600;
    }
  }
  .form-label {
    display: block;
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
    font-weight: 500;

    &.required::after {
      content: "*";
      color: #ff4d4f;
      margin-left: 4px;
    }
  }

  .grade-display {
    display: flex;
    align-items: center;
    gap: 8px;

    .grade-tag {
      display: inline-block;
      padding: 6px 16px;
      background: #e6f0ff;
      color: #4f7cff;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
    }

    .grade-desc {
      color: #999;
      font-size: 13px;
    }
  }

  .form-input-wrap {
    .form-input {
      width: 100%;

      ::v-deep .el-input__inner {
        height: 40px;
        line-height: 40px;
        border-radius: 4px;
        border-color: #d9d9d9;

        &:focus {
          border-color: #4f7cff;
        }

        &::placeholder {
          color: #bfbfbf;
        }
      }
    }

    .form-time-picker {
      width: 100%;

      ::v-deep .el-input__inner {
        height: 40px;
        line-height: 40px;
        border-radius: 4px;
        border-color: #d9d9d9;
        text-align: left;
        padding-left: 12px;

        &:focus {
          border-color: #4f7cff;
        }
      }

      ::v-deep .el-input__prefix {
        display: none;
      }
    }

    .form-number-input {
      width: 100%;

      ::v-deep .el-input__inner {
        height: 40px;
        line-height: 40px;
        text-align: left;
        padding-left: 12px;
        padding-right: 40px;
      }

      ::v-deep .el-input-number__increase,
      ::v-deep .el-input-number__decrease {
        width: 32px;
        height: 19px;
        line-height: 19px;
        background: #f5f5f5;
        border-left: 1px solid #d9d9d9;

        &:hover {
          color: #4f7cff;
        }
      }

      ::v-deep .el-input-number__increase {
        border-bottom: 1px solid #d9d9d9;
      }
    }
  }

  .form-hint {
    margin-top: 6px;
    font-size: 12px;
    color: #999;
  }

  .existing-periods-section {
    margin-top: 24px;
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px solid #e8e8e8;

    .section-title {
      font-size: 14px;
      color: #333;
      font-weight: 500;
      margin-bottom: 12px;
    }

    .periods-list {
      max-height: 200px;
      overflow-y: auto;

      .period-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        background: #fff;
        border-radius: 4px;
        margin-bottom: 8px;
        border: 1px solid #e8e8e8;

        &:last-child {
          margin-bottom: 0;
        }

        .period-name {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }

        .period-time {
          font-size: 13px;
          color: #000;
          font-family: "Courier New", monospace;
        }
      }
    }
  }
}

.dialog-footer {
  .cancel-btn {
    min-width: 80px;
    height: 36px;
    padding: 0 20px;
    font-size: 14px;
    border-radius: 4px;
    margin-right: 12px;

    &:hover {
      color: #4f7cff;
      border-color: #4f7cff;
    }
  }

  .confirm-btn {
    min-width: 80px;
    height: 36px;
    padding: 0 20px;
    font-size: 14px;
    border-radius: 4px;
    background: linear-gradient(135deg, #4f7cff 0%, #3b5de0 100%);
    border: none;

    &:hover {
      background: linear-gradient(135deg, #5a85ff 0%, #4568e5 100%);
    }
  }
}

/* 时间选择器下拉样式 */
.time-picker-dropdown {
  .el-time-spinner__item {
    font-size: 14px;
    color: #333;

    &.active {
      color: #4f7cff;
      font-weight: 500;
    }

    &:hover {
      background: #f0f5ff;
    }
  }
}
</style>
