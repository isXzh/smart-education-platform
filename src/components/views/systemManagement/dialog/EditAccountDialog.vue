<template>
  <el-dialog
    title="编辑账号"
    :visible.sync="dialogVisible"
    width="680px"
    :close-on-click-modal="false"
    custom-class="account-dialog"
  >
    <div class="p-6">
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <div class="grid grid-cols-2 gap-x-6">
          <!-- 账号名称 -->
          <el-form-item label="账号名称">
            <el-input v-model="form.username" disabled class="!bg-gray-50" />
            <div class="text-xs text-gray-400 mt-1">账号名称创建后不可修改</div>
          </el-form-item>

          <!-- 真实姓名 -->
          <el-form-item label="真实姓名" prop="realName">
            <el-input
              v-model="form.realName"
              placeholder="请输入真实姓名"
              clearable
            />
          </el-form-item>

          <!-- 角色分配 -->
          <el-form-item label="角色分配" prop="roleId">
            <el-select
              v-model="form.roleId"
              placeholder="请选择角色"
              class="w-full"
            >
              <el-option
                v-for="role in roleOptions"
                :key="role.value"
                :label="role.label"
                :value="role.value"
              >
                <div class="flex items-center">
                  <span
                    class="w-2 h-2 rounded-full mr-2"
                    :class="role.color"
                  ></span>
                  <span>{{ role.label }}</span>
                </div>
              </el-option>
            </el-select>
            <div v-if="form.roleId" class="text-xs text-gray-500 mt-1">
              当前选择：{{ getRoleLabelByValue(form.roleId) }}
            </div>
          </el-form-item>

          <!-- 手机号 -->
          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="form.phone"
              placeholder="请输入手机号"
              clearable
            />
            <div class="text-xs text-gray-400 mt-1">用于账号找回和接收通知</div>
          </el-form-item>
        </div>

        <!-- 各角色权限说明 -->
        <div class="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 class="text-sm font-medium text-gray-700 mb-3">
            各角色权限说明：
          </h4>
          <div class="space-y-2">
            <div
              v-for="role in roleDescriptions"
              :key="role.code"
              class="flex items-start gap-2"
            >
              <el-tag
                size="mini"
                :type="role.type"
                class="flex-shrink-0 mt-0.5"
              >
                {{ role.label }}
              </el-tag>
              <span class="text-xs text-gray-600">{{ role.description }}</span>
            </div>
          </div>
        </div>

        <!-- 安全提示 -->
        <div class="mt-4 bg-amber-50 rounded-lg p-4 border border-amber-100">
          <div class="flex items-start gap-2">
            <i class="el-icon-warning text-amber-500 text-sm mt-0.5"></i>
            <div>
              <span class="text-sm font-medium text-amber-700">提示：</span>
              <span class="text-sm text-amber-600"
                >编辑模式不会修改密码，如需重置密码请使用"重置密码"功能</span
              >
            </div>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 底部按钮 -->
    <div
      slot="footer"
      class="flex justify-end gap-3 p-4 border-t border-gray-100"
    >
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting"
        >保存</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import role from "@/api/role";
import user from "@/api/user";

export default {
  name: "EditAccountDialog",
  data() {
    return {
      submitting: false,
      dialogVisible: false,
      userId: "",
      form: {
        username: "",
        realName: "",
        roleId: "",
        phone: "",
        id: null,
      },
      rules: {
        realName: [
          { required: true, message: "请输入真实姓名", trigger: "blur" },
        ],
        roleId: [{ required: true, message: "请选择角色", trigger: "change" }],
        phone: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: "请输入正确的手机号",
            trigger: "blur",
          },
        ],
      },
      roleOptions: [],
      roleDescriptions: [
        {
          code: "super_admin",
          label: "超级管理员",
          type: "danger",
          description: "拥有系统所有权限，可管理账号、设备、课程等全部功能",
        },
        {
          code: "jw_admin",
          label: "教务管理员",
          type: "warning",
          description: "负责课程排课、课表管理、基础信息维护等教务相关功能",
        },
        {
          code: "device_admin",
          label: "设备管理员",
          type: "success",
          description: "负责设备资源的调配、维护、日志查看等设备管理功能",
        },
        {
          code: "sys_admin",
          label: "系统管理员",
          type: "info",
          description: "负责系统配置、账号管理、数据备份等系统维护功能",
        },
      ],
    };
  },
  methods: {
    showDialog(data) {
      this.dialogVisible = true;
      this.userId = data.id;
      this.form = {
        username: data.username,
        realName: data.realName,
        roleId: data.roleId || "",
        phone: data.phone,
        id: data.id,
      };
      this.getRoleOptions();
    },
    getRoleOptions() {
      role.list().then((res) => {
        if (res.code === 200) {
          this.roleOptions = res.data.map((item) => ({
            value: item.id,
            label: item.roleName,
            color: this.getRoleColor(item.roleCode),
          }));
        }
      });
    },
    getRoleColor(roleCode) {
      const colors = {
        super_admin: "bg-blue-500",
        jw_admin: "bg-yellow-400",
        device_admin: "bg-green-500",
        sys_admin: "bg-purple-500",
      };
      return colors[roleCode] || "bg-gray-400";
    },
    getRoleLabel(value) {
      const role = this.roleOptions.find((r) => r.value === value);
      return role ? role.label : value;
    },
    getRoleLabelByValue(value) {
      const role = this.roleOptions.find((r) => r.value === value);
      return role ? role.label : value;
    },
    handleCancel() {
      this.dialogVisible = false;
      this.resetForm();
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitting = true;
          const params = {
            username: this.form.username,
            realName: this.form.realName,
            roleId: this.form.roleId - 0,
            phone: this.form.phone,
          };
          user
            .update(this.userId, params)
            .then((res) => {
              this.submitting = false;
              if (res.code === 200) {
                this.dialogVisible = false;
                this.$emit("success");
                this.resetForm();
                this.$message.success("账号更新成功");
              } else {
                this.$message.error(res.message || "账号更新失败");
              }
            })
            .catch(() => {
              this.submitting = false;
              this.$message.error("账号更新失败");
            });
        }
      });
    },
    resetForm() {
      this.form = {
        username: "",
        realName: "",
        roleId: "",
        phone: "",
      };
      this.userId = "";
      this.$refs.form && this.$refs.form.resetFields();
    },
  },
};
</script>

<style lang="scss" scoped>
.account-dialog {
  ::v-deep .el-dialog__header {
    background: linear-gradient(135deg, #4f7cff 0%, #3b5bdb 100%);
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

::v-deep .el-form-item__label {
  font-weight: 500;
  color: #374151;
}

::v-deep .el-input__inner {
  border-radius: 6px;

  &:focus {
    border-color: #4f7cff;
  }
}

::v-deep .el-select {
  width: 100%;
}

::v-deep .el-button {
  border-radius: 6px;
}
</style>
