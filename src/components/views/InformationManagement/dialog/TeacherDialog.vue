<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="650px"
    :close-on-click-modal="false"
    custom-class="teacher-dialog"
    @close="handleClose"
  >
    <el-form ref="form" :model="formData" :rules="rules" label-width="100px" class="teacher-form">
      <!-- 基本信息 -->
      <div class="form-section">
        <div class="section-title">基本信息</div>
        <div class="form-row">
          <el-form-item label="姓名" prop="teacherName">
            <el-input v-model="formData.teacherName" placeholder="请输入姓名" maxlength="20" />
          </el-form-item>
          <el-form-item label="工号" prop="teacherCode">
            <el-input v-model="formData.teacherCode" placeholder="请输入工号" maxlength="20" />
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

      <!-- 组织信息 -->
      <div class="form-section">
        <div class="section-title">组织信息</div>
        <div class="form-row">
          <el-form-item class="form-xueduan" label="所属学段" prop="stageId">
            <el-select v-model="formData.stageId" placeholder="请选择学段">
              <el-option label="小学" :value="1" />
              <el-option label="初中" :value="2" />
              <el-option label="高中" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属组织" class="form-zuzhi" prop="orgId">
            <el-cascader
              v-model="formData.orgPath"
              :options="orgTree"
              :props="cascaderProps"
              placeholder="请选择组织"
              clearable
              @change="handleCascaderChange"
            />
          </el-form-item>
        </div>
      </div>

      <!-- 账号信息 -->
      <div class="form-section">
        <div class="section-title">账号信息</div>
        <div class="form-row">
          <el-form-item label="设置密码" prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              maxlength="20"
              show-password
            />
          </el-form-item>
          <el-form-item label="账号状态" prop="status">
            <el-switch
              v-model="formData.status"
              :active-value="1"
              :inactive-value="0"
              active-text="在职"
              inactive-text="离职"
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
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import baseApi from '@/api/base.js';
  import orgStructureApi from '@/api/orgStructure.js';

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
        stageList: [],
        orgTree: [],
        cascaderProps: {
          value: 'id',
          label: 'orgName',
          children: 'children',
          checkStrictly: true,
        },
        formData: {
          teacherName: '',
          teacherCode: '',
          gender: 1,
          phone: '',
          email: '',
          stageId: '',
          orgPath: [],
          orgId: '',
          password: '',
          status: 1,
          remark: '',
        },
        rules: {
          teacherName: [
            { required: true, message: '请输入姓名', trigger: 'blur' },
            { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' },
          ],
          teacherCode: [
            { required: true, message: '请输入工号', trigger: 'blur' },
            { min: 2, max: 20, message: '工号长度在 2 到 20 个字符', trigger: 'blur' },
          ],
          // password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
          gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
          phone: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
          ],
          email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
          stageId: [{ required: true, message: '请选择所属学段', trigger: 'change' }],
          orgId: [{ required: true, message: '请选择所属组织', trigger: 'change' }],
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
            console.log('cccccccc', val);

            this.rules.password = [];
            this.formData = { ...val };
            if (val.orgIdPath) {
              this.formData.orgPath = val.orgIdPath;
            }
          } else {
            this.rules.password = [{ required: true, message: '请输入密码', trigger: 'blur' }];
            this.resetForm();
          }
        },
      },
    },
    mounted() {
      this.loadStageList();
      this.loadOrgTree();
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
      async loadOrgTree() {
        try {
          const res = await orgStructureApi.tree();
          if (res.code === 200) {
            this.orgTree = res.data[0].children || [];
          }
        } catch (error) {
          console.error('加载组织树失败:', error);
        }
      },
      handleCascaderChange(value) {
        if (value && value.length > 0) {
          this.formData.orgId = value[value.length - 1];
        } else {
          this.formData.orgId = '';
        }
      },
      initForm() {
        if (this.editData) {
          this.formData = { ...this.editData };
          if (this.editData.orgIdPath) {
            console.log('============', this.editData);

            this.formData.orgPath = this.editData.orgIdPath;
          }
        } else {
          this.resetForm();
        }
      },
      // 重置表单
      resetForm() {
        this.formData = {
          teacherName: '',
          teacherCode: '',
          gender: 1,
          phone: '',
          email: '',
          stageId: '',
          orgId: '',
          status: 1,
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
  .teacher-dialog {
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

  .teacher-form {
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

        ::v-deep .el-switch {
          &__label {
            font-size: 13px;
            color: #6b7280;

            &.is-active {
              color: #4f46e5;
            }
          }
        }
      }
    }
  }
  .teacher-form .form-xueduan ::v-deep .el-form-item__content {
    width: 100px;
  }
  .teacher-form .form-zuzhi ::v-deep .el-form-item__content {
    width: 300px;
  }
  .el-cascader {
    width: 100%;
  }
</style>
<style scoped></style>
