<template>
  <el-dialog
    :title="isEdit ? '编辑设备' : '添加设备'"
    :visible.sync="dialogVisible"
    width="640px"
    :close-on-click-modal="false"
    custom-class="device-form-dialog"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px" size="small">
      <el-form-item label="设备名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入设备名称，如：移动课堂箱-A01"></el-input>
      </el-form-item>

      <el-form-item label="所属部门" prop="departmentId">
        <el-popover
          ref="treePopover"
          placement="bottom-start"
          trigger="click"
          width="320"
          popper-class="dept-tree-popover"
        >
          <div class="dept-tree-wrapper">
            <el-tree
              ref="deptTree"
              :data="orgTree"
              :props="{ children: 'childDepts', label: 'deptName' }"
              node-key="deptCode"
              :expand-on-click-node="false"
              default-expand-all
              highlight-current
              @node-click="handleDeptNodeClick"
            >
              <template slot-scope="{ node }">
                <span class="dept-tree-node">
                  <i class="el-icon-folder dept-node-icon"></i>
                  <span>{{ node.label }}</span>
                </span>
              </template>
            </el-tree>
          </div>
          <el-input
            slot="reference"
            v-model="selectedDeptPath"
            placeholder="请选择部门"
            readonly
            suffix-icon="el-icon-arrow-down"
          ></el-input>
        </el-popover>
      </el-form-item>

      <el-form-item label="设备型号" prop="model">
        <el-select v-model="formData.model" placeholder="请选择设备型号" style="width: 100%">
          <el-option label="MCB-2024-PRO (专业版)" value="MCB-2024-PRO"></el-option>
          <el-option label="MCB-2024-STD (标准版)" value="MCB-2024-STD"></el-option>
          <el-option label="MCB-2024-LITE (轻量版)" value="MCB-2024-LITE"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="SN码" prop="sn">
        <el-input v-model="formData.sn" placeholder="请输入设备SN码，如：SN202401001" class="sn-input"></el-input>
      </el-form-item>

      <el-form-item label="设备状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择设备状态" style="width: 100%">
          <el-option label="在线" value="online"></el-option>
          <el-option label="离线" value="offline"></el-option>
          <el-option label="使用中" value="inuse"></el-option>
          <el-option label="已过期" value="expired"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="激活时间" prop="activationDate">
        <el-date-picker
          v-model="formData.activationDate"
          type="date"
          placeholder="选择日期"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          style="width: 100%"
        ></el-date-picker>
      </el-form-item>

      <el-form-item label="到期时间" prop="expiryDate">
        <el-date-picker
          v-model="formData.expiryDate"
          type="date"
          placeholder="选择日期"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          style="width: 100%"
        ></el-date-picker>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">{{ isEdit ? '保存' : '添加' }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'DeviceFormDialog',
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
  },
  data() {
    return {
      formData: {
        name: '',
        departmentId: '',
        model: '',
        sn: '',
        status: 'offline',
        expiryDate: '',
        activationDate: '',
      },
      selectedDeptPath: '',
      formRules: {
        name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
        departmentId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
        model: [{ required: true, message: '请选择设备型号', trigger: 'change' }],
        sn: [{ required: true, message: '请输入SN码', trigger: 'blur' }],
        activationDate: [{ required: true, message: '请选择激活时间', trigger: 'change' }],
        expiryDate: [{ required: true, message: '请选择到期时间', trigger: 'change' }],
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
          name: this.editData.name || '',
          departmentId: this.editData.departmentId || '',
          model: this.editData.model || '',
          sn: this.editData.sn || '',
          status: this.editData.status || 'offline',
          expiryDate: this.editData.expiryDate || '',
          activationDate: this.editData.activationDate || '',
        };
        this.selectedDeptPath = this.editData.department || '';
      } else {
        this.formData = {
          name: '',
          departmentId: '',
          model: '',
          sn: '',
          status: 'offline',
          expiryDate: '',
          activationDate: new Date().toISOString().split('T')[0],
        };
        this.selectedDeptPath = '';
      }
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      });
    },
    handleDeptNodeClick(data) {
      this.formData.departmentId = data.deptCode;
      this.selectedDeptPath = data.deptNamePath || data.deptName;
      this.$refs.treePopover.doClose();
    },
    handleClose() {
      this.dialogVisible = false;
    },
    handleSubmit() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.$emit('confirm', { ...this.formData });
          this.dialogVisible = false;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.sn-input ::v-deep .el-input__inner {
  font-family: 'Courier New', monospace;
}

.dept-tree-wrapper {
  max-height: 320px;
  overflow-y: auto;
}

.dept-tree-node {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.dept-node-icon {
  margin-right: 6px;
  color: #409eff;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

<style>
.device-form-dialog .el-dialog__header {
  background: linear-gradient(135deg, #4f7cff 0%, #3b6bf5 100%);
  padding: 16px 20px;
  border-top-right-radius: 15px;
  border-top-left-radius: 15px;
}
.device-form-dialog .el-dialog__title {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}
.device-form-dialog .el-dialog__headerbtn .el-dialog__close {
  color: #fff;
  font-size: 18px;
}
.dept-tree-popover {
  max-height: 400px;
}
</style>
