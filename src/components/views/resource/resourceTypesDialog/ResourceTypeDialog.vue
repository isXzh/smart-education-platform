<template>
  <el-dialog
    :title="isEdit ? '编辑资源类型' : '新增资源类型'"
    :visible.sync="visible"
    width="480px"
    :close-on-click-modal="false"
    custom-class="resource-type-dialog"
    @close="handleClose"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">
          类型名称 <span class="text-red-500">*</span>
        </label>
        <el-input
          v-model="form.typeName"
          placeholder="请输入类型名称"
          maxlength="20"
          show-word-limit
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">
          排序 <span class="text-red-500">*</span>
        </label>
        <el-input-number
          v-model="form.sort"
          :min="0"
          :max="9999"
          controls-position="right"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">状态</label>
        <el-radio-group v-model="form.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
        <div
          v-if="form.status === 0"
          class="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2"
        >
          <i class="el-icon-warning-outline text-amber-600 mt-0.5"></i>
          <p class="text-xs text-amber-700 m-0">禁用后，上传资源时将无法选择该类型</p>
        </div>
      </div>
    </div>
    <div slot="footer" class="flex justify-end gap-3">
      <el-button @click="visible = false">取消</el-button>
      <el-button
        type="primary"
        class="!bg-[#1677FF] !border-[#1677FF]"
        @click="handleSubmit"
      >
        {{ isEdit ? '保存修改' : '确认新增' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ResourceTypeDialog',
  props: {
    value: {
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
      form: {
        typeName: '',
        sort: 0,
        status: 1,
      },
    };
  },
  computed: {
    visible: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
  },
  watch: {
    value(val) {
      if (val) {
        this.initForm();
      }
    },
  },
  methods: {
    initForm() {
      if (this.isEdit && this.editData) {
        this.form = {
          typeName: this.editData.typeName || '',
          sort: this.editData.sort ?? 0,
          status: this.editData.status ?? 1,
        };
      } else {
        this.form = {
          typeName: '',
          sort: 0,
          status: 1,
        };
      }
    },
    handleClose() {
      this.$emit('close');
    },
    handleSubmit() {
      if (!this.form.typeName.trim()) {
        this.$message.warning('请输入类型名称');
        return;
      }
      if (this.form.sort == null) {
        this.$message.warning('请输入排序值');
        return;
      }
      this.$emit('submit', { ...this.form, typeName: this.form.typeName.trim() });
      this.visible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .resource-type-dialog {
  .el-dialog__header {
    border-bottom: 1px solid #f0f0f0;
  }
  .el-radio__input.is-checked .el-radio__inner {
    border-color: #1677ff;
    background: #1677ff;
  }
  .el-radio__input.is-checked + .el-radio__label {
    color: #1677ff;
  }
}
</style>
