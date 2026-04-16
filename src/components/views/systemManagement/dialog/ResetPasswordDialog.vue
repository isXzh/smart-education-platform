<template>
  <el-dialog
    title="重置密码"
    :visible.sync="dialogVisible"
    width="480px"
    :close-on-click-modal="false"
    custom-class="reset-password-dialog"
  >
    <div class="p-6">
      <!-- 账号信息 -->
      <div class="flex items-center gap-6 mb-6 bg-gray-50 rounded-lg p-4">
        <div>
          <div class="text-xs text-gray-500 mb-1">账号</div>
          <div class="font-medium text-gray-800">
            {{ accountInfo.username }}
          </div>
        </div>
        <div class="w-px h-10 bg-gray-200"></div>
        <div>
          <div class="text-xs text-gray-500 mb-1">姓名</div>
          <div class="font-medium text-gray-800">
            {{ accountInfo.realName }}
          </div>
        </div>
      </div>

      <el-form ref="form" :model="form" :rules="rules" label-width="0">
        <!-- 新密码 -->
        <el-form-item prop="newPassword">
          <div class="mb-2 text-sm font-medium text-gray-700">
            新密码 <span class="text-red-500">*</span>
          </div>
          <el-input
            v-model="form.newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            placeholder="请输入新密码"
            class="w-full"
          >
            <i
              slot="suffix"
              class="el-icon-view cursor-pointer text-gray-400 hover:text-gray-600"
              @click="showNewPassword = !showNewPassword"
            ></i>
          </el-input>
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item prop="confirmPassword">
          <div class="mb-2 text-sm font-medium text-gray-700">
            确认密码 <span class="text-red-500">*</span>
          </div>
          <el-input
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请再次输入新密码"
            class="w-full"
          >
            <i
              slot="suffix"
              class="el-icon-view cursor-pointer text-gray-400 hover:text-gray-600"
              @click="showConfirmPassword = !showConfirmPassword"
            ></i>
          </el-input>
        </el-form-item>
      </el-form>

      <!-- 生成随机密码按钮 -->
      <div class="mt-4">
        <el-button
          type="default"
          plain
          class="w-full"
          @click="generatePassword"
        >
          <i class="el-icon-refresh mr-1"></i>
          生成随机密码
        </el-button>
      </div>

      <!-- 密码要求 -->
      <div class="mt-4 bg-blue-50 rounded-lg p-4">
        <div class="text-sm font-medium text-gray-700 mb-2">密码要求：</div>
        <ul class="text-xs text-gray-600 space-y-1">
          <li :class="{ 'text-green-600': passwordValid.length }">
            <i
              :class="passwordValid.length ? 'el-icon-check' : 'el-icon-close'"
              class="mr-1"
            ></i>
            长度至少6位
          </li>
          <li :class="{ 'text-green-600': passwordValid.letter }">
            <i
              :class="passwordValid.letter ? 'el-icon-check' : 'el-icon-close'"
              class="mr-1"
            ></i>
            包含字母
          </li>
          <li :class="{ 'text-green-600': passwordValid.number }">
            <i
              :class="passwordValid.number ? 'el-icon-check' : 'el-icon-close'"
              class="mr-1"
            ></i>
            包含数字
          </li>
          <li :class="{ 'text-green-600': passwordValid.match }">
            <i
              :class="passwordValid.match ? 'el-icon-check' : 'el-icon-close'"
              class="mr-1"
            ></i>
            两次输入一致
          </li>
        </ul>
      </div>

      <!-- 安全提醒 -->
      <div class="mt-4 bg-amber-50 rounded-lg p-3 border border-amber-100">
        <div class="flex items-start gap-2">
          <i class="el-icon-warning text-amber-500 text-sm mt-0.5"></i>
          <div class="text-xs text-amber-700">
            <span class="font-medium">安全提醒：</span>
            密码重置后，用户需要使用新密码登录。建议通过安全渠道将新密码告知用户，并提醒用户首次登录后立即修改密码。
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="flex justify-end gap-3 border-t border-gray-100">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        确认重置
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import user from "@/api/user";
import qs from "qs";
export default {
  name: "ResetPasswordDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: null,
    },
  },
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.form.newPassword) {
        callback(new Error("两次输入密码不一致"));
      } else {
        callback();
      }
    };

    return {
      submitting: false,
      showNewPassword: false,
      showConfirmPassword: false,
      form: {
        newPassword: "",
        confirmPassword: "",
      },
      rules: {
        newPassword: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          { min: 6, message: "密码长度至少6位", trigger: "blur" },
          {
            pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/,
            message: "密码必须包含字母和数字",
            trigger: "blur",
          },
        ],
        confirmPassword: [
          { required: true, message: "请再次输入新密码", trigger: "blur" },
          { validator: validateConfirmPassword, trigger: "blur" },
        ],
      },
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      },
    },
    accountInfo() {
      return this.data || { username: "", realName: "" };
    },
    passwordValid() {
      const password = this.form.newPassword;
      return {
        length: password.length >= 6,
        letter: /[a-zA-Z]/.test(password),
        number: /\d/.test(password),
        match: password && password === this.form.confirmPassword,
      };
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.resetForm();
      }
    },
  },
  methods: {
    generatePassword() {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let password = "";
      for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.form.newPassword = password;
      this.form.confirmPassword = password;
      this.$message.success("随机密码已生成");
    },
    handleCancel() {
      this.dialogVisible = false;
      this.resetForm();
    },
    handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.submitting = true;
          // let params = new URLSearchParams({
          //   newPassword: this.form.newPassword,
          // });
          let params = {
            newPassword: this.form.newPassword,
          };
          let res = await user.resetPassword(this.data.id, params);
          if (res.code == 200) {
            this.submitting = false;
            this.dialogVisible = false;
            this.$emit("success");
            this.resetForm();
          } else {
            this.submitting = false;
            this.$message.error(res.message || "密码重置失败");
          }
        }
      });
    },
    resetForm() {
      this.form = {
        newPassword: "",
        confirmPassword: "",
      };
      this.$refs.form && this.$refs.form.resetFields();
    },
  },
};
</script>

<style lang="scss" scoped>
.reset-password-dialog {
  ::v-deep .el-dialog__header {
    // background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);

    padding: 20px 24px;
    margin: 0;

    .el-dialog__title {
      color: white;
      font-size: 18px;
      font-weight: 500;
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: white;

      &:hover {
        color: #f0f0f0;
      }
    }
  }

  ::v-deep .el-dialog__body {
    padding: 0;
  }

  ::v-deep .el-dialog__footer {
    padding: 16px 24px;
  }
}

::v-deep .el-input__inner {
  border-radius: 6px;

  &:focus {
    border-color: #4f7cff;
  }
}

::v-deep .el-button {
  border-radius: 6px;
}
</style>
<style>
.reset-password-dialog .el-dialog__header {
  background-color: oklch(55.3% 0.195 38.402) !important;
}
.reset-password-dialog .el-button--primary {
  background-color: oklch(55.3% 0.195 38.402) !important;
  border: none;
}
</style>
