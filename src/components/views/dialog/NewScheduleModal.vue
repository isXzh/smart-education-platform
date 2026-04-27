<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    width="640px"
    :title="dialogTitle"
    custom-class="new-schedule-modal"
    @close="handleClose"
  >
    <!-- <div slot="title" class="modal-title">新建排课</div> -->

    <div class="modal-body">
      <el-form ref="form" :model="form" :rules="rules" label-position="top">
        <!-- 学段 -->
        <el-form-item label="学段" prop="gradeLevel">
          <el-select v-model="form.gradeLevel" placeholder="请选择学段" class="full-width">
            <el-option
              v-for="item in gradeLevelList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- 年级 -->
        <el-form-item label="年级" prop="grade">
          <el-select v-model="form.grade" placeholder="请选择年级" class="full-width">
            <el-option v-for="item in gradeList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <!-- 学科 -->
        <el-form-item label="学科" prop="subject">
          <el-select v-model="form.subject" placeholder="请选择学科" class="full-width">
            <el-option
              v-for="item in subjectList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <!-- 课程 -->
        <el-form-item label="课程" prop="course">
          <el-select v-model="form.course" placeholder="请选择课程" class="full-width">
            <el-option v-for="item in courseList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>

        <!-- 班级 -->
        <el-form-item label="班级" prop="class">
          <el-select v-model="form.class" placeholder="请选择班级" class="full-width">
            <el-option v-for="item in classList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>

        <!-- 教师 -->
        <el-form-item label="教师" prop="teacher">
          <el-select v-model="form.teacher" placeholder="请选择教师" class="full-width">
            <el-option
              v-for="item in teacherList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <!-- 上课日期 -->
        <el-form-item label="上课日期" prop="courseDate">
          <el-date-picker
            v-model="form.courseDate"
            type="date"
            placeholder="年/月/日"
            class="full-width"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>

        <!-- 上课节次 -->
        <el-form-item label="上课节次" prop="coursePeriod">
          <el-select
            v-model="form.coursePeriod"
            placeholder="请先选择学段"
            class="full-width"
            :disabled="!form.gradeLevel"
          >
            <el-option v-for="item in periodList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <div class="form-hint" v-if="!form.gradeLevel">节次选项将根据所选学段动态加载</div>
        </el-form-item>

        <!-- 上课地点 -->
        <el-form-item label="上课地点" prop="courseLocation">
          <el-input v-model="form.courseLocation" placeholder="选择主讲教室后自动填充" class="full-width"></el-input>
        </el-form-item>
        <!-- 教学活动类型 -->
        <el-form-item label="教学类型" prop="activityType">
          <div class="activity-type-group">
            <div :class="['type-option', { active: form.activityType === '校内' }]" @click="form.activityType = '校内'">
              日常教学
            </div>
            <div :class="['type-option', { active: form.activityType === '校外' }]" @click="form.activityType = '校外'">
              户外教学
            </div>
          </div>
        </el-form-item>
        <!-- 状态 -->
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" class="full-width">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- 主讲教室 -->
        <el-form-item label="主讲教室" prop="mainClassroom">
          <div class="classroom-selector">
            <div class="search-box">
              <i class="el-icon-search"></i>
              <input type="text" placeholder="搜索教室..." />
            </div>
            <div class="classroom-list">
              <el-radio-group v-model="form.mainClassroom">
                <div class="classroom-item">
                  <el-radio :label="1"
                    >移动课堂箱-A01 <span class="classroom-location">教学楼A-101</span></el-radio
                  >
                </div>
                <div class="classroom-item">
                  <el-radio :label="2"
                    >移动课堂箱-A02 <span class="classroom-location">教学楼A-102</span></el-radio
                  >
                </div>
              </el-radio-group>
            </div>
          </div>
        </el-form-item>

        <!-- 辅讲教室 -->
        <el-form-item label="辅讲教室">
          <div class="optional-label">(可选)</div>
          <div class="classroom-selector">
            <div class="search-box">
              <i class="el-icon-search"></i>
              <input type="text" placeholder="搜索教室..." />
            </div>
            <div class="classroom-list">
              <el-checkbox-group v-model="form.assistClassroom">
                <div class="classroom-item">
                  <el-checkbox :label="2"
                    >移动课堂箱-A01 <span class="classroom-location">教学楼A-101</span></el-checkbox
                  >
                </div>
                <div class="classroom-item">
                  <el-checkbox :label="3"
                    >移动课堂箱-A02 <span class="classroom-location">教学楼A-102</span></el-checkbox
                  >
                </div>
              </el-checkbox-group>

              <!-- <div class="classroom-item">
                <el-checkbox v-model="form.assistClassroom" label="移动课堂箱-B01"
                  >移动课堂箱-B01 <span class="classroom-location">教学楼B-201</span></el-checkbox
                >
              </div>
              <div class="classroom-item">
                <el-checkbox v-model="form.assistClassroom" label="移动课堂箱-C01"
                  >移动课堂箱-C01 <span class="classroom-location">实验楼C-301</span></el-checkbox
                >
              </div> -->
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <div slot="footer" class="modal-footer">
      <el-button class="cancel-btn" @click="handleClose">取消</el-button>
      <el-button type="primary" class="submit-btn" @click="handleSubmit">确认排课</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import gradeLevel from '@/api/gradeLevel';
  import grade from '@/api/grade';
  import subject from '@/api/subject';
  import course from '@/api/course';
  import classApi from '@/api/class';
  import teacher from '@/api/teacher';
  import classPeriod from '@/api/classPeriod';
  import schedule from '@/api/schedule';

  export default {
    name: 'NewScheduleModal',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      mode: {
        type: String,
        default: 'create',
        validator: value => ['create', 'edit', 'copy'].includes(value),
      },
      scheduleData: {
        type: Object,
        default: () => ({}),
      },
    },
    data() {
      return {
        form: {
          status: 1,
          gradeLevel: '',
          activityType: '校内',
          course: '',
          subject: '',
          teacher: '',
          class: '',
          courseDate: '',
          coursePeriod: '',
          courseLocation: '',
          grade: '',
          mainClassroom: '',
          assistClassroom: [],
        },
        gradeLevelList: [],
        gradeList: [],
        subjectList: [],
        courseList: [],
        classList: [],
        teacherList: [],
        periodList: [],
        statusOptions: [
          { label: '已取消', value: 0 },
          { label: '已排课', value: 1 },
          { label: '进行中', value: 2 },
          { label: '已完成', value: 3 },
        ],
        rules: {
          activityType: [{ required: true, message: '请选择教学活动类型', trigger: 'change' }],
          gradeLevel: [{ required: true, message: '请选择学段', trigger: 'change' }],
          course: [{ required: true, message: '请选择课程', trigger: 'change' }],
          subject: [{ required: true, message: '请选择学科', trigger: 'change' }],
          teacher: [{ required: true, message: '请选择教师', trigger: 'change' }],
          courseDate: [{ required: true, message: '请选择上课日期', trigger: 'change' }],
          status: [{ required: true, message: '请选择状态', trigger: 'change' }],
          coursePeriod: [{ required: true, message: '请选择上课节次', trigger: 'change' }],
          courseLocation: [{ required: true, message: '请填写上课地点', trigger: 'blur' }],
          mainClassroom: [
            {
              required: true,
              message: '请选择主讲教室',
              trigger: 'change',
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
          this.$emit('update:visible', val);
        },
      },
      dialogTitle() {
        const titleMap = {
          create: '新建排课',
          edit: '编辑排课',
          copy: '复制排课',
        };
        return titleMap[this.mode] || '新建排课';
      },
    },
    mounted() {
      this.loadGradeLevelList();
      this.loadSubjectList();
      this.loadTeacherList();
    },
    watch: {
      visible: {
        handler(newVal) {
          if (newVal) {
            this.initFormData();
          }
        },
      },
      'form.gradeLevel': {
        handler(newVal) {
          if (newVal) {
            this.loadGradeList(newVal);
            this.loadPeriodList(newVal);
          } else {
            this.gradeList = [];
            this.periodList = [];
          }
          this.loadClassList();
        },
      },
      'form.grade': {
        handler() {
          this.loadClassList();
        },
      },
      'form.subject': {
        handler(newVal) {
          if (newVal) {
            this.loadCourseList(newVal);
          } else {
            this.courseList = [];
            this.form.course = '';
          }
        },
      },
    },
    methods: {
      async loadGradeLevelList() {
        try {
          const res = await gradeLevel.list();
          if (res.code === 200 && res.data) {
            this.gradeLevelList = res.data.map(item => ({
              label: item.stageName,
              value: item.id,
            }));
          }
        } catch (error) {
          console.error('加载学段列表失败:', error);
        }
      },
      async loadGradeList(stageId) {
        try {
          const res = await grade.list({ stageId });
          if (res.code === 200 && res.data) {
            this.gradeList = res.data.map(item => ({
              label: item.gradeName,
              value: item.id,
            }));
          }
        } catch (error) {
          console.error('加载年级列表失败:', error);
        }
      },
      async loadSubjectList() {
        try {
          const res = await subject.list();
          if (res.code === 200 && res.data) {
            this.subjectList = res.data.map(item => ({
              label: item.subjectName,
              value: item.id,
            }));
          }
        } catch (error) {
          console.error('加载学科列表失败:', error);
        }
      },
      async loadCourseList(subjectId) {
        try {
          const res = await course.listBySubject(subjectId);
          if (res.code === 200 && res.data) {
            this.courseList = res.data.map(item => ({
              label: item.courseName,
              value: item.id,
            }));
          }
        } catch (error) {
          console.error('加载课程列表失败:', error);
        }
      },
      async loadClassList() {
        try {
          const params = {};
          if (this.form.gradeLevel) {
            params.stageId = this.form.gradeLevel;
          }
          if (this.form.grade) {
            params.gradeId = this.form.grade;
          }
          const res = await classApi.list(params);
          if (res.code === 200 && res.data) {
            this.classList = res.data.map(item => ({
              label: item.className,
              value: item.id,
            }));
          }
        } catch (error) {
          console.error('加载班级列表失败:', error);
        }
      },
      async loadTeacherList() {
        try {
          const res = await teacher.list();
          if (res.code === 200 && res.data) {
            this.teacherList = res.data.map(item => ({
              label: item.teacherName,
              value: item.id,
            }));
          }
        } catch (error) {
          console.error('加载教师列表失败:', error);
        }
      },
      async loadPeriodList(stageId) {
        try {
          const res = await classPeriod.list(stageId);
          if (res.code === 200 && res.data) {
            this.periodList = res.data.map(item => ({
              label: item.periodName,
              value: item.id,
            }));
          }
        } catch (error) {
          console.error('加载上课节次列表失败:', error);
        }
      },
      handleClose() {
        this.dialogVisible = false;
        this.resetForm();
      },
      resetForm() {
        this.form = {
          status: 1,
          activityType: '校内',
          gradeLevel: '',
          grade: '',
          course: '',
          subject: '',
          teacher: '',
          class: '',
          courseDate: '',
          coursePeriod: '',
          courseLocation: '',
          mainClassroom: '',
          assistClassroom: [],
        };
        this.$refs.form && this.$refs.form.resetFields();
      },
      initFormData() {
        this.resetForm();
        console.log('ccccccccccccc', this.scheduleData);

        if (this.mode === 'edit' && this.scheduleData && this.scheduleData.id) {
          this.form = {
            status: this.scheduleData.status,
            activityType: this.scheduleData.activityType === 1 ? '校内' : '校外',
            gradeLevel: this.scheduleData.stageId,
            grade: this.scheduleData.gradeId,
            course: this.scheduleData.courseId,
            subject: this.scheduleData.subjectId,
            teacher: this.scheduleData.teacherId,
            class: this.scheduleData.classId,
            courseDate: this.scheduleData.lessonDate,
            coursePeriod: this.scheduleData.periodId,
            courseLocation: this.scheduleData.location || '',
            mainClassroom: this.scheduleData.mainClassroom ? this.scheduleData.mainClassroom.id : '',
            assistClassroom: this.scheduleData.auxClassrooms.map(item => item.id) || [],
          };
        } else if (this.mode === 'copy' && this.scheduleData && this.scheduleData.id) {
          this.form = {
            status: this.scheduleData.status,
            activityType: this.scheduleData.activityType === 1 ? '校内' : '校外',
            gradeLevel: this.scheduleData.stageId,
            grade: this.scheduleData.gradeId,
            course: this.scheduleData.courseId,
            subject: this.scheduleData.subjectId,
            teacher: this.scheduleData.teacherId,
            class: this.scheduleData.classId,
            courseDate: this.scheduleData.lessonDate,
            coursePeriod: this.scheduleData.periodId,
            courseLocation: this.scheduleData.location || '',
            mainClassroom: this.scheduleData.mainClassroom ? this.scheduleData.mainClassroom.id : '',
            assistClassroom: this.scheduleData.auxClassrooms.map(item => item.id) || [],
            courseName: (this.scheduleData.courseName || '') + '副本',
          };
        }
      },
      async handleSubmit() {
        this.$refs.form.validate(async valid => {
          if (valid) {
            try {
              const requestData = {
                stageId: this.form.gradeLevel,
                gradeId: this.form.grade,
                subjectId: this.form.subject,
                courseId: this.form.course,
                classId: this.form.class,
                teacherId: this.form.teacher,
                periodId: this.form.coursePeriod,
                lessonDate: this.form.courseDate,
                activityType: this.form.activityType === '校内' ? 1 : 2,
                mainClassroomId: this.form.mainClassroom,
                auxClassroomIds: this.form.assistClassroom,
                location: this.form.courseLocation,
              };
              console.log('requestData', requestData);
              let res;
              if (this.mode === 'edit') {
                res = await schedule.update(this.scheduleData.id, requestData);
              } else {
                res = await schedule.add(requestData);
              }

              if (res.code === 200) {
                const successMessage = this.mode === 'edit' ? '编辑成功' : '排课成功';
                this.$message.success(successMessage);
                this.$emit('submit', { ...this.form, mode: this.mode });
                this.handleClose();
              } else {
                this.$message.error(res.message || '操作失败');
              }
            } catch (error) {
              console.error('操作失败:', error);
              this.$message.error('操作失败，请稍后重试');
            }
          }
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .new-schedule-modal {
    ::v-deep .el-dialog__header {
      display: none;
    }

    ::v-deep .el-dialog__body {
      padding: 0;
    }

    ::v-deep .el-dialog__footer {
      padding: 16px 24px;
      border-top: 1px solid #ebeef5;
    }
  }

  .modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    padding: 20px 24px 16px;
    border-bottom: 1px solid #ebeef5;
  }

  .modal-body {
    padding: 20px 24px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .cancel-btn {
    padding: 9px 20px;
    border-color: #dcdfe6;
    color: #606266;

    &:hover {
      color: #4f7cff;
      border-color: #4f7cff;
    }
  }

  .submit-btn {
    padding: 9px 24px;
    background: #4f7cff;
    border-color: #4f7cff;

    &:hover {
      background: #3d6aea;
      border-color: #3d6aea;
    }
  }

  .full-width {
    width: 100%;
  }

  .activity-type-group {
    display: flex;
    gap: 16px;
  }

  .type-option {
    flex: 1;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    color: #606266;
    transition: all 0.3s;

    &:hover {
      border-color: #4f7cff;
      color: #4f7cff;
    }

    &.active {
      background: #f0f5ff;
      border-color: #4f7cff;
      color: #4f7cff;
    }
  }

  .form-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .optional-label {
    display: inline-block;
    font-size: 12px;
    color: #909399;
    margin-left: 4px;
  }

  .classroom-selector {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 12px;
  }

  .classroom-selector .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    margin-bottom: 12px;
  }

  .classroom-selector .search-box i {
    color: #909399;
    font-size: 14px;
  }

  .classroom-selector .search-box input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    color: #606266;
    background: transparent;
  }

  .classroom-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .classroom-item {
    padding: 8px 0;
  }

  .classroom-item ::v-deep .el-checkbox {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .classroom-item ::v-deep .el-checkbox__label {
    flex: 1;
    display: flex;
    justify-content: space-between;
    padding-left: 8px;
  }

  .classroom-item ::v-deep .el-radio {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .classroom-item ::v-deep .el-radio__label {
    flex: 1;
    display: flex;
    justify-content: space-between;
    padding-left: 8px;
  }

  .classroom-location {
    color: #909399;
    font-size: 13px;
  }

  ::v-deep .el-form-item__label {
    font-size: 14px;
    color: #606266;
    padding-bottom: 8px;
    line-height: 20px;
  }

  ::v-deep .el-form-item {
    margin-bottom: 20px;
  }

  ::v-deep .el-form-item.is-required .el-form-item__label::before {
    content: '*';
    color: #f56c6c;
    margin-right: 4px;
  }

  ::v-deep .el-input__inner {
    height: 36px;
    line-height: 36px;
  }

  ::v-deep .el-select .el-input__inner {
    height: 36px;
    line-height: 36px;
  }

  ::v-deep .el-date-editor.el-input {
    width: 100%;
  }

  ::v-deep .el-date-editor .el-input__inner {
    height: 36px;
    line-height: 36px;
  }
</style>
