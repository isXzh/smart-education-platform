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
        <el-input v-model="formData.courseName" placeholder="例如：数学基础课" class="form-input" />
      </el-form-item>

      <!-- 所属学科和学段 - 并排 -->
      <div class="form-row">
        <el-form-item label="所属学科" prop="subject" class="form-item-required form-item-half">
          <el-select
            v-model="formData.subject"
            placeholder="请选择学科"
            class="form-select"
            @change="handleSubjectChange"
          >
            <el-option v-for="item in subjectOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="学段" prop="gradeLevel" class="form-item-required form-item-half">
          <el-select
            v-model="formData.gradeLevel"
            placeholder="请选择学段"
            class="form-select"
            @change="handleGradeLevelChange"
          >
            <el-option v-for="item in gradeLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </div>

      <!-- 课程代码 -->
      <el-form-item label="课程代码（系统自动生成）" class="form-item-auto">
        <div class="course-code-wrapper">
          <el-input v-model="formData.courseCode" readonly class="course-code-input">
            <i slot="suffix" class="el-icon-refresh refresh-icon" @click="refreshCourseCode" title="重新生成" />
          </el-input>
        </div>
        <div class="form-tip">格式：学科代码-随机编号，保存后自动生成</div>
      </el-form-item>

      <!-- 课时时长 -->
      <!-- <el-form-item label="课时时长" prop="selectedPeriods" class="form-item-required shichang-item">
        <div v-if="formData.selectedPeriods.length > 0" class="selected-tags">
          <el-tag
            v-for="(period, index) in formData.selectedPeriods"
            :key="period.period"
            closable
            size="small"
            class="period-tag"
            @close="removePeriod(index)"
          >
            {{ period.name }}({{ period.timeRange }})
          </el-tag>
        </div>

        <div v-if="!formData.gradeLevel" class="period-placeholder">
          <div class="placeholder-text">
            <i class="el-icon-warning-outline" />
            <span>已选择 0 个课时</span>
            <span class="highlight">(请先选择学段)</span>
          </div>
          <div class="placeholder-sub">请先选择学段以加载对应的课时时列表</div>
        </div>

        <div v-else class="period-list">
          <div class="period-list-header">
            <span>已选择 {{ formData.selectedPeriods.length }} 个课时</span>
          </div>
          <div class="period-list-content">
            <div
              v-for="period in periodList"
              :key="period.period"
              :class="['period-item', { selected: isPeriodSelected(period) }]"
              @click="togglePeriod(period)"
            >
              <i :class="['el-icon-check check-icon', { checked: isPeriodSelected(period) }]" />
              <span class="period-name">{{ period.name }}</span>
              <span class="period-time">{{ period.timeRange }}</span>
            </div>
          </div>
        </div>

        <div class="form-tip">从课时管理中选择该课程包含的课时，可多选</div>
      </el-form-item> -->

      <!-- 状态 -->
      <el-form-item label="状态" prop="status" class="form-item-required">
        <el-radio-group v-model="formData.status">
          <el-radio label="启用">启用</el-radio>
          <el-radio label="停用">停用</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 课程简介 -->
      <el-form-item label="课程简介（可选）" class="form-item-optional">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入课程简介，包括课程目标、主要内容等"
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
          subject: '',
          gradeLevel: '',
          courseCode: '',
          // selectedPeriods: [],
          status: '启用',
          description: '',
        },
        formRules: {
          courseName: [
            { required: true, message: '请输入课程名称', trigger: 'blur' },
            { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
          ],
          subject: [{ required: true, message: '请选择所属学科', trigger: 'change' }],
          gradeLevel: [{ required: true, message: '请选择学段', trigger: 'change' }],
          // selectedPeriods: [{ type: 'array', required: true, message: '请至少选择一个课时', trigger: 'change' }],
          status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        },
        subjectOptions: [
          { label: '语文', value: '语文' },
          { label: '数学', value: '数学' },
          { label: '英语', value: '英语' },
          { label: '物理', value: '物理' },
          { label: '化学', value: '化学' },
          { label: '生物', value: '生物' },
          { label: '历史', value: '历史' },
          { label: '地理', value: '地理' },
          { label: '政治', value: '政治' },
          { label: '体育', value: '体育' },
          { label: '美术', value: '美术' },
          { label: '音乐', value: '音乐' },
          { label: '信息技术', value: '信息技术' },
        ],
        gradeLevelOptions: [
          { label: '小学', value: '小学' },
          { label: '初中', value: '初中' },
          { label: '高中', value: '高中' },
        ],
        // 各学段的课时配置
        periodConfig: {
          小学: [
            { period: 1, name: '第1节', timeRange: '08:00-08:40' },
            { period: 2, name: '第2节', timeRange: '08:50-09:30' },
            { period: 3, name: '第3节', timeRange: '09:40-10:20' },
            { period: 4, name: '第4节', timeRange: '10:30-11:10' },
            { period: 5, name: '第5节', timeRange: '14:00-14:40' },
            { period: 6, name: '第6节', timeRange: '14:50-15:30' },
          ],
          初中: [
            { period: 1, name: '第1节', timeRange: '08:00-08:45' },
            { period: 2, name: '第2节', timeRange: '08:55-09:40' },
            { period: 3, name: '第3节', timeRange: '09:50-10:35' },
            { period: 4, name: '第4节', timeRange: '10:45-11:30' },
            { period: 5, name: '第5节', timeRange: '14:00-14:45' },
            { period: 6, name: '第6节', timeRange: '14:55-15:40' },
            { period: 7, name: '第7节', timeRange: '15:50-16:35' },
            { period: 8, name: '第8节', timeRange: '16:45-17:30' },
          ],
          高中: [
            { period: 1, name: '第1节', timeRange: '08:00-08:45' },
            { period: 2, name: '第2节', timeRange: '08:55-09:40' },
            { period: 3, name: '第3节', timeRange: '09:50-10:35' },
            { period: 4, name: '第4节', timeRange: '10:45-11:30' },
            { period: 5, name: '第5节', timeRange: '14:00-14:45' },
            { period: 6, name: '第6节', timeRange: '14:55-15:40' },
            { period: 7, name: '第7节', timeRange: '15:50-16:35' },
            { period: 8, name: '第8节', timeRange: '16:45-17:30' },
          ],
        },
      };
    },
    computed: {
      // 当前学段的课时列表
      periodList() {
        if (!this.formData.gradeLevel) return [];
        return this.periodConfig[this.formData.gradeLevel] || [];
      },
      // 生成课程代码
      generatedCourseCode() {
        if (!this.formData.subject) return '';
        const subjectCode = this.getSubjectCode(this.formData.subject);
        const randomNum = Math.floor(100 + Math.random() * 900);
        return `${subjectCode}-${randomNum}`;
      },
    },
    watch: {
      visible(val) {
        this.dialogVisible = val;
        if (val) {
          this.initFormData();
        }
      },
      dialogVisible(val) {
        this.$emit('update:visible', val);
      },
      'formData.subject'() {
        this.updateCourseCode();
      },
    },
    methods: {
      // 初始化表单数据
      initFormData() {
        if (this.isEdit && this.editData) {
          this.formData = {
            courseName: this.editData.courseName || '',
            subject: this.editData.subject || '',
            gradeLevel: this.editData.gradeLevel || '',
            courseCode: this.editData.courseCode || '',
            // selectedPeriods: this.editData.selectedPeriods || [],
            status: this.editData.status || '启用',
            description: this.editData.description || '',
          };
        } else {
          this.formData = {
            courseName: '',
            subject: '',
            gradeLevel: '',
            courseCode: '',
            // selectedPeriods: [],
            status: '启用',
            description: '',
          };
        }
        // 生成课程代码
        this.updateCourseCode();
      },
      // 获取学科代码
      getSubjectCode(subject) {
        const codeMap = {
          语文: 'CHN',
          数学: 'MATH',
          英语: 'ENG',
          物理: 'PHY',
          化学: 'CHE',
          生物: 'BIO',
          历史: 'HIS',
          地理: 'GEO',
          政治: 'POL',
          体育: 'PE',
          美术: 'ART',
          音乐: 'MUS',
          信息技术: 'IT',
        };
        return codeMap[subject] || 'CRS';
      },
      // 更新课程代码
      updateCourseCode() {
        if (!this.isEdit) {
          this.formData.courseCode = this.generatedCourseCode;
        }
      },
      // 刷新课程代码
      refreshCourseCode() {
        const subjectCode = this.getSubjectCode(this.formData.subject);
        const randomNum = Math.floor(100 + Math.random() * 900);
        this.formData.courseCode = `${subjectCode}-${randomNum}`;
      },
      // 学科变化处理
      handleSubjectChange() {
        // 学科变化时自动更新课程代码
        this.updateCourseCode();
      },
      // 学段变化处理
      handleGradeLevelChange() {
        // 清空已选课时
        this.formData.selectedPeriods = [];
      },
      // 切换课时选择
      togglePeriod(period) {
        const index = this.formData.selectedPeriods.findIndex(p => p.period === period.period);
        if (index > -1) {
          this.formData.selectedPeriods.splice(index, 1);
        } else {
          this.formData.selectedPeriods.push({ ...period });
        }
      },
      // 判断是否已选择课时
      isPeriodSelected(period) {
        return this.formData.selectedPeriods.some(p => p.period === period.period);
      },
      // 移除已选课时
      removePeriod(index) {
        this.formData.selectedPeriods.splice(index, 1);
      },
      // 取消
      handleCancel() {
        this.dialogVisible = false;
      },
      // 提交
      handleSubmit() {
        this.$refs.courseForm.validate(valid => {
          if (valid) {
            // if (this.formData.selectedPeriods.length === 0) {
            //   this.$message.warning('请至少选择一个课时');
            //   return;
            // }
            this.$emit('submit', { ...this.formData });
            this.dialogVisible = false;
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
  // 对话框样式
  // ::v-deep .course-dialog {
  //   .el-dialog__header {
  //     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  //     padding: 16px 20px;

  //     .el-dialog__title {
  //       color: #fff;
  //       font-size: 16px;
  //       font-weight: 500;
  //     }

  //     .el-dialog__headerbtn {
  //       top: 16px;

  //       .el-dialog__close {
  //         color: #fff;

  //         &:hover {
  //           color: #f0f0f0;
  //         }
  //       }
  //     }
  //   }

  //   .el-dialog__body {
  //     padding: 24px;
  //   }

  //   .el-dialog__footer {
  //     padding: 16px 24px;
  //     border-top: 1px solid #ebeef5;
  //   }
  // }

  // 表单样式
  .course-form {
    height: 700px;
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

    .form-item-auto {
      ::v-deep .el-form-item__label {
        color: #909399;
        font-size: 13px;
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

    .course-code-wrapper {
      .course-code-input {
        ::v-deep .el-input__inner {
          background-color: #f5f7fa;
          color: #606266;
        }

        .refresh-icon {
          cursor: pointer;
          color: #909399;
          font-size: 14px;

          &:hover {
            color: #409eff;
          }
        }
      }
    }

    .form-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
      line-height: 1.5;
    }

    // 课时选择区域
    .selected-tags {
      margin-bottom: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 10px 0 0 10px;
      .period-tag {
        background-color: #ecf5ff;
        border-color: #d9ecff;
        color: #409eff;

        ::v-deep .el-tag__close {
          color: #409eff;

          &:hover {
            color: #fff;
            background-color: #409eff;
          }
        }
      }
    }

    .period-placeholder {
      padding: 24px;
      background-color: #f5f7fa;
      border-radius: 4px;
      text-align: center;

      .placeholder-text {
        color: #606266;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        i {
          color: #e6a23c;
          font-size: 16px;
        }

        .highlight {
          color: #f56c6c;
        }
      }

      .placeholder-sub {
        color: #909399;
        font-size: 12px;
        margin-top: 8px;
      }
    }

    .period-list {
      border: 1px solid #ebeef5;
      border-radius: 4px;
      overflow: hidden;

      .period-list-header {
        padding: 12px 16px;
        background-color: #f5f7fa;
        border-bottom: 1px solid #ebeef5;
        font-size: 14px;
        color: #606266;
      }

      .period-list-content {
        max-height: 240px;
        overflow-y: auto;

        .period-item {
          display: flex;
          align-items: center;
          padding: 0 16px;
          border-bottom: 1px solid #ebeef5;
          cursor: pointer;
          transition: background-color 0.2s;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background-color: #f5f7fa;
          }

          &.selected {
            background-color: #ecf5ff;
          }

          .check-icon {
            width: 16px;
            height: 16px;
            border: 1px solid #dcdfe6;
            border-radius: 2px;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: transparent;
            transition: all 0.2s;

            &.checked {
              background-color: #409eff;
              border-color: #409eff;
              color: #fff;
            }
          }

          .period-name {
            flex: 1;
            font-size: 14px;
            color: #303133;
          }

          .period-time {
            font-size: 13px;
            color: #909399;
          }
        }
      }
    }
  }

  // 底部按钮
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    // .el-button {
    //   min-width: 88px;

    //   &--primary {
    //     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    //     border: none;

    //     &:hover {
    //       opacity: 0.9;
    //     }
    //   }
    // }
  }
</style>
<style>
  .shichang-item .el-form-item__content {
    border-radius: 5px;
    border: 1px solid oklch(87.2% 0.01 258.338);
  }
</style>
