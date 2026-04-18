<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="600px"
    :close-on-click-modal="false"
    custom-class="grade-dialog"
    @close="handleClose"
  >
    <el-form ref="form" :model="formData" :rules="rules" label-width="100px" class="grade-form">
      <!-- 年级名称 -->
      <el-form-item label="年级名称" prop="gradeName">
        <el-input
          v-model="formData.gradeName"
          placeholder="请输入年级名称，如：一年级"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <!-- 所属学段 -->
      <el-form-item label="所属学段" prop="stageId">
        <el-select v-model="formData.stageId" placeholder="请选择所属学段" style="width: 100%">
          <el-option v-for="stage in stageList" :key="stage.id" :label="stage.stageName" :value="stage.id" />
        </el-select>
      </el-form-item>

      <!-- 排序 -->
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number
          v-model="formData.sortOrder"
          :min="1"
          :max="999"
          controls-position="right"
          style="width: 100%"
          placeholder="请输入排序号，数字越小越靠前"
        />
        <div class="form-tip">
          <i class="el-icon-info"></i>
          排序号越小，显示越靠前
        </div>
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="状态" prop="status">
        <el-switch
          v-model="formData.status"
          :active-value="1"
          :inactive-value="0"
          active-color="#10b981"
          inactive-color="#d1d5db"
        />
        <span class="status-label">{{ formData.status === 1 ? '启用' : '禁用' }}</span>
        <div class="form-tip" v-if="formData.status === 0">
          <i class="el-icon-warning"></i>
          禁用后，该年级在排课时将不可选择
        </div>
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息（可选）"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
  export default {
    name: 'GradeDialog',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        default: '新增年级',
      },
      editData: {
        type: Object,
        default: null,
      },
      stageList: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        formData: {
          gradeName: '',
          stageId: '',
          sortOrder: 1,
          status: 1,
          remark: '',
        },
        rules: {
          gradeName: [
            { required: true, message: '请输入年级名称', trigger: 'blur' },
            { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
          ],
          stageId: [{ required: true, message: '请选择所属学段', trigger: 'change' }],
          sortOrder: [
            { required: true, message: '请输入排序号', trigger: 'blur' },
            { type: 'number', min: 1, message: '排序号必须大于0', trigger: 'blur' },
          ],
          remark: [{ max: 200, message: '备注长度不能超过200个字符', trigger: 'blur' }],
        },
      };
    },
    watch: {
      visible(val) {
        if (val) {
          this.initForm();
        }
      },
    },
    methods: {
      initForm() {
        if (this.editData) {
          this.formData = {
            gradeName: this.editData.gradeName || '',
            stageId: this.editData.stageId || '',
            sortOrder: this.editData.sortOrder || 1,
            status: this.editData.status ?? 1,
            remark: this.editData.remark || '',
          };
        } else {
          this.formData = {
            gradeName: '',
            stageId: '',
            sortOrder: 1,
            status: 1,
            remark: '',
          };
        }
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.clearValidate();
        });
      },
      handleClose() {
        this.$emit('update:visible', false);
      },
      handleCancel() {
        this.$emit('update:visible', false);
      },
      handleConfirm() {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.$emit('confirm', { ...this.formData });
          } else {
            return false;
          }
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .grade-dialog {
    ::v-deep .el-dialog__header {
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;

      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
      }
    }

    ::v-deep .el-dialog__body {
      padding: 24px;
    }

    ::v-deep .el-dialog__footer {
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
    }
  }

  .grade-form {
    .el-form-item {
      margin-bottom: 20px;

      ::v-deep .el-form-item__label {
        font-weight: 500;
        color: #374151;
      }

      ::v-deep .el-input__inner {
        border-radius: 8px;
        border-color: #e5e7eb;

        &:focus {
          border-color: #4f46e5;
        }
      }
    }

    .form-tip {
      margin-top: 6px;
      font-size: 12px;
      color: #6b7280;

      i {
        margin-right: 4px;
        color: #3b82f6;
      }
    }

    .status-label {
      margin-left: 8px;
      font-size: 14px;
      color: #374151;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    // .el-button {
    //   padding: 9px 20px;
    //   border-radius: 8px;

    //   &--primary {
    //     background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
    //     border: none;

    //     &:hover {
    //       background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
    //     }
    //   }
    // }
  }
</style>
