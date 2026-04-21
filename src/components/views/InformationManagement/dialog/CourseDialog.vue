<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="isEdit ? '编辑课程' : '新增课程'"
    width="600px"
    :close-on-click-modal="false"
    custom-class="course-dialog"
    @closed="handleClosed"
    top="3vh"
  >
    <el-form ref="courseForm" :model="formData" :rules="formRules" label-position="top" class="course-form">
      <!-- 课程名称 -->
      <el-form-item label="课程名称" prop="courseName" class="form-item-required">
        <el-input v-model="formData.courseName" placeholder="请输入课程名称" class="form-input" />
      </el-form-item>

      <!-- 所属学科和学段 - 并排 -->
      <div class="form-row">
        <el-form-item label="所属学科" prop="subjectId" class="form-item-required form-item-half">
          <el-select
            v-model="formData.subjectId"
            placeholder="请选择学科"
            class="form-select"
          >
            <el-option v-for="item in subjectOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="所属学段" prop="stageId" class="form-item-required form-item-half">
          <el-select
            v-model="formData.stageId"
            placeholder="请选择学段"
            class="form-select"
          >
            <el-option v-for="item in stageOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </div>

      <!-- 课程代码 -->
      <el-form-item label="课程代码" prop="courseCode" class="form-item-required">
        <el-input v-model="formData.courseCode" placeholder="请输入课程代码" class="form-input" />
      </el-form-item>

      <!-- 课时数 -->
      <el-form-item label="课时数" prop="creditHours">
        <el-input-number v-model="formData.creditHours" :min="0" :precision="0" placeholder="请输入课时数" class="form-input" />
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="状态" prop="status" class="form-item-required">
        <el-radio-group v-model="formData.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 课程简介 -->
      <el-form-item label="课程简介" class="form-item-optional">
        <el-input
          v-model="formData.courseDesc"
          type="textarea"
          :rows="4"
          placeholder="请输入课程简介"
          resize="none"
        />
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注" class="form-item-optional">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注"
          resize="none"
        />
      </el-form-item>
    </el-form>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">{{ isEdit ? '确认保存' : '确认新增' }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import subjectApi from '@/api/subject.js'
import gradeLevelApi from '@/api/gradeLevel.js'

export default {
  name: 'CourseDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    editData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      dialogVisible: false,
      formData: {
        courseName: '',
        courseCode: '',
        subjectId: null,
        stageId: null,
        creditHours: 0,
        status: 1,
        courseDesc: '',
        remark: ''
      },
      formRules: {
        courseName: [
          { required: true, message: '请输入课程名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
        ],
        courseCode: [
          { required: true, message: '请输入课程代码', trigger: 'blur' },
        ],
        subjectId: [{ required: true, message: '请选择所属学科', trigger: 'change' }],
        stageId: [{ required: true, message: '请选择所属学段', trigger: 'change' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
      },
      subjectOptions: [],
      stageOptions: [],
    };
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
      if (val) {
        this.loadSubjectOptions();
        this.loadStageOptions();
        this.initFormData();
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val);
    },
  },
  methods: {
    // 加载学科下拉选项
    async loadSubjectOptions() {
      try {
        const res = await subjectApi.list();
        if (res.code === 200 && res.data) {
          this.subjectOptions = res.data.map(item => ({
            label: item.subjectName,
            value: item.id
          }));
        }
      } catch (error) {
        console.error('加载学科列表失败:', error);
      }
    },
    // 加载学段下拉选项
    async loadStageOptions() {
      try {
        const res = await gradeLevelApi.list();
        if (res.code === 200 && res.data) {
          this.stageOptions = res.data.map(item => ({
            label: item.stageName,
            value: item.id
          }));
        }
      } catch (error) {
        console.error('加载学段列表失败:', error);
      }
    },
    // 初始化表单数据
    initFormData() {
      if (this.isEdit && this.editData) {
        this.formData = {
          id: this.editData.id,
          courseName: this.editData.courseName || '',
          courseCode: this.editData.courseCode || '',
          subjectId: this.editData.subjectId || null,
          stageId: this.editData.stageId || null,
          creditHours: this.editData.creditHours || 0,
          status: this.editData.status !== undefined ? this.editData.status : 1,
          courseDesc: this.editData.courseDesc || '',
          remark: this.editData.remark || ''
        };
      } else {
        this.formData = {
          courseName: '',
          courseCode: '',
          subjectId: null,
          stageId: null,
          creditHours: 0,
          status: 1,
          courseDesc: '',
          remark: ''
        };
      }
    },
    // 取消
    handleCancel() {
      this.dialogVisible = false;
    },
    // 提交
    handleSubmit() {
      this.$refs.courseForm.validate(valid => {
        if (valid) {
          this.$emit('submit', { ...this.formData });
        }
      });
    },
    // 弹窗关闭
    handleClosed() {
      this.$refs.courseForm.resetFields();
      this.$emit('update:visible', false);
    },
  },
};
</script>

<style lang="scss" scoped>
  // 表单样式
  .course-form {
    max-height: 600px;
    overflow: auto;
    .form-row {
      display: flex;
      gap: 16px;

      .form-item-half {
        flex: 1;
      }
    }

    .form-item-required {
      margin-bottom: 10px;

      ::v-deep .el-form-item__label {
        line-height: 25px;
        padding: 0;
        &::before {
          content: '*';
          color: #f56c6c;
          margin-right: 4px;
        }
      }
    }

    .form-item-optional {
      ::v-deep .el-form-item__label {
        color: #909399;
      }
    }

    .form-input,
    .form-select {
      width: 100%;
    }
  }

  // 底部按钮
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
