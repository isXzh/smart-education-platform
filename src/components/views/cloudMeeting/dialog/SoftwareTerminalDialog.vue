<template>
  <el-dialog
    :title="isEdit ? '编辑软件终端' : '新增软件终端'"
    :visible.sync="dialogVisible"
    width="480px"
    :close-on-click-modal="false"
    custom-class="software-terminal-dialog"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px" size="small">
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称"></el-input>
      </el-form-item>

      <el-form-item label="账号" prop="account">
        <el-input v-model="formData.account" placeholder="请输入账号"></el-input>
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password></el-input>
      </el-form-item>

      <el-form-item label="部门" prop="deptCode">
        <el-cascader
          v-model="formData.deptCode"
          :options="cascaderOptions"
          :props="cascaderProps"
          placeholder="请选择部门"
          clearable
          style="width: 100%"
          @change="handleDeptChange"
        ></el-cascader>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
          resize="none"
        ></el-input>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">{{ isEdit ? '保存' : '新增' }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'SoftwareTerminalDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    editData: {
      type: Object,
      default: null,
    },
    orgTree: {
      type: Array,
      default: () => [],
    },
    selectedDept: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      formData: {
        name: '',
        account: '',
        password: '',
        deptCode: [],
        remark: '',
      },
      cascaderProps: {
        value: 'deptCode',
        label: 'deptName',
        children: 'childDepts',
        checkStrictly: true,
        emitPath: false,
      },
      formRules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
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
    isEdit() {
      return !!this.editData;
    },
    cascaderOptions() {
      return this.orgTree || [];
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
    handleDeptChange(value) {
      this.formData.deptCode = value || [];
    },
    initForm() {
      if (this.editData) {
        this.formData = {
          name: this.editData.name || '',
          account: this.editData.userAccount || '',
          password: '',
          deptCode: this.editData.deptCode || [],
          remark: this.editData.desc || '',
        };
      } else {
        this.formData = {
          name: '',
          account: '',
          password: '',
          deptCode: this.selectedDept ? this.selectedDept.deptCode : [],
          remark: '',
        };
      }
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      });
    },
    handleClose() {
      this.dialogVisible = false;
    },
    handleSubmit() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          const submitData = {
            name: this.formData.name,
            account: this.formData.account,
            password: this.formData.password,
            deptCode: Array.isArray(this.formData.deptCode)
              ? this.formData.deptCode[this.formData.deptCode.length - 1] || ''
              : this.formData.deptCode,
            remark: this.formData.remark,
          };
          this.$emit('confirm', submitData);
          this.dialogVisible = false;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

<style>
.software-terminal-dialog .el-dialog__header {
  border-top-right-radius: 15px;
  border-top-left-radius: 15px;
}
</style>
