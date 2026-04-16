<template>
  <el-dialog
    :visible.sync="visible"
    width="560px"
    top="5vh"
    :show-close="false"
    :close-on-click-modal="false"
    :title="title"
    custom-class="subject-dialog"
  >
    <!-- 自定义头部 -->
    <!-- <div class="dialog-header">
      <span class="dialog-title">{{ title }}</span>
      <i class="el-icon-close close-icon" @click="handleClose"></i>
    </div> -->

    <!-- 表单内容 -->
    <div class="dialog-body">
      <el-form ref="form" :model="form" :rules="rules" label-position="top">
        <!-- 学科名称 -->
        <el-form-item label="学科名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入学科名称，如：语文、数学"
            class="form-input"
            maxlength="20"
            show-word-limit
          />
          <div class="form-hint">2-20个字符</div>
        </el-form-item>

        <!-- 学科代码 -->
        <el-form-item label="学科代码" prop="code">
          <el-input
            v-model="form.code"
            placeholder="请输入学科代码，如：YW、SX"
            class="form-input"
            maxlength="6"
            show-word-limit
          />
          <div class="form-hint">2-6位大写字母，系统自动转换为大写</div>
        </el-form-item>

        <!-- 所属学段 -->
        <el-form-item label="所属学段" prop="period">
          <el-select
            v-model="form.period"
            placeholder="请选择所属学段"
            class="form-select"
          >
            <el-option
              v-for="item in periodOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <div class="form-hint">当前选择：{{ form.period || "未选择" }}</div>
        </el-form-item>

        <!-- 状态 -->
        <el-form-item label="状态" prop="status">
          <div class="status-radio-group">
            <div
              class="status-option"
              :class="{ active: form.status === '启用' }"
              @click="form.status = '启用'"
            >
              启用
            </div>
            <div
              class="status-option"
              :class="{ active: form.status === '禁用' }"
              @click="form.status = '禁用'"
            >
              禁用
            </div>
          </div>
          <div class="form-hint">启用后可在排课时选择该学科</div>
        </el-form-item>

        <!-- 预览 -->
        <el-form-item label="预览：">
          <div class="preview-card">
            <div class="preview-header">
              <div class="preview-name">（{{ form.name || "学科名称" }}）</div>
              <el-tag
                size="small"
                :type="getPeriodTagType(form.period)"
                effect="light"
              >
                {{ form.period || "学段" }}
              </el-tag>
            </div>
            <div class="preview-info">
              <div>代码：（{{ form.code || "学科代码" }}）</div>
              <el-tag
                size="small"
                :type="form.status === '启用' ? 'success' : 'info'"
                effect="light"
                class="status-tag"
              >
                {{ form.status }}
              </el-tag>
            </div>
          </div>
        </el-form-item>

        <!-- 温馨提示 -->
        <div class="tips-box">
          <div class="tips-title">温馨提示：</div>
          <ul class="tips-list">
            <li>学科代码应简短易记，建议使用拼音首字母</li>
            <li>同一学段内学科代码不应重复，以免混淆</li>
            <li>不同学段可以有相同的学科名称和代码</li>
          </ul>
        </div>
      </el-form>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button class="cancel-btn" @click="handleClose">取消</el-button>
      <el-button class="confirm-btn" type="primary" @click="handleConfirm"
        >创建</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "SubjectDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "新增学科",
    },
    editData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      form: {
        name: "",
        code: "",
        period: "",
        status: "启用",
      },
      rules: {
        name: [
          { required: true, message: "请输入学科名称", trigger: "blur" },
          {
            min: 2,
            max: 20,
            message: "学科名称长度在2-20个字符之间",
            trigger: "blur",
          },
        ],
        code: [
          { required: true, message: "请输入学科代码", trigger: "blur" },
          {
            pattern: /^[A-Z]{2,6}$/,
            message: "学科代码必须是2-6位大写字母",
            trigger: "blur",
          },
        ],
        period: [
          { required: true, message: "请选择所属学段", trigger: "change" },
        ],
      },
      periodOptions: [
        { label: "幼儿园", value: "幼儿园" },
        { label: "小学", value: "小学" },
        { label: "初中", value: "初中" },
        { label: "高中", value: "高中" },
      ],
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.initForm();
      }
    },
    "form.code"(val) {
      // 自动转换为大写
      if (val) {
        this.form.code = val.toUpperCase();
      }
    },
  },
  methods: {
    initForm() {
      if (this.editData) {
        this.form = { ...this.editData };
      } else {
        this.form = {
          name: "",
          code: "",
          period: "",
          status: "启用",
        };
      }
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate();
      });
    },
    getPeriodTagType(period) {
      const types = {
        幼儿园: "info",
        小学: "primary",
        初中: "success",
        高中: "warning",
      };
      return types[period] || "";
    },
    handleClose() {
      this.$emit("update:visible", false);
    },
    handleConfirm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit("confirm", { ...this.form });
          this.handleClose();
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .subject-dialog {
  // border-radius: 12px;
  overflow: hidden;

  // .el-dialog__header {
  //   display: none;
  // }

  // .el-dialog__body {
  //   padding: 0;
  // }

  // .el-dialog__footer {
  //   border-top: 1px solid #e5e7eb;
  //   padding: 16px 24px;
  // }
}

