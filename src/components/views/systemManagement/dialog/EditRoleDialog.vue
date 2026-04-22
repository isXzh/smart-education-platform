<template>
  <el-dialog
    title="编辑角色"
    :visible.sync="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
    custom-class="role-dialog"
  >
    <div>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <!-- 角色名称 -->
        <el-form-item label="角色名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入角色名称"
            clearable
            maxlength="20"
            show-word-limit
          />
          <div class="text-xs text-gray-400 mt-1">2-20个字符</div>
        </el-form-item>

        <!-- 角色描述 -->
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入角色描述，说明该角色的主要职责"
            maxlength="100"
            show-word-limit
          />
          <div class="text-xs text-gray-400 mt-1">8/100 字符</div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="flex justify-end gap-3 border-t border-gray-100">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting"
        >保存</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import role from "@/api/role";

export default {
  name: "EditRoleDialog",
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
    return {
      submitting: false,
      form: {
        id: "",
        name: "",
        description: "",
      },
      rules: {
        name: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 2,
            max: 20,
            message: "长度在 2 到 20 个字符",
            trigger: "blur",
          },
        ],
        description: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 8,
            max: 100,
            message: "长度在 8 到 100 个字符",
            trigger: "blur",
          },
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
  },
  watch: {
    visible(val) {
      if (val && this.data) {
        this.form = { ...this.data };
      }
    },
  },
  methods: {
    handleCancel() {
      this.dialogVisible = false;
      this.resetForm();
    },
    async handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.submitting = true;
          try {
            const res = await role.update(this.form.id, this.form);
            if (res.code === 200) {
              this.$message.success("编辑角色成功");
              this.dialogVisible = false;
              this.$emit("success");
              this.resetForm();
            } else {
              this.$message.error(res.msg || "编辑角色失败");
            }
          } catch (error) {
            console.error("编辑角色失败:", error);
            this.$message.error("编辑角色失败");
          } finally {
            this.submitting = false;
          }
        }
      });
    },
    resetForm() {
      this.form = {
        id: "",
        name: "",
        description: "",
      };
      this.$refs.form && this.$refs.form.resetFields();
    },
  },
};
</script>

<style lang="scss" scoped>
.role-dialog {
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

::v-deep .el-textarea__inner {
  border-radius: 6px;

  &:focus {
    border-color: #4f7cff;
  }
}

::v-deep .el-button {
  border-radius: 6px;
}
</style>
