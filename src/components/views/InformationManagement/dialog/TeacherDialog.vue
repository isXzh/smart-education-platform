<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="850px"
    :close-on-click-modal="false"
    custom-class="teacher-dialog"
    @close="handleClose"
  >
    <el-form ref="form" :model="formData" :rules="rules" label-width="100px" class="teacher-form">
      <!-- 基础身份 -->
      <div class="form-section">
        <div class="section-title">
          <i class="el-icon-user section-icon"></i>
          基础身份
        </div>
        <div class="form-row">
          <el-form-item label="姓名" prop="teacherName">
            <el-input v-model="formData.teacherName" placeholder="请输入姓名" maxlength="20" />
          </el-form-item>
          <el-form-item label="工号" prop="teacherCode">
            <el-input v-model="formData.teacherCode" placeholder="请输入工号" maxlength="20" :disabled="!!editData" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="性别" prop="gender">
            <el-select v-model="formData.gender" placeholder="请选择性别">
              <el-option label="男" :value="1" />
              <el-option label="女" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="50" />
          </el-form-item>
        </div>
      </div>

      <!-- 账号开通 -->
      <div class="form-section">
        <div class="section-title">
          <i class="el-icon-key section-icon"></i>
          账号开通
        </div>
        <div class="account-status-row">
          <div class="status-label-area">
            <span class="label-text">账号状态</span>
            <span class="label-desc">启用后该教师可登录系统</span>
          </div>
          <el-switch
            v-model="formData.status"
            :active-value="1"
            :inactive-value="0"
            active-text="在职"
            inactive-text="离职"
          />
        </div>
        <div class="account-tip">
          <i class="el-icon-info tip-icon"></i>
          <div class="tip-content">
            <span class="tip-label">登录账号：</span>默认使用上方填写的手机号作为登录账号
            <br />
            <span class="tip-sub">教师可使用手机号 + 密码登录教学助手客户端</span>
          </div>
        </div>
        <div class="form-row">
          <el-form-item label="登录密码" prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入登录密码，最少6位"
              maxlength="20"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="formData.confirmPassword"
              type="password"
              placeholder="请再次输入登录密码"
              maxlength="20"
              show-password
            />
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

      <!-- 组织归属 -->
      <div class="form-section">
        <div class="section-title">
          <i class="el-icon-office-building section-icon"></i>
          组织归属
        </div>
        <div class="form-row">
          <el-form-item label="所属学校" prop="schoolId">
            <el-select
              v-model="formData.schoolId"
              placeholder="请选择所属学校"
              clearable
              filterable
              @change="handleSchoolChange"
            >
              <el-option v-for="school in schoolList" :key="school.id" :label="school.schoolName" :value="school.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属学段" prop="stageId">
            <el-select
              v-model="formData.stageId"
              placeholder="请选择学段"
              :disabled="!formData.schoolId"
              clearable
              @change="handleStageChange"
            >
              <el-option
                v-for="stage in filteredStageList"
                :key="stage.id"
                :label="stage.stageName"
                :value="stage.id"
              />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-tip-text">选择学校后，任教配置将基于该校数据进行筛选</div>
      </div>

      <!-- 任教配置 -->
      <div class="form-section">
        <div class="section-header">
          <div class="section-title">
            <i class="el-icon-notebook-2 section-icon"></i>
            任教配置
          </div>
          <el-button type="primary" size="small" plain @click="addTeachingRecord">
            <i class="el-icon-plus"></i>
            添加任教
          </el-button>
        </div>

        <div v-if="formData.teachingList.length === 0" class="empty-teaching">
          <i class="el-icon-user empty-icon"></i>
          <p class="empty-text">暂无任教信息，请点击上方按钮添加</p>
          <p class="empty-sub">支持添加多个学科、多个班级的任教信息</p>
        </div>

        <div v-for="(record, index) in formData.teachingList" :key="record.key" class="teaching-record">
          <div class="record-header">
            <span class="record-title">任教记录 {{ index + 1 }}</span>
            <el-button type="text" class="delete-record-btn" @click="removeTeachingRecord(index)">
              <i class="el-icon-delete"></i>
            </el-button>
          </div>
          <div class="form-row teaching-row">
            <el-form-item
              label="学科"
              :prop="'teachingList.' + index + '.subjectId'"
              :rules="[{ required: true, message: '请选择学科', trigger: 'change' }]"
            >
              <el-select v-model="record.subjectId" placeholder="选择学科" :disabled="!formData.stageId">
                <el-option
                  v-for="subject in subjectList"
                  :key="subject.id"
                  :label="subject.subjectName"
                  :value="subject.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="年级"
              :prop="'teachingList.' + index + '.gradeId'"
              :rules="[{ required: true, message: '请选择年级', trigger: 'change' }]"
            >
              <el-select
                v-model="record.gradeId"
                placeholder="选择年级"
                :disabled="!formData.stageId"
                @change="handleGradeChange(index)"
              >
                <el-option v-for="grade in gradeList" :key="grade.id" :label="grade.gradeName" :value="grade.id" />
              </el-select>
            </el-form-item>
            <el-form-item
              label="班级"
              :prop="'teachingList.' + index + '.classId'"
              :rules="[{ required: true, message: '请选择班级', trigger: 'change' }]"
            >
              <el-select v-model="record.classId" placeholder="选择班级" :disabled="!record.gradeId">
                <el-option
                  v-for="cls in classMap[record.gradeId] || []"
                  :key="cls.id"
                  :label="cls.className"
                  :value="cls.id"
                />
              </el-select>
            </el-form-item>
            <div class="head-teacher-switch">
              <span class="switch-label">是否为班主任</span>
              <el-switch v-model="record.isHeadTeacher" :active-value="1" :inactive-value="0" />
            </div>
          </div>
        </div>
      </div>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import schoolApi from '@/api/school.js';
  import gradeLevelApi from '@/api/gradeLevel.js';
  import subjectApi from '@/api/subject.js';
  import gradeApi from '@/api/grade.js';
  import classApi from '@/api/class.js';

  export default {
    name: 'TeacherDialog',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        default: '新增教师',
      },
      editData: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        dialogVisible: this.visible,
        schoolList: [],
        allStageList: [],
        subjectList: [],
        gradeList: [],
        classMap: {},
        formData: {
          teacherName: '',
          teacherCode: '',
          gender: 1,
          phone: '',
          email: '',
          schoolId: '',
          stageId: '',
          password: '',
          confirmPassword: '',
          status: 1,
          remark: '',
          teachingList: [],
        },
        rules: {
          teacherName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
          teacherCode: [{ required: true, message: '请输入工号', trigger: 'blur' }],
          phone: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
          ],
          email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
          schoolId: [{ required: true, message: '请选择所属学校', trigger: 'change' }],
          stageId: [{ required: true, message: '请选择所属学段', trigger: 'change' }],
          password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
          confirmPassword: [
            {
              validator: (rule, value, callback) => {
                if (value !== this.formData.password) {
                  callback(new Error('两次输入的密码不一致'));
                } else {
                  callback();
                }
              },
              trigger: 'blur',
            },
          ],
        },
      };
    },
    computed: {
      filteredStageList() {
        if (!this.formData.schoolId) return [];
        const selectedSchool = this.schoolList.find(s => s.id === this.formData.schoolId);
        if (!selectedSchool) return [];
        const schoolType = selectedSchool.schoolType;
        if (schoolType === 1 || schoolType === 2 || schoolType === 3) {
          return this.allStageList.filter(stage => stage.id === schoolType);
        } else if (schoolType === 4) {
          return this.allStageList.filter(stage => stage.id === 1 || stage.id === 2);
        } else if (schoolType === 5) {
          return this.allStageList.filter(stage => stage.id === 2 || stage.id === 3);
        }
        return this.allStageList;
      },
    },
    watch: {
      visible(val) {
        this.dialogVisible = val;
        if (val) {
          this.initForm();
        }
      },
    },
    mounted() {
      this.loadSchoolList();
      this.loadStageList();
    },
    methods: {
      async loadSchoolList() {
        try {
          const res = await schoolApi.page({ pageSize: 9999 });
          if (res.code === 200) {
            this.schoolList = res.data?.list || res.data || [];
          }
        } catch (error) {
          console.error('加载学校列表失败:', error);
        }
      },
      async loadStageList() {
        try {
          const res = await gradeLevelApi.list();
          if (res.code === 200) {
            this.allStageList = res.data || [];
          }
        } catch (error) {
          console.error('加载学段列表失败:', error);
        }
      },
      async loadSubjectList(stageId) {
        if (!stageId) {
          this.subjectList = [];
          return;
        }
        try {
          const res = await subjectApi.listByStage(stageId);
          if (res.code === 200) {
            this.subjectList = res.data || [];
          }
        } catch (error) {
          console.error('加载学科列表失败:', error);
        }
      },
      async loadGradeList(stageId) {
        if (!stageId) {
          this.gradeList = [];
          return;
        }
        try {
          const res = await gradeApi.list({ stageId });
          if (res.code === 200) {
            this.gradeList = res.data || [];
          }
        } catch (error) {
          console.error('加载年级列表失败:', error);
        }
      },
      async loadClassList(schoolId, gradeId) {
        if (!schoolId || !gradeId) return;
        try {
          const res = await classApi.list({ schoolId, gradeId });
          if (res.code === 200) {
            this.$set(this.classMap, gradeId, res.data || []);
          }
        } catch (error) {
          console.error('加载班级列表失败:', error);
        }
      },
      handleSchoolChange() {
        this.formData.stageId = '';
        this.formData.teachingList = [];
        this.subjectList = [];
        this.gradeList = [];
        this.classMap = {};
      },
      async handleStageChange(val) {
        this.subjectList = [];
        this.gradeList = [];
        this.classMap = {};
        this.formData.teachingList.forEach(record => {
          record.subjectId = '';
          record.gradeId = '';
          record.classId = '';
        });
        if (val) {
          await Promise.all([this.loadSubjectList(val), this.loadGradeList(val)]);
        }
      },
      async handleGradeChange(index) {
        const record = this.formData.teachingList[index];
        record.classId = '';
        if (record.gradeId && this.formData.schoolId) {
          await this.loadClassList(this.formData.schoolId, record.gradeId);
        }
      },
      addTeachingRecord() {
        this.formData.teachingList.push({
          key: Date.now(),
          subjectId: '',
          gradeId: '',
          classId: '',
          isHeadTeacher: 0,
        });
      },
      removeTeachingRecord(index) {
        this.formData.teachingList.splice(index, 1);
      },
      initForm() {
        if (this.editData) {
          this.formData = {
            teacherName: this.editData.teacherName || '',
            teacherCode: this.editData.teacherCode || '',
            gender: this.editData.gender !== undefined ? this.editData.gender : 1,
            phone: this.editData.phone || '',
            email: this.editData.email || '',
            schoolId: this.editData.schoolId || '',
            stageId: this.editData.stageId || '',
            password: '',
            confirmPassword: '',
            status: this.editData.status !== undefined ? this.editData.status : 1,
            remark: this.editData.remark || '',
            teachingList: [],
          };
          this.rules.password = [];
          this.rules.confirmPassword = [];
          if (this.editData.teachingList && this.editData.teachingList.length > 0) {
            this.formData.teachingList = this.editData.teachingList.map((item, idx) => ({
              key: Date.now() + idx,
              id: item.id,
              subjectId: item.subjectId || '',
              gradeId: item.gradeId || '',
              classId: item.classId || '',
              isHeadTeacher: item.isHeadTeacher || 0,
            }));
          }
          if (this.editData.stageId) {
            this.loadSubjectList(this.editData.stageId);
            this.loadGradeList(this.editData.stageId);
          }
          if (this.editData.schoolId && this.editData.teachingList) {
            this.editData.teachingList.forEach(item => {
              if (item.gradeId) {
                this.loadClassList(this.editData.schoolId, item.gradeId);
              }
            });
          }
        } else {
          this.rules.password = [{ required: true, message: '请输入密码', trigger: 'blur' }];
          this.rules.confirmPassword = [
            {
              validator: (rule, value, callback) => {
                if (value !== this.formData.password) {
                  callback(new Error('两次输入的密码不一致'));
                } else {
                  callback();
                }
              },
              trigger: 'blur',
            },
          ];
          this.resetForm();
        }
      },
      resetForm() {
        this.formData = {
          teacherName: '',
          teacherCode: '',
          gender: 1,
          phone: '',
          email: '',
          schoolId: '',
          stageId: '',
          password: '',
          confirmPassword: '',
          status: 1,
          remark: '',
          teachingList: [],
        };
        this.subjectList = [];
        this.gradeList = [];
        this.classMap = {};
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.clearValidate();
        });
      },
      handleClose() {
        this.resetForm();
        this.$emit('update:visible', false);
      },
      handleSubmit() {
        this.$refs.form.validate(valid => {
          if (valid) {
            const submitData = {
              teacherName: this.formData.teacherName,
              teacherCode: this.formData.teacherCode,
              gender: this.formData.gender,
              phone: this.formData.phone,
              email: this.formData.email,
              schoolId: this.formData.schoolId,
              stageId: this.formData.stageId,
              status: this.formData.status,
              remark: this.formData.remark,
              teachingList: this.formData.teachingList.map(item => ({
                ...(item.id ? { id: item.id } : {}),
                subjectId: item.subjectId,
                gradeId: item.gradeId,
                classId: item.classId,
                isHeadTeacher: item.isHeadTeacher,
              })),
            };
            if (this.editData && this.editData.id) {
              submitData.id = this.editData.id;
            }
            if (this.formData.password) {
              submitData.password = this.formData.password;
            }
            this.$emit('confirm', submitData);
          }
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  ::v-deep .teacher-dialog {
    .el-dialog__header {
      padding: 16px 24px;
      border-bottom: 1px solid #e5e7eb;
      background-color: white;
      .el-dialog__title {
        font-size: 16px;
        font-weight: 600;
        color: #1f2a44;
      }
    }

    .el-dialog__body {
      padding: 24px;
      max-height: 65vh;
      overflow-y: auto;
    }

    ::v-deep .el-dialog__footer {
      padding: 12px 24px;
      border-top: 1px solid #e5e7eb;
    }
  }

  .teacher-form {
    .form-section {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 15px;
        font-weight: 600;
        color: #1f2a44;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;

        .section-icon {
          color: #1677ff;
          font-size: 18px;
        }
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        .el-button {
          color: white;
        }
        .section-title {
          margin-bottom: 0;
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
          border-radius: 6px;
          border-color: #d9d9d9;
          height: 36px;

          &:focus {
            border-color: #1677ff;
          }

          &::placeholder {
            color: #bfbfbf;
          }
        }

        ::v-deep .el-textarea__inner {
          border-radius: 6px;
          border-color: #d9d9d9;

          &:focus {
            border-color: #1677ff;
          }

          &::placeholder {
            color: #bfbfbf;
          }
        }

        ::v-deep .el-select {
          width: 100%;
        }
      }
    }

    .account-status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding: 12px 16px;
      background: #fafafa;
      border-radius: 6px;

      .status-label-area {
        .label-text {
          font-size: 14px;
          font-weight: 500;
          color: #1f2a44;
        }

        .label-desc {
          display: block;
          font-size: 12px;
          color: #8c8c8c;
          margin-top: 2px;
        }
      }

      ::v-deep .el-switch {
        .el-switch__label {
          font-size: 13px;
          color: #8c8c8c;

          &.is-active {
            color: #1677ff;
          }
        }
      }
    }

    .account-tip {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px 16px;
      background: #e6f4ff;
      border: 1px solid #bae0ff;
      border-radius: 6px;
      margin-bottom: 16px;

      .tip-icon {
        color: #1677ff;
        font-size: 16px;
        margin-top: 2px;
        flex-shrink: 0;
      }

      .tip-content {
        font-size: 13px;
        color: #595959;
        line-height: 1.6;

        .tip-label {
          font-weight: 500;
          color: #1677ff;
        }

        .tip-sub {
          font-size: 12px;
          color: #8c8c8c;
        }
      }
    }

    .form-tip-text {
      font-size: 12px;
      color: #8c8c8c;
      margin-top: 4px;
    }

    .empty-teaching {
      text-align: center;
      padding: 32px 20px;
      background: #fafafa;
      border: 1px dashed #d9d9d9;
      border-radius: 6px;

      .empty-icon {
        font-size: 32px;
        color: #bfbfbf;
        margin-bottom: 8px;
      }

      .empty-text {
        font-size: 14px;
        color: #8c8c8c;
        margin: 0 0 4px 0;
      }

      .empty-sub {
        font-size: 12px;
        color: #bfbfbf;
        margin: 0;
      }
    }

    .teaching-record {
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: #fafafa;
      margin-bottom: 12px;
      ::v-deep .el-form-item__content {
        width: 130px;
        margin-left: 50px !important;
      }
      ::v-deep .el-form-item__label {
        width: 50px !important;
      }
      &:last-child {
        margin-bottom: 0;
      }

      .record-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        .record-title {
          font-size: 13px;
          font-weight: 500;
          color: #595959;
        }

        .delete-record-btn {
          color: #ff4d4f;
          padding: 4px;

          &:hover {
            color: #ff7875;
          }

          i {
            font-size: 14px;
          }
        }
      }

      .teaching-row {
        align-items: center;

        .el-form-item {
          flex: 1;
          min-width: 0;
        }

        .head-teacher-switch {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 12px;
          white-space: nowrap;
          flex-shrink: 0;

          .switch-label {
            font-size: 13px;
            color: #595959;
          }
        }
      }
    }
  }

  .dialog-footer {
    .el-button {
      padding: 8px 20px;
      border-radius: 6px;

      &--default {
        border-color: #d9d9d9;
        color: #595959;

        &:hover {
          border-color: #1677ff;
          color: #1677ff;
        }
      }

      &--primary {
        background: #1677ff;
        border-color: #1677ff;

        &:hover {
          background: #4096ff;
          border-color: #4096ff;
        }
      }
    }
  }
</style>
