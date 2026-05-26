<template>
  <el-dialog
    :title="isEdit ? '编辑标签分类' : '新增标签分类'"
    :visible.sync="visible"
    width="420px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div>
        <label class="block text-sm font-medium mb-1.5">
          分类名称 <span class="text-red-500">*</span>
        </label>
        <el-input
          v-model="form.name"
          placeholder="请输入分类名称"
        />
      </div>
    <div slot="footer" class="flex justify-end gap-3">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" class="!bg-[#1677FF] !border-[#1677FF]" @click="handleSubmit">
        {{ isEdit ? '保存修改' : '确认新增' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'CategoryDialog',
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
        name: '',
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
          name: this.editData.name,
        };
      } else {
        this.form = {
          name: '',
        };
      }
    },
    handleClose() {
      this.$emit('close');
    },
    handleSubmit() {
      if (!this.form.name.trim()) {
        this.$message.warning('请填写分类名称');
        return;
      }
      this.$emit('submit', { ...this.form });
      this.visible = false;
    },
  },
};
</script>
