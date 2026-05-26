<template>
  <el-dialog
    title="确认删除类型"
    :visible.sync="visible"
    width="400px"
    :close-on-click-modal="false"
    custom-class="resource-type-delete-dialog"
    top="30vh"
    @close="handleClose"
  >
    <div class="flex items-center gap-4 mb-4">
      <div class="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
        <i class="el-icon-warning text-red-500 text-2xl"></i>
      </div>
      <div>
        <h3 class="text-lg font-semibold">确认删除资源类型</h3>
        <p class="text-sm text-gray-500">此操作不可恢复</p>
      </div>
    </div>
    <p class="text-sm text-gray-600 mb-6">确定要删除该资源类型吗？删除后将无法恢复。</p>
    <div slot="footer" class="flex justify-end gap-3">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="danger" @click="handleConfirm">确认删除</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ResourceTypeDeleteDialog',
  props: {
    value: {
      type: Boolean,
      default: false,
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
      this.visible = false;
    },
  },
};
</script>

<style>
.resource-type-delete-dialog .el-dialog__header {
  display: none;
}
</style>
