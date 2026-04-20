<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="650px"
    :close-on-click-modal="false"
    custom-class="student-dialog"
    @close="handleClose"
  >
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="student-form"
    >
      <!-- 基本信息 -->
      <div class="form-section">
        <div class="section-title">基本信息</div>
        <div class="form-row">
          <el-form-item label="姓名" prop="studentName">
            <el-input v-model="formData.studentName" placeholder="请输入姓名" maxlength="20" />
          </el-form-item>
          <el-form-item label="学号" prop="studentCode">
            <el-input v-model="formData.studentCode" placeholder="请输入学号" maxlength="20" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="性别" prop="gender">
            <el-select v-model="formData.gender" placeholder="请选择性别">
              <el-option label="男" :value="1" />
              <el-option label="女" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="出生日期" prop="birthDate">
            <el-date-picker
              v-model="formData.birthDate"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              style="width: 100%"
            />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="家长手机" prop="parentPhone">
            <el-input v-model="formData.parentPhone" placeholder="请输入家长手机号" maxlength="11" />
          </el-form-item>
          <el-form-item label="家长姓名" prop="parentName">
            <el-input v-model="formData.parentName" placeholder="请输入家长姓名" maxlength="20" />
          </el-form-item>
        </div>
      </div>

      <!-- 组织信息 -->
      <div class="form-section">
        <div class="section-title">组织信息</div>
        <div class="form-row">
          <el-form-item label="所属学段" prop="stageId">
            <el-select v-model="formData.stageId" placeholder="请选择学段">
              <el-option v-for="stage in stageList" :key="stage.id" :label="stage.stageName" :value="stage.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属年级" prop="gradeId">
            <el-select v-model="formData.gradeId" placeholder="请选择年级">
              <el-option v-for="grade in gradeList" :key="grade.id" :label="grade.gradeName" :value="grade.id" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="所属班级" prop="classId">
            <el-select v-model="formData.classId" placeholder="请选择班级">
              <el-option v-for="cls in classList" :key="cls.id" :label="cls.className" :value="cls.id" />
            </el-select>
          </el-form-item>
        </div>
      </div>

      <!-- 账号信息 -->
      <div class="form-section">
        <div class="section-title">账号信息</div>
        <div class="form-row">
          <el-form-item label="状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择状态">
              <el-option label="在读" :value="1" />
              <el-option label="休学" :value="2" />
              <el-option label="毕业" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="入学年份" prop="enrollmentYear">
            <el-input v-model="formData.enrollmentYear" placeholder="请输入入学年份" maxlength="4" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </div>
      </div>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import baseApi from '@/api/base.js';
import gradeApi from '@/api/grade.js';
import classApi from '@/api/class.js';

export default {
  name: 'StudentDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '新增学生',
    },
    editData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      dialogVisible: this.visible,
      stageList: [],
      gradeList: [],
      classList: [],
      formData: {
        studentName: '',
        studentCode: '',
        gender: 1,
        birthDate: '',
        parentPhone: '',
        parentName: '',
        stageId: '',
        gradeId: '',
        classId: '',
        status: 1,
        enrollmentYear: '',
        remark: '',
      },
      rules: {
        studentName: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' },
        ],
        studentCode: [
          { required: true, message: '请输入学号', trigger: 'blur' },
          { min: 2, max: 20, message: '学号长度在 2 到 20 个字符', trigger: 'blur' },
        ],
        gender: [
          { required: true, message: '请选择性别', trigger: 'change' },
        ],
        parentPhone: [
          { required: true, message: '请输入家长手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
        ],
        stageId: [
          { required: true, message: '请选择所属学院', trigger: 'change' },
        ],
        gradeId: [
          { required: true, message: '请选择所属年级', trigger: 'change' },
        ],
        classId: [
          { required: true, message: '请选择所属班级', trigger: 'change' },
        ],
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
    editData: {
      immediate: true,
      handler(val) {
        if (val) {
          this.formData = { ...val };
        } else {
          this.resetForm();
        }
      },
    },
    'formData.stageId': {
      handler(val) {
        if (val) {
          this.loadGradeList(val);
        } else {
          this.gradeList = [];
          this.classList = [];
        }
        this.formData.gradeId = '';
        this.formData.classId = '';
      },
    },
    'formData.gradeId': {
      handler(val) {
        if (val) {
          this.loadClassList(val);
        } else {
          this.classList = [];
        }
        this.formData.classId = '';
      },
    },
  },
  mounted() {
    this.loadStageList();
  },
  methods: {
    async loadStageList() {
      try {
        const res = await baseApi.stageList();
        if (res.code === 200) {
          this.stageList = res.data || [];
        }
      } catch (error) {
        console.error('加载学段列表失败:', error);
      }
    },
    async loadGradeList(stageId) {
      try {
        const res = await gradeApi.list({ stageId });
        if (res.code === 200) {
          this.gradeList = res.data || [];
        }
      } catch (error) {
        console.error('加载年级列表失败:', error);
      }
    },
    async loadClassList(gradeId) {
      try {
        const res = await classApi.list({ gradeId });
        if (res.code === 200) {
          this.classList = res.data || [];
        }
      } catch (error) {
        console.error('加载班级列表失败:', error);
      }
    },
    initForm() {
      if (this.editData) {
        this.formData = { ...this.editData };
        if (this.editData.stageId) {
          this.loadGradeList(this.editData.stageId);
        }
        if (this.editData.gradeId) {
          this.loadClassList(this.editData.gradeId);
        }
      } else {
        this.resetForm();
      }
    },
    // 重置表单
    resetForm() {
      this.formData = {
        studentName: '',
        studentCode: '',
        gender: 1,
        birthDate: '',
        parentPhone: '',
        parentName: '',
        stageId: '',
        gradeId: '',
        classId: '',
        status: 1,
        enrollmentYear: '',
        remark: '',
      };
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate();
      });
    },
    // 关闭弹窗
    handleClose() {
      this.resetForm();
      this.$emit('update:visible', false);
    },
    // 提交表单
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('confirm', { ...this.formData });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.student-dialog {
  ::v-deep .el-dialog__header {
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }
  }

  ::v-deep .el-dialog__body {
    padding: 24px;
    max-height: 60vh;
    overflow-y: auto;
  }

  ::v-deep .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;

    .el-button {
      padding: 10px 24px;
      border-radius: 8px;

      &--default {
        border-color: #e5e7eb;
        color: #4b5563;

        &:hover {
          border-color: #4f46e5;
          color: #4f46e5;
        }
      }

      &--primary {
        background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
        border: none;

        &:hover {
          background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
        }
      }
    }
  }
}

.student-form {
  .form-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 16px;
      padding-left: 12px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 14px;
        background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
        border-radius: 2px;
      }
    }
  }

  .form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .el-form-item {
      flex: 1;
      margin-bottom: 0;

      ::v-deep .el-form-item__label {
        font-size: 13px;
        color: #374151;
        font-weight: 500;
      }

      ::v-deep .el-input__inner {
        border-radius: 8px;
        border-color: #e5e7eb;
        height: 40px;

        &:focus {
          border-color: #4f46e5;
        }

        &::placeholder {
          color: #9ca3af;
        }
      }

      ::v-deep .el-textarea__inner {
        border-radius: 8px;
        border-color: #e5e7eb;

        &:focus {
          border-color: #4f46e5;
        }

        &::placeholder {
          color: #9ca3af;
        }
      }

      ::v-deep .el-select {
        width: 100%;
      }

      ::v-deep .el-date-editor {
        width: 100%;

        .el-input__inner {
          padding-left: 30px;
        }
      }
    }
  }
}
</style>