.dialog-header {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .dialog-title {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
  }

  .close-icon {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }
}

.dialog-body {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

::v-deep .el-form-item {
  margin-bottom: 20px;

  &__label {
    color: #374151;
    font-weight: 500;
    font-size: 14px;
    padding-bottom: 8px;
    line-height: 1.4;

    &::before {
      color: #ef4444;
      margin-right: 4px;
    }
  }
}

.form-input,
.form-select {
  width: 100%;

  ::v-deep .el-input__inner {
    border-radius: 8px;
    border-color: #e5e7eb;
    height: 40px;
    font-size: 14px;

    &:focus {
      border-color: #4f46e5;
    }

    &::placeholder {
      color: #9ca3af;
    }
  }
}

.form-select {
  ::v-deep .el-input__suffix {
    right: 12px;

    .el-input__icon {
      color: #9ca3af;
    }
  }
}

.form-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

// 状态单选组
.status-radio-group {
  display: flex;
  gap: 12px;

  .status-option {
    flex: 1;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #4f46e5;
      color: #4f46e5;
    }

    &.active {
      border-color: #10b981;
      background: #ecfdf5;
      color: #10b981;
      font-weight: 500;
    }
  }
}

// 预览卡片
.preview-card {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  position: relative;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    // margin-bottom: 8px;

    .preview-name {
      font-size: 16px;
      font-weight: 500;
      color: #111827;
    }
  }

  .preview-info {
    font-size: 13px;
    color: #6b7280;
    display: flex;
    justify-content: space-between;
    align-items: center;
    // margin-bottom: 8px;
  }
}

// 提示框
.tips-box {
  background: #eff6ff;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;

  .tips-title {
    font-size: 13px;
    font-weight: 500;
    color: #1d4ed8;
    margin-bottom: 8px;
  }

  .tips-list {
    margin: 0;
    padding-left: 16px;
    list-style: disc;

    li {
      font-size: 12px;
      color: #3b82f6;
      line-height: 1.8;
    }
  }
}

// 底部按钮
// .dialog-footer {
//   display: flex;
//   justify-content: flex-end;
//   gap: 12px;

//   .cancel-btn {
//     min-width: 80px;
//     height: 36px;
//     border-radius: 6px;
//     border-color: #d1d5db;
//     color: #374151;

//     &:hover {
//       border-color: #9ca3af;
//       color: #111827;
//     }
//   }

//   .confirm-btn {
//     min-width: 80px;
//     height: 36px;
//     border-radius: 6px;
//     background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
//     border: none;

//     &:hover {
//       background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
//     }
//   }
// }

// 滚动条样式
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
