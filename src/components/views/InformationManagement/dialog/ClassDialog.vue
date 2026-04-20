<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="600px"
    :close-on-click-modal="false"
    custom-class="class-dialog"
    @close="handleClose"
  >
    <el-form ref="form" :model="formData" :rules="rules" label-width="100px" class="class-form">
      <!-- 班级名称 -->
      <el-form-item label="班级名称" prop="className">
        <el-input
          v-model="formData.className"
          placeholder="请输入班级名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <!-- 所属学段 -->
      <el-form-item label="所属学段" prop="stageId">
        <el-select v-model="formData.stageId" placeholder="请选择学段" style="width: 100%" @change="handleStageChange">
          <el-option v-for="stage in stageList" :key="stage.id" :label="stage.stageName" :value="stage.id" />
        </el-select>
      </el-form-item>

      <!-- 所属年级 -->
      <el-form-item label="所属年级" prop="gradeId">
        <el-select
          v-model="formData.gradeId"
          placeholder="请先选择学段"
          style="width: 100%"
          :disabled="!formData.stageId"
        >
          <el-option v-for="grade in filteredGradeList" :key="grade.id" :label="grade.gradeName" :value="grade.id" />
        </el-select>
      </el-form-item>

      <!-- 班主任 -->
      <el-form-item label="班主任">
        <el-select v-model="formData.headTeacherId" placeholder="请选择班主任" style="width: 100%" clearable>
          <el-option v-for="teacher in teacherList" :key="teacher.id" :label="teacher.teacherName" :value="teacher.id" />
        </el-select>
        <div class="form-tip">
          <i class="el-icon-info"></i>
          数据来源：教师管理中状态为"在职"的教师
        </div>
      </el-form-item>

      <!-- 教室 -->
      <el-form-item label="教室">
        <el-input v-model="formData.classroomName" placeholder="请输入教室名称" maxlength="50">
          <template slot="append">示例：101教室、实验室A等</template>
        </el-input>
      </el-form-item>

      <!-- 排序 -->
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number
          v-model="formData.sortOrder"
          :min="1"
          :max="999"
          controls-position="right"
          style="width: 100%"
          placeholder="请输入排序号"
        />
        <div class="form-tip">
          <i class="el-icon-info"></i>
          数字越小排序越靠前，默认自动生成
        </div>
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="状态">
        <el-switch
          v-model="formData.status"
          :active-value="1"
          :inactive-value="0"
          active-color="#10b981"
          inactive-color="#d1d5db"
        />
        <span class="status-label">{{ formData.status === 1 ? '启用' : '禁用' }}</span>
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
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
    name: 'ClassDialog',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        default: '新增班级',
      },
      editData: {
        type: Object,
        default: null,
      },
      stageList: {
        type: Array,
        default: () => [],
      },
      gradeList: {
        type: Array,
        default: () => [],
      },
      teacherList: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        formData: {
          className: '',
          stageId: '',
          gradeId: '',
          headTeacherId: '',
          classroomName: '',
          sortOrder: 1,
          status: 1,
          remark: '',
        },
        rules: {
          className: [
            { required: true, message: '请输入班级名称', trigger: 'blur' },
            { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' },
          ],
          stageId: [{ required: true, message: '请选择所属学段', trigger: 'change' }],
          gradeId: [{ required: true, message: '请选择所属年级', trigger: 'change' }],
          sortOrder: [
            { required: true, message: '请输入排序号', trigger: 'blur' },
            { type: 'number', min: 1, message: '排序号必须大于0', trigger: 'blur' },
          ],
          remark: [{ max: 200, message: '备注长度不能超过200个字符', trigger: 'blur' }],
        },
      };
    },
    computed: {
      filteredGradeList() {
        if (!this.formData.stageId) return [];
        return this.gradeList.filter(grade => grade.stageId === this.formData.stageId);
      },
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
            className: this.editData.className || '',
            stageId: this.editData.stageId || '',
            gradeId: this.editData.gradeId || '',
            headTeacherId: this.editData.headTeacherId || '',
            classroomName: this.editData.classroomName || '',
            sortOrder: this.editData.sortOrder || 1,
            status: this.editData.status ?? 1,
            remark: this.editData.remark || '',
          };
        } else {
          this.formData = {
            className: '',
            stageId: '',
            gradeId: '',
            headTeacherId: '',
            classroomName: '',
            sortOrder: 1,
            status: 1,
            remark: '',
          };
        }
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.clearValidate();
        });
      },
      handleStageChange() {
        this.formData.gradeId = '';
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
  .class-dialog {
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

  .class-form {
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

      ::v-deep .el-textarea__inner {
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
  }
</style>
