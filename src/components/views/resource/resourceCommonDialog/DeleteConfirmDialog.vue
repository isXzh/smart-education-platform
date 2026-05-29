<template>
  <el-dialog
    :visible.sync="visible"
    width="400px"
    :close-on-click-modal="false"
    custom-class="delete-confirm-dialog"
    @close="handleClose"
  >
    <div class="flex items-center gap-3 mb-4">
      <i class="el-icon-warning text-2xl text-red-500"></i>
      <h3 class="text-base font-semibold">确认删除</h3>
    </div>
    <div class="mb-6">
      <p class="text-sm text-gray-600">
        {{ batchMode ? `确定要删除选中的 ${selectedCount} 项资源吗？` : '确定要删除该资源吗？' }}
      </p>
      <p class="text-xs text-gray-400 mt-2">删除后资源将无法恢复，请谨慎操作。</p>
    </div>
    <div slot="footer" class="flex justify-end gap-3">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="danger" @click="handleConfirm">确认删除</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'DeleteConfirmDialog',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    deleteData: {
      type: Object,
      default: null,
    },
    batchMode: {
      type: Boolean,
      default: false,
    },
    selectedCount: {
      type: Number,
      default: 0,
    },
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
  methods: {
    handleClose() {
      this.$emit('close');
    },
    handleConfirm() {
      this.$emit('confirm');
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .delete-confirm-dialog .el-dialog__header {
  display: none;
}

::v-deep .delete-confirm-dialog .el-dialog__body {
  padding: 24px;
}
</style>
