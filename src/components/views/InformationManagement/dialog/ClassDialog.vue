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
        <el-input v-model="formData.className" placeholder="请输入班级名称" maxlength="50" show-word-limit />
      </el-form-item>

      <!-- 关联学校 -->
      <el-form-item label="关联学校" prop="schoolId">
        <el-select v-model="formData.schoolId" placeholder="请选择学校" style="width: 100%" @change="handleSchoolChange">
          <el-option v-for="school in schoolList" :key="school.id" :label="school.schoolName" :value="school.id" />
        </el-select>
      </el-form-item>

      <!-- 所属年级 -->
      <el-form-item label="所属年级" prop="gradeId">
        <el-select
          v-model="formData.gradeId"
          placeholder="请先选择学校"
          style="width: 100%"
          :disabled="!formData.schoolId"
        >
          <el-option v-for="grade in gradeList" :key="grade.id" :label="grade.gradeName" :value="grade.id" />
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
  import schoolApi from '@/api/school';
  import baseApi from '@/api/base';

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
    },
    data() {
      return {
        schoolList: [],
        gradeList: [],
        currentSchoolType: null,
        formData: {
          className: '',
          schoolId: '',
          gradeId: '',
          sortOrder: 1,
          status: 1,
          remark: '',
        },
        rules: {
          className: [
            { required: true, message: '请输入班级名称', trigger: 'blur' },
            { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' },
          ],
          schoolId: [{ required: true, message: '请选择关联学校', trigger: 'change' }],
          gradeId: [{ required: true, message: '请选择所属年级', trigger: 'change' }],
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
          this.loadSchoolList();
          this.initForm();
        }
      },
    },
    methods: {
      async loadSchoolList() {
        try {
          const res = await schoolApi.page();
          this.schoolList = res.data?.list || [];
        } catch (error) {
          console.error('加载学校列表失败:', error);
        }
      },
      async loadGradeList(schoolType) {
        try {
          const res = await baseApi.listBySchoolType({ schoolType });
          this.gradeList = res.data || [];
        } catch (error) {
          console.error('加载年级列表失败:', error);
          this.gradeList = [];
        }
      },
      async handleSchoolChange(schoolId) {
        this.formData.gradeId = '';
        this.gradeList = [];
        if (!schoolId) {
          this.currentSchoolType = null;
          return;
        }
        const selectedSchool = this.schoolList.find(s => s.id === schoolId);
        if (selectedSchool && selectedSchool.schoolType != null) {
          this.currentSchoolType = selectedSchool.schoolType;
          await this.loadGradeList(selectedSchool.schoolType);
        }
      },
      initForm() {
        if (this.editData) {
          this.formData = {
            className: this.editData.className || '',
            schoolId: this.editData.schoolId || '',
            gradeId: this.editData.gradeId || '',
            sortOrder: this.editData.sortOrder || 1,
            status: this.editData.status ?? 1,
            remark: this.editData.remark || '',
          };
          if (this.editData.schoolId) {
            this.$nextTick(() => {
              const selectedSchool = this.schoolList.find(s => s.id === this.editData.schoolId);
              if (selectedSchool && selectedSchool.schoolType != null) {
                this.currentSchoolType = selectedSchool.schoolType;
                this.loadGradeList(selectedSchool.schoolType);
              }
            });
          }
        } else {
          this.formData = {
            className: '',
            schoolId: '',
            gradeId: '',
            sortOrder: 1,
            status: 1,
            remark: '',
          };
          this.gradeList = [];
          this.currentSchoolType = null;
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
