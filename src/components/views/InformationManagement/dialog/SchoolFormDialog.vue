<template>
  <el-dialog
    :title="school ? '编辑学校' : '新增学校'"
    :visible="visible"
    width="560px"
    top="5vh"
    :close-on-click-modal="false"
    custom-class="school-form-dialog"
    @close="handleClose"
  >
    <el-form ref="schoolForm" :model="formData" :rules="formRules" label-width="120px" class="school-form">
      <el-form-item label="学校名称" prop="schoolName">
        <el-input v-model="formData.schoolName" placeholder="请输入学校名称" />
      </el-form-item>
      <el-form-item label="学校代码" prop="schoolCode">
        <el-input v-model="formData.schoolCode" placeholder="请输入学校代码" />
      </el-form-item>
      <el-form-item label="所属上级组织" prop="orgId">
        <el-cascader
          v-model="formData.orgId"
          :options="orgCascaderOptions"
          :props="cascaderProps"
          placeholder="请选择所属上级组织"
          style="width: 100%"
          clearable
        />
      </el-form-item>
      <el-form-item label="学校类型" prop="schoolType">
        <el-select v-model="formData.schoolType" placeholder="请选择学校类型" style="width: 100%">
          <el-option v-for="item in schoolTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="联系人" prop="contactPerson">
        <el-input v-model="formData.contactPerson" placeholder="请输入联系人姓名" />
      </el-form-item>
      <el-form-item label="联系电话" prop="contactPhone">
        <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="详细地址" prop="address">
        <el-input v-model="formData.address" type="textarea" :rows="3" placeholder="请输入详细地址" />
      </el-form-item>
      <el-form-item label="排序号">
        <el-input-number v-model="formData.sortOrder" :min="0" controls-position="right" style="width: 100%" />
        <span class="form-tip">排序数字越小，显示顺序越靠前</span>
      </el-form-item>
      <el-form-item label="状态">
        <el-switch
          v-model="formData.status"
          :active-value="1"
          :inactive-value="0"
          active-color="#1677FF"
          inactive-color="#D1D5DB"
        />
        <span class="switch-label">{{ formData.status ? '启用' : '禁用' }}</span>
        <div class="form-tip">禁用后，该学校在人员管理中将不可选择</div>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注信息（可选）" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" class="btn-primary" @click="handleSave">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: 'SchoolFormDialog',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      school: {
        type: Object,
        default: null,
      },
      orgTreeData: {
        type: Array,
        default: () => [],
      },
      defaultOrgId: {
        type: [Number, String],
        default: '',
      },
    },
    data() {
      return {
        formData: {
          schoolCode: '',
          schoolName: '',
          orgId: '',
          schoolType: 1,
          contactPerson: '',
          contactPhone: '',
          address: '',
          sortOrder: 0,
          status: 1,
          remark: '',
        },
        formRules: {
          schoolName: [{ required: true, message: '学校名称不能为空', trigger: 'blur' }],
          schoolCode: [{ required: true, message: '学校代码不能为空', trigger: 'blur' }],
          orgId: [{ required: true, message: '请选择所属上级组织', trigger: 'change' }],
          schoolType: [{ required: true, message: '请选择学校类型', trigger: 'change' }],
          contactPerson: [{ required: true, message: '联系人不能为空', trigger: 'blur' }],
          contactPhone: [{ required: true, message: '联系电话不能为空', trigger: 'blur' }],
          address: [{ required: true, message: '详细地址不能为空', trigger: 'blur' }],
        },
        cascaderProps: {
          value: 'id',
          label: 'orgName',
          children: 'children',
          checkStrictly: true,
          emitPath: false,
        },
        schoolTypeOptions: [
          { value: 1, label: '小学' },
          { value: 2, label: '初中' },
          { value: 3, label: '高中' },
          { value: 4, label: '九年一贯制' },
          { value: 5, label: '完全中学' },
        ],
      };
    },
    computed: {
      orgCascaderOptions() {
        return this.orgTreeData;
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
        if (this.school) {
          this.formData = {
            schoolCode: this.school.schoolCode || '',
            schoolName: this.school.schoolName || '',
            orgId: this.school.orgId || '',
            schoolType: this.school.schoolType || 1,
            contactPerson: this.school.contactPerson || '',
            contactPhone: this.school.contactPhone || '',
            address: this.school.address || '',
            sortOrder: this.school.sortOrder || 0,
            status: this.school.status !== undefined ? this.school.status : 1,
            remark: this.school.remark || '',
          };
        } else {
          this.formData = {
            schoolCode: '',
            schoolName: '',
            orgId: this.defaultOrgId || '',
            schoolType: 1,
            contactPerson: '',
            contactPhone: '',
            address: '',
            sortOrder: 0,
            status: 1,
            remark: '',
          };
        }
        this.$nextTick(() => {
          this.$refs.schoolForm && this.$refs.schoolForm.clearValidate();
        });
      },
      handleClose() {
        this.$emit('update:visible', false);
        this.$emit('close');
      },
      handleSave() {
        this.$refs.schoolForm.validate(valid => {
          if (!valid) return;
          const submitData = {
            schoolName: this.formData.schoolName,
            schoolCode: this.formData.schoolCode,
            orgId: this.formData.orgId,
            schoolType: this.formData.schoolType,
            contactPerson: this.formData.contactPerson,
            contactPhone: this.formData.contactPhone,
            address: this.formData.address,
            sortOrder: this.formData.sortOrder,
            status: this.formData.status,
            remark: this.formData.remark,
          };
          this.$emit('save', submitData);
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .btn-primary {
    background: #1677ff;
    border-color: #1677ff;
    color: #fff;

    &:hover,
    &:focus {
      background: #0958d9;
      border-color: #0958d9;
    }
  }

  ::v-deep .school-form {
    .el-form-item {
      margin-bottom: 16px;
    }

    .form-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
      display: block;
    }

    .switch-label {
      margin-left: 8px;
      font-size: 14px;
      color: #606266;
    }
  }

  ::v-deep .school-form-dialog {
    .el-dialog__header {
      border-bottom: 1px solid #ebeef5;
      padding: 16px 24px;
      background-color: white;
      .el-dialog__headerbtn .el-dialog__close {
        color: black;
      }
      .el-dialog__title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .el-dialog__body {
      padding: 20px 24px;
    }

    .el-dialog__footer {
      border-top: 1px solid #ebeef5;
      padding: 12px 24px;
    }
  }
</style>
