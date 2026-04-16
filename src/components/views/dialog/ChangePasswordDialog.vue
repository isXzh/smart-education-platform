<template>
  <el-dialog
    :visible.sync="visible"
    title="修改密码"
    width="480px"
    :close-on-click-modal="false"
    :show-close="true"
    custom-class="change-password-dialog"
    @close="handleClose"
  >
    <el-form
      ref="passwordForm"
      :model="passwordForm"
      :rules="passwordRules"
      label-position="top"
      class="password-form"
    >
      <!-- 原密码 -->
      <el-form-item label="原密码" prop="oldPassword">
        <el-input
          v-model="passwordForm.oldPassword"
          type="password"
          placeholder="请输入原密码"
          show-password
        />
      </el-form-item>

      <!-- 新密码 -->
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="passwordForm.newPassword"
          type="password"
          placeholder="请输入新密码（至少6位）"
          show-password
        />
      </el-form-item>

      <!-- 确认密码 -->
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="passwordForm.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </el-form-item>

      <!-- 密码安全提示 -->
      <div class="password-tips">
        <i class="el-icon-info"></i>
        <span>密码安全提示：密码长度至少6位，建议包含字母、数字和特殊字符</span>
      </div>
    </el-form>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确认修改
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ChangePasswordDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    // 自定义验证规则
    const validateOldPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入原密码'))
      } else {
        callback()
      }
    }

    const validateNewPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入新密码'))
      } else if (value.length < 6) {
        callback(new Error('密码长度至少6位'))
      } else {
        if (this.passwordForm.confirmPassword) {
          this.$refs.passwordForm.validateField('confirmPassword')
        }
        callback()
      }
    }

    const validateConfirmPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请再次输入新密码'))
      } else if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    return {
      loading: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [
          { required: true, validator: validateOldPassword, trigger: 'blur' }
        ],
        newPassword: [
          { required: true, validator: validateNewPassword, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleClose() {
      this.resetForm()
      this.$emit('update:visible', false)
    },
    resetForm() {
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      if (this.$refs.passwordForm) {
        this.$refs.passwordForm.resetFields()
      }
    },
    handleSubmit() {
      this.$refs.passwordForm.validate(valid => {
        if (valid) {
          this.loading = true

          // 模拟API调用
          setTimeout(() => {
            this.loading = false
            this.$message.success('密码修改成功')
            this.resetForm()
            this.$emit('update:visible', false)
            this.$emit('success')
          }, 1000)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.change-password-dialog {
  ::v-deep .el-dialog {
    border-radius: 16px;
    overflow: hidden;

    &__header {
      padding: 20px 24px;
      border-bottom: 1px solid #ebeef5;

      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }

      .el-dialog__headerbtn {
        top: 20px;
        right: 20px;

        .el-dialog__close {
          font-size: 18px;
          color: #909399;

          &:hover {
            color: #409eff;
          }
        }
      }
    }

    &__body {
      padding: 24px;
    }

    &__footer {
      padding: 16px 24px;
      border-top: 1px solid #ebeef5;

      .el-button {
        padding: 9px 20px;
        border-radius: 6px;

        &--default {
          border-color: #dcdfe6;
          color: #606266;

          &:hover {
            border-color: #409eff;
            color: #409eff;
          }
        }

        &--primary {
          background: #4f7cff;
          border-color: #4f7cff;

          &:hover {
            background: #3a6ae8;
            border-color: #3a6ae8;
          }
        }
      }
    }
  }

  .password-form {
    .el-form-item {
      margin-bottom: 20px;

      &__label {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
        padding-bottom: 8px;

        &::before {
          content: '* ';
          color: #f56c6c;
          margin-right: 2px;
        }
      }
    }

    .el-input {
      &__inner {
        height: 44px;
        border-radius: 8px;
        border: 1px solid #dcdfe6;
        padding: 0 16px;
        font-size: 14px;
        transition: all 0.3s;

        &::placeholder {
          color: #c0c4cc;
        }

        &:focus {
          border-color: #4f7cff;
          box-shadow: 0 0 0 2px rgba(79, 124, 255, 0.1);
        }
      }

      &__suffix {
        right: 12px;

        .el-input__suffix-inner {
          .el-icon-view {
            font-size: 16px;
            color: #909399;
            cursor: pointer;
            transition: color 0.3s;

            &:hover {
              color: #4f7cff;
            }
          }
        }
      }
    }

    .password-tips {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px 16px;
      background: #f0f5ff;
      border-radius: 8px;
      border: 1px solid #d6e4ff;
      margin-top: 8px;

      i {
        font-size: 16px;
        color: #4f7cff;
        margin-top: 1px;
      }

      span {
        font-size: 13px;
        color: #4f7cff;
        line-height: 1.5;
      }
    }
  }
}
</style>
